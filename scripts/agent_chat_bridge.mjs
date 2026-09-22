// scripts/agent_chat_bridge.mjs
// Bridges Antigravity AI with Mine Diary Web Chat in real-time
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import fs from 'fs'
import readline from 'readline'

// 1. Read .env file
const envFile = fs.readFileSync('.env', 'utf8')
const env = {}
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim()
  }
})

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const ADMIN_ID = 'adminminediary'
const TARGET_USER_ID = '112499139245001474962' // Uy Phạm
const CHAT_ID = [ADMIN_ID, TARGET_USER_ID].sort().join('__')

const BOT_NAME = 'Antigravity AI (Admin) 🤖✨'
const BOT_AVATAR = '/admin-avatar.webm'
const BOT_FRAME = 'god_cosmic'

// Ensure admin user profile has nice AI branding
async function setupAdminProfile() {
  const adminRef = doc(db, 'users', ADMIN_ID)
  await setDoc(
    adminRef,
    {
      displayName: BOT_NAME,
      name: BOT_NAME,
      avatar: BOT_AVATAR,
      avatarFrame: BOT_FRAME,
      vipTier: 'god',
      role: 'admin',
      isAdmin: true,
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
  console.log(`[Bridge] Admin profile configured as "${BOT_NAME}".`)
}

// Send a chat message to Uy Phạm
async function sendMessage(text) {
  const chatDocRef = doc(db, 'chats', CHAT_ID)
  const now = new Date()

  const chatPayload = {
    id: CHAT_ID,
    participants: [ADMIN_ID, TARGET_USER_ID],
    initiatorId: ADMIN_ID,
    status: 'accepted',
    lastMessage: text.trim(),
    lastSenderId: ADMIN_ID,
    lastSenderName: BOT_NAME,
    lastSenderAvatar: BOT_AVATAR,
    lastSenderFrame: BOT_FRAME,
    lastMessageType: 'text',
    isSystemMessage: false,
    updatedAt: serverTimestamp(),
  }

  await setDoc(chatDocRef, chatPayload, { merge: true })

  const msgRef = await addDoc(collection(db, 'chats', CHAT_ID, 'messages'), {
    senderId: ADMIN_ID,
    senderName: BOT_NAME,
    senderAvatar: BOT_AVATAR,
    senderFrame: BOT_FRAME,
    text: text.trim(),
    type: 'text',
    isSystemMessage: false,
    createdAt: serverTimestamp(),
  })

  console.log(`[Bridge -> Uy Phạm] Sent: "${text}" (id: ${msgRef.id})`)
}

// Listen for incoming messages from Uy Phạm
let initialLoaded = false
const seenMsgIds = new Set()

function startRealtimeListener() {
  const q = query(
    collection(db, 'chats', CHAT_ID, 'messages'),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(q, async (snapshot) => {
    if (!initialLoaded) {
      snapshot.docs.forEach((d) => seenMsgIds.add(d.id))
      initialLoaded = true
      console.log(`[Bridge] Listening on room ${CHAT_ID} (${seenMsgIds.size} existing messages).`)
      return
    }

    for (const change of snapshot.docChanges()) {
      if (change.type === 'added') {
        const d = change.doc
        if (!seenMsgIds.has(d.id)) {
          seenMsgIds.add(d.id)
          const data = d.data()
          if (data.senderId === TARGET_USER_ID) {
            console.log(`\n========================================`)
            console.log(`📩 [TIN NHẮN TỪ UY PHẠM TRÊN WEB]:`)
            console.log(`"${data.text}"`)
            console.log(`Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`)
            console.log(`========================================\n`)

            // Log to scratch file so agent can inspect anytime
            try {
              fs.appendFileSync(
                'scratch/chat_history.log',
                `[${new Date().toISOString()}] Uy Phạm: ${data.text}\n`
              )
            } catch (err) {}
          }
        }
      }
    }
  })
}

// Outbox file watcher: Allows Antigravity agent or user to send message by appending to scratch/outbox.txt
const OUTBOX_FILE = 'scratch/outbox.txt'
function startOutboxWatcher() {
  if (!fs.existsSync('scratch')) {
    fs.mkdirSync('scratch', { recursive: true })
  }
  if (!fs.existsSync(OUTBOX_FILE)) {
    fs.writeFileSync(OUTBOX_FILE, '', 'utf8')
  }

  let lastSize = fs.statSync(OUTBOX_FILE).size
  setInterval(async () => {
    try {
      if (!fs.existsSync(OUTBOX_FILE)) return
      const stats = fs.statSync(OUTBOX_FILE)
      if (stats.size > lastSize) {
        const content = fs.readFileSync(OUTBOX_FILE, 'utf8')
        const newLines = content.slice(lastSize).trim()
        lastSize = stats.size
        if (newLines) {
          console.log(`[Bridge Outbox] Found new message to send: ${newLines}`)
          await sendMessage(newLines)
        }
      }
    } catch (err) {
      console.error('[Bridge Outbox Error]:', err)
    }
  }, 1000)
}

async function main() {
  console.log('[Bridge] Initializing Antigravity AI <-> Mine Diary Bridge...')
  await setupAdminProfile()

  startRealtimeListener()
  startOutboxWatcher()

  // Send initial message if requested via argv
  if (process.argv.includes('--init')) {
    await sendMessage(
      'Chào Uy Phạm! Mình là Antigravity AI đây ✨\n\n' +
      'Mình đã áp dụng toàn bộ giao diện Admin mới (ThreeUI 3D, Aceternity Spotlight, Magic UI Border Beam, Origin UI HUD) vào nhánh chính (origin/main) trên GitHub rồi nhé!\n\n' +
      'Và mình cũng đã tự qua phòng chat Mine Diary này để nhắn tin trực tiếp với bạn theo đúng yêu cầu rồi nè! 🚀 Bạn thấy giao diện mới thế nào? Cứ nhắn lại cho mình ngay tại đây nhé!'
    )
  }

  console.log('[Bridge] Agent Chat Bridge is running continuously in background.')
}

main().catch(console.error)
