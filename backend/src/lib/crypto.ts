import crypto from 'crypto';

/**
 * Generates a cryptographically secure random UUID token for event registration QR code.
 */
export function generateSecureQrToken(): string {
  return crypto.randomUUID();
}
