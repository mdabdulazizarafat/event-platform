import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../services/crypto.service';
import { UserPayload } from '../types';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    
    // 4. Inject payload context into Express request
    req.user = {
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}
