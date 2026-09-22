import React from 'react'
import PixelAvatar from '../PixelAvatar'
import InkIcon from './InkIcon'
import { getUserVipTier } from '../../utils/vipTiers'
import { formatUserActivityStatus } from '../../lib/auth'
import { isProtectedUser } from '../../lib/admin'
import { AVATAR_FRAMES } from '../AvatarFrameOverlay'

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

export default function AdminCitizenTable({
  users = [],
  loading = false,
  onOpenDetail,
  onOpenVipModal,
  onOpenBanModal,
  onOpenAppealModal,
  onUnbanUser,
  onDeleteUser,
  actionLoading = false,
}) {
  const getFrameData = (frameId) => {
    return AVATAR_FRAMES.find((f) => f.id === frameId) || AVATAR_FRAMES[0]
  }

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'rgba(10, 15, 28, 0.85)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                fontSize: '11.5px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <th style={{ padding: '14px 16px', width: '60px' }}>Cư Dân</th>
              <th style={{ padding: '14px 16px' }}>Định Danh & Cấp Bậc</th>
              <th style={{ padding: '14px 16px' }}>Khung Danh Hiệu</th>
              <th style={{ padding: '14px 16px' }}>Trạng Thái / Hoạt Động</th>
              <th style={{ padding: '14px 16px' }}>Hạ Tầng (IP / Máy)</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', width: '120px' }}>Hồ Sơ</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', minWidth: '160px' }}>Thao Tác Quản Trị</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#38bdf8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ animation: 'magicBorderSpin 1s linear infinite', display: 'inline-block' }}>
                      <InkIcon name="refresh" size={24} color="#38bdf8" />
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Đang nạp dữ liệu cư dân thời gian thực...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <InkIcon name="search" size={32} color="#475569" />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Không tìm thấy cư dân nào phù hợp với bộ lọc.</span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const uVip = getUserVipTier(u)
                const act = formatUserActivityStatus(u.lastActiveAtDate)
                const frameId = u.avatarFrame || u.frame || (u.vipTier === 'god' ? 'god_cosmic' : u.vipTier === 'sssvip' ? 'vip10_thunder' : u.vipTier === 'ssvip' ? 'vip9_frost' : u.vipTier === 'svip' ? 'vip8_fire' : 'none')
                const frameData = getFrameData(frameId)
                const isImmune = isProtectedUser(u)

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Column 1: Avatar with Animated Pixel Frame */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px' }}>
                        <PixelAvatar
                          avatarId={u.avatar || 'bunny'}
                          frameId={frameId}
                          size={40}
                          border={false}
                        />
                        {/* Live Online Pip */}
                        {act.isOnline && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#34d399',
                              border: '2px solid #0f172a',
                              boxShadow: '0 0 8px #34d399',
                            }}
                            title="Đang trực tuyến"
                          />
                        )}
                      </div>
                    </td>

                    {/* Column 2: Identity & VIP Tier */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                            {u.displayName || u.username || u.id}
                          </span>
                          {u.isAdmin && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#38bdf8',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                              }}
                            >
                              Admin
                            </span>
                          )}
                          {/* Interactive VIP Badge */}
                          <span
                            onClick={() => onOpenVipModal?.(u)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              color: uVip.color,
                              background: uVip.bg,
                              border: `1px solid ${uVip.color}`,
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: `0 0 10px ${uVip.color}33`,
                              transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            title="Bấm để điều chỉnh cấp bậc VIP"
                          >
                            <InkIcon
                              name={
                                uVip.id === 'god'
                                  ? 'crown'
                                  : uVip.id === 'sssvip'
                                  ? 'bolt'
                                  : uVip.id === 'ssvip'
                                  ? 'gem'
                                  : uVip.id === 'svip'
                                  ? 'flame'
                                  : 'sparkles'
                              }
                              size={11}
                              color={uVip.color}
                            />
                            <span>{uVip.badge}</span>
                          </span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace' }}>
                          #{u.id}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Equipped Frame Badge */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div
                        onClick={() => onOpenDetail?.(u)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: frameId !== 'none' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${frameId !== 'none' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: frameId !== 'none' ? '#f472b6' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                        title="Bấm để vào Frame Studio"
                      >
                        <span>{frameData.icon}</span>
                        <span>{frameData.name}</span>
                      </div>
                    </td>

                    {/* Column 4: Status / Activity */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {isImmune ? (
                          <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <InkIcon name="crown" size={13} color="#fbbf24" />
                            <span>Bất Tử // Immune</span>
                          </span>
                        ) : u.isBanned ? (
                          <div>
                            <span style={{ color: '#fb7185', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <InkIcon name="ban" size={13} color="#fb7185" />
                              <span>Khóa ({formatBanUntil(u.banUntilDate)})</span>
                            </span>
                            {u.appeal?.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => onOpenAppealModal?.(u)}
                                style={{
                                  marginTop: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(234, 179, 8, 0.2)',
                                  border: '1px solid #eab308',
                                  color: '#fde047',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                <InkIcon name="scroll" size={11} color="#fde047" />
                                <span>Xét Đơn Khiếu Nại</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#34d399', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <InkIcon name="check" size={12} color="#34d399" />
                            <span>Bình Thường</span>
                          </span>
                        )}

                        <div style={{ fontSize: '11px', color: act.isOnline ? '#34d399' : '#64748b' }}>
                          {act.text}
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Telemetry (IP / Device) */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '11.5px', color: '#38bdf8', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <InkIcon name="globe" size={12} color="#38bdf8" />
                          <span>{u.lastLoginIp || '—'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <InkIcon name="device" size={12} color="#64748b" />
                          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.lastDevice || '—'}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Column 6: Dossier Detail Button */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onOpenDetail?.(u)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                      >
                        <InkIcon name="eye" size={13} color="#38bdf8" />
                        <span>Hồ Sơ</span>
                      </button>
                    </td>

                    {/* Column 7: Actions */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* VIP Assign */}
                        <button
                          type="button"
                          onClick={() => onOpenVipModal?.(u)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            color: '#fbbf24',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                          title="Cấp VIP"
                        >
                          <InkIcon name="crown" size={13} color="#fbbf24" />
                        </button>

                        {/* Ban / Unban */}
                        {!isImmune && (
                          u.isBanned ? (
                            <button
                              type="button"
                              onClick={() => onUnbanUser?.(u)}
                              disabled={actionLoading}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: 'rgba(52, 211, 153, 0.12)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                color: '#34d399',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              title="Gỡ lệnh khóa tài khoản"
                            >
                              Gỡ Khóa
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenBanModal?.(u)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.25)',
                                color: '#fb7185',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              title="Khóa tài khoản vi phạm"
                            >
                              Khóa
                            </button>
                          )
                        )}

                        {/* Delete User */}
                        {!isImmune && (
                          <button
                            type="button"
                            onClick={() => onDeleteUser?.(u)}
                            disabled={actionLoading}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: '#fb7185',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                            title="Xóa vĩnh viễn tài khoản"
                          >
                            <InkIcon name="close" size={12} color="#fb7185" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
