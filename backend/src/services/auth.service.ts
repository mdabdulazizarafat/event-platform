import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getPrivateKey } from './crypto.service';

export class AuthService {
  static async register(username: string, name: string, email: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const firstName = name.split(' ')[0] || username;
    const lastName = name.split(' ').slice(1).join(' ') || null;

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        name,
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        username: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(emailOrUsername: string, password: string) {
    const cleanInput = emailOrUsername.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanInput }, { username: cleanInput }],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const tokenPayload = {
      username: user.username,
      email: user.email,
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
    };

    const token = jwt.sign(tokenPayload, getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: '24h',
    });

    return {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
        status: user.status || 'ACTIVE',
      },
      token,
    };
  }
}
