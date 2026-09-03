import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../services/crypto.service';
import { UserPayload } from '../types';
import { createChildLogger } from '../lib/logger';
import prisma from '../lib/prisma';
import redis from '../lib/redis';

const logger = createChildLogger('auth.middleware');

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Fallback: Check cookies
    if (!token && req.cookies) {
      token = req.cookies.session_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // 3. Validate token via Asymmetric Public Key (RS256)
    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as UserPayload;

    // 4. Redis session caching
    let dbUser: { status?: string; role?: UserPayload['role'] } = {};
    const redisKey = `user:session:${decoded.username}`;

    try {
      const cached = await redis.get(redisKey);
      if (cached) {
        dbUser = JSON.parse(cached);
      }
    } catch (e) {
      logger.warn('Failed to read session from Redis, falling back to PostgreSQL');
    }

    if (!dbUser.status) {
      const foundUser = await prisma.user.findUnique({
        where: { username: decoded.username },
        select: { status: true, role: true },
      });

      if (!foundUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      dbUser = {
        status: foundUser.status,
        role: foundUser.role as UserPayload['role'],
      };

      try {
        await redis.setex(redisKey, 60, JSON.stringify(dbUser));
      } catch (e) {
        logger.warn('Failed to save session to Redis');
      }
    }

    if (dbUser.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact Ayojok support.' });
    }

    // 5. Inject payload context into Express request
    req.user = {
      username: decoded.username,
      email: decoded.email,
      role: dbUser.role || decoded.role,
    };

    return next();
  } catch (error: any) {
    logger.warn({ err: error.message }, 'JWT verification error');
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

export function authMiddlewareOptional(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies) {
      token = req.cookies.session_token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as UserPayload;

    req.user = {
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error: any) {
    return next();
  }
}
