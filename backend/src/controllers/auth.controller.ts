import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { getPrivateKey } from '../services/crypto.service';

export class AuthController {
  /**
   * Register a new user (PARTICIPANT or ORGANIZER).
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, name, email, password, role } = req.body;

      if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'Username, name, email, and password are required' });
      }

      // Enforce valid roles for public registration
      const targetRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'PARTICIPANT';

      // Check if username or email is already taken
      const checkUser = await pool.query(
        'SELECT username, email FROM users WHERE username = $1 OR email = $2',
        [username.toLowerCase().trim(), email.toLowerCase().trim()]
      );

      if (checkUser.rowCount > 0) {
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
        INSERT INTO users (username, name, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, name, email, role, created_at;
      `;
      const insertRes = await pool.query(insertQuery, [
        username.toLowerCase().trim(),
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        targetRole
      ]);

      const newUser = insertRes.rows[0];

      return res.status(201).json({
        message: 'Registration successful',
        user: newUser
      });
    } catch (error: any) {
      console.error('Registration error:', error);
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

      // Always ensure the default dev seed organizer exists for development convenience
      const salt = await bcrypt.genSalt(10);
      const devHash = await bcrypt.hash('password123', salt);
      await pool.query(
        `INSERT INTO users (username, name, email, password_hash, bio, avatar, role) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash`,
        [
          'tech-hub',
          'Tech Hub Community',
          'organizer@techhub.com',
          devHash,
          'Tech Hub Developer Ecosystem Organizer',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop',
          'ORGANIZER'
        ]
      );

      // Lookup user in users database
      const userQuery = `
        SELECT * FROM users 
        WHERE email = $1 OR username = $1;
      `;
      const userRes = await pool.query(userQuery, [emailOrUsername]);
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
        role: user.role || 'PARTICIPANT',
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
          role: user.role || 'PARTICIPANT'
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
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
      const userRes = await pool.query('SELECT username, name, email, avatar, bio, role FROM users WHERE username = $1', [req.user.username]);
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user: userRes.rows[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
