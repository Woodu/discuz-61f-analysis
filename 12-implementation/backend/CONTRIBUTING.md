# 贡献指南

感谢您对 PokeTB Forum 后端项目的关注！我们欢迎所有形式的贡献。

## 开发环境设置

### 1. Fork 和克隆

```bash
# Fork 仓库后克隆
git clone https://github.com/your-username/poketb-forum-backend.git
cd poketb-forum-backend

# 添加上游仓库
git remote add upstream https://github.com/poketb/poketb-forum-backend.git
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

### 4. 验证环境

```bash
npm run check-env
```

### 5. 数据库设置

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 运行迁移
npm run prisma:migrate
```

### 6. 启动开发服务器

```bash
npm run dev
```

## 开发工作流

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 编写代码

- 遵循代码规范
- 编写单元测试
- 更新文档

### 3. 运行测试和检查

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

### 4. 提交代码

```bash
git add .
git commit -m "feat: add user authentication"
```

### 5. 推送分支

```bash
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request

在 GitHub 上创建 Pull Request，描述您的更改。

## 代码规范

### TypeScript 规范

- 使用 TypeScript 严格模式
- 避免使用 `any` 类型
- 为函数添加返回类型
- 为公共 API 添加 JSDoc 注释

```typescript
// 好的示例
interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Get user by ID
 * @param id - User ID
 * @returns User object or null
 */
async function getUserById(id: string): Promise<User | null> {
  // implementation
}

// 不好的示例
async function getUser(id: any) {
  // implementation
}
```

### 错误处理

- 使用自定义错误类型
- 提供有意义的错误消息
- 记录错误详情

```typescript
// 好的示例
import { NotFoundError } from './types/errors';

if (!user) {
  throw new NotFoundError('User not found');
}

// 不好的示例
throw new Error('Error');
```

### 日志记录

- 使用适当的日志级别
- 包含上下文信息

```typescript
logger.info('User created', { userId: user.id, username: user.username });
logger.error('Database error', { error: err.message, query });
```

### 命名约定

- **文件名**: kebab-case (`user.service.ts`)
- **类名**: PascalCase (`UserService`)
- **函数/变量**: camelCase (`getUserById`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **接口/类型**: PascalCase (`User`, `ApiResponse`)

### 文件组织

```
feature/
├── feature.controller.ts    # 控制器
├── feature.service.ts       # 服务
├── feature.routes.ts        # 路由
├── feature.types.ts         # 类型定义
├── feature.validation.ts    # 验证 schema
├── feature.test.ts          # 测试
└── index.ts                 # 导出
```

## 提交消息规范

使用约定式提交格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```
feat(auth): add JWT refresh token support

- Implement refresh token endpoint
- Add token rotation logic
- Update authentication middleware

Closes #123
```

## Pull Request 指南

### PR 标题

使用与提交消息相同的格式：

```
feat(auth): add JWT refresh token support
```

### PR 描述

```markdown
## 变更概述
简要描述此 PR 的目的。

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 重构
- [ ] 性能优化
- [ ] 测试

## 测试
描述如何测试这些更改。

## 截图（如适用）
添加截图以展示更改。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加/更新测试
- [ ] 已更新文档
- [ ] 所有测试通过
- [ ] 无 TypeScript 错误
- [ ] 已通过 ESLint 检查

## 相关 Issue
关闭 #123
```

## 测试指南

### 单元测试

为服务层编写单元测试：

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await userService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.username).toBe(userData.username);
    });

    it('should throw error if username exists', async () => {
      await expect(
        userService.createUser({
          username: 'existing',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ConflictError);
    });
  });
});
```

### 集成测试

为 API 端点编写集成测试：

```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app.callback())
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

## 文档指南

### 代码注释

为复杂的逻辑添加注释：

```typescript
/**
 * Hash password using Argon2
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(password: string): Promise<string> {
  // Argon2id with recommended parameters for security
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,         // iterations
    parallelism: 4,
  });
}
```

### API 文档

为 API 端点添加文档：

```typescript
/**
 * @route POST /api/users
 * @description Create a new user
 * @access Private (Admin only)
 * @body { username: string, email: string, password: string }
 * @returns { success: true, data: User }
 */
router.post('/users', requireAdmin, createUser);
```

## 性能考虑

### 数据库查询

- 使用 Prisma 的 `select` 限制返回字段
- 避免在循环中查询数据库
- 使用事务处理相关操作

```typescript
// 好的示例
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
  },
  where: {
    active: true,
  },
});

// 不好的示例
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { userId: user.id },
  });
}
```

### 缓存策略

```typescript
// 使用 Redis 缓存
async function getUser(id: string) {
  const cacheKey = `user:${id}`;

  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 从数据库查询
  const user = await prisma.user.findUnique({ where: { id } });

  // 存入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}
```

## 安全最佳实践

### 输入验证

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

// 使用
const data = createUserSchema.parse(req.body);
```

### 敏感数据

```typescript
// 不要记录敏感信息
logger.info('User logged in', { userId: user.id });
// 而不是
logger.info('User logged in', { userId, password }); // ❌

// 不要在错误消息中暴露敏感信息
throw new Error('Invalid credentials'); // ✅
// 而不是
throw new Error(`Invalid password for ${email}`); // ❌
```

## 获取帮助

- 查看 [README.md](./README.md) 了解项目概述
- 查看 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解架构设计
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解部署流程
- 提交 Issue 获取帮助
- 加入讨论组交流

## 行为准则

- 尊重所有贡献者
- 接受建设性批评
- 关注对社区最有利的事情
- 对不同观点保持同理心

## 许可证

通过贡献代码，您同意您的贡献将根据项目的 MIT 许可证进行许可。

---

再次感谢您的贡献！
