import React, { useState } from 'react'
import InkIcon from './InkIcon'

/**
 * BentoCard — Spotlight-reactive card container inspired by Aceternity UI & Magic UI
 */
function BentoCard({ children, accentColor = '#38bdf8', hasBorderBeam = false, className = '', style = {} }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 28, 0.85) 100%)',
        border: `1px solid ${isHovered ? accentColor : 'rgba(255, 255, 255, 0.08)'}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered
          ? `0 12px 28px -8px rgba(0, 0, 0, 0.6), 0 0 20px -4px ${accentColor}33`
          : '0 4px 16px rgba(0, 0, 0, 0.4)',
        ...style,
      }}
      className={className}
    >
      {/* Aceternity Cursor Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${accentColor}18, transparent 80%)`,
          transition: 'opacity 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Magic UI Animated Border Beam */}
      {hasBorderBeam && (
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: '16px',
            padding: '1.5px',
            background: `conic-gradient(from 0deg, transparent 0 340deg, ${accentColor} 360deg)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'magicBorderSpin 3s linear infinite',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}

/**
 * AdminBentoStats — Bento Grid Metrics Component
 */
export default function AdminBentoStats({ metrics = {} }) {
  const {
    total = 0,
    online = 0,
    vip = 0,
    framed = 0,
    banned = 0,
    appeals = 0,
  } = metrics

  return (
    <>
      <style>{`
        @keyframes magicBorderSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes onlinePulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          50% { opacity: 0.8; transform: scale(1.08); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
        }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Card 1: Tổng Cư Dân */}
        <BentoCard accentColor="#38bdf8">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tổng Cư Dân
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <InkIcon name="users" size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {total}
            </span>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
              ✦ Đã Đồng Bộ
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            Cơ sở dữ liệu đám mây thời gian thực
          </div>
        </BentoCard>

        {/* Card 2: Đang Trực Tuyến */}
        <BentoCard accentColor="#34d399">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Trực Tuyến (Live)
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <InkIcon name="flame" size={18} color="#34d399" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#34d399', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {online}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#34d399',
                  animation: 'onlinePulseGlow 1.8s infinite',
                }}
              />
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>ACTIVE</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            Người dùng mở app trong 3 phút qua
          </div>
        </BentoCard>

        {/* Card 3: Cư Dân VIP */}
        <BentoCard accentColor="#f59e0b">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cấp Bậc VIP
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <InkIcon name="crown" size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#fbbf24', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {vip}
            </span>
            <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600' }}>
              👑 Danh Hiệu
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            Cấp bậc GOD, SSSVIP, SSVIP, SVIP
          </div>
        </BentoCard>

        {/* Card 4: Khung Danh Hiệu */}
        <BentoCard accentColor="#ec4899">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Khung Avatar
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
              <InkIcon name="sparkles" size={18} color="#ec4899" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#f472b6', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {framed}
            </span>
            <span style={{ fontSize: '11px', color: '#f472b6', fontWeight: '600' }}>
              ✨ Đang Đeo
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            Khung hoạt họa Mecha & Thần thoại
          </div>
        </BentoCard>

        {/* Card 5: Tài Khoản Bị Khóa */}
        <BentoCard accentColor="#f43f5e">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Đang Bị Khóa
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <InkIcon name="ban" size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#fb7185', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {banned}
            </span>
            <span style={{ fontSize: '11px', color: '#fb7185', fontWeight: '600' }}>
              🔒 Kỷ Luật
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            Tạm khóa hoặc đình chỉ vĩnh viễn
          </div>
        </BentoCard>

        {/* Card 6: Hàng Chờ Khiếu Nại (Có Animated Border Beam nếu có đơn chờ duyệt) */}
        <BentoCard
          accentColor="#eab308"
          hasBorderBeam={appeals > 0}
          style={appeals > 0 ? { border: '1.5px solid rgba(234, 179, 8, 0.5)' } : {}}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Khiếu Nại
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
              <InkIcon name="scroll" size={18} color="#eab308" />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: appeals > 0 ? '#fde047' : '#94a3b8', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {appeals}
            </span>
            <span style={{ fontSize: '11px', color: appeals > 0 ? '#fde047' : '#64748b', fontWeight: '600' }}>
              {appeals > 0 ? '⚡ Chờ Duyệt' : '✦ Trống'}
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: appeals > 0 ? '#fde047' : '#64748b' }}>
            {appeals > 0 ? 'Có đơn xin mở khóa cần xử lý ngay' : 'Không có khiếu nại tồn đọng'}
          </div>
        </BentoCard>
      </div>
    </>
  )
}
