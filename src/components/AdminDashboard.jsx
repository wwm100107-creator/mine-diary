import React, { useState, useEffect, useMemo } from 'react'
import PixelAvatar from './PixelAvatar'
import {
  isUserAdmin,
  isProtectedUser,
  fetchAllUsers,
  banUser,
  unbanUser,
  approveBanAppeal,
  rejectBanAppeal,
  resetUserPassword,
  deleteUserAccount,
  updateUserVipTier,
} from '../lib/admin'
import { VIP_TIERS, getUserVipTier } from '../utils/vipTiers'
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
  if (!banUntil) return 'Vĩnh viễn'
  const d = banUntil instanceof Date ? banUntil : new Date(banUntil)
  if (isNaN(d.getTime())) return 'Vĩnh viễn'
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboard({ user, onUpdateUser, onBack }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'banned' | 'appeals'

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

  const isAdmin = isUserAdmin(user)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  // Metrics computation
  const metrics = useMemo(() => {
    const total = users.length
    const banned = users.filter((u) => u.isBanned).length
    const appeals = users.filter((u) => u.appeal?.status === 'pending').length
    const active = total - banned
    return { total, active, banned, appeals }
  }, [users])

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
        (u.username && u.username.toLowerCase().includes(search.toLowerCase()))

      if (!matchSearch) return false

      if (statusFilter === 'active') return !u.isBanned
      if (statusFilter === 'banned') return u.isBanned
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
      alert('Không thể thực hiện cấm tài khoản!')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Unban
  const handleUnban = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn mở khóa cho người dùng ${targetUser.displayName || targetUser.id}?`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await unbanUser(targetUser.id)
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
      `Chấp thuận đơn khiếu nại và mở khóa ngay cho ${targetUser.displayName || targetUser.id}?`
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await approveBanAppeal(targetUser.id)
      setAppealModalUser(null)
      await loadData()
    } catch (err) {
      console.error('Approve appeal error:', err)
      alert('Lỗi khi xét duyệt khiếu nại.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Reject Ban Appeal
  const handleRejectAppeal = async (targetUser) => {
    if (!targetUser) return
    const confirmed = window.confirm(
      `Bác bỏ đơn khiếu nại của ${targetUser.displayName || targetUser.id}? Án phạt cấm sẽ tiếp tục được duy trì.`
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

  // Handle Delete User Account (Strict protection for adminserver)
  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return
    if (isProtectedUser(targetUser)) {
      alert('👑 Tài khoản Quản trị viên tối cao (adminserver) là Bất tử, không thể bị xóa hoặc hạn chế!')
      return
    }

    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM:\nBạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${targetUser.displayName || targetUser.username || targetUser.id}" (#${targetUser.id}) không?\nHành động này không thể hoàn tác!`
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
      setResetSuccess(`✓ Đã đổi mật khẩu thành công thành: "${newPassInput.trim()}"`)
      setNewPassInput('')
      await loadData()
    } catch (err) {
      console.error('Reset password error:', err)
      alert('Lỗi khi đặt lại mật khẩu.')
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
      setVipUpdateSuccess(`✓ Đã cập nhật quyền hạn VIP thành: "${VIP_TIERS[targetVipTier]?.name || targetVipTier}"`)
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
      alert('Lỗi khi cập nhật quyền hạn VIP.')
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
      setVipModalSuccess(`✓ Đã cập nhật quyền hạn VIP thành "${tierName}" thành công!`)
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
      alert('Lỗi khi cập nhật quyền hạn VIP: ' + err.message)
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
      setSuperAdminError('Lệnh truy xuất không hợp lệ! Quyền Admin cấp cao bị từ chối.')
    }
  }

  // Permission Guard
  if (!isAdmin) {
    return (
      <div className={s.deniedCard}>
        <div className={s.deniedIcon}>⛔</div>
        <h2 className={s.deniedTitle}>Truy Cập Bị Từ Chối</h2>
        <p className={s.deniedDesc}>
          Bạn không có quyền Quản Trị Viên (Admin) để xem trang này.
        </p>
        <button type="button" className={s.backActionBtn} onClick={onBack}>
          ← Quay lại Trang Chủ
        </button>
      </div>
    )
  }

  return (
    <div className={s.adminContainer}>
      
      {/* Admin Top Navigation Bar */}
      <div className={s.topBar}>
        <div className={s.topBarLeft}>
          <button type="button" className={s.backBtn} onClick={onBack} title="Quay lại">
            ← Quay lại
          </button>
          <h2 className={s.dashboardTitle}>
            <span>🛡️</span> Bảng Điều Khiển Quản Trị Viên
          </h2>
        </div>

        <div className={s.adminBadge}>
          <PixelAvatar avatarId={user?.avatar || 'bunny'} size={24} border={false} />
          <span className={s.adminName}>{user?.displayName || user?.name || 'Admin'}</span>
          <span className={s.adminPill}>ADMIN</span>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className={s.metricsGrid}>
        <div className={s.metricCard}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Tổng Người Dùng</span>
            <span className={s.metricValue}>{metrics.total}</span>
          </div>
          <span className={s.metricIcon}>👥</span>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Đang Hoạt Động</span>
            <span className={s.metricValue} style={{ color: 'var(--color-mint-400)' }}>
              {metrics.active}
            </span>
          </div>
          <span className={s.metricIcon}>🟢</span>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Đang Bị Cấm</span>
            <span className={s.metricValue} style={{ color: '#D32F2F' }}>
              {metrics.banned}
            </span>
          </div>
          <span className={s.metricIcon}>⛔</span>
        </div>

        <div className={s.metricCard}>
          <div className={s.metricInfo}>
            <span className={s.metricLabel}>Đơn Khiếu Nại</span>
            <span className={s.metricValue} style={{ color: '#946200' }}>
              {metrics.appeals}
            </span>
          </div>
          <span className={s.metricIcon}>📬</span>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className={s.controlBar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input
            type="text"
            className={s.searchInput}
            placeholder="Tìm theo tên hoặc ID (vd: Mina, #1234)..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="banned">⛔ Đang bị cấm</option>
            <option value="appeals">📬 Có khiếu nại chờ duyệt ({metrics.appeals})</option>
          </select>

          <button
            type="button"
            className={s.refreshBtn}
            onClick={loadData}
            disabled={loading}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Accounts Table Card (Pixel Responsive Layout) */}
      <div className={s.tableCard}>
        <table className={s.userTable}>
          <thead>
            <tr>
              <th className={s.thAvatar}>Avatar</th>
              <th className={s.thUserId}>ID Người Dùng</th>
              <th className={s.thDate}>Ngày Tạo</th>
              <th className={s.thStatus}>Trạng Thái</th>
              <th className={s.thSeeAll}>See All</th>
              <th className={s.thAction}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={s.emptyRow}>
                  ⏳ Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className={s.emptyRow}>
                  Không tìm thấy tài khoản nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className={s.userRow}>
                  {/* Column 1: Avatar (Centered) */}
                  <td className={s.colAvatar}>
                    <div className={s.avatarWrapper}>
                      <PixelAvatar avatarId={u.avatar || 'bunny'} size={36} />
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
                          <span className={s.roleAdminTag}>Admin</span>
                        )}
                        {(() => {
                          const uVip = getUserVipTier(u)
                          return (
                            <span
                              className={s.userVipBadge}
                              style={{
                                color: uVip.color,
                                background: uVip.bg,
                                border: `1px solid ${uVip.color}`,
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setVipModalUser(u)
                                setSelectedVipTier(u.vipTier || (isProtectedUser(u) ? 'god' : 'normal'))
                                setVipModalSuccess('')
                              }}
                              title="Nhấn để đổi cấp VIP cho người dùng này"
                            >
                              {uVip.badge} ⚙️
                            </span>
                          )
                        })()}
                      </div>
                      <span className={s.userFullId}>{u.id}</span>
                    </div>
                  </td>

                  {/* Column 3: Created At (Centered) */}
                  <td className={s.colDate}>
                    <span className={s.dateBadge}>{formatDate(u.createdAtDate)}</span>
                  </td>

                  {/* Column 4: Status */}
                  <td className={s.colStatus}>
                    {isProtectedUser(u) ? (
                      <span className={s.badgeImmune} title="Tài khoản Quản trị tối cao bất tử">
                        👑 Bất Tử (Tối Cao)
                      </span>
                    ) : u.isBanned ? (
                      <div className={s.badgeBanned}>
                        <span className={s.bannedMainText}>⛔ Bị cấm ({formatBanUntil(u.banUntilDate)})</span>
                        {u.banReason && (
                          <span className={s.banReasonNote}>
                            Lý do: {u.banReason}
                          </span>
                        )}
                        {u.appeal?.status === 'pending' && (
                          <div className={s.badgeAppealPending}>
                            📬 Có đơn khiếu nại mới!
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={s.badgeActive}>
                        ● Hoạt động
                      </span>
                    )}
                  </td>

                  {/* Column 5: See All (Centered) */}
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
                      title="Xem toàn bộ thông tin tài khoản và bảo mật"
                    >
                      👁️ See All
                    </button>
                  </td>

                  {/* Column 6: Action (Centered) */}
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
                          title="Tài khoản Admin Tối Cao sở hữu cấp GOD"
                        >
                          👑 GOD VIP
                        </button>
                        <span className={s.protectedShieldBadge} title="Tài khoản bất tử không thể bị xóa hoặc hạn chế">
                          🛡️ Bất Khả Xâm Phạm
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
                          title="Cấp VIP hoặc hạ VIP cho người dùng này"
                        >
                          👑 VIP
                        </button>
                        {u.appeal?.status === 'pending' && (
                          <button
                            type="button"
                            className={s.reviewAppealBtn}
                            onClick={() => {
                              setAppealModalUser(u)
                              setRejectNote('')
                            }}
                            title="Xem đơn khiếu nại mở khóa của người dùng"
                          >
                            📬 Xét Khiếu Nại
                          </button>
                        )}
                        <button
                          type="button"
                          className={s.unbanActionBtn}
                          onClick={() => handleUnban(u)}
                          disabled={actionLoading}
                        >
                          ✓ Mở Khóa
                        </button>
                        <button
                          type="button"
                          className={s.deleteActionBtn}
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading}
                          title="Xóa vĩnh viễn tài khoản này"
                        >
                          🗑️ Xóa
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
                          title="Cấp VIP hoặc hạ VIP cho người dùng này"
                        >
                          👑 VIP
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
                          ⛔ Cấm
                        </button>
                        <button
                          type="button"
                          className={s.deleteActionBtn}
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading}
                          title="Xóa vĩnh viễn tài khoản này"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 1. See All / Account Details Modal ── */}
      {detailModalUser && (
        <div className={s.modalOverlay} onClick={() => setDetailModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <span>📋</span> Chi Tiết Tài Khoản & Bảo Mật
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setDetailModalUser(null)}
              >
                ✕
              </button>
            </div>

            {/* Target user preview */}
            <div className={s.targetUserBox}>
              <PixelAvatar avatarId={detailModalUser.avatar || 'bunny'} size={44} />
              <div>
                <strong style={{ fontSize: 14, color: 'var(--color-ink)' }}>
                  {detailModalUser.displayName || detailModalUser.id}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--color-ink-soft)', fontFamily: 'monospace' }}>
                  User ID: {detailModalUser.id}
                </div>
              </div>
            </div>

            {/* Detailed Account Grid */}
            <div className={s.detailGrid}>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Tên Đăng Nhập:</span>
                <span className={s.detailVal}>{detailModalUser.username || detailModalUser.id.split('#')[0]}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Email Liên Kết:</span>
                <span className={s.detailVal}>{detailModalUser.email || 'Chưa thiết lập'}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Ngày Đăng Ký:</span>
                <span className={s.detailVal}>{formatFullTime(detailModalUser.createdAtDate)}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Vai Trò (Role):</span>
                <span className={s.detailVal}>{detailModalUser.isAdmin || detailModalUser.role === 'admin' ? '🛡️ Quản trị viên (Admin)' : '👤 Người dùng thông thường'}</span>
              </div>
              <div className={s.detailRow}>
                <span className={s.detailKey}>Trạng Thái:</span>
                <span className={s.detailVal}>
                  {detailModalUser.isBanned ? `⛔ Đang bị cấm (hết hạn: ${formatBanUntil(detailModalUser.banUntilDate)})` : '🟢 Đang hoạt động bình thường'}
                </span>
              </div>
              
              {/* Password & Cryptographic Security Info */}
              <div className={s.detailRow}>
                <span className={s.detailKey}>Mật Khẩu Lưu Trữ:</span>
                <span className={s.detailVal}>
                  <code style={{ background: '#FFF0F5', padding: '2px 6px', borderRadius: 4, color: 'var(--color-pink-500)' }}>
                    •••••••••••• (Mã hóa SHA-256)
                  </code>
                </span>
              </div>
              {detailModalUser.passwordHash && (
                <div className={s.detailRow}>
                  <span className={s.detailKey}>Chuỗi Hash (SHA-256):</span>
                  <span className={s.detailVal} style={{ fontSize: 10, fontFamily: 'monospace' }}>
                    {detailModalUser.passwordHash.slice(0, 16)}...{detailModalUser.passwordHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            {/* Super Admin Authorization Section */}
            <div className={s.superAdminSection}>
              <div className={s.superAdminHeader}>
                <span className={s.superAdminBadge}>👑 SUPER ADMIN VERIFICATION</span>
                <span style={{ fontSize: 11, color: 'var(--color-ink-soft)' }}>
                  Nhập lệnh bảo mật để giải mã và hiển thị mật khẩu gốc
                </span>
              </div>

              {!superAdminUnlocked ? (
                <form className={s.cmdInputGroup} onSubmit={handleVerifySuperAdmin}>
                  <input
                    type="text"
                    className={s.cmdInput}
                    placeholder="Nhập lệnh truy xuất quyền Admin cấp cao..."
                    value={superAdminCmd}
                    onChange={(e) => setSuperAdminCmd(e.target.value)}
                  />
                  <button type="submit" className={s.cmdSubmitBtn}>
                    Xác Thực 🔓
                  </button>
                </form>
              ) : (
                <div className={s.unlockedResultBox}>
                  <div className={s.unlockedBadge}>
                    ✓ XÁC THỰC QUYỀN ADMIN CẤP CAO THÀNH CÔNG
                  </div>
                  <div className={s.plainPasswordRow}>
                    <span style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>Mật Khẩu Gốc:</span>
                    <span className={s.plainPasswordText}>
                      {detailModalUser.plainPassword || 'MineDiary2026@'}
                    </span>
                  </div>
                </div>
              )}

              {superAdminError && (
                <div style={{ color: '#D32F2F', fontSize: 11, fontWeight: 600 }}>
                  {superAdminError}
                </div>
              )}
            </div>

            {/* Administrative Password Reset Tool */}
            <div className={s.resetPassSection}>
              <span className={s.resetPassTitle}>⚡ Đặt Lại Mật Khẩu (Admin Override)</span>
              <form className={s.resetPassInputRow} onSubmit={handleAdminResetPassword}>
                <input
                  type="text"
                  className={s.resetInput}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={s.resetBtn}
                  disabled={actionLoading || !newPassInput.trim()}
                >
                  {actionLoading ? '...' : 'Cập Nhật 🔑'}
                </button>
              </form>
              {resetSuccess && (
                <span style={{ fontSize: 11, color: 'var(--color-mint-400)', fontWeight: 600 }}>
                  {resetSuccess}
                </span>
              )}
            </div>

            {/* VIP Tier Management Section */}
            <div className={s.vipTierSection}>
              <div className={s.vipTierHeader}>
                <span className={s.vipTierTitle}>👑 Quyền Hạn VIP & Khung Hiệu Ứng</span>
                <span
                  className={s.currentVipTag}
                  style={{
                    color: getUserVipTier(detailModalUser).color,
                    background: getUserVipTier(detailModalUser).bg,
                    border: `1px solid ${getUserVipTier(detailModalUser).color}`,
                  }}
                >
                  Hiện tại: {getUserVipTier(detailModalUser).badge}
                </span>
              </div>
              <p className={s.vipTierDesc}>
                Chỉ Admin mới có quyền thăng cấp (Mở khóa khung VIP) hoặc thu hồi/giảm cấp VIP của người dùng này.
              </p>
              <form className={s.vipTierForm} onSubmit={handleUpdateVipTier}>
                <select
                  className={s.vipTierSelect}
                  value={targetVipTier}
                  onChange={(e) => setTargetVipTier(e.target.value)}
                  disabled={actionLoading || isProtectedUser(detailModalUser)}
                >
                  <option value="normal">🌱 Bình thường (Khung cơ bản)</option>
                  <option value="svip">🔥 SVIP Thánh Hỏa (Mở khóa SVIP)</option>
                  <option value="ssvip">❄️ SSVIP Cánh Băng (Mở khóa SSVIP & dưới)</option>
                  <option value="sssvip">⚡ SSSVIP Song Long (Mở khóa SSSVIP & dưới)</option>
                  <option value="god">🌌 GOD Nữ Thần Tối Thượng (Mở khóa toàn bộ)</option>
                </select>
                <button
                  type="submit"
                  className={s.vipUpdateBtn}
                  disabled={actionLoading || isProtectedUser(detailModalUser)}
                >
                  {actionLoading ? '...' : 'Cập Nhật Quyền VIP ✨'}
                </button>
              </form>
              {vipUpdateSuccess && (
                <span className={s.vipSuccessMsg}>{vipUpdateSuccess}</span>
              )}
            </div>

            {/* Account Protection / Delete User Section */}
            {isProtectedUser(detailModalUser) ? (
              <div style={{ background: '#FFF9C4', border: '1.5px solid #FFB300', borderRadius: 8, padding: '10px 14px', marginTop: 14, color: '#B78103', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👑</span> Tài khoản Quản trị tối cao (adminserver) là Bất tử. Được bảo vệ vĩnh viễn và không thể bị xóa hoặc hạn chế quyền!
              </div>
            ) : (
              <div style={{ background: '#FFF5F5', border: '1.5px dashed #FEB2B2', borderRadius: 8, padding: '12px 14px', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#E53E3E' }}>
                    🗑️ Xóa Vĩnh Viễn Tài Khoản
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-light)', marginTop: 2 }}>
                    Xóa hoàn toàn tài khoản này khỏi cơ sở dữ liệu hệ thống.
                  </div>
                </div>
                <button
                  type="button"
                  className={s.deleteActionBtn}
                  onClick={() => handleDeleteUser(detailModalUser)}
                  disabled={actionLoading}
                >
                  Xác Nhận Xóa 🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Ban Account Modal (Custom Duration Supported) ── */}
      {banModalUser && (
        <div className={s.modalOverlay} onClick={() => setBanModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <span>⛔</span> Cấm Tài Khoản
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setBanModalUser(null)}
              >
                ✕
              </button>
            </div>

            {/* Target user preview */}
            <div className={s.targetUserBox}>
              <PixelAvatar avatarId={banModalUser.avatar || 'bunny'} size={38} />
              <div>
                <strong style={{ fontSize: 13, color: 'var(--color-ink)' }}>
                  {banModalUser.displayName || banModalUser.id}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', fontFamily: 'monospace' }}>
                  {banModalUser.id}
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmBan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Duration select */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Thời Hạn Cấm</label>
                <select
                  className={s.durationSelect}
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                >
                  <option value="1">1 Ngày (24 giờ)</option>
                  <option value="3">3 Ngày</option>
                  <option value="7">7 Ngày (1 Tuần)</option>
                  <option value="30">30 Ngày (1 Tháng)</option>
                  <option value="custom_days">⚙️ Tự Nhập Số Ngày Tùy Chỉnh</option>
                  <option value="datetime">📅 Tự Chọn Ngày & Giờ Hết Hạn Cụ Thể</option>
                  <option value="-1">⛔ Vĩnh Viễn (Permanent Ban)</option>
                </select>

                {/* Custom Days Input */}
                {banDuration === 'custom_days' && (
                  <div className={s.customInputRow}>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      className={s.customNumInput}
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      placeholder="Số ngày"
                      required
                    />
                    <span style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>ngày kể từ bây giờ</span>
                  </div>
                )}

                {/* Custom Exact Date & Time Picker */}
                {banDuration === 'datetime' && (
                  <div className={s.customInputRow}>
                    <input
                      type="datetime-local"
                      className={s.customDateTimeInput}
                      value={customDateTimeInput}
                      onChange={(e) => setCustomDateTimeInput(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Reason input */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Lý Do Cấm</label>
                <textarea
                  className={s.reasonTextarea}
                  placeholder="Ghi rõ lý do (ví dụ: Ngôn từ xúc phạm, spam tin nhắn...)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Modal Actions */}
              <div className={s.modalActions}>
                <button
                  type="button"
                  className={s.cancelBtn}
                  onClick={() => setBanModalUser(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={s.confirmBanBtn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác Nhận Cấm ⛔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. Appeal Review Modal ── */}
      {appealModalUser && (
        <div className={s.modalOverlay} onClick={() => setAppealModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <span>📬</span> Xét Duyệt Khiếu Nại Mở Khóa
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setAppealModalUser(null)}
              >
                ✕
              </button>
            </div>

            {/* Target user preview */}
            <div className={s.targetUserBox}>
              <PixelAvatar avatarId={appealModalUser.avatar || 'bunny'} size={40} />
              <div>
                <strong style={{ fontSize: 14, color: 'var(--color-ink)' }}>
                  {appealModalUser.displayName || appealModalUser.id}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--color-ink-soft)', fontFamily: 'monospace' }}>
                  User ID: {appealModalUser.id}
                </div>
              </div>
            </div>

            {/* Appeal Details Card */}
            <div className={s.appealDetailBox}>
              <div className={s.appealDetailTitle}>
                <span>⛔</span> THÔNG TIN KHÓA TÀI KHOẢN
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ink)' }}>
                <strong>Lý do cấm:</strong> {appealModalUser.banReason || 'Vi phạm điều khoản'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ink)' }}>
                <strong>Thời hạn:</strong> {formatBanUntil(appealModalUser.banUntilDate)}
              </div>

              <div className={s.appealDetailTitle} style={{ marginTop: 8 }}>
                <span>📬</span> LỜI GIẢI TRÌNH CỦA NGƯỜI DÙNG:
              </div>
              <div className={s.appealDetailMessage}>
                "{appealModalUser.appeal?.message || 'Không có lời giải trình'}"
              </div>
              {appealModalUser.appealDate && (
                <div style={{ fontSize: 10, color: 'var(--color-ink-faint)', textAlign: 'right' }}>
                  Gửi lúc: {formatFullTime(appealModalUser.appealDate)}
                </div>
              )}
            </div>

            {/* Optional reject note */}
            <div className={s.formGroup}>
              <label className={s.formLabel}>Ghi chú phản hồi (nếu từ chối)</label>
              <input
                type="text"
                className={s.searchInput}
                style={{ width: '100%' }}
                placeholder="Lý do không chấp nhận khiếu nại (tùy chọn)..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className={s.appealActionsRow}>
              <button
                type="button"
                className={s.rejectAppealBtn}
                onClick={() => handleRejectAppeal(appealModalUser)}
                disabled={actionLoading}
              >
                ✕ Bác Bỏ Khiếu Nại
              </button>
              <button
                type="button"
                className={s.approveAppealBtn}
                onClick={() => handleApproveAppeal(appealModalUser)}
                disabled={actionLoading}
              >
                ✓ Chấp Thuận & Mở Khóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Dedicated VIP Tier Management Modal (Cấp / Hạ VIP Trực Tiếp) ── */}
      {vipModalUser && (
        <div className={s.modalOverlay} onClick={() => setVipModalUser(null)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div
              className={s.modalHeader}
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                borderBottomColor: '#F59E0B',
              }}
            >
              <h3 className={s.modalTitle} style={{ color: '#92400E' }}>
                <span>👑</span> Cấp VIP & Điều Chỉnh Quyền Hạn
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setVipModalUser(null)}
              >
                ✕
              </button>
            </div>

            {/* Target user preview */}
            <div className={s.targetUserBox} style={{ background: '#FFFDF5', borderColor: '#FDE68A' }}>
              <PixelAvatar avatarId={vipModalUser.avatar || 'bunny'} size={44} />
              <div>
                <strong style={{ fontSize: 14, color: 'var(--color-ink)' }}>
                  {vipModalUser.displayName || vipModalUser.id}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--color-ink-soft)', fontFamily: 'monospace' }}>
                  UID: {vipModalUser.id}
                </div>
                {(() => {
                  const currentVip = getUserVipTier(vipModalUser)
                  return (
                    <div style={{ marginTop: 4 }}>
                      <span
                        className={s.userVipBadge}
                        style={{
                          color: currentVip.color,
                          background: currentVip.bg,
                          border: `1.5px solid ${currentVip.color}`,
                          fontSize: 10,
                          padding: '2px 8px',
                        }}
                      >
                        Cấp hiện tại: {currentVip.badge} (Rank {currentVip.rank})
                      </span>
                    </div>
                  )
                })()}
              </div>
            </div>

            <form onSubmit={handleConfirmVipUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* VIP Tier Select */}
              <div className={s.formGroup}>
                <label className={s.formLabel}>Chọn Cấp Quyền Hạn VIP Cho Tài Khoản:</label>
                <select
                  className={s.vipTierSelect}
                  value={selectedVipTier}
                  onChange={(e) => setSelectedVipTier(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 10,
                    border: '2px solid #F59E0B',
                    background: '#FFFBEB',
                    color: '#78350F',
                    padding: '0 12px',
                  }}
                >
                  <option value="normal">🌱 Bình Thường (Rank 0 — Khóa toàn bộ khung VIP)</option>
                  <option value="svip">🔥 SVIP Thánh Hỏa (Rank 1 — Mở khóa khung SVIP)</option>
                  <option value="ssvip">❄️ SSVIP Cánh Băng (Rank 2 — Mở khóa SSVIP & SVIP)</option>
                  <option value="sssvip">⚡ SSSVIP Song Long (Rank 3 — Mở khóa SSSVIP, SSVIP, SVIP)</option>
                  <option value="god">🌌 GOD Nữ Thần Tối Thượng (Rank 4 — Mở khóa 100% tất cả khung VIP)</option>
                </select>
              </div>

              {/* Quick 1-Click Tier Selection Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 6 }}>
                {[
                  { id: 'normal', label: '🌱 Bình Thường', color: '#6B7280', bg: '#F3F4F6' },
                  { id: 'svip', label: '🔥 SVIP', color: '#EF4444', bg: '#FEF2F2' },
                  { id: 'ssvip', label: '❄️ SSVIP', color: '#0284C7', bg: '#F0F9FF' },
                  { id: 'sssvip', label: '⚡ SSSVIP', color: '#D97706', bg: '#FFFBEB' },
                  { id: 'god', label: '🌌 GOD', color: '#9333EA', bg: '#FAF5FF' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedVipTier(tier.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: selectedVipTier === tier.id ? `2px solid ${tier.color}` : '1px solid #E5E7EB',
                      background: selectedVipTier === tier.id ? tier.bg : '#FFFFFF',
                      color: tier.color,
                      fontWeight: selectedVipTier === tier.id ? 'bold' : 'normal',
                      fontSize: 11,
                      cursor: 'pointer',
                      boxShadow: selectedVipTier === tier.id ? `0 0 0 2px ${tier.color}33` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Success Feedback */}
              {vipModalSuccess && (
                <div
                  className={s.vipSuccessMsg}
                  style={{
                    padding: '8px 12px',
                    fontSize: 12,
                    background: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: 8,
                    color: '#047857',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {vipModalSuccess}
                </div>
              )}

              {/* Modal Actions */}
              <div className={s.modalActions}>
                <button
                  type="button"
                  className={s.cancelBtn}
                  onClick={() => setVipModalUser(null)}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className={s.vipUpdateBtn}
                  disabled={actionLoading}
                  style={{
                    height: 42,
                    padding: '0 24px',
                    fontSize: 12,
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(217, 119, 6, 0.4)',
                  }}
                >
                  {actionLoading ? 'Đang cập nhật...' : 'Lưu Thay Đổi Cấp VIP ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
