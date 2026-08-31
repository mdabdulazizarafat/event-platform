import crypto from 'crypto';

// The secret key needs to be 32 bytes for AES-256
// In a real app this should come from env, but we'll use a deterministic 
// key based on the JWT secret or a fallback for the MVP
const SECRET_KEY_STRING = process.env.JWT_SECRET || 'fallback_secret_key_for_qr_codes_must_be_32_bytes_long';
// Ensure it's exactly 32 bytes
const SECRET_KEY = crypto.createHash('sha256').update(String(SECRET_KEY_STRING)).digest('base64').substring(0, 32);
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a username to be used as a secure, unpredictable QR token.
 */
export function encryptUsernameForQr(username: string): string {
  // Use a deterministic IV based on the username so the same user always gets the exact same QR token
  const iv = crypto.createHash('md5').update(username).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  
  let encrypted = cipher.update(username, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return the iv and the encrypted data joined by a colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a QR token back to the original username.
 */
export function decryptQrToUsername(qrToken: string): string | null {
  try {
    const parts = qrToken.split(':');
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // If decryption fails (invalid token, tampered, etc)
    return null;
  }
}

/**
 * Generates a cryptographically secure random UUID token for event registration QR code.
 */
export function generateSecureQrToken(): string {
  return crypto.randomUUID();
}
