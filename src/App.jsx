import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from './lib/firebase'
import DiaryView from './components/DiaryView'
import HealthView from './components/HealthView'
import PartnerCycleView from './components/PartnerCycleView'
import AdminDashboard from './components/AdminDashboard'
import ChatView from './components/ChatView'
import PixelToastContainer from './components/PixelToast'
import EasterEgg from './components/EasterEgg'
import AuthLanding from './components/AuthLanding'
import BannedScreen from './components/BannedScreen'
import PixelAvatar from './components/PixelAvatar'
import AvatarWithFrame from './components/AvatarWithFrame'
import AvatarUploadModal from './components/AvatarUploadModal'
import AttendanceModal from './components/AttendanceModal'
import NotificationPermissionModal from './components/NotificationPermissionModal'
import { upsertUser, getUser, uploadUserAvatar, subscribeToUserRelationships, subscribeToUserChats } from './lib/social'
import { isUserAdmin } from './lib/admin'
import { getCurrentUser, saveSession, logoutUser, verifyBanStatus } from './lib/auth'
import { canCheckInToday } from './lib/attendance'
import { loadMarkedDates, predictNextPeriod, toDateStr } from './utils/cycle'
import { applyTheme, getSavedTheme } from './utils/theme'
import { playCuteTing } from './utils/sound'
import { useSharedCycleStatus } from './hooks/useSharedCycleStatus'
import { useDynamicFavicon } from './hooks/useDynamicFavicon'
import { requestNotificationPermission } from './lib/push'
import s from './App.module.css'

export default function App() {
  // Session initialization
  const [user, setUser] = useState(() => getCurrentUser())
  const isAdmin = isUserAdmin(user)

  // ── Dynamic Animated Favicon (Wolf for Admin, Bunny/Bear for Users, Split for Guest) ──
  useDynamicFavicon(user)

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const hasAutoOpenedAttendanceRef = useRef(false)

  // Cute Prompt for Push Notification Permission if not yet decided
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id && 'Notification' in window) {
      const dismissed = sessionStorage.getItem('minediary:dismiss_notif_modal')
      if (Notification.permission === 'default' && !dismissed) {
        const timer = setTimeout(() => {
          setIsNotifModalOpen(true)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [user?.id])

  // Auto-prompt attendance modal on first boot/login if today is unclaimed (Regular Users only)
  useEffect(() => {
    if (user?.id && !hasAutoOpenedAttendanceRef.current && !isAdmin) {
      hasAutoOpenedAttendanceRef.current = true
      if (canCheckInToday(user)) {
        setIsAttendanceModalOpen(true)
      }
    }
  }, [user?.id, isAdmin])

  // Apply saved theme on boot & user change
  useEffect(() => {
    const themeToApply = user?.theme || getSavedTheme()
    applyTheme(themeToApply)
  }, [user?.id, user?.theme])
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        return 'admin'
      }
      if (window.location.hash === '#chat') return 'chat'
      if (window.location.hash === '#health') return 'health'
      if (window.location.hash === '#partner-cycle') return 'partner_cycle'
    }
    return 'diary'
  })

  // ── Global Real-time Shared Cycle Status for Navbar Synchronization ──────────
  const { hasSharedCycleAccess, partnerUser } = useSharedCycleStatus(user)

  // ── Web Push Notification (FCM) Permission & Token Registration ─────────
  useEffect(() => {
    if (user?.id && 'Notification' in window) {
      // If permission is already granted or requested, register SW & FCM token
      if (Notification.permission === 'granted') {
        requestNotificationPermission(user).catch(console.warn)
      }
    }
  }, [user?.id])

  // ── Compute Allowed Navigation Tabs based on Gender & Real-time Cycle Sharing ──
  const isFemale = user?.gender === 'female' || !user?.gender

  const navTabs = useMemo(() => {
    const tabs = [
      { id: 'diary', label: 'Nhật ký chung', icon: '📖' },
    ]

    // Own Health tab (For Female user)
    if (isFemale) {
      tabs.push({ id: 'health', label: 'Sức khỏe', icon: '🌸' })
    }

    // Partner Cycle tab (Unlocked in Real-Time for ANY user when partner shared cycle data)
    if (hasSharedCycleAccess) {
      tabs.push({ id: 'partner_cycle', label: 'Theo dõi chu kỳ', icon: '💖' })
    }

    // Chat tab (Always present)
    tabs.push({ id: 'chat', label: 'Tin nhắn', icon: '💬' })

    // Admin tab
    if (isAdmin) {
      tabs.push({ id: 'admin', label: 'Quản trị', icon: '🛡️' })
    }

    return tabs
  }, [isFemale, hasSharedCycleAccess, isAdmin])

  // If current active tab is not in allowed tabs, automatically switch to 'diary'
  useEffect(() => {
    if (!navTabs.some((t) => t.id === currentTab)) {
      setCurrentTab('diary')
    }
  }, [navTabs, currentTab])

  // ── iOS Glass Sliding Tab Indicator State ───────────────────────────────
  const navRef = useRef(null)
  const tabRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useEffect(() => {
    let animId = null
    const updateIndicator = () => {
      animId = requestAnimationFrame(() => {
        const activeEl = tabRefs.current[currentTab]
        const navEl = navRef.current
        if (activeEl && navEl) {
          const navRect = navEl.getBoundingClientRect()
          const activeRect = activeEl.getBoundingClientRect()
          setIndicatorStyle({
            left: activeRect.left - navRect.left,
            width: activeRect.width,
            opacity: 1,
          })
        }
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [currentTab, navTabs])

  // ── URL & History Listener ───────────────────────────────────────────────
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentTab('admin')
      } else if (window.location.hash === '#chat') {
        setCurrentTab('chat')
      } else if (window.location.hash === '#health') {
        setCurrentTab('health')
      } else if (window.location.hash === '#partner-cycle') {
        setCurrentTab('partner_cycle')
      } else {
        setCurrentTab('diary')
      }
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const switchTab = (tab) => {
    setCurrentTab(tab)
    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin')
    } else if (tab === 'chat') {
      window.history.pushState({}, '', '#chat')
    } else if (tab === 'health') {
      window.history.pushState({}, '', '#health')
    } else if (tab === 'partner_cycle') {
      window.history.pushState({}, '', '#partner-cycle')
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  // ── In-App Pixel Toast Notifications System ─────────────────────────────
  const [toasts, setToasts] = useState([])
  const [activeChatPartnerId, setActiveChatPartnerId] = useState(null)
  const initialChatsLoadedRef = useRef(false)
  const lastSeenMsgsRef = useRef(new Map())

  // Listen to active chat room partner ID from ChatView
  useEffect(() => {
    const handleActivePartnerChange = (e) => {
      setActiveChatPartnerId(e.detail || null)
    }
    window.addEventListener('minediary:active_chat_partner', handleActivePartnerChange)
    return () => window.removeEventListener('minediary:active_chat_partner', handleActivePartnerChange)
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setToasts([])
      initialChatsLoadedRef.current = false
      lastSeenMsgsRef.current.clear()
      return
    }

    const unsubscribe = subscribeToUserChats(user.id, (chats) => {
      if (!initialChatsLoadedRef.current) {
        // Record current chat states on initial mount to avoid spam
        chats.forEach((c) => {
          const key = `${c.chatId}_${c.lastSenderId}_${c.lastMessage}`
          lastSeenMsgsRef.current.set(c.chatId, key)
        })
        initialChatsLoadedRef.current = true
        return
      }

      // On subsequent updates, check for new messages from others
      chats.forEach((c) => {
        if (!c.lastMessage || c.lastSenderId === user.id) return
        const key = `${c.chatId}_${c.lastSenderId}_${c.lastMessage}`
        const prevKey = lastSeenMsgsRef.current.get(c.chatId)

        if (key !== prevKey) {
          lastSeenMsgsRef.current.set(c.chatId, key)

          // 🛑 Anti-spam condition: Do NOT trigger toast if currently viewing this partner's chat room!
          if (currentTab === 'chat' && activeChatPartnerId === c.partnerId) {
            return
          }

          // 🔔 Play cute 8-bit Ting sound effect
          playCuteTing()

          const isCare = c.isSystemMessage || c.lastMessageType === 'care_reminder'
          const newToast = {
            id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            senderName: c.displayName || 'Người bạn',
            avatar: c.avatar || 'bunny',
            avatarFrame: c.avatarFrame || 'none',
            text: c.lastMessage,
            type: c.lastMessageType || (isCare ? 'care_reminder' : 'text'),
            isSystemMessage: isCare,
            partnerId: c.partnerId,
            chat: c,
            createdAt: Date.now(),
          }

          setToasts((prev) => [newToast, ...prev.slice(0, 3)])
        }
      })
    })

    return () => unsubscribe()
  }, [user?.id, currentTab, activeChatPartnerId])

  const handleDismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const handleToastClick = (toast) => {
    switchTab('chat')
    window.dispatchEvent(
      new CustomEvent('minediary:open_chat', {
        detail: {
          partnerId: toast.partnerId,
          displayName: toast.senderName,
          avatar: toast.avatar,
          avatarFrame: toast.avatarFrame,
          status: toast.chat?.status || 'accepted',
        },
      })
    )
  }

  // ── Background Service (Cron) for Notifications ──────────────────────────
  useEffect(() => {
    if (!user?.id) return

    const checkNotifications = () => {
      try {
        if (!('Notification' in window) || Notification.permission !== 'granted') return

        const today = new Date()
        const todayStr = toDateStr(today)
        
        // 1. Nhắc nhở sắp đến kỳ kinh (trước 2 ngày)
        const lastPeriodNotif = localStorage.getItem(`minediary:notif:period:${user.id}`)
        if (lastPeriodNotif !== todayStr) {
          const marks = loadMarkedDates(user.id)
          const prediction = predictNextPeriod(marks, user.id)
          if (prediction && prediction.predictedStart) {
            const diffDays = Math.round((prediction.predictedStart - today) / 86_400_000)
            if (diffDays === 2) {
              new Notification('Sắp đến kỳ kinh nguyệt 🌸', {
                body: 'Kỳ kinh tiếp theo của bạn dự kiến sẽ bắt đầu trong 2 ngày nữa. Hãy chuẩn bị nhé!',
              })
              localStorage.setItem(`minediary:notif:period:${user.id}`, todayStr)
            }
          }
        }
      } catch (e) {
        console.warn('Background notification check warning:', e)
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 3600_000)
    return () => clearInterval(interval)
  }, [user?.id])

  // ── Google 1-Click Login ───────────────────────────────────────────────────
  const login = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const profile = await res.json()
      
      // Check if this Google user is banned in database
      const existingUser = await getUser(profile.sub)
      if (existingUser?.isBanned) {
        alert(`Tài khoản Google này đã bị cấm.\nLý do: "${existingUser.banReason || 'Vi phạm điều khoản cộng đồng'}"`)
        return
      }

      const u = {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        avatar: existingUser?.avatar || 'sakura',
        isAdmin: existingUser?.isAdmin || false,
      }
      saveSession(u)
      setUser(u)
      upsertUser(u).catch(console.error)
    },
    onError: err => console.error('Login failed:', err),
  })

  // ── Avatar Upload & Theme Modal State ─────────────────────────────────────
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const handleUpdateAvatar = async (newAvatarData, newFrameId = 'none', newTheme = null) => {
    if (!user?.id) return
    try {
      if (newTheme) {
        applyTheme(newTheme)
      }
      // 1. Optimistic UI update for instant feedback
      const updatedUser = {
        ...user,
        avatar: newAvatarData,
        avatarFrame: newFrameId,
        theme: newTheme || user.theme || getSavedTheme(),
      }
      setUser(updatedUser)
      saveSession(updatedUser)

      // 2. Cloud Storage upload & Database sync
      const finalAvatarUrl = await uploadUserAvatar(user.id, newAvatarData, newFrameId)

      // 3. Update theme in Firestore users collection
      if (newTheme) {
        updateDoc(doc(db, 'users', user.id), {
          theme: newTheme,
        }).catch(console.error)
      }

      if (finalAvatarUrl && (finalAvatarUrl !== newAvatarData || user.avatarFrame !== newFrameId)) {
        const persistedUser = {
          ...user,
          avatar: finalAvatarUrl,
          avatarFrame: newFrameId,
          theme: newTheme || user.theme || getSavedTheme(),
        }
        setUser(persistedUser)
        saveSession(persistedUser)
      }
    } catch (err) {
      console.error('Failed to update avatar, frame, and theme:', err)
    }
  }

  // ── Realtime User Profile, VIP, Attendance & Ban Security Guard (Firestore onSnapshot) ──
  const [banStatus, setBanStatus] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      setBanStatus(null)
      return
    }

    const userDocRef = doc(db, 'users', user.id)
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (!snap.exists()) return

      const data = snap.data()

      // 1. Realtime User VIP, Attendance, Frame & Profile Synchronization
      setUser((prev) => {
        if (!prev) return prev
        const newVipTier = data.vipTier || prev.vipTier || 'normal'
        const newFrame = data.avatarFrame || data.frame || prev.avatarFrame || 'none'
        const newAttendance = data.attendance || prev.attendance || { streak: 0, lastCheckInDate: null, claimedDays: [] }
        const newAvatar = data.avatar || prev.avatar || 'bunny'
        const newDisplayName = data.displayName || data.name || prev.displayName
        const newPredictionMode = data.predictionMode || prev.predictionMode || 'standard'
        const newRole = (data.role === 'admin' || snap.id.toLowerCase() === 'adminserver') ? 'admin' : (data.role || prev.role || 'user')
        const newIsAdmin = newRole === 'admin' || data.isAdmin === true

        // Only update if state has genuinely changed
        if (
          prev.vipTier !== newVipTier ||
          prev.avatarFrame !== newFrame ||
          prev.displayName !== newDisplayName ||
          prev.avatar !== newAvatar ||
          prev.predictionMode !== newPredictionMode ||
          prev.role !== newRole ||
          prev.isAdmin !== newIsAdmin ||
          JSON.stringify(prev.attendance) !== JSON.stringify(newAttendance)
        ) {
          const updatedUser = {
            ...prev,
            vipTier: newVipTier,
            avatarFrame: newFrame,
            attendance: newAttendance,
            avatar: newAvatar,
            displayName: newDisplayName,
            name: newDisplayName,
            predictionMode: newPredictionMode,
            role: newRole,
            isAdmin: newIsAdmin,
          }
          saveSession(updatedUser)
          return updatedUser
        }
        return prev
      })

      // 2. Ban Status Guard
      if (data.isBanned) {
        let isStillBanned = true
        let banUntilDate = null

        if (data.banUntil) {
          banUntilDate = data.banUntil.toDate ? data.banUntil.toDate() : new Date(data.banUntil)
          if (new Date() >= banUntilDate) {
            isStillBanned = false // Ban expired
          }
        }

        if (isStillBanned) {
          setBanStatus({
            isBanned: true,
            userId: snap.id,
            banReason: data.banReason || 'Vi phạm điều khoản cộng đồng',
            banUntilDate,
            appeal: data.appeal || null,
          })
        } else {
          setBanStatus(null)
        }
      } else {
        setBanStatus(null)
      }
    }, (err) => {
      console.warn('[Realtime Sync Guard] Listener error:', err)
    })

    return () => unsubscribe()
  }, [user?.id])

  const handleSafeLogout = () => {
    logoutUser()
    setUser(null)
    setBanStatus(null)
    window.history.pushState({}, '', '/')
  }

  // ── Unauthenticated / Landing Page ────────────────────────────────────────
  if (!user) {
    return (
      <AuthLanding
        onAuthSuccess={(loggedInUser) => {
          setBanStatus(null)
          setUser(loggedInUser)
        }}
        onGoogleLogin={() => login()}
      />
    )
  }

  // ── Full-Screen Banned Screen Guard (Conditional Rendering Shield) ────────
  if (banStatus?.isBanned) {
    return (
      <BannedScreen
        banDetails={banStatus}
        onLogout={handleSafeLogout}
      />
    )
  }

  // ── Admin Dashboard View (when on /admin) ─────────────────────────────────
  if (currentTab === 'admin') {
    return (
      <AdminDashboard
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated)
          saveSession(updated)
        }}
        onBack={() => switchTab('diary')}
      />
    )
  }

  // ── Main Authenticated App ────────────────────────────────────────────────
  return (
    <div className={s.app}>

      {/* Header */}
      <header className={s.header}>
        {/* Top Row: Logo & User Actions (Full width on Mobile, Flex on Desktop) */}
        <div className={s.headerTopRow}>
          <div className={s.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="6" y="4" width="20" height="24" rx="2" fill="#FFD0E3"/>
              <rect x="6" y="4" width="4" height="24" fill="#FFB7C5"/>
              <rect x="12" y="9" width="10" height="2" fill="#FF8FAB"/>
              <rect x="12" y="13" width="10" height="2" fill="#FF8FAB"/>
              <rect x="12" y="17" width="7" height="2" fill="#FF8FAB"/>
              <rect x="22" y="2" width="2" height="2" fill="#FFE99A"/>
              <rect x="20" y="4" width="2" height="2" fill="#FFE99A"/>
              <rect x="24" y="4" width="2" height="2" fill="#FFE99A"/>
              <rect x="22" y="6" width="2" height="2" fill="#FFE99A"/>
            </svg>
            <span className={s.logoTitle}>Mine<span>Diary</span></span>
          </div>

          {/* User Profile & Logout */}
          <div className={s.headerActions}>
            {/* 30-Day VIP Attendance Button (Not for Admin) */}
            {!isAdmin && (
              <button
                type="button"
                className={s.attendanceHeaderBtn}
                onClick={() => setIsAttendanceModalOpen(true)}
                title="Mở Lộ Trình 30 Ngày Điểm Danh Nhận VIP"
              >
                <span className={s.giftIcon}>🎁</span>
                <span className={s.attendanceBtnText}>Điểm Danh VIP</span>
                {canCheckInToday(user) && <span className={s.redDotBadge} />}
              </button>
            )}

            {(() => {
              const activeFrameId = user.avatarFrame || user.frame || (user.vipTier === 'god' ? 'god_cosmic' : user.vipTier === 'sssvip' ? 'vip10_thunder' : user.vipTier === 'ssvip' ? 'vip9_frost' : user.vipTier === 'svip' ? 'vip8_fire' : 'none')

              return (
                <div className={`${s.userProfileBadge} ${s[`badge_frame_${activeFrameId}`] || ''}`}>
                  <div
                    className={s.avatarWrapper}
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Nhấn để đổi avatar và giao diện cá nhân"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsAvatarModalOpen(true)
                      }
                    }}
                  >
                    <AvatarWithFrame
                      avatarUrl={user.avatar || 'bunny'}
                      frameId={activeFrameId}
                      size="sm"
                      border={false}
                    />
                  </div>
                  <div className={s.userInfoColumn}>
                    <span className={s.userDisplayName} title={user.displayName || user.name || user.username || user.id}>
                      {user.displayName || user.name || user.username || user.id}
                    </span>
                    <span className={s.userUidText} title={`UID: ${user.id}`}>
                      {user.id ? (user.id.startsWith('#') ? user.id : `#${user.id}`) : '#Guest'}
                    </span>
                  </div>
                </div>
              )
            })()}
            <button
              className={s.logoutBtn}
              onClick={() => {
                logoutUser()
                setUser(null)
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Navigation Bar Row (Row 2 on Mobile, Centered on Desktop) */}
        <div className={s.headerNavRow}>
          <div ref={navRef} className={s.navBar} role="navigation" aria-label="Main Navigation">
            {/* iOS Sliding Indicator Pill */}
            <div
              className={s.slidingIndicator}
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {navTabs.map((t) => (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[t.id] = el }}
                className={`${s.navBtn} ${currentTab === t.id ? s.active : ''}`}
                onClick={() => switchTab(t.id)}
                aria-current={currentTab === t.id ? 'page' : undefined}
              >
                <span className={s.navIcon}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Layout Area with Page Transition Fade-In */}
      <main key={currentTab} className={s.main}>
        {currentTab === 'diary' && <DiaryView user={user} />}
        {currentTab === 'health' && <HealthView user={user} />}
        {currentTab === 'partner_cycle' && <PartnerCycleView user={user} />}
        {currentTab === 'chat' && <ChatView user={user} />}
        {currentTab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      {/* Author Dedication Easter Egg (Bottom Left) */}
      <EasterEgg />

      {/* In-App Pixel Toast Notifications */}
      <PixelToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onToastClick={handleToastClick}
      />

      {/* Avatar Upload, Pixel Art & Theme Modal */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          user={user}
          currentAvatar={user.avatar || 'bunny'}
          currentFrame={user.avatarFrame || user.frame || 'none'}
          currentTheme={user.theme || getSavedTheme()}
          onSave={handleUpdateAvatar}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}

      {/* 30-Day VIP Attendance Modal (Regular Users only) */}
      {isAttendanceModalOpen && user && !isAdmin && (
        <AttendanceModal
          user={user}
          onUpdateUser={(updated) => {
            setUser(updated)
            saveSession(updated)
          }}
          onClose={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {/* Cute Push Notification Permission Prompt Modal */}
      {isNotifModalOpen && user && (
        <NotificationPermissionModal
          user={user}
          onClose={() => setIsNotifModalOpen(false)}
          onPermissionGranted={(token) => {
            console.log('[App] Push token registered:', token)
          }}
        />
      )}
    </div>
  )
}
