import React from 'react'

/**
 * InkIcon — Bộ Icon Vector Thủy Mặc & Tiên Nghịch (Anti-Aliased & Ink-Stroke Design)
 * Thiết kế nét cọ thư pháp mềm mại, khử hoàn toàn răng cưa, đậm phong cách Tiên Hiệp.
 */
export default function InkIcon({ name, size = 16, className = '', color = 'currentColor', style = {} }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: '1.75',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style: { verticalAlign: 'middle', display: 'inline-block', flexShrink: 0, ...style },
  }

  switch (name) {
    // 🗡️ Phi Kiếm / Sát Lục Kiếm Ý (Sword)
    case 'sword':
      return (
        <svg {...iconProps}>
          <path d="M14.5 4.5l5 5L7 22l-4-1 1-4L14.5 4.5z" />
          <path d="M13 3l2 2" />
          <path d="M17 7l2 2" />
          <path d="M18.5 2.5l3 3" />
          <path d="M4 19l2 2" />
        </svg>
      )

    // 🛡️ Hộ Thể Tiên Trận / Bất Khả Xâm Phạm (Shield)
    case 'shield':
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 6v12" strokeDasharray="1 2" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      )

    // 👑 Đại Thừa Đạo Tổ / Vương Miện Cổ Thần (Crown)
    case 'crown':
      return (
        <svg {...iconProps}>
          <path d="M2 7l4 12h12l4-12-6 5-4-8-4 8-6-5z" />
          <circle cx="12" cy="15" r="1.5" fill={color} />
          <circle cx="6" cy="15" r="1" fill={color} />
          <circle cx="18" cy="15" r="1" fill={color} />
        </svg>
      )

    // 🔥 U Minh Ma Diễm / Linh Hỏa (Flame)
    case 'flame':
      return (
        <svg {...iconProps}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      )

    // 👁️ Thần Thức Chi Nhãn / Thông Thiên Nhãn (Eye)
    case 'eye':
      return (
        <svg {...iconProps}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 9a3 3 0 0 1 3 3" strokeWidth="2.2" />
        </svg>
      )

    // ⛔ Phong Ấn / Trấn Áp Trận (Ban)
    case 'ban':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M4.93 4.93l14.14 14.14" strokeWidth="2" />
        </svg>
      )

    // 🔓 Phá Giải Phong Ấn (Unlock)
    case 'unlock':
      return (
        <svg {...iconProps}>
          <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          <circle cx="12" cy="16" r="1.5" fill={color} />
        </svg>
      )

    // 🔒 Phong Tỏa Mật Ấn (Lock)
    case 'lock':
      return (
        <svg {...iconProps}>
          <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1.5" fill={color} />
        </svg>
      )

    // 🔄 Quét Thần Thức / Luân Hồi Trận (Refresh / Bát Quái)
    case 'refresh':
      return (
        <svg {...iconProps}>
          <path d="M21.5 2v6h-6" />
          <path d="M2.5 22v-6h6" />
          <path d="M19.94 15.5A9 9 0 0 1 4.06 8.5" />
          <path d="M4.06 8.5A9 9 0 0 1 19.94 15.5" />
        </svg>
      )

    // 🔍 Thần Niệm Tầm Tung (Search)
    case 'search':
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeWidth="2.2" />
        </svg>
      )

    // 👤 Tu Sĩ Linh Thể (User)
    case 'user':
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )

    // 👥 Chư Thiên Đạo Lữ (Users)
    case 'users':
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M7 21v-2a4 4 0 0 1 3-3.87" />
          <path d="M12 17v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" />
          <circle cx="8" cy="7" r="3.5" />
          <circle cx="16" cy="7" r="3" />
        </svg>
      )

    // 📱 Bản Mệnh Pháp Bảo / Thiết Bị (Device)
    case 'device':
      return (
        <svg {...iconProps}>
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
        </svg>
      )

    // 🌐 Tinh Vực Tinh Đồ / Tọa Độ IP (Globe)
    case 'globe':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )

    // 🗝️ Ngọc Giản Mật Mã / Mật Khẩu (Key)
    case 'key':
      return (
        <svg {...iconProps}>
          <path d="M21 2l-2 2m-1.5 1.5L14 9l-3-3L3.5 13.5a5 5 0 1 0 7 7L18 13l2-2" />
          <circle cx="7.5" cy="16.5" r="2" fill={color} />
        </svg>
      )

    // ✨ Linh Quang Đan Vận (Sparkles)
    case 'sparkles':
      return (
        <svg {...iconProps}>
          <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" fill="currentColor" fillOpacity="0.15" />
          <path d="M19 17l.75 2.25L22 20l-2.25.75L19 23l-.75-2.25L16 20l2.25-.75L19 17z" />
          <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z" />
        </svg>
      )

    // 📜 Thiên Đạo Ngọc Giản (Scroll)
    case 'scroll':
      return (
        <svg {...iconProps}>
          <path d="M8 2h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
          <path d="M4 16a2 2 0 0 0 2 2h12" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      )

    // 💎 Linh Thạch / Cực Phẩm Pháp Bảo (Gem)
    case 'gem':
      return (
        <svg {...iconProps}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          <path d="M10 3l-2 6 4 12" />
          <path d="M14 3l2 6-4 12" />
          <path d="M2 9h20" />
        </svg>
      )

    // ⚡ Tử Tiêu Lôi Điện / Cưỡng Chế Lệnh (Bolt)
    case 'bolt':
      return (
        <svg {...iconProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.15" />
        </svg>
      )

    // ⏳ Niên Luân / Thời Gian (Clock)
    case 'clock':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )

    // ⚠️ Thiên Kiếp Cảnh Báo (Warning)
    case 'warning':
      return (
        <svg {...iconProps}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2.2" />
          <circle cx="12" cy="17" r="1" fill={color} />
        </svg>
      )

    // ✅ Khế Ước Ấn Ký / Thành Công (Check)
    case 'check':
      return (
        <svg {...iconProps}>
          <polyline points="20 6 9 17 4 12" strokeWidth="2.4" />
        </svg>
      )

    // ✖ Thu Hồi / Đóng (Close)
    case 'close':
      return (
        <svg {...iconProps}>
          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.2" />
          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.2" />
        </svg>
      )

    // ♂ Dương Tu / Nam
    case 'boy':
      return (
        <svg {...iconProps}>
          <circle cx="10" cy="14" r="5" />
          <line x1="19" y1="5" x2="13.6" y2="10.4" strokeWidth="2" />
          <polyline points="14 5 19 5 19 10" strokeWidth="2" />
        </svg>
      )

    // ♀ Âm Tu / Nữ
    case 'girl':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="9" r="5" />
          <line x1="12" y1="14" x2="12" y2="21" strokeWidth="2" />
          <line x1="9" y1="18" x2="15" y2="18" strokeWidth="2" />
        </svg>
      )

    // 🚀 Phá Không Phi Thăng (Rocket)
    case 'rocket':
      return (
        <svg {...iconProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12l-4 4" />
          <path d="M15 6l4 4" />
        </svg>
      )

    // 🚪 Thoát Xuất Đạo Tràng (Logout)
    case 'logout':
      return (
        <svg {...iconProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" strokeWidth="2" />
          <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
        </svg>
      )

    // 🟢 Linh Đăng Tương Thông / Active Dot (activeDot)
    case 'activeDot':
      return (
        <svg {...iconProps} viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4" fill={color} />
          <circle cx="6" cy="6" r="5.5" stroke={color} strokeWidth="1" opacity="0.4" />
        </svg>
      )

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}
