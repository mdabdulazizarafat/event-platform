import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../services/crypto.service';
import { UserPayload } from '../types';
import { createChildLogger } from '../lib/logger';
import { pool } from '../db/pool';

const logger = createChildLogger('auth.middleware');

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header (for APIs/third-party calls)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Fallback: Check cookies (for frontend web sessions)
    if (!token && req.cookies) {
      token = req.cookies.session_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // 3. Cryptographically validate token via Asymmetric Public Key
    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as UserPayload;
    
    // 4. Query database to get fresh user status and role (realtime enforcement)
    const dbUserRes = await pool.query('SELECT status, role FROM users WHERE username = $1', [decoded.username]);
    if (dbUserRes.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const dbUser = dbUserRes.rows[0];

    if (dbUser.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact the Ayojok support team to resolve this problem.' });
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
    // Just ignore token errors in optional middleware
    return next();
  }
}
