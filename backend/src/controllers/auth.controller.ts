import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { getPrivateKey } from '../services/crypto.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('auth.controller');

export class AuthController {
  /**
   * Register a new user (PARTICIPANT or ORGANIZER).
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      let { username, name, firstName, lastName, email, password, role, mobile, org } = req.body;

      if (!firstName || !email || !password) {
        return res.status(400).json({ error: 'First Name, email, and password are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      const derivedName = name || `${firstName} ${lastName || ''}`.trim();

      if (!username) {
        const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        let attempt = baseUsername;
        let count = 12;
        while (true) {
          const check = await pool.query('SELECT 1 FROM users WHERE username = $1', [attempt]);
          if (check.rowCount === 0) {
            username = attempt;
            break;
          }
          attempt = `${baseUsername}${count}`;
          count++;
        }
      }

      // Enforce valid roles for public registration
      const targetRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
      const targetStatus = targetRole === 'ORGANIZER' ? 'PENDING_APPROVAL' : 'ACTIVE';

      // Check if username or email is already taken
      const checkUser = await pool.query(
        'SELECT username, email FROM users WHERE username = $1 OR email = $2',
        [username.toLowerCase().trim(), email.toLowerCase().trim()]
      );

      if (checkUser.rows.length > 0) {
        const existing = checkUser.rows[0];
        if (existing.username === username.toLowerCase().trim()) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // Hash password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into users table
      const insertQuery = `
        INSERT INTO users (username, name, first_name, last_name, email, password_hash, role, mobile, org, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING username, name, first_name, last_name, email, mobile, org, role, status, created_at;
      `;
      const insertRes = await pool.query(insertQuery, [
        username.toLowerCase().trim(),
        derivedName,
        firstName.trim(),
        lastName ? lastName.trim() : null,
        email.toLowerCase().trim(),
        hashedPassword,
        targetRole,
        mobile || null,
        org || null,
        targetStatus
      ]);

      const newUser = insertRes.rows[0];

      return res.status(201).json({
        message: targetStatus === 'PENDING_APPROVAL'
          ? 'Organizer application submitted successfully. Pending admin approval.'
          : 'Registration successful',
        user: newUser
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Registration error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Log in user, sign JWT, and drop secure HttpOnly cookie
   */
  static async login(req: Request, res: Response) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required' });
      }

      const normalizedInput = emailOrUsername.trim().toLowerCase();
      // Lookup user in users database
      const userQuery = `
        SELECT * FROM users 
        WHERE email = $1 OR username = $1;
      `;
      const userRes = await pool.query(userQuery, [normalizedInput]);
      if (userRes.rowCount === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = userRes.rows[0];

      // Validate credentials using bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Sign Stateless JWT via Asymmetric Private Key (RS256)
      const tokenPayload = {
        username: user.username,
        email: user.email,
        role: user.role || 'USER',
        mobile: user.mobile,
        org: user.org,
        status: user.status || 'ACTIVE'
      };
      
      const token = jwt.sign(tokenPayload, getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: '24h',
      });

      // Set cookie in response jar (HttpOnly, Secure, Lax SameSite)
      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.status(200).json({
        message: 'Login successful',
        user: {
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role || 'USER',
          mobile: user.mobile,
          org: user.org,
          status: user.status || 'ACTIVE'
        }
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Login error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Log out user by clearing the HTTP cookie
   */
  static async logout(req: Request, res: Response) {
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  /**
   * Return profile payload if token remains valid
   */
  static async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    
    try {
      const userRes = await pool.query('SELECT username, name, first_name as "firstName", last_name as "lastName", email, avatar, bio, role, mobile, org, status, date_of_birth as "dateOfBirth", gender, occupation_type as "occupationType", institution_name as "institutionName", class_level as "classLevel", position, district FROM users WHERE username = $1', [req.user.username]);
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user: userRes.rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update profile information for authenticated user.
   * PUT /api/v1/auth/profile
   */
  static async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const { 
        name, firstName, lastName, email, mobile, avatar, bio, org, role, status,
        dateOfBirth, gender, occupationType, institutionName, classLevel, position, district
      } = req.body;
      const username = req.user.username;

      // Check if user exists
      const userRes = await pool.query('SELECT role, email FROM users WHERE username = $1', [username]);
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (email !== undefined && email !== userRes.rows[0].email) {
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

      // Build dynamic update query
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const addField = (field: string, value: any) => {
        if (value !== undefined) {
          setClauses.push(`${field} = $${paramIndex}`);
          values.push(value === '' ? null : value);
          paramIndex++;
        }
      };

      const derivedName = name || (firstName !== undefined ? `${firstName} ${lastName || ''}`.trim() : undefined);

      addField('name', derivedName);
      addField('first_name', firstName);
      addField('last_name', lastName);
      addField('email', email);
      addField('mobile', mobile);
      addField('avatar', avatar);
      addField('bio', bio);
      addField('org', org);
      addField('date_of_birth', dateOfBirth);
      addField('gender', gender);
      addField('occupation_type', occupationType);
      addField('institution_name', institutionName);
      addField('class_level', classLevel);
      addField('position', position);
      addField('district', district);

      if (setClauses.length === 0) {
        return res.status(200).json({ message: 'No changes', user: userRes.rows[0] });
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(username);

      const query = `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE username = $${paramIndex}
        RETURNING username, name, first_name as "firstName", last_name as "lastName", email, avatar, bio, mobile, org, role, status, date_of_birth as "dateOfBirth", gender, occupation_type as "occupationType", institution_name as "institutionName", class_level as "classLevel", position, district;
      `;
      
      const updateRes = await pool.query(query, values);

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updateRes.rows[0]
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Profile update error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Upload user avatar.
   * POST /api/v1/auth/upload-avatar
   */
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
      const { StorageService } = await import('../services/storage.service');
      const url = await StorageService.uploadAvatar(req.user.username, buffer);
      
      return res.status(200).json({ url });
    } catch (error: any) {
      logger.error({ err: error }, 'Error uploading avatar');
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
}
