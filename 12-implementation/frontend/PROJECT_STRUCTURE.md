# PokeTB Forum 前端项目结构

## 项目概述
PokeTB Forum 前端项目 - 基于 React 18 + TypeScript + Vite 的现代化论坛系统

## 技术栈
- **框架**: React 18.2.0
- **语言**: TypeScript 5.3.3
- **构建工具**: Vite 5.0.11
- **状态管理**: Zustand 4.4.7
- **数据获取**: TanStack Query 5.17.0
- **路由**: React Router DOM 6.21.0
- **样式**: Tailwind CSS 3.4.0
- **HTTP客户端**: Axios 1.6.5
- **工具库**: date-fns, clsx, tailwind-merge
- **测试**: Vitest 1.1.0 + Playwright 1.40.1

## 项目结构

```
frontend/
├── public/                      # 静态资源
├── e2e/                         # E2E测试
├── src/
│   ├── app/                     # 应用入口
│   │   └── App.tsx             # 根组件
│   ├── components/              # 组件
│   │   ├── common/             # 通用组件
│   │   │   └── index.ts
│   │   ├── ui/                 # UI基础组件
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── features/               # 功能模块
│   │   ├── auth/               # 认证功能
│   │   │   └── index.ts
│   │   ├── forum/              # 版块功能
│   │   │   └── index.ts
│   │   ├── thread/             # 主题功能
│   │   │   └── index.ts
│   │   ├── user/               # 用户功能
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/                  # 自定义Hooks
│   │   └── index.ts
│   ├── layout/                 # 布局组件
│   │   └── index.tsx
│   ├── lib/                    # 核心库
│   │   ├── api/                # API客户端
│   │   │   ├── client.ts       # Axios配置
│   │   │   ├── queries.ts      # TanStack Query配置
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/               # API服务层
│   │   └── index.ts
│   ├── shared/                 # 共享工具
│   │   ├── utils/              # 工具函数
│   │   │   ├── cn.ts           # className合并
│   │   │   ├── date.ts         # 日期格式化
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── stores/                 # 状态管理
│   │   ├── authStore.ts        # 认证状态
│   │   └── index.ts
│   ├── styles/                 # 样式
│   │   └── globals.css         # 全局样式
│   ├── test/                   # 测试配置
│   │   └── setup.ts
│   ├── types/                  # 类型定义
│   │   └── index.ts
│   ├── index.ts                # 主导出
│   └── main.tsx                # 应用入口
├── index.html                  # HTML模板
├── package.json                # 依赖配置
├── tsconfig.json               # TypeScript配置
├── tsconfig.node.json          # Node TS配置
├── vite.config.ts              # Vite配置
├── tailwind.config.js          # Tailwind配置
├── postcss.config.js           # PostCSS配置
├── .prettierrc                 # Prettier配置
├── .env.example                # 环境变量示例
├── .gitignore                  # Git忽略
├── Dockerfile                  # Docker配置
└── nginx.conf                  # Nginx配置
```

## 核心功能模块

### 1. API客户端 (`src/lib/api/client.ts`)
- Axios实例配置
- 请求/响应拦截器
- 自动Token管理
- 401错误自动处理

### 2. TanStack Query配置 (`src/lib/api/queries.ts`)
- QueryClient配置
- 统一的QueryKeys定义
- 缓存策略配置

### 3. 认证状态管理 (`src/stores/authStore.ts`)
- Zustand + persist中间件
- 用户状态管理
- Token持久化

### 4. 工具函数
- `cn()`: className合并 (clsx + tailwind-merge)
- `formatDate()`: 日期格式化
- `formatRelativeTime()`: 相对时间

### 5. 类型系统
- ApiResponse: 统一API响应类型
- PaginationParams: 分页参数
- PaginatedResponse: 分页响应

## 可用脚本

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run preview          # 预览构建
npm run lint             # 代码检查
npm run lint:fix         # 自动修复
npm run type-check       # 类型检查
npm run test             # 单元测试
npm run test:ui          # 测试UI
npm run test:coverage    # 测试覆盖率
npm run test:e2e         # E2E测试
```

## 环境变量

参考 `.env.example` 文件配置环境变量：
- `VITE_API_BASE_URL`: API基础URL

## 开发要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 基础设施状态

✅ 配置文件完整
✅ 核心代码就绪
✅ 目录结构清晰
✅ 类型系统完善
✅ 工具函数齐全
✅ 状态管理配置
✅ API客户端配置
✅ 测试基础设施
