import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
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

async function inspectChat() {
  const chatDoc = await getDoc(doc(db, 'chats', '112499139245001474962__kn_211107'))
  console.log('Chat doc exists:', chatDoc.exists())
  if (chatDoc.exists()) console.log('Chat data:', chatDoc.data())

  // Also check if there's any chat with KN_211107 (uppercase)
  const chatDocUpper = await getDoc(doc(db, 'chats', '112499139245001474962__KN_211107'))
  console.log('Chat doc upper exists:', chatDocUpper.exists())

  // Check all chats
  const allChats = await getDocs(collection(db, 'chats'))
  console.log(`Found ${allChats.docs.length} chats:`)
  allChats.docs.forEach(d => console.log('Chat ID:', d.id, d.data()))

  // Check all relationships
  const allRels = await getDocs(collection(db, 'relationships'))
  console.log(`Found ${allRels.docs.length} rels:`)
  allRels.docs.forEach(d => console.log('Rel ID:', d.id, d.data()))

  process.exit(0)
}

inspectChat().catch(console.error)
