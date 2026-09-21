import React, { useState, useEffect, useMemo } from 'react'
import PixelAvatar from './PixelAvatar'
import InkIcon from './admin/InkIcon'
import InkMistCanvas from './admin/InkMistCanvas'
import {
  isUserAdmin,
  isProtectedUser,
  fetchAllUsers,
  subscribeToAllUsers,
  banUser,
  unbanUser,
  approveBanAppeal,
  rejectBanAppeal,
  resetUserPassword,
  deleteUserAccount,
  updateUserVipTier,
  updateUserFertilityPermission,
  sanitizeAdminAccount,
} from '../lib/admin'
import { VIP_TIERS, getUserVipTier } from '../utils/vipTiers'
import { formatUserActivityStatus } from '../lib/auth'
import s from './AdminDashboard.module.css'

function formatDate(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatFullTime(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatBanUntil(banUntil) {
  if (!banUntil) return 'Vĩnh viễn Cửu U'
  const d = banUntil instanceof Date ? banUntil : new Date(banUntil)
  if (isNaN(d.getTime())) return 'Vĩnh viễn Cửu U'
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboard({ user, onUpdateUser, onBack, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'online' | 'active' | 'banned' | 'appeals'

  // Ban Modal States
  const [banModalUser, setBanModalUser] = useState(null)
  const [banDuration, setBanDuration] = useState('7') // '1' | '3' | '7' | '30' | '-1' | 'custom_days' | 'datetime'
  const [customDaysInput, setCustomDaysInput] = useState('14')
  const [customDateTimeInput, setCustomDateTimeInput] = useState('')
  const [banReason, setBanReason] = useState('')

  // Appeal Modal States
  const [appealModalUser, setAppealModalUser] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  // See All / Detail Modal States
  const [detailModalUser, setDetailModalUser] = useState(null)
  const [newPassInput, setNewPassInput] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Dedicated VIP Management Modal States
  const [vipModalUser, setVipModalUser] = useState(null)
  const [selectedVipTier, setSelectedVipTier] = useState('normal')
  const [vipModalSuccess, setVipModalSuccess] = useState('')

  // Super Admin command state
  const [superAdminCmd, setSuperAdminCmd] = useState('')
  const [superAdminUnlocked, setSuperAdminUnlocked] = useState(false)
  const [superAdminError, setSuperAdminError] = useState('')
  const [targetVipTier, setTargetVipTier] = useState('normal')
  const [vipUpdateSuccess, setVipUpdateSuccess] = useState('')
  const [firestoreError, setFirestoreError] = useState(null)
  const [copiedRules, setCopiedRules] = useState(false)

  const isAdmin = isUserAdmin(user)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchAllUsers()
      setUsers(data)
      setFirestoreError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setFirestoreError(err?.code || err?.message || 'permission-denied')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Real-time live synchronization of all app accounts
  useEffect(() => {
    if (!isAdmin) return
    // Purge legacy adminserver document from database if present
    deleteUserAccount('adminserver').catch(() => {})
    // Ensure admin avatar and frame are reset to default
    sanitizeAdminAccount().catch(() => {})

    setLoading(true)
    const unsub = subscribeToAllUsers(
      (data) => {
        setUsers(data)
        setLoading(false)
        setFirestoreError(null)
      },
      (err) => {
        console.error('Realtime users subscription fallback to loadData:', err)
        setFirestoreError(err?.code || err?.message || 'permission-denied')
        loadData()
      }
    )
    return () => unsub?.()
  }, [isAdmin])

  // Auto-reload when switching back from Firebase Console tab
  useEffect(() => {
    const handleFocus = () => {
      if (firestoreError && isAdmin) {
        loadData()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [firestoreError, isAdmin])

  // Metrics computation
  const metrics = useMemo(() => {
    const validUsers = users.filter((u) => u && u.id !== 'adminserver' && u.username !== 'adminserver')
    const total = validUsers.length
    const banned = validUsers.filter((u) => u.isBanned).length
    const appeals = validUsers.filter((u) => u.appeal?.status === 'pending').length
    const online = validUsers.filter((u) => {
      if (!u.lastActiveAtDate) return false
      return (Date.now() - u.lastActiveAtDate.getTime()) < 3 * 60 * 1000
    }).length
    const active = total - banned
    return { total, active, banned, appeals, online }
  }, [users])

  // Filtered users list
  const filteredUsers = useMemo(() => {
    const queryTerm = (search || '').trim().toLowerCase().replace(/^#/, '')

    return users.filter((u) => {
      if (!u || u.id === 'adminserver' || u.username === 'adminserver') return false

      if (queryTerm) {
        const uid = (u.id || u.uid || '').toLowerCase()
        const displayName = (u.displayName || u.name || '').toLowerCase()
        const username = (u.username || '').toLowerCase()
        const email = (u.email || '').toLowerCase()
        const ip = (u.lastLoginIp || '').toLowerCase()
        const device = (u.lastDevice || '').toLowerCase()

        const matchSearch =
          uid.includes(queryTerm) ||
          displayName.includes(queryTerm) ||
          username.includes(queryTerm) ||
          email.includes(queryTerm) ||
          ip.includes(queryTerm) ||
          device.includes(queryTerm)

        if (!matchSearch) return false
      }

      if (statusFilter === 'online') {
        if (!u.lastActiveAtDate) return false
        return (Date.now() - u.lastActiveAtDate.getTime()) < 3 * 60 * 1000
      }
      if (statusFilter === 'active') return !u.isBanned
      if (statusFilter === 'banned') return Boolean(u.isBanned)
      if (statusFilter === 'appeals') return u.appeal?.status === 'pending'
      return true
    })
  }, [users, search, statusFilter])

  // Handle Ban Submit
  const handleConfirmBan = async (e) => {
    e.preventDefault()
    if (!banModalUser) return

    setActionLoading(true)
    try {
      let durationDays = 7
      let customBanUntil = null

      if (banDuration === 'custom_days') {
        durationDays = Number(customDaysInput) || 1
      } else if (banDuration === 'datetime') {
        if (!customDateTimeInput) {
          alert('Vui lòng chọn ngày và giờ hết hạn cụ thể!')
          setActionLoading(false)
          return
        }
        customBanUntil = customDateTimeInput
        durationDays = 0
      } else {
        durationDays = Number(banDuration)
      }

      await banUser({
        userId: banModalUser.id,
        durationDays,
        customBanUntil,
        reason: banReason,
      })

      setBanModalUser(null)
      setBanReason('')
      await loadData()
    } catch (err) {
      console.error('Ban user error:', err)
      alert('Không thể thực hiện phong ấn tài khoản!')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Unban
  const handleUnban = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Phá giải phong ấn Cửu U cho tu sĩ ${targetUser.displayName || targetUser.id}?`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await unbanUser(targetUser.id)
      await loadData()
    } catch (err) {
      console.error('Unban error:', err)
      alert('Lỗi khi giải trừ phong ấn.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Approve Ban Appeal
  const handleApproveAppeal = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Chấp thuận sớ khiếu nại và lập tức phá giải phong ấn cho ${targetUser.displayName || targetUser.id}?`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await approveBanAppeal(targetUser.id)
      setAppealModalUser(null)
      await loadData()
    } catch (err) {
      console.error('Approve appeal error:', err)
      alert('Lỗi khi duyệt sớ khiếu nại.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Reject Ban Appeal
  const handleRejectAppeal = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Bác bỏ sớ khiếu nại của ${targetUser.displayName || targetUser.id}? Tiếp tục duy trì trấn áp Cửu U.`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await rejectBanAppeal(targetUser.id, rejectNote)
      setAppealModalUser(null)
      setRejectNote('')
      await loadData()
    } catch (err) {
      console.error('Reject appeal error:', err)
      alert('Lỗi khi từ chối sớ khiếu nại.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete User Account (Strict protection for supreme admin)
  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return
    if (isProtectedUser(targetUser)) {
      alert('👑 Tài khoản Đại Thừa Đạo Tổ là Bất tử, không thể bị xóa hoặc hạn chế!')
      return
    }

    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO THIÊN KIẾP:\nBạn có chắc chắn muốn TRỪ DIỆT VĨNH VIỄN tài khoản "${targetUser.displayName || targetUser.username || targetUser.id}" (#${targetUser.id}) không?\nHành động này thiêu hủy hoàn toàn thần hồn, không thể hoàn tác!`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await deleteUserAccount(targetUser.id)
      setDetailModalUser(null)
      await loadData()
      alert(`✓ Đã trừ diệt vĩnh viễn tài khoản #${targetUser.id} thành công!`)
    } catch (err) {
      console.error('Delete user error:', err)
      alert(`Lỗi khi xóa tài khoản: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Password Reset by Admin
  const handleAdminResetPassword = async (e) => {
    e.preventDefault()
    if (!detailModalUser || !newPassInput.trim()) return

    setActionLoading(true)
    setResetSuccess('')
    try {
      await resetUserPassword(detailModalUser.id, newPassInput.trim())
      setResetSuccess(`✓ Tẩy tủy hoán cốt thành công! Mật pháp mới: "${newPassInput.trim()}"`)
      setNewPassInput('')
      await loadData()
    } catch (err) {
      console.error('Reset password error:', err)
      alert('Lỗi khi tái lập mật pháp.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle VIP Tier Update by Admin
  const handleUpdateVipTier = async (e) => {
    e.preventDefault()
    if (!detailModalUser) return
    setActionLoading(true)
    setVipUpdateSuccess('')
    try {
      await updateUserVipTier(detailModalUser.id, targetVipTier)
      setVipUpdateSuccess(`✓ Đã thăng hoa cảnh giới tu vi thành: "${VIP_TIERS[targetVipTier]?.name || targetVipTier}"`)
      setDetailModalUser((prev) => ({ ...prev, vipTier: targetVipTier }))
      if (user?.id === detailModalUser.id) {
        onUpdateUser?.({
          ...user,
          vipTier: targetVipTier,
          avatarFrame: VIP_TIERS[targetVipTier]?.frameId || user.avatarFrame,
        })
      }
      await loadData()
    } catch (err) {
      console.error('Update VIP error:', err)
      alert('Lỗi khi cập nhật cảnh giới tu vi.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Quick VIP Tier Update from dedicated VIP Modal
  const handleConfirmVipUpdate = async (e) => {
    e.preventDefault()
    if (!vipModalUser) return
    setActionLoading(true)
    setVipModalSuccess('')
    try {
      await updateUserVipTier(vipModalUser.id, selectedVipTier)
      const tierName = VIP_TIERS[selectedVipTier]?.name || selectedVipTier
      setVipModalSuccess(`✓ Đã ban tặng cảnh giới "${tierName}" thành công!`)
      setUsers((prev) =>
        prev.map((u) => (u.id === vipModalUser.id ? { ...u, vipTier: selectedVipTier } : u))
      )
      setVipModalUser((prev) => (prev ? { ...prev, vipTier: selectedVipTier } : null))
      if (user?.id === vipModalUser.id) {
        onUpdateUser?.({
          ...user,
          vipTier: selectedVipTier,
          avatarFrame: VIP_TIERS[selectedVipTier]?.frameId || user.avatarFrame,
        })
      }
      setTimeout(() => {
        setVipModalUser(null)
      }, 1200)
    } catch (err) {
      console.error('Update VIP error:', err)
      alert('Lỗi khi cập nhật cảnh giới: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Super Admin Authorization Command Handler
  const handleVerifySuperAdmin = (e) => {
    e.preventDefault()
    setSuperAdminError('')
    const trimmed = superAdminCmd.trim()

    // Master authentication key
    if (trimmed === 'uy.phamchamchi@hcmut.edu.vn') {
      setSuperAdminUnlocked(true)
      setSuperAdminCmd('')
    } else {
      setSuperAdminError('Pháp lệnh không hợp lệ! Cổ Thần Chi Nhãn cự tuyệt thần niệm.')
    }
  }

  // Toggle Fertility Tracking Permission for a User
  const handleToggleFertilityPermission = async (targetUser) => {
    if (!targetUser?.id) return
    const newStatus = !targetUser.allowFertilityTracking
    setActionLoading(true)
    try {
      await updateUserFertilityPermission(targetUser.id, newStatus)
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, allowFertilityTracking: newStatus } : u))
      )
      if (detailModalUser && detailModalUser.id === targetUser.id) {
        setDetailModalUser((prev) => ({ ...prev, allowFertilityTracking: newStatus }))
      }
      if (user?.id === targetUser.id) {
        onUpdateUser?.({
          ...user,
          allowFertilityTracking: newStatus,
        })
      }
    } catch (err) {
      console.error('Failed to toggle fertility permission:', err)
      alert('Lỗi khi cập nhật quyền hạn thiên cơ: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Permission Guard
  if (!isAdmin) {
    return (
      <div className={s.adminContainer} style={{ minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <InkMistCanvas />
        <div style={{ textAlign: 'center', background: 'rgba(13, 18, 28, 0.85)', padding: 40, borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(20px)', maxWidth: 460 }}>
          <div style={{ marginBottom: 16 }}>
            <InkIcon name="ban" size={54} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: 22, color: '#f8fafc', marginBottom: 10 }}>Truy Cập Bị Từ Chối</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Thần thức của bạn chưa đạt cảnh giới Chấp Pháp Trưởng Lão hoặc Đại Thừa Đạo Tổ để chấp chưởng Thiên Đạo Trận Đồ.
          </p>
          <button type="button" className={s.backBtn} onClick={onBack}>
            ← Quay lại Nhật Ký Vạn Giới
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={s.adminContainer}>
      {/* Background Animated Xianxia Ink Wash & Qi Flow Canvas */}
      <InkMistCanvas />

      {/* Admin Top Navigation Bar */}
      <div className={s.topBar}>
        <div className={s.topBarLeft}>
          <button type="button" className={s.backBtn} onClick={onBack} title="Quay về giao diện người dùng">
            <InkIcon name="sword" size={15} color="#38bdf8" />
            <span>Thoát Xuất Tiên Giới</span>
          </button>

          <h2 className={s.dashboardTitle}>
            <InkIcon name="shield" size={24} color="#38bdf8" />
            <span className={s.titleGleam}>TIÊN NGHỊCH ĐẠO GIẢN // THIÊN ĐẠO TRẬN ĐỒ</span>
          </h2>
        </div>

        <div className={s.topBarRight}>
          <div className={s.adminBadge}>
            <div className={s.adminAvatarRing}>
              <PixelAvatar avatarId={user?.avatar || '/admin-avatar.mp4'} size={32} border={false} />
            </div>
            <span className={s.adminName}>{user?.displayName || user?.name || 'Đạo Tổ'}</span>
            <span className={s.adminPill}>ĐẠI THỪA ĐẠO TỔ</span>
          </div>

          <button
            type="button"
            className={s.logoutBtn}
            onClick={onLogout}
            title="Đăng xuất khỏi Đạo Tràng Quản Trị"
          >
            <InkIcon name="logout" size={15} color="#fca5a5" />
            <span>Thoát Đạo Tràng</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className={s.metricsGrid}>
        <div className={s.metricCard} style={{ '--metric-accent': '#38bdf8' }}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Chư Thiên Tu Sĩ</span>
            <span className={s.metricValue}>{metrics.total}</span>
          </div>
          <div className={s.metricIconWrap}>
            <InkIcon name="users" size={26} color="#38bdf8" />
          </div>
        </div>

        <div className={s.metricCard} style={{ '--metric-accent': '#34d399' }}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Thần Thức Đang Hiện</span>
            <span className={s.metricValue} style={{ color: '#34d399' }}>
              {metrics.online}
            </span>
          </div>
          <div className={s.metricIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <InkIcon name="flame" size={26} color="#34d399" />
          </div>
        </div>

        <div className={s.metricCard} style={{ '--metric-accent': '#38bdf8' }}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Đang Độ Kiếp</span>
            <span className={s.metricValue} style={{ color: '#7dd3fc' }}>
              {metrics.active}
            </span>
          </div>
          <div className={s.metricIconWrap}>
            <InkIcon name="sparkles" size={26} color="#38bdf8" />
          </div>
        </div>

        <div className={s.metricCard} style={{ '--metric-accent': '#f43f5e' }}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Cửu U Trấn Áp</span>
            <span className={s.metricValue} style={{ color: '#f43f5e' }}>
              {metrics.banned}
            </span>
          </div>
          <div className={s.metricIconWrap} style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <InkIcon name="ban" size={26} color="#f43f5e" />
          </div>
        </div>

        <div className={s.metricCard} style={{ '--metric-accent': '#f59e0b' }}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Sớ Cầu Xin Giải Phong</span>
            <span className={s.metricValue} style={{ color: '#f59e0b' }}>
              {metrics.appeals}
            </span>
          </div>
          <div className={s.metricIconWrap} style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <InkIcon name="scroll" size={26} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className={s.controlBar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>
            <InkIcon name="search" size={17} color="#64748b" />
          </span>
          <input
            type="text"
            className={s.searchInput}
            placeholder="Thần niệm tầm tung (Đạo hiệu, UID, Tọa độ IP, Pháp bảo)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={s.filterGroup}>
          <select
            className={s.statusSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Toàn Bộ Tu Sĩ ({metrics.total})</option>
            <option value="online">Thần Thức Đang Hiện ({metrics.online})</option>
            <option value="active">Đang Độ Kiếp ({metrics.active})</option>
            <option value="banned">Cửu U Trấn Áp ({metrics.banned})</option>
            <option value="appeals">Có Sớ Khiếu Nại ({metrics.appeals})</option>
          </select>

          <button
            type="button"
            className={s.refreshBtn}
            onClick={loadData}
            disabled={loading}
          >
            <InkIcon name="refresh" size={15} color="#38bdf8" />
            <span>Quét Thần Thức</span>
          </button>
        </div>
      </div>

      {/* Firestore Warning Banner if permission denied */}
      {firestoreError && (
        <div className={s.firestoreAlertCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <InkIcon name="warning" size={28} color="#f43f5e" />
            <div>
              <strong style={{ fontSize: 15, color: '#fca5a5' }}>Firestore Thiên Môn Đang Bị Khóa (PERMISSION_DENIED)</strong>
              <p style={{ fontSize: 13, color: '#fda4af', margin: '4px 0 0', lineHeight: 1.5 }}>
                Dữ liệu tu sĩ trên Google Cloud vẫn an toàn 100%. Vui lòng Publish Security Rules trên Firebase Console.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <a
              href="https://console.firebase.google.com/project/mine-diary-11279/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: 10, color: '#fff', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Mở Firebase Rules Console ↗
            </a>
            <button
              type="button"
              className={s.confirmModalBtn}
              onClick={() => {
                const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`
                navigator.clipboard.writeText(rules)
                setCopiedRules(true)
                setTimeout(() => setCopiedRules(false), 3000)
              }}
            >
              <InkIcon name={copiedRules ? 'check' : 'scroll'} size={14} />
              <span>{copiedRules ? 'Đã sao chép Rules chuẩn!' : 'Sao chép Rules Chuẩn'}</span>
            </button>
            <button
              type="button"
              className={s.refreshBtn}
              onClick={loadData}
              disabled={loading}
            >
              <InkIcon name="refresh" size={14} />
              <span>Thử Quét Lại</span>
            </button>
          </div>
        </div>
      )}

      {/* Accounts Table Card (Ink Wash Shan Shui Anti-Aliased Layout) */}
      <div className={s.tableContainer}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.colAvatar}>Linh Hoàn</th>
              <th className={s.colUserId}>Đạo Hiệu & UID</th>
              <th className={s.colDate}>Ngày Nhập Đạo</th>
              <th className={s.colStatus}>Trạng Thái Thần Thức</th>
              <th className={s.colIp}>Tọa Độ IP & Pháp Bảo</th>
              <th className={s.colSeeAll}>Thiên Cơ Giản</th>
              <th className={s.colAction}>Chấp Pháp Thiên Lệnh</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className={s.loadingBox}>
                    <InkIcon name="refresh" size={26} color="#38bdf8" />
                    <span>Đang cảm ứng thần niệm chư thiên vạn giới...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className={s.emptyBox}>
                    <InkIcon name="search" size={26} color="#64748b" />
                    <span>Không tìm thấy tu sĩ nào tương hợp với thần thức tìm kiếm.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const uVip = getUserVipTier(u)
                const act = formatUserActivityStatus(u.lastActiveAtDate)

                return (
                  <tr key={u.id}>
                    {/* Column 1: Avatar Linh Hoàn */}
                    <td className={s.colAvatar}>
                      <div className={s.userAvatarWrap}>
                        <PixelAvatar
                          avatarId={u.avatar || 'bunny'}
                          frameId={u.avatarFrame || u.frame || (u.vipTier === 'god' ? 'god_cosmic' : u.vipTier === 'sssvip' ? 'vip10_thunder' : u.vipTier === 'ssvip' ? 'vip9_frost' : u.vipTier === 'svip' ? 'vip8_fire' : 'none')}
                          size={38}
                          border={false}
                        />
                      </div>
                    </td>

                    {/* Column 2: User ID & Display Name */}
                    <td className={s.colUserId}>
                      <div className={s.userIdBlock}>
                        <div className={s.nameRow}>
                          <span className={s.userDisplayName}>
                            {u.displayName || u.username || u.id}
                          </span>
                          {u.isAdmin && (
                            <span className={s.roleAdminTag}>ĐẠO TỔ</span>
                          )}
                          <span
                            className={s.userVipBadge}
                            style={{
                              color: uVip.color,
                              background: uVip.bg,
                              border: `1px solid ${uVip.color}`,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setVipModalUser(u)
                              setSelectedVipTier(u.vipTier || (isProtectedUser(u) ? 'god' : 'normal'))
                              setVipModalSuccess('')
                            }}
                            title="Nhấn để điều chỉnh cảnh giới tu vi"
                          >
                            <InkIcon name={uVip.id === 'god' ? 'crown' : uVip.id === 'sssvip' ? 'bolt' : uVip.id === 'ssvip' ? 'gem' : uVip.id === 'svip' ? 'flame' : 'sparkles'} size={12} color={uVip.color} />
                            <span>{uVip.badge}</span>
                          </span>
                        </div>
                        <span className={s.userFullId}>#{u.id}</span>
                      </div>
                    </td>

                    {/* Column 3: Created At (Centered) */}
                    <td className={s.colDate}>
                      <span className={s.dateBadge}>{formatDate(u.createdAtDate)}</span>
                    </td>

                    {/* Column 4: Status & Activity */}
                    <td className={s.colStatus}>
                      <div className={s.statusCellWrap}>
                        {isProtectedUser(u) ? (
                          <span className={s.badgeImmune} title="Tài khoản Đại Thừa Đạo Tổ Bất Tử">
                            <InkIcon name="crown" size={13} color="#fef08a" />
                            <span>Bất Khả Xâm Phạm</span>
                          </span>
                        ) : u.isBanned ? (
                          <div className={s.badgeBanned}>
                            <span className={s.bannedMainText}>
                              <InkIcon name="ban" size={13} color="#fca5a5" />
                              <span>Trấn Áp Cửu U ({formatBanUntil(u.banUntilDate)})</span>
                            </span>
                            {u.banReason && (
                              <span className={s.banReasonNote}>
                                Tội danh: {u.banReason}
                              </span>
                            )}
                            {u.appeal?.status === 'pending' && (
                              <div className={s.badgeAppealPending}>
                                <InkIcon name="scroll" size={12} color="#fde047" />
                                <span>Có sớ xin giải phong!</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={s.badgeActive}>
                            <InkIcon name="check" size={12} color="#6ee7b7" />
                            <span>Đang Độ Kiếp</span>
                          </span>
                        )}

                        {/* Real-time Activity status (Online vs Off) */}
                        <div className={`${s.activityBadge} ${act.isOnline ? s.activityOnline : s.activityOffline}`}>
                          <span className={s.activityDot} />
                          <span>{act.text}</span>
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Device & IP */}
                    <td className={s.colIp}>
                      <div className={s.ipBlock}>
                        <span className={s.ipText} title="Tọa độ tinh vực đăng nhập">
                          <InkIcon name="globe" size={13} color="#7dd3fc" />
                          <span>{u.lastLoginIp || 'Ẩn Thân'}</span>
                        </span>
                        <span className={s.deviceText} title="Bản mệnh pháp bảo kết nối">
                          <InkIcon name="device" size={13} color="#94a3b8" />
                          <span>{u.lastDevice || 'Pháp Bảo Không Tên'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Column 6: See All (Centered) */}
                    <td className={s.colSeeAll}>
                      <button
                        type="button"
                        className={s.seeAllBtn}
                        onClick={() => {
                          setDetailModalUser(u)
                          setTargetVipTier(u.vipTier || (isProtectedUser(u) ? 'god' : 'normal'))
                          setVipUpdateSuccess('')
                          setResetSuccess('')
                          setNewPassInput('')
                          setSuperAdminUnlocked(false)
                          setSuperAdminCmd('')
                          setSuperAdminError('')
                        }}
                        title="Khai mở toàn bộ thần hồn và mật tịch"
                      >
                        <InkIcon name="eye" size={14} color="#7dd3fc" />
                        <span>Xem Thần Hồn</span>
                      </button>
                    </td>

                    {/* Column 7: Action (Centered) */}
                    <td className={s.colAction}>
                      {isProtectedUser(u) ? (
                        <div className={s.actionBtnGroup}>
                          <button
                            type="button"
                            className={s.vipActionBtn}
                            onClick={() => {
                              setVipModalUser(u)
                              setSelectedVipTier('god')
                              setVipModalSuccess('')
                            }}
                            title="Tài khoản Đạo Tổ nắm giữ Cổ Thần Đại Đạo"
                          >
                            <InkIcon name="crown" size={13} color="#fef08a" />
                            <span>Cổ Thần VIP</span>
                          </button>
                          <span className={s.protectedShieldBadge}>
                            <InkIcon name="shield" size={13} color="#fef08a" />
                            <span>Bất Tử</span>
                          </span>
                        </div>
                      ) : u.isBanned ? (
                        <div className={s.actionBtnGroup}>
                          <button
                            type="button"
                            className={s.vipActionBtn}
                            onClick={() => {
                              setVipModalUser(u)
                              setSelectedVipTier(u.vipTier || 'normal')
                              setVipModalSuccess('')
                            }}
                            title="Ban phát hoặc giáng cảnh giới tu vi"
                          >
                            <InkIcon name="crown" size={13} color="#fef08a" />
                            <span>Cảnh Giới</span>
                          </button>
                          {u.appeal?.status === 'pending' && (
                            <button
                              type="button"
                              className={s.reviewAppealBtn}
                              onClick={() => {
                                setAppealModalUser(u)
                                setRejectNote('')
                              }}
                              title="Thẩm định sớ kêu oan của tu sĩ"
                            >
                              <InkIcon name="scroll" size={13} color="#fde047" />
                              <span>Xét Sớ Oan</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className={s.unbanActionBtn}
                            onClick={() => handleUnban(u)}
                            disabled={actionLoading}
                          >
                            <InkIcon name="unlock" size={13} color="#6ee7b7" />
                            <span>Phá Giải</span>
                          </button>
                          <button
                            type="button"
                            className={s.banActionBtn}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading}
                            title="Thiêu rụi vĩnh viễn thần hồn tu sĩ"
                          >
                            <InkIcon name="close" size={13} color="#fca5a5" />
                            <span>Trừ Diệt</span>
                          </button>
                        </div>
                      ) : (
                        <div className={s.actionBtnGroup}>
                          <button
                            type="button"
                            className={s.vipActionBtn}
                            onClick={() => {
                              setVipModalUser(u)
                              setSelectedVipTier(u.vipTier || 'normal')
                              setVipModalSuccess('')
                            }}
                            title="Ban phát hoặc giáng cảnh giới tu vi"
                          >
                            <InkIcon name="crown" size={13} color="#fef08a" />
                            <span>Cảnh Giới</span>
                          </button>
                          <button
                            type="button"
                            className={s.banActionBtn}
                            onClick={() => {
                              setBanModalUser(u)
                              setBanReason('')
                              setBanDuration('7')
                              setCustomDaysInput('14')
                              setCustomDateTimeInput('')
                            }}
                            disabled={actionLoading || u.id === user?.id}
                          >
                            <InkIcon name="sword" size={13} color="#fca5a5" />
                            <span>Trấn Áp</span>
                          </button>
                          <button
                            type="button"
                            className={s.banActionBtn}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading}
                            title="Thiêu rụi vĩnh viễn thần hồn tu sĩ"
                          >
                            <InkIcon name="close" size={13} color="#fca5a5" />
                            <span>Trừ Diệt</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 1. See All / Account Details Modal (Thiên Cơ Giản) ── */}
      {detailModalUser && (
        <div className={s.modalOverlay} onClick={() => setDetailModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <InkIcon name="scroll" size={20} color="#38bdf8" />
                <span>THIÊN CƠ GIẢN // CHI TIẾT THẦN HỒN</span>
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setDetailModalUser(null)}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            {/* Target user preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: 14, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div className={s.userAvatarWrap}>
                <PixelAvatar
                  avatarId={detailModalUser.avatar || 'bunny'}
                  frameId={detailModalUser.avatarFrame || detailModalUser.frame || (detailModalUser.vipTier === 'god' ? 'god_cosmic' : detailModalUser.vipTier === 'sssvip' ? 'vip10_thunder' : detailModalUser.vipTier === 'ssvip' ? 'vip9_frost' : detailModalUser.vipTier === 'svip' ? 'vip8_fire' : 'none')}
                  size={46}
                  border={false}
                />
              </div>
              <div>
                <strong style={{ fontSize: 16, color: '#f8fafc' }}>
                  {detailModalUser.displayName || detailModalUser.id}
                </strong>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                  Linh Thức UID: #{detailModalUser.id}
                </div>
              </div>
            </div>

            {/* Detailed Account Grid */}
            <div className={s.detailGrid}>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Đạo Hiệu Đăng Nhập:</span>
                <span className={s.detailVal}>{detailModalUser.username || detailModalUser.id.split('#')[0]}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Linh Thức Email:</span>
                <span className={s.detailVal}>{detailModalUser.email || 'Chưa liên kết'}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Âm Dương Giới Tính:</span>
                <span className={s.detailVal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {detailModalUser.gender === 'male' ? (
                    <>
                      <InkIcon name="boy" size={15} color="#38bdf8" />
                      <span>Dương Tính (Nam ♂)</span>
                    </>
                  ) : detailModalUser.gender === 'female' ? (
                    <>
                      <InkIcon name="girl" size={15} color="#f472b6" />
                      <span>Âm Tính (Nữ ♀)</span>
                    </>
                  ) : (
                    'Chưa Thiết Lập'
                  )}
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Bản Mệnh Linh Khung:</span>
                <span className={s.detailVal}>
                  {detailModalUser.avatarFrame || detailModalUser.frame || 'Mặc định'}
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Tiên Lộ Điểm Danh:</span>
                <span className={s.detailVal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <InkIcon name="flame" size={14} color="#f59e0b" />
                  <span>{detailModalUser.attendanceStreak || detailModalUser.streak || 0} ngày liên tiếp</span>
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Thời Gian Khởi Tạo:</span>
                <span className={s.detailVal}>{formatFullTime(detailModalUser.createdAtDate)}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Thần Thức Hoạt Động:</span>
                <span className={s.detailVal} style={{ fontWeight: 600 }}>
                  {formatUserActivityStatus(detailModalUser.lastActiveAtDate).text}
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Lần Cuối Xuất Hiện:</span>
                <span className={s.detailVal}>
                  {formatFullTime(detailModalUser.lastActiveAtDate)}
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Tọa Độ IP Đăng Nhập:</span>
                <span className={s.detailVal} style={{ fontFamily: 'monospace', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7dd3fc' }}>
                  <InkIcon name="globe" size={13} color="#7dd3fc" />
                  <span>{detailModalUser.lastLoginIp || 'Chưa ghi nhận'}</span>
                </span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Bản Mệnh Pháp Bảo:</span>
                <span className={s.detailVal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <InkIcon name="device" size={13} color="#94a3b8" />
                  <span>{detailModalUser.lastDevice || 'Chưa ghi nhận'}</span>
                </span>
              </div>
            </div>

            {/* Super Admin Authorization Section (Cổ Thần Chi Nhãn) */}
            <div className={s.superAdminSection}>
              <div className={s.superAdminHeader}>
                <span className={s.superAdminBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <InkIcon name="eye" size={15} color="#fbbf24" />
                  <span>CỔ THẦN CHI NHÃN // GIẢI MÃ NGUYÊN BẢN</span>
                </span>
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                  Nhập mật lệnh Đạo Tổ để soi thấu chân thần và mật pháp gốc
                </span>
              </div>

              {!superAdminUnlocked ? (
                <form className={s.cmdInputGroup} onSubmit={handleVerifySuperAdmin}>
                  <input
                    type="text"
                    className={s.cmdInput}
                    placeholder="Nhập pháp lệnh truy xuất Đạo Tổ..."
                    value={superAdminCmd}
                    onChange={(e) => setSuperAdminCmd(e.target.value)}
                  />
                  <button type="submit" className={s.cmdSubmitBtn}>
                    <span>Khai Nhãn</span>
                    <InkIcon name="eye" size={14} color="#fffbeb" />
                  </button>
                </form>
              ) : (
                <div className={s.unlockedResultBox}>
                  <div className={s.unlockedBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <InkIcon name="check" size={14} color="#6ee7b7" />
                    <span>CỔ THẦN CHI NHÃN ĐÃ SOI THẤU NGUYÊN BẢN</span>
                  </div>
                  <div className={s.plainPasswordRow}>
                    <span style={{ fontSize: 12.5, color: '#94a3b8' }}>Mật Pháp Gốc:</span>
                    <span className={s.plainPasswordText}>
                      {detailModalUser.plainPassword || 'MineDiary2026@'}
                    </span>
                  </div>
                </div>
              )}

              {superAdminError && (
                <div style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                  {superAdminError}
                </div>
              )}
            </div>

            {/* Administrative Password Reset Tool (Tẩy Tủy Hoán Cốt) */}
            <div className={s.resetPassSection}>
              <span className={s.resetPassTitle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <InkIcon name="bolt" size={16} color="#38bdf8" />
                <span>Tẩy Tủy Hoán Cốt (Admin Override Password)</span>
              </span>
              <form className={s.resetPassInputRow} onSubmit={handleAdminResetPassword}>
                <input
                  type="text"
                  className={s.resetInput}
                  placeholder="Nhập mật pháp mới..."
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={s.resetBtn}
                  disabled={actionLoading || !newPassInput.trim()}
                >
                  {actionLoading ? '...' : (
                    <>
                      <span>Truyền Pháp</span>
                      <InkIcon name="key" size={14} color="#7dd3fc" />
                    </>
                  )}
                </button>
              </form>
              {resetSuccess && (
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                  {resetSuccess}
                </span>
              )}
            </div>

            {/* Account Protection / Delete User Section */}
            {isProtectedUser(detailModalUser) ? (
              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 12, padding: '12px 16px', color: '#fef08a', fontSize: 12.5, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                <InkIcon name="crown" size={18} color="#fef08a" />
                <span>Tài khoản Đại Thừa Đạo Tổ là Bất Tử. Được quy tắc thiên địa che chở vĩnh hằng!</span>
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InkIcon name="close" size={15} color="#ef4444" />
                    <span>Trừ Diệt Vĩnh Viễn Thần Hồn</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    Xóa hoàn toàn tài khoản này khỏi cơ sở dữ liệu thiên địa.
                  </div>
                </div>
                <button
                  type="button"
                  className={s.confirmModalDangerBtn}
                  onClick={() => handleDeleteUser(detailModalUser)}
                  disabled={actionLoading}
                >
                  <span>Xác Nhận Trừ Diệt</span>
                  <InkIcon name="close" size={14} color="#ffffff" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Ban Account Modal (Trấn Áp Hồn Phách) ── */}
      {banModalUser && (
        <div className={s.modalOverlay} onClick={() => setBanModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle} style={{ color: '#fca5a5' }}>
                <InkIcon name="sword" size={20} color="#f43f5e" />
                <span>TRẤN ÁP HỒN PHÁCH // THIÊN PHẠT</span>
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setBanModalUser(null)}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            {/* Target user preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div className={s.userAvatarWrap}>
                <PixelAvatar avatarId={banModalUser.avatar || 'bunny'} size={38} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#f8fafc' }}>
                  {banModalUser.displayName || banModalUser.id}
                </strong>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                  UID: #{banModalUser.id}
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmBan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Thời Gian Trấn Áp</label>
                <select
                  className={s.statusSelect}
                  style={{ width: '100%' }}
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                >
                  <option value="1">1 Ngày (24 giờ tịch diệt)</option>
                  <option value="3">3 Ngày</option>
                  <option value="7">7 Ngày (1 Tuần bế môn)</option>
                  <option value="30">30 Ngày (1 Tháng)</option>
                  <option value="custom_days">Tự Nhập Số Ngày Tùy Ý</option>
                  <option value="datetime">Tự Chọn Ngày & Giờ Cụ Thể</option>
                  <option value="-1">Vĩnh Viễn Đày Vào Cửu U (Permanent)</option>
                </select>

                {banDuration === 'custom_days' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      className={s.searchInput}
                      style={{ width: 120 }}
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      placeholder="Số ngày"
                      required
                    />
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>ngày kể từ hiện tại</span>
                  </div>
                )}

                {banDuration === 'datetime' && (
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="datetime-local"
                      className={s.searchInput}
                      value={customDateTimeInput}
                      onChange={(e) => setCustomDateTimeInput(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Tội Danh / Lý Do Trấn Áp</label>
                <textarea
                  className={s.searchInput}
                  style={{ width: '100%', height: 80, padding: 12, resize: 'none' }}
                  placeholder="Ghi rõ tội danh (Xúc phạm đạo hữu, nhiễu loạn tiên môn, spam)..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className={s.modalActions}>
                <button
                  type="button"
                  className={s.cancelModalBtn}
                  onClick={() => setBanModalUser(null)}
                >
                  Hủy Pháp Lệnh
                </button>
                <button
                  type="submit"
                  className={s.confirmModalDangerBtn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang hạ cấm chế...' : (
                    <>
                      <span>Thi Hành Trấn Áp</span>
                      <InkIcon name="sword" size={14} color="#ffffff" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. Appeal Review Modal (Thẩm Định Oan Khuất) ── */}
      {appealModalUser && (
        <div className={s.modalOverlay} onClick={() => setAppealModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle} style={{ color: '#fef08a' }}>
                <InkIcon name="scroll" size={20} color="#f59e0b" />
                <span>THẨM ĐỊNH OAN KHUẤT // SỚ KÊU OAN</span>
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setAppealModalUser(null)}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            <div className={s.appealLetterBox}>
              <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <InkIcon name="scroll" size={15} color="#fbbf24" />
                <span>Lời Giãi Bày Của Tu Sĩ:</span>
              </div>
              <div>"{appealModalUser.appeal?.message || 'Không có lời phân trần'}"</div>
              {appealModalUser.appealDate && (
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'right' }}>
                  Dâng sớ lúc: {formatFullTime(appealModalUser.appealDate)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Lời Răn Đe / Lý Do Bác Bỏ (Nếu từ chối)</label>
              <input
                type="text"
                className={s.searchInput}
                placeholder="Lý do không chấp thuận (tùy chọn)..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>

            <div className={s.modalActions}>
              <button
                type="button"
                className={s.confirmModalDangerBtn}
                onClick={() => handleRejectAppeal(appealModalUser)}
                disabled={actionLoading}
              >
                <InkIcon name="close" size={14} color="#ffffff" />
                <span>Bác Bỏ Sớ Kêu Oan</span>
              </button>
              <button
                type="button"
                className={s.confirmModalBtn}
                onClick={() => handleApproveAppeal(appealModalUser)}
                disabled={actionLoading}
              >
                <InkIcon name="check" size={14} color="#ffffff" />
                <span>Khoan Hồng & Phá Giải Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Dedicated VIP Tier Management Modal (Ban Tứ Cảnh Giới) ── */}
      {vipModalUser && (
        <div className={s.modalOverlay} onClick={() => setVipModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle} style={{ color: '#fef08a' }}>
                <InkIcon name="crown" size={20} color="#f59e0b" />
                <span>BAN TỨ TIÊN DUYÊN // THĂNG CẤP TU VI</span>
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setVipModalUser(null)}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: 14, border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div className={s.userAvatarWrap}>
                <PixelAvatar avatarId={vipModalUser.avatar || 'bunny'} size={42} />
              </div>
              <div>
                <strong style={{ fontSize: 15, color: '#f8fafc' }}>
                  {vipModalUser.displayName || vipModalUser.id}
                </strong>
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
                  Cảnh giới hiện tại: {getUserVipTier(vipModalUser).badge} (Rank {getUserVipTier(vipModalUser).rank})
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmVipUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Chọn Cảnh Giới Đạo Pháp Muốn Ban Tứ:</label>
              
              <div className={s.vipGrid}>
                {[
                  { id: 'normal', label: 'Phàm Nhân', sub: 'Rank 0 — Mặc định', icon: 'sparkles', color: '#94a3b8' },
                  { id: 'svip', label: 'SVIP Thánh Hỏa', sub: 'Rank 1 — Khung Thánh Hỏa', icon: 'flame', color: '#ef4444' },
                  { id: 'ssvip', label: 'SSVIP Cực Băng', sub: 'Rank 2 — Khung Băng Phách', icon: 'gem', color: '#0284c7' },
                  { id: 'sssvip', label: 'SSSVIP Tử Lôi', sub: 'Rank 3 — Khung Tử Lôi Long', icon: 'bolt', color: '#d97706' },
                  { id: 'god', label: 'CỔ THẦN TỐI CAO', sub: 'Rank 4 — Vạn Pháp Quy Tông', icon: 'crown', color: '#a855f7' },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    className={`${s.vipOptionCard} ${selectedVipTier === tier.id ? s.vipOptionSelected : ''}`}
                    onClick={() => setSelectedVipTier(tier.id)}
                  >
                    <InkIcon name={tier.icon} size={22} color={tier.color} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: tier.color }}>{tier.label}</span>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>{tier.sub}</span>
                  </div>
                ))}
              </div>

              {vipModalSuccess && (
                <div style={{ padding: '8px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 10, color: '#6ee7b7', textAlign: 'center', fontSize: 12.5, fontWeight: 700 }}>
                  {vipModalSuccess}
                </div>
              )}

              <div className={s.modalActions}>
                <button
                  type="button"
                  className={s.cancelModalBtn}
                  onClick={() => setVipModalUser(null)}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className={s.confirmModalBtn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang khắc ấn linh đan...' : (
                    <>
                      <span>Xác Nhận Ban Tứ Cảnh Giới</span>
                      <InkIcon name="crown" size={14} color="#ffffff" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
