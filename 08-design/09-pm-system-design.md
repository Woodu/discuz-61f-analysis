# 站内信（PM）系统设计文档

> **设计时间**: 2026-02-10
>
> **版本**: 1.0
>
> **参考**: Discuz! 6.1F 短消息系统

---

## 1. 概述

### 1.1 系统定位

站内信（Private Message，简称 PM）是**用户之间一对一的私密消息系统**，与通知系统是两个独立的功能：

| 系统 | 用途 | 发送者 | 示例 |
|------|------|--------|------|
| **通知 (Notification)** | 系统消息 | 系统 | "您的主题被回复了"、"收到警告" |
| **站内信 (PM)** | 用户私信 | 用户 | 用户A主动给用户B发私信 |

### 1.2 设计原则

- **隐私优先**: 消息端到端私密，仅对话双方可见
- **按需查询**: 不使用 WebSocket，用户操作时按需获取
- **简单易用**: 类似微信/WhatsApp 的对话体验
- **完整功能**: 支持黑名单、隐私设置等完整功能
- **安全防护**: 敏感词过滤、用户限制、防骚扰机制

### 1.3 防骚扰机制

| 机制 | 说明 |
|------|------|
| **敏感词过滤** | 管理员可配置敏感词，自动拦截或替换 |
| **用户等级限制** | 新用户需达到一定等级才能发私信 |
| **频率限制** | 单位时间内发送数量限制 |
| **用户禁言** | 管理员可禁用某用户的私信功能 |
| **黑名单** | 用户个人设置，被拉黑用户无法发私信 |

---

## 2. 数据模型设计

### 2.0 敏感词表 (BannedWord)

```prisma
model BannedWord {
  id          Int      @id @default(autoincrement())

  // 敏感词
  word        String   @db.VarChar(255)

  // 替换词（可选，为空则替换为 ***）
  replacement String?  @db.VarChar(255)

  // 匹配模式
  mode        String   @default("exact") @db.VarChar(20)  // exact: 精确匹配, contains: 包含匹配, regex: 正则表达式

  // 应用范围
  applyTo     String   @default("all") @db.VarChar(50) @db.Text  // JSON数组: ["pm", "post", "username", "signature"]

  // 是否启用
  enabled     Boolean  @default(true)

  // 创建者（管理员）
  createdBy   Int      @map("created_by")
  creator     User     @relation("BannedWordCreator", fields: [createdBy], references: [id])

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([word])
  @@index([enabled])
  @@map("banned_words")
}
```

### 2.1 私信表 (PrivateMessage)

### 2.1 私信表 (PrivateMessage)

```prisma
model PrivateMessage {
  id          Int      @id @default(autoincrement())

  // 对话ID (同一对话的多条消息共享同一个 conversationId)
  conversationId String  @map("conversation_id") @db.VarChar(50)

  // 发送者
  fromUserId  Int      @map("from_user_id")
  fromUser    User?    @relation("PrivateMessageFromUser", fields: [fromUserId], references: [id], onDelete: Cascade)

  // 接收者
  toUserId    Int      @map("to_user_id")
  toUser      User?    @relation("PrivateMessageToUser", fields: [toUserId], references: [id], onDelete: Cascade)

  // 消息内容
  subject     String?  @db.VarChar(255)  // 标题（可选，第一封消息可以带标题）
  content     String   @db.Text         // 消息内容

  // 状态（针对接收者）
  isRead      Boolean  @default(false) @map("is_read")
  readAt      DateTime? @map("read_at")

  // 删除状态（双方各自独立）
  deletedByFrom Boolean @default(false) @map("deleted_by_from")
  deletedByTo   Boolean @default(false) @map("deleted_by_to")

  // 时间
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([conversationId])
  @@index([fromUserId])
  @@index([toUserId])
  @@index([fromUserId, toUserId])
  @@index([toUserId, isRead])
  @@map("private_messages")
}
```

### 2.2 对话表 (Conversation)

```prisma
model Conversation {
  id          String   @id @default(uuid()) @db.VarChar(50)

  // 参与者
  userAId     Int      @map("user_a_id")
  userA       User?    @relation("ConversationUserA", fields: [userAId], references: [id], onDelete: Cascade)

  userBId     Int      @map("user_b_id")
  userB       User?    @relation("ConversationUserB", fields: [userBId], references: [id], onDelete: Cascade)

  // 最后一条消息（用于列表展示）
  lastMessageId  Int?    @map("last_message_id")
  lastMessageAt  DateTime? @map("last_message_at")

  // 未读数（针对当前用户）
  unreadCountA   Int     @default(0) @map("unread_count_a")
  unreadCountB   Int     @default(0) @map("unread_count_b")

  // 删除状态（双方各自独立）
  deletedByA Boolean @default(false) @map("deleted_by_a")
  deletedByB Boolean @default(false) @map("deleted_by_b")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([userAId, userBId])
  @@index([userAId, lastMessageAt])
  @@index([userBId, lastMessageAt])
  @@map("conversations")
}
```

### 2.3 用户隐私设置表 (UserPrivacySettings)

```prisma
model UserPrivacySettings {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 谁可以给我发私信
  pmSetting   String   @default("all") @map("pm_setting") @db.VarChar(20)
  // all: 所有人
  // friends: 仅好友
  // disabled: 禁用

  // 黑名单
  blacklist   Json?    // 存储被拉黑的用户ID数组

  // 隐私选项
  showOnlineStatus Boolean @default(true) @map("show_online_status")
  allowSearchBy   Boolean @default(true) @map("allow_search_by")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("user_privacy_settings")
}
```

---

## 3. API 设计

### 3.1 对话列表接口

#### GET /api/pm/conversations
获取对话列表

**查询参数**:
```
page: number = 1
pageSize: number = 20
```

**响应**: `200` + ConversationListResponse
```typescript
interface ConversationListResponse {
  data: ConversationItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  totalUnread: number;
}

interface ConversationItem {
  conversationId: string;
  otherUser: {
    id: number;
    username: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
}
```

---

### 3.2 对话详情接口

#### GET /api/pm/conversations/:conversationId
获取对话消息列表

**查询参数**:
```
page: number = 1
pageSize: number = 20
before?: number  // 获取此消息ID之前的消息（用于加载更多历史消息）
```

**响应**: `200` + MessageListResponse
```typescript
interface MessageListResponse {
  conversationId: string;
  otherUser: {
    id: number;
    username: string;
    avatar?: string;
  };
  messages: MessageItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

interface MessageItem {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  isFromMe: boolean;
}
```

---

### 3.3 发送消息接口

#### POST /api/pm/send
发送私信

**请求**:
```typescript
{
  toUserId: number;
  subject?: string;  // 仅第一封消息可以带标题
  content: string;
}
```

**响应**: `201` + SendMessageResponse
```typescript
interface SendMessageResponse {
  conversationId: string;
  message: MessageItem;
}
```

**错误响应**:
- `400` - 参数错误
- `403` - 对方已禁用私信 / 对方不在你的好友列表中 / 你已被对方拉黑
- `404` - 用户不存在
- `429` - 发送过于频繁

---

### 3.4 标记已读接口

#### POST /api/pm/conversations/:conversationId/read
标记对话已读

**响应**: `200` + `{ unreadCount: number }

---

### 3.5 删除对话接口

#### DELETE /api/pm/conversations/:conversationId
删除对话（仅对自己可见）

**响应**: `204`

---

### 3.6 删除消息接口

#### DELETE /api/pm/messages/:messageId
删除单条消息（仅对自己可见）

**响应**: `204`

---

### 3.7 隐私设置接口

#### GET /api/pm/privacy/settings
获取隐私设置

**响应**: `200` + PrivacySettings
```typescript
interface PrivacySettings {
  pmSetting: 'all' | 'friends' | 'disabled';
  blacklist: number[];
  showOnlineStatus: boolean;
  allowSearchBy: boolean;
}
```

---

#### PUT /api/pm/privacy/settings
更新隐私设置

**请求**:
```typescript
{
  pmSetting?: 'all' | 'friends' | 'disabled';
  blacklist?: number[];
  showOnlineStatus?: boolean;
  allowSearchBy?: boolean;
}
```

**响应**: `200` + PrivacySettings

---

### 3.8 黑名单管理接口

#### POST /api/pm/privacy/blacklist
添加用户到黑名单

**请求**:
```typescript
{
  userId: number;  // 要拉黑的用户ID
}
```

**响应**: `201` + PrivacySettings

---

#### DELETE /api/pm/privacy/blacklist/:userId
从黑名单移除

**响应**: `204`

---

### 3.9 搜索用户接口

#### GET /api/pm/users/search
搜索可发送私信的用户

**查询参数**:
```
q: string        // 搜索关键词（用户名）
page: number = 1
pageSize: number = 20
```

**响应**: `200` + UserSearchResponse
```typescript
interface UserSearchResponse {
  data: UserItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface UserItem {
  id: number;
  username: string;
  avatar?: string;
  isOnline: boolean;
  isFriend: boolean;
  isBlocked: boolean;
  canSendPm: boolean;  // 根据对方隐私设置判断
}
```

---

## 4. 前端 UI 设计

### 4.1 页面结构

```
/pm                           # 私信首页（对话列表）
  ├── /pm/:conversationId     # 对话详情
  └── /pm/new                # 新建私信（选择用户）

/user/settings/privacy        # 隐私设置
```

### 4.2 对话列表页面 (PMListPage)

```typescript
// src/features/pm/pages/PMListPage.tsx

interface PMListPageProps {
  // 无需参数，从当前登录用户获取对话列表
}

// UI 布局
┌─────────────────────────────────────────────────────────────┐
│  🔍 搜索用户                          新建私信    ─  ✕       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 张三                              2 条未读          │ │
│  │ 你好，在吗？                                            │ │
│  │ 10:30 AM                                [删除]          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 李四                              已读              │ │
│  │ 好的，我知道了                                          │ │
│  │ 昨天                                    [删除]          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 王五                              已读              │ │
│  │ 谢谢！                                                  │ │
│  │ 2天前                                   [删除]          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 对话详情页面 (PMConversationPage)

```typescript
// src/features/pm/pages/PMConversationPage.tsx

interface PMConversationPageProps {
  conversationId: string;
}

// UI 布局
┌─────────────────────────────────────────────────────────────┐
│  ← 返回        张三                                    ⚙️  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ─────────────────────────────────────────────────────── │ │
│  │                     昨天 10:25                          │ │
│  │ ─────────────────────────────────────────────────────── │ │
│  │  👤 你                                      [删除]     │ │
│  │  你好，在吗？                                           │ │
│  │                                             ✅ 已读    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  👤 张三                                    [删除]     │ │
│  │  在的，有什么事吗？                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ─────────────────────────────────────────────────────── │ │
│  │                     今天 14:30                          │ │
│  │ ─────────────────────────────────────────────────────── │ │
│  │  👤 你                                      [删除]     │ │
│  │  那个宝可梦的配对...                                     │ │
│  │                                             ✅ 已读    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  👤 张三                                    [删除]     │ │
│  │  好的，我看看...                                        │ │
│  │                                                        │ │
│  │                                     正在输入...         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  输入消息...                                    [发送]  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 新建私信页面 (PMNewPage)

```typescript
// src/features/pm/pages/PMNewPage.tsx

// UI 布局
┌─────────────────────────────────────────────────────────────┐
│  ← 返回                              新建私信              ✕ │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  收件人: [搜索用户框                     ]                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  搜索结果:                                               │ │
│  │  ┌─────────────────────────────────────────────────────┐│ │
│  │  │ 👤 张三                        [选择]               ││ │
│  │  │ 最后在线: 10分钟前                                  ││ │
│  │  ├─────────────────────────────────────────────────────┤│ │
│  │  │ 👤 张三丰                      [选择]               ││ │
│  │  │ 最后在线: 1小时前                                   ││ │
│  │  └─────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  标题: [输入消息标题（可选）                             ]  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  消息内容:                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐│ │
│  │  │                                                     ││ │
│  │  │                                                     ││ │
│  │  │                                                     ││ │
│  │  └─────────────────────────────────────────────────────┘│ │
│  │                                            [字数: 0/500]│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                                    [取消]           [发送]  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 隐私设置页面 (PrivacySettingsPage)

```typescript
// src/features/pm/pages/PrivacySettingsPage.tsx

// UI 布局
┌─────────────────────────────────────────────────────────────┐
│  ← 返回                    隐私设置                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  私信设置:                                                    │
│  ○ 所有人都可以给我发私信                                     │
│  ○ 仅好友可以给我发私信                                      │
│  ○ 禁用私信                                                  │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  黑名单管理:                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  👤 被拉黑的用户1                         [解除拉黑]    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  👤 被拉黑的用户2                         [解除拉黑]    │ │
│  └─────────────────────────────────────────────────────────┘ │
│  [+ 添加用户到黑名单]                                        │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  其他隐私选项:                                                │
│  ☑ 显示在线状态                                              │
│  ☑ 允许其他人通过用户名搜索到我                               │
│                                                               │
│                                    [保存设置]                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 管理员后台功能

### 5.1 敏感词管理

#### GET /api/admin/banned-words
获取敏感词列表

**查询参数**:
```
page: number = 1
pageSize: number = 20
enabled?: boolean  // 筛选启用状态
```

**响应**: `200` + BannedWordListResponse
```typescript
interface BannedWordListResponse {
  data: BannedWordItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface BannedWordItem {
  id: number;
  word: string;
  replacement?: string;
  mode: 'exact' | 'contains' | 'regex';
  applyTo: string[];  // ["pm", "post", "username", "signature"]
  enabled: boolean;
}
```

---

#### POST /api/admin/banned-words
添加敏感词

**请求**:
```typescript
{
  word: string;          // 敏感词
  replacement?: string;  // 替换词（可选）
  mode: 'exact' | 'contains' | 'regex';  // 匹配模式
  applyTo: string[];      // 应用范围 ["pm", "post", "username", "signature"]
}
```

**响应**: `201` + BannedWordItem

---

#### PUT /api/admin/banned-words/:id
更新敏感词

**请求**: Partial<BannedWordItem>

**响应**: `200` + BannedWordItem

---

#### DELETE /api/admin/banned-words/:id
删除敏感词

**响应**: `204`

---

#### POST /api/admin/banned-words/batch-import
批量导入敏感词

**请求**:
```typescript
{
  words: Array<{
    word: string;
    replacement?: string;
    mode: 'exact' | 'contains' | 'regex';
    applyTo: string[];
  }>;
}
```

**响应**: `201` + `{ count: number; imported: BannedWordItem[]; failed: string[] }`

---

### 5.2 用户私信限制管理

#### GET /api/admin/pm-restrictions
获取私信限制列表

**查询参数**:
```
page: number = 1
pageSize: number = 20
type?: 'ban' | 'level' | 'group'  // 限制类型
```

**响应**: `200` + RestrictionsListResponse
```typescript
interface RestrictionsListResponse {
  data: RestrictionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface RestrictionItem {
  id: string;
  userId: number;
  username: string;
  type: 'ban' | 'level' | 'group';  // ban: 禁用, level: 等级限制, group: 用户组限制
  reason: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: {
    id: number;
    username: string;
  };
}
```

---

#### POST /api/admin/pm-restrictions/ban
禁用用户私信功能

**请求**:
```typescript
{
  userId: number;
  reason: string;
  expiresAt?: string;  // 可选，永久禁用则不传
}
```

**响应**: `201` + RestrictionItem

---

#### DELETE /api/admin/pm-restrictions/ban/:userId
解除用户私信禁用

**响应**: `204`

---

#### POST /api/admin/pm-restrictions/level-requirement
设置等级限制

**请求**:
```typescript
{
  minLevel: number;      // 最低等级
  minPosts: number;      // 最低发帖数
  minRegDays: number;    // 注册天数
  reason: string;        // 限制原因
}
```

**响应**: `201` + LevelRequirement

---

#### GET /api/admin/pm-restrictions/level-requirement
获取当前等级限制设置

**响应**: `200` + LevelRequirement
```typescript
interface LevelRequirement {
  minLevel: number;
  minPosts: number;
  minRegDays: number;
  reason: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

#### PUT /api/admin/pm-restrictions/level-requirement
更新等级限制设置

**请求**: Partial<LevelRequirement>

**响应**: `200` + LevelRequirement

---

### 5.3 用户组权限设置

在用户组权限设置中添加私信相关权限：

```typescript
interface UserGroupPmPermissions {
  // 是否可以使用私信功能
  allowPm: boolean;

  // 每日发送私信数量限制
  pmDailyLimit: number;

  // 是否可以发送群发私信
  allowMassPm: boolean;

  // 是否可以绕过敏感词过滤
  bypassCensor: boolean;
}
```

---

### 5.4 管理员后台 UI 设计

#### 敏感词管理页面

```
┌─────────────────────────────────────────────────────────────┐
│  管理员后台 / 内容管理 / 敏感词管理                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [+ 添加敏感词]  [批量导入]                                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  敏感词    │  替换为  │  模式    │  应用范围   │  操作  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  垃圾      │  ***    │  精确    │  私信,帖子  │  编辑  │ │
│  │  广告      │  ***    │  包含    │  私信       │  删除  │ │
│  │  \d{11}    │  [手机号] │  正则    │  全部       │  编辑  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  显示第 1-20 条，共 156 条                                    │
│                                    [保存设置]                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 用户限制管理页面

```
┌─────────────────────────────────────────────────────────────┐
│  管理员后台 / 用户管理 / 私信限制                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  等级限制设置                                            │ │
│  │  ─────────────────────────────────────────────────────  │ │
│  │  启用等级限制: ☑                                       │ │
│  │  最低等级要求: [  5  ] 级                               │ │
│  │  最低发帖数:   [  10  ] 帖                              │ │
│  │  注册天数:     [  7  ] 天                               │ │
│  │  限制提示:     "新用户需达到5级才能发送私信"            │ │
│  │                                        [保存]            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  禁用用户列表                          [+ 禁用用户]    │ │
│  │  ─────────────────────────────────────────────────────  │ │
│  │  用户      │  原因      │  到期时间    │  操作          │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  张三      │  发垃圾广告│  永久       │  [解除禁用]    │ │
│  │  李四      │  骚扰他人  │  2026-03-01 │  [解除禁用]    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 用户操作路径

### 5.1 发送私信流程

```
用户A 想给用户B 发送私信
    │
    ▼
点击 "新建私信" 或 从用户资料页点击 "发私信"
    │
    ▼
搜索用户B / 直接输入用户名
    │
    ▼
系统检查用户B的隐私设置
    │
    ├──→ 用户B禁用私信 ──────▶ 显示错误提示
    ├──→ 用户B仅好友可发 ───▶ 检查是否好友 ──→ 否 ──▶ 显示错误提示
    │                          │
    │                          └──→ 是 ──┐
    ├──→ 用户A在B的黑名单中 ───▶ 显示错误提示
    │                          │
    └──→ 可以发送 ──────────────┘
                              │
                              ▼
                          输入消息内容
                              │
                              ▼
                          点击发送
                              │
                              ▼
                          消息保存到数据库
                              │
                              ▼
                          创建/更新对话记录
                              │
                              ▼
                          返回对话详情页
```

### 5.2 查看私信流程

```
用户登录
    │
    ▼
点击通知栏的 "私信" 图标 (显示未读数)
    │
    ▼
进入对话列表页
    │
    ▼
显示所有对话（按最后消息时间排序）
    │
    ├──→ 未读对话有特殊标识
    └──→ 显示最后一条消息预览
    │
    ▼
点击某个对话
    │
    ▼
进入对话详情页
    │
    ├──→ 加载历史消息
    ├──→ 标记消息为已读
    └──→ 未读数清零
    │
    ▼
可以继续发送消息 / 删除对话 / 删除单条消息
```

### 5.3 黑名单管理流程

```
用户进入隐私设置
    │
    ▼
查看黑名单列表
    │
    ├──→ 添加用户到黑名单
    │      │
    │      ▼
    │  搜索用户
    │      │
    │      ▼
    │  选择用户 ──▶ 确认 ──▶ 该用户无法再给当前用户发私信
    │
    └──→ 从黑名单移除
           │
           ▼
       选择用户 ──▶ 确认 ──▶ 该用户可以再给当前用户发私信
```

---

## 6. 业务规则

### 6.1 发送限制

| 规则 | 说明 |
|------|------|
| 频率限制 | 每分钟最多发送 10 条消息 |
| 内容长度 | 单条消息最多 5000 字符 |
| 标题长度 | 标题最多 255 字符 |
| 对话限制 | 无限制（可以和任何人对话） |

### 6.2 隐私规则

| 设置 | 效果 |
|------|------|
| 所有人 | 任何人都可以发送私信 |
| 仅好友 | 仅好友列表中的用户可以发送私信 |
| 禁用 | 没人可以发送私信（管理员除外） |

### 6.3 黑名单规则

- 拉黑后，对方无法给你发送私信
- 对方会收到"消息发送失败"的错误提示
- 拉黑是单向的，不影响你给对方发消息
- 解除拉黑后，对方可以再次发送私信

### 6.4 敏感词过滤规则

| 规则 | 说明 |
|------|------|
| 过滤时机 | 发送私信时自动检测 |
| 匹配模式 | 精确匹配、包含匹配、正则表达式 |
| 处理方式 | 替换为指定字符（默认为 ***）或阻止发送 |
| 应用范围 | 私信、帖子、用户名、签名等 |
| 管理权限 | 仅管理员可管理敏感词 |

### 6.5 用户限制规则

| 限制类型 | 说明 |
|----------|------|
| 等级限制 | 新用户需达到指定等级/发帖数/注册天数才能发私信 |
| 禁用限制 | 管理员可禁用特定用户的私信功能 |
| 用户组限制 | 不同用户组有不同的私信权限和数量限制 |
| 超级管理员 | 不受任何限制，可绕过敏感词过滤 |

---

## 7. 内容检查流程

```
用户尝试发送私信
    │
    ▼
检查用户是否被禁用
    │
    ├──→ 是 ──▶ 返回错误："您的私信功能已被禁用"
    │
    └──→ 否
        │
        ▼
    检查用户是否满足等级要求
    │
    ├──→ 否 ──▶ 返回错误："需要达到5级才能发送私信"
    │
    └──→ 是
        │
        ▼
    检查接收者隐私设置
    │
    ├──→ 禁用私信 ──▶ 返回错误："对方已禁用私信"
    ├──→ 仅好友 ──▶ 检查是否好友 ──→ 否 ──▶ 返回错误："对方仅接收好友私信"
    │
    └──→ 可接收
        │
        ▼
    检查是否在黑名单中
    │
    ├──→ 是 ──▶ 返回错误："消息发送失败"
    │
    └──→ 否
        │
        ▼
    检查敏感词
    │
    ├──→ 包含敏感词 ──▶ 根据配置替换或阻止
    │
    └──→ 无敏感词
        │
        ▼
    检查发送频率
    │
    ├──→ 超限 ──▶ 返回错误："发送过于频繁，请稍后再试"
    │
    └──→ 正常
        │
        ▼
    保存消息到数据库
        │
        ▼
    创建/更新对话记录
        │
        ▼
    发送成功
```

---

## 8. 与 Discuz! 6.1F 的对比

| 功能 | Discuz! 6.1F | 新设计 | 说明 |
|------|--------------|--------|------|
| 对话模式 | 收件箱/发件箱 | 类微信的对话模式 | 更现代的交互方式 |
| 黑名单 | ✅ | ✅ | 保持 |
| 隐私设置 | ✅ | ✅ | 增强，支持"仅好友" |
| 搜索用户 | ✅ | ✅ | 保持 |
| 消息删除 | 软删除 | 双向软删除 | 各自独立删除 |
| 已读状态 | ✅ | ✅ | 保持 |
| 消息分组 | 文件夹 | 无 | 简化，用搜索代替 |
| 导出消息 | ✅ | ❌ | 移除不常用功能 |
| **敏感词过滤** | ✅ | ✅ | **新增** |
| **用户等级限制** | ❌ | ✅ | **新增** |
| **用户禁用功能** | ✅ | ✅ | **新增** |
| **批量导入** | ✅ | ✅ | **新增** |

---

## 9. 实施计划

### Phase 1: 数据库和后端 (1.5周)
- [ ] 创建 Prisma 模型 (4张表)
- [ ] 实现私信服务 (PMService)
- [ ] 实现隐私设置服务 (PrivacyService)
- [ ] 实现敏感词服务 (BannedWordService)
- [ ] 实现用户限制服务 (PMRestrictionService)
- [ ] 实现 RESTful API (用户端 13个 + 管理端 10个)

### Phase 2: 前端实现 (1周)
- [ ] 对话列表页面
- [ ] 对话详情页面
- [ ] 新建私信页面
- [ ] 隐私设置页面
- [ ] React Query 集成

### Phase 3: 管理员后台 (3天)
- [ ] 敏感词管理页面
- [ ] 用户限制管理页面
- [ ] 批量导入功能

### Phase 4: 测试 (2天)
- [ ] 单元测试
- [ ] 集成测试
- [ ] 敏感词过滤测试
- [ ] 用户限制测试
- [ ] UI 测试

---

## 10. 检查清单

### 数据库
- [ ] PrivateMessage 表
- [ ] Conversation 表
- [ ] UserPrivacySettings 表
- [ ] BannedWord 表
- [ ] PMRestriction 表
- [ ] 索引优化

### 后端
- [ ] PMService 实现
- [ ] PrivacyService 实现
- [ ] BannedWordService 实现
- [ ] PMRestrictionService 实现
- [ ] 私信 RESTful API (13个端点)
- [ ] 管理员 RESTful API (10个端点)
- [ ] 敏感词过滤中间件
- [ ] 用户权限检查中间件
- [ ] 频率限制中间件

### 前端
- [ ] PMListPage 组件
- [ ] PMConversationPage 组件
- [ ] PMNewPage 组件
- [ ] PrivacySettingsPage 组件
- [ ] 管理员 - 敏感词管理页面
- [ ] 管理员 - 用户限制管理页面
- [ ] 消息气泡组件
- [ ] 用户搜索组件
- [ ] React Query 集成

### 测试
- [ ] 发送消息测试
- [ ] 隐私设置测试
- [ ] 黑名单功能测试
- [ ] 权限检查测试
- [ ] 频率限制测试
- [ ] 敏感词过滤测试
- [ ] 用户等级限制测试
- [ ] 用户禁用测试
- [ ] UserPrivacySettings 表
- [ ] 索引优化

### 后端
- [ ] PMService 实现
- [ ] PrivacyService 实现
- [ ] BannedWordService 实现
- [ ] PMRestrictionService 实现
- [ ] 私信 RESTful API (13个端点)
- [ ] 管理员 RESTful API (10个端点)
- [ ] 敏感词过滤中间件
- [ ] 用户权限检查中间件
- [ ] 频率限制中间件

### 前端
- [ ] PMListPage 组件
- [ ] PMConversationPage 组件
- [ ] PMNewPage 组件
- [ ] PrivacySettingsPage 组件
- [ ] 管理员 - 敏感词管理页面
- [ ] 管理员 - 用户限制管理页面
- [ ] 消息气泡组件
- [ ] 用户搜索组件
- [ ] React Query 集成

### 测试
- [ ] 发送消息测试
- [ ] 隐私设置测试
- [ ] 黑名单功能测试
- [ ] 权限检查测试
- [ ] 频率限制测试
- [ ] 敏感词过滤测试
- [ ] 用户等级限制测试
- [ ] 用户禁用测试

---

## 11. 相关文档

- [API 设计文档](./06-api-design.md) - 第5.9节
- [通知系统设计](./08-notification-design.md) - 区分通知和站内信
- [用户系统设计](./03-auth-design.md)
- [数据模型设计](./05-data-model.md)
- [前端架构设计](./06-frontend-architecture.md)
- [管理员后台设计](./06-frontend-architecture.md#9-管理员后台)

---

## 12. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-02-10 | 初始版本（基础功能） |
| 1.1 | 2026-02-10 | 新增敏感词过滤系统 |
| 1.1 | 2026-02-10 | 新增用户限制功能（等级限制、禁用） |
| 1.1 | 2026-02-10 | 新增管理员后台管理页面 |
