import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from './lib/firebase'
import DiaryView from './components/DiaryView'
import HealthView from './components/HealthView'
import AdminDashboard from './components/AdminDashboard'
import ChatView from './components/ChatView'
import EasterEgg from './components/EasterEgg'
import AuthLanding from './components/AuthLanding'
import BannedScreen from './components/BannedScreen'
import PixelAvatar from './components/PixelAvatar'
import AvatarWithFrame from './components/AvatarWithFrame'
import AvatarUploadModal from './components/AvatarUploadModal'
import { upsertUser, getUser, uploadUserAvatar } from './lib/social'
import { isUserAdmin } from './lib/admin'
import { getCurrentUser, saveSession, logoutUser, verifyBanStatus } from './lib/auth'
import { loadMarkedDates, predictNextPeriod, toDateStr } from './utils/cycle'
import { applyTheme, getSavedTheme } from './utils/theme'
import s from './App.module.css'

export default function App() {
  // Session initialization
  const [user, setUser] = useState(() => getCurrentUser())

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
    }
    return 'diary'
  })

  const isAdmin = isUserAdmin(user)

  // ── iOS Glass Sliding Tab Indicator State ───────────────────────────────
  const navRef = useRef(null)
  const tabRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useLayoutEffect(() => {
    const updateIndicator = () => {
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
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [currentTab, isAdmin])

  // ── URL & History Listener ───────────────────────────────────────────────
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentTab('admin')
      } else if (window.location.hash === '#chat') {
        setCurrentTab('chat')
      } else if (window.location.hash === '#health') {
        setCurrentTab('health')
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
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  // ── Background Service (Cron) for Notifications ──────────────────────────
  useEffect(() => {
    if (!user) return

    const checkNotifications = async () => {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') return
      }

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

      // 2. Nhắc nhở uống thuốc hàng ngày
      const lastPillNotif = localStorage.getItem(`minediary:notif:pill:${user.id}`)
      if (lastPillNotif !== todayStr) {
        new Notification('Đừng quên uống thuốc nhé! 💊', {
          body: 'Đã đến giờ uống thuốc hàng ngày của bạn rồi đó.',
        })
        localStorage.setItem(`minediary:notif:pill:${user.id}`, todayStr)
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 3600_000)
    return () => clearInterval(interval)
  }, [user])

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

  // ── Realtime Ban Security Guard (Firestore onSnapshot) ───────────────────
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
      console.warn('[Ban Guard] Listener error:', err)
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
            <div className={s.userProfileBadge}>
              <div
                className={s.avatarWrapper}
                onClick={() => setIsAvatarModalOpen(true)}
                title="Nhấn để đổi avatar cá nhân"
              >
                <AvatarWithFrame
                  avatarUrl={user.avatar || 'bunny'}
                  frameId={user.avatarFrame || user.frame || 'none'}
                  size="sm"
                  border={false}
                />
                <button
                  type="button"
                  className={s.avatarEditBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAvatarModalOpen(true)
                  }}
                  title="Đổi avatar cá nhân"
                  aria-label="Đổi avatar cá nhân"
                >
                  📷
                </button>
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

            <button
              ref={(el) => { tabRefs.current['diary'] = el }}
              className={`${s.navBtn} ${currentTab === 'diary' ? s.active : ''}`}
              onClick={() => switchTab('diary')}
              aria-current={currentTab === 'diary' ? 'page' : undefined}
            >
              <span className={s.navIcon}>📖</span> Nhật ký chung
            </button>
            <button
              ref={(el) => { tabRefs.current['health'] = el }}
              className={`${s.navBtn} ${currentTab === 'health' ? s.active : ''}`}
              onClick={() => switchTab('health')}
              aria-current={currentTab === 'health' ? 'page' : undefined}
            >
              <span className={s.navIcon}>🌸</span> Sức khỏe
            </button>
            <button
              ref={(el) => { tabRefs.current['chat'] = el }}
              className={`${s.navBtn} ${currentTab === 'chat' ? s.active : ''}`}
              onClick={() => switchTab('chat')}
              aria-current={currentTab === 'chat' ? 'page' : undefined}
            >
              <span className={s.navIcon}>💬</span> Tin nhắn
            </button>

            {/* Admin Navigation Button (Visible only to Admin accounts) */}
            {isAdmin && (
              <button
                ref={(el) => { tabRefs.current['admin'] = el }}
                className={`${s.navBtn} ${currentTab === 'admin' ? s.active : ''}`}
                onClick={() => switchTab('admin')}
                aria-current={currentTab === 'admin' ? 'page' : undefined}
              >
                <span className={s.navIcon}>🛡️</span> Quản trị
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Area with Page Transition Fade-In */}
      <main key={currentTab} className={s.main}>
        {currentTab === 'diary' && <DiaryView user={user} />}
        {currentTab === 'health' && <HealthView user={user} />}
        {currentTab === 'chat' && <ChatView user={user} />}
        {currentTab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      {/* Author Dedication Easter Egg (Bottom Left) */}
      <EasterEgg />

      {/* Avatar Upload, Pixel Art & Theme Modal */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          currentAvatar={user.avatar || 'bunny'}
          currentFrame={user.avatarFrame || user.frame || 'none'}
          currentTheme={user.theme || getSavedTheme()}
          onSave={handleUpdateAvatar}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}
    </div>
  )
}
