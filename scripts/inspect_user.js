import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function inspectUser() {
  const u1 = await getDoc(doc(db, 'users', 'kn_211107'))
  console.log('User kn_211107 exists:', u1.exists())
  if (u1.exists()) console.log('Data:', u1.data())

  // Check case variations: KN_211107 vs kn_211107
  const u2 = await getDoc(doc(db, 'users', 'KN_211107'))
  console.log('User KN_211107 exists:', u2.exists())
  if (u2.exists()) console.log('Data:', u2.data())

  // Check user 112499139245001474962
  const u3 = await getDoc(doc(db, 'users', '112499139245001474962'))
  console.log('User 112499139245001474962 exists:', u3.exists())
  if (u3.exists()) console.log('Data:', u3.data())

  process.exit(0)
}

inspectUser().catch(console.error)
