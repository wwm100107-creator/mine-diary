# 🏛️ HỆ THỐNG PHÂN TÁCH ADMIN VÀ END-USER ĐỘC LẬP (SYSTEM ARCHITECTURE SPECIFICATION)

Tài liệu này định nghĩa thiết kế kiến trúc chuẩn Doanh nghiệp (Enterprise-Grade) nhằm tách rời hoàn toàn:
1. **Giao diện & UI/UX (Frontend)**
2. **Luồng đăng nhập & Quản lý phiên (Authentication & Session)**
3. **Điều hướng mạng & Tên miền (Domain & Reverse Proxy Routing)**
4. **Cấu trúc mã nguồn (Monorepo Architecture)**

---

## 1. CẤU TRÚC DOMAIN & MẠNG (SUB-DOMAIN TOPOLOGY)

```
                            INTERNET TRAFFIC
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  NGINX EDGE REVERSE PROXY     │
                   │  Port 80 (HTTP) -> 443 (HTTPS)│
                   └───────┬───────────────┬───────┘
                           │               │
         ┌─────────────────┘               └─────────────────┐
         │ Host: app.example.com                             │ Host: admin.example.com
         ▼                                                   ▼
┌─────────────────────────────┐                     ┌─────────────────────────────┐
│    END-USER REALM           │                     │     ADMIN REALM (ISOLATED)  │
├─────────────────────────────┤                     ├─────────────────────────────┤
│ • UI: user-frontend:3000    │                     │ • UI: admin-frontend:3001   │
│ • API: user-backend:4000    │                     │ • API: admin-backend:4001   │
│ • Policy: Public Accessible │                     │ • Policy: Hardened CSP,     │
│ • Cookie: app.example.com   │                     │   Optional IP/VPN Allowlist │
│ • Token aud: 'user-api'     │                     │ • Cookie: admin.example.com │
└─────────────────────────────┘                     │ • Token aud: 'admin-api'    │
                                                    └─────────────────────────────┘
```

---

## 2. QUẢN LÝ SESSION & TOKEN (ZERO-TRUST SEGREGATION)

Để đảm bảo **Token của User không bao giờ dùng được ở Admin** và ngược lại:

| Tiêu chí | End-User Realm (`app.example.com`) | Admin Realm (`admin.example.com`) |
| :--- | :--- | :--- |
| **Audience (`aud`)** | `user-api` | `admin-api` |
| **Issuer (`iss`)** | `minediary-user-auth` | `minediary-admin-auth` |
| **Signing Secret / Key** | `USER_JWT_SECRET` | `ADMIN_JWT_SECRET` (Hoàn toàn độc lập) |
| **Thời hạn Token (`exp`)** | 7 ngày (Refresh token rotation) | 2 giờ (Bắt buộc xác thực lại, yêu cầu MFA) |
| **Cookie Domain** | `Domain=app.example.com` | `Domain=admin.example.com` |
| **Cookie SameSite** | `SameSite=Lax` | `SameSite=Strict` |

> 🔒 **Cơ chế cô lập Cookie:** Không bao giờ đặt `Domain=.example.com` (có dấu chấm ở đầu). Trình duyệt sẽ cô lập hoàn toàn cookie giữa 2 sub-domain. Một cuộc tấn công XSS ở trang người dùng **không thể đánh cắp hoặc gửi cookie của Admin**.

---

## 3. CẤU TRÚC THƯ MỤC MONOREPO ĐỀ XUẤT (TURBOREPO / PNPM WORKSPACE)

```
mine-diary/
├── apps/
│   ├── web-user/                 # [FRONTEND USER] Chỉ chứa UI người dùng (Nhật ký, Chat, Sức khỏe)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── auth/             # Login / Register dành cho User
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js        # Build ra cổng 3000
│   │
│   ├── web-admin/                # [FRONTEND ADMIN] Chỉ chứa UI Dashboard, Quản trị người dùng, Báo cáo
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── auth/             # Login MFA / Hardware Key dành cho Admin
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js        # Build ra cổng 3001
│   │
│   ├── api-user/                 # [BACKEND USER] REST / WebSocket API cho người dùng
│   └── api-admin/                # [BACKEND ADMIN] REST API quản trị, RBAC chặt chẽ
│
├── packages/                     # [SHARED CODE] Tái sử dụng nhưng cô lập logic
│   ├── ui/                       # Design tokens, Pixel Art buttons, Avatar frames
│   ├── security/                 # Bộ kiểm tra Token, Guard JWT, Mã hóa
│   └── database/                 # Schema, Models, Migrations
│
└── deploy/                       # [DEVOPS & INFRASTRUCTURE]
    ├── nginx/
    │   ├── nginx.conf            # Reverse proxy core
    │   └── conf.d/
    │       ├── app.conf          # Vhost app.example.com
    │       └── admin.conf        # Vhost admin.example.com (Hardened)
    ├── docker/
    │   └── docker-compose.yml    # Điều phối toàn bộ containers
    └── auth/
        └── token-guard.js        # Mã nguồn mẫu kiểm tra Token & Cookie
```
