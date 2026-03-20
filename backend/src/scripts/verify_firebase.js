const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('--- Firebase Admin Auth Verification ---');
const fbProjectID = process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID;
const fbClientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.CLIENT_EMAIL;
const fbPrivateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.PRIVATE_KEY;

console.log('FIREBASE_PROJECT_ID:', fbProjectID || 'MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', fbClientEmail || 'MISSING');
console.log('FIREBASE_PRIVATE_KEY EXISTS:', fbPrivateKey ? 'YES' : 'NO');

try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('MODE: JSON (FIREBASE_SERVICE_ACCOUNT)');
  } else {
    serviceAccount = {
      projectId: fbProjectID,
      clientEmail: fbClientEmail,
      privateKey: fbPrivateKey
    };
    console.log('MODE: Individual Variables');
  }

  if (serviceAccount.privateKey) {
    serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
  } else if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.projectId || serviceAccount.project_id,
        clientEmail: serviceAccount.clientEmail || serviceAccount.client_email,
        privateKey: serviceAccount.privateKey || serviceAccount.private_key
      })
    });
  }
  console.log('✅ PASS: Firebase Admin Initialized Successfully');
} catch (err) {
  console.error('❌ FAIL: Firebase Admin setup failed:', err.message);
}
console.log('---------------------------------------');
