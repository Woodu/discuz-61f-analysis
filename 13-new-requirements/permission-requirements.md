# PokeTB Forum - Discuz 风格权限控制需求文档

## 文档概述

本文档描述 PokeTB Forum 所需的 Discuz 风格权限控制功能需求。这些功能是 Discuz 论坛系统的核心特性，决定了用户对论坛板块和内容的访问权限。

**版本**: 1.0
**创建日期**: 2026-02-09
**状态**: 待实现

---

## 1. 权限控制层级

### 1.1 用户认证层级

| 层级 | 描述 | 权限范围 |
|------|------|----------|
| **游客** | 未登录用户 | 只能浏览公开板块 |
| **注册用户** | 已登录用户 | 可浏览允许的板块，根据用户组权限 |
| **付费会员** | 付费订阅用户 | 额外权限访问付费板块 |
| **管理员** | 系统管理员 | 全部权限 |

### 1.2 用户组 (User Groups)

Discuz 系统通过用户组来管理权限，默认用户组包括：

| 用户组ID | 名称 | 描述 | 默认权限 |
|---------|------|------|----------|
| 1 | 管理员 | 系统管理员 | 全部权限 |
| 2 | 超级版主 | 拥有全部管理权限 | 管理论坛、用户、帖子 |
| 3 | 版主 | 特定板块版主 | 管理论坛帖子、回复 |
| 4 | 正式会员 | 注册并通过审核的会员 | 基础发帖、回复权限 |
| 5 | 普通会员 | 新注册用户 | 受限发帖权限 |
| 6 | 禁言用户 | 被临时禁言 | 无法发帖、回复 |
| 7 | 封禁用户 | 被永久封禁 | 无法访问 |
| 8+ | 付费用户组 | 各类付费会员 | 订阅特定板块 |

---

## 2. 板块级权限控制

### 2.1 板块访问权限

每个板块可以设置独立的访问权限：

#### 2.1.1 按登录状态控制

| 权限类型 | 说明 | 后台配置 |
|----------|------|----------|
| **全部用户** | 游客和登录用户均可访问 | `allowGuest: true` |
| **仅登录用户** | 需要登录才能访问 | `allowGuest: false`, `allowUser: true` |
| **仅特定用户组** | 只有指定用户组可访问 | `allowedGroupIds: [1, 2, 3]` |

#### 2.1.2 按积分要求控制

| 权限类型 | 说明 | 后台配置 |
|----------|------|----------|
| **最低积分限制** | 用户积分需达到指定值 | `requiredCredits: 100` |
| **付费查看** | 需要支付积分才能查看 | `viewCost: 10` |
| **付费查看并扣除** | 查看时扣除积分（不可逆） | `viewCost: 10, viewCostRefundable: false` |

#### 2.1.3 按发帖权限控制

| 权限类型 | 说明 | 后台配置 |
|----------|------|----------|
| **允许发帖** | 用户可在此板块发帖 | `allowPost: true` |
| **允许回复** | 用户可在此板块回复 | `allowReply: true` |
| **需要审核** | 发帖需要管理员审核后显示 | `requireModeration: true` |

### 2.2 板块后台管理界面需求

管理员后台应该能够：

#### 2.2.1 板块基础权限配置

```
板块编辑界面 -> 权限设置选项卡:

┌─────────────────────────────────────────────────┐
│ 板块权限设置                                     │
├─────────────────────────────────────────────────┤
│                                                 │
│ 访问控制:                                      │
│ ○ 全部用户可访问                             │
│ ○ 仅登录用户可访问                             │
│ ○ 仅特定用户组可访问 [选择用户组...]          │
│                                                 │
│ 积分要求:                                      │
│ 最低积分要求: [___]                           │
│                                                 │
│ 发帖权限:                                      │
│ ☑ 允许发帖                                     │
│ ☑ 允许回复                                     │
│ ☐ 发帖需要审核                                │
│                                                 │
│ [保存设置]                                     │
└─────────────────────────────────────────────────┘
```

#### 2.2.2 付费查看功能

```
付费查看配置:

┌─────────────────────────────────────────────────┐
│ 付费查看设置                                     │
│                                                 │
│ 是否启用付费查看: [开关]                        │
│                                                 │
│ 查看此帖子需要消耗:                             │
│ 基础积分: [___]                                │
│ 扩展积分1: [___]  扩展积分2: [___]             │
│                                                 │
│ 是否可退还: ○ 可退还（用户购买后可退回）        │
│           ○ 不可退还（一旦查看扣除）           │
│                                                 │
│ [保存设置]                                     │
└─────────────────────────────────────────────────┘
```

---

## 3. 帖子级权限控制

### 3.1 帖子可见性控制

| 帖子状态 | 说明 | 用户行为 |
|---------|------|----------|
| **正常** | 正常显示 | 所有有权限的用户可见 |
| **待审核** | 等待管理员审核 | 只有作者和管理员可见 |
| **已关闭** | 禁止回复 | 只有管理员可以回复 |
| **私密帖** | 只有指定用户可见 | 作者指定的用户可见 |
| **付费帖** | 需要支付积分才能查看 | 支付后可查看内容 |
| **回复可见** | 只有回复后才能查看 | 回复后才能看到完整内容 |

### 3.2 帖子操作权限

| 操作 | 游客 | 注册用户 | 作者 | 版主 | 管理员 |
|------|------|----------|------|------|--------|
| **查看** | 根据权限设置 | ✓ | ✓ | ✓ | ✓ |
| **回复** | × | 根据权限 | ✓ | ✓ | ✓ |
| **编辑** | × | × | 自己的帖子 | ✓ | ✓ |
| **删除** | × | × | 自己的帖子 | ✓ | ✓ |
| **置顶** | × | × | × | ✓ | ✓ |
| **加精** | × | × | × | ✓ | ✓ |
| **锁定** | × | × | × | ✓ | ✓ |
| **高亮** | × | × | × | ✓ | ✓ |

---

## 4. 积分系统集成

### 4.1 积分类型

Discuz 风格使用多维度积分系统：

| 积分类型 | 字段名 | 用途 |
|---------|--------|------|
| **基础积分** | `credits` | 通用积分，用于购买、查看等 |
| **扩展积分1** | `extCredits1` | 威望值 |
| **扩展积分2** | `extCredits2` | 金币/充值积分 |
| **扩展积分3** | `extCredits3` | 银行积分 |
| **扩展积分4-8** | `extCredits4-8` | 自定义用途 |

### 4.2 积分操作

| 操作 | 积分变化 | 权限要求 |
|------|---------|----------|
| **发帖** | +基础积分 | 允许发帖 |
| **回复** | +基础积分 | 允许回复 |
| **付费查看** | -付费积分 | 满足积分要求 |
| **充值** | +扩展积分2 | 支付功能 |
| **转账** | 转账积分 | 双方都有足够积分 |

---

## 5. 数据库设计需求

### 5.1 板块权限表 (ForumPermissions)

```prisma
model Forum {
  // ... 现有字段 ...

  // 权限相关字段
  allowGuest         Boolean @default(true)   // 游客是否可访问
  allowUser          Boolean @default(true)   // 登录用户是否可访问
  allowedGroupIds    Int[]                    // 允许访问的用户组ID列表
  requiredCredits    Int?                     // 访问所需最低积分
  viewCost           Int?                     // 付费查看消耗积分
  viewCostRefundable Boolean @default(false) // 付费查看是否可退还
  viewCostType       String?                  // 付费消耗的积分类型
  requireModeration  Boolean @default(false)  // 发帖是否需要审核

  // 关联表
  allowedGroups      ForumPermissionGroup[]
}

model ForumPermissionGroup {
  id        Int      @id @default(autoincrement())
  forumId   Int
  groupId   Int
  forum     Forum   @relation(fields: [forumId], references: [id])
  group     UserGroup @relation(fields: [groupId], references: [id])

  @@unique([forumId, groupId])
}
```

### 5.2 用户组表 (UserGroup)

```prisma
model UserGroup {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  title       String
  color       String?
  description String?
  canPost     Boolean @default(true)
  canReply    Boolean @default(true)
  priority    Int      @default(0)      // 优先级，数字越小权限越高

  // 用户
  users       User[]

  // 板块权限关联
  forumPermissions ForumPermissionGroup[]
}
```

### 5.3 积分记录表 (CreditTransaction)

```prisma
model CreditTransaction {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  type        String   // 'earn', 'spend', 'transfer'
  creditType  String   // 'credits', 'extCredits1', etc.
  amount      Int
  balance     Int      // 操作后余额
  reason      String?  // 操作原因
  relatedId   Int?     // 相关对象ID（帖子ID等）
  relatedType String?  // 相关对象类型
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 6. API 设计需求

### 6.1 权限检查中间件

需要实现权限检查中间件，在以下场景调用：

- 访问板块时
- 查看帖子时
- 发帖时
- 回复时
- 编辑/删除时

```typescript
interface PermissionCheckOptions {
  requireLogin?: boolean;
  allowedGroupIds?: number[];
  requiredCredits?: number;
  checkViewCost?: boolean; // 是否需要付费查看
}

async function checkPermission(
  userId: number | null,
  forumId?: number,
  threadId?: number,
  options?: PermissionCheckOptions
): Promise<{
  allowed: boolean;
  reason?: string;
  viewCost?: number;
  refundable?: boolean;
}>
```

### 6.2 后台管理 API

#### 板块权限配置 API

```typescript
// GET /api/admin/forums/:forumId/permissions
// 获取板块权限设置

// PATCH /api/admin/forums/:forumId/permissions
// 更新板块权限设置
interface UpdateForumPermissionsInput {
  allowGuest?: boolean;
  allowUser?: boolean;
  allowedGroupIds?: number[];
  requiredCredits?: number;
  viewCost?: number;
  viewCostRefundable?: boolean;
  viewCostType?: string;
  requireModeration?: boolean;
}
```

#### 帖子付费查看 API

```typescript
// POST /api/threads/:threadId/purchase
// 购买付费帖子查看权限
interface PurchaseThreadInput {
  threadId: number;
  paymentMethod?: 'credits' | 'extCredits1' | 'extCredits2';
}

// GET /api/threads/:threadId/purchase-status
// 获取付费状态
interface PurchaseStatus {
  isPurchased: boolean;
  viewCost: number;
  viewCostType: string;
  refundable: boolean;
}
```

---

## 7. 前端展示需求

### 7.1 板块列表显示

```
板块列表中应显示:
- 🔒 已锁定的板块 (需要登录/特定权限)
- 💎 付费板块标识
- 🔥 热门板块标识
- 📌 新帖/新回复标识
```

### 7.2 帖子列表显示

```
帖子列表中应显示:
- 🔒 帖子需要权限
- 💎 付费帖子标识
- 🔒 回复可见标识
- 🔖 私密帖子标识
```

### 7.3 权限提示信息

当用户权限不足时，应显示友好的提示：

```
┌────────────────────────────────────────┐
│ 🔒 权限不足                             │
│                                        │
│ 此板块需要登录后才能访问。           │
│                                        │
│ [登录] [返回]                          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 💎 付费内容                            │
│                                        │
│ 查看此帖子需要消耗 10 基础积分          │
│ 您当前积分: 50 基础积分                 │
│                                        │
│ [确认购买] [取消]                       │
└────────────────────────────────────────┘
```

---

## 8. 实现优先级

### Phase 1 - 基础权限 (当前已完成)
- [x] 用户认证/登录
- [x] 基础角色系统 (管理员/普通用户)
- [x] 板块基础访问控制

### Phase 2 - 扩展权限 (待实现)
- [ ] 用户组权限系统
- [ ] 板块级权限配置
- [ ] 积分系统集成

### Phase 3 - 高级功能 (待实现)
- [ ] 付费查看功能
- [ ] 积分交易记录
- [ ] 板块后台管理界面

---

## 9. 参考文档

- Discuz! X3.5 官方文档
- Discuz 权限系统设计原理
- 积分系统实现方案

---

**文档维护者**: PokeTB Team
**最后更新**: 2026-02-09
