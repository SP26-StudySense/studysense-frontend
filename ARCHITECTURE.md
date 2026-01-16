# StudySense Frontend - Hướng Dẫn Cấu Trúc Project

Tài liệu này mô tả chi tiết cấu trúc code của dự án StudySense Frontend để các thành viên trong team có thể hiểu và phát triển các tính năng của mình.

---

## 📁 Tổng Quan Cấu Trúc Thư Mục

```
studysense-frontend/
├── src/                      # Source code chính
│   ├── app/                  # Next.js App Router (Routes)
│   ├── features/             # Các module tính năng (Business Logic)
│   ├── shared/               # Code dùng chung
│   ├── components/           # UI Components cấp cao
│   ├── store/                # Zustand stores (Client State)
│   ├── providers/            # React Context Providers
│   └── middleware.ts         # Next.js Middleware (Route Protection)
│
├── public/                   # Static files
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
└── package.json              # Dependencies
```

---

## 🗂️ Chi Tiết Từng Thư Mục

### 1. `src/app/` - Next.js App Router

Đây là nơi định nghĩa các routes của ứng dụng theo chuẩn Next.js 14+ App Router.

| File/Folder | Mô Tả |
|-------------|-------|
| `layout.tsx` | Root layout, wrap toàn bộ app với providers, fonts |
| `page.tsx` | Trang chủ (redirect về `/public/page.tsx`) |
| `globals.css` | Global CSS styles, Tailwind directives, custom utilities |
| `loading.tsx` | Loading UI hiển thị khi chuyển trang |
| `error.tsx` | Error boundary cho lỗi runtime |
| `not-found.tsx` | Trang 404 |

#### Route Groups (Thư mục với dấu ngoặc đơn)

| Folder | Mô Tả | Ví Dụ Routes |
|--------|-------|--------------|
| `(public)/` | Trang công khai, không cần đăng nhập | `/` (Landing Page) |
| `(auth)/` | Trang xác thực (Login, Register) | `/login`, `/register`, `/forgot-password` |
| `(dashboard)/` | Dashboard cho người dùng đã đăng nhập | `/dashboard`, `/profile` |
| `(admin)/` | Trang admin (cần role ADMIN) | `/admin/*` |
| `api/` | API routes (Backend-for-Frontend) | `/api/*` |

**Cách thêm trang mới:**
```
src/app/(dashboard)/my-new-page/
├── page.tsx        # Required: Component chính
├── loading.tsx     # Optional: Loading state
└── layout.tsx      # Optional: Layout riêng
```

---

### 2. `src/features/` - Feature Modules

Đây là nơi chứa **business logic** theo từng domain/tính năng. Mỗi feature là một module độc lập.

#### Danh sách Features

| Feature | Mô Tả |
|---------|-------|
| `auth/` | Xác thực (Login, Register, Logout, Token management) |
| `landing/` | Components cho trang Landing Page |
| `roadmap/` | Quản lý lộ trình học tập |
| `study-plan/` | Kế hoạch học tập của người dùng |
| `session/` | Phiên học tập (tracking thời gian, tiến độ) |
| `survey/` | Khảo sát người dùng |
| `user/` | Quản lý thông tin người dùng |
| `admin/` | Tính năng dành cho admin |
| `analytics/` | Thống kê và báo cáo |

#### Cấu trúc chuẩn của một Feature

```
src/features/[feature-name]/
├── api/                    # React Query queries & mutations
│   ├── queries.ts          # GET requests (useQuery)
│   ├── mutations.ts        # POST/PUT/DELETE requests (useMutation)
│   └── index.ts            # Barrel export
│
├── components/             # UI components của feature
│   ├── ComponentName.tsx
│   └── index.ts
│
├── hooks/                  # Custom hooks
│   ├── use-feature.ts
│   └── index.ts
│
├── schema/                 # Zod validation schemas
│   ├── schema-name.schema.ts
│   └── index.ts
│
├── types.ts                # TypeScript types/interfaces
└── index.ts                # Public exports (barrel file)
```

#### Ví dụ: Feature `auth/`

```
src/features/auth/
├── api/
│   ├── queries.ts          # useCurrentUser()
│   ├── mutations.ts        # useLogin(), useRegister(), useLogout()
│   └── index.ts
│
├── components/
│   ├── AuthLayout.tsx      # Layout wrapper cho auth pages
│   ├── auth-guard.tsx      # AuthGuard, GuestGuard, RoleGuard
│   ├── login-form.tsx      # Form đăng nhập
│   ├── register-form.tsx   # Form đăng ký
│   └── index.ts
│
├── hooks/
│   ├── use-auth.ts         # Hook quản lý auth state
│   └── index.ts
│
├── schema/
│   ├── login.schema.ts     # Zod schema cho login form
│   └── register.schema.ts
│
├── types.ts                # User, LoginRequest, LoginResponse, etc.
└── index.ts
```

---

### 3. `src/shared/` - Code Dùng Chung

Chứa các utilities, types, và components được dùng bởi nhiều features.

| Folder | Mô Tả | Files Quan Trọng |
|--------|-------|------------------|
| `api/` | API client và cấu hình | `client.ts`, `endpoints.ts`, `query-keys.ts` |
| `config/` | Cấu hình ứng dụng | `routes.ts`, `env.ts`, `site.ts` |
| `hooks/` | Shared hooks | `use-media-query.ts`, `use-local-storage.ts` |
| `lib/` | Utility functions | `utils.ts`, `cn.ts` (classnames helper) |
| `types/` | Shared TypeScript types | `api.types.ts`, `common.types.ts` |
| `ui/` | UI components cơ bản | Buttons, Inputs, Cards, etc. |

#### Chi tiết `shared/api/`

| File | Mô Tả |
|------|-------|
| `client.ts` | Axios instance với interceptors (auth token, error handling) |
| `endpoints.ts` | Định nghĩa tất cả API endpoints |
| `query-keys.ts` | React Query keys cho caching |
| `errors.ts` | Error types và handlers |

#### Chi tiết `shared/config/`

| File | Mô Tả |
|------|-------|
| `routes.ts` | Định nghĩa route paths (e.g., `routes.auth.login = '/login'`) |
| `env.ts` | Environment variables validation |
| `site.ts` | Site metadata (title, description) |

---

### 4. `src/components/` - Shared UI Components

Components UI cấp cao dùng chung cho nhiều pages.

```
src/components/
└── ui/
    └── button.tsx          # Reusable Button component
```

---

### 5. `src/store/` - Zustand Stores

Client-side state management với Zustand.

| File | Mô Tả |
|------|-------|
| `ui.store.ts` | UI state (sidebar open/close, modals, etc.) |
| `session.store.ts` | Study session state (timer, progress) |
| `index.ts` | Barrel export |

**Cách sử dụng:**
```tsx
import { useUIStore } from '@/store';

function MyComponent() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  // ...
}
```

---

### 6. `src/providers/` - React Providers

Context providers wrap toàn bộ ứng dụng.

| File | Mô Tả |
|------|-------|
| `index.tsx` | Main Providers wrapper |
| `query-provider.tsx` | React Query configuration |
| `theme-provider.tsx` | Dark/Light mode với next-themes |
| `toast-provider.tsx` | Toast notifications |

---

### 7. `src/middleware.ts` - Route Middleware

Xử lý authentication và authorization ở server-side trước khi render page.

**Chức năng:**
- Check access token trong cookies
- Redirect người dùng chưa đăng nhập về `/login`
- Redirect người dùng đã đăng nhập khỏi auth pages
- Role-based access control cho admin routes

---

## 🎨 Design System

### Tailwind Configuration

File `tailwind.config.ts` chứa:

| Section | Mô Tả |
|---------|-------|
| `colors.brand` | Màu chủ đạo: `lime: #c1ff72`, `dark: #0a0a0a` |
| `animation` | Custom animations: `spin`, `marquee`, `float`, `fade-up` |
| `keyframes` | Định nghĩa keyframes cho animations |

### Global CSS Classes (`globals.css`)

| Class | Mô Tả |
|-------|-------|
| `.glass-panel` | Glassmorphism effect (blur, semi-transparent) |
| `.grid-lines` | Grid pattern background |
| `.no-scrollbar` | Hide scrollbar |

---

## 🔀 Import Aliases

Sử dụng path aliases thay vì relative imports:

```typescript
// ✅ Đúng
import { Button } from '@/components/ui/button';
import { useLogin } from '@/features/auth';
import { apiClient } from '@/shared/api';

// ❌ Sai
import { Button } from '../../../components/ui/button';
```

---

## 📝 Quy Tắc Đặt Tên

| Loại | Convention | Ví Dụ |
|------|------------|-------|
| Files | kebab-case | `login-form.tsx`, `use-auth.ts` |
| Components | PascalCase | `LoginForm`, `AuthLayout` |
| Hooks | camelCase + `use` | `useAuth`, `useLogin` |
| Types/Interfaces | PascalCase | `User`, `LoginRequest` |
| Constants | SCREAMING_SNAKE_CASE | `API_TIMEOUT`, `MAX_RETRIES` |
| Zustand stores | camelCase + `Store` | `useUIStore`, `useSessionStore` |

---

## 🚀 Workflow Thêm Tính Năng Mới

### Bước 1: Tạo Feature Folder
```bash
mkdir -p src/features/my-feature/{api,components,hooks,schema}
touch src/features/my-feature/{types.ts,index.ts}
```

### Bước 2: Định Nghĩa Types
```typescript
// src/features/my-feature/types.ts
export interface MyFeatureItem {
  id: string;
  name: string;
  // ...
}
```

### Bước 3: Thêm API Endpoints
```typescript
// src/shared/api/endpoints.ts
export const ENDPOINTS = {
  // ... existing
  MY_FEATURE: {
    LIST: '/my-feature',
    DETAIL: (id: string) => `/my-feature/${id}`,
  },
};
```

### Bước 4: Thêm Query Keys
```typescript
// src/shared/api/query-keys.ts
export const QUERY_KEYS = {
  // ... existing
  MY_FEATURE: {
    all: ['my-feature'] as const,
    detail: (id: string) => ['my-feature', id] as const,
  },
};
```

### Bước 5: Tạo API Queries/Mutations
```typescript
// src/features/my-feature/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/api/query-keys';
import { ENDPOINTS } from '@/shared/api/endpoints';

export function useMyFeatureList() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_FEATURE.all,
    queryFn: () => apiClient.get(ENDPOINTS.MY_FEATURE.LIST),
  });
}
```

### Bước 6: Tạo Components

### Bước 7: Export từ index.ts
```typescript
// src/features/my-feature/index.ts
export * from './api';
export * from './components';
export * from './hooks';
export * from './types';
```

---

## 🔐 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  LoginForm  │───▶│  useLogin   │───▶│  /api/auth  │
└─────────────┘    │  mutation   │    │   /login    │
                   └─────────────┘    └─────────────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ setTokens() │◀───│   Tokens    │
                   │  (cookies)  │    │  (JWT)      │
                   └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Redirect   │
                   │  Dashboard  │
                   └─────────────┘
```

---

## 📞 Liên Hệ

Nếu có thắc mắc về cấu trúc code, vui lòng liên hệ với team lead hoặc tạo issue trên repository.
