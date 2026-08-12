import crypto from 'crypto';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('crypto.service');

let privateKey: string;
let publicKey: string;

// Initialize keys - check that env keys are real RSA keys (not placeholder '...' strings)
const isRealPrivateKey = process.env.JWT_PRIVATE_KEY && 
  process.env.JWT_PRIVATE_KEY.length > 500 && 
  !process.env.JWT_PRIVATE_KEY.includes('...');
const isRealPublicKey = process.env.JWT_PUBLIC_KEY && 
  process.env.JWT_PUBLIC_KEY.length > 100 && 
  !process.env.JWT_PUBLIC_KEY.includes('...');

if (isRealPrivateKey && isRealPublicKey) {
  // Production / configured keypair
  privateKey = process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n');
  publicKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n');
  logger.info('Asymmetric JWT Keys loaded from environment configurations.');
} else {
  // Local development fallback: dynamically generate a 2048-bit RSA key pair at startup
  logger.info('Generating dynamic 2048-bit RSA keypair for stateless JWT signatures...');
  const { privateKey: genPrivate, publicKey: genPublic } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  privateKey = genPrivate;
  publicKey = genPublic;
  logger.info('Dynamic keypair successfully initialized.');
}

export const getPrivateKey = () => privateKey;
export const getPublicKey = () => publicKey;
