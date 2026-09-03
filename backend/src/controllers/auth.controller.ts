import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { getPrivateKey } from '../services/crypto.service';
import { EmailService } from '../services/email.service';
import { StorageService } from '../services/storage.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('auth.controller');

export class AuthController {
  /**
   * Register a new user.
   */
  static async register(req: Request, res: Response) {
    try {
      let { username, name, firstName, lastName, email, password, mobile, org, code } = req.body;

      if (!firstName || !email || !password || !code) {
        return res.status(400).json({ error: 'First Name, email, password, and verification code are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      const emailLower = email.toLowerCase().trim();

      // Verify OTP code
      const activeCode = await prisma.verificationCode.findFirst({
        where: {
          email: emailLower,
          purpose: 'SIGNUP',
          expiresAt: { gt: new Date() },
        },
      });

      if (!activeCode) {
        return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
      }

      if (activeCode.code !== code) {
        const newAttempts = activeCode.attempts + 1;
        if (newAttempts >= 5) {
          await prisma.verificationCode.delete({ where: { id: activeCode.id } });
          return res.status(400).json({ error: 'Too many invalid code attempts. Please request a new verification code.' });
        }
        await prisma.verificationCode.update({
          where: { id: activeCode.id },
          data: { attempts: newAttempts },
        });
        return res.status(400).json({ error: 'Invalid verification code.' });
      }

      const derivedName = name || `${firstName} ${lastName || ''}`.trim();

      if (!username) {
        const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        let attempt = baseUsername;
        let count = 12;
        while (true) {
          const check = await prisma.user.findUnique({ where: { username: attempt } });
          if (!check) {
            username = attempt;
            break;
          }
          attempt = `${baseUsername}${count}`;
          count++;
        }
      }

      const settings = await prisma.platformSetting.findUnique({ where: { key: 'features' } });
      const features = (settings?.value as any) || {};
      if (features.signUp === false) {
        return res.status(403).json({ error: 'New account registration is currently disabled.' });
      }

      const cleanUsername = username.toLowerCase().trim();
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username: cleanUsername }, { email: emailLower }] },
      });

      if (existingUser) {
        if (existingUser.username === cleanUsername) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          username: cleanUsername,
          name: derivedName,
          firstName: firstName.trim(),
          lastName: lastName ? lastName.trim() : null,
          email: emailLower,
          passwordHash: hashedPassword,
          role: 'USER',
          mobile: mobile || null,
          org: org || null,
          status: 'ACTIVE',
        },
        select: {
          username: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          org: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      await prisma.verificationCode.deleteMany({
        where: { email: emailLower, purpose: 'SIGNUP' },
      });

      await EmailService.sendWelcomeEmail(emailLower, newUser.username);

      return res.status(201).json({
        message: 'Registration successful',
        user: newUser,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Registration error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Log in user.
   */
  static async login(req: Request, res: Response) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required' });
      }

      const rawInput = emailOrUsername.trim();
      const normalizedInput = rawInput.toLowerCase();

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: normalizedInput, mode: 'insensitive' } },
            { username: { equals: normalizedInput, mode: 'insensitive' } },
            { email: rawInput },
            { username: rawInput },
          ],
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const settings = await prisma.platformSetting.findUnique({ where: { key: 'features' } });
      const features = (settings?.value as any) || {};
      if ((features.signIn === false || features.signIn === 'false') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Sign in is currently disabled by the administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact Ayojok support.' });
      }

      const tokenPayload = {
        username: user.username,
        email: user.email,
        role: user.role || 'USER',
        mobile: user.mobile,
        org: user.org,
        status: user.status || 'ACTIVE',
        organizerStatus: user.organizerStatus,
      };

      const token = jwt.sign(tokenPayload, getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: '24h',
      });

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          username: user.username,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role || 'USER',
          mobile: user.mobile,
          org: user.org,
          status: user.status || 'ACTIVE',
          organizerStatus: user.organizerStatus,
          rejectionCount: user.rejectionCount,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          occupationType: user.occupationType,
          institutionName: user.institutionName,
          classLevel: user.classLevel,
          position: user.position,
          district: user.district,
        },
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Login error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  static async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username: req.user.username },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        user: {
          username: user.username,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role || 'USER',
          mobile: user.mobile,
          org: user.org,
          status: user.status || 'ACTIVE',
          organizerStatus: user.organizerStatus,
          rejectionCount: user.rejectionCount,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          occupationType: user.occupationType,
          institutionName: user.institutionName,
          classLevel: user.classLevel,
          position: user.position,
          district: user.district,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const {
        name, firstName, lastName, email, mobile, avatar, bio, org,
        dateOfBirth, gender, occupationType, institutionName, classLevel, position, district,
      } = req.body;
      const username = req.user.username;

      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (email !== undefined && email !== user.email) {
        return res.status(400).json({ error: 'Email address cannot be changed.' });
      }

      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const effectiveAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
        if (effectiveAge < 8) {
          return res.status(400).json({ error: 'Date of birth must indicate an age of at least 8 years.' });
        }
      }

      const updateData: any = {};
      const derivedName = name || (firstName !== undefined ? `${firstName} ${lastName || ''}`.trim() : undefined);

      if (derivedName !== undefined) updateData.name = derivedName;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (mobile !== undefined) updateData.mobile = mobile;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (bio !== undefined) updateData.bio = bio;
      if (org !== undefined) updateData.org = org;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (gender !== undefined) updateData.gender = gender;
      if (occupationType !== undefined) updateData.occupationType = occupationType;
      if (institutionName !== undefined) updateData.institutionName = institutionName;
      if (classLevel !== undefined) updateData.classLevel = classLevel;
      if (position !== undefined) updateData.position = position;
      if (district !== undefined) updateData.district = district;

      const updatedUser = await prisma.user.update({
        where: { username },
        data: updateData,
      });

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          username: updatedUser.username,
          name: updatedUser.name,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          role: updatedUser.role || 'USER',
          mobile: updatedUser.mobile,
          org: updatedUser.org,
          status: updatedUser.status || 'ACTIVE',
          organizerStatus: updatedUser.organizerStatus,
          rejectionCount: updatedUser.rejectionCount,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          occupationType: updatedUser.occupationType,
          institutionName: updatedUser.institutionName,
          classLevel: updatedUser.classLevel,
          position: updatedUser.position,
          district: updatedUser.district,
        },
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Profile update error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async uploadAvatar(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64' });
      }

      const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 format' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const url = await StorageService.uploadAvatar(req.user.username, buffer);

      return res.status(200).json({ url });
    } catch (error: any) {
      logger.error({ err: error }, 'Error uploading avatar');
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }

  static async applyOrganizer(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const settings = await prisma.platformSetting.findUnique({ where: { key: 'features' } });
      const features = (settings?.value as any) || {};
      if (features.organizerApplication === false) {
        return res.status(403).json({ error: 'Organizer applications are currently disabled.' });
      }

      const user = await prisma.user.findUnique({ where: { username: req.user.username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'ORGANIZER') {
        return res.status(400).json({ error: 'You are already an organizer.' });
      }
      if (['PENDING', 'APPROVED'].includes(user.organizerStatus || '')) {
        return res.status(400).json({ error: `Your application is currently ${user.organizerStatus}.` });
      }

      const requiredFields = ['firstName', 'mobile', 'dateOfBirth', 'gender', 'district', 'occupationType', 'institutionName'];
      for (const field of requiredFields) {
        if (!(user as any)[field]) {
          return res.status(400).json({ error: `Please complete your profile. Missing: ${field}` });
        }
      }

      if (user.occupationType === 'student' && !user.classLevel) {
        return res.status(400).json({ error: 'Please specify your class level.' });
      }
      if (user.occupationType === 'job' && !user.position) {
        return res.status(400).json({ error: 'Please specify your position.' });
      }

      const updated = await prisma.user.update({
        where: { username: req.user.username },
        data: { organizerStatus: 'PENDING' },
      });

      return res.status(200).json({
        message: 'Organizer application submitted successfully.',
        user: { ...updated, organizerStatus: updated.organizerStatus, rejectionCount: updated.rejectionCount },
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Apply organizer error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async sendSignupCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const emailLower = email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered. Please sign in or reset your password.' });
      }

      await prisma.verificationCode.deleteMany({
        where: { email: emailLower, purpose: 'SIGNUP' },
      });

      const code = crypto.randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.verificationCode.create({
        data: {
          email: emailLower,
          code,
          purpose: 'SIGNUP',
          attempts: 0,
          expiresAt,
        },
      });

      await EmailService.sendVerificationCode(emailLower, code, 'SIGNUP');

      return res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (error: any) {
      logger.error({ err: error }, 'Send signup code error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const emailLower = email.toLowerCase().trim();

      if (!code && !newPassword) {
        const user = await prisma.user.findUnique({ where: { email: emailLower } });
        if (!user) {
          return res.status(200).json({ message: 'If your email is registered, a verification code has been sent.' });
        }

        await prisma.verificationCode.deleteMany({
          where: { email: emailLower, purpose: 'PASSWORD_RESET' },
        });

        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.verificationCode.create({
          data: {
            email: emailLower,
            code: otpCode,
            purpose: 'PASSWORD_RESET',
            attempts: 0,
            expiresAt,
          },
        });

        await EmailService.sendVerificationCode(emailLower, otpCode, 'PASSWORD_RESET');

        return res.status(200).json({ message: 'If your email is registered, a verification code has been sent.' });
      }

      if (!code || !newPassword) {
        return res.status(400).json({ error: 'Code and new password are required for reset' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      const activeCode = await prisma.verificationCode.findFirst({
        where: {
          email: emailLower,
          purpose: 'PASSWORD_RESET',
          expiresAt: { gt: new Date() },
        },
      });

      if (!activeCode) {
        return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
      }

      if (activeCode.code !== code) {
        const newAttempts = activeCode.attempts + 1;
        if (newAttempts >= 5) {
          await prisma.verificationCode.delete({ where: { id: activeCode.id } });
          return res.status(400).json({ error: 'Too many invalid code attempts. Please request a new verification code.' });
        }
        await prisma.verificationCode.update({
          where: { id: activeCode.id },
          data: { attempts: newAttempts },
        });
        return res.status(400).json({ error: 'Invalid verification code.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { email: emailLower },
        data: { passwordHash: hashedPassword },
      });

      await prisma.verificationCode.deleteMany({
        where: { email: emailLower, purpose: 'PASSWORD_RESET' },
      });

      return res.status(200).json({ message: 'Password reset successfully. You can now login.' });
    } catch (error: any) {
      logger.error({ err: error }, 'Reset password error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
