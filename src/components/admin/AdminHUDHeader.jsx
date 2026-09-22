import React, { useState, useEffect } from 'react'
import PixelAvatar from '../PixelAvatar'
import InkIcon from './InkIcon'

/**
 * AdminHUDHeader — Origin UI inspired Tactical Header
 * Displays active operator identity, telemetry status, clock, and quick navigation.
 */
export default function AdminHUDHeader({ user, onBack, onLogout, onOpenAvatarModal }) {
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: Navigation & Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.color = '#f8fafc'
            e.currentTarget.style.borderColor = '#38bdf8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.color = '#94a3b8'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
          }}
          title="Quay lại giao diện người dùng"
        >
          <InkIcon name="sword" size={14} color="#38bdf8" />
          <span>Về Ứng Dụng</span>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: '800',
                color: '#f8fafc',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>AETHER // COMMAND CONSOLE</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '10.5px',
                  color: '#38bdf8',
                  fontWeight: '700',
                }}
              >
                PRO V8.2
              </span>
            </h1>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
            Đại bản doanh quản trị hệ thống Mine Diary • Khung cảnh 3D thời gian thực
          </div>
        </div>
      </div>

      {/* Right: Operator Identity, Telemetry & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Live Clock & Latency Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(10, 15, 28, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          <span style={{ color: '#38bdf8', fontWeight: '700' }}>{timeStr || '--:--:--'}</span>
          <span style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399' }} />
            <span>12ms</span>
          </span>
        </div>

        {/* Operator Badge (Clickable to change Avatar & Frame) */}
        <div
          onClick={onOpenAvatarModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenAvatarModal?.()
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            cursor: onOpenAvatarModal ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (onOpenAvatarModal) {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)'
              e.currentTarget.style.borderColor = '#38bdf8'
            }
          }}
          onMouseLeave={(e) => {
            if (onOpenAvatarModal) {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)'
            }
          }}
          title="Nhấn để đổi avatar, pixel art và khung viền của Quản trị viên ✨"
        >
          <PixelAvatar
            avatarId={user?.avatar || '/admin-avatar.webm'}
            frameId={user?.avatarFrame || user?.frame || 'none'}
            size={34}
            border={false}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#f8fafc' }}>
              {user?.displayName || user?.name || 'Super Admin'}
            </span>
            <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: '600' }}>
              ✦ Quản Trị Viên (Nhấn để đổi avatar)
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#fb7185',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'
            e.currentTarget.style.borderColor = '#f43f5e'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)'
          }}
          title="Đăng xuất khỏi phiên quản trị"
        >
          <InkIcon name="logout" size={14} color="#fb7185" />
          <span>Thoát</span>
        </button>
      </div>
    </header>
  )
}
