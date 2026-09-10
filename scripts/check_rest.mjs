import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const apiKey = env.VITE_FIREBASE_API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID;

async function checkRest(col) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`[REST] Collection: ${col} | Status: ${res.status}`);
    if (data.error) {
      console.log(`  Error: ${data.error.status} - ${data.error.message}`);
    } else {
      const docs = data.documents || [];
      console.log(`  Total documents: ${docs.length}`);
      docs.forEach(d => {
        const nameParts = d.name.split('/');
        const id = nameParts[nameParts.length - 1];
        const fields = d.fields || {};
        const displayName = fields.displayName?.stringValue || fields.name?.stringValue || '—';
        const username = fields.username?.stringValue || '—';
        const role = fields.role?.stringValue || (fields.isAdmin?.booleanValue ? 'admin' : 'user');
        const isBanned = fields.isBanned?.booleanValue || false;
        console.log(`   * ID: ${id} | Name: "${displayName}" | User: "${username}" | Role: ${role} | Banned: ${isBanned}`);
      });
    }
  } catch (e) {
    console.error(`Fetch error on ${col}:`, e.message);
  }
}

async function run() {
  await checkRest('users');
  await checkRest('chats');
  await checkRest('relationships');
}
run();
