# Quick Reference - Backend

## 认证集成快速检查

### 路由是否需要认证？

```typescript
// ✅ 需要 - 在 routes/index.ts 中包裹
routes.use(
  authMiddleware(jwtService),
  myRoutes(service).routes()
);

// ❌ 不需要 - 直接注册
routes.use(publicRoutes(service).routes());
```

### 获取用户 ID

```typescript
// ✅ 正确
const userId = (ctx as AuthContext).state?.user?.userId;

// ❌ 错误
const userId = ctx.state.userId;
const userId = ctx.request.body.userId;
```

### ES Module 导入

```typescript
// ✅ 正确
import { MyService } from '../services/my.service';
const service = new MyService(prisma);

// ❌ 错误
const { MyService } = require('../services/my.service');
```

---

# Quick Reference - Frontend

## API 调用快速检查

### 使用正确的 API 客户端

```typescript
// ✅ 正确 - 需要认证
import { authApiClient } from '@/features/auth/api/apiClient';
export async function getData() {
  return authApiClient.get<Data>('/api/endpoint');
}

// ❌ 错误 - 没有 token
import axios from 'axios';
export async function getData() {
  return axios.get('/api/endpoint');
}
```

### URL 参数处理

```typescript
// ✅ 正确 - 字符串拼接
authApiClient.get(`/items?page=${page}&search=${encodeURIComponent(search)}`);

// ❌ 错误 - axios 风格（不工作）
authApiClient.get('/items', { params: { page, search } });
```

### React Query Mutation

```typescript
// ✅ 正确 - 成功后刷新
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApiClient.post('/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
```

---

## 新模块检查清单

### 后端
- [ ] 在 `routes/index.ts` 中导入服务和路由
- [ ] 需要认证的路由用 `authMiddleware` 包裹
- [ ] 从 `ctx.state.user.userId` 获取用户ID
- [ ] 使用标准错误类型 (`ValidationError`, `NotFoundError`, etc.)
- [ ] 使用 ES6 `import` 语法

### 前端
- [ ] API 函数使用 `authApiClient`
- [ ] 文件位置: `features/{feature}/api/{feature}.ts`
- [ ] 创建 React Query hooks: `{feature}-queries.ts`
- [ ] URL 参数作为字符串拼接
- [ ] Mutation 正确 invalidate queries
- [ ] 类型定义在 `types/{feature}.types.ts`
