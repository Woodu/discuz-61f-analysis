# 技术栈确认

## 最终技术栈

### 后端

| 组件 | 选择 | 版本 | 说明 |
|------|------|------|------|
| **运行时** | Node.js | 20.x LTS | 长期支持版本 |
| **框架** | Koa | 2.x | 轻量级、中间件模式 |
| **ORM** | **Prisma** | 5.x | 类型安全、迁移工具 |
| **验证** | Zod | 3.x | TypeScript优先验证库 |
| **认证** | JWT + Passport | - | 无状态认证 |
| **缓存** | Redis | 7.x | 会话、数据缓存 |
| **文件上传** | Multer + OSS | - | 本地存储或云存储 |
| **邮件** | Nodemailer | 6.x | 邮件发送 |
| **定时任务** | node-cron | 3.x | 定时任务调度 |
| **WebSocket** | Socket.io | 4.x | 实时通信 |
| **日志** | Pino | 8.x | 高性能日志 |
| **测试** | Jest + Supertest | - | 单元测试和API测试 |

### 前端

| 组件 | 选择 | 版本 | 说明 |
|------|------|------|------|
| **框架** | React | 18.x | 并发特性支持 |
| **状态管理** | **Zustand** | 4.x | 轻量级状态管理 |
| **路由** | React Router | 6.x | 最新版本 |
| **UI组件** | **shadcn/ui** | - | 可定制、基于Radix UI |
| **样式** | **Tailwind CSS** | 3.x | 原子化CSS |
| **表单** | React Hook Form | 7.x | 性能优化 |
| **数据请求** | **TanStack Query** | 5.x | 服务端状态管理 |
| **日期** | Day.js | 1.x | 轻量级日期库 |
| **图标** | Lucide React | - | Tree-shakeable图标 |
| **富文本** | Tiptap | 2.x | 现代编辑器 |
| **Markdown** | React Markdown | 9.x | Markdown渲染 |
| **代码高亮** | Prism.js | - | 代码语法高亮 |

### 开发工具

| 组件 | 选择 | 版本 | 说明 |
|------|------|------|------|
| **语言** | TypeScript | 5.x | 类型安全 |
| **包管理** | pnpm | 8.x | 快速、节省空间 |
| **构建** | Vite | 5.x | 快速构建 |
| **代码规范** | ESLint + Prettier | - | 代码风格 |
| **Git钩子** | Husky + lint-staged | - | 提交前检查 |
| **API文档** | OpenAPI/Swagger | - | API自动生成 |
| **文档** | VitePress | - | 项目文档 |

### 基础设施

| 组件 | 选择 | 说明 |
|------|------|------|
| **数据库** | MariaDB | 10.11+ LTS |
| **缓存** | Redis | 7.x |
| **反向代理** | Nginx | 反向代理、静态文件 |
| **容器化** | Docker | 容器部署 |
| **CI/CD** | GitHub Actions | 自动化部署 |
| **监控** | Sentry | 错误监控 |

---

## 技术选型理由

### 1. Prisma (ORM)

**优势**:
- ✅ 类型安全 - 自动生成TypeScript类型
- ✅ 迁移工具 - 内置数据库迁移管理
- ✅ 开发体验 - 优秀的IDE支持
- ✅ 性能优化 - 连接池、查询优化
- ✅ 多数据库支持 - MySQL、PostgreSQL、SQLite

**替代方案**: TypeORM（也不错，但Prisma更现代）

### 2. Zustand (状态管理)

**优势**:
- ✅ 轻量级 - 1KB gzipped
- ✅ 简单API - 易于学习和使用
- ✅ TypeScript支持 - 完整类型推导
- ✅ 无需Provider - 不需要包裹组件
- ✅ DevTools - 可选的状态调试工具

**替代方案**:
- Redux Toolkit（更重，学习曲线陡）
- Jotai（原子化状态，也不错）

### 3. shadcn/ui (UI组件)

**优势**:
- ✅ 完全可定制 - 复制代码到项目
- ✅ 基于Radix UI - 无障碍访问
- ✅ TypeScript原生
- ✅ Tailwind CSS集成
- ✅ 不依赖npm包 - 完全控制代码
- ✅ 现代设计 - 美观、一致

**替代方案**:
- Ant Design（功能全，但定制困难）
- MUI（Material Design，可能不符合设计风格）
- Chakra UI（也不错，但shadcn更灵活）

### 4. Tailwind CSS (样式)

**优势**:
- ✅ 快速开发 - 不用切换CSS文件
- ✅ 一致性 - 设计系统约束
- ✅ 小文件 - 生产环境自动清除未使用样式
- ✅ 响应式 - 内置响应式工具
- ✅ 深色模式 - 内置支持
- ✅ 可定制 - 通过配置完全自定义

**替代方案**:
- CSS Modules（更传统，但需要更多CSS）
- Styled Components（CSS-in-JS，运行时开销）

### 5. TanStack Query (数据请求)

**优势**:
- ✅ 缓存管理 - 自动缓存和重新验证
- ✅ 后台更新 - 自动刷新数据
- ✅ 乐观更新 - 更好的用户体验
- ✅ 分页/无限滚动 - 内置支持
- ✅ TypeScript原生
- ✅ DevTools - 数据流调试

**替代方案**:
- SWR（更轻量，但功能较少）
- Redux Toolkit + RTK Query（更重）

---

## 项目结构

```
bbs-refactor/
├── apps/
│   ├── backend/              # Koa后端
│   │   ├── src/
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── users/        # 用户模块
│   │   │   ├── forums/       # 版块模块
│   │   │   ├── threads/      # 主题模块
│   │   │   ├── posts/        # 帖子模块
│   │   │   ├── pokemon/      # Pokemon系统
│   │   │   ├── plugins/      # 插件系统
│   │   │   ├── admin/        # 后台管理
│   │   │   ├── middleware/   # 中间件
│   │   │   ├── services/     # 业务逻辑
│   │   │   ├── utils/        # 工具函数
│   │   │   └── index.ts      # 入口
│   │   ├── prisma/           # Prisma配置
│   │   │   └── schema.prisma # 数据模型
│   │   └── package.json
│   │
│   └── frontend/             # React前端
│       ├── src/
│       │   ├── components/   # 通用组件
│       │   ├── pages/        # 页面组件
│       │   ├── layouts/      # 布局组件
│       │   ├── hooks/        # 自定义Hooks
│       │   ├── stores/       # Zustand stores
│       │   ├── services/     # API调用
│       │   ├── types/        # TypeScript类型
│       │   ├── utils/        # 工具函数
│       │   └── main.tsx      # 入口
│       └── package.json
│
├── packages/                 # 共享包
│   ├── ui/                   # 共享UI组件
│   ├── config/               # 共享配置
│   └── types/                # 共享类型
│
├── docker-compose.yml        # Docker配置
├── turbo.json               # Turborepo配置
└── package.json
```

---

## 开发工作流

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动数据库
docker-compose up -d mariadb redis

# 数据库迁移
cd apps/backend
pnpm prisma migrate dev

# 启动后端（开发模式）
pnpm dev

# 启动前端（开发模式）
cd apps/frontend
pnpm dev
```

### 构建部署

```bash
# 构建所有包
pnpm build

# 启动生产环境
cd apps/backend && pnpm start
cd apps/frontend && pnpm serve
```

---

## 环境变量

### 后端 (.env)

```env
# 数据库
DATABASE_URL="mysql://user:pass@localhost:3306/bbs"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# 文件上传
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# 邮件
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@example.com"
SMTP_PASS="password"

# 外部服务
SENTRY_DSN=""
```

### 前端 (.env)

```env
# API
VITE_API_URL="http://localhost:3000/api"

# 功能开关
VITE_ENABLE_POKEMON=true
VITE_ENABLE_BANK=true

# 第三方
VITE_GOOGLE_ANALYTICS_ID=""
```

---

## 依赖清单

### 后端核心依赖

```json
{
  "dependencies": {
    "@koa/router": "^12.0.0",
    "@prisma/client": "^5.7.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "koa": "^2.14.2",
    "koa-bodyparser": "^4.4.0",
    "koa-cors": "^4.0.0",
    "koa-helmet": "^7.0.2",
    "koa-jwt": "^4.0.4",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "redis": "^4.6.11",
    "socket.io": "^4.6.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "prisma": "^5.7.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### 前端核心依赖

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.9",
    "@hookform/resolvers": "^3.3.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "dayjs": "^1.11.10",
    "lucide-react": "^0.303.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "react-router-dom": "^6.21.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^4.4.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  }
}
```

---

## 总结

### 技术栈确认

| 类别 | 选择 | 确认 |
|------|------|------|
| 后端框架 | Koa | ✅ |
| ORM | **Prisma** | ✅ |
| 状态管理 | **Zustand** | ✅ |
| UI组件 | **shadcn/ui** | ✅ |
| 样式 | **Tailwind CSS** | ✅ |
| 数据请求 | **TanStack Query** | ✅ |
| 验证 | Zod | ✅ |
| 认证 | JWT | ✅ |
| 缓存 | Redis | ✅ |

### 下一步

1. ✅ 技术栈确认
2. ⏳ 数据模型设计（使用Prisma）
3. ⏳ API设计（RESTful + OpenAPI）
4. ⏳ 认证方案设计
5. ⏳ 项目脚手架搭建
