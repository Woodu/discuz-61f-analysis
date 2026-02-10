# Frontend Development Standards

## 开发方法论

### TDD + 子进程开发模式

本项目采用 **TDD (Test-Driven Development)** + **子进程** 的开发模式：

1. **先写测试** - 在实现功能前先编写测试用例
2. **使用子进程** - 通过 Task tool 的 subagent_type 创建专用代理
3. **确保测试通过** - 每个阶段完成后所有测试必须通过

**子进程类型选择**:
- `general-purpose` - 组件开发、测试编写
- `Explore` - 代码库探索和分析

**开发流程**:
```
1. 设计阶段 → 设计组件结构和接口
2. 测试阶段 (general-purpose) → 编写组件/测试用例
3. 实现阶段 (general-purpose) → 实现功能，确保测试通过
4. 验证阶段 → 运行所有测试确认
```

---

## API 调用规范

### 1. API 客户端选择

**✅ 正确 - 使用 authApiClient**
```typescript
// 所有需要认证的 API 调用必须使用 authApiClient
import { authApiClient } from '@/features/auth/api/apiClient';

export async function getUserData(): Promise<UserData> {
  return authApiClient.get<UserData>('/user/profile');
}

export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  return authApiClient.put<User>('/user/profile', data);
}
```

**❌ 错误 - 使用原始 axios**
```typescript
// 不要直接使用 axios 进行 API 调用
import axios from 'axios';

export async function getUserData(): Promise<UserData> {
  const { data } = await axios.get('/api/user/profile');
  return data;
}
```

**❌ 错误 - 使用 apiClient（未认证）**
```typescript
// lib/api/client.ts 中的 apiClient 只用于公开 API
// 需要认证的 API 必须使用 authApiClient
import { apiClient } from '@/lib/api/client';

// 错误：这个调用不会携带认证信息
export async function getPrivateData(): Promise<Data> {
  return apiClient.get<Data>('/private/data');
}
```

### 2. authApiClient vs apiClient 使用场景

| 客户端 | 用途 | Token 来源 | 使用场景 |
|--------|------|-----------|----------|
| `authApiClient` | 需要认证的 API | `localStorage.auth_tokens` | 用户数据、发帖、评论、私信等 |
| `apiClient` | 公开 API | `localStorage.accessToken` | 仅为兼容旧代码，新代码不要用 |

**新代码必须统一使用 `authApiClient`**

### 3. API 函数文件位置

```
src/features/
├── forum/
│   └── api/
│       └── forumApi.ts        ✅ 正确
├── pm/
│   └── api/
│       ├── pm.ts              ✅ 正确
│       └── pm-queries.ts      ✅ React Query hooks
├── admin/
│   └── pm/
│       └── api/
│           ├── admin-pm.ts    ✅ 正确
│           └── admin-pm-queries.ts  ✅ React Query hooks
```

**规则：**
- API 函数放在 `features/{feature}/api/` 目录下
- React Query hooks 放在同一个目录，命名为 `{feature}-queries.ts`
- 管理 API 放在 `features/admin/{feature}/api/` 下

### 4. API 函数模板

```typescript
/**
 * {Feature} API
 *
 * {Feature} 相关的 API 调用
 */

import { authApiClient } from '@/features/auth/api/apiClient';
import type {
  // 从 types 文件导入类型
  Resource,
  CreateResourceInput,
  UpdateResourceInput,
} from '../types/{feature}.types';

// ==================== API 函数 ====================

/**
 * 获取资源列表
 */
export async function getResourcesAPI(params: {
  page?: number;
  pageSize?: number;
}): Promise<{ data: Resource[]; total: number }> {
  const { page = 1, pageSize = 20 } = params;
  return authApiClient.get<{ data: Resource[]; total: number }>(
    `/{feature}?page=${page}&pageSize=${pageSize}`
  );
}

/**
 * 获取单个资源
 */
export async function getResourceAPI(id: number): Promise<Resource> {
  return authApiClient.get<Resource>(`/{feature}/${id}`);
}

/**
 * 创建资源
 */
export async function createResourceAPI(
  input: CreateResourceInput
): Promise<{ id: number }> {
  return authApiClient.post<{ id: number }>(
    '/{feature}',
    input
  );
}

/**
 * 更新资源
 */
export async function updateResourceAPI(
  id: number,
  input: UpdateResourceInput
): Promise<Resource> {
  return authApiClient.put<Resource>(
    `/{feature}/${id}`,
    input
  );
}

/**
 * 删除资源
 */
export async function deleteResourceAPI(id: number): Promise<void> {
  return authApiClient.delete<void>(`/{feature}/${id}`);
}

// ==================== 导出 API 对象（可选）====================

/**
 * {Feature} API 对象
 */
export const {feature}Api = {
  getList: getResourcesAPI,
  getOne: getResourceAPI,
  create: createResourceAPI,
  update: updateResourceAPI,
  delete: deleteResourceAPI,
};
```

### 5. React Query Hooks 模板

```typescript
/**
 * {Feature} React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { authApiClient } from '@/features/auth/api/apiClient';
import type {
  Resource,
  CreateResourceInput,
  UpdateResourceInput,
} from '../types/{feature}.types';

// ==================== Query Keys ====================

export const {feature}Keys = {
  all: ['{feature}'] as const,
  lists: () => [...{feature}Keys.all, 'list'] as const,
  list: (params: { page?: number; pageSize?: number }) =>
    [...{feature}Keys.lists(), params] as const,
  details: () => [...{feature}Keys.all, 'detail'] as const,
  detail: (id: number) => [...{feature}Keys.details(), id] as const,
};

// ==================== Queries ====================

/**
 * 获取资源列表
 */
export function useResources(
  params: { page?: number; pageSize?: number } = {},
  options?: Omit<UseQueryOptions<{ data: Resource[]; total: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: {feature}Keys.list(params),
    queryFn: () => authApiClient.get<{ data: Resource[]; total: number }>(
      `/{feature}?page=${params.page || 1}&pageSize=${params.pageSize || 20}`
    ),
    ...options,
  });
}

/**
 * 获取单个资源
 */
export function useResource(
  id: number,
  options?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: {feature}Keys.detail(id),
    queryFn: () => authApiClient.get<Resource>(`/{feature}/${id}`),
    enabled: !!id, // 只有 id 存在时才查询
    ...options,
  });
}

// ==================== Mutations ====================

/**
 * 创建资源
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateResourceInput) =>
      authApiClient.post<{ id: number }>('/{feature}', input),
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: {feature}Keys.lists() });
    },
  });
}

/**
 * 更新资源
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateResourceInput }) =>
      authApiClient.put<Resource>(`/{feature}/${id}`, input),
    onSuccess: (_, variables) => {
      // 刷新列表和详情
      queryClient.invalidateQueries({ queryKey: {feature}Keys.lists() });
      queryClient.invalidateQueries({ queryKey: {feature}Keys.detail(variables.id) });
    },
  });
}

/**
 * 删除资源
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      authApiClient.delete<void>(`/{feature}/${id}`),
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: {feature}Keys.lists() });
    },
  });
}
```

### 6. 类型定义规范

```typescript
/**
 * {Feature} 类型定义
 */

// ==================== 请求类型 ====================

export interface CreateResourceInput {
  name: string;
  description?: string;
  // ...
}

export interface UpdateResourceInput {
  name?: string;
  description?: string;
  // ...
}

export interface ResourceListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  // ...
}

// ==================== 响应类型 ====================

export interface Resource {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // ...
}

export interface ResourceListResponse {
  data: Resource[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// ==================== 表单类型（如有UI表单）====================

export interface ResourceFormData {
  name: string;
  description: string;
  // ...
}

// ==================== 错误类型 ====================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

### 7. URL 参数处理

**authApiClient 使用 fetch API，不支持 axios 风格的 params 配置**

```typescript
// ✅ 正确 - URL 查询参数作为字符串
export async function searchUsers(query: string, page = 1): Promise<Results> {
  return authApiClient.get<Results>(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

// ❌ 错误 - axios 风格的 params（不工作）
export async function searchUsers(query: string, page = 1): Promise<Results> {
  return authApiClient.get<Results>('/users/search', {
    params: { q: query, page }
  });
}

// ✅ 复杂参数使用 URLSearchParams
export async function getItems(filters: FilterOptions): Promise<Items> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  params.append('page', String(filters.page || 1));
  params.append('pageSize', String(filters.pageSize || 20));

  return authApiClient.get<Items>(`/items?${params.toString()}`);
}
```

### 8. 错误处理

```typescript
// authApiClient 会自动处理 401 并尝试刷新 token
// 如果刷新失败，会自动重定向到登录页

export async function someAPI(): Promise<Data> {
  try {
    return await authApiClient.get<Data>('/endpoint');
  } catch (error) {
    // 错误已经被统一处理
    // 这里可以添加额外的错误处理逻辑
    throw error;
  }
}
```

### 9. 组件中使用 API

```typescript
// ✅ 正确 - 使用 React Query Hooks
import { useResources, useCreateResource } from '../api/resource-queries';

function ResourceList() {
  const { data, isLoading, error } = useResources({ page: 1, pageSize: 20 });
  const createMutation = useCreateResource();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      {/* 渲染数据 */}
      <button onClick={() => createMutation.mutate(newData)}>
        创建
      </button>
    </div>
  );
}

// ✅ 可接受 - 直接使用 API 函数（非 React 环境）
import { getResourceAPI } from '../api/resource';

async function handleAction(id: number) {
  try {
    const resource = await getResourceAPI(id);
    // 处理结果
  } catch (error) {
    // 处理错误
  }
}
```

### 10. 新增功能模块检查清单

创建新的功能模块时，必须确保：

- [ ] API 函数使用 `authApiClient` 而非 `axios` 或 `apiClient`
- [ ] API 函数放在 `features/{feature}/api/` 目录
- [ ] 类型定义放在 `features/{feature}/types/` 目录
- [ ] 创建对应的 React Query hooks 文件（`{feature}-queries.ts`）
- [ ] Query keys 有统一的前缀
- [ ] Mutation 在成功后 invalidate 相关 queries
- [ ] URL 参数作为字符串拼接，不使用 axios 风格的 params
- [ ] 导出的 API 函数有清晰的 JSDoc 注释

### 11. 目录结构模板

```
src/features/{feature}/
├── api/
│   ├── {feature}.ts           # API 函数
│   └── {feature}-queries.ts   # React Query hooks
├── components/
│   ├── {Feature}List.tsx
│   ├── {Feature}Item.tsx
│   └── {Feature}Form.tsx
├── pages/
│   └── {Feature}Page.tsx
├── types/
│   └── {feature}.types.ts     # 类型定义
└── index.ts                   # 导出
```

### 12. 认证相关注意事项

**authApiClient 自动处理：**
- ✅ 从 `localStorage.auth_tokens` 读取 token
- ✅ 添加 `Authorization: Bearer <token>` 头
- ✅ 401 错误时自动尝试刷新 token
- ✅ 刷新失败时自动跳转登录页

**你只需要：**
- 调用 `authApiClient` 方法
- 处理返回的数据
- 处理可能的错误（如果需要自定义错误处理）

**不要：**
- ❌ 手动添加 Authorization 头
- ❌ 手动处理 401 错误
- ❌ 手动管理 token 存储
- ❌ 使用其他 axios 实例

---

## 重要提示

**任何新增模块必须遵循以上规范，确保：**

1. **认证一致性** - 所有 API 调用使用 `authApiClient`
2. **类型安全** - 使用 TypeScript 类型定义
3. **数据管理** - 使用 React Query 进行状态管理
4. **代码可维护性** - 遵循现有的代码组织模式

**在提交代码前，请确保：**
- API 调用都能正确携带认证信息
- 类型定义完整且正确
- React Query hooks 正确 invalidate 相关数据
- 代码通过 TypeScript 类型检查
