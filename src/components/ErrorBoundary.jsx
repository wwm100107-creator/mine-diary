import React, { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App Crash Caught by ErrorBoundary]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    try {
      localStorage.removeItem('minediary:current_user')
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
    } catch (e) {
      console.error(e)
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE3EC 100%)',
          padding: '20px',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-ui, sans-serif)',
          color: '#4A3E3D',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '2.5px solid #FF8FAB',
            boxShadow: '0 8px 24px rgba(255, 143, 171, 0.25)',
            padding: '28px 24px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🐱💭</div>
            <h2 style={{
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '16px',
              color: '#FF5E7E',
              margin: '0 0 10px',
            }}>
              Úi, Có Chút Trục Trặc Khi Tải!
            </h2>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#7A6B69', margin: '0 0 20px' }}>
              Trang vừa được làm mới quá nhanh hoặc có lỗi dữ liệu tạm thời. Bạn hãy nhấn tải lại nhé!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#FF8FAB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontFamily: 'var(--font-pixel, monospace)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(255, 143, 171, 0.4)',
                }}
              >
                🔄 Tải Lại Trang Ngay
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#F0E6E8',
                  color: '#6B5B5A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                🧹 Xóa Cache & Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
