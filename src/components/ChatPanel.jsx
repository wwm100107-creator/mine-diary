import { useState, useEffect, useRef, useCallback } from 'react'
import EmojiPicker from 'emoji-picker-react'
import PixelAvatar from './PixelAvatar'
import {
  sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
  subscribePendingRequests, subscribeFriends,
  sendMessage, subscribeMessages, getUser,
} from '../lib/social'
import s from './ChatPanel.module.css'

const TAB = { FRIENDS: 'friends', REQUESTS: 'requests' }

function timeLabel(ts) {
  if (!ts) return ''
  const d = ts.toDate?.() ?? new Date(ts)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// ── Chat view ─────────────────────────────────────────────────────────────────
function ChatView({ myId, friend, onBack }) {
  const [messages, setMessages]   = useState([])
  const [text,     setText]       = useState('')
  const [showEmoji,setShowEmoji]  = useState(false)
  const bottomRef                 = useRef(null)

  useEffect(() => {
    const unsub = subscribeMessages(myId, friend.id, setMessages)
    return unsub
  }, [myId, friend.id])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!text.trim()) return
    await sendMessage(myId, friend.id, text)
    setText('')
  }, [myId, friend.id, text])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={s.chatWrap}>
      <div className={s.chatHeader}>
        <button className={s.chatBackBtn} onClick={onBack} aria-label="Quay lại">‹</button>
        <PixelAvatar avatarId={friend.avatar} size={34} />
        <span className={s.chatFriendName}>
          {friend.displayName ?? friend.id}
        </span>
      </div>

      <div className={s.messages} role="log" aria-label="Tin nhắn">
        {messages.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>💬</div>
            <p>Chưa có tin nhắn nào.<br/>Hãy nói xin chào! 👋</p>
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.senderId === myId
          return (
            <div key={msg.id} className={`${s.msgRow} ${mine ? s.mine : s.theirs}`}>
              <div className={s.bubble}>{msg.text}</div>
              <span className={s.msgTime}>{timeLabel(msg.createdAt)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={s.chatInputRow}>
        {/* Emoji picker */}
        <button
          className={s.emojiBtn}
          onClick={() => setShowEmoji(v => !v)}
          aria-label="Chọn emoji"
          aria-expanded={showEmoji}
        >😊</button>

        {showEmoji && (
          <div className={s.emojiPickerWrap}>
            <EmojiPicker
              onEmojiClick={({ emoji }) => {
                setText(t => t + emoji)
                setShowEmoji(false)
              }}
              height={350}
              width={300}
              searchPlaceholder="Tìm emoji..."
            />
          </div>
        )}

        <textarea
          className={s.chatInput}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn tin... (Enter để gửi)"
          rows={1}
          aria-label="Nhập tin nhắn"
        />

        <button
          className={s.sendBtn}
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Gửi tin nhắn"
        >Gửi</button>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
/**
 * ChatPanel — friend list + requests + realtime chat.
 * @param {{ user: { id, name, email } }} props
 */
export default function ChatPanel({ user }) {
  const [tab,         setTab]         = useState(TAB.FRIENDS)
  const [friends,     setFriends]     = useState([])  // accepted, with profile
  const [requests,    setRequests]    = useState([])  // pending incoming
  const [addId,       setAddId]       = useState('')
  const [addError,    setAddError]    = useState('')
  const [addLoading,  setAddLoading]  = useState(false)
  const [openChat,    setOpenChat]    = useState(null) // friend object

  // ── Subscribe friends ──────────────────────────────────────────────────────
  useEffect(() => {
    // Merge two queries (from + to) into one list
    const fromMap = new Map()
    const toMap   = new Map()

    const unsub = subscribeFriends(user.id, async (direction, docs) => {
      const map = direction === 'from' ? fromMap : toMap
      map.clear()

      for (const req of docs) {
        const friendId = direction === 'from' ? req.to : req.from
        const profile  = await getUser(friendId)
        if (profile) map.set(friendId, { ...profile, reqId: req.id })
      }

      // Merge both maps
      setFriends([...new Map([...fromMap, ...toMap]).values()])
    })
    return unsub
  }, [user.id])

  // ── Subscribe pending requests ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribePendingRequests(user.id, async (docs) => {
      const withProfiles = await Promise.all(
        docs.map(async req => {
          const profile = await getUser(req.from)
          return { ...req, fromProfile: profile }
        })
      )
      setRequests(withProfiles)
    })
    return unsub
  }, [user.id])

  // ── Add friend ─────────────────────────────────────────────────────────────
  async function handleAddFriend() {
    if (!addId.trim()) return
    setAddError('')
    setAddLoading(true)
    try {
      const target = await getUser(addId.trim())
      if (!target) throw new Error('Không tìm thấy User ID này')
      await sendFriendRequest(user.id, addId.trim())
      setAddId('')
    } catch (e) {
      setAddError(e.message)
    } finally {
      setAddLoading(false)
    }
  }

  // ── If chat open, show ChatView ────────────────────────────────────────────
  if (openChat) {
    return (
      <ChatView
        myId={user.id}
        friend={openChat}
        onBack={() => setOpenChat(null)}
      />
    )
  }

  // ── Main panel ─────────────────────────────────────────────────────────────
  return (
    <div className={s.panel}>

      {/* Tabs */}
      <div className={s.tabs} role="tablist">
        <button
          className={`${s.tab} ${tab === TAB.FRIENDS ? s.active : ''}`}
          onClick={() => setTab(TAB.FRIENDS)}
          role="tab" aria-selected={tab === TAB.FRIENDS}
        >Bạn bè</button>
        <button
          className={`${s.tab} ${tab === TAB.REQUESTS ? s.active : ''}`}
          onClick={() => setTab(TAB.REQUESTS)}
          role="tab" aria-selected={tab === TAB.REQUESTS}
        >
          Lời mời
          {requests.length > 0 && (
            <span className={s.badge} aria-label={`${requests.length} lời mời`}>
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Add friend input */}
      <div className={s.addFriend}>
        <input
          className={s.input}
          value={addId}
          onChange={e => { setAddId(e.target.value); setAddError('') }}
          onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
          placeholder="Nhập User ID để kết bạn..."
          aria-label="User ID cần kết bạn"
        />
        <button
          className={s.sendBtn}
          onClick={handleAddFriend}
          disabled={addLoading || !addId.trim()}
        >{addLoading ? '...' : '+ Thêm'}</button>
      </div>
      {addError && <p className={s.errorMsg} role="alert">{addError}</p>}

      <div className={s.body}>

        {/* Friends tab */}
        {tab === TAB.FRIENDS && (
          friends.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>🌸</div>
              <p>Chưa có bạn bè nào.<br/>Nhập User ID để kết bạn!</p>
            </div>
          ) : friends.map(f => (
            <div
              key={f.id}
              className={s.friendItem}
              onClick={() => setOpenChat(f)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setOpenChat(f)}
              aria-label={`Chat với ${f.displayName}`}
            >
              <PixelAvatar avatarId={f.avatar} size={36} />
              <div>
                <div className={s.friendName}>{f.displayName}</div>
                <div className={s.friendId}>{f.id.slice(0, 16)}...</div>
              </div>
            </div>
          ))
        )}

        {/* Requests tab */}
        {tab === TAB.REQUESTS && (
          requests.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>📬</div>
              <p>Không có lời mời nào</p>
            </div>
          ) : requests.map(req => (
            <div key={req.id} className={s.requestItem}>
              <div className={s.requestMeta}>
                <strong>{req.fromProfile?.displayName ?? 'Người dùng'}</strong> muốn kết bạn
              </div>
              <div className={s.requestId}>{req.from}</div>
              <div className={s.requestActions}>
                <button
                  className={s.acceptBtn}
                  onClick={() => acceptFriendRequest(req.id)}
                >✓ Chấp nhận</button>
                <button
                  className={s.rejectBtn}
                  onClick={() => rejectFriendRequest(req.id)}
                >✕ Từ chối</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
