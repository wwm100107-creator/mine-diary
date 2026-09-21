import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
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

const possibleCollections = [
  'users', 'relationships', 'chats', 'cycleData', 'health', 'cycles',
  'periodData', 'healthLogs', 'symptoms', 'fcmTokens', 'diaries',
  'messages', 'attendance', 'notifications', 'coupleData'
]

async function checkAll() {
  for (const col of possibleCollections) {
    try {
      const snap = await getDocs(collection(db, col))
      if (snap.docs.length > 0) {
        console.log(`Collection "${col}": ${snap.docs.length} docs`)
        snap.docs.forEach(d => console.log(`  - Doc ID: ${d.id}`))
      }
    } catch (e) {
      console.log(`Collection "${col}" error:`, e.message)
    }
  }
  process.exit(0)
}

checkAll().catch(console.error)
