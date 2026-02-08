# 前端项目架构设计

> **基于 React 18 + TypeScript + Vite**
>
> **设计时间**: 2026-02-07

---

## 1. 技术栈回顾

### 1.1 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |

### 1.2 状态管理
| 技术 | 版本 | 用途 |
|------|------|------|
| Zustand | 4.x | 全局状态 |
| TanStack Query | 5.x | 服务端状态 |

### 1.3 UI组件
| 技术 | 版本 | 用途 |
|------|------|------|
| shadcn/ui | latest | 组件库基础 |
| Tailwind CSS | 3.x | 样式系统 |
| Radix UI | latest | 无样式组件 |

### 1.4 其他
| 技术 | 版本 | 用途 |
|------|------|------|
| React Router | 6.x | 路由 |
| React Hook Form | 7.x | 表单 |
| Zod | 3.x | 表单验证 |
| date-fns | 3.x | 日期处理 |

---

## 2. 项目目录结构

```
frontend/
├── public/                      # 静态资源
│   ├── images/                 # 图片资源
│   │   ├── logo.png
│   │   ├── forum/               # 论坛图标
│   │   └── pokemon/             # Pokemon图标
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                     # App Shell (React Router v6)
│   │   ├── App.tsx              # 根组件
│   │   ├── routes.tsx           # 路由配置
│   │   ├── layout.tsx           # 根布局
│   │   └── providers.tsx        # 全局Provider
│   │
│   ├── pages/                   # 页面组件
│   │   ├── home/                # 首页
│   │   │   └── HomePage.tsx
│   │   ├── forum/               # 论坛
│   │   │   ├── ForumListPage.tsx
│   │   │   ├── ThreadListPage.tsx
│   │   │   └── ThreadDetailPage.tsx
│   │   ├── user/                # 用户相关
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── pokemon/             # Pokemon系统
│   │   │   ├── PokemonCenterPage.tsx
│   │   │   ├── MyPokemonPage.tsx
│   │   │   ├── PokemonMarketPage.tsx
│   │   │   └── PokemonBattlePage.tsx
│   │   ├── bank/                # 银行系统
│   │   │   └── BankPage.tsx
│   │   ├── admin/               # 后台管理
│   │   │   ├── AdminLayout.tsx
│   │   │   └── pages/
│   │   └── error/               # 错误页面
│   │       ├── NotFoundPage.tsx
│   │       └── ErrorPage.tsx
│   │
│   ├── features/                # 功能模块 (按业务划分)
│   │   ├── auth/                # 认证功能
│   │   │   ├── components/       # 认证相关组件
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/             # 认证相关Hooks
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/          # API服务
│   │   │   │   └── authApi.ts
│   │   │   └── stores/            # Zustand stores
│   │   │       └── authStore.ts
│   │   │
│   │   ├── forum/               # 论坛功能
│   │   │   ├── components/       # ForumList, ThreadList, PostEditor
│   │   │   ├── hooks/             # useForum, useThread
│   │   │   ├── services/          # forumApi.ts
│   │   │   └── types/             # forum.ts
│   │   │
│   │   ├── pokemon/             # Pokemon功能
│   │   │   ├── components/       # PokemonCard, BattleArena
│   │   │   ├── hooks/             # usePokemon, useBattle
│   │   │   ├── services/          # pokemonApi.ts
│   │   │   └── types/             # pokemon.ts
│   │   │
│   │   ├── bank/                # 银行功能
│   │   │   ├── components/       # BankAccount, TransactionForm
│   │   │   ├── services/          # bankApi.ts
│   │   │   └── stores/            # bankStore.ts
│   │   │
│   │   └── chat/                # 聊天/实时通信
│   │       ├── hooks/             # useWebSocket
│   │       └── services/          # chatApi.ts
│   │
│   ├── shared/                   # 共享模块
│   │   ├── components/           # 通用组件
│   │   │   ├── ui/                # UI基础组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/            # 布局组件
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── NavMenu.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── feedback/          # 反馈组件
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── data-display/      # 数据展示
│   │   │       ├── Table.tsx
│   │   │       ├── Pagination.tsx
│   │   │       └── Badge.tsx
│   │   │
│   │   ├── hooks/                # 通用Hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   ├── utils/                # 工具函数
│   │   │   ├── date.ts           # 日期格式化
│   │   │   ├── number.ts         # 数字格式化
│   │   │   ├── string.ts         # 字符串处理
│   │   │   ├── validation.ts     # 验证函数
│   │   │   └── cn.ts             # className合并
│   │   │
│   │   ├── types/                # 全局类型定义
│   │   │   ├── api.ts             # API响应类型
│   │   │   ├── user.ts           # 用户类型
│   │   │   ├── forum.ts          # 论坛类型
│   │   │   └── pokemon.ts        # Pokemon类型
│   │   │
│   │   ├── constants/            # 常量
│   │   │   ├── routes.ts
│   │   │   ├── api.ts
│   │   │   └── config.ts
│   │   │
│   │   └── config/               # 配置
│   │       ├── api.config.ts     # API配置
│   │       └── app.config.ts      # 应用配置
│   │
│   ├── lib/                      # 核心库
│   │   ├── api/                  # API客户端
│   │   │   ├── client.ts         # Axios配置
│   │   │   ├── baseQuery.ts      # TanStack Query配置
│   │   │   └── queries/          # Query Keys定义
│   │   │
│   │   ├── router/               # 路由配置
│   │   │   └── routes.tsx
│   │   │
│   │   ├── stores/               # 共享Store
│   │   │   └── globalStore.ts    # 全局状态
│   │   │
│   │   └── auth/                 # 认证核心
│   │       ├── authUtils.ts       # Token管理
│   │       └── authInterceptor.ts # 请求拦截器
│   │
│   ├── styles/                   # 样式
│   │   ├── globals.css           # 全局CSS
│   │   ├── tailwind.css         # Tailwind入口
│   │   └── components.css       # 组件样式
│   │
│   └── main.tsx                  # 应用入口
│
├── tests/                        # 测试
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── mocks/                    # Mock数据
│
├── .env.example                  # 环境变量模板
├── .eslintrc.js                  # ESLint配置
├── .prettierrc                   # Prettier配置
├── index.html                    # HTML入口
├── package.json                   # 依赖配置
├── pnpm-lock.yaml                # Lock文件
├── tsconfig.json                 # TypeScript配置
├── vite.config.ts                # Vite配置
└── tailwind.config.js            # Tailwind配置
```

---

## 3. 状态管理架构

### 3.1 状态分层

```
┌─────────────────────────────────────────────────────────────┐
│                        状态管理层                              │
├─────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Client State │  │ Server State  │  │   URL State        │   │
│  │  (Zustand)   │  │ (TanStack Qry) │  │  (React Router)    │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│         │                │                      │                │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                        Components                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Zustand Stores (客户端状态)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // 状态
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (tokens, user) => set({
        accessToken: tokens.accessToken,
        user,
        isAuthenticated: true,
      }),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }),

      updateUser: (user) => set((state) => ({
        user: { ...state.user, ...user } as User,
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

// src/stores/uiStore.ts
interface UIState {
  // 侧边栏
  sidebarOpen: boolean;

  // 模态框
  activeModal: string | null;

  // 主题
  theme: 'light' | 'dark';

  // Loading
  globalLoading: boolean;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  theme: 'light',
  globalLoading: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  openModal: (modal: string) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
}));
```

### 3.3 TanStack Query (服务端状态)

```typescript
// src/lib/api/baseQuery.ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5分钟
      gcTime: 10 * 60 * 1000,       // 10分钟
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// src/lib/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/services/authApi';

// Query Keys
export const queryKeys = {
  auth: ['auth'] as const,
  user: (userId: number) => ['user', userId] as const,
  forum: (forumId: number) => ['forum', forumId] as const,
  thread: (threadId: number) => ['thread', threadId] as const,
  threads: (forumId: number) => ['threads', forumId] as const,
  posts: (threadId: number) => ['posts', threadId] as const,
  pokemon: ['pokemon'] as const,
  myPokemon: (userId: number) => ['pokemon', 'my', userId] as const,
  bank: ['bank'] as const,
};

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: authApi.getCurrentUser,
    staleTime: Infinity, // 用户信息不自动过期
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // 更新 authStore
      useAuthStore.getState().setAuth(data.tokens, data.user);

      // 预取用户信息
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth,
        queryFn: authApi.getCurrentUser,
      });
    },
  });
}
```

---

## 4. 路由设计

### 4.1 路由配置

```typescript
// src/app/routes.tsx
import { createBrowserRouter, RouterProvider, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/shared/components/layout/Layout';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { AdminGuard } from '@/features/admin/components/AdminGuard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 首页
      { index: true, element: <HomePage /> },

      // 论坛
      {
        path: 'forum',
        children: [
          { index: true, element: <ForumListPage /> },
          { path: ':forumId', element: <ThreadListPage /> },
          { path: ':forumId/thread/:threadId', element: <ThreadDetailPage /> },
        ],
      },

      // Pokemon
      {
        path: 'pokemon',
        children: [
          { index: true, element: <PokemonCenterPage /> },
          { path: 'my', element: <MyPokemonPage /> },
          { path: 'market', element: <PokemonMarketPage /> },
          { path: 'battle', element: <PokemonBattlePage /> },
        ],
      },

      // 银行
      {
        path: 'bank',
        element: <AuthGuard />,
        children: [
          { index: true, element: <BankPage /> },
        ],
      },

      // 用户
      {
        path: 'user',
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          {
            path: 'profile',
            element: <AuthGuard />,
            children: [
              { index: true, element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },

      // 后台管理
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminGuard />,
            children: [
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'forums', element: <AdminForumsPage /> },
            ],
          },
        ],
      },

      // 错误页面
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

### 4.2 路由守卫

```typescript
// src/features/auth/components/AuthGuard.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

// src/features/admin/components/AdminGuard.tsx
export function AdminGuard() {
  const { user } = useAuthStore();

  if (!user || user.adminId === 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

---

## 5. API 层设计

### 5.1 API 客户端配置

```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { authApi } from '@/features/auth/services/authApi';
import { useAuthStore } from '@/stores/authStore';

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Token过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await authApi.refreshToken();

        // 更新token
        useAuthStore.getState().setAuth(data.tokens, data.user);

        // 重试原请求
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转登录
        useAuthStore.getState().clearAuth();
        window.location.href = '/user/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 5.2 API 服务示例

```typescript
// src/features/forum/services/forumApi.ts
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/queries';

export interface ForumListResponse {
  forums: Forum[];
  categories: ForumCategory[];
}

export const forumApi = {
  // 获取版块列表
  getForumList: async (): Promise<ForumListResponse> => {
    return apiClient.get('/forums');
  },

  // 获取版块详情
  getForum: async (forumId: number): Promise<Forum> => {
    return apiClient.get(`/forums/${forumId}`);
  },

  // 获取主题列表
  getThreads: async (forumId: number, params: ThreadListParams): Promise<PaginatedResponse<Thread>> => {
    return apiClient.get(`/forums/${forumId}/threads`, { params });
  },

  // 获取主题详情
  getThread: async (threadId: number): Promise<ThreadDetail> => {
    return apiClient.get(`/threads/${threadId}`);
  },

  // 获取帖子列表
  getPosts: async (threadId: number, page: number): Promise<PaginatedResponse<Post>> => {
    return apiClient.get(`/threads/${threadId}/posts`, { params: { page } });
  },

  // 创建主题
  createThread: async (forumId: number, data: CreateThreadDto): Promise<Thread> => {
    return apiClient.post(`/forums/${forumId}/threads`, data);
  },

  // 回复主题
  createPost: async (threadId: number, data: CreatePostDto): Promise<Post> => {
    return apiClient.post(`/threads/${threadId}/posts`, data);
  },
};

// src/features/forum/hooks/useForumList.ts
import { useQuery } from '@tanstack/react-query';
import { forumApi } from '../services/forumApi';

export function useForumList() {
  return useQuery({
    queryKey: ['forums'],
    queryFn: forumApi.getForumList,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

export function useThreads(forumId: number, params: ThreadListParams) {
  return useQuery({
    queryKey: ['threads', forumId, params],
    queryFn: () => forumApi.getThreads(forumId, params),
    enabled: !!forumId,
  });
}
```

---

## 6. 组件设计原则

### 6.1 组件分层

```
Pages (页面组件)
    ↓
Features (功能模块组件)
    ↓
Shared (共享组件)
    ↓
UI (基础组件)
```

### 6.2 组件示例

```typescript
// src/features/forum/components/ForumList.tsx
import { useForumList } from '../hooks/useForumList';
import { ForumCard } from '@/shared/components/ui/ForumCard';

export function ForumList() {
  const { data, isLoading, error } = useForumList();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-4">
      {data?.categories.map((category) => (
        <div key={category.id}>
          <h3 className="mainbox-title">{category.name}</h3>
          <div className="grid gap-4">
            {category.forums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// src/shared/components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-cat-bg text-text-header hover:bg-cat-bg-hover': variant === 'primary',
            'bg-bg-alt1 text-text-base hover:bg-bg-alt2': variant === 'secondary',
            'hover:bg-bg-alt1': variant === 'ghost',
            'bg-notice-text text-white hover:opacity-90': variant === 'danger',
          },
          {
            'h-8 px-4 text-sm': size === 'sm',
            'h-10 px-6 text-base': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  );
});
```

### 6.3 加载状态管理

```typescript
// src/shared/components/feedback/Spinner.tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-transparent',
          {
            'h-4 w-4 border-t-cat-bg': size === 'sm',
            'h-8 w-8 border-t-cat-bg': size === 'md',
            'h-12 w-12 border-t-cat-bg': size === 'lg',
          }
        )}
      />
    </div>
  );
}

// src/shared/components/feedback/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error }
> {
  state = { hasError: false, error: null as Error };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-header mb-4">出错了</h1>
            <p className="text-text-light mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. 工具函数

### 7.1 日期格式化

```typescript
// src/shared/utils/date.ts
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr = 'yyyy-MM-dd HH:mm'): string {
  return format(new Date(date), formatStr, { locale: zhCN });
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { locale: zhCN, addSuffix: true });
}

export function formatPostTime(date: Date | string): string {
  const now = new Date();
  const postDate = new Date(date);
  const diff = now.getTime() - postDate.getTime();

  // 7天内显示相对时间
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return formatRelativeTime(date);
  }

  // 否则显示完整时间
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}
```

### 7.2 ClassName 合并

```typescript
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 8. 环境配置

### 8.1 环境变量

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_CDN_URL=https://cdn.example.com
VITE_APP_NAME=PokeTB Forum
```

### 8.2 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
});
```

---

## 9. 检查清单

### 项目搭建
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 Tailwind CSS
- [ ] 配置 shadcn/ui
- [ ] 配置 ESLint + Prettier
- [ ] 配置 React Router
- [ ] 配置 TanStack Query
- [ ] 配置 Zustand persist

### 核心功能
- [ ] 认证流程 (登录/注册/登出)
- [ ] 用户资料管理
- [ ] 论坛功能 (浏览/发帖/回复)
- [ ] Pokemon 系统集成
- [ ] 银行系统集成
- [ ] 后台管理界面

### 样式
- [ ] Poketb主题复刻
- [ ] 响应式适配
- [ ] 深色模式支持 (可选)

---

## 10. 管理面板设计

### 10.1 用户控制面板 (UserCP)

```
src/features/usercp/
├── pages/
│   ├── UsercpHomePage.tsx        # 用户中心首页
│   ├── ProfilePage.tsx          # 个人资料编辑
│   ├── AvatarPage.tsx           # 头像设置
│   ├── SettingsPage.tsx         # 账号设置
│   ├── SecurityPage.tsx         # 安全设置
│   └── PrivacyPage.tsx          # 隐私设置
│
├── components/
│   ├── UsercpSidebar.tsx        # 侧边栏导航
│   ├── ProfileForm.tsx          # 资料表单
│   ├── AvatarUpload.tsx         # 头像上传
│   ├── PasswordChange.tsx       # 修改密码
│   └── PreferencesForm.tsx      # 偏好设置
│
├── hooks/
│   └── useUsercp.ts
│
└── types/
│   └── usercp.ts
```

#### 用户面板功能

```typescript
// src/features/usercp/pages/ProfilePage.tsx
export function ProfilePage() {
  return (
    <div className="usercp-layout">
      <UsercpSidebar />
      <div className="usercp-content">
        <h1>个人资料</h1>
        <ProfileForm />
      </div>
    </div>
  );
}

// 侧边栏导航
const usercpMenuItems = [
  { path: '/usercp/profile', icon: 'user', label: '个人资料' },
  { path: '/usercp/avatar', icon: 'image', label: '头像设置' },
  { path: '/usercp/security', icon: 'lock', label: '安全设置' },
  { path: '/usercp/privacy', icon: 'shield', label: '隐私设置' },
  { path: '/usercp/settings', icon: 'settings', label: '账号设置' },
  { path: '/usercp/credits', icon: 'coins', label: '积分管理' },
  { path: '/usercp/medals', icon: 'award', label: '勋章管理' },
  { path: '/usercp/favorites', icon: 'star', label: '收藏夹' },
  { path: '/usercp/posts', icon: 'file-text', label: '我的帖子' },
  { path: '/usercp/buddies', icon: 'users', label: '好友列表' },
];
```

### 10.2 版主管理面板 (ModCP)

```
src/features/modcp/
├── pages/
│   ├── ModcpHomePage.tsx        # 版主中心首页
│   ├── ModThreadsPage.tsx        # 主题管理
│   ├── ModPostsPage.tsx         # 帖子管理
│   ├── ModMembersPage.tsx       # 用户管理
│   └── ModLogsPage.tsx          # 操作日志
│
├── components/
│   ├── ModcpSidebar.tsx
│   ├── ThreadActionMenu.tsx     # 主题操作菜单
│   ├── PostActionMenu.tsx       # 帖子操作菜单
│   ├── BatchModeration.tsx      # 批量操作
│   └── ReasonDialog.tsx         // 操作原因弹窗
│
├── hooks/
│   └── useModcp.ts
│
├── services/
│   └── modcpApi.ts
│
└── types/
│   └── modcp.ts
```

#### 版主面板功能

```typescript
// 版主权限检查
// src/features/modcp/hooks/useModPermission.ts
export function useModPermission(forumId: number) {
  const { user } = useAuthStore();

  const isModerator = useQuery({
    queryKey: ['modcp', 'isModerator', forumId],
    queryFn: () => modcpApi.checkModerator(user.id, forumId),
  });

  return {
    isModerator: isModerator.data,
    canModerate: !!user?.roles.includes('moderator') || isModerator.data,
  };
}

// 主题操作
// src/features/modcp/components/ThreadActionMenu.tsx
export function ThreadActionMenu({ threadId, forumId }: ThreadActionMenuProps) {
  const { canModerate } = useModPermission(forumId);
  const mutateThread = useMutation({ mutationFn: modcpApi.moderateThread });

  if (!canModerate) return null;

  return (
    <DropdownMenu>
      <DropdownTrigger>
        <Button variant="ghost" size="sm">
          <MoreVertical />
        </Button>
      </DropdownTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction('stick')}>
          <Pin className="mr-2 h-4 w-4" /> 置顶
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('digest')}>
          <Star className="mr-2 h-4 w-4" /> 加精
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('highlight')}>
          <Highlight className="mr-2 h-4 w-4" /> 高亮
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('close')}>
          <Lock className="mr-2 h-4 w-4" /> 关闭
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('move')}>
          <Move className="mr-2 h-4 w-4" /> 移动
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('delete')} className="text-red">
          <Trash2 className="mr-2 h-4 w-4" /> 删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 10.3 后台管理面板 (AdminCP)

```
src/features/admin/
├── pages/
│   ├── AdminDashboardPage.tsx   # 仪表盘
│   ├── AdminUsersPage.tsx       # 用户管理
│   │   ├── UserListPage.tsx      # 用户列表
│   │   ├── UserEditPage.tsx      # 编辑用户
│   │   ├── UserGroupPage.tsx     # 用户组管理
│   │   └── BannedUsersPage.tsx   # 封禁用户
│   │
│   ├── AdminForumsPage.tsx       # 版块管理
│   │   ├── ForumListPage.tsx     # 版块列表
│   │   ├── ForumEditPage.tsx     # 编辑版块
│   │   └── ForumOrderPage.tsx   # 版块排序
│   │
│   ├── AdminThreadsPage.tsx      # 主题管理
│   │   ├── ThreadListPage.tsx    # 主题列表
│   │   ├── ThreadModeratePage.tsx # 主题审核
│   │   └── ThreadRecyclePage.tsx  # 回收站
│   │
│   ├── AdminPostsPage.tsx        # 帖子管理
│   │   ├── PostListPage.tsx      # 帖子列表
│   │   └── PostModeratePage.tsx   # 帖子审核
│   │
│   ├── AdminPluginsPage.tsx      # 插件管理
│   │   ├── PluginListPage.tsx    # 插件列表
│   │   └── PluginConfigPage.tsx   # 插件配置
│   │
│   ├── AdminPokemonPage.tsx      # Pokemon管理
│   │   ├── SpeciesListPage.tsx   # 物种管理
│   │   ├── ShopManagePage.tsx    # 商店管理
│   │   ├── BattleLogPage.tsx     # 战斗日志
│   │   └── ClubManagePage.tsx    # 俱乐部管理
│   │
│   ├── AdminBankPage.tsx         # 银行管理
│   │   ├── AccountListPage.tsx   # 账户列表
│   │   ├── TransactionPage.tsx   # 交易记录
│   │   └── InterestRatePage.tsx  # 利率设置
│   │
│   ├── AdminSettingsPage.tsx     # 系统设置
│   │   ├── BasicSettingsPage.tsx  # 基本设置
│   │   ├── EmailSettingsPage.tsx  # 邮件设置
│   │   ├── CacheSettingsPage.tsx  # 缓存设置
│   │   └── SecuritySettingsPage.tsx # 安全设置
│   │
│   ├── AdminLogsPage.tsx         # 日志管理
│   │   ├── AdminLogsPage.tsx    # 管理员日志
│   │   ├── ModLogsPage.tsx      # 版主日志
│   │   └── LoginLogsPage.tsx     # 登录日志
│   │
│   ├── AdminStatsPage.tsx        # 统计分析
│   │   ├── ForumStatsPage.tsx    # 版块统计
│   │   ├── UserStatsPage.tsx     # 用户统计
│   │   └── TrafficStatsPage.tsx  # 流量统计
│   │
│   └── AdminToolsPage.tsx        # 系统工具
│       ├── DatabasePage.tsx      # 数据库维护
│       ├── CachePage.tsx         # 缓存管理
│       └── BackupPage.tsx         # 备份恢复
│
├── components/
│   ├── AdminLayout.tsx           # 后台布局
│   │   ├── AdminSidebar.tsx      # 侧边栏
│   │   ├── AdminHeader.tsx      # 顶部栏
│   │   └── Breadcrumb.tsx       # 面包屑
│   │
│   ├── dashboard/               # 仪表盘组件
│   │   ├── StatCard.tsx         # 统计卡片
│   │   ├── QuickActions.tsx      # 快捷操作
│   │   └── RecentActivities.tsx # 最近活动
│   │
│   ├── users/                   # 用户管理组件
│   │   ├── UserTable.tsx        # 用户表格
│   │   ├── UserFilter.tsx       # 用户筛选
│   │   ├── UserEditDialog.tsx    # 编辑用户弹窗
│   │   └── UserGroupSelect.tsx   # 用户组选择
│   │
│   ├── forums/                  # 版块管理组件
│   │   ├── ForumTree.tsx        # 版块树形图
│   │   ├── ForumForm.tsx        # 版块表单
│   │   └── DragDropList.tsx     # 拖拽排序
│   │
│   ├── plugins/                 # 插件管理组件
│   │   ├── PluginCard.tsx        # 插件卡片
│   │   ├── PluginToggle.tsx      # 启用/禁用
│   │   └── PluginConfigDialog.tsx # 配置弹窗
│   │
│   └── charts/                  # 图表组件
│       ├── LineChart.tsx         # 折线图
│       ├── BarChart.tsx          # 柱状图
│       ├── PieChart.tsx          # 饼图
│       └── DataTable.tsx         # 数据表格
│
├── hooks/
│   ├── useAdminAuth.ts          # 管理员权限检查
│   ├── useDashboardStats.ts      # 仪表盘数据
│   └── useAdminLogs.ts
│
├── services/
│   └── adminApi.ts             # 后台API
│
└── types/
    └── admin.ts
```

#### 后台仪表盘

```typescript
// src/features/admin/pages/AdminDashboardPage.tsx
export function AdminDashboardPage() {
  const { data: stats } = useDashboardStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="总用户数"
            value={stats?.users.total}
            icon={Users}
            change={stats?.users.growth}
            trend="up"
          />
          <StatCard
            title="总主题数"
            value={stats?.threads.total}
            icon={FileText}
            change={stats?.threads.today}
            trend="neutral"
          />
          <StatCard
            title="总帖子数"
            value={stats?.posts.total}
            icon={MessageSquare}
            change={stats?.posts.today}
            trend="up"
          />
          <StatCard
            title="在线用户"
            value={stats?.online.now}
            icon={Activity}
            change={stats?.online.growth}
            trend="up"
          />
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 gap-4">
          <QuickActionsCard />
          <RecentActivitiesCard />
        </div>

        {/* 趋势图表 */}
        <div className="grid grid-cols-2 gap-4">
          <TrafficChart />
          <UserGrowthChart />
        </div>
      </div>
    </AdminLayout>
  );
}

// 统计卡片组件
function StatCard({ title, value, icon: Icon, change, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value?.toLocaleString()}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : ''}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
            </span>
            {' '}较昨日
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 用户管理

```typescript
// src/features/admin/pages/AdminUsersPage.tsx
export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const { data, isLoading } = useUserList(page, filters);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* 筛选栏 */}
        <UserFilter filters={filters} onFilter={setFilters} />

        {/* 用户表格 */}
        <UserTable
          users={data?.users || []}
          total={data?.total || 0}
          page={page}
          onPageChange={setPage}
          onEdit={(user) => handleEditUser(user)}
          onDelete={(user) => handleDeleteUser(user)}
        />
      </div>
    </AdminLayout>
  );
}

// 批量操作
function UserBatchActions({ selectedIds }: { selectedIds: number[] }) {
  const mutateBatch = useMutation({
    mutationFn: (actions: BatchActions) => adminApi.batchUsers(actions),
    onSuccess: () => {
      toast.success('批量操作成功');
      queryClient.invalidateQueries(['admin', 'users']);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        已选择 {selectedIds.length} 项
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => mutateBatch.mutate({ userIds: selectedIds, action: 'ban' })}
      >
        封禁
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => mutateBatch.mutate({ userIds: selectedIds, action: 'unban' })}
      >
        解封
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => mutateBatch.mutate({ userIds: selectedIds, action: 'delete' })}
      >
        删除
      </Button>
    </div>
  );
}
```

#### 版块管理

```typescript
// src/features/admin/pages/AdminForumsPage.tsx
export function AdminForumsPage() {
  const { data: forums } = useForumTree();

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">版块管理</h1>
          <Button onClick={() => setCreateForumDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建版块
          </Button>
        </div>

        {/* 版块树形图 + 拖拽排序 */}
        <ForumTree
          forums={forums}
          onMove={handleMoveForum}
          onEdit={(forum) => handleEditForum(forum)}
          onDelete={(forum) => handleDeleteForum(forum)}
        />
      </div>

      <CreateForumDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateForumDialogOpen}
        onSubmit={handleCreateForum}
      />
    </AdminLayout>
  );
}

// 版块树组件 (支持拖拽排序)
function ForumTree({ forums, onMove }: ForumTreeProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {forums.map((category) => (
        <div key={category.id}>
          <div className="font-semibold text-lg mb-2">{category.name}</div>
          <SortableList
            items={category.forums}
            onDragEnd={(event) => handleDragEnd(event, onMove)}
            className="space-y-2"
          >
            {category.forums.map((forum) => (
              <SortableItem key={forum.id} id={`forum-${forum.id}`}>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-card">
                  <GripVertical className="cursor-move" />
                  <ForumIcon />
                  <span>{forum.name}</span>
                  <Badge variant="secondary">{forum.threads}主题</Badge>
                </div>
              </SortableItem>
            ))}
          </SortableList>
        </div>
      ))}
    </div>
  );
}
```

#### 日志查看

```typescript
// src/features/admin/pages/AdminLogsPage.tsx
export function AdminLogsPage() {
  const [type, setType] = useState<'admin' | 'mod' | 'login'>('admin');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: logs } = useAdminLogs(type, dateRange);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* 筛选器 */}
        <LogFilter
          type={type}
          onTypeChange={setType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* 日志表格 */}
        <LogTable logs={logs?.data || []} />
      </div>
    </AdminLayout  >
  );
}

// 日志详情
function LogDetailDialog({ log, open, onOpenChange }: LogDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>操作详情</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>操作人</Label>
              <div className="text-sm text-muted-foreground">{log?.adminName}</div>
            </div>
            <div>
              <Label>操作类型</Label>
              <div className="text-sm text-muted-foreground">{log?.action}</div>
            </div>
            <div>
              <Label>目标</Label>
              <div className="text-sm text-muted-foreground">{log?.target}</div>
            </div>
            <div>
              <Label>操作时间</Label>
              <div className="text-sm text-muted-foreground">{log?.createdAt}</div>
            </div>
          </div>
          {log?.detail && (
            <div>
              <Label>详细信息</Label>
              <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(log.detail, null, 2)}
              </pre>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 11. 权限管理

### 11.1 权限 Hook

```typescript
// src/shared/hooks/usePermission.ts
export function usePermission(permission: Permission, context?: { forumId?: number }) {
  const { user } = useAuthStore();

  const hasPermission = useMemo(() => {
    if (!user) return false;

    // 超级管理员
    if (user.adminId === 1) return true;

    // 检查用户权限
    return user.permissions?.includes(permission);
  }, [user, permission]);

  return hasPermission;
}

// 使用示例
function PostButton({ threadId, forumId }: PostButtonProps) {
  const canPost = usePermission(Permission.FORUM_POST, { forumId });

  if (!canPost) {
    return <LockClosed /> 您没有发帖权限;
  }

  return <Button>发布主题</Button>;
}
```

### 11.2 权限指令

```typescript
// src/shared/directives/permission.ts
export function permission(permission: Permission) {
  return function <T extends object>(
    component: React.ComponentType<T>
  ): React.ComponentType<T> {
    return function PermissionWrapper(props) {
      const can = usePermission(permission);

      if (!can) {
        return null;
      }

      return React.createElement(component, props);
    };
  };
}

// 使用
<permission permission={Permission.FORUM_POST}>
  <PostButton />
</permission>
```

---

## 12. 通知系统设计

### 12.1 目录结构

```
src/features/notification/
├── components/
│   ├── NotificationCenter.tsx        # 通知中心面板
│   ├── NotificationBadge.tsx         # 通知徽标
│   ├── NotificationItem.tsx          # 通知项
│   ├── NotificationPrefs.tsx         # 通知偏好设置
│   └── ToastContainer.tsx            # Toast容器
│
├── hooks/
│   ├── useNotifications.ts           # 通知列表Hook
│   ├── useUnreadCount.ts             # 未读数量Hook
│   ├── useNotificationPrefs.ts       # 通知偏好Hook
│   └── useToast.ts                   # Toast Hook
│
├── services/
│   └── notificationApi.ts
│
├── stores/
│   └── notificationStore.ts          # 通知状态管理
│
└── types/
    └── notification.ts
```

### 12.2 通知类型定义

```typescript
// src/features/notification/types/notification.ts
export enum NotificationType {
  // 论坛通知
  THREAD_REPLY = 'thread_reply',        // 主题被回复
  POST_QUOTE = 'post_quote',            // 帖子被引用
  POST_MENTION = 'post_mention',        // 被@提及
  THREAD_DIGEST = 'thread_digest',      // 主题加精
  THREAD_MOVE = 'thread_move',          // 主题移动

  // 短消息
  PM_RECEIVE = 'pm_receive',            // 收到短消息
  PM_SYSTEM = 'pm_system',              // 系统消息

  // Pokemon系统
  POKEMON_BATTLE_WIN = 'pokemon_battle_win',    // 战斗胜利
  POKEMON_BATTLE_LOSE = 'pokemon_battle_lose',  // 战斗失败
  POKEMON_TRADE = 'pokemon_trade',              # 交易完成
  POKEMON_LEVEL_UP = 'pokemon_level_up',        # 宠物升级
  POKEMON_EVOLVE = 'pokemon_evolve',            # 宠物进化

  // 银行系统
  BANK_DEPOSIT = 'bank_deposit',        # 存款成功
  BANK_WITHDRAW = 'bank_withdraw',      # 取款成功
  BANK_INTEREST = 'bank_interest',      # 利息入账
  BANK_TRANSFER = 'bank_transfer',      # 转账完成

  // 社交
  FOLLOW_ADD = 'follow_add',            # 被关注
  BUDDY_REQUEST = 'buddy_request',      # 好友申请
  MEDAL_AWARD = 'medal_award',          # 获得勋章

  // 系统
  SYSTEM_ANNOUNCE = 'system_announce',  # 系统公告
  SYSTEM_WARNING = 'system_warning',    # 警告通知
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  data?: Record<string, any>;           # 附加数据（如跳转链接）
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;                   # 过期时间
}

export interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
  pushEnabled: boolean;                 # 是否推送
  soundEnabled: boolean;                # 是否提示音
}
```

### 12.3 通知中心组件

```typescript
// src/features/notification/components/NotificationCenter.tsx
import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';

export function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [type, setType] = useState<NotificationType | 'all'>('all');
  const { data: notifications, isLoading } = useNotifications(filter, type);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="notification-center">
      {/* 头部 */}
      <div className="notification-header">
        <h3>通知中心</h3>
        <div className="actions">
          <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead}>
            全部已读
          </Button>
          <Link to="/usercp/notification">
            <Button size="sm">通知设置</Button>
          </Link>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="notification-filters">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: '全部' },
            { value: 'unread', label: '未读' },
          ]}
        />
        <Select value={type} onChange={setType}>
          <option value="all">全部类型</option>
          <optgroup label="论坛">
            <option value={NotificationType.THREAD_REPLY}>主题回复</option>
            <option value={NotificationType.POST_MENTION}>@提及</option>
          </optgroup>
          <optgroup label="Pokemon">
            <option value={NotificationType.POKEMON_BATTLE_WIN}>战斗胜利</option>
            <option value={NotificationType.POKEMON_EVOLVE}>宠物进化</option>
          </optgroup>
        </Select>
      </div>

      {/* 通知列表 */}
      <div className="notification-list">
        {isLoading ? (
          <Spinner />
        ) : notifications?.length === 0 ? (
          <EmptyState message="暂无通知" />
        ) : (
          notifications?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// 通知项组件
function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const priorityClass = getPriorityClass(notification.priority);

  return (
    <div
      className={cn(
        'notification-item',
        priorityClass,
        !notification.isRead && 'unread'
      )}
      onClick={onClick}
    >
      <div className="notification-icon">
        {icon}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-text">{notification.content}</div>
        <div className="notification-time">
          {formatRelativeTime(notification.createdAt)}
        </div>
      </div>
      {!notification.isRead && <div className="unread-dot" />}
    </div>
  );
}
```

### 12.4 通知徽标

```typescript
// src/features/notification/components/NotificationBadge.tsx
import { useUnreadCount } from '../hooks/useUnreadCount';
import { NotificationCenter } from './NotificationCenter';

export function NotificationBadge() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}
```

### 12.5 通知偏好设置

```typescript
// src/features/notification/components/NotificationPrefs.tsx
export function NotificationPrefs() {
  const { data: prefs, isLoading } = useNotificationPrefs();
  const updatePrefs = useUpdateNotificationPrefs();

  return (
    <div className="space-y-6">
      <h2>通知设置</h2>

      {/* 论坛通知 */}
      <Section title="论坛通知">
        <PreferenceItem
          title="主题回复"
          description="当您的主题被回复时通知"
          pref={prefs?.[NotificationType.THREAD_REPLY]}
          onChange={(pref) => updatePrefs.mutate({ type: NotificationType.THREAD_REPLY, pref })}
        />
        <PreferenceItem
          title="@提及"
          description="当有人在帖子中@您时通知"
          pref={prefs?.[NotificationType.POST_MENTION]}
          onChange={(pref) => updatePrefs.mutate({ type: NotificationType.POST_MENTION, pref })}
        />
      </Section>

      {/* Pokemon通知 */}
      <Section title="宠物系统">
        <PreferenceItem
          title="战斗结果"
          description="战斗结束后通知结果"
          pref={prefs?.[NotificationType.POKEMON_BATTLE_WIN]}
          onChange={(pref) => updatePrefs.mutate({ type: NotificationType.POKEMON_BATTLE_WIN, pref })}
        />
        <PreferenceItem
          title="宠物进化"
          description="宠物进化时通知"
          pref={prefs?.[NotificationType.POKEMON_EVOLVE]}
          onChange={(pref) => updatePrefs.mutate({ type: NotificationType.POKEMON_EVOLVE, pref })}
        />
      </Section>

      {/* 银行通知 */}
      <Section title="银行系统">
        <PreferenceItem
          title="交易通知"
          description="存款、取款、转账时通知"
          pref={prefs?.[NotificationType.BANK_DEPOSIT]}
          onChange={(pref) => updatePrefs.mutate({ type: NotificationType.BANK_DEPOSIT, pref })}
        />
      </Section>
    </div>
  );
}

function PreferenceItem({ title, description, pref, onChange }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-4">
        <Switch
          checked={pref?.enabled}
          onCheckedChange={(enabled) => onChange({ ...pref, enabled })}
        />
        <Switch
          checked={pref?.pushEnabled}
          onCheckedChange={(pushEnabled) => onChange({ ...pref, pushEnabled })}
          label="推送"
        />
        <Switch
          checked={pref?.soundEnabled}
          onCheckedChange={(soundEnabled) => onChange({ ...pref, soundEnabled })}
          label="声音"
        />
      </div>
    </div>
  );
}
```

### 12.6 Toast通知

```typescript
// src/features/notification/components/ToastContainer.tsx
import { toast } from 'sonner';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'notification-toast',
          title: 'notification-toast-title',
          description: 'notification-toast-desc',
        },
      }}
    />
  );
}

// 使用示例
function useNotificationToast() {
  const showToast = useCallback((notification: Notification) => {
    const icon = getNotificationIcon(notification.type);

    toast(notification.title, {
      description: notification.content,
      icon,
      action: notification.data?.link && (
        <Button asChild size="sm">
          <Link to={notification.data.link}>查看</Link>
        </Button>
      ),
    });
  }, []);

  return { showToast };
}
```

### 12.7 WebSocket实时通知

```typescript
// src/features/notification/hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { queryClient } from '@/lib/api/baseQuery';
import { queryKeys } from '@/lib/api/queries';
import { useNotificationToast } from './useNotificationToast';

export function useRealtimeNotifications() {
  const { socket } = useWebSocket();
  const { showToast } = useNotificationToast();

  useEffect(() => {
    if (!socket) return;

    // 监听新通知
    socket.on('notification:new', (notification: Notification) => {
      // 显示Toast
      showToast(notification);

      // 更新未读数
      queryClient.invalidateQueries(queryKeys.unreadCount);

      // 如果通知中心打开，更新列表
      queryClient.invalidateQueries(queryKeys.notifications);
    });

    // 监听批量通知
    socket.on('notifications:batch', (notifications: Notification[]) => {
      notifications.forEach((n) => showToast(n));
      queryClient.invalidateQueries(queryKeys.unreadCount);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notifications:batch');
    };
  }, [socket, showToast]);
}
```

---

## 13. 搜索系统设计

### 13.1 目录结构

```
src/features/search/
├── components/
│   ├── SearchBar.tsx                # 全局搜索栏
│   ├── SearchInput.tsx              # 搜索输入框
│   ├── SearchResults.tsx            # 搜索结果
│   ├── SearchResultItem.tsx         # 搜索结果项
│   ├── AdvancedSearch.tsx           # 高级搜索
│   ├── SearchFilter.tsx             # 搜索筛选
│   └── HotSearchTags.tsx            # 热门搜索标签
│
├── pages/
│   ├── SearchPage.tsx               # 搜索页面
│   └── AdvancedSearchPage.tsx       # 高级搜索页面
│
├── hooks/
│   ├── useSearch.ts                 # 搜索Hook
│   ├── useSearchHistory.ts          # 搜索历史
│   └── useHotSearch.ts              # 热门搜索
│
├── services/
│   └── searchApi.ts
│
└── types/
    └── search.ts
```

### 13.2 搜索类型定义

```typescript
// src/features/search/types/search.ts
export enum SearchType {
  ALL = 'all',
  THREAD = 'thread',          # 主题
  POST = 'post',              # 帖子
  USER = 'user',              # 用户
  FORUM = 'forum',            # 版块
  POKEMON = 'pokemon',        # Pokemon
}

export enum SearchSort {
  RELEVANCE = 'relevance',    # 相关度
  DATE_DESC = 'date_desc',    # 最新
  DATE_ASC = 'date_asc',      # 最旧
  REPLY_COUNT = 'reply_count', # 回复数
  VIEW_COUNT = 'view_count',  # 浏览数
}

export interface SearchParams {
  q: string;                   # 搜索关键词
  type?: SearchType;
  forumId?: number;           # 限定版块
  authorId?: number;          # 限定作者
  dateFrom?: string;          # 起始日期
  dateTo?: string;            # 结束日期
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T = any> {
  type: SearchType;
  id: string | number;
  title: string;
  content: string;
  highlight?: {               # 高亮片段
    title?: string;
    content?: string;
  };
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  stats?: {
    replies?: number;
    views?: number;
    likes?: number;
  };
  createdAt: string;
  url: string;                # 跳转链接
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;               # 搜索耗时(ms)
  suggestions?: string[];     # 搜索建议
}
```

### 13.3 全局搜索栏

```typescript
// src/features/search/components/SearchBar.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSearchSuggestions } from '../hooks/useSearch';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (keyword?: string) => {
    const searchKeyword = keyword || query;
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <Search className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(!!e.target.value);
          }}
          onFocus={() => setOpen(!!query)}
          onKeyDown={handleKeyDown}
          placeholder="搜索主题、帖子、用户..."
          className="search-input"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="search-clear"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 搜索建议下拉框 */}
      {open && (query || suggestions?.length) && (
        <div className="search-suggestions">
          {/* 搜索历史 */}
          {!query && <SearchHistory onSelect={handleSearch} />}

          {/* 热门搜索 */}
          {!query && <HotSearchTags onSelect={handleSearch} />}

          {/* 搜索建议 */}
          {query && suggestions?.length > 0 && (
            <div className="suggestion-list">
              <div className="suggestion-header">搜索建议</div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSearch(suggestion)}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span dangerouslySetInnerHTML={{ __html: highlightMatch(suggestion, query) }} />
                </div>
              ))}
            </div>
          )}

          {/* 快捷搜索 */}
          {query && (
            <div className="quick-search">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&type=thread`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                搜索主题 "{query}"
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}&type=user`)}
              >
                <User className="mr-2 h-4 w-4" />
                搜索用户 "{query}"
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 13.4 搜索结果页面

```typescript
// src/features/search/pages/SearchPage.tsx
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') as SearchType || SearchType.ALL;
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading, error } = useSearch({
    q,
    type,
    page,
  });

  return (
    <div className="search-page container">
      {/* 搜索头部 */}
      <div className="search-header">
        <SearchBar defaultValue={q} autoFocus />
        <div className="search-meta">
          {data && (
            <span className="text-sm text-muted-foreground">
              找到 {data.total} 个结果 (耗时 {data.took}ms)
            </span>
          )}
          <Button variant="link" asChild>
            <Link to="/search/advanced">高级搜索</Link>
          </Button>
        </div>
      </div>

      {/* 搜索内容 */}
      <div className="search-content grid grid-cols-12 gap-6">
        {/* 左侧：筛选器 */}
        <aside className="col-span-3">
          <SearchFilter
            type={type}
            onTypeChange={(t) => updateParams({ type: t })}
          />
        </aside>

        {/* 右侧：结果列表 */}
        <main className="col-span-9">
          {isLoading && <Spinner />}
          {error && <ErrorState error={error} />}
          {data?.results.length === 0 && (
            <EmptyState message={`没有找到"${q}"的相关结果`} />
          )}
          {data?.results.length > 0 && (
            <>
              <SearchResults results={data.results} />
              <Pagination
                total={data.total}
                page={page}
                pageSize={20}
                onPageChange={(p) => updateParams({ page: p })}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SearchResults({ results }: { results: SearchResult[] }) {
  // 按类型分组
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchType, SearchResult[]>);

  return (
    <div className="search-results">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="result-group">
          <div className="result-group-title">
            {getTypeLabel(type as SearchType)} ({items.length})
          </div>
          {items.map((result) => (
            <SearchResultItem key={result.id} result={result} />
          ))}
        </div>
      ))}
    </div>
  );
}

// 搜索结果项
function SearchResultItem({ result }: { result: SearchResult }) {
  return (
    <div className="search-result-item">
      <Link to={result.url} className="result-title">
        <span dangerouslySetInnerHTML={{
          __html: result.highlight?.title || result.title
        }} />
      </Link>
      <div className="result-content">
        <span dangerouslySetInnerHTML={{
          __html: result.highlight?.content || result.content.slice(0, 200)
        }} />
      </div>
      <div className="result-meta">
        <Link to={`/user/${result.author.id}`} className="result-author">
          <img src={result.author.avatar} alt="" />
          {result.author.username}
        </Link>
        <span className="result-date">
          {formatPostTime(result.createdAt)}
        </span>
        {result.stats && (
          <span className="result-stats">
            {result.stats.replies !== undefined && (
              <span>💬 {result.stats.replies}</span>
            )}
            {result.stats.views !== undefined && (
              <span>👁 {result.stats.views}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 13.5 高级搜索

```typescript
// src/features/search/pages/AdvancedSearchPage.tsx
export function AdvancedSearchPage() {
  const [params, setParams] = useState<SearchParams>({
    type: SearchType.ALL,
    sort: SearchSort.RELEVANCE,
  });
  const { data, isLoading } = useSearch(params);

  return (
    <div className="advanced-search-page container">
      <h1>高级搜索</h1>

      <form onSubmit={handleSubmit} className="advanced-search-form">
        {/* 关键词 */}
        <FormField>
          <FormLabel>关键词</FormLabel>
          <Input
            value={params.q}
            onChange={(e) => setParams({ ...params, q: e.target.value })}
            placeholder="输入搜索关键词"
          />
        </FormField>

        {/* 搜索类型 */}
        <FormField>
          <FormLabel>搜索范围</FormLabel>
          <RadioGroup
            value={params.type}
            onValueChange={(type) => setParams({ ...params, type: type as SearchType })}
          >
            <Radio value={SearchType.ALL}>全部</Radio>
            <Radio value={SearchType.THREAD}>仅主题</Radio>
            <Radio value={SearchType.POST}>含帖子内容</Radio>
            <Radio value={SearchType.USER}>用户</Radio>
          </RadioGroup>
        </FormField>

        {/* 限定版块 */}
        {params.type === SearchType.THREAD && (
          <FormField>
            <FormLabel>限定版块</FormLabel>
            <ForumSelect
              value={params.forumId}
              onChange={(forumId) => setParams({ ...params, forumId })}
            />
          </FormField>
        )}

        {/* 限定作者 */}
        <FormField>
          <FormLabel>作者</FormLabel>
          <UserSelect
            value={params.authorId}
            onChange={(authorId) => setParams({ ...params, authorId })}
          />
        </FormField>

        {/* 时间范围 */}
        <FormField>
          <FormLabel>发布时间</FormLabel>
          <DateRangePicker
            value={{
              from: params.dateFrom ? new Date(params.dateFrom) : undefined,
              to: params.dateTo ? new Date(params.dateTo) : undefined,
            }}
            onChange={(range) => setParams({
              ...params,
              dateFrom: range.from?.toISOString(),
              dateTo: range.to?.toISOString(),
            })}
          />
        </FormField>

        {/* 排序方式 */}
        <FormField>
          <FormLabel>排序方式</FormLabel>
          <Select
            value={params.sort}
            onValueChange={(sort) => setParams({ ...params, sort: sort as SearchSort })}
          >
            <option value={SearchSort.RELEVANCE}>相关度</option>
            <option value={SearchSort.DATE_DESC}>最新发布</option>
            <option value={SearchSort.DATE_ASC}>最早发布</option>
            <option value={SearchSort.REPLY_COUNT}>回复数</option>
            <option value={SearchSort.VIEW_COUNT}>浏览数</option>
          </Select>
        </FormField>

        {/* 提交按钮 */}
        <Button type="submit" size="lg">
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
      </form>

      {/* 搜索结果 */}
      {data && <SearchResults results={data.results} />}
    </div>
  );
}
```

### 13.6 搜索历史与热门标签

```typescript
// src/features/search/components/SearchHistory.tsx
export function SearchHistory({ onSelect }: { onSelect: (keyword: string) => void }) {
  const { data: history, isLoading } = useSearchHistory();
  const clearHistory = useClearSearchHistory();

  if (isLoading) return null;
  if (!history?.length) return null;

  return (
    <div className="search-history">
      <div className="history-header">
        <span>搜索历史</span>
        <Button variant="ghost" size="sm" onClick={clearHistory.mutate}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="history-tags">
        {history.map((keyword) => (
          <Tag key={keyword} onClick={() => onSelect(keyword)}>
            {keyword}
          </Tag>
        ))}
      </div>
    </div>
  );
}

// src/features/search/components/HotSearchTags.tsx
export function HotSearchTags({ onSelect }: { onSelect: (keyword: string) => void }) {
  const { data: hotKeywords } = useHotSearch();

  if (!hotKeywords?.length) return null;

  return (
    <div className="hot-search">
      <div className="hot-header">
        <span className="hot-icon">🔥</span>
        <span>热门搜索</span>
      </div>
      <div className="hot-tags">
        {hotKeywords.map((keyword, index) => (
          <Tag
            key={keyword}
            className={index < 3 ? 'hot-tag-top' : ''}
            onClick={() => onSelect(keyword)}
          >
            <span className="hot-rank">{index + 1}</span>
            {keyword}
          </Tag>
        ))}
      </div>
    </div>
  );
}
```

---

## 14. 编辑器组件设计

### 14.1 目录结构

```
src/features/editor/
├── components/
│   ├── BBCodeEditor.tsx             # BBCode编辑器
│   ├── MarkdownEditor.tsx           # Markdown编辑器
│   ├── Toolbar.tsx                  # 工具栏
│   ├── ToolbarButton.tsx            # 工具栏按钮
│   ├── EmojiPicker.tsx              # 表情选择器
│   ├── AttachmentUpload.tsx         # 附件上传
│   ├── ImageUpload.tsx              # 图片上传
│   ├── Preview.tsx                  # 预览
│   └── QuoteSelector.tsx            # 引用选择
│
├── hooks/
│   ├── useEditor.ts                 # 编辑器Hook
│   └── useUpload.ts                 # 上传Hook
│
├── services/
│   ├── bbcode.ts                    # BBCode解析
│   ├── uploadApi.ts                 # 上传API
│   └── emoji.ts                     # 表情数据
│
└── types/
    └── editor.ts
```

### 14.2 BBCode编辑器

```typescript
// src/features/editor/components/BBCodeEditor.tsx
import { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { Preview } from './Preview';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentUpload } from './AttachmentUpload';

export interface BBCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  allowAttachments?: boolean;
  allowEmoji?: boolean;
  showPreview?: boolean;
}

export function BBCodeEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  minHeight = 200,
  maxLength,
  allowAttachments = true,
  allowEmoji = true,
  showPreview = true,
}: BBCodeEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  // 保存光标位置
  const handleSelect = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
  };

  // 插入BBCode标签
  const insertTag = (tag: string, attributes = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = selectionRef.current;
    const text = value;
    const selected = text.slice(start, end) || '默认文本';
    const before = text.slice(0, start);
    const after = text.slice(end);

    const tagOpen = attributes ? `[${tag}=${attributes}]` : `[${tag}]`;
    const tagClose = `[/${tag}]`;
    const inserted = `${before}${tagOpen}${selected}${tagClose}${after}`;

    onChange(inserted);

    // 恢复焦点和选中
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagOpen.length,
        start + tagOpen.length + selected.length
      );
    }, 0);
  };

  // 工具栏按钮配置
  const toolbarGroups = [
    {
      title: '格式',
      buttons: [
        { icon: 'Bold', action: () => insertTag('b'), tooltip: '粗体' },
        { icon: 'Italic', action: () => insertTag('i'), tooltip: '斜体' },
        { icon: 'Underline', action: () => insertTag('u'), tooltip: '下划线' },
        { icon: 'Strikethrough', action: () => insertTag('s'), tooltip: '删除线' },
        { icon: 'Palette', action: () => insertTag('color', 'red'), tooltip: '颜色' },
        { icon: 'Size', action: () => insertTag('size', '5'), tooltip: '大小' },
        { icon: 'Font', action: () => insertTag('font', 'Arial'), tooltip: '字体' },
      ],
    },
    {
      title: '对齐',
      buttons: [
        { icon: 'AlignLeft', action: () => insertTag('align', 'left'), tooltip: '左对齐' },
        { icon: 'AlignCenter', action: () => insertTag('align', 'center'), tooltip: '居中' },
        { icon: 'AlignRight', action: () => insertTag('align', 'right'), tooltip: '右对齐' },
      ],
    },
    {
      title: '列表',
      buttons: [
        { icon: 'List', action: () => insertTag('list'), tooltip: '无序列表' },
        { icon: 'ListOrdered', action: () => insertTag('num'), tooltip: '有序列表' },
      ],
    },
    {
      title: '插入',
      buttons: [
        { icon: 'Link', action: () => insertTag('url', 'https://'), tooltip: '链接' },
        { icon: 'Image', action: () => insertTag('img'), tooltip: '图片' },
        { icon: 'Video', action: () => insertTag('video'), tooltip: '视频' },
        { icon: 'Code', action: () => insertTag('code'), tooltip: '代码' },
        { icon: 'Quote', action: () => insertTag('quote'), tooltip: '引用' },
        { icon: 'Table', action: () => insertTable(), tooltip: '表格' },
      ],
    },
    {
      title: '其他',
      buttons: [
        ...(allowEmoji ? [{
          icon: 'Smile',
          action: () => setShowEmoji(!showEmoji),
          tooltip: '表情',
        }] : []),
        ...(allowAttachments ? [{
          icon: 'Paperclip',
          action: () => document.getElementById('file-upload')?.click(),
          tooltip: '附件',
        }] : []),
        { icon: 'Eye', action: () => setIsPreview(!isPreview), tooltip: '预览' },
      ],
    },
  ];

  const insertTable = () => {
    const table = `[table]\n[tr]\n[td]单元格1[/td]\n[td]单元格2[/td]\n[/tr]\n[tr]\n[td]单元格3[/td]\n[td]单元格4[/td]\n[/tr]\n[/table]`;
    insertTag('table');
    onChange(value + table);
  };

  return (
    <div className="bbcode-editor">
      {/* 工具栏 */}
      <Toolbar groups={toolbarGroups} />

      {/* 表情选择器 */}
      {showEmoji && (
        <EmojiPicker
          onInsert={(emoji) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const { start, end } = selectionRef.current;
            const before = value.slice(0, start);
            const after = value.slice(end);
            onChange(before + emoji + after);

            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
          }}
          onClose={() => setShowEmoji(false)}
        />
      )}

      {/* 编辑区域 */}
      <div className={cn('editor-container', isPreview && 'preview-mode')}>
        {/* 编辑器 */}
        {!isPreview && (
          <div className="editor-textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{ minHeight }}
              maxLength={maxLength}
              className="editor-textarea"
            />
            <div className="editor-footer">
              <span className="char-count">
                {value.length} / {maxLength || '∞'}
              </span>
            </div>
          </div>
        )}

        {/* 预览 */}
        {showPreview && isPreview && (
          <div className="editor-preview">
            <Preview content={value} type="bbcode" />
          </div>
        )}
      </div>

      {/* 附件上传 */}
      {allowAttachments && (
        <AttachmentUpload
          onUpload={(files) => handleUpload(files)}
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      )}
    </div>
  );
}

// 键盘快捷键
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Ctrl+B: 粗体
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    insertTag('b');
  }
  // Ctrl+I: 斜体
  if (e.ctrlKey && e.key === 'i') {
    e.preventDefault();
    insertTag('i');
  }
  // Ctrl+Enter: 提交
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    // 触发提交
  }
};
```

### 14.3 表情选择器

```typescript
// src/features/editor/components/EmojiPicker.tsx
import { EMOJI_CATEGORIES } from '../services/emoji';

export function EmojiPicker({ onInsert, onClose }: EmojiPickerProps) {
  const [category, setCategory] = useState('default');
  const [search, setSearch] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!search) return EMOJI_CATEGORIES[category];

    return Object.values(EMOJI_CATEGORIES)
      .flat()
      .filter(emoji =>
        emoji.keywords.some(keyword => keyword.includes(search))
      );
  }, [category, search]);

  return (
    <div className="emoji-picker">
      {/* 搜索框 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索表情..."
        className="emoji-search"
      />

      {/* 分类标签 */}
      <div className="emoji-categories">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            className={cn('category-tab', category === cat && 'active')}
            onClick={() => setCategory(cat)}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* 表情网格 */}
      <div className="emoji-grid">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji.code}
            className="emoji-item"
            onClick={() => onInsert(emoji.code)}
            title={emoji.name}
          >
            {emoji.preview || emoji.code}
          </button>
        ))}
      </div>
    </div>
  );
}

// 表情数据示例
// src/features/editor/services/emoji.ts
export const EMOJI_CATEGORIES = {
  default: [
    { code: '[emoji=smile]', name: '微笑', keywords: ['smile', '微笑', '笑脸'], preview: '😊' },
    { code: '[emoji=laugh]', name: '大笑', keywords: ['laugh', '大笑', '哈哈'], preview: '😆' },
    { code: '[emoji=sad]', name: '难过', keywords: ['sad', '难过', '伤心'], preview: '😢' },
    // ... 更多表情
  ],
  pokemon: [
    { code: '[poke=pikachu]', name: '皮卡丘', keywords: ['pikachu', '皮卡丘'], preview: '⚡' },
    { code: '[poke=eevee]', name: '伊布', keywords: ['eevee', '伊布'], preview: '🦊' },
    // ... 更多Pokemon表情
  ],
  custom: [
    // 论坛自定义表情
  ],
};
```

### 14.4 附件上传

```typescript
// src/features/editor/components/AttachmentUpload.tsx
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../hooks/useUpload';

export function AttachmentUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip'],
    'application/msword': ['.doc', '.docx'],
  },
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { upload, progress, isUploading } = useUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles,
    maxSize,
    accept,
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
      handleUpload(acceptedFiles);
    },
  });

  const handleUpload = async (filesToUpload: File[]) => {
    const results = await Promise.all(
      filesToUpload.map(file => upload(file))
    );
    onUpload(results);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="attachment-upload">
      {/* 拖拽上传区 */}
      <div {...getRootProps()} className={cn('upload-zone', isDragActive && 'drag-active')}>
        <input {...getInputProps()} />
        <Upload className="upload-icon" />
        <p>拖拽文件到这里，或点击选择文件</p>
        <p className="text-sm text-muted-foreground">
          支持图片、PDF、Word、压缩包，单个文件最大10MB
        </p>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="" className="file-preview" />
              ) : (
                <File className="file-icon" />
              )}
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              {isUploading && (
                <div className="file-progress">
                  <Progress value={progress[index] || 0} />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 上传Hook
// src/features/editor/hooks/useUpload.ts
export function useUpload() {
  const [progress, setProgress] = useState<Record<number, number>>({});

  const upload = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        setProgress((prev) => ({ ...prev, [file.name]: percent }));
      },
    });

    return response.json();
  };

  return { upload, progress };
}
```

### 14.5 BBCode解析

```typescript
// src/features/editor/services/bbcode.ts
export function parseBBCode(bbcode: string): string {
  let html = bbcode;

  // 基本格式
  html = html.replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>');
  html = html.replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>');
  html = html.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
  html = html.replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');

  // 颜色
  html = html.replace(/\[color=([^\]]+)\](.*?)\[\/color\]/gi, '<span style="color:$1">$2</span>');

  // 大小
  html = html.replace(/\[size=(\d+)\](.*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>');

  // 字体
  html = html.replace(/\[font=([^\]]+)\](.*?)\[\/font\]/gi, '<span style="font-family:$1">$2</span>');

  // 对齐
  html = html.replace(/\[align=(left|center|right)\](.*?)\[\/align\]/gi, '<div style="text-align:$1">$2</div>');

  // 链接
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank">$1</a>');
  html = html.replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank">$2</a>');

  // 图片
  html = html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" alt="" loading="lazy" />');

  // 视频
  html = html.replace(/\[video\](.*?)\[\/video\]/gi, (match, url) => {
    if (url.includes('bilibili.com')) {
      // B站视频
      const bvid = extractBilibiliBvid(url);
      return `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen></iframe>`;
    } else if (url.includes('youtube.com')) {
      // YouTube
      const videoId = extractYouTubeId(url);
      return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
    return `<video src="${url}" controls></video>`;
  });

  // 代码
  html = html.replace(/\[code\](.*?)\[\/code\]/gis, '<pre><code>$1</code></pre>');
  html = html.replace(/\[code=([^\]]+)\](.*?)\[\/code\]/gis, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  });

  // 引用
  html = html.replace(/\[quote\](.*?)\[\/quote\]/gis, '<blockquote>$1</blockquote>');
  html = html.replace(/\[quote=([^\]]+)\](.*?)\[\/quote\]/gis, '<blockquote><cite>$1</cite>$2</blockquote>');

  // 列表
  html = html.replace(/\[list\](.*?)\[\/list\]/gis, '<ul>$1</ul>');
  html = html.replace(/\[\*\](.*?)(?=\[\*\]|$)/gi, '<li>$1</li>');

  // 表格
  html = html.replace(/\[table\](.*?)\[\/table\]/gis, (match, content) => {
    const rows = content.split(/\[tr\](.*?)\[\/tr\]/gi).filter(Boolean);
    return `<table>${rows.map(row => {
      const cells = row.split(/\[td\](.*?)\[\/td\]/gi).filter(Boolean);
      return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    }).join('')}</table>`;
  });

  // 自定义表情
  html = html.replace(/\[emoji=([^\]]+)\]/gi, (match, name) => {
    const emoji = findEmoji(name);
    return emoji ? `<img src="${emoji.url}" alt="${emoji.name}" class="emoji" />` : match;
  });

  // Pokemon代码
  html = html.replace(/\[poke=([^\]]+)\]/gi, (match, name) => {
    const pokemon = findPokemon(name);
    return pokemon ? `<img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-icon" />` : match;
  });

  return html;
}
```

---

## 15. 实时通信设计

### 15.1 目录结构

```
src/features/realtime/
├── hooks/
│   ├── useWebSocket.ts              # WebSocket Hook
│   ├── useOnlineUsers.ts            # 在线用户
│   ├── useRealtimePM.ts             # 实时短消息
│   └── useTypingIndicator.ts        # 输入指示器
│
├── services/
│   ├── websocket.ts                 # WebSocket客户端
│   └── eventHandlers.ts             # 事件处理器
│
├── components/
│   ├── OnlineUsers.tsx              # 在线用户列表
│   ├── ConnectionStatus.tsx         # 连接状态
│   ├── TypingIndicator.tsx          # 输入指示器
│   └── RealtimePM.tsx               # 实时短消息
│
└── types/
    └── realtime.ts
```

### 15.2 WebSocket Hook

```typescript
// src/features/realtime/hooks/useWebSocket.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const reconnectAttempt = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    // 创建WebSocket连接
    const socketInstance = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: getAccessToken(),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    // 连接成功
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempt.current = 0;
    });

    // 连接断开
    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    // 连接错误
    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      reconnectAttempt.current++;
      if (reconnectAttempt.current >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus('disconnected');
      }
    });

    // 重连尝试
    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnecting... attempt ${attempt}`);
      setConnectionStatus('connecting');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected, connectionStatus };
}
```

### 15.3 在线用户列表

```typescript
// src/features/realtime/components/OnlineUsers.tsx
import { useOnlineUsers } from '../hooks/useOnlineUsers';

export function OnlineUsers() {
  const { data: onlineUsers, isLoading } = useOnlineUsers();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // 监听用户上线
    socket.on('user:online', (user: OnlineUser) => {
      // 更新在线列表
      queryClient.setQueryData(['online-users'], (prev: OnlineUser[]) => {
        const exists = prev?.find(u => u.id === user.id);
        if (!exists) return [...(prev || []), user];
        return prev;
      });
    });

    // 监听用户下线
    socket.on('user:offline', (userId: number) => {
      queryClient.setQueryData(['online-users'], (prev: OnlineUser[]) => {
        return prev?.filter(u => u.id !== userId) || [];
      });
    });

    // 监听用户状态更新
    socket.on('user:status', (data: { userId: number; status: UserStatus }) => {
      queryClient.setQueryData(['online-users'], (prev: OnlineUser[]) => {
        return prev?.map(u =>
          u.id === data.userId ? { ...u, status: data.status } : u
        ) || [];
      });
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('user:status');
    };
  }, [socket]);

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div className="online-users">
      <div className="online-header">
        <span className="online-dot" />
        <span>在线用户 ({onlineUsers?.length || 0})</span>
      </div>
      <div className="online-list">
        {onlineUsers?.slice(0, 20).map((user) => (
          <div key={user.id} className="online-user">
            <UserAvatar src={user.avatar} size="sm" status={user.status} />
            <span className="online-username">{user.username}</span>
            {user.activity && (
              <span className="online-activity">{user.activity}</span>
            )}
          </div>
        ))}
        {onlineUsers?.length > 20 && (
          <div className="online-more">
            还有 {onlineUsers.length - 20} 人在线
          </div>
        )}
      </div>
    </div>
  );
}

// Hook
// src/features/realtime/hooks/useOnlineUsers.ts
export function useOnlineUsers() {
  const { socket } = useWebSocket();

  return useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      // 从API获取初始在线用户列表
      const response = await fetch('/api/online-users');
      return response.json();
    },
    refetchInterval: 60000, // 每分钟刷新
    enabled: !!socket,
  });
}
```

### 15.4 连接状态指示器

```typescript
// src/features/realtime/components/ConnectionStatus.tsx
export function ConnectionStatus() {
  const { connectionStatus, isConnected } = useWebSocket();

  return (
    <div className={cn('connection-status', connectionStatus)}>
      {connectionStatus === 'connecting' && (
        <>
          <Spinner size="sm" />
          <span>连接中...</span>
        </>
      )}
      {connectionStatus === 'connected' && (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span>已连接</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span>连接断开</span>
          <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
            重连
          </Button>
        </>
      )}
    </div>
  );
}
```

### 15.5 实时短消息

```typescript
// src/features/realtime/components/RealtimePM.tsx
export function RealtimePM() {
  const [openDialogs, setOpenDialogs] = useState<number[]>([]);
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // 收到新消息
    socket.on('pm:new', (message: PrivateMessage) => {
      // 显示通知
      toast(`收到来自 ${message.from.username} 的新消息`);

      // 自动打开对话
      setOpenDialogs(prev => [...new Set([...prev, message.from.id])]);

      // 播放提示音
      playNotificationSound();
    });

    // 对话中正在输入
    socket.on('pm:typing', (data: { fromUserId: number; isTyping: boolean }) => {
      // 显示输入指示器
    });

    // 消息已读
    socket.on('pm:read', (data: { messageId: string }) => {
      // 更新消息状态为已读
      queryClient.setQueryData(['pm', data.messageId], (prev: Message) => ({
        ...prev,
        readAt: new Date().toISOString(),
      }));
    });

    return () => {
      socket.off('pm:new');
      socket.off('pm:typing');
      socket.off('pm:read');
    };
  }, [socket]);

  return (
    <>
      {openDialogs.map(userId => (
        <PMDialog
          key={userId}
          userId={userId}
          onClose={() => setOpenDialogs(prev => prev.filter(id => id !== userId))}
        />
      ))}
    </>
  );
}

// 短消息对话窗口
function PMDialog({ userId, onClose }: PMDialogProps) {
  const { data: messages } = usePMessages(userId);
  const { socket } = useWebSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 发送消息
  const sendMessage = (content: string) => {
    if (!socket) return;

    socket.emit('pm:send', {
      toUserId: userId,
      content,
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="pm-dialog">
      <div className="pm-header">
        <UserInfo userId={userId} />
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="pm-messages">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={cn('pm-message', message.isMine ? 'sent' : 'received')}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-time">
              {formatTime(message.createdAt)}
              {message.isMine && (
                <span className="read-status">
                  {message.readAt ? '已读' : '未读'}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="pm-input">
        <PMInput onSend={sendMessage} />
      </div>
    </div>
  );
}
```

---

## 16. 移动端适配设计

### 16.1 响应式断点

```typescript
// tailwind.config.js
export default {
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',

      // 论坛特定断点
      'mobile': '640px',    # 移动设备
      'tablet': '768px',    # 平板
      'desktop': '1024px',  # 桌面
    },
  },
};
```

### 16.2 移动端布局组件

```typescript
// src/shared/components/layout/MobileLayout.tsx
import { useState } from 'react';
import { MobileNav } from './MobileNav';
import { MobileSidebar } from './MobileSidebar';

export function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mobile-layout">
      {/* 移动端顶部栏 */}
      <header className="mobile-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="mobile-title">{pageTitle}</h1>
        <NotificationBadge />
      </header>

      {/* 侧边栏 */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 主内容区 */}
      <main className="mobile-main">
        {children}
      </main>

      {/* 底部导航 */}
      <MobileNav />
    </div>
  );
}

// 移动端底部导航
function MobileNav() {
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/forum', icon: MessagesSquare, label: '论坛' },
    { path: '/pokemon', icon: Sparkles, label: '宠物' },
    { path: '/bank', icon: Landmark, label: '银行' },
    { path: '/usercp', icon: User, label: '我的' },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn('mobile-nav-item', isActive(item.path) && 'active')}
        >
          <item.icon className="h-6 w-6" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

### 16.3 触摸手势支持

```typescript
// src/shared/hooks/useSwipe.ts
import { useRef, useEffect } from 'react';

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // 滑动阈值(px)
}

export function useSwipe(callbacks: SwipeCallbacks) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  } = callbacks;

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY,
    };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    touchEnd.current = {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY,
    };

    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontalSwipe) {
      if (deltaX > threshold) {
        onSwipeRight?.();
      } else if (deltaX < -threshold) {
        onSwipeLeft?.();
      }
    } else {
      if (deltaY > threshold) {
        onSwipeDown?.();
      } else if (deltaY < -threshold) {
        onSwipeUp?.();
      }
    }
  };

  useEffect(() => {
    const element = document.getElementById('swipe-container');
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
}

// 使用示例
function ThreadListPage() {
  const navigate = useNavigate();

  useSwipe({
    onSwipeLeft: () => navigate('/next-forum'),
    onSwipeRight: () => navigate('/prev-forum'),
  });

  return <div id="swipe-container">...</div>;
}
```

### 16.4 MOC移动端专用组件

```typescript
// src/features/moc/components/MocThreadCard.tsx
export function MocThreadCard({ thread }: MocThreadCardProps) {
  return (
    <Link to={`/thread/${thread.id}`} className="moc-thread-card">
      {/* 主题标题 */}
      <h3 className="moc-thread-title">
        {thread.isDigest && <span className="digest-badge">精</span>}
        {thread.title}
      </h3>

      {/* 作者信息 */}
      <div className="moc-thread-meta">
        <img src={thread.author.avatar} alt="" className="moc-avatar" />
        <span className="moc-username">{thread.author.username}</span>
        <span className="moc-time">{formatRelativeTime(thread.createdAt)}</span>
      </div>

      {/* 统计信息 */}
      <div className="moc-thread-stats">
        <span className="moc-stat">
          <MessageSquare className="h-4 w-4" />
          {thread.replies}
        </span>
        <span className="moc-stat">
          <Eye className="h-4 w-4" />
          {thread.views}
        </span>
        {thread.lastReply && (
          <span className="moc-last-reply">
            最后回复: {thread.lastReply.author.username}
          </span>
        )}
      </div>
    </Link>
  );
}

// MOC版块列表
function MocForumList() {
  return (
    <div className="moc-forum-list">
      {forums.map((forum) => (
        <Link key={forum.id} to={`/forum/${forum.id}`} className="moc-forum-item">
          <div className="moc-forum-icon">
            <ForumIcon type={forum.icon} />
          </div>
          <div className="moc-forum-info">
            <div className="moc-forum-name">{forum.name}</div>
            <div className="moc-forum-desc">{forum.description}</div>
            <div className="moc-forum-stats">
              <span>{forum.threads}主题</span>
              <span>{forum.posts}帖子</span>
              <span>今日: {forum.todayPosts}</span>
            </div>
          </div>
          <ChevronRight className="moc-forum-arrow" />
        </Link>
      ))}
    </div>
  );
}
```

---

## 17. 错误处理与边界设计

### 17.1 错误边界组件

```typescript
// src/shared/components/feedback/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // 上报错误
    this.reportError(error, errorInfo);
  }

  reportError(error: Error, errorInfo: React.ErrorInfo) {
    // 发送到错误追踪服务
    if (import.meta.env.PROD) {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// 默认错误回退组件
function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="error-boundary-fallback">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">出错了</h1>
        <p className="error-message">{error.message}</p>
        {import.meta.env.DEV && (
          <details className="error-details">
            <summary>错误堆栈</summary>
            <pre>{error.stack}</pre>
          </details>
        )}
        <div className="error-actions">
          <Button onClick={onReset}>重试</Button>
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 17.2 错误页面

```typescript
// src/pages/error/NotFoundPage.tsx
export function NotFoundPage() {
  return (
    <div className="error-page not-found-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1 className="error-title">页面不存在</h1>
        <p className="error-description">
          您访问的页面不存在或已被删除
        </p>
        <div className="error-actions">
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/forum">浏览论坛</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// src/pages/error/ForbiddenPage.tsx
export function ForbiddenPage() {
  return (
    <div className="error-page forbidden-page">
      <div className="error-content">
        <div className="error-icon">🔒</div>
        <h1 className="error-title">权限不足</h1>
        <p className="error-description">
          您没有访问此页面的权限
        </p>
        <div className="error-actions">
          <Button onClick={() => window.history.back()}>返回上一页</Button>
          <Button variant="ghost" asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// src/pages/error/ServerErrorPage.tsx
export function ServerErrorPage({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="error-page server-error-page">
      <div className="error-content">
        <div className="error-code">500</div>
        <h1 className="error-title">服务器错误</h1>
        <p className="error-description">
          服务器出现了问题，请稍后再试
        </p>
        {error && import.meta.env.DEV && (
          <details className="error-details">
            <summary>错误信息</summary>
            <pre>{error.stack}</pre>
          </details>
        )}
        <div className="error-actions">
          {reset && <Button onClick={reset}>重试</Button>}
          <Button variant="ghost" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 17.3 API错误处理

```typescript
// src/lib/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const data = error.response?.data;

    switch (status) {
      case 401:
        return new ApiError(401, 'UNAUTHORIZED', '未登录或登录已过期');
      case 403:
        return new ApiError(403, 'FORBIDDEN', '没有权限访问此资源');
      case 404:
        return new ApiError(404, 'NOT_FOUND', '请求的资源不存在');
      case 429:
        return new ApiError(429, 'TOO_MANY_REQUESTS', '请求过于频繁，请稍后再试');
      case 500:
        return new ApiError(500, 'SERVER_ERROR', '服务器错误，请稍后再试');
      default:
        return new ApiError(status, data?.code || 'UNKNOWN', data?.message || '未知错误');
    }
  }

  if (error instanceof Error) {
    return new ApiError(0, 'UNKNOWN', error.message);
  }

  return new ApiError(0, 'UNKNOWN', '未知错误');
}

// 在React Query中使用
export function useMutationWithError<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: Omit<UseMutationOptions<T, Error, V>, 'mutationFn' | 'onError'>
) {
  return useMutation({
    mutationFn,
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      options?.onError?.(error as Error);
    },
    ...options,
  });
}
```

---

## 18. 性能优化设计

### 18.1 虚拟滚动

```typescript
// src/shared/components/data-display/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualList<T>({
  items,
  renderItem,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 估算每项高度
    overscan,
  });

  return (
    <div ref={parentRef} className="virtual-list-container" style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 使用示例
function ThreadList({ threads }: { threads: Thread[] }) {
  return (
    <VirtualList
      items={threads}
      renderItem={(thread, index) => (
        <ThreadCard key={thread.id} thread={thread} />
      )}
    />
  );
}
```

### 18.2 图片懒加载

```typescript
// src/shared/components/media/LazyImage.tsx
import { useState, useRef, useEffect } from 'react';

export function LazyImage({
  src,
  alt,
  placeholder,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer检测图片是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // 提前50px开始加载
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={cn('lazy-image-wrapper', className)}>
      {/* 占位符 */}
      {!isLoaded && <div className="lazy-image-placeholder" />}

      {/* 实际图片 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={cn('lazy-image', !isLoaded && 'opacity-0')}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}
```

### 18.3 Skeleton加载占位

```typescript
// src/shared/components/feedback/Skeleton.tsx
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-bg-alt2', className)}
      {...props}
    />
  );
}

// 预定义Skeleton组件
export function ThreadCardSkeleton() {
  return (
    <div className="thread-card-skeleton p-4 border rounded">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="post-skeleton p-4 border rounded">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  );
}

// 使用示例
function ThreadList() {
  const { data, isLoading } = useThreads();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ThreadCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <div>{data?.map(thread => <ThreadCard key={thread.id} thread={thread} />)}</div>;
}
```

### 18.4 代码分割与懒加载

```typescript
// src/app/routes.tsx
import { lazy, Suspense } from 'react';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ForumListPage = lazy(() => import('@/pages/forum/ForumListPage'));
const ThreadDetailPage = lazy(() => import('@/pages/forum/ThreadDetailPage'));
const PokemonCenterPage = lazy(() => import('@/pages/pokemon/PokemonCenterPage'));
const BankPage = lazy(() => import('@/pages/bank/BankPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageSpinner />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'forum',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSpinner />}>
                <ForumListPage />
              </Suspense>
            ),
          },
          // ... 其他路由
        ],
      },
      // ... 其他路由
    ],
  },
]);

// 加载中组件
function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}
```

### 18.5 预取策略

```typescript
// src/features/forum/hooks/usePrefetch.ts
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function usePrefetchNextPage(currentPage: number, totalPages: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 预取下一页
    if (currentPage < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['threads', currentPage + 1],
        queryFn: () => fetchThreads(currentPage + 1),
      });
    }
  }, [currentPage, totalPages]);
}

// 鼠标悬停预取
function ThreadCard({ thread }: ThreadCardProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // 悬停时预取主题详情
    queryClient.prefetchQuery({
      queryKey: ['thread', thread.id],
      queryFn: () => fetchThread(thread.id),
    });
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* ... */}
    </div>
  );
}
```

---

## 19. 下一步设计任务

| 任务 | 优先级 | 说明 |
|------|--------|------|
| API设计 | 高 | 定义所有RESTful接口 |
| 缓存策略 | 中 | Redis缓存方案 |
| 移动端MOC详细设计 | 中 | MOC专用组件细节 |
| 监控日志 | 低 | 错误追踪和监控 |
