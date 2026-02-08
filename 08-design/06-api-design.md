# API 设计文档

> **RESTful API + WebSocket**
>
> **设计时间**: 2026-02-07

---

## 1. 设计原则

### 1.1 RESTful 规范

- 使用标准 HTTP 方法（GET/POST/PUT/DELETE/PATCH）
- 资源命名使用名词复数形式
- 使用层级结构表达资源关系
- 统一响应格式
- API 版本控制

### 1.2 URL 规范

```
https://api.example.com/v1/{resource}/{id}/{sub-resource}/{sub-id}
```

**示例**：
```
GET    /api/v1/forums                    # 获取版块列表
GET    /api/v1/forums/:id                # 获取版块详情
GET    /api/v1/forums/:id/threads        # 获取版块的主题列表
POST   /api/v1/forums/:id/threads        # 在版块创建主题
GET    /api/v1/threads/:id               # 获取主题详情
GET    /api/v1/threads/:id/posts         # 获取主题的帖子列表
POST   /api/v1/threads/:id/posts         # 回复主题
```

### 1.3 HTTP 方法使用

| 方法 | 用途 | 幂等性 | 示例 |
|------|------|--------|------|
| GET | 查询资源 | ✅ | GET /api/v1/threads/:id |
| POST | 创建资源 | ❌ | POST /api/v1/threads |
| PUT | 完整更新资源 | ✅ | PUT /api/v1/users/:id |
| PATCH | 部分更新资源 | ❌ | PATCH /api/v1/threads/:id |
| DELETE | 删除资源 | ✅ | DELETE /api/v1/threads/:id |

---

## 2. 统一响应格式

### 2.1 成功响应

```typescript
// 单个资源
{
  "success": true,
  "data": {
    "id": 123,
    "title": "主题标题",
    // ...
  }
}

// 资源列表（分页）
{
  "success": true,
  "data": [
    { "id": 1, "title": "主题1" },
    { "id": 2, "title": "主题2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}

// 无数据响应（如DELETE）
{
  "success": true,
  "message": "操作成功"
}
```

### 2.2 错误响应

```typescript
{
  "success": false,
  "error": {
    "code": "THREAD_NOT_FOUND",
    "message": "主题不存在",
    "details": {
      "threadId": 123
    },
    "timestamp": "2026-02-07T10:30:00Z",
    "path": "/api/v1/threads/123"
  }
}
```

### 2.3 批量操作响应

```typescript
{
  "success": true,
  "data": {
    "succeeded": 8,
    "failed": 2,
    "results": [
      { "id": 1, "status": "success" },
      { "id": 2, "status": "success" },
      { "id": 3, "status": "failed", "error": "权限不足" }
    ]
  }
}
```

---

## 3. 错误码定义

### 3.1 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未登录或token过期 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 参数验证失败 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器错误 |
| 503 | Service Unavailable | 服务维护中 |

### 3.2 业务错误码

```typescript
enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',

  // 认证错误 (2xxx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',

  // 权限错误 (3xxx)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ADMIN_REQUIRED = 'ADMIN_REQUIRED',
  MODERATOR_REQUIRED = 'MODERATOR_REQUIRED',

  // 用户错误 (4xxx)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_USERNAME = 'INVALID_USERNAME',

  // 论坛错误 (5xxx)
  FORUM_NOT_FOUND = 'FORUM_NOT_FOUND',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  THREAD_CLOSED = 'THREAD_CLOSED',
  THREAD_DELETED = 'THREAD_DELETED',
  DUPLICATE_POST = 'DUPLICATE_POST',

  // Pokemon错误 (6xxx)
  POKEMON_NOT_FOUND = 'POKEMON_NOT_FOUND',
  POKEMON_NOT_OWNED = 'POKEMON_NOT_OWNED',
  POKEMON_IN_BATTLE = 'POKEMON_IN_BATTLE',
  POKEMON_DEAD = 'POKEMON_DEAD',
  INSUFFICIENT_COINS = 'INSUFFICIENT_COINS',
  TRADE_NOT_AVAILABLE = 'TRADE_NOT_AVAILABLE',

  // 银行错误 (7xxx)
  BANK_ACCOUNT_NOT_FOUND = 'BANK_ACCOUNT_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  TRANSFER_FAILED = 'TRANSFER_FAILED',

  // 文件错误 (8xxx)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  ATTACHMENT_NOT_FOUND = 'ATTACHMENT_NOT_FOUND',

  // 短消息错误 (9xxx)
  PM_BLOCKED = 'PM_BLOCKED',
  PM_DISABLED = 'PM_DISABLED',
  PM_LIMIT_EXCEEDED = 'PM_LIMIT_EXCEEDED',
}
```

---

## 4. 认证与授权

### 4.1 JWT 认证

#### 登录获取 Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123",
  "captcha": "abc123",
  "captchaKey": "session-key"
}
```

**响应**：
```http
201 Created

{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 7200
    },
    "user": {
      "id": 123,
      "username": "用户名",
      "avatar": "https://...",
      "group": {
        "id": 1,
        "name": "普通会员"
      }
    }
  }
}
```

#### 使用 Token 访问

```http
GET /api/v1/threads/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Token 刷新

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4.2 权限系统

#### 权限检查

```typescript
// 请求头
Authorization: Bearer {accessToken}

// 响应中包含用户权限
{
  "user": {
    "id": 123,
    "permissions": [
      "forum:read",
      "forum:post",
      "thread:create",
      "post:reply"
    ]
  }
}
```

---

## 5. API 接口定义

### 5.1 认证接口 (Auth)

#### POST /auth/login
登录

**请求**：
```json
{
  "username": "string",      // 用户名或邮箱
  "password": "string",      // 密码
  "captcha": "string?",      // 验证码（需要时）
  "captchaKey": "string?"    // 验证码Key
}
```

**响应**：`201` + `{ tokens, user }`

---

#### POST /auth/register
注册

**请求**：
```json
{
  "username": "string",      // 用户名 (3-20字符)
  "password": "string",      // 密码 (6-32字符)
  "email": "string",         // 邮箱
  "captcha": "string",       // 验证码
  "captchaKey": "string"     // 验证码Key
}
```

**响应**：`201` + `{ tokens, user }`

---

#### POST /auth/logout
登出

**请求**：
```json
{
  "refreshToken": "string"   // 可选，用于撤销refresh token
}
```

**响应**：`204`

---

#### POST /auth/refresh
刷新Token

**请求**：
```json
{
  "refreshToken": "string"
}
```

**响应**：`200` + `{ tokens }`

---

### 5.2 用户接口 (Users)

#### GET /users
获取用户列表（管理员）

**查询参数**：
```
page: number = 1
pageSize: number = 20
groupId?: number            # 用户组筛选
keyword?: string            # 搜索关键词
status?: 'active' | 'banned' | 'disabled'
orderBy?: 'id' | 'username' | 'posts' | 'credits'
order?: 'asc' | 'desc'
```

**响应**：`200` + `{ data: User[], pagination }`

---

#### GET /users/:id
获取用户资料

**响应**：`200` + `{ user: UserDetail }`

```typescript
interface UserDetail {
  id: number;
  username: string;
  avatar: string;
  group: UserGroup;
  stats: {
    threads: number;
    posts: number;
    credits: number;
    regDate: string;
    lastVisit: string;
  };
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    signature?: string;
  };
  medals: Medal[];
  pokemon?: {
    count: number;
    team: Pokemon[];
  };
}
```

---

#### PATCH /users/:id
更新用户资料

**权限**：本人或管理员

**请求**：
```json
{
  "profile": {
    "bio": "string?",
    "location": "string?",
    "website": "string?",
    "signature": "string?"
  },
  "preferences": {
    "receiveEmail": "boolean?",
    "showEmail": "boolean?",
    "timezone": "string?"
  }
}
```

**响应**：`200` + `{ user: UserDetail }`

---

#### PUT /users/:id/avatar
更新头像

**请求**：`multipart/form-data`
```
avatar: File                # 图片文件
```

**响应**：`200` + `{ user: { avatar: string } }`

---

#### PUT /users/:id/password
修改密码

**请求**：
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**响应**：`204`

---

### 5.3 论坛接口 (Forums)

#### GET /forums
获取版块列表

**查询参数**：
```
categoryId?: number         # 分类筛选
```

**响应**：`200` + `{ categories: ForumCategory[], forums: Forum[] }`

```typescript
interface Forum {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  categoryId: number;
  order: number;
  todayThreads: number;
  todayPosts: number;
  threads: number;
  posts: number;
  lastThread?: {
    id: number;
    title: string;
    author: { id: number; username: string };
    createdAt: string;
  };
  permissions?: {
    canView: boolean;
    canPost: boolean;
    canReply: boolean;
  };
}
```

---

#### GET /forums/:id
获取版块详情

**响应**：`200` + `{ forum: ForumDetail }`

---

#### GET /forums/:id/threads
获取版块主题列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
filter?: 'all' | 'digest' | 'top'
sort?: 'default' | 'newest' | 'hottest'
```

**响应**：`200` + `{ data: Thread[], pagination }`

---

### 5.4 主题接口 (Threads)

#### GET /threads/:id
获取主题详情

**响应**：`200` + `{ thread: ThreadDetail }`

```typescript
interface ThreadDetail {
  id: number;
  title: string;
  forum: { id: number; name: string };
  author: { id: number; username: string; avatar: string };
  content: string;          // BBCode格式
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  isDigest: boolean;
  isTop: boolean;
  isLocked: boolean;
  isHighlight: boolean;
  highlightColor?: string;
  tags?: string[];
  attachments?: Attachment[];
  permissions?: {
    canReply: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canModerate: boolean;
  };
}
```

---

#### POST /forums/:forumId/threads
创建主题

**请求**：
```json
{
  "title": "string",
  "content": "string",      // BBCode格式
  "tags?: string[]",
  "attachments?: number[]"  // 上传后的附件ID
}
```

**响应**：`201` + `{ thread: ThreadDetail }`

---

#### PATCH /threads/:id
更新主题

**权限**：作者或版主

**请求**：
```json
{
  "title?: string",
  "content?: string",
  "tags?: string[]"
}
```

**响应**：`200` + `{ thread: ThreadDetail }`

---

#### DELETE /threads/:id
删除主题

**权限**：作者或版主

**响应**：`204`

---

### 5.5 帖子接口 (Posts)

#### GET /threads/:threadId/posts
获取主题的回复列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
orderBy?: 'asc' | 'desc'    // 时间顺序
```

**响应**：`200` + `{ data: Post[], pagination }`

```typescript
interface Post {
  id: number;
  threadId: number;
  floor: number;            // 楼层号
  author: {
    id: number;
    username: string;
    avatar: string;
    group: { name: string; color?: string };
    signature?: string;
  };
  content: string;          // BBCode格式
  createdAt: string;
  updatedAt?: string;
  isAuthor: boolean;
  attachments?: Attachment[];
}
```

---

#### POST /threads/:threadId/posts
回复主题

**请求**：
```json
{
  "content": "string",
  "quotePostId?: number",   // 引用的帖子ID
  "attachments?: number[]"
}
```

**响应**：`201` + `{ post: Post }`

---

#### PATCH /posts/:id
编辑帖子

**请求**：
```json
{
  "content": "string",
  "attachments?: number[]"
}
```

**响应**：`200` + `{ post: Post }`

---

#### DELETE /posts/:id
删除帖子

**响应**：`204`

---

### 5.6 版主接口 (Moderation)

#### POST /threads/:id/moderate
主题审核操作

**请求**：
```json
{
  "action": "digest" | "undigest" |
           "top" | "untop" |
           "highlight" | "unhighlight" |
           "close" | "open" |
           "move" | "delete",
  "reason?: string",        // 操作原因
  "targetForumId?: number", // 移动目标版块
  "highlightColor?: string" // 高亮颜色
}
```

**响应**：`200` + `{ thread: ThreadDetail }`

---

#### POST /posts/:id/moderate
帖子审核操作

**请求**：
```json
{
  "action": "delete" | "restore",
  "reason?: string"
}
```

**响应**：`200` 或 `204`

---

#### POST /threads/batch-moderate
批量操作主题

**请求**：
```json
{
  "threadIds": number[],
  "action": "digest" | "delete" | "move",
  "reason?: string",
  "targetForumId?: number"
}
```

**响应**：`200` + `{ succeeded, failed, results }`

---

### 5.7 Pokemon 接口

#### GET /pokemon/species
获取宠物种类列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
type?: string               // 属性筛选
generation?: number         // 世代筛选
```

**响应**：`200` + `{ data: PokemonSpecies[], pagination }`

---

#### GET /pokemon/my
获取我的宠物

**查询参数**：
```
page: number = 1
pageSize: number = 20
status?: 'all' | 'active' | 'dead' | 'storage'
```

**响应**：`200` + `{ data: UserPokemon[], pagination }`

---

#### GET /pokemon/my/:id
获取宠物详情

**响应**：`200` + `{ pokemon: UserPokemonDetail }`

```typescript
interface UserPokemonDetail {
  id: number;
  species: PokemonSpecies;
  nickname?: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  stats: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves: PokemonMove[];
  nature: string;
  ability: string;
  happiness: number;
  isShiny: boolean;
  obtainedAt: string;
}
```

---

#### POST /pokemon/my
获得新宠物（从商店/活动等）

**响应**：`201` + `{ pokemon: UserPokemonDetail }`

---

#### PATCH /pokemon/my/:id
更新宠物信息

**请求**：
```json
{
  "nickname?: string",
  "moves?: number[]"        // 技能ID列表
}
```

**响应**：`200` + `{ pokemon: UserPokemonDetail }`

---

#### POST /pokemon/my/:id/train
训练宠物

**响应**：`200` + `{ exp: number, levelUp?: boolean }`

---

#### POST /pokemon/battle
发起战斗

**请求**：
```json
{
  "type": "wild" | "pvp" | "trainer",
  "myPokemonId": number,
  "targetPokemonId?: number" // PvP
}
```

**响应**：`201` + `{ battle: Battle }`

---

#### GET /pokemon/battle/:id
获取战斗详情

**响应**：`200` + `{ battle: BattleDetail }`

---

#### POST /pokemon/battle/:id/action
战斗中执行行动

**请求**：
```json
{
  "action": "move" | "item" | "switch" | "flee",
  "moveId?: number",        // 使用技能
  "itemId?: number",        // 使用道具
  "switchPokemonId?: number" // 切换宠物
}
```

**响应**：`200` + `{ battle: BattleDetail }`

---

#### GET /pokemon/market
获取宠物市场

**查询参数**：
```
page: number = 1
pageSize: number = 20
speciesId?: number
minPrice?: number
maxPrice?: number
```

**响应**：`200` + `{ data: MarketListing[], pagination }`

---

#### POST /pokemon/market
上架宠物

**请求**：
```json
{
  "pokemonId": number,
  "price": number
}
```

**响应**：`201` + `{ listing: MarketListing }`

---

#### POST /pokemon/market/:id/buy
购买宠物

**响应**：`201` + `{ pokemon: UserPokemonDetail }`

---

### 5.8 银行接口 (Bank)

#### GET /bank/account
获取银行账户

**响应**：`200` + `{ account: BankAccount }`

```typescript
interface BankAccount {
  userId: number;
  balance: number;
  frozenBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  interestRate: number;
  createdAt: string;
  lastInterestDate: string;
}
```

---

#### POST /bank/deposit
存款

**请求**：
```json
{
  "amount": number
}
```

**响应**：`200` + `{ account: BankAccount, transaction: Transaction }`

---

#### POST /bank/withdraw
取款

**请求**：
```json
{
  "amount": number
}
```

**响应**：`200` + `{ account: BankAccount, transaction: Transaction }`

---

#### POST /bank/transfer
转账

**请求**：
```json
{
  "toUserId": number,
  "amount": number,
  "note?: string"
}
```

**响应**：`200` + `{ transaction: Transaction }`

---

#### GET /bank/transactions
获取交易记录

**查询参数**：
```
page: number = 1
pageSize: number = 20
type?: 'all' | 'deposit' | 'withdraw' | 'transfer' | 'interest'
startDate?: string
endDate?: string
```

**响应**：`200` + `{ data: Transaction[], pagination }`

---

### 5.9 短消息接口 (Private Messages)

#### GET /pm/conversations
获取对话列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
```

**响应**：`200` + `{ data: Conversation[], pagination }`

---

#### GET /pm/conversations/:userId
获取与某用户的对话

**查询参数**：
```
page: number = 1
pageSize: number = 20
before?: string            // 之前的消息ID（分页用）
```

**响应**：`200` + `{ data: Message[], pagination }`

---

#### POST /pm/send
发送短消息

**请求**：
```json
{
  "toUserId": number,
  "content": "string"
}
```

**响应**：`201` + `{ message: Message }`

---

#### PUT /pm/conversations/:userId/read
标记对话已读

**响应**：`204`

---

### 5.10 通知接口 (Notifications)

#### GET /notifications
获取通知列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
type?: NotificationType
isRead?: boolean
```

**响应**：`200` + `{ data: Notification[], pagination, unreadCount }`

---

#### PUT /notifications/:id/read
标记通知已读

**响应**：`204`

---

#### PUT /notifications/read-all
全部标记已读

**响应**：`204`

---

#### DELETE /notifications/:id
删除通知

**响应**：`204`

---

### 5.11 附件接口 (Attachments)

#### POST /attachments/upload
上传附件

**请求**：`multipart/form-data`
```
file: File
type?: 'image' | 'document' | 'other'
```

**响应**：`201` + `{ attachment: Attachment }`

```typescript
interface Attachment {
  id: number;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}
```

---

#### GET /attachments/:id
获取附件信息

**响应**：`200` + `{ attachment: Attachment }`

---

#### DELETE /attachments/:id
删除附件

**权限**：上传者或管理员

**响应**：`204`

---

### 5.12 搜索接口 (Search)

#### GET /search
搜索

**查询参数**：
```
q: string                   // 搜索关键词
type?: 'all' | 'thread' | 'post' | 'user' | 'pokemon'
forumId?: number
authorId?: number
dateFrom?: string
dateTo?: string
sort?: 'relevance' | 'date_desc' | 'date_asc' | 'reply_count'
page: number = 1
pageSize: number = 20
```

**响应**：`200` + `{ results: SearchResult[], total, took }`

---

#### GET /search/suggestions
获取搜索建议

**查询参数**：
```
q: string
limit?: number = 10
```

**响应**：`200` + `{ suggestions: string[] }`

---

#### GET /search/hot
获取热门搜索

**响应**：`200` + `{ keywords: string[] }`

---

### 5.13 统计接口 (Stats)

#### GET /stats/online
获取在线统计

**响应**：`200` + `{ total: number, members: number, guests: number, users: OnlineUser[] }`

---

#### GET /stats/forum
获取论坛统计

**响应**：`200` + `{ threads, posts, users, todayThreads, todayPosts }`

---

#### GET /stats/user/:id
获取用户统计

**响应**：`200` + `{ stats: UserStats }`

---

### 5.14 管理后台接口 (Admin)

#### GET /admin/dashboard
获取仪表盘数据

**响应**：`200` + `{ stats, recentActivities, systemInfo }`

---

#### GET /admin/users
管理后台：用户列表

**查询参数**：
```
page: number = 1
pageSize: number = 20
groupId?: number
status?: string
keyword?: string
```

---

#### POST /admin/users
创建用户（管理员）

**响应**：`201` + `{ user: User }`

---

#### PATCH /admin/users/:id
编辑用户（管理员）

**响应**：`200` + `{ user: User }`

---

#### POST /admin/users/:id/ban
封禁用户

**请求**：
```json
{
  "reason": string,
  "duration?: number",       // 封禁时长（秒），null表示永久
  "notes?: string"
}
```

**响应**：`200` + `{ user: User }`

---

#### POST /admin/users/:id/unban
解封用户

**响应**：`200` + `{ user: User }`

---

#### GET /admin/forums
管理后台：版块列表

**响应**：`200` + `{ categories: ForumCategory[], forums: Forum[] }`

---

#### POST /admin/forums
创建版块

**响应**：`201` + `{ forum: Forum }`

---

#### PUT /admin/forums/:id
更新版块

**响应**：`200` + `{ forum: Forum }`

---

#### DELETE /admin/forums/:id
删除版块

**响应**：`204`

---

#### POST /admin/forums/:id/order
调整版块排序

**请求**：
```json
{
  "order": number
}
```

**响应**：`200`

---

#### GET /admin/logs
获取管理日志

**查询参数**：
```
type: 'admin' | 'mod' | 'login'
page: number = 1
pageSize: number = 20
adminId?: number
action?: string
startDate?: string
endDate?: string
```

**响应**：`200` + `{ data: Log[], pagination }`

---

#### GET /admin/settings
获取系统设置

**响应**：`200` + `{ settings: SystemSettings }`

---

#### PUT /admin/settings
更新系统设置

**请求**：`SystemSettings`

**响应**：`200` + `{ settings: SystemSettings }`

---

#### POST /admin/cache/clear
清除缓存

**请求**：
```json
{
  "type": 'all' | 'data' | 'template' | 'style'
}
```

**响应**：`200` + `{ cleared: boolean }`

---

## 6. WebSocket 事件

### 6.1 连接

**客户端连接**：
```javascript
const socket = io('wss://api.example.com', {
  auth: {
    token: accessToken
  }
});
```

**连接成功**：
```typescript
// 服务器 -> 客户端
{ event: 'connected', data: { userId: number, sessionId: string } }
```

---

### 6.2 通知事件

#### notification:new
新通知

```typescript
// 服务器 -> 客户端
{
  event: 'notification:new',
  data: {
    id: string,
    type: NotificationType,
    title: string,
    content: string,
    data?: any
  }
}
```

---

#### notifications:batch
批量通知

```typescript
// 服务器 -> 客户端
{
  event: 'notifications:batch',
  data: {
    notifications: Notification[]
  }
}
```

---

### 6.3 短消息事件

#### pm:new
收到新短消息

```typescript
// 服务器 -> 客户端
{
  event: 'pm:new',
  data: {
    id: string,
    fromUserId: number,
    fromUsername: string,
    content: string,
    createdAt: string
  }
}
```

---

#### pm:typing
对方正在输入

```typescript
// 服务器 -> 客户端
{
  event: 'pm:typing',
  data: {
    fromUserId: number,
    isTyping: boolean
  }
}
```

---

#### pm:read
消息已读

```typescript
// 服务器 -> 客户端
{
  event: 'pm:read',
  data: {
    messageId: string,
    readAt: string
  }
}
```

---

### 6.4 在线状态事件

#### user:online
用户上线

```typescript
// 服务器 -> 客户端
{
  event: 'user:online',
  data: {
    userId: number,
    username: string,
    avatar?: string
  }
}
```

---

#### user:offline
用户下线

```typescript
// 服务器 -> 客户端
{
  event: 'user:offline',
  data: {
    userId: number
  }
}
```

---

#### user:status
用户状态更新

```typescript
// 服务器 -> 客户端
{
  event: 'user:status',
  data: {
    userId: number,
    status: 'online' | 'away' | 'busy' | 'hidden',
    activity?: string
  }
}
```

---

### 6.5 论坛事件

#### thread:new
新主题发布

```typescript
// 服务器 -> 客户端
{
  event: 'thread:new',
  data: {
    forumId: number,
    thread: ThreadSummary
  }
}
```

---

#### thread:reply
主题被回复

```typescript
// 服务器 -> 客户端
{
  event: 'thread:reply',
  data: {
    threadId: number,
    post: PostSummary
  }
}
```

---

#### thread:update
主题更新

```typescript
// 服务器 -> 客户端
{
  event: 'thread:update',
  data: {
    threadId: number,
    updates: Partial<Thread>
  }
}
```

---

### 6.6 Pokemon事件

#### pokemon:battle_update
战斗更新

```typescript
// 服务器 -> 客户端
{
  event: 'pokemon:battle_update',
  data: {
    battleId: string,
    state: BattleState,
    log: BattleLogEntry
  }
}
```

---

#### pokemon:trade_offer
交易请求

```typescript
// 服务器 -> 客户端
{
  event: 'pokemon:trade_offer',
  data: {
    tradeId: string,
    fromUser: { id: number; username: string },
    offerPokemon: Pokemon,
    requestPokemonId?: number
  }
}
```

---

### 6.7 客户端发送事件

#### pm:send
发送短消息

```typescript
// 客户端 -> 服务器
{
  event: 'pm:send',
  data: {
    toUserId: number,
    content: string
  }
}
```

---

#### pm:typing
正在输入状态

```typescript
// 客户端 -> 服务器
{
  event: 'pm:typing',
  data: {
    toUserId: number,
    isTyping: boolean
  }
}
```

---

#### pokemon:battle:action
战斗行动

```typescript
// 客户端 -> 服务器
{
  event: 'pokemon:battle:action',
  data: {
    battleId: string,
    action: 'move' | 'switch' | 'item',
    data: any
  }
}
```

---

## 7. 请求限制

### 7.1 速率限制

| 端点类型 | 限制 | 窗口 |
|----------|------|------|
| 登录/注册 | 5次/IP | 15分钟 |
| 发帖/回复 | 10次/用户 | 5分钟 |
| 短消息 | 20次/用户 | 10分钟 |
| 搜索 | 30次/用户 | 1分钟 |
| 文件上传 | 10次/用户 | 1小时 |
| 其他API | 100次/用户 | 1分钟 |

### 7.2 响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707240000
```

---

## 8. API 版本控制

### 8.1 版本策略

- URL版本控制：`/api/v1/...`
- 主版本号变更表示不兼容的API变更
- 次版本号变更表示向后兼容的新增功能

### 8.2 弃用通知

```http
X-API-Deprecated: true
X-API-Sunset: 2027-01-01
X-API-Alternative: /api/v2/threads
```

---

## 9. 接口清单汇总

| 模块 | 接口数 | 说明 |
|------|--------|------|
| 认证 | 4 | 登录、注册、登出、刷新token |
| 用户 | 5 | 资料管理、头像、密码 |
| 论坛 | 3 | 版块相关 |
| 主题 | 4 | CRUD + 操作 |
| 帖子 | 4 | CRUD + 引用 |
| 版主 | 3 | 审核操作 |
| Pokemon | 12 | 宠物、战斗、市场 |
| 银行 | 5 | 存取款、转账、记录 |
| 短消息 | 4 | 对话、发送、已读 |
| 通知 | 4 | 列表、已读、删除 |
| 附件 | 3 | 上传、获取、删除 |
| 搜索 | 3 | 搜索、建议、热门 |
| 统计 | 3 | 在线、论坛、用户 |
| 管理 | 12 | 后台管理功能 |
| **总计** | **69** | **RESTful API** |
| **WebSocket** | **15** | **实时事件** |

---

## 10. 下一步

- [ ] 缓存策略设计
- [ ] 安全策略设计
- [ ] 项目脚手架搭建
