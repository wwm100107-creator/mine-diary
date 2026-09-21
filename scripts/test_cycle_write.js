import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
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

async function testWrite() {
  console.log('Testing write to /cycleData/kn_211107...')
  try {
    await setDoc(doc(db, 'cycleData', 'kn_211107'), {
      test: true,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    console.log('SUCCESS writing to /cycleData/kn_211107!')
  } catch (e) {
    console.error('FAILED writing to /cycleData/kn_211107:', e.message)
  }

  console.log('Testing write to users/kn_211107/health/cycleData...')
  try {
    await setDoc(doc(db, 'users', 'kn_211107', 'health', 'cycleData'), {
      test: true,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    console.log('SUCCESS writing to users/kn_211107/health/cycleData!')
  } catch (e) {
    console.error('FAILED writing to users/kn_211107/health/cycleData:', e.message)
  }

  process.exit(0)
}

testWrite().catch(console.error)
