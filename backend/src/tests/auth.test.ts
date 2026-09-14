import { describe, it, expect } from './harness';
import { AuthService } from '../services/auth.service';
import { setupTestDatabase } from './setup';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../services/crypto.service';

export async function runAuthTests() {
  await describe('AuthService & Asymmetric JWT Authentication Suite', async () => {
    const testUsername = `auth_test_${Date.now()}`;
    const testEmail = `${testUsername}@test.rong-plan.com`;
    const testPassword = 'StrongTestPassword123!';

    await it('should register a new user successfully with hashed password', async () => {
      const user = await AuthService.register(testUsername, 'Auth Test User', testEmail, testPassword);
      expect(user.username).toBe(testUsername);
      expect(user.email).toBe(testEmail);
      expect(user.role).toBe('USER');
    });

    await it('should login and return a valid RS256 JWT token', async () => {
      const { user, token } = await AuthService.login(testUsername, testPassword);
      expect(user.username).toBe(testUsername);
      expect(token).toBeDefined();

      const decoded: any = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] });
      expect(decoded.username).toBe(testUsername);
      expect(decoded.role).toBe('PARTICIPANT');
    });

    await it('should fail login with incorrect password', async () => {
      let threw = false;
      try {
        await AuthService.login(testUsername, 'WrongPassword!');
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    });
  });
}
