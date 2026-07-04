import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { getPrivateKey } from '../services/crypto.service';

export class AuthController {
  /**
   * Log in host, sign JWT, and drop secure HttpOnly cookie
   */
  static async login(req: Request, res: Response) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required' });
      }

      // Always ensure the default dev seed host exists for development convenience
      const salt = await bcrypt.genSalt(10);
      const devHash = await bcrypt.hash('password123', salt);
      await pool.query(
        `INSERT INTO hosts (username, name, email, password_hash, bio, avatar) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash`,
        [
          'tech-hub',
          'Tech Hub Community',
          'organizer@techhub.com',
          devHash,
          'Tech Hub Developer Ecosystem Organizer',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop'
        ]
      );

      // Lookup user in hosts database
      const userQuery = `
        SELECT * FROM hosts 
        WHERE email = $1 OR username = $1;
      `;
      const userRes = await pool.query(userQuery, [emailOrUsername]);
      if (userRes.rowCount === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const host = userRes.rows[0];

      // Validate credentials using bcrypt
      const isMatch = await bcrypt.compare(password, host.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Sign Stateless JWT via Asymmetric Private Key (RS256)
      const tokenPayload = {
        username: host.username,
        email: host.email,
        role: 'host',
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
          username: host.username,
          name: host.name,
          email: host.email,
          avatar: host.avatar
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Log out host by clearing the HTTP cookie
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
      const userRes = await pool.query('SELECT username, name, email, avatar, bio FROM hosts WHERE username = $1', [req.user.username]);
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: 'Host user not found' });
      }
      return res.status(200).json({ user: userRes.rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
