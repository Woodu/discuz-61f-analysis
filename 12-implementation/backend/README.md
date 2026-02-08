# PokeTB Forum Backend

PokeTB Forum 后端服务，基于 Koa + TypeScript + Prisma 构建。

## 技术栈

- **运行时**: Node.js >= 18.0.0
- **框架**: Koa 2.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL (via Prisma ORM)
- **缓存**: Redis (via ioredis)
- **认证**: JWT (jsonwebtoken)
- **密码**: Argon2
- **日志**: Winston
- **验证**: Zod
- **测试**: Jest + Supertest

## 项目结构

```
backend/
├── prisma/
│   └── schema.prisma        # Prisma 数据库模型
├── src/
│   ├── config/              # 配置管理
│   │   └── index.ts
│   ├── controllers/         # 控制器（待实现）
│   ├── lib/                 # 第三方库封装
│   │   └── prisma.ts        # Prisma 客户端
│   ├── middleware/          # 中间件
│   │   ├── errorHandler.ts  # 错误处理
│   │   └── notFoundHandler.ts
│   ├── routes/              # 路由
│   │   └── index.ts
│   ├── services/            # 业务逻辑
│   │   └── index.ts
│   ├── test/                # 测试配置
│   │   └── setup.ts
│   ├── types/               # 类型定义
│   │   ├── errors.ts        # 自定义错误类型
│   │   ├── express.ts       # 扩展类型
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── logger.ts        # 日志系统
│   │   ├── validation.ts    # 验证工具
│   │   ├── helpers.ts       # 辅助函数
│   │   └── index.ts
│   └── index.ts             # 入口文件
├── logs/                    # 日志目录
├── .env.example             # 环境变量示例
├── .eslintrc.js            # ESLint 配置
├── .prettierrc             # Prettier 配置
├── Dockerfile              # Docker 配置
├── jest.config.js          # Jest 配置
├── package.json
└── tsconfig.json           # TypeScript 配置
```

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js >= 18.0.0
- PostgreSQL 数据库
- Redis（可选，用于缓存）

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

必需的环境变量：
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/poketb_forum
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars
HASH_SALT=your-salt-min-16-chars
```

### 4. 数据库迁移

```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate
```

### 5. 启动服务

```bash
# 开发模式（热重载）
pnpm dev

# 生产模式
pnpm build
pnpm start
```

服务将在 `http://localhost:3001` 启动。

## API 端点

### 健康检查

```
GET /api/health
```

响应：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### API 信息

```
GET /api/
```

## 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码格式化：

```bash
# 检查代码规范
pnpm lint

# 自动修复
pnpm lint:fix

# 类型检查
pnpm type-check
```

### 测试

```bash
# 运行测试
pnpm test

# 监视模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

### 数据库操作

```bash
# 打开 Prisma Studio
pnpm prisma:studio

# 运行数据库种子
pnpm db:seed

# 创建新的迁移
npx prisma migrate dev --name your_migration_name
```

## 错误处理

项目使用自定义错误类型：

```typescript
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
} from './types/errors';

// 使用示例
throw new ValidationError('用户名格式错误');
throw new AuthenticationError('请先登录');
throw new NotFoundError('用户不存在');
```

## 日志系统

使用 Winston 进行日志记录：

```typescript
import { logger } from './utils/logger';

logger.info('信息日志');
logger.warn('警告日志');
logger.error('错误日志');
logger.debug('调试日志');
```

## 部署

### Docker 构建

```bash
docker build -t poketb-forum-backend .
docker run -p 3001:3001 --env-file .env poketb-forum-backend
```

### 环境变量

生产环境必需的环境变量：

- `NODE_ENV`: 设置为 `production`
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_ACCESS_SECRET`: JWT 访问令牌密钥
- `JWT_REFRESH_SECRET`: JWT 刷新令牌密钥
- `ENCRYPTION_KEY`: 加密密钥
- `HASH_SALT`: 哈希盐值

可选的环境变量：

- `PORT`: 服务端口（默认 3001）
- `REDIS_HOST`: Redis 主机（默认 localhost）
- `REDIS_PORT`: Redis 端口（默认 6379）
- `REDIS_PASSWORD`: Redis 密码
- `ALLOWED_ORIGINS`: CORS 允许的源（逗号分隔）
- `LOG_LEVEL`: 日志级别（默认 info）

## 许可证

MIT

## 作者

PokeTB Team
