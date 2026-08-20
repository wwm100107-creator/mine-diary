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
import s from './FloatingChat.module.css'

export default function FloatingChat({ user }) {
  // ── State ──
  const [isOpen, setIsOpen] = useState(false)
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

  // Total unread / pending count for badge
  const pendingRequestsCount = requestChats.length

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
    if (isOpen && activePartner) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, activePartner])

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
    setActivePartner(prev => prev ? { ...prev, status: 'accepted' } : null)
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
    <aside className={s.floatingContainer} aria-label="Khung trò chuyện thời gian thực">
      {/* ── 1. Floating Launcher Bubble ── */}
      {!isOpen && (
        <button
          type="button"
          className={s.launcherBubble}
          onClick={() => setIsOpen(true)}
          title="Mở tin nhắn"
          aria-label="Mở tin nhắn"
        >
          <span className={s.bubbleIcon} aria-hidden="true">💬</span>
          {pendingRequestsCount > 0 && (
            <span className={s.badgeNotification} aria-label={`${pendingRequestsCount} yêu cầu tin nhắn`}>
              {pendingRequestsCount}
            </span>
          )}
        </button>
      )}

      {/* ── 2. Floating Chat Popup Window ── */}
      {isOpen && (
        <div className={s.chatWindow} role="dialog" aria-modal="true" aria-label="Khung chat trực tiếp">
          
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerLeft}>
              {activePartner ? (
                <>
                  <button
                    type="button"
                    className={s.backBtn}
                    onClick={() => setActivePartner(null)}
                    title="Quay lại danh sách hội thoại"
                    aria-label="Quay lại"
                  >
                    ‹
                  </button>
                  <div className={s.avatarPair}>
                    <AvatarWithFrame
                      avatarUrl={user.avatar || 'bunny'}
                      frameId={user.avatarFrame || user.frame || 'none'}
                      size={24}
                      border={false}
                    />
                    <span className={s.heartPill}>♥</span>
                    <AvatarWithFrame
                      avatarUrl={activePartner.avatar || 'bunny'}
                      frameId={activePartner.avatarFrame || activePartner.frame || 'none'}
                      size={26}
                      border={false}
                    />
                  </div>
                  <div className={s.partnerInfo}>
                    <span className={s.partnerName} title={activePartner.displayName}>
                      {activePartner.displayName}
                    </span>
                    <span className={s.partnerIdBadge}>
                      #{activePartner.id}
                    </span>
                  </div>
                </>
              ) : (
                <div className={s.titleGroup}>
                  <span className={s.titleEmoji}>💬</span>
                  <span className={s.titleText}>Pixel Messenger</span>
                </div>
              )}
            </div>

            <div className={s.headerActions}>
              <button
                type="button"
                className={s.actionBtn}
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
              >
                _
              </button>
              <button
                type="button"
                className={s.actionBtn}
                onClick={() => {
                  setIsOpen(false)
                  setActivePartner(null)
                }}
                title="Đóng chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          {!activePartner ? (
            /* Screen A: ID Search & Tabbed Chat List */
            <div className={s.connectScreen}>
              
              {/* 1. User Search Input */}
              <div className={s.searchSection}>
                <div className={s.connectHeader}>
                  <h4 className={s.connectTitle}>
                    <span>🔍</span> Tìm Bạn Nhắn Tin
                  </h4>
                  {hasSearched && (
                    <button type="button" className={s.clearSearchBtn} onClick={handleClearSearch}>
                      ✕ Đóng tìm kiếm
                    </button>
                  )}
                </div>

                <form className={s.connectInputGroup} onSubmit={handleSearch}>
                  <input
                    type="text"
                    className={s.idInput}
                    placeholder="Nhập UID hoặc Tên hiển thị..."
                    value={idInput}
                    onChange={(e) => {
                      setIdInput(e.target.value)
                      if (!e.target.value.trim()) {
                        setSearchResults([])
                        setHasSearched(false)
                        setError('')
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className={s.connectBtn}
                    disabled={isSearching || !idInput.trim()}
                  >
                    {isSearching ? '...' : 'Tìm 🔍'}
                  </button>
                </form>
              </div>

              {error && <div className={s.errorBanner}>⚠️ {error}</div>}

              {/* Search Results List */}
              {hasSearched && searchResults.length > 0 && (
                <div className={s.searchResultsBox}>
                  <div className={s.searchResultsHeader}>
                    <span>✨ Tìm thấy {searchResults.length} người dùng:</span>
                  </div>
                  <div className={s.searchResultsList}>
                    {searchResults.map((partner) => (
                      <div
                        key={partner.id}
                        className={s.searchResultItem}
                        onClick={() => handleSelectUser(partner)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={s.recentItemLeft}>
                          <AvatarWithFrame
                            avatarUrl={partner.avatar || 'bunny'}
                            frameId={partner.avatarFrame || partner.frame || 'none'}
                            size={30}
                            border={false}
                          />
                          <div className={s.searchUserInfo}>
                            <div className={s.searchUserName}>{partner.displayName}</div>
                            <div className={s.searchUserUid}>#{partner.id}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={s.startChatBtn}
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
                </div>
              )}

              {/* User's own ID box with copy button */}
              <div className={s.myIdNotice}>
                <span>UID của bạn: <strong>#{user?.id}</strong></span>
                <button type="button" className={s.copyIdBtn} onClick={handleCopyId}>
                  {copied ? '✓ Đã sao chép' : 'Sao chép'}
                </button>
              </div>

              {/* 2. Chat Tabs: "Đang nhắn" vs "Tin nhắn chờ" */}
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

              {/* Tab 1: Active Conversations */}
              {chatTab === 'active' && (
                <div className={s.recentSection}>
                  <div className={s.recentTitle}>
                    <span>Danh sách hội thoại ({activeChats.length})</span>
                  </div>
                  {activeChats.length === 0 ? (
                    <div className={s.emptyMessages}>
                      <span className={s.emptyIcon}>🌸</span>
                      <span>Chưa có cuộc trò chuyện nào.<br/>Tìm kiếm bạn bè ở trên để bắt đầu!</span>
                    </div>
                  ) : (
                    <div className={s.recentList}>
                      {activeChats.map((partner) => (
                        <div
                          key={partner.id}
                          className={s.recentItem}
                          onClick={() => {
                            setActivePartner(partner)
                            saveRecentChat(user.id, partner, 'accepted')
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={s.recentItemLeft}>
                            <AvatarWithFrame
                              avatarUrl={partner.avatar || 'bunny'}
                              frameId={partner.avatarFrame || partner.frame || 'none'}
                              size={30}
                            />
                            <div>
                              <div className={s.recentName}>{partner.displayName}</div>
                              <div className={s.recentId}>#{partner.id}</div>
                            </div>
                          </div>
                          <span className={s.badgeActiveChat}>Đang chat</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Pending Message Requests */}
              {chatTab === 'requests' && (
                <div className={s.recentSection}>
                  <div className={s.recentTitle}>
                    <span>Yêu cầu trò chuyện ({requestChats.length})</span>
                  </div>
                  {requestChats.length === 0 ? (
                    <div className={s.emptyMessages}>
                      <span className={s.emptyIcon}>✨</span>
                      <span>Hộp thư chờ đang trống.<br/>Không có yêu cầu kết nối nào!</span>
                    </div>
                  ) : (
                    <div className={s.recentList}>
                      {requestChats.map((partner) => (
                        <div
                          key={partner.id}
                          className={s.recentItem}
                          onClick={() => {
                            setActivePartner(partner)
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={s.recentItemLeft}>
                            <AvatarWithFrame
                              avatarUrl={partner.avatar || 'bunny'}
                              frameId={partner.avatarFrame || partner.frame || 'none'}
                              size={30}
                            />
                            <div>
                              <div className={s.recentName}>{partner.displayName}</div>
                              <div className={s.recentId}>#{partner.id}</div>
                            </div>
                          </div>
                          <span className={s.badgePending}>Chờ duyệt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* Screen B: Chat Room */
            <>
              <div className={s.messageArea} role="log" aria-label="Tin nhắn">
                {/* Notice banner for Pending Requests */}
                {!isAccepted && (
                  <div className={s.requestNoticeBanner}>
                    <div className={s.requestNoticeTitle}>
                      <span>💌</span> TIN NHẮN TỪ NGƯỜI LẠ
                    </div>
                    <div className={s.requestNoticeSub}>
                      <strong>{activePartner.displayName}</strong> (#{activePartner.id}) muốn kết nối với bạn. Hãy bấm <strong>Chấp nhận</strong> để trò chuyện nhé!
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className={s.emptyMessages}>
                    <span className={s.emptyIcon}>💌</span>
                    <span>
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
                            size={24}
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

              {/* Chat Footer: Input or Accept/Decline Bar */}
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
          )}

        </div>
      )}
    </aside>
  )
}
