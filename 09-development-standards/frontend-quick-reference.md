# Quick Reference - Frontend

## API 调用快速检查

### 使用正确的 API 客户端

```typescript
// ✅ 正确 - 需要认证的 API
import { authApiClient } from '@/features/auth/api/apiClient';

export async function getUserData(): Promise<User> {
  return authApiClient.get<User>('/user/profile');
}

// ❌ 错误 - 没有认证信息
import axios from 'axios';

export async function getUserData(): Promise<User> {
  const { data } = await axios.get<User>('/api/user/profile');
  return data;
}
```

### URL 参数处理

```typescript
// ✅ 正确 - 字符串拼接
export async function searchUsers(query: string, page = 1) {
  return authApiClient.get<Results>(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

// ✅ 复杂参数使用 URLSearchParams
export async function getItems(filters: FilterOptions) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  params.append('page', String(filters.page || 1));

  return authApiClient.get<Items>(`/items?${params.toString()}`);
}

// ❌ 错误 - axios 风格（不工作）
export async function getItems(page: number) {
  return authApiClient.get<Items>('/items', {
    params: { page }  // 这不会工作！
  });
}
```

### React Query Hooks 模板

```typescript
// Query Keys
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: FilterOptions) =>
    [...itemKeys.lists(), filters] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...itemKeys.details(), id] as const,
};

// Query Hook
export function useItems(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: () => getItemsAPI(filters),
  });
}

// Mutation Hook
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) =>
      authApiClient.post<Item>('/items', data),
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
```

---

## 新模块文件结构

```
src/features/{feature}/
├── api/
│   ├── {feature}.ts           # API 函数
│   └── {feature}-queries.ts   # React Query hooks
├── components/
│   └── {Feature}Components.tsx
├── types/
│   └── {feature}.types.ts
└── index.ts
```

---

## 新模块检查清单

### API 层
- [ ] 使用 `authApiClient` 而非 `axios` 或 `apiClient`
- [ ] URL 参数作为字符串拼接
- [ ] 函数有清晰的 JSDoc 注释
- [ ] 导出的类型放在 `types/` 目录

### React Query Hooks
- [ ] 定义统一的 query keys
- [ ] Query 函数使用 `authApiClient`
- [ ] Mutation 在成功后 invalidate 相关 queries
- [ ] 使用 TypeScript 类型

### 组件
- [ ] 使用 React Query hooks 获取数据
- [ ] 正确处理加载和错误状态
- [ ] 使用 shadcn/ui 组件

---

## 常见错误

### 1. 使用错误的 API 客户端
```typescript
// ❌ 错误
import axios from 'axios';
const { data } = await axios.get('/api/endpoint');

// ✅ 正确
import { authApiClient } from '@/features/auth/api/apiClient';
const data = await authApiClient.get<DataType>('/endpoint');
```

### 2. URL 参数格式错误
```typescript
// ❌ 错误 - axios 风格
authApiClient.get('/items', { params: { page: 1 } });

// ✅ 正确 - 字符串拼接
authApiClient.get('/items?page=1');
```

### 3. 忘记 invalidate queries
```typescript
// ❌ 错误 - 创建后列表不更新
const createMutation = useMutation({
  mutationFn: (data) => authApiClient.post('/items', data),
});

// ✅ 正确 - 创建后刷新列表
const createMutation = useMutation({
  mutationFn: (data) => authApiClient.post('/items', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
  },
});
```

---

## 认证说明

`authApiClient` 自动处理：
- ✅ 从 `localStorage.auth_tokens` 读取 token
- ✅ 添加 `Authorization: Bearer <token>` 头
- ✅ 401 时自动刷新 token
- ✅ 刷新失败时跳转登录页

你只需要调用 API，不需要手动处理认证。
