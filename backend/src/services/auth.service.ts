import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { getPrivateKey } from './crypto.service';

export class AuthService {
  static async register(username: string, name: string, email: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const firstName = name.split(' ')[0] || username;
    const lastName = name.split(' ').slice(1).join(' ') || null;

    const insertQuery = `
      INSERT INTO users (username, name, first_name, last_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING username, name, first_name as "firstName", last_name as "lastName", email, role, status, created_at;
    `;
    const res = await pool.query(insertQuery, [
      username.toLowerCase().trim(),
      name,
      firstName,
      lastName,
      email.toLowerCase().trim(),
      hashedPassword,
      'PARTICIPANT',
      'ACTIVE'
    ]);
    return res.rows[0];
  }

  static async login(emailOrUsername: string, password: string) {
    const userQuery = `
      SELECT * FROM users 
      WHERE email = $1 OR username = $1;
    `;
    const userRes = await pool.query(userQuery, [emailOrUsername]);
    if (userRes.rowCount === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const tokenPayload = {
      username: user.username,
      email: user.email,
      role: user.role || 'PARTICIPANT',
      status: user.status || 'ACTIVE'
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
        role: user.role || 'PARTICIPANT',
        status: user.status || 'ACTIVE'
      },
      token
    };
  }
}
