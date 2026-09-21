import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import fs from 'fs'

// Read .env manually
const envFile = fs.readFileSync('.env', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim()
  }
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

async function check() {
  console.log('--- Checking Users ---')
  const usersSnap = await getDocs(collection(db, 'users'))
  console.log(`Found ${usersSnap.docs.length} users:`)
  const userIds = []
  usersSnap.docs.forEach(d => {
    const data = d.data()
    userIds.push(d.id)
    console.log(`User ID: "${d.id}", Name: "${data.displayName || data.name}", Gender: "${data.gender}", Role: "${data.role}"`)
  })

  console.log('\n--- Checking Relationships ---')
  const relsSnap = await getDocs(collection(db, 'relationships'))
  console.log(`Found ${relsSnap.docs.length} relationships:`)
  relsSnap.docs.forEach(d => {
    const data = d.data()
    console.log(`Rel ID: "${d.id}", Status: "${data.status}", Type: "${data.type}", isCycleShared: ${data.isCycleShared}, shareCycleData: ${data.shareCycleData}, Participants:`, data.participants)
  })

  console.log('\n--- Checking Root cycleData ---')
  const cycleSnap = await getDocs(collection(db, 'cycleData'))
  console.log(`Found ${cycleSnap.docs.length} docs in /cycleData:`)
  cycleSnap.docs.forEach(d => {
    const data = d.data()
    console.log(`cycleData ID: "${d.id}", markedDates:`, data.markedDates, 'updatedAt:', data.updatedAt)
  })

  console.log('\n--- Checking Subcollection users/{id}/health/cycleData ---')
  for (const uid of userIds) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'health', 'cycleData'))
      if (snap.exists()) {
        console.log(`users/${uid}/health/cycleData exists! markedDates:`, snap.data().markedDates)
      } else {
        console.log(`users/${uid}/health/cycleData: DOES NOT EXIST`)
      }
    } catch (e) {
      console.log(`users/${uid}/health/cycleData error:`, e.message)
    }
  }

  process.exit(0)
}

check().catch(err => {
  console.error('Error running check:', err)
  process.exit(1)
})
