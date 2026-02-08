# PokeTB Forum - 实施代码目录

这是 Discuz! 6.1F 重构项目的实施代码目录。

## 目录结构

```
12-implementation/
├── backend/           # 后端项目 (Koa + TypeScript + Prisma)
│   ├── src/          # 源代码目录
│   ├── prisma/       # Prisma ORM 配置
│   ├── tests/        # 测试文件
│   ├── package.json  # 依赖配置
│   ├── tsconfig.json # TypeScript 配置
│   ├── .gitignore    # Git 忽略文件
│   ├── .env.example  # 环境变量模板
│   ├── .eslintrc.js  # ESLint 配置
│   ├── jest.config.js # Jest 测试配置
│   └── Dockerfile    # Docker 配置
│
├── frontend/         # 前端项目 (React + Vite + TypeScript)
│   ├── src/          # 源代码目录
│   ├── tests/        # 测试文件
│   ├── e2e/          # E2E 测试 (Playwright)
│   ├── public/       # 静态资源
│   ├── package.json  # 依赖配置
│   ├── tsconfig.json # TypeScript 配置
│   ├── vite.config.ts # Vite 配置
│   ├── tailwind.config.js # Tailwind 配置
│   ├── .gitignore    # Git 忽略文件
│   ├── .env.example  # 环境变量模板
│   ├── nginx.conf    # Nginx 配置
│   └── Dockerfile    # Docker 配置
│
├── docker-compose.yml # 开发环境 Docker 编排
└── README.md        # 本文件
```

## 快速开始

### 后端开发

```bash
cd backend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 运行数据库迁移
pnpm prisma:migrate
pnpm prisma:generate

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint
pnpm type-check
```

### 前端开发

```bash
cd frontend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test
pnpm test:e2e

# 代码检查
pnpm lint
pnpm type-check

# 构建生产版本
pnpm build
pnpm preview
```

### Docker 开发环境

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 技术栈

### 后端
- **框架**: Koa 2.x
- **语言**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis 7.x
- **WebSocket**: Socket.io 4.x
- **认证**: JWT
- **测试**: Jest + Supertest

### 前端
- **框架**: React 18.x
- **构建**: Vite 5.x
- **语言**: TypeScript 5.x
- **状态管理**: Zustand 4.x + TanStack Query 5.x
- **路由**: React Router 6.x
- **样式**: Tailwind CSS 3.x
- **UI组件**: shadcn/ui
- **测试**: Vitest + Playwright

## 开发规范

### 代码风格
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式

### Git 提交
- 使用语义化提交信息
- 提交前运行测试和类型检查
- 通过 Code Review 后合并

### 分支策略
- `main` - 主分支，始终保持稳定
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

## 相关文档

- [项目分析](../README.md)
- [技术栈确认](../08-design/01-tech-stack.md)
- [API设计](../08-design/06-api-design.md)
- [数据模型设计](../08-design/05-data-model.md)
- [前端架构设计](../08-design/06-frontend-architecture.md)
- [安全策略设计](../08-design/07-security-design.md)
- [测试用例规划](../10-tests/README.md)
- [阶段化实施计划](../11-implementation/01-phases-review.md)

## 许可

MIT License
