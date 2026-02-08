# PokeTB Forum 前端快速启动指南

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 快速开始

### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问：http://localhost:5173

### 4. 构建生产版本

```bash
pnpm build
```

### 5. 预览生产构建

```bash
pnpm preview
```

## 开发工具

### 代码检查
```bash
pnpm lint              # 检查代码
pnpm lint:fix          # 自动修复
```

### 类型检查
```bash
pnpm type-check        # TypeScript类型检查
```

### 测试
```bash
pnpm test              # 单元测试
pnpm test:ui           # 测试UI
pnpm test:coverage     # 测试覆盖率
pnpm test:e2e          # E2E测试
pnpm test:e2e:ui       # E2E测试UI
```

## 项目结构快速导航

### 核心基础设施
- `src/lib/api/` - API客户端配置
- `src/stores/` - 状态管理
- `src/shared/utils/` - 工具函数
- `src/types/` - TypeScript类型

### 功能开发
- `src/features/auth/` - 认证功能
- `src/features/forum/` - 版块功能
- `src/features/thread/` - 主题功能
- `src/features/user/` - 用户功能

### 组件开发
- `src/components/ui/` - UI基础组件
- `src/components/common/` - 通用组件

## 常用导入

```typescript
// API客户端
import { apiClient, queryClient, queryKeys } from '@/lib';

// 状态管理
import { useAuthStore } from '@/stores';

// 工具函数
import { cn, formatDate, formatRelativeTime } from '@/shared';

// 类型定义
import type { ApiResponse, PaginatedResponse } from '@/types';
```

## Docker部署

```bash
# 构建镜像
docker build -t poketb-forum-frontend .

# 运行容器
docker run -p 80:80 poketb-forum-frontend
```

## 开发建议

1. **组件开发**：先在 `src/components/ui/` 创建基础组件
2. **功能开发**：在 `src/features/` 对应目录实现功能模块
3. **API集成**：在 `src/services/` 创建API服务函数
4. **状态管理**：复杂状态使用Zustand，服务器状态使用TanStack Query

## 技术支持

- 查看 `PROJECT_STRUCTURE.md` 了解完整项目结构
- 查看 `INFRASTRUCTURE_CHECKLIST.md` 了解基础设施详情
- 查看官方文档：[React](https://react.dev) | [Vite](https://vitejs.dev) | [TanStack Query](https://tanstack.com/query)
