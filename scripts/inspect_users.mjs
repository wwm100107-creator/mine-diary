import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

async function inspectUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    console.log('=== TOTAL USERS FOUND IN FIRESTORE:', snap.size, '===');
    snap.forEach(d => {
      const u = d.data();
      console.log('------------------------------------');
      console.log('ID:', d.id);
      console.log('Username:', u.username || '—');
      console.log('Display Name:', u.displayName || u.name || '—');
      console.log('Gender:', u.gender || '—');
      console.log('Role:', u.role || (u.isAdmin ? 'admin' : 'user'));
      console.log('VIP Tier:', u.vipTier || 'normal');
      console.log('Is Banned:', Boolean(u.isBanned));
      console.log('Created/Updated:', u.updatedAt?.toDate?.() || u.createdAt?.toDate?.() || '—');
    });

    const chatsSnap = await getDocs(collection(db, 'chats'));
    console.log('=== TOTAL CHATS:', chatsSnap.size, '===');
    const relsSnap = await getDocs(collection(db, 'relationships'));
    console.log('=== TOTAL RELATIONSHIPS:', relsSnap.size, '===');
  } catch (err) {
    console.error('Inspect error:', err.code, err.message);
  } finally {
    process.exit(0);
  }
}
inspectUsers();
