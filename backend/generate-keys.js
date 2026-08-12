const crypto = require('crypto');

console.log('Generating 2048-bit RSA keypair...\n');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
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

const formattedPrivate = privateKey.replace(/\r?\n/g, '\\n');
const formattedPublic = publicKey.replace(/\r?\n/g, '\\n');

console.log('--- COPY AND PASTE THE FOLLOWING LINES INTO YOUR .env FILE ---\n');
console.log(`JWT_PRIVATE_KEY="${formattedPrivate}"\n`);
console.log(`JWT_PUBLIC_KEY="${formattedPublic}"`);
console.log('\n--------------------------------------------------------------');
