import React, { useRef } from 'react'
import InkIcon from './InkIcon'

/**
 * AdminCommandBar — Origin UI inspired Tactical Command Bar & Segmented Filter Switchers
 */
export default function AdminCommandBar({
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onFilterChange,
  metrics = {},
  loading = false,
  onRefresh,
}) {
  const searchInputRef = useRef(null)

  const filterTabs = [
    { id: 'all', label: 'Tất Cả', count: metrics.total || 0, icon: null },
    { id: 'online', label: 'Online', count: metrics.online || 0, icon: 'flame', color: '#34d399' },
    { id: 'vip', label: 'VIP', count: metrics.vip || 0, icon: 'crown', color: '#fbbf24' },
    { id: 'framed', label: 'Có Khung', count: metrics.framed || 0, icon: 'sparkles', color: '#f472b6' },
    { id: 'active', label: 'Hoạt Động', count: metrics.active || 0, icon: null },
    { id: 'banned', label: 'Bị Khóa', count: metrics.banned || 0, icon: 'ban', color: '#fb7185' },
    { id: 'appeals', label: 'Khiếu Nại', count: metrics.appeals || 0, icon: 'scroll', color: '#fde047' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Upper Row: Search Field & Action Utilities */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Tactical Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
            minWidth: '280px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(10, 15, 28, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#38bdf8'
            e.currentTarget.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.2)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <InkIcon name="search" size={17} color="#38bdf8" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tra cứu cư dân (Tên, UID, Email, IP, Thiết bị)..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '13.5px',
              fontFamily: 'inherit',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Xóa tìm kiếm"
            >
              <InkIcon name="close" size={14} />
            </button>
          )}
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#64748b',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Right Tools: Live Sync Pill & Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              fontSize: '12px',
              color: '#38bdf8',
              fontWeight: '600',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
            <span>REALTIME CLOUD SYNC</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)'
            }}
            title="Đồng bộ lại danh sách cư dân"
          >
            <span style={{ display: 'inline-block', animation: loading ? 'magicBorderSpin 1s linear infinite' : 'none' }}>
              <InkIcon name="refresh" size={14} color="#38bdf8" />
            </span>
            <span>{loading ? 'Đang tải...' : 'Làm Mới'}</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Origin UI Segmented Switcher Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange?.(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(14, 165, 233, 0.12) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.07)'}`,
                color: isActive ? '#f8fafc' : '#94a3b8',
                fontSize: '12.5px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.color = '#f1f5f9'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  e.currentTarget.style.color = '#94a3b8'
                }
              }}
            >
              {tab.icon && <InkIcon name={tab.icon} size={13} color={tab.color || '#38bdf8'} />}
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
