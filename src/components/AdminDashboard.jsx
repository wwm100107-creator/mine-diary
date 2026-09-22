import React, { useState, useEffect, useMemo } from 'react'
import PixelAvatar from './PixelAvatar'
import InkIcon from './admin/InkIcon'
import ThreeCelestialCanvas from './admin/ThreeCelestialCanvas'
import AceternitySpotlightGrid from './admin/AceternitySpotlightGrid'
import AdminHUDHeader from './admin/AdminHUDHeader'
import AdminBentoStats from './admin/AdminBentoStats'
import AdminCommandBar from './admin/AdminCommandBar'
import AdminCitizenTable from './admin/AdminCitizenTable'
import AvatarUploadModal from './AvatarUploadModal'
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
  updateUserAvatarFrame,
  sanitizeAdminAccount,
} from '../lib/admin'
import { VIP_TIERS, getUserVipTier } from '../utils/vipTiers'
import { AVATAR_FRAMES } from './AvatarFrameOverlay'
import { formatUserActivityStatus, saveSession } from '../lib/auth'
import { uploadUserAvatar } from '../lib/social'
import { applyTheme, getSavedTheme } from '../utils/theme'

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

export default function AdminDashboard({ user, onUpdateUser, onBack, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Ban Modal States
  const [banModalUser, setBanModalUser] = useState(null)
  const [banDuration, setBanDuration] = useState('7')
  const [customDaysInput, setCustomDaysInput] = useState('14')
  const [customDateTimeInput, setCustomDateTimeInput] = useState('')
  const [banReason, setBanReason] = useState('')

  // Appeal Modal States
  const [appealModalUser, setAppealModalUser] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  // Detail / Frame Studio Modal States
  const [detailModalUser, setDetailModalUser] = useState(null)
  const [newPassInput, setNewPassInput] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedUserFrame, setSelectedUserFrame] = useState('none')
  const [frameSuccess, setFrameSuccess] = useState('')

  // Dedicated VIP Management Modal States
  const [vipModalUser, setVipModalUser] = useState(null)
  const [selectedVipTier, setSelectedVipTier] = useState('normal')
  const [vipModalSuccess, setVipModalSuccess] = useState('')

  // Super Admin Authorization States
  const [superAdminCmd, setSuperAdminCmd] = useState('')
  const [superAdminUnlocked, setSuperAdminUnlocked] = useState(false)
  const [superAdminError, setSuperAdminError] = useState('')
  const [targetVipTier, setTargetVipTier] = useState('normal')
  const [vipUpdateSuccess, setVipUpdateSuccess] = useState('')
  const [firestoreError, setFirestoreError] = useState(null)
  const [copiedRules, setCopiedRules] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const isAdmin = isUserAdmin(user)

  const handleUpdateAdminAvatar = async (newAvatarData, newFrameId = 'none', newTheme = null) => {
    if (!user?.id) return
    try {
      if (newTheme) {
        applyTheme(newTheme)
      }
      const targetFrame = newFrameId || 'none'
      const updatedUser = {
        ...user,
        avatar: newAvatarData,
        avatarFrame: targetFrame,
        frame: targetFrame,
        theme: newTheme || user.theme || getSavedTheme(),
      }
      saveSession(updatedUser)
      onUpdateUser?.(updatedUser)

      // Direct Firestore sync for Admin user
      const finalAvatarUrl = await uploadUserAvatar(user.id, newAvatarData, targetFrame, newTheme)
      const persisted = {
        ...updatedUser,
        avatar: finalAvatarUrl || newAvatarData,
      }
      saveSession(persisted)
      onUpdateUser?.(persisted)
    } catch (err) {
      console.error('Failed to update admin avatar, frame, and theme:', err)
      throw err
    }
  }

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

  // Real-time synchronization
  useEffect(() => {
    if (!isAdmin) return
    deleteUserAccount('adminserver').catch(() => {})
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

  // Auto-reload on window focus
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
      return Date.now() - u.lastActiveAtDate.getTime() < 3 * 60 * 1000
    }).length
    const vip = validUsers.filter((u) => u.vipTier && u.vipTier !== 'normal').length
    const framed = validUsers.filter(
      (u) => (u.avatarFrame && u.avatarFrame !== 'none') || (u.frame && u.frame !== 'none')
    ).length
    const active = total - banned
    return { total, active, banned, appeals, online, vip, framed }
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
        return Date.now() - u.lastActiveAtDate.getTime() < 3 * 60 * 1000
      }
      if (statusFilter === 'active') return !u.isBanned
      if (statusFilter === 'banned') return Boolean(u.isBanned)
      if (statusFilter === 'appeals') return u.appeal?.status === 'pending'
      if (statusFilter === 'vip') return Boolean(u.vipTier && u.vipTier !== 'normal')
      if (statusFilter === 'framed')
        return Boolean((u.avatarFrame && u.avatarFrame !== 'none') || (u.frame && u.frame !== 'none'))
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
      alert('Không thể thực hiện khóa tài khoản!')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Unban
  const handleUnban = async (targetUser) => {
    if (!targetUser) return
    const targetId = typeof targetUser === 'string' ? targetUser : targetUser.id
    const targetName = typeof targetUser === 'string' ? targetUser : targetUser.displayName || targetUser.id
    const confirmed = window.confirm(`Mở khóa tài khoản cho người dùng ${targetName}?`)
    if (!confirmed) return

    setActionLoading(true)
    try {
      await unbanUser(targetId)
      await loadData()
    } catch (err) {
      console.error('Unban error:', err)
      alert('Lỗi khi mở khóa tài khoản.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Approve Ban Appeal
  const handleApproveAppeal = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Chấp thuận khiếu nại và lập tức mở khóa cho ${targetUser.displayName || targetUser.id}?`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await approveBanAppeal(targetUser.id)
      setAppealModalUser(null)
      await loadData()
    } catch (err) {
      console.error('Approve appeal error:', err)
      alert('Lỗi khi duyệt khiếu nại.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Reject Ban Appeal
  const handleRejectAppeal = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Từ chối khiếu nại của ${targetUser.displayName || targetUser.id}? Tài khoản sẽ tiếp tục bị khóa.`
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
      alert('Lỗi khi từ chối khiếu nại.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete User Account
  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return
    if (isProtectedUser(targetUser)) {
      alert('👑 Tài khoản Quản trị viên tối cao được bảo vệ, không thể bị xóa hoặc hạn chế!')
      return
    }

    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO QUẢN TRỊ:\nBạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${targetUser.displayName || targetUser.username || targetUser.id}" (#${targetUser.id}) không?\nHành động này sẽ xóa toàn bộ dữ liệu khỏi Firestore và không thể hoàn tác!`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await deleteUserAccount(targetUser.id)
      setDetailModalUser(null)
      await loadData()
      alert(`✓ Đã xóa vĩnh viễn tài khoản #${targetUser.id} thành công!`)
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
      setResetSuccess(`✓ Đổi mật khẩu thành công! Mật khẩu mới: "${newPassInput.trim()}"`)
      setNewPassInput('')
      await loadData()
    } catch (err) {
      console.error('Reset password error:', err)
      alert('Lỗi khi đặt lại mật khẩu.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle VIP Tier Update from Dossier Modal
  const handleUpdateVipTier = async (e) => {
    e.preventDefault()
    if (!detailModalUser) return
    setActionLoading(true)
    setVipUpdateSuccess('')
    try {
      await updateUserVipTier(detailModalUser.id, targetVipTier)
      setVipUpdateSuccess(`✓ Đã cập nhật cấp bậc VIP thành: "${VIP_TIERS[targetVipTier]?.name || targetVipTier}"`)
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
      alert('Lỗi khi cập nhật cấp bậc VIP.')
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
      setVipModalSuccess(`✓ Đã cập nhật cấp bậc VIP "${tierName}" thành công!`)
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
      alert('Lỗi khi cập nhật cấp bậc VIP: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Super Admin Authorization Key Handler
  const handleVerifySuperAdmin = (e) => {
    e.preventDefault()
    setSuperAdminError('')
    const trimmed = superAdminCmd.trim()

    if (trimmed === 'uy.phamchamchi@hcmut.edu.vn') {
      setSuperAdminUnlocked(true)
      setSuperAdminCmd('')
    } else {
      setSuperAdminError('Mã ủy quyền không chính xác! Quyền truy cập bị từ chối.')
    }
  }

  // Toggle Fertility Tracking Permission
  const handleToggleFertilityPermission = async (targetUser) => {
    if (!targetUser?.id) return
    const newStatus = targetUser.allowFertilityTracking === false ? true : false
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
      alert('Lỗi khi cập nhật quyền theo dõi chu kỳ: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Directly Assign Avatar Frame to a User
  const handleAssignAvatarFrame = async (targetUser, frameId) => {
    if (!targetUser?.id) return
    setActionLoading(true)
    setFrameSuccess('')
    try {
      await updateUserAvatarFrame(targetUser.id, frameId)
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, avatarFrame: frameId, frame: frameId } : u))
      )
      if (detailModalUser && detailModalUser.id === targetUser.id) {
        setDetailModalUser((prev) => ({ ...prev, avatarFrame: frameId, frame: frameId }))
      }
      if (user?.id === targetUser.id) {
        onUpdateUser?.({
          ...user,
          avatarFrame: frameId,
          frame: frameId,
        })
      }
      setFrameSuccess('Cấp khung avatar thành công!')
    } catch (err) {
      console.error('Failed to update avatar frame:', err)
      alert('Lỗi khi cập nhật khung avatar: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Permission Guard
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          background: '#070b14',
          color: '#f8fafc',
          overflow: 'hidden',
        }}
      >
        <ThreeCelestialCanvas />
        <AceternitySpotlightGrid />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            backdropFilter: 'blur(20px)',
            maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <InkIcon name="ban" size={54} color="#f43f5e" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>
            Truy Cập Bị Từ Chối
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Tài khoản của bạn không có quyền Quản trị viên (Super Admin) để truy cập tổng hành dinh này.
          </p>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ← Quay lại ứng dụng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#070b14',
        color: '#f8fafc',
        overflowX: 'hidden',
      }}
    >
      {/* 3D Atmospheric Background Layers (ThreeUI + Aceternity) */}
      <ThreeCelestialCanvas />
      <AceternitySpotlightGrid />

      {/* Main Content Viewport */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '24px 20px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Tactical HUD Header */}
        <AdminHUDHeader
          user={user}
          onBack={onBack}
          onLogout={onLogout}
          onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        />

        {/* Firestore Permission Alert Banner */}
        {firestoreError && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '16px',
              padding: '18px 20px',
              color: '#fca5a5',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <InkIcon name="warning" size={26} color="#f87171" />
              <div>
                <strong style={{ fontSize: '14.5px', color: '#fca5a5' }}>
                  Lỗi Quyền Truy Cập Firestore (PERMISSION_DENIED)
                </strong>
                <p style={{ fontSize: '13px', color: '#fda4af', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Dữ liệu người dùng trên Google Cloud vẫn an toàn 100%. Vui lòng Publish Security Rules trên Firebase Console để cập nhật quyền.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <a
                href="https://console.firebase.google.com/project/mine-diary-11279/firestore/rules"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 14px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '600',
                }}
              >
                Mở Firebase Rules Console ↗
              </a>
              <button
                type="button"
                onClick={() => {
                  const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`
                  navigator.clipboard.writeText(rules)
                  setCopiedRules(true)
                  setTimeout(() => setCopiedRules(false), 3000)
                }}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  borderRadius: '10px',
                  color: '#38bdf8',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <InkIcon name={copiedRules ? 'check' : 'scroll'} size={14} color="#38bdf8" />
                <span>{copiedRules ? 'Đã sao chép Rules chuẩn!' : 'Sao chép Rules Chuẩn'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Bento Grid Metrics Summary */}
        <AdminBentoStats metrics={metrics} />

        {/* Command Bar & Segmented Filters */}
        <AdminCommandBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          metrics={metrics}
          loading={loading}
          onRefresh={loadData}
        />

        {/* Citizen Telemetry Data Table */}
        <AdminCitizenTable
          users={filteredUsers}
          loading={loading}
          onOpenDetail={(u) => {
            setDetailModalUser(u)
            setSelectedUserFrame(u.avatarFrame || u.frame || 'none')
            setFrameSuccess('')
            setTargetVipTier(u.vipTier || (isProtectedUser(u) ? 'god' : 'normal'))
            setVipUpdateSuccess('')
            setResetSuccess('')
            setNewPassInput('')
            setSuperAdminUnlocked(false)
            setSuperAdminCmd('')
            setSuperAdminError('')
          }}
          onOpenVipModal={(u) => {
            setVipModalUser(u)
            setSelectedVipTier(u.vipTier || 'normal')
            setVipModalSuccess('')
          }}
          onOpenBanModal={(u) => {
            setBanModalUser(u)
            setBanReason('')
            setBanDuration('7')
            setCustomDaysInput('14')
            setCustomDateTimeInput('')
          }}
          onOpenAppealModal={(u) => {
            setAppealModalUser(u)
            setRejectNote('')
          }}
          onUnbanUser={handleUnban}
          onDeleteUser={handleDeleteUser}
          actionLoading={actionLoading}
        />
      </div>

      {/* ── 1. ACCOUNT DOSSIER & FRAME STUDIO MODAL ── */}
      {detailModalUser && (
        <div
          onClick={() => setDetailModalUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 28, 0.98) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              color: '#f8fafc',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InkIcon name="scroll" size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '0.04em', color: '#f8fafc', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Hồ Sơ Cư Dân // CITIZEN DOSSIER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalUser(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            {/* Target User Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(10, 15, 28, 0.65)',
                borderRadius: '14px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <PixelAvatar
                avatarId={detailModalUser.avatar || 'bunny'}
                frameId={
                  detailModalUser.avatarFrame ||
                  detailModalUser.frame ||
                  (detailModalUser.vipTier === 'god'
                    ? 'god_cosmic'
                    : detailModalUser.vipTier === 'sssvip'
                    ? 'vip10_thunder'
                    : detailModalUser.vipTier === 'ssvip'
                    ? 'vip9_frost'
                    : detailModalUser.vipTier === 'svip'
                    ? 'vip8_fire'
                    : 'none')
                }
                size={48}
                border={false}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                  {detailModalUser.displayName || detailModalUser.id}
                </div>
                <div style={{ fontSize: '11.5px', color: '#38bdf8', fontFamily: 'monospace' }}>
                  UID: #{detailModalUser.id}
                </div>
              </div>
            </div>

            {/* Account Details Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
              {[
                { label: 'Tên Đăng Nhập', value: detailModalUser.username || detailModalUser.id.split('#')[0] },
                { label: 'Email', value: detailModalUser.email || 'Chưa liên kết' },
                {
                  label: 'Giới Tính',
                  value:
                    detailModalUser.gender === 'male'
                      ? 'Nam (♂)'
                      : detailModalUser.gender === 'female'
                      ? 'Nữ (♀)'
                      : 'Chưa thiết lập',
                },
                {
                  label: 'Chuỗi Điểm Danh',
                  value: `${detailModalUser.attendanceStreak || detailModalUser.streak || 0} ngày liên tiếp`,
                },
                { label: 'Ngày Gia Nhập', value: formatFullTime(detailModalUser.createdAtDate) },
                {
                  label: 'Hoạt Động Cuối',
                  value: formatFullTime(detailModalUser.lastActiveAtDate),
                },
                { label: 'Địa Chỉ IP', value: detailModalUser.lastLoginIp || '—' },
                { label: 'Thiết Bị', value: detailModalUser.lastDevice || '—' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>{item.label}:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600', fontFamily: 'monospace' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* ── 🎨 EXCLUSIVE AVATAR FRAME STUDIO ── */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '14px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#f472b6', display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  <InkIcon name="sparkles" size={16} color="#f472b6" />
                  <span>FRAME STUDIO // CẤP KHUNG DANH HIỆU</span>
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Gán trực tiếp khung hoạt họa</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(10, 15, 28, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PixelAvatar
                    avatarId={detailModalUser.avatar || 'bunny'}
                    frameId={selectedUserFrame}
                    size={46}
                    border={false}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <select
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(10, 15, 28, 0.9)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    value={selectedUserFrame}
                    onChange={(e) => {
                      setSelectedUserFrame(e.target.value)
                      setFrameSuccess('')
                    }}
                  >
                    {AVATAR_FRAMES.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: '#0f172a', color: '#fff' }}>
                        {f.icon} {f.name} ({f.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAssignAvatarFrame(detailModalUser, selectedUserFrame)}
                  disabled={actionLoading || selectedUserFrame === (detailModalUser.avatarFrame || detailModalUser.frame || 'none')}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                  }}
                >
                  <InkIcon name="check" size={14} color="#ffffff" />
                  <span>{actionLoading ? 'Đang Lưu...' : 'Cấp Khung'}</span>
                </button>
              </div>

              {frameSuccess && (
                <div style={{ marginTop: '10px', color: '#34d399', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <InkIcon name="check" size={13} color="#34d399" />
                  <span>{frameSuccess}</span>
                </div>
              )}
            </div>

            {/* ── 🩺 FERTILITY TRACKING ACCESS PERMISSION ── */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InkIcon name="heart" size={15} color="#ec4899" />
                  <span>Quyền Theo Dõi Chu Kỳ & Sức Khỏe (Fertility Access)</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                  Trạng thái: {detailModalUser.allowFertilityTracking !== false ? (
                    <span style={{ color: '#34d399', fontWeight: '700' }}>🟢 Đang mở quyền đầy đủ</span>
                  ) : (
                    <span style={{ color: '#fb7185', fontWeight: '700' }}>🔴 Đã tạm khóa quyền</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFertilityPermission(detailModalUser)}
                disabled={actionLoading}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: detailModalUser.allowFertilityTracking !== false ? 'rgba(244, 63, 94, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  border: `1px solid ${detailModalUser.allowFertilityTracking !== false ? 'rgba(244, 63, 94, 0.35)' : 'rgba(52, 211, 153, 0.35)'}`,
                  color: detailModalUser.allowFertilityTracking !== false ? '#fb7185' : '#34d399',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {detailModalUser.allowFertilityTracking !== false ? 'Khóa Quyền Chu Kỳ' : 'Mở Quyền Chu Kỳ'}
              </button>
            </div>

            {/* ── 🛡️ SUPER ADMIN REVEAL ORIGINAL PASSWORD ── */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
                  <InkIcon name="eye" size={15} color="#fbbf24" />
                  <span>XEM MẬT KHẨU GỐC // SUPER ADMIN</span>
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nhập mã ủy quyền để giải mã</span>
              </div>

              {!superAdminUnlocked ? (
                <form onSubmit={handleVerifySuperAdmin} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="Nhập mã xác thực Admin tối cao..."
                    value={superAdminCmd}
                    onChange={(e) => setSuperAdminCmd(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(10, 15, 28, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Xác Thực
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>✓ ĐÃ XÁC THỰC THÀNH CÔNG</span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      fontFamily: 'monospace',
                      color: '#f8fafc',
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {detailModalUser.plainPassword || 'MineDiary2026@'}
                  </span>
                </div>
              )}

              {superAdminError && (
                <div style={{ color: '#fb7185', fontSize: '12px', fontWeight: '600' }}>{superAdminError}</div>
              )}
            </div>

            {/* ── 🔑 OVERRIDE PASSWORD ── */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <InkIcon name="bolt" size={15} color="#38bdf8" />
                <span>Đặt Lại Mật Khẩu (Admin Override)</span>
              </span>

              <form onSubmit={handleAdminResetPassword} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(10, 15, 28, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={actionLoading || !newPassInput.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cập Nhật
                </button>
              </form>

              {resetSuccess && (
                <div style={{ color: '#34d399', fontSize: '12px', fontWeight: '600' }}>{resetSuccess}</div>
              )}
            </div>

            {/* ── ⚠️ DELETE / PROTECTION FOOTER ── */}
            {isProtectedUser(detailModalUser) ? (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fbbf24',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <InkIcon name="crown" size={16} color="#fbbf24" />
                <span>Tài khoản Quản trị viên tối cao được bảo vệ, không thể bị xóa hoặc hạn chế!</span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fb7185' }}>Xóa Vĩnh Viễn Tài Khoản</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Xóa sạch dữ liệu tài khoản này khỏi Firestore.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(detailModalUser)}
                  disabled={actionLoading}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Xác Nhận Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. BAN USER MODAL ── */}
      {banModalUser && (
        <div
          onClick={() => setBanModalUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 28, 0.98) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 63, 94, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                <InkIcon name="sword" size={18} color="#fb7185" />
                <span>ĐÌNH CHỈ TÀI KHOẢN // BAN USER</span>
              </h3>
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <PixelAvatar avatarId={banModalUser.avatar || 'bunny'} size={38} border={false} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                  {banModalUser.displayName || banModalUser.id}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>UID: #{banModalUser.id}</div>
              </div>
            </div>

            <form onSubmit={handleConfirmBan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#94a3b8' }}>Thời Gian Khóa</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(10, 15, 28, 0.9)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="1" style={{ background: '#0f172a' }}>1 Ngày (24 Giờ)</option>
                  <option value="3" style={{ background: '#0f172a' }}>3 Ngày</option>
                  <option value="7" style={{ background: '#0f172a' }}>7 Ngày (1 Tuần)</option>
                  <option value="30" style={{ background: '#0f172a' }}>30 Ngày (1 Tháng)</option>
                  <option value="custom_days" style={{ background: '#0f172a' }}>Tự Nhập Số Ngày</option>
                  <option value="datetime" style={{ background: '#0f172a' }}>Tự Chọn Ngày & Giờ</option>
                  <option value="-1" style={{ background: '#0f172a' }}>Khóa Vĩnh Viễn (Permanent)</option>
                </select>

                {banDuration === 'custom_days' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      placeholder="Số ngày"
                      style={{
                        width: '120px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(10, 15, 28, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f8fafc',
                      }}
                      required
                    />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>ngày kể từ hiện tại</span>
                  </div>
                )}

                {banDuration === 'datetime' && (
                  <input
                    type="datetime-local"
                    value={customDateTimeInput}
                    onChange={(e) => setCustomDateTimeInput(e.target.value)}
                    style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(10, 15, 28, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                    }}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#94a3b8' }}>Lý Do Khóa</label>
                <textarea
                  placeholder="Ghi rõ lý do kỷ luật..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(10, 15, 28, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    resize: 'none',
                    outline: 'none',
                  }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setBanModalUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading ? 'Đang khóa...' : 'Xác Nhận Khóa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. APPEAL REVIEW MODAL ── */}
      {appealModalUser && (
        <div
          onClick={() => setAppealModalUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 28, 0.98) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(234, 179, 8, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                <InkIcon name="scroll" size={18} color="#fbbf24" />
                <span>XÉT ĐƠN KHIẾU NẠI MỞ KHÓA</span>
              </h3>
              <button
                type="button"
                onClick={() => setAppealModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            <div
              style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                color: '#fde047',
                lineHeight: 1.6,
                fontSize: '13.5px',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '6px' }}>Nội Dung Khiếu Nại Của Cư Dân:</div>
              <div style={{ color: '#f8fafc' }}>"{appealModalUser.appeal?.message || 'Không có nội dung khiếu nại'}"</div>
              {appealModalUser.appealDate && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'right' }}>
                  Gửi lúc: {formatFullTime(appealModalUser.appealDate)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#94a3b8' }}>Ghi chú từ chối (Tùy chọn)</label>
              <input
                type="text"
                placeholder="Ghi chú phản hồi khi từ chối..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(10, 15, 28, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => handleRejectAppeal(appealModalUser)}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fb7185',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Từ Chối Đơn
              </button>
              <button
                type="button"
                onClick={() => handleApproveAppeal(appealModalUser)}
                disabled={actionLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Chấp Thuận & Mở Khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DEDICATED VIP MANAGEMENT MODAL ── */}
      {vipModalUser && (
        <div
          onClick={() => setVipModalUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 28, 0.98) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                <InkIcon name="crown" size={18} color="#fbbf24" />
                <span>QUẢN LÝ CẤP BẬC VIP // CITIZEN RANK</span>
              </h3>
              <button
                type="button"
                onClick={() => setVipModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <InkIcon name="close" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <PixelAvatar avatarId={vipModalUser.avatar || 'bunny'} size={42} border={false} />
              <div>
                <strong style={{ fontSize: '15px', color: '#f8fafc' }}>
                  {vipModalUser.displayName || vipModalUser.id}
                </strong>
                <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '2px', fontWeight: '600' }}>
                  Cấp bậc VIP hiện tại: {getUserVipTier(vipModalUser).badge} (Rank {getUserVipTier(vipModalUser).rank})
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmVipUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#94a3b8' }}>Chọn Cấp Bậc VIP:</label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {[
                  { id: 'normal', label: 'Thành Viên Thường', sub: 'Rank 0 — Mặc định', icon: 'sparkles', color: '#94a3b8' },
                  { id: 'svip', label: 'SVIP Thánh Hỏa', sub: 'Rank 1 — Lửa Đỏ', icon: 'flame', color: '#f43f5e' },
                  { id: 'ssvip', label: 'SSVIP Cực Băng', sub: 'Rank 2 — Băng Lam', icon: 'gem', color: '#38bdf8' },
                  { id: 'sssvip', label: 'SSSVIP Tử Lôi', sub: 'Rank 3 — Sấm Sét', icon: 'bolt', color: '#fbbf24' },
                  { id: 'god', label: 'GOD - TỐI CAO', sub: 'Rank 4 — Vũ Trụ Tối Thượng', icon: 'crown', color: '#a855f7' },
                ].map((tier) => {
                  const isSelected = selectedVipTier === tier.id
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedVipTier(tier.id)}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '12px',
                        background: isSelected ? `${tier.color}22` : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${isSelected ? tier.color : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        boxShadow: isSelected ? `0 0 16px ${tier.color}44` : 'none',
                      }}
                    >
                      <InkIcon name={tier.icon} size={22} color={tier.color} />
                      <span style={{ fontWeight: '700', fontSize: '12.5px', color: tier.color }}>{tier.label}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{tier.sub}</span>
                    </div>
                  )
                })}
              </div>

              {vipModalSuccess && (
                <div style={{ padding: '8px 14px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', color: '#34d399', textAlign: 'center', fontSize: '12.5px', fontWeight: '700' }}>
                  {vipModalSuccess}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setVipModalUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  {actionLoading ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Custom Avatar & Frame Modal */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          user={user}
          currentAvatar={user?.avatar || 'bunny'}
          currentFrame={user?.avatarFrame || user?.frame || 'none'}
          currentTheme={user?.theme || getSavedTheme()}
          onSave={handleUpdateAdminAvatar}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}
    </div>
  )
}
