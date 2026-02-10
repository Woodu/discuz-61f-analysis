# 积分系统设计文档

> **基于 Discuz! 6.1F 积分系统**
>
> **设计时间**: 2026-02-08
>
> **设计目标**: 为 Phase 5 宠物系统提供经济基础

---

## 1. 系统概述

### 1.1 积分体系架构

```
┌─────────────────────────────────────────────────────────────┐
│                        积分获取                              │
├─────────────────────────────────────────────────────────────┤
│  论坛活跃                                                   │
│  ├─ 发新主题    ──────┐                                     │
│  ├─ 回复主题    ──────┤                                     │
│  ├─ 设为精华    ──────┼──→ 积分奖励 ──→ 基础积分            │
│  ├─ 上传附件    ──────┤                       │             │
│  ├─ 他人评分    ──────┘                       │             │
│  └─ 签到/活跃   ──────────────────────────────┤             │
│                                                 ↓             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              积分存储 (8个扩展积分)                      │ │
│  │  extCredits1: 金币 (Pokemon货币)  ◄──── 主要经济       │ │
│  │  extCredits2: 银币 (银行存款)                         │ │
│  │  extCredits3: 铜币 (交易货币)                         │ │
│  │  extCredits4-8: 扩展积分                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   积分消费                              │ │
│  │  ├─ Pokemon商店 (购买道具、果实、技能)                 │ │
│  │  ├─ Pokemon市场 (购买宠物)                            │ │
│  │  ├─ 银行系统 (存储、转账、利息)                       │ │
│  │  ├─ 道具商城 (Magic道具)                             │ │
│  │  └─ 勋章购买                                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 积分类型定义

| 积分ID | 积分名称 | 用途 | 是否启用 | 默认值 |
|--------|----------|------|----------|--------|
| credits | 基础积分 | 用户等级、权限判断 | ✓ | 0 |
| extCredits1 | 金币 | **Pokemon主要货币** | ✓ | 0 |
| extCredits2 | 银币 | 银行存款 | ✓ | 0 |
| extCredits3 | 铜币 | 论坛交易 | ✗ | 0 |
| extCredits4 | 点券 | 高级功能 | ✗ | 0 |
| extCredits5 | 游戏币 | 其他游戏 | ✗ | 0 |
| extCredits6-8 | 扩展 | 预留 | ✗ | 0 |

---

## 2. 积分规则配置

### 2.1 全局积分策略 (Credits Policy)

存储位置: `settings` 表，key = `credits_policy`

```typescript
interface CreditsPolicy {
  // 发新主题奖励
  post: {
    extCredits1: number;  // 金币
    extCredits2: number;  // 银币
    // ... extCredits3-8
  };

  // 回复主题奖励
  reply: {
    extCredits1: number;
    extCredits2: number;
    // ...
  };

  // 被设为精华奖励
  digest: {
    extCredits1: number;
    extCredits2: number;
    // ...
  };

  // 上传附件奖励
  postAttach: {
    extCredits1: number;
    extCredits2: number;
    // ...
  };

  // 下载附件扣除
  getAttach: {
    extCredits1: number;  // 通常为负数
    // ...
  };

  // 搜索扣除
  search: {
    extCredits1: number;  // 通常为负数
    // ...
  };

  // 推广链接访问奖励
  promotionVisit: {
    extCredits1: number;
    // ...
  };

  // 推广注册奖励
  promotionRegister: {
    extCredits1: number;
    // ...
  };

  // 每日签到奖励
  dailyCheckin: {
    extCredits1: number;
    extCredits2: number;
    // ...
  };

  // 参与投票奖励
  votePoll: {
    extCredits1: number;
    // ...
  };
}
```

### 2.2 默认积分策略

```typescript
const DEFAULT_CREDITS_POLICY: CreditsPolicy = {
  post: {
    extCredits1: 2,    // 发新主题 +2金币
    extCredits2: 0,    // 不增加银币
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  reply: {
    extCredits1: 1,    // 回复 +1金币
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  digest: {
    extCredits1: 10,   // 被设为精华 +10金币
    extCredits2: 5,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  postAttach: {
    extCredits1: 1,    // 上传附件 +1金币
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  getAttach: {
    extCredits1: 0,    // 下载附件不扣除 (可配置)
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  search: {
    extCredits1: 0,    // 搜索不扣除 (可配置)
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  promotionVisit: {
    extCredits1: 0,    // 暂不启用推广奖励
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  promotionRegister: {
    extCredits1: 0,
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  dailyCheckin: {
    extCredits1: 1,    // 每日签到 +1金币
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },

  votePoll: {
    extCredits1: 0,    // 投票暂不奖励
    extCredits2: 0,
    extCredits3: 0,
    extCredits4: 0,
    extCredits5: 0,
    extCredits6: 0,
    extCredits7: 0,
    extCredits8: 0,
  },
};
```

---

## 3. 版块特定积分

### 3.1 版块积分规则

每个论坛版块可以有自己的积分策略，存储在 `forums` 表中：

```typescript
interface ForumCredits {
  // 发新主题奖励 (8个积分值，逗号分隔)
  postCredits: number[];        // [2, 0, 0, 0, 0, 0, 0, 0]

  // 回复主题奖励
  replyCredits: number[];       // [1, 0, 0, 0, 0, 0, 0, 0]

  // 被设为精华奖励
  digestCredits: number[];      // [10, 5, 0, 0, 0, 0, 0, 0]

  // 上传附件奖励
  postAttachCredits: number[];  // [1, 0, 0, 0, 0, 0, 0, 0]

  // 下载附件扣除
  getAttachCredits: number[];   // [0, 0, 0, 0, 0, 0, 0, 0]
}
```

### 3.2 版块积分优先级

```
1. 检查版块是否有特定积分规则
2. 如果有，使用版块规则
3. 如果没有，使用全局默认规则
4. 如果版块规则中某项为0，则不发放该积分
```

### 3.3 版块积分值范围限制

- 单次奖励范围: `-99` 到 `+99`
- 防止管理员误配置导致积分爆炸

---

## 4. 用户组积分评级

### 4.1 评分权限

用户组可以设置评分权限，存储在 `user_groups` 表中：

```typescript
interface RateRange {
  // 积分类型ID (1-8)
  creditId: number;

  // 最低评分 (可为负数)
  minRating: number;

  // 最高评分
  maxRating: number;

  // 每日最大评分次数
  maxRatingsPerDay: number;
}
```

### 4.2 评分权限示例

| 用户组 | 可评积分 | 最低分 | 最高分 | 每日次数 |
|--------|----------|--------|--------|----------|
| 管理员 | extCredits1 | -10 | +10 | 50 |
| 超级版主 | extCredits1 | -5 | +5 | 20 |
| 版主 | extCredits1 | -3 | +3 | 10 |
| 普通会员 | extCredits1 | 0 | 0 | 0 |
| 禁止访问 | - | - | - | - |

### 4.3 评分限制验证

```typescript
function validateRateRange(range: RateRange): boolean {
  // 必须设置每日次数
  if (!range.maxRatingsPerDay || range.maxRatingsPerDay <= 0) {
    return false;
  }

  // 最高分必须大于最低分
  if (range.maxRating <= range.minRating) {
    return false;
  }

  // 每日次数必须大于等于最高分的绝对值
  if (range.maxRatingsPerDay < Math.max(Math.abs(range.minRating), Math.abs(range.maxRating))) {
    return false;
  }

  return true;
}
```

---

## 5. 后端实现

### 5.1 积分服务 (CreditsService)

```typescript
// src/services/credits.service.ts

import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../types/errors';

interface CreditsReward {
  extCredits1?: number;
  extCredits2?: number;
  extCredits3?: number;
  extCredits4?: number;
  extCredits5?: number;
  extCredits6?: number;
  extCredits7?: number;
  extCredits8?: number;
}

export class CreditsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * 获取全局积分策略
   */
  async getCreditsPolicy(): Promise<CreditsPolicy> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'credits_policy' },
    });

    if (!setting) {
      return DEFAULT_CREDITS_POLICY;
    }

    return JSON.parse(setting.value) as CreditsPolicy;
  }

  /**
   * 更新全局积分策略
   */
  async updateCreditsPolicy(policy: CreditsPolicy): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: 'credits_policy' },
      create: {
        key: 'credits_policy',
        value: JSON.stringify(policy),
        type: 'json',
        category: 'credits',
      },
      update: {
        value: JSON.stringify(policy),
      },
    });
  }

  /**
   * 获取版块积分策略
   */
  async getForumCredits(forumId: number): Promise<ForumCredits | null> {
    const forum = await this.prisma.forum.findUnique({
      where: { id: forumId },
      select: {
        postCredits: true,
        replyCredits: true,
        digestCredits: true,
        postAttachCredits: true,
        getAttachCredits: true,
      },
    });

    if (!forum) {
      return null;
    }

    return {
      postCredits: this.parseCreditsArray(forum.postCredits),
      replyCredits: this.parseCreditsArray(forum.replyCredits),
      digestCredits: this.parseCreditsArray(forum.digestCredits),
      postAttachCredits: this.parseCreditsArray(forum.postAttachCredits),
      getAttachCredits: this.parseCreditsArray(forum.getAttachCredits),
    };
  }

  /**
   * 发放积分奖励
   */
  async grantCredits(
    userId: number,
    action: keyof CreditsPolicy,
    forumId?: number
  ): Promise<void> {
    // 1. 获取全局策略
    const globalPolicy = await this.getCreditsPolicy();

    // 2. 获取版块策略（如果提供forumId）
    let forumCredits: ForumCredits | null = null;
    if (forumId) {
      forumCredits = await this.getForumCredits(forumId);
    }

    // 3. 计算实际奖励
    const reward = this.calculateReward(action, globalPolicy, forumCredits);

    // 4. 更新用户积分
    await this.updateUserCredits(userId, reward);

    // 5. 记录积分日志
    await this.logCreditsChange(userId, action, reward);
  }

  /**
   * 计算积分奖励
   */
  private calculateReward(
    action: keyof CreditsPolicy,
    globalPolicy: CreditsPolicy,
    forumCredits: ForumCredits | null
  ): CreditsReward {
    const reward: CreditsReward = {};

    // 获取该动作的全局奖励
    const globalReward = globalPolicy[action];

    // 如果有版块奖励，优先使用版块奖励
    let forumReward: number[] | null = null;
    if (forumCredits) {
      switch (action) {
        case 'post':
          forumReward = forumCredits.postCredits;
          break;
        case 'reply':
          forumReward = forumCredits.replyCredits;
          break;
        case 'digest':
          forumReward = forumCredits.digestCredits;
          break;
        case 'postAttach':
          forumReward = forumCredits.postAttachCredits;
          break;
      }
    }

    // 合并奖励 (版块奖励优先)
    for (let i = 1; i <= 8; i++) {
      const key = `extCredits${i}` as keyof CreditsReward;
      const value = forumReward?.[i - 1] ?? globalReward[key];
      if (value !== 0) {
        reward[key] = value;
      }
    }

    return reward;
  }

  /**
   * 更新用户积分
   */
  private async updateUserCredits(
    userId: number,
    reward: CreditsReward
  ): Promise<void> {
    const updateData: any = {};

    if (reward.extCredits1 !== undefined) {
      updateData.extCredits1 = { increment: reward.extCredits1 };
    }
    if (reward.extCredits2 !== undefined) {
      updateData.extCredits2 = { increment: reward.extCredits2 };
    }
    if (reward.extCredits3 !== undefined) {
      updateData.extCredits3 = { increment: reward.extCredits3 };
    }
    if (reward.extCredits4 !== undefined) {
      updateData.extCredits4 = { increment: reward.extCredits4 };
    }
    if (reward.extCredits5 !== undefined) {
      updateData.extCredits5 = { increment: reward.extCredits5 };
    }
    if (reward.extCredits6 !== undefined) {
      updateData.extCredits6 = { increment: reward.extCredits6 };
    }
    if (reward.extCredits7 !== undefined) {
      updateData.extCredits7 = { increment: reward.extCredits7 };
    }
    if (reward.extCredits8 !== undefined) {
      updateData.extCredits8 = { increment: reward.extCredits8 };
    }

    // 同时更新基础积分 (extCredits1的值)
    if (reward.extCredits1 !== undefined) {
      updateData.credits = { increment: reward.extCredits1 };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * 记录积分变化日志
   */
  private async logCreditsChange(
    userId: number,
    action: keyof CreditsPolicy,
    reward: CreditsReward
  ): Promise<void> {
    // 创建积分日志
    await this.prisma.creditsLog.create({
      data: {
        userId,
        action,
        changes: JSON.stringify(reward),
      },
    });
  }

  /**
   * 解析积分数组字符串
   */
  private parseCreditsArray(value: string | null): number[] {
    if (!value) {
      return [0, 0, 0, 0, 0, 0, 0, 0];
    }
    const parsed = value.split(',').map(v => parseInt(v.trim(), 10));
    // 确保8个元素
    while (parsed.length < 8) parsed.push(0);
    return parsed.slice(0, 8);
  }

  /**
   * 格式化积分数组为字符串
   */
  private formatCreditsArray(arr: number[]): string {
    while (arr.length < 8) arr.push(0);
    return arr.slice(0, 8).join(',');
  }
}
```

### 5.2 在 ThreadService 中集成

```typescript
// src/services/thread.service.ts

// 在 createThread 方法中添加
async createThread(input: CreateThreadInput): Promise<Thread> {
  // ... 现有验证逻辑 ...

  // 创建主题
  const thread = await this.prisma.thread.create({...});

  // 更新用户发帖数
  await this.prisma.user.update({
    where: { id: input.authorId },
    data: {
      threadCount: { increment: 1 },
      lastPost: new Date(),
    },
  });

  // ★★★ 新增：发放发帖积分奖励 ★★★
  await this.creditsService.grantCredits(
    input.authorId,
    'post',
    input.forumId
  );

  // ... 其他逻辑 ...
  return thread;
}
```

### 5.3 在 PostService 中集成

```typescript
// src/services/post.service.ts

// 在 createPost 方法中添加
async createPost(input: CreatePostInput): Promise<Post> {
  // ... 现有验证逻辑 ...

  // 创建回复
  const post = await this.prisma.post.create({...});

  // 更新用户回复数
  await this.prisma.user.update({
    where: { id: input.authorId },
    data: {
      postCount: { increment: 1 },
      lastPost: new Date(),
    },
  });

  // ★★★ 新增：发放回复积分奖励 ★★★
  const thread = await this.prisma.thread.findUnique({
    where: { id: input.threadId },
    select: { forumId: true },
  });

  if (thread) {
    await this.creditsService.grantCredits(
      input.authorId,
      'reply',
      thread.forumId
    );
  }

  // ... 其他逻辑 ...
  return post;
}
```

---

## 6. 数据库更新

### 6.1 新增积分日志表

```prisma
// ==================== 积分日志 ====================
model CreditsLog {
  id              Int      @id @default(autoincrement())
  userId          Int

  // 操作类型
  action          String   @db.VarChar(20)   // post/reply/digest/etc

  // 积分变化
  changes         Json                      // {"extCredits1": 2, "extCredits2": 0}

  // 余额快照
  balanceSnapshot Json?                     // 记录操作后的余额

  // 关联信息
  relatedType     String?  @db.VarChar(20)  // thread/post/attachment
  relatedId       Int?

  // 备注
  note            String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("credits_logs")
}
```

### 6.2 Forums 表新增字段

```prisma
model Forum {
  // ... 现有字段 ...

  // 积分规则 (逗号分隔的8个值)
  postCredits      String?  @db.VarChar(50)   // "2,0,0,0,0,0,0,0"
  replyCredits     String?  @db.VarChar(50)
  digestCredits    String?  @db.VarChar(50)
  postAttachCredits String? @db.VarChar(50)
  getAttachCredits String?  @db.VarChar(50)
}
```

### 6.3 User 表添加关联

```prisma
model User {
  // ... 现有字段 ...

  // 新增关联
  creditsLogs     CreditsLog[]
}
```

---

## 7. API 接口

### 7.1 查询用户积分

```typescript
// GET /api/users/:userId/credits
interface UserCreditsResponse {
  credits: number;         // 基础积分
  extCredits1: number;     // 金币
  extCredits2: number;     // 银币
  extCredits3: number;     // 铜币
  extCredits4: number;
  extCredits5: number;
  extCredits6: number;
  extCredits7: number;
  extCredits8: number;
}
```

### 7.2 查询积分日志

```typescript
// GET /api/users/:userId/credits/logs?page=1&limit=20
interface CreditsLogsResponse {
  logs: Array<{
    id: number;
    action: string;
    changes: Record<string, number>;
    balanceSnapshot: Record<string, number>;
    relatedType: string | null;
    relatedId: number | null;
    note: string | null;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 7.3 管理员配置积分策略

```typescript
// GET /api/admin/credits/policy
// Returns: CreditsPolicy

// PUT /api/admin/credits/policy
interface UpdatePolicyRequest {
  policy: CreditsPolicy;
}
```

---

## 8. 前端显示

### 8.1 用户信息栏显示积分

```tsx
// components/UserCredits.tsx
interface UserCreditsProps {
  userId: number;
}

export function UserCredits({ userId }: UserCreditsProps) {
  const { data } = useQuery(['user-credits', userId], () =>
    fetchUserCredits(userId)
  );

  return (
    <div className="flex gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-text-light">金币:</span>
        <span className="text-yellow-500 font-medium">
          {data?.extCredits1 ?? 0}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-text-light">银币:</span>
        <span className="text-gray-400 font-medium">
          {data?.extCredits2 ?? 0}
        </span>
      </div>
    </div>
  );
}
```

### 8.2 发帖后显示获得的积分

```tsx
// 在新主题创建成功后显示
<div className="p-3 bg-success/10 border border-success rounded text-sm">
  帖子发布成功！
  <div className="mt-2 text-success">
    获得: +2 金币
  </div>
</div>
```

---

## 9. Phase 5 宠物系统集成

### 9.1 经济流动路径

```
论坛活跃 → 发帖/回帖 → 获得金币 → Pokemon商店购买 → 消费金币
                ↓
           回复获得积分少
                ↓
           发帖获得积分多
                ↓
           精华获得大量积分
                ↓
           激励用户产出高质量内容
```

### 9.2 Pokemon 商店价格参考

基于默认积分策略，建议商品定价：

| 商品类型 | 建议价格 | 说明 |
|----------|----------|------|
| 普通果实 | 5-20 金币 | 2-10次回复获得 |
| 稀有果实 | 50-100 金币 | 25-50次回复或5次发帖获得 |
| 技能学习 | 100-200 金币 | 需要一定活跃度 |
| 低级宠物 | 200-500 金币 | 需要持续活跃 |
| 高级宠物 | 1000+ 金币 | 需要大量贡献或精华 |

### 9.3 经济平衡调整

```typescript
// 可通过调整全局积分策略来控制经济速度

// 保守型经济 (慢速)
const CONSERVATIVE_POLICY = {
  post: { extCredits1: 1 },    // 发帖 +1
  reply: { extCredits1: 0 },   // 回复 +0
  digest: { extCredits1: 5 },  // 精华 +5
};

// 平衡型经济 (默认)
const BALANCED_POLICY = {
  post: { extCredits1: 2 },    // 发帖 +2
  reply: { extCredits1: 1 },   // 回复 +1
  digest: { extCredits1: 10 }, // 精华 +10
};

// 激进型经济 (快速)
const AGGRESSIVE_POLICY = {
  post: { extCredits1: 5 },    // 发帖 +5
  reply: { extCredits1: 3 },   // 回复 +3
  digest: { extCredits1: 20 }, // 精华 +20
};
```

---

## 10. 实现检查清单

### 后端
- [ ] 创建 `CreditsService`
- [ ] 更新 `ThreadService.createThread()` 添加积分奖励
- [ ] 更新 `PostService.createPost()` 添加积分奖励
- [ ] 添加精华主题积分奖励
- [ ] 实现 `setThreadDigest()` 方法
- [ ] 添加积分日志记录
- [ ] 实现版块特定积分策略
- [ ] 添加用户组评分权限检查

### 前端
- [ ] 添加发帖按钮到 `ForumViewPage`
- [ ] 显示用户积分组件
- [ ] 发帖成功后显示获得积分提示
- [ ] 积分日志查询页面
- [ ] 管理员积分策略配置页面

### 数据库
- [ ] 添加 `CreditsLog` 表
- [ ] `forums` 表添加积分字段
- [ ] 运行数据库迁移
- [ ] 设置默认积分策略到 `settings` 表

---

## 11. 备注

1. **积分与银行的关系**: 银行系统是独立的 extCredits2，用户可以存入 extCredits1 (金币) 到银行获得利息

2. **防刷机制**: 建议添加以下限制
   - 同一用户对同一主题连续回复只奖励前3次
   - 每日发帖奖励上限 (如前20篇有奖励)
   - 新用户注册后需要一定时间才能发帖

3. **积分公式**: 用户等级可以根据基础积分计算
   ```
   等级 = floor(sqrt(credits / 100))
   ```

4. **扩展性**: 8个扩展积分可以分别用于不同系统
   - extCredits1: Pokemon货币
   - extCredits2: 银行
   - extCredits3: 交易
   - extCredits4-8: 未来扩展
