import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import AvatarWithFrame from './AvatarWithFrame'
import {
  searchUsers,
  sendChatMessage,
  subscribeToMessages,
  subscribeToChatRoom,
  subscribeToUserChats,
  getRecentChats,
  saveRecentChat,
  acceptChatRequest,
  declineChatRequest,
} from '../lib/social'
import s from './ChatView.module.css'

export default function ChatView({ user }) {
  // ── State ──
  const [chatTab, setChatTab] = useState('active') // 'active' | 'requests'
  const [activePartner, setActivePartner] = useState(null) // { id, displayName, avatar, avatarFrame, status }
  const [idInput, setIdInput] = useState('')
  const [msgText, setMsgText] = useState('')
  const [messages, setMessages] = useState([])
  const [roomData, setRoomData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Multi-result search state
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Realtime lists from Firestore
  const [inboxChats, setInboxChats] = useState([])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // 1. Subscribe to all user chats (Realtime Inbox)
  useEffect(() => {
    if (!user?.id) return
    const unsubscribe = subscribeToUserChats(user.id, (chats) => {
      setInboxChats(chats)
    })
    return () => unsubscribe()
  }, [user?.id])

  // 2. Separate active chats vs pending requests
  const { activeChats, requestChats } = useMemo(() => {
    const local = getRecentChats(user?.id)
    const active = []
    const requests = []
    const seen = new Set()

    // 1. Inbox realtime chats
    inboxChats.forEach((c) => {
      seen.add(c.partnerId)
      const chatItem = {
        id: c.partnerId,
        displayName: c.displayName,
        avatar: c.avatar,
        avatarFrame: c.avatarFrame || 'none',
        status: c.status,
        initiatorId: c.initiatorId,
        lastMessage: c.lastMessage,
      }

      if (c.status === 'pending' && c.initiatorId !== user?.id) {
        requests.push(chatItem)
      } else {
        active.push(chatItem)
      }
    })

    // 2. Merge local cache for partners not yet having room
    local.forEach((c) => {
      if (!seen.has(c.id)) {
        active.push(c)
      }
    })

    return { activeChats: active, requestChats: requests }
  }, [inboxChats, user?.id])

  // 3. Realtime messages subscription for active chat partner
  useEffect(() => {
    if (!user?.id || !activePartner?.id) {
      setMessages([])
      setRoomData(null)
      return
    }

    const unsubMessages = subscribeToMessages(user.id, activePartner.id, (msgs) => {
      setMessages(msgs)
    })

    const unsubRoom = subscribeToChatRoom(user.id, activePartner.id, (room) => {
      setRoomData(room)
    })

    return () => {
      unsubMessages?.()
      unsubRoom?.()
    }
  }, [user?.id, activePartner?.id])

  // 4. Check if current open room is accepted for current user
  const isAccepted = useMemo(() => {
    if (!activePartner) return true
    if (activePartner.status === 'accepted') return true
    if (roomData?.status === 'accepted') return true
    if (roomData?.initiatorId === user?.id) return true
    return false
  }, [activePartner, roomData, user?.id])

  // Auto-scroll to latest message
  useEffect(() => {
    if (activePartner) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activePartner])

  // Search users by UID, Display Name, or Username
  const handleSearch = async (e) => {
    e?.preventDefault()
    setError('')
    const queryStr = idInput.trim()
    if (!queryStr) return

    setIsSearching(true)
    setHasSearched(true)
    try {
      const results = await searchUsers(queryStr, user?.id)
      setSearchResults(results)
      if (results.length === 0) {
        setError(`Không tìm thấy người dùng nào phù hợp với "${queryStr}".`)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Lỗi khi tìm kiếm người dùng. Vui lòng thử lại!')
    } finally {
      setIsSearching(false)
    }
  }

  // Select user from search results to start chat
  const handleSelectUser = (foundUser) => {
    const partnerObj = {
      id: foundUser.id,
      displayName: foundUser.displayName || foundUser.id,
      avatar: foundUser.avatar || 'bunny',
      avatarFrame: foundUser.avatarFrame || foundUser.frame || 'none',
      status: 'accepted',
    }
    setActivePartner(partnerObj)
    saveRecentChat(user.id, partnerObj, 'accepted')
    setIdInput('')
    setSearchResults([])
    setHasSearched(false)
    setError('')
  }

  const handleClearSearch = () => {
    setIdInput('')
    setSearchResults([])
    setHasSearched(false)
    setError('')
  }

  // Send message
  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault()
    const text = msgText.trim()
    if (!text || !user?.id || !activePartner?.id) return

    setMsgText('')
    try {
      await sendChatMessage(user.id, activePartner.id, text)
    } catch (err) {
      console.error('Send message error:', err)
    }
  }, [msgText, user?.id, activePartner?.id])

  // Accept Message Request
  const handleAcceptRequest = async () => {
    if (!user?.id || !activePartner?.id) return
    await acceptChatRequest(user.id, activePartner.id)
    setActivePartner((prev) => (prev ? { ...prev, status: 'accepted' } : null))
    setTimeout(() => {
      inputRef.current?.focus()
    }, 150)
  }

  // Decline Message Request
  const handleDeclineRequest = async () => {
    if (!user?.id || !activePartner?.id) return
    await declineChatRequest(user.id, activePartner.id)
    setActivePartner(null)
    setChatTab('requests')
  }

  // Copy own ID
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format timestamp helper
  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) return null

  return (
    <div className={s.fullChatContainer}>
      {/* ── Main 2-Column Chat Layout ── */}
      <div className={`${s.chatLayout} ${activePartner ? s.mobileShowChat : s.mobileShowSidebar}`}>
        
        {/* ══════════════════════════════════════════════
            COLUMN 1: Conversations & Requests Sidebar
           ══════════════════════════════════════════════ */}
        <aside className={s.sidebar}>
          
          {/* Header of Sidebar */}
          <div className={s.sidebarHeader}>
            <div className={s.sidebarTitleGroup}>
              <span className={s.sidebarTitleIcon}>💬</span>
              <h2 className={s.sidebarTitle}>Pixel Messenger</h2>
            </div>
            {/* User UID Badge with Copy */}
            <div className={s.myUidPill}>
              <span>UID: <strong>#{user?.id}</strong></span>
              <button type="button" className={s.copyUidBtn} onClick={handleCopyId} title="Sao chép UID">
                {copied ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Search Box Section */}
          <div className={s.searchSection}>
            <form className={s.searchForm} onSubmit={handleSearch}>
              <input
                type="text"
                className={s.searchInput}
                placeholder="Tìm bạn theo UID hoặc Tên..."
                value={idInput}
                onChange={(e) => {
                  setIdInput(e.target.value)
                  if (!e.target.value.trim()) {
                    setSearchResults([])
                    setHasSearched(false)
                    setError('')
                  }
                }}
              />
              <button
                type="submit"
                className={s.searchSubmitBtn}
                disabled={isSearching || !idInput.trim()}
              >
                {isSearching ? '...' : 'Tìm 🔍'}
              </button>
            </form>

            {hasSearched && (
              <div className={s.searchResultTopBar}>
                <span>Kết quả tìm kiếm ({searchResults.length})</span>
                <button type="button" className={s.clearSearchTextBtn} onClick={handleClearSearch}>
                  ✕ Đóng
                </button>
              </div>
            )}

            {error && <div className={s.errorBanner}>⚠️ {error}</div>}

            {/* Search Results Dropdown List */}
            {hasSearched && searchResults.length > 0 && (
              <div className={s.searchResultsList}>
                {searchResults.map((partner) => (
                  <div
                    key={partner.id}
                    className={s.searchResultCard}
                    onClick={() => handleSelectUser(partner)}
                  >
                    <div className={s.partnerAvatarInfo}>
                      <AvatarWithFrame
                        avatarUrl={partner.avatar || 'bunny'}
                        frameId={partner.avatarFrame || partner.frame || 'none'}
                        size={36}
                        border={false}
                      />
                      <div className={s.partnerMeta}>
                        <div className={s.partnerDisplayName}>{partner.displayName}</div>
                        <div className={s.partnerUid}>#{partner.id}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={s.startChatDirectBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectUser(partner)
                      }}
                    >
                      Nhắn tin 💬
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Tabs: "Đang nhắn" vs "Tin nhắn chờ" */}
          <div className={s.tabBar} role="tablist">
            <button
              type="button"
              className={`${s.tabBtn} ${chatTab === 'active' ? s.activeTab : ''}`}
              onClick={() => setChatTab('active')}
              role="tab"
              aria-selected={chatTab === 'active'}
            >
              <span>💬 Đang nhắn</span>
              <span className={s.tabBadge}>{activeChats.length}</span>
            </button>

            <button
              type="button"
              className={`${s.tabBtn} ${chatTab === 'requests' ? s.activeTab : ''}`}
              onClick={() => setChatTab('requests')}
              role="tab"
              aria-selected={chatTab === 'requests'}
            >
              <span>💌 Tin nhắn chờ</span>
              {requestChats.length > 0 && (
                <span className={`${s.tabBadge} ${s.pulse}`}>{requestChats.length}</span>
              )}
            </button>
          </div>

          {/* Conversations Scroll List */}
          <div className={s.chatListScroll}>
            {chatTab === 'active' ? (
              activeChats.length === 0 ? (
                <div className={s.emptyState}>
                  <span className={s.emptyStateIcon}>🌸</span>
                  <p className={s.emptyStateText}>
                    Chưa có cuộc trò chuyện nào.<br />Hãy tìm kiếm bạn bè ở trên để bắt đầu!
                  </p>
                </div>
              ) : (
                activeChats.map((partner) => {
                  const isSelected = activePartner?.id === partner.id
                  return (
                    <div
                      key={partner.id}
                      className={`${s.chatItem} ${isSelected ? s.chatItemSelected : ''}`}
                      onClick={() => {
                        setActivePartner(partner)
                        saveRecentChat(user.id, partner, 'accepted')
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <AvatarWithFrame
                        avatarUrl={partner.avatar || 'bunny'}
                        frameId={partner.avatarFrame || partner.frame || 'none'}
                        size={40}
                      />
                      <div className={s.chatItemContent}>
                        <div className={s.chatItemTop}>
                          <span className={s.chatItemName}>{partner.displayName}</span>
                          <span className={s.chatItemUid}>#{partner.id}</span>
                        </div>
                        <div className={s.chatItemBottom}>
                          <span className={s.chatItemPreview}>
                            {partner.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            ) : (
              requestChats.length === 0 ? (
                <div className={s.emptyState}>
                  <span className={s.emptyStateIcon}>✨</span>
                  <p className={s.emptyStateText}>
                    Hộp thư chờ đang trống.<br />Không có yêu cầu kết nối nào mới!
                  </p>
                </div>
              ) : (
                requestChats.map((partner) => {
                  const isSelected = activePartner?.id === partner.id
                  return (
                    <div
                      key={partner.id}
                      className={`${s.chatItem} ${s.requestItem} ${isSelected ? s.chatItemSelected : ''}`}
                      onClick={() => setActivePartner(partner)}
                      role="button"
                      tabIndex={0}
                    >
                      <AvatarWithFrame
                        avatarUrl={partner.avatar || 'bunny'}
                        frameId={partner.avatarFrame || partner.frame || 'none'}
                        size={40}
                      />
                      <div className={s.chatItemContent}>
                        <div className={s.chatItemTop}>
                          <span className={s.chatItemName}>{partner.displayName}</span>
                          <span className={s.badgePendingTag}>Chờ duyệt</span>
                        </div>
                        <div className={s.chatItemBottom}>
                          <span className={s.chatItemPreview}>
                            {partner.lastMessage || 'Gửi lời mời trò chuyện...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            )}
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            COLUMN 2: Main Active Chat Window
           ══════════════════════════════════════════════ */}
        <section className={s.chatPanel}>
          {activePartner ? (
            <>
              {/* Chat Panel Header */}
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    className={s.mobileBackBtn}
                    onClick={() => setActivePartner(null)}
                    title="Quay lại danh sách"
                  >
                    ‹ Danh sách
                  </button>

                  {/* Connected Avatars Pair */}
                  <div className={s.avatarPair}>
                    <AvatarWithFrame
                      avatarUrl={user.avatar || 'bunny'}
                      frameId={user.avatarFrame || user.frame || 'none'}
                      size={32}
                      border={false}
                    />
                    <span className={s.heartPill}>♥</span>
                    <AvatarWithFrame
                      avatarUrl={activePartner.avatar || 'bunny'}
                      frameId={activePartner.avatarFrame || activePartner.frame || 'none'}
                      size={34}
                      border={false}
                    />
                  </div>

                  {/* Partner Info */}
                  <div className={s.headerPartnerDetails}>
                    <div className={s.headerPartnerName}>{activePartner.displayName}</div>
                    <div className={s.headerPartnerUid}>#{activePartner.id}</div>
                  </div>
                </div>

                <div className={s.chatHeaderRight}>
                  <span className={s.onlineBadge}>● Đang hoạt động</span>
                </div>
              </div>

              {/* Chat Message Scrollable Area */}
              <div className={s.messageArea} role="log" aria-label="Tin nhắn">
                {/* Notice banner for Pending Requests */}
                {!isAccepted && (
                  <div className={s.requestNoticeBanner}>
                    <div className={s.requestNoticeTitle}>
                      <span>💌</span> YÊU CẦU TRÒ CHUYỆN TỪ NGƯỜI LẠ
                    </div>
                    <div className={s.requestNoticeSub}>
                      <strong>{activePartner.displayName}</strong> (#{activePartner.id}) muốn kết nối với bạn. Bấm <strong>Chấp nhận</strong> để bắt đầu trò chuyện!
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className={s.noMessagesState}>
                    <span className={s.noMessagesIcon}>💌</span>
                    <span className={s.noMessagesText}>
                      {!isAccepted
                        ? `Xem trước tin nhắn từ ${activePartner.displayName}...`
                        : `Hãy gửi lời chào đầu tiên tới ${activePartner.displayName}! ✨`}
                    </span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.senderId === user.id
                    return (
                      <div
                        key={msg.id}
                        className={`${s.messageRow} ${isSent ? s.sent : s.received}`}
                      >
                        {!isSent && (
                          <AvatarWithFrame
                            avatarUrl={activePartner.avatar || 'bunny'}
                            frameId={activePartner.avatarFrame || activePartner.frame || 'none'}
                            size={28}
                            border={false}
                          />
                        )}
                        <div className={`${s.bubble} ${isSent ? s.sentBubble : s.receivedBubble}`}>
                          {msg.text}
                        </div>
                        <span className={s.messageTime}>{formatTime(msg.createdAt)}</span>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer: Input or Decision Bar */}
              {!isAccepted ? (
                <div className={s.pendingDecisionBar}>
                  <button
                    type="button"
                    className={s.declineRequestBtn}
                    onClick={handleDeclineRequest}
                  >
                    Từ chối ✕
                  </button>
                  <button
                    type="button"
                    className={s.acceptRequestBtn}
                    onClick={handleAcceptRequest}
                  >
                    Chấp nhận kết nối ✓
                  </button>
                </div>
              ) : (
                <form className={s.inputBar} onSubmit={handleSendMessage}>
                  <input
                    ref={inputRef}
                    type="text"
                    className={s.chatInput}
                    placeholder="Gõ tin nhắn pixel..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className={s.sendBtn}
                    disabled={!msgText.trim()}
                    aria-label="Gửi tin nhắn"
                  >
                    Gửi 💌
                  </button>
                </form>
              )}
            </>
          ) : (
            /* Empty State when no conversation selected */
            <div className={s.noSelectedChat}>
              <div className={s.pixelMascot}>🐰💌</div>
              <h3 className={s.noSelectedTitle}>Chào mừng đến với Pixel Messenger</h3>
              <p className={s.noSelectedSub}>
                Chọn một người bạn ở danh sách bên trái hoặc tìm kiếm UID để bắt đầu trò chuyện thời gian thực nhé!
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
