# StudySense

A modern, professional Next.js frontend for the StudySense learning platform.

## 🏗️ Architecture

This project follows a **Feature-first (Domain-driven)** architecture optimized for scalability and maintainability.

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages (landing, about, etc.)
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (admin)/           # Admin-only pages
│   └── api/               # API route handlers (BFF)
│
├── features/              # Feature modules (business logic)
│   ├── auth/              # Authentication feature
│   │   ├── api/           # React Query queries & mutations
│   │   ├── components/    # Feature-specific components
│   │   ├── schema/        # Zod validation schemas
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── types.ts       # TypeScript types
│   │   └── index.ts       # Barrel export
│   ├── study-plan/
│   ├── roadmap/
│   ├── session/
│   ├── survey/
│   └── admin/
│
├── shared/                # Shared utilities and components
│   ├── api/               # API client, endpoints, errors
│   ├── auth/              # Auth utilities (RBAC, guards)
│   ├── ui/                # UI components (shadcn/ui style)
│   ├── hooks/             # Shared hooks
│   ├── lib/               # Utilities and constants
│   ├── types/             # Shared TypeScript types
│   └── config/            # Configuration (env, routes, site)
│
├── store/                 # Zustand stores
├── providers/             # React context providers
└── middleware.ts          # Next.js middleware
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studysense-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure Explained

### Features (`/src/features`)

Each feature is a self-contained module with its own:
- **api/**: React Query queries and mutations
- **components/**: UI components specific to the feature
- **schema/**: Zod validation schemas
- **hooks/**: Custom hooks for the feature
- **types.ts**: TypeScript type definitions
- **index.ts**: Public exports (barrel file)

### Shared (`/src/shared`)

Common utilities used across features:
- **api/**: Axios client with interceptors, API endpoints, error handling
- **ui/**: Reusable UI components (shadcn/ui style)
- **lib/**: Utility functions and constants
- **types/**: Shared TypeScript types
- **config/**: Environment, routes, and site configuration

### Store (`/src/store`)

Zustand stores for client-side state:
- **ui.store.ts**: UI state (sidebar, modals, etc.)
- **session.store.ts**: Active study session state

### Providers (`/src/providers`)

React context providers:
- **QueryProvider**: React Query configuration
- **ThemeProvider**: Dark/light theme support
- **ToastProvider**: Toast notifications

## 🔧 Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **React Query** - Server state management
- **Zustand** - Client state management
- **Zod** - Schema validation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Radix UI** - Accessible UI primitives

## 📝 Development Guidelines

### Adding a New Feature

1. Create feature folder: `src/features/[feature-name]/`
2. Add required subfolders: `api/`, `components/`, `schema/`
3. Create types: `types.ts`
4. Create barrel export: `index.ts`
5. Add React Query keys to `shared/api/query-keys.ts`
6. Add API endpoints to `shared/api/endpoints.ts`

### Naming Conventions

- **Files**: kebab-case (`login-form.tsx`)
- **Components**: PascalCase (`LoginForm`)
- **Hooks**: camelCase with `use` prefix (`useLogin`)
- **Types**: PascalCase (`LoginRequest`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_TIMEOUT`)

### Import Aliases

```typescript
import { Button } from '@/shared/ui';
import { useLogin } from '@/features/auth';
import { useUIStore } from '@/store';
```

## 🧪 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript check
npm run format       # Format with Prettier
```

## 🔐 Authentication Flow

1. User submits credentials via `LoginForm`
2. `useLogin` mutation calls `/auth/login`
3. Tokens stored in cookies via `setTokens()`
4. Axios interceptor adds token to requests
5. On 401, interceptor attempts token refresh
6. If refresh fails, user redirected to login

## 📱 Route Protection

- **Middleware**: Handles initial route protection
- **AuthGuard**: Client-side protection for dashboard routes
- **GuestGuard**: Redirects authenticated users from auth pages
- **RoleGuard**: Role-based access control

## 🎨 Theming

The app supports dark/light themes via `next-themes`:

```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

## 📄 License

This project is proprietary software. All rights reserved.
