# Backend Development Standards

## 开发方法论

### TDD + 子进程开发模式

本项目采用 **TDD (Test-Driven Development)** + **子进程** 的开发模式：

1. **先写测试** - 在实现功能前先编写测试用例
2. **使用子进程** - 通过 Task tool 的 subagent_type 创建专用代理
3. **确保测试通过** - 每个阶段完成后所有测试必须通过

**子进程类型选择**:
- `general-purpose` - 复杂的多步骤任务
- `Explore` - 代码库探索和分析
- `Plan` - 架构设计和实施计划

**开发流程**:
```
1. 设计阶段 (Plan agent) → 设计实现方案
2. 测试阶段 (general-purpose) → 编写测试用例
3. 实现阶段 (general-purpose) → 实现功能，确保测试通过
4. 验证阶段 → 运行所有测试确认
```

---

## 认证集成规范

### 1. 认证中间件使用

**✅ 正确 - 使用全局 authMiddleware**
```typescript
// src/routes/index.ts
import { authMiddleware } from '../middleware/auth.middleware';
import { jwtService } from '../services/jwt.service';
import { pmRoutes } from './pm.routes';

// 需要认证的路由必须包裹 authMiddleware
routes.use(
  authMiddleware(jwtService),
  pmRoutes(pmService).routes()
);
```

**❌ 错误 - 自定义认证逻辑**
```typescript
// 不要在每个路由文件中重新实现认证
router.use(async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: '需要身份验证' };
    return;
  }
  await next();
});
```

### 2. 用户 ID 访问规范

**✅ 正确 - 从 ctx.state.user 获取**
```typescript
import { JWTService } from '../services/jwt.service';

interface AuthContext {
  state: {
    user?: {
      userId: number;
      permissions?: string[];
      roles?: string[];
      isAdmin?: boolean;
    };
  };
}

router.post('/create', async (ctx) => {
  // 正确：从 authMiddleware 设置的 context 获取
  const userId = (ctx as AuthContext).state?.user?.userId;

  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '未认证' };
    return;
  }

  // 使用 userId 进行业务逻辑
  const result = await service.create(userId, data);
  ctx.body = result;
});
```

**❌ 错误 - 从错误位置获取**
```typescript
// 错误：ctx.state.userId 不存在
const userId = ctx.state.userId;

// 错误：从 request body 获取（安全风险）
const userId = ctx.request.body.userId;
```

### 3. 管理员权限验证

**✅ 正确 - 使用 requireAdmin 中间件**
```typescript
import { requireAdmin } from '../middleware/auth.middleware';

// 在路由文件中使用
router.use(requireAdmin);

// 或者直接作为中间件
router.post('/admin-action', requireAdmin, async (ctx) => {
  // 这里可以安全地访问 ctx.state.user
  const userId = ctx.state.user.userId;
  // ...
});
```

**❌ 错误 - 手动检查管理员权限**
```typescript
// 不要手动实现权限检查
router.use(async (ctx, next) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.state.user.userId }
  });
  if (!user.isAdmin) {
    ctx.status = 403;
    return;
  }
  await next();
});
```

### 4. 模块导入规范

**✅ 正确 - 使用 ES6 import**
```typescript
import { PMService } from '../services/pm.service';
import { PrivacyService } from '../services/privacy.service';
import { BannedWordService } from '../services/banned-word.service';
import { PMRestrictionService } from '../services/pm-restriction.service';

const pmService = new PMService(prisma);
const privacyService = new PrivacyService(prisma);
```

**❌ 错误 - 使用 require 解构**
```typescript
// 不要使用 require 解构导出
const { PMService, PrivacyService, BannedWordService, PMRestrictionService } = require('../services/pm.service');
```

### 5. 错误处理规范

**✅ 正确 - 使用标准错误类型**
```typescript
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  RateLimitError,
} from '../types/errors';

router.post('/resource', async (ctx) => {
  try {
    const result = await service.create(data);
    ctx.body = { success: true, data: result };
  } catch (error) {
    if (error instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = { error: error.message, code: 'VALIDATION_ERROR' };
      return;
    }
    if (error instanceof NotFoundError) {
      ctx.status = 404;
      ctx.body = { error: error.message, code: 'NOT_FOUND' };
      return;
    }
    throw error; // 让全局错误处理器处理
  }
});
```

### 6. 新增路由模块检查清单

创建新的路由模块时，必须确保：

- [ ] 使用 `import` 而非 `require`
- [ ] 如需认证，在 `routes/index.ts` 中用 `authMiddleware` 包裹
- [ ] 如需管理员权限，使用 `requireAdmin` 中间件
- [ ] 从 `ctx.state.user.userId` 获取用户ID（不要从 body/params）
- [ ] 使用标准错误类型抛出错误
- [ ] 在 `routes/index.ts` 中注册路由

### 7. routes/index.ts 注册模板

```typescript
// ==================== 新功能模块 ====================

// 导入服务
import { NewFeatureService } from '../services/new-feature.service';
const newFeatureService = new NewFeatureService(prisma);

// 导入路由
import { newFeatureRoutes } from './new-feature.routes';

// 公开路由（无需认证）
routes.use(newFeatureRoutes(newFeatureService).routes());

// 受保护路由（需要认证）
routes.use(
  authMiddleware(jwtService),
  newFeatureProtectedRoutes(newFeatureService).routes()
);

// 管理员路由（需要管理员权限）
routes.use(
  authMiddleware(jwtService),
  newFeatureAdminRoutes(newFeatureService).routes()
);
```

### 8. API 响应格式规范

**成功响应：**
```typescript
// 单个资源
ctx.body = {
  success: true,
  data: { id: 1, name: "example" }
};

// 列表资源
ctx.body = {
  success: true,
  data: [...],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 100
  }
};

// 创建/更新成功（201 Created）
ctx.status = 201;
ctx.body = {
  success: true,
  id: newlyCreatedId
};

// 删除成功（204 No Content）
ctx.status = 204;
```

**错误响应：**
```typescript
// 400 Bad Request
ctx.status = 400;
ctx.body = {
  error: '错误描述',
  code: 'VALIDATION_ERROR'
};

// 401 Unauthorized
ctx.status = 401;
ctx.body = {
  error: '未提供认证令牌'
};

// 403 Forbidden
ctx.status = 403;
ctx.body = {
  error: '权限不足',
  code: 'AUTHORIZATION_ERROR'
};

// 404 Not Found
ctx.status = 404;
ctx.body = {
  error: '资源不存在',
  code: 'NOT_FOUND'
};

// 429 Too Many Requests
ctx.status = 429;
ctx.body = {
  error: '请求过于频繁',
  code: 'RATE_LIMIT_EXCEEDED'
};
```

### 9. 数据库访问规范

**✅ 正确 - 通过服务层访问**
```typescript
// 在路由中只调用服务方法
router.post('/create', async (ctx) => {
  const result = await myService.create(userId, data);
  ctx.body = result;
});
```

**❌ 错误 - 直接在路由中访问数据库**
```typescript
// 不要在路由中直接使用 Prisma
router.post('/create', async (ctx) => {
  const result = await prisma.user.create({ ... });
  ctx.body = result;
});
```

### 10. 类型定义规范

```typescript
// 为路由 context 定义类型
interface AuthenticatedContext {
  state: {
    user?: {
      userId: number;
      permissions?: string[];
      roles?: string[];
      isAdmin?: boolean;
    };
  };
}

// 为请求体定义类型
interface CreateResourceBody {
  name: string;
  description?: string;
  // ...
}

// 在路由中使用类型
router.post('/create', async (ctx) => {
  const userId = (ctx as AuthenticatedContext).state?.user?.userId;
  const body = ctx.request.body as CreateResourceBody;
  // ...
});
```

---

## 重要提示

**任何新增模块必须遵循以上规范，确保：**

1. 认证一致性 - 所有受保护端点使用统一的认证机制
2. 类型安全 - 使用 TypeScript 类型定义
3. 错误处理 - 使用标准错误类型和响应格式
4. 代码可维护性 - 遵循现有的代码组织模式

**在提交代码前，请运行测试确保：**
- 所有认证端点正常工作
- 未认证请求被正确拒绝
- 管理员权限验证正常
