import crypto from 'crypto';

let privateKey: string;
let publicKey: string;

// Initialize keys
if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
  // Production / configured keypair
  privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  console.log('Asymmetric JWT Keys loaded from environment configurations.');
} else {
  // Local development fallback: dynamically generate a 2048-bit RSA key pair at startup
  console.log('Generating dynamic 2048-bit RSA keypair for stateless JWT signatures...');
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
  console.log('Dynamic keypair successfully initialized.');
}

export const getPrivateKey = () => privateKey;
export const getPublicKey = () => publicKey;
