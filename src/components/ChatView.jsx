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
  RELATIONSHIP_TYPES,
  sendRelationshipRequest,
  acceptRelationshipRequest,
  declineRelationshipRequest,
  requestCancelRelationship,
  confirmCancelRelationship,
  abortCancelRelationship,
  subscribeToRelationship,
} from '../lib/social'
import s from './ChatView.module.css'

function normalizeText(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

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

  // Relationship States
  const [relationship, setRelationship] = useState(null)
  const [isSetRelModalOpen, setIsSetRelModalOpen] = useState(false)
  const [relType, setRelType] = useState('couple')
  const [customRelName, setCustomRelName] = useState('')
  const [customRelIcon, setCustomRelIcon] = useState('')
  const [customRelImg, setCustomRelImg] = useState('')
  const [senderShareCycle, setSenderShareCycle] = useState(false)
  const [receiverShareCycle, setReceiverShareCycle] = useState(false)
  const [isShareConfirmModalOpen, setIsShareConfirmModalOpen] = useState(false)

  // 1x1 Image upload handler for relationship icon
  const handleRelImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 2MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, 64, 64)
        setCustomRelImg(canvas.toDataURL('image/png'))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

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

  // 1.1 Listen to open chat event (from Toast Notification click)
  useEffect(() => {
    const handleOpenChatEvent = (e) => {
      const p = e.detail
      if (p && p.partnerId) {
        setActivePartner({
          id: p.partnerId,
          displayName: p.displayName,
          avatar: p.avatar,
          avatarFrame: p.avatarFrame,
          status: p.status || 'accepted',
        })
      }
    }
    window.addEventListener('minediary:open_chat', handleOpenChatEvent)
    return () => window.removeEventListener('minediary:open_chat', handleOpenChatEvent)
  }, [])

  // 1.2 Broadcast current active partner ID to global Root (for toast suppression)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('minediary:active_chat_partner', {
        detail: activePartner?.id || null,
      })
    )
    return () => {
      window.dispatchEvent(
        new CustomEvent('minediary:active_chat_partner', {
          detail: null,
        })
      )
    }
  }, [activePartner?.id])

  // Clear legacy phantom recentChats from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        localStorage.removeItem(`minediary:recent_chats:${user.id}`)
      } catch (e) {}
    }
  }, [user?.id])

  // 2. Separate active chats vs pending requests (Solely from Firestore Realtime)
  const { activeChats, requestChats } = useMemo(() => {
    const active = []
    const requests = []

    // 1. Inbox realtime chats directly from Firestore
    inboxChats.forEach((c) => {
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

    const unsubRel = subscribeToRelationship(user.id, activePartner.id, (rel) => {
      setRelationship(rel)
    })

    return () => {
      unsubMessages?.()
      unsubRoom?.()
      unsubRel?.()
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

  // Send message with Regex Bot Listener (Hủy Set)
  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault()
    const text = msgText.trim()
    if (!text || !user?.id || !activePartner?.id) return

    // ── Bot Chat Listener: Regex check for "huy set" ──
    const normalized = normalizeText(text)
    const cancelSetRegex = /\b(huy\s+set(\s+quan\s+he)?|bo\s+set|xoa\s+set|cancel\s+set)\b/i

    if (cancelSetRegex.test(normalized)) {
      setMsgText('')
      if (!relationship || relationship.status !== 'accepted') {
        alert('Hiện tại 2 bạn chưa có mối quan hệ nào đang hoạt động để hủy set!')
        return
      }
      try {
        await requestCancelRelationship(relationship.id, user.id)
        await sendChatMessage(user.id, activePartner.id, `🔔 ${user.displayName || user.name} đã yêu cầu HỦY SET mối quan hệ (${relationship.customIcon} ${relationship.customName}).`, {
          isSystemMessage: true,
          type: 'cancel_relationship_request',
        })
      } catch (err) {
        console.error('Request cancel relationship error:', err)
      }
      return
    }

    setMsgText('')
    try {
      await sendChatMessage(user.id, activePartner.id, text)
    } catch (err) {
      console.error('Send message error:', err)
    }
  }, [msgText, user?.id, user?.displayName, user?.name, activePartner?.id, relationship])

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

  // ── Relationship Actions ──
  const handleSendRelRequest = async () => {
    if (!user?.id || !activePartner?.id) return
    const isFemale = user?.gender === 'female' || !user?.gender
    try {
      const relData = await sendRelationshipRequest({
        senderId: user.id,
        receiverId: activePartner.id,
        type: relType,
        customName: customRelName,
        customIcon: customRelIcon,
        customIconImage: customRelImg || null,
        isCycleShared: isFemale ? senderShareCycle : false,
      })
      const shareNote = (isFemale && senderShareCycle) ? ' (Đã bật chia sẻ chu kỳ 🌸)' : ''
      await sendChatMessage(user.id, activePartner.id, `💌 Đã gửi lời mời Set Mối Quan Hệ "${relData.customIcon} ${relData.customName}"${shareNote}.`, {
        isSystemMessage: true,
        type: 'relationship_request',
      })
      setIsSetRelModalOpen(false)
      setCustomRelName('')
      setCustomRelIcon('')
      setCustomRelImg('')
      setSenderShareCycle(false)
    } catch (err) {
      console.error('Send rel request error:', err)
    }
  }

  const handleTriggerAcceptRel = () => {
    if (!relationship) return
    // If current accepting user is Female, ask for cycle sharing confirmation for ANY relationship type
    const isFemale = user?.gender === 'female' || !user?.gender
    if (isFemale) {
      setIsShareConfirmModalOpen(true)
    } else {
      handleFinalAcceptRel(false)
    }
  }

  const handleFinalAcceptRel = async (shareCycle = false) => {
    if (!relationship) return
    try {
      await acceptRelationshipRequest(relationship.id, shareCycle)
      const shareMsg = shareCycle ? ' (Đã bật chia sẻ thông tin chu kỳ 🌸)' : ''
      await sendChatMessage(user.id, activePartner.id, `🎉 2 bạn đã chính thức thiết lập mối quan hệ "${relationship.customIcon} ${relationship.customName}"!${shareMsg}`, {
        isSystemMessage: true,
        type: 'relationship_accepted',
      })
      setIsShareConfirmModalOpen(false)
    } catch (err) {
      console.error('Accept rel error:', err)
    }
  }

  const handleDeclineRel = async () => {
    if (!relationship) return
    try {
      await declineRelationshipRequest(relationship.id)
      await sendChatMessage(user.id, activePartner.id, `✕ Lời mời set mối quan hệ "${relationship.customIcon} ${relationship.customName}" đã bị từ chối.`, {
        isSystemMessage: true,
        type: 'relationship_declined',
      })
    } catch (err) {
      console.error('Decline rel error:', err)
    }
  }

  const handleConfirmCancelRel = async () => {
    if (!relationship) return
    try {
      await confirmCancelRelationship(relationship.id)
      await sendChatMessage(user.id, activePartner.id, `💔 Mối quan hệ giữa 2 bạn đã chính thức được hủy bỏ.`, {
        isSystemMessage: true,
        type: 'relationship_cancelled',
      })
    } catch (err) {
      console.error('Confirm cancel rel error:', err)
    }
  }

  const handleAbortCancelRel = async () => {
    if (!relationship) return
    try {
      await abortCancelRelationship(relationship.id)
      await sendChatMessage(user.id, activePartner.id, `✨ Yêu cầu hủy set đã được gỡ bỏ, mối quan hệ vẫn được giữ nguyên!`, {
        isSystemMessage: true,
        type: 'relationship_kept',
      })
    } catch (err) {
      console.error('Abort cancel rel error:', err)
    }
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
                    <button
                      type="button"
                      className={s.relLinkCenterBtn}
                      onClick={() => {
                        if (relationship?.status === 'accepted') {
                          setRelType(relationship.type || 'couple')
                          setCustomRelName(relationship.customName || '')
                          setCustomRelIcon(relationship.customIcon || '')
                          setCustomRelImg(relationship.customIconImage || '')
                        } else {
                          setRelType('couple')
                          setCustomRelName('')
                          setCustomRelIcon('')
                          setCustomRelImg('')
                        }
                        setIsSetRelModalOpen(true)
                      }}
                      title={relationship?.status === 'accepted' ? `Mối quan hệ: ${relationship.customName} (Bấm để xem/đổi)` : 'Bấm vào đây để Set Mối Quan Hệ (🔗)'}
                    >
                      {relationship?.status === 'accepted' ? (
                        relationship.customIconImage ? (
                          <img src={relationship.customIconImage} alt="Icon" className={s.customIconImg} />
                        ) : (
                          <span className={s.relPillIcon}>{relationship.customIcon || '💖'}</span>
                        )
                      ) : (
                        <span className={s.relPillIcon}>🔗</span>
                      )}
                    </button>
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
                  {/* Relationship Status Badge or Set Button */}
                  {relationship?.status === 'accepted' ? (
                    <div
                      className={s.relationshipBadge}
                      title={`Mối quan hệ: ${relationship.customName}`}
                      onClick={() => setIsSetRelModalOpen(true)}
                    >
                      <span>{relationship.customIcon || '💖'}</span>
                      <span>{relationship.customName}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={s.setRelBtn}
                      onClick={() => {
                        setRelType('couple')
                        setCustomRelName('')
                        setCustomRelIcon('')
                        setIsSetRelModalOpen(true)
                      }}
                      title="Thiết lập mối quan hệ đặc biệt"
                    >
                      <span>💖</span> Set Quan Hệ
                    </button>
                  )}
                  <span className={s.onlineBadge}>● Hoạt động</span>
                </div>
              </div>

              {/* Relationship Pending Request / Cancellation Request Action Banner */}
              {relationship?.status === 'pending' && (
                <div className={s.relationshipActionBanner}>
                  <div className={s.relationshipActionTitle}>
                    <span>💌</span> YÊU CẦU THIẾT LẬP MỐI QUAN HỆ
                  </div>
                  {relationship.receiverId === user.id ? (
                    <>
                      <div className={s.relationshipActionDesc}>
                        <strong>{activePartner.displayName}</strong> muốn set mối quan hệ{' '}
                        <strong>{relationship.customIcon} {relationship.customName}</strong> với bạn.
                      </div>

                      {/* Female Receiver: Optional Cycle Sharing Switch */}
                      {(user?.gender === 'female' || !user?.gender) && (
                        <div className={s.pixelToggleRow}>
                          <div className={s.pixelToggleLabel}>
                            <span>🌸</span> Cho phép đối phương theo dõi dữ liệu chu kỳ của bạn
                          </div>
                          <button
                            type="button"
                            className={`${s.pixelToggleTrack} ${receiverShareCycle ? s.pixelToggleTrackActive : ''}`}
                            onClick={() => setReceiverShareCycle((prev) => !prev)}
                            aria-label="Bật tắt chia sẻ chu kỳ"
                          >
                            <div className={s.pixelToggleThumb} />
                          </button>
                        </div>
                      )}

                      <div className={s.relationshipActionButtons}>
                        <button
                          type="button"
                          className={s.relAcceptBtn}
                          onClick={() => handleFinalAcceptRel(receiverShareCycle)}
                        >
                          Đồng ý kết nối ✓
                        </button>
                        <button type="button" className={s.relDeclineBtn} onClick={handleDeclineRel}>
                          Từ chối ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className={s.relationshipActionDesc}>
                      Bạn đã gửi lời mời set mối quan hệ <strong>{relationship.customIcon} {relationship.customName}</strong>. Đang chờ đối phương phản hồi...
                    </div>
                  )}
                </div>
              )}

              {relationship?.status === 'cancel_pending' && (
                <div className={s.relationshipActionBanner} style={{ borderStyle: 'dashed', borderColor: '#D32F2F', background: '#FFF0F2' }}>
                  <div className={s.relationshipActionTitle} style={{ color: '#D32F2F' }}>
                    <span>⚠️</span> YÊU CẦU HỦY SET MỐI QUAN HỆ
                  </div>
                  {relationship.cancelRequesterId !== user.id ? (
                    <>
                      <div className={s.relationshipActionDesc}>
                        <strong>{activePartner.displayName}</strong> đã gửi yêu cầu hủy set mối quan hệ{' '}
                        <strong>{relationship.customIcon} {relationship.customName}</strong>. Bạn có đồng ý không?
                      </div>
                      <div className={s.relationshipActionButtons}>
                        <button type="button" className={s.relAcceptBtn} style={{ background: '#D32F2F', borderColor: '#B71C1C' }} onClick={handleConfirmCancelRel}>
                          Đồng ý hủy set 💔
                        </button>
                        <button type="button" className={s.relDeclineBtn} onClick={handleAbortCancelRel}>
                          Giữ lại mối quan hệ ✨
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={s.relationshipActionDesc}>
                        Bạn đã gửi yêu cầu hủy set mối quan hệ. Đang chờ <strong>{activePartner.displayName}</strong> xác nhận...
                      </div>
                      <div className={s.relationshipActionButtons}>
                        <button type="button" className={s.relDeclineBtn} onClick={handleAbortCancelRel}>
                          Thu hồi yêu cầu hủy
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

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
                    const isSystem = msg.isSystemMessage || msg.type === 'system' || msg.type === 'care_reminder' || msg.type === 'cancel_relationship_request'

                    if (isSystem) {
                      return (
                        <div key={msg.id} className={s.systemMessageRow}>
                          <div className={s.systemMessageCard}>
                            <div className={s.systemMessageContent}>{msg.text}</div>
                            <span className={s.systemMessageTime}>{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      )
                    }

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
                    placeholder="Gõ tin nhắn... (Gõ 'huy set' để hủy mối quan hệ)"
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

      {/* ── Modal: Set Quan Hệ ── */}
      {isSetRelModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsSetRelModalOpen(false)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modalTitle}>
              <span>💖</span> Thiết Lập Mối Quan Hệ Đặc Biệt
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', margin: 0 }}>
              Chọn loại mối quan hệ bạn muốn gắn kết cùng <strong>{activePartner?.displayName}</strong>:
            </p>

            <div className={s.relTypeGrid}>
              {RELATIONSHIP_TYPES.map((t) => {
                const isSelected = relType === t.id
                return (
                  <div
                    key={t.id}
                    className={`${s.relTypeCard} ${isSelected ? s.relTypeCardSelected : ''}`}
                    onClick={() => setRelType(t.id)}
                  >
                    <span className={s.relTypeIcon}>{t.icon}</span>
                    <span className={s.relTypeLabel}>{t.label}</span>
                    <span className={s.relTypeDesc}>{t.desc}</span>
                  </div>
                )
              })}
            </div>

            {/* Custom Name / Icon & 1x1 Image Upload */}
            <div style={{ display: 'flex', gap: 10, flexDirection: 'column', marginTop: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-ink)' }}>
                Tên danh hiệu & Biểu tượng tùy chỉnh (Không bắt buộc):
              </label>
              
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Icon (vd: 🌸)"
                  value={customRelIcon}
                  onChange={(e) => setCustomRelIcon(e.target.value)}
                  style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1.5px solid var(--color-border-mid)', textAlign: 'center', fontSize: 14 }}
                />
                <input
                  type="text"
                  placeholder="Tên danh hiệu (vd: Tri Kỷ, Đại Ca...)"
                  value={customRelName}
                  onChange={(e) => setCustomRelName(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1.5px solid var(--color-border-mid)', fontSize: 12 }}
                />
              </div>

              {/* 1x1 Image Upload Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF5F8', padding: '8px 12px', borderRadius: 8, border: '1.5px dashed #FFB7C5' }}>
                {customRelImg ? (
                  <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                    <img
                      src={customRelImg}
                      alt="Icon Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1.5px solid #FF5E7E' }}
                    />
                    <button
                      type="button"
                      onClick={() => setCustomRelImg('')}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#D32F2F', color: '#FFF', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 6, border: '1.5px dashed #FF8FAB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#FF8FAB', flexShrink: 0 }}>
                    🖼️
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: '#FFF',
                      border: '1.5px solid #FF8FAB',
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: 'var(--font-pixel)',
                      color: '#D81B60',
                      cursor: 'pointer',
                      boxShadow: '1px 1px 0 #FFB7C5',
                    }}
                  >
                    <span>📷</span> Up ảnh 1x1 làm Icon
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRelImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-light)', marginTop: 2 }}>
                    Tự động scale ảnh vuông 1x1 thành pixel icon
                  </div>
                </div>
              </div>

              {/* Female Sender: Optional Cycle Sharing Switch */}
              {(user?.gender === 'female' || !user?.gender) && (
                <div className={s.pixelToggleRow}>
                  <div className={s.pixelToggleLabel}>
                    <span>🌸</span> Cho phép người này xem dữ liệu chu kỳ của bạn
                  </div>
                  <button
                    type="button"
                    className={`${s.pixelToggleTrack} ${senderShareCycle ? s.pixelToggleTrackActive : ''}`}
                    onClick={() => setSenderShareCycle((prev) => !prev)}
                    aria-label="Cho phép người này xem dữ liệu chu kỳ của bạn"
                  >
                    <div className={s.pixelToggleThumb} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                className={s.relDeclineBtn}
                onClick={() => setIsSetRelModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={s.relAcceptBtn}
                onClick={handleSendRelRequest}
              >
                Gửi Lời Mời 💌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Xác nhận chia sẻ chu kỳ (Dành cho bạn Nữ khi xác nhận quan hệ) ── */}
      {isShareConfirmModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsShareConfirmModalOpen(false)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={s.modalTitle} style={{ color: '#E91E63' }}>
              <span>🌸</span> Chia Sẻ Thông Tin Chu Kỳ?
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-ink)', margin: 0 }}>
              Bạn đang thiết lập quan hệ <strong>{relationship?.customIcon} {relationship?.customName}</strong> với <strong>{activePartner?.displayName}</strong>.
            </p>
            <div style={{ background: '#FFF5F8', border: '1.5px solid #FF8FAB', borderRadius: 10, padding: 12, fontSize: 12, color: '#D81B60' }}>
              ✨ <strong>Bạn có đồng ý chia sẻ thông tin chu kỳ & sức khỏe cho đối phương không?</strong><br />
              Nếu đồng ý, đối phương sẽ mở khóa tab <strong>"Theo dõi chu kỳ"</strong> để theo dõi ngày dự kiến và gửi những lời nhắc quan tâm, chăm sóc bạn!
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className={s.relAcceptBtn}
                style={{ padding: '10px 14px', fontSize: 11 }}
                onClick={() => handleFinalAcceptRel(true)}
              >
                💖 Đồng Ý Chia Sẻ Thông Tin Chu Kỳ
              </button>
              <button
                type="button"
                className={s.relDeclineBtn}
                style={{ padding: '10px 14px', fontSize: 11 }}
                onClick={() => handleFinalAcceptRel(false)}
              >
                🔒 Thiết Lập Quan Hệ & Không Chia Sẻ Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
