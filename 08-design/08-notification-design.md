# 通知系统设计文档

> **设计时间**: 2026-02-10
>
> **版本**: 3.0 (极简版 - 仅站内通知)

---

## 1. 概述

### 1.1 目标

设计一个极简的通知系统：
- 多种通知类型
- 按需查询（用户操作时主动获取）
- 批量操作
- 通知偏好设置
- 通知历史记录

### 1.2 设计原则

- **极简优先**: 不使用 WebSocket、不使用轮询、不发送邮件，用户操作时按需查询
- **简单可靠**: 通知存储在数据库，用户上线后即可查看
- **可配置**: 用户可自定义接收哪些类型的通知
- **可扩展**: 易于添加新的通知类型
- **性能优化**: 批量处理，避免通知风暴

### 1.3 查询时机

| 用户操作 | 查询动作 |
|----------|----------|
| 登录成功 | ✅ 查询未读数量 |
| 刷新页面 | ✅ 查询未读数量 |
| 路由切换 | ✅ 查询未读数量 |
| 窗口获得焦点 | ✅ 查询未读数量 |
| 点击通知图标 | ✅ 查询通知列表 |
| 发帖/回复后 | ✅ 刷新未读数量 |

---

## 2. 数据模型设计

### 2.1 通知表 (Notification)

```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")

  // 通知类型
  type        String   @db.VarChar(50)  // 见 NotificationType 枚举

  // 通知内容
  title       String   @db.VarChar(255)
  content     String?  @db.Text

  // 关联数据 (JSON格式)
  data        Json?                    // 存储相关的实体ID等信息

  // 状态
  isRead      Boolean  @default(false) @map("is_read")
  readAt      DateTime? @map("read_at")

  // 创建时间
  createdAt   DateTime @default(now()) @map("created_at")

  // 关系
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([type])
  @@map("notifications")
}
```

### 2.2 用户通知偏好表 (UserNotificationPreference)

```prisma
model UserNotificationPreference {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique @map("user_id")

  // 各类型通知开关
  threadReply     Boolean @default(true)  @map("thread_reply")     // 主题被回复
  threadMention   Boolean @default(true)  @map("thread_mention")   // 在主题中被@
  postLike        Boolean @default(true)  @map("post_like")        // 帖子被点赞
  quote           Boolean @default(true)  @map("quote")            // 帖子被引用
  systemNotice    Boolean @default(true)  @map("system_notice")    // 系统通知
  pmReceived      Boolean @default(true)  @map("pm_received")      // 收到私信
  modAction       Boolean @default(true)  @map("mod_action")       // 版主操作通知
  creditChange    Boolean @default(true)  @map("credit_change")    // 积分变动
  warning         Boolean @default(true)  @map("warning")          // 收到警告
  ban             Boolean @default(true)  @map("ban")              // 被封禁
  report          Boolean @default(true)  @map("report")           // 举报处理结果
  pokemon         Boolean @default(true)  @map("pokemon")          // Pokemon系统通知
  trade           Boolean @default(true)  @map("trade")            // 交易通知
  battle          Boolean @default(true)  @map("battle")           // 战斗结果

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 关系
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_notification_preferences")
}
```

### 2.3 通知类型定义

```typescript
enum NotificationType {
  // 论坛相关
  THREAD_REPLY = 'thread_reply',           // 主题被回复
  THREAD_MENTION = 'thread_mention',       // 在主题中被@
  POST_LIKE = 'post_like',                // 帖子被点赞
  POST_QUOTE = 'post_quote',              // 帖子被引用
  THREAD_DIGEST = 'thread_digest',         // 主题设为精华
  THREAD_LOCK = 'thread_lock',             // 主题被锁定
  THREAD_DELETE = 'thread_delete',         // 主题被删除

  // 版主操作
  MOD_WARNING = 'mod_warning',             // 收到警告
  MOD_BAN = 'mod_ban',                     // 被封禁
  MOD_DELETE_POST = 'mod_delete_post',     // 帖子被删除
  MOD_MOVE_THREAD = 'mod_move_thread',     // 主题被移动

  // 私信
  PM_RECEIVED = 'pm_received',             // 收到私信

  // 举报
  REPORT_PROCESSED = 'report_processed',   // 举报被处理

  // 积分
  CREDIT_CHANGE = 'credit_change',         // 积分变动

  // 系统通知
  SYSTEM_NOTICE = 'system_notice',         // 系统公告
  ACCOUNT_VERIFY = 'account_verify',       // 账户验证
  PASSWORD_RESET = 'password_reset',       // 密码重置

  // Pokemon系统
  POKEMON_BATTLE_WIN = 'pokemon_battle_win',       // 战斗胜利
  POKEMON_BATTLE_LOSE = 'pokemon_battle_lose',     // 战斗失败
  POKEMON_TRADE_OFFER = 'pokemon_trade_offer',     // 收到交易请求
  POKEMON_TRADE_ACCEPT = 'pokemon_trade_accept',   // 交易被接受
  POKEMON_LEVEL_UP = 'pokemon_level_up',           // 宠物升级

  // 交易系统
  TRADE_PURCHASE = 'trade_purchase',       // 商品被购买
  TRADE_SHIP = 'trade_ship',               // 商品已发货
  TRADE_RECEIVE = 'trade_receive',         // 商品已收货
}
```

---

## 3. API 设计

### 3.1 通知接口

#### GET /api/notifications
获取通知列表

**查询参数**:
```
page: number = 1
pageSize: number = 20
type?: NotificationType
isRead?: boolean
```

**响应**: `200` + NotificationListResponse
```typescript
interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}
```

---

#### GET /api/notifications/unread-count
获取未读通知数量

**响应**: `200` + UnreadCountResponse
```typescript
interface UnreadCountResponse {
  count: number;
  byType: Record<NotificationType, number>;
}
```

---

#### POST /api/notifications/:id/read
标记通知已读

**响应**: `200` + Notification

---

#### POST /api/notifications/read-all
标记所有通知已读

**请求**:
```typescript
{
  type?: NotificationType;  // 可选，只标记指定类型
}
```

**响应**: `200` + `{ count: number }`

---

#### DELETE /api/notifications/:id
删除通知

**响应**: `204`

---

#### DELETE /api/notifications/read
删除所有已读通知

**响应**: `200` + `{ count: number }`

---

### 3.2 通知偏好接口

#### GET /api/notifications/preferences
获取用户通知偏好

**响应**: `200` + UserNotificationPreference

---

#### PUT /api/notifications/preferences
更新用户通知偏好

**请求**: Partial<UserNotificationPreference>

**响应**: `200` + UserNotificationPreference

---

#### POST /api/notifications/preferences/reset
重置为默认设置

**响应**: `200` + UserNotificationPreference

---

### 3.3 测试接口 (开发环境)

#### POST /api/notifications/test
发送测试通知

**请求**:
```typescript
{
  type: NotificationType;
  title?: string;
  content?: string;
}
```

**响应**: `201` + Notification

---

## 4. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    极简通知系统架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  后端                                                            │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ 触发事件    │───▶│ 检查偏好     │───▶│ 创建通知记录   │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│                                                 │                │
│                                                 ▼                │
│                                    ┌─────────────────────┐     │
│                                    │ RESTful API          │     │
│                                    │ - GET /notifications │     │
│                                    │ - GET /unread-count  │     │
│                                    │ - POST /read         │     │
│                                    │ - DELETE /:id        │     │
│                                    └─────────────────────┘     │
│                                                 ▲                │
│                                                 │                │
│  前端 ─────────────────────────────────────────────────────────│
│       │                                                         │
│       │  用户操作 ──────▶ 查询 API ──────▶ 更新 UI              │
│       │  - 登录后                                                │
│       │  - 页面刷新                                              │
│       │  - 路由切换                                              │
│       │  - 点击通知图标                                          │
│       │  - 操作后刷新（发帖/回复等）                             │
│       │                                                         │
│       │  React Query 配置:                                       │
│       │  - refetchOnWindowFocus: true                           │
│       │  - refetchOnMount: true                                 │
│       │                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 通知生成规则

### 5.1 论坛通知

| 触发事件 | 通知类型 | 接收者 | 默认开启 |
|----------|----------|--------|----------|
| 主题被回复 | THREAD_REPLY | 主题作者 | ✅ |
| 帖子中被@ | THREAD_MENTION | 被@用户 | ✅ |
| 帖子被点赞 | POST_LIKE | 帖子作者 | ✅ |
| 帖子被引用 | POST_QUOTE | 帖子作者 | ✅ |
| 主题设为精华 | THREAD_DIGEST | 主题作者 | ✅ |
| 主题被锁定 | THREAD_LOCK | 主题作者 | ✅ |
| 主题被删除 | THREAD_DELETE | 主题作者 | ✅ |

### 5.2 版主操作通知

| 触发事件 | 通知类型 | 接收者 | 默认开启 |
|----------|----------|--------|----------|
| 发出警告 | MOD_WARNING | 被警告用户 | ✅ |
| 封禁用户 | MOD_BAN | 被封用户 | ✅ |
| 删除帖子 | MOD_DELETE_POST | 帖子作者 | ✅ |
| 移动主题 | MOD_MOVE_THREAD | 主题作者 | ✅ |

### 5.3 积分通知

| 触发事件 | 通知类型 | 接收者 | 默认开启 |
|----------|----------|--------|----------|
| 积分变动 > 10 | CREDIT_CHANGE | 用户 | ✅ |

### 5.4 Pokemon 通知

| 触发事件 | 通知类型 | 接收者 | 默认开启 |
|----------|----------|--------|----------|
| 战斗胜利 | POKEMON_BATTLE_WIN | 用户 | ✅ |
| 战斗失败 | POKEMON_BATTLE_LOSE | 用户 | ✅ |
| 收到交易请求 | POKEMON_TRADE_OFFER | 用户 | ✅ |
| 交易被接受 | POKEMON_TRADE_ACCEPT | 用户 | ✅ |
| 宠物升级 | POKEMON_LEVEL_UP | 用户 | ✅ |

---

## 6. 通知服务设计

### 6.1 服务接口

```typescript
// src/services/notification.service.ts

interface NotificationService {
  // 创建通知
  create(data: CreateNotificationDto): Promise<Notification>;

  // 批量创建通知
  createBulk(data: CreateNotificationDto[]): Promise<Notification[]>;

  // 发送通知（创建）
  send(data: SendNotificationDto): Promise<Notification>;

  // 获取用户通知列表
  getUserNotifications(userId: number, options: GetNotificationsOptions): Promise<NotificationList>;

  // 获取未读数量
  getUnreadCount(userId: number): Promise<UnreadCountResponse>;

  // 标记已读
  markAsRead(notificationId: number, userId: number): Promise<Notification>;

  // 标记所有已读
  markAllAsRead(userId: number, type?: NotificationType): Promise<number>;

  // 删除通知
  delete(notificationId: number, userId: number): Promise<void>;

  // 删除所有已读
  deleteAllRead(userId: number): Promise<number>;

  // 获取用户偏好
  getPreferences(userId: number): Promise<UserNotificationPreference>;

  // 更新用户偏好
  updatePreferences(userId: number, data: Partial<UserNotificationPreference>): Promise<UserNotificationPreference>;

  // 检查用户是否应该接收通知
  shouldNotify(userId: number, type: NotificationType): Promise<boolean>;
}
```

### 6.2 通知发送流程

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│ 触发事件    │───▶│ 检查偏好     │───▶│ 创建通知记录   │
└─────────────┘    └──────────────┘    └─────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │ 用户上线后查询     │
                                    │ 按需获取通知列表    │
                                    └─────────────────────┘
```

### 6.3 避免通知风暴

```typescript
// 防抖/节流配置
interface NotificationThrottleConfig {
  // 相同类型通知的最小间隔（秒）
  minInterval: number;

  // 短时间内相同类型通知的最大数量
  maxCount: number;

  // 时间窗口（秒）
  timeWindow: number;
}

// 默认配置
const DEFAULT_THROTTLE_CONFIG: Record<NotificationType, NotificationThrottleConfig> = {
  [NotificationType.THREAD_REPLY]: { minInterval: 60, maxCount: 5, timeWindow: 300 },
  [NotificationType.POST_LIKE]: { minInterval: 30, maxCount: 10, timeWindow: 300 },
  [NotificationType.POST_QUOTE]: { minInterval: 60, maxCount: 3, timeWindow: 600 },
  // ... 其他类型
};
```

---

## 7. 前端实现

### 7.1 通知中心组件

```typescript
// src/features/notifications/components/NotificationCenter.tsx

interface NotificationCenterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoClose?: number;      // 毫秒，0为不自动关闭
  limit?: number;          // 最多显示多少条
}

// 使用示例
<NotificationCenter
  position="top-right"
  autoClose={5000}
  limit={3}
/>
```

### 7.2 通知列表组件

```typescript
// src/features/notifications/components/NotificationList.tsx

interface NotificationListProps {
  unreadOnly?: boolean;
  type?: NotificationType;
  pageSize?: number;
}

// 使用示例
<NotificationList
  unreadOnly={false}
  pageSize={20}
/>
```

### 7.3 通知偏好设置组件

```typescript
// src/features/notifications/components/NotificationPreferences.tsx

interface NotificationPreferencesProps {
  userId: number;
}

// 使用示例
<NotificationPreferences userId={user.id} />
```

### 7.4 使用 React Query 管理状态

```typescript
// src/features/notifications/api/notifications.ts

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: GetNotificationsOptions) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// 未读数量 - 按需查询
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 0,                    // 始终重新获取
    refetchOnWindowFocus: true,       // 窗口聚焦时刷新
    refetchOnMount: true,            // 组件挂载时刷新
  });
}

// 通知列表 - 手动触发（点击通知图标时）
export function useNotifications(options: GetNotificationsOptions) {
  return useQuery({
    queryKey: notificationKeys.list(options),
    queryFn: () => notificationApi.getNotifications(options),
    enabled: false,                  // 手动触发
    staleTime: 0,
  });
}

// 标记已读
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // 刷新未读数量
      queryClient.invalidateQueries(notificationKeys.unreadCount());
    },
  });
}

// 全局 React Query 配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,     // 所有查询默认在窗口聚焦时刷新
      refetchOnMount: true,           // 所有查询默认在组件挂载时刷新
    },
  },
});
```

### 7.5 查询时机实现

```typescript
// 在布局组件中实现
function AppLayout() {
  const { data: unreadCount } = useUnreadCount();

  return (
    <>
      <Header notificationCount={unreadCount?.count || 0} />
      <Outlet />
    </>
  );
}

// 关键操作后主动刷新
function afterPostReply() {
  // 发布回复后立即刷新通知数
  queryClient.invalidateQueries(notificationKeys.unreadCount());
}

// 登录成功后查询
function onLoginSuccess() {
  queryClient.fetchQuery(notificationKeys.unreadCount());
}
```

---

## 8. 实施计划

### Phase 1: 基础功能 (1周)
- [ ] 创建数据库表和 Prisma 模型
- [ ] 实现通知服务核心功能
- [ ] 实现通知 RESTful API
- [ ] 实现通知偏好管理

### Phase 2: 前端实现 (1周)
- [ ] 实现通知中心组件
- [ ] 实现通知列表页面
- [ ] 实现通知偏好设置页面
- [ ] 集成 React Query 按需查询

### Phase 3: 测试与优化 (2天)
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化

---

## 9. 检查清单

### 数据库
- [ ] Notification 表
- [ ] UserNotificationPreference 表
- [ ] 索引优化

### 后端
- [ ] NotificationService 实现
- [ ] 通知 RESTful API (7个端点)
- [ ] 通知防抖/节流
- [ ] 通知去重逻辑

### 前端
- [ ] NotificationCenter 组件
- [ ] NotificationList 组件
- [ ] NotificationPreferences 组件
- [ ] 通知图标徽章
- [ ] React Query 集成
- [ ] 路由切换时刷新

### 测试
- [ ] 通知创建测试
- [ ] 通知查询测试
- [ ] 通知偏好测试
- [ ] 性能测试

---

## 10. 附录

### 10.1 通知内容示例

```typescript
// 主题被回复
{
  type: 'thread_reply',
  title: '您的主题收到了新回复',
  content: '用户 @张三 在您的主题"宝可梦配对讨论"中回复了...',
  data: {
    threadId: 123,
    threadTitle: '宝可梦配对讨论',
    postId: 456,
    replierId: 789,
    replierName: '张三',
    replyContent: '我觉得这个配对不错...'
  }
}

// 收到警告
{
  type: 'mod_warning',
  title: '您收到了版主警告',
  content: '版主 @李四 因"违规发言"给予了您警告',
  data: {
    warningId: 100,
    reason: '违规发言',
    points: 2,
    moderatorId: 200,
    moderatorName: '李四',
    expiresAt: '2026-03-10T00:00:00Z'
  }
}

// 战斗胜利
{
  type: 'pokemon_battle_win',
  title: '战斗胜利！',
  content: '您的皮卡丘在战斗中击败了对手的妙蛙种子',
  data: {
    battleId: 300,
    myPokemon: { id: 1, name: '皮卡丘', level: 25 },
    opponentPokemon: { id: 2, name: '妙蛙种子', level: 23 },
    expGained: 150,
    creditsGained: 50
  }
}
```

### 10.2 相关文档

- [API 设计文档](./06-api-design.md) - 第5.10节
- [数据模型设计](./05-data-model.md)
- [前端架构设计](./06-frontend-architecture.md)
- [安全设计](./07-security-design.md)

---

## 11. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-02-10 | 初始版本（包含 WebSocket） |
| 2.0 | 2026-02-10 | 简化版本（移除 WebSocket 和轮询，改为按需查询，保留邮件） |
| 3.0 | 2026-02-10 | 极简版本（移除邮件，仅保留站内通知） |
