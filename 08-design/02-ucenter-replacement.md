# UCenter依赖分析与替换方案

> 用户明确要求：**不再需要UCenter**
>
> 本文档列出所有UCenter依赖，并提供现代技术栈的替换方案

---

## 1. UCenter功能清单

### 1.1 核心功能

| UCenter功能 | 使用位置 | 说明 |
|------------|---------|------|
| 用户统一认证 | 全局 | 多应用统一登录 |
| 同步登录/登出 | logging.php | 一处登录，处处登录 |
| 用户注册 | register.php | 统一用户注册 |
| 短消息系统 | pm.php | 跨应用消息 |
| 好友系统 | misc.php | 好友关系管理 |
| 积分兑换 | memcp.php | 跨应用积分 |
| 头像服务 | 所有显示头像处 | 统一头像存储 |
| 标签系统 | tag.php | 跨应用标签 |
| 邮件队列 | 全局 | 异步邮件发送 |

### 1.2 数据表 (16张)

```sql
-- 用户相关
uc_members              -- 统一用户表 ⚠️ 需要迁移
uc_admins              -- 管理员表
uc_protectedmembers    -- 受保护用户
uc_banned              -- 被禁用户

-- 应用相关
uc_applications        -- 应用注册表 ⚠️ 不再需要
uc_creditsettings      -- 积分设置 ⚠️ 简化处理

-- 短消息相关
uc_pms                 -- 消息索引 ⚠️ 迁移到cdb_pms
uc_pm_lists            -- 消息列表 ⚠️ 迁移到cdb_pm_lists
uc_pm_messages         -- 消息内容 ⚠️ 迁移到cdb_pm_messages_*
uc_pm_members          -- 消息成员 ⚠️ 迁移到cdb_pm_members

-- 好友相关
uc_friends             -- 好友表 ⚠️ 迁移到新表
uc_friendvars          -- 好友分组

-- 其他
uc_feeds               -- 动态流 ⚠️ 可选功能
uc_tags                -- 标签表 ⚠️ 迁移到cdb_tags
uc_mailqueue           -- 邮件队列 ⚠️ 使用现代队列
uc_settings            -- 系统设置
uc_sqlcache            -- SQL缓存 ⚠️ 使用Redis
uc_visitors            -- 访客记录 ⚠️ 使用Redis
uc_domain_whitelist    -- 域名白名单
uc_badwords            -- 敏感词 ⚠️ 保留
```

---

## 2. 代码中的UCenter调用点

### 2.1 用户认证相关 ⚠️ 核心替换

**位置**: `bbs/include/common.inc.php` (第75-77行)

```php
// ❌ 旧代码 - UCenter认证
require_once DISCUZ_ROOT.'./uc_client/client.php';
list($discuz_uid, $discuz_user, $discuz_pw, $discuz_secques) =
    uc_addslashes(explode("\t", uc_authcode($uc_auth, 'DECODE')), 1);
```

**替换方案**: JWT + Session

```typescript
// ✅ 新代码 - JWT认证
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';

export async function authMiddleware(ctx: Context) {
  const token = ctx.cookies.get('token');

  if (!token) {
    ctx.state.user = null;
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = await User.findById(decoded.userId);
  } catch (err) {
    ctx.state.user = null;
  }
}
```

### 2.2 登录相关 ⚠️ 核心替换

**位置**: `bbs/logging.php`

```php
// ❌ 旧代码 - UCenter登录
list($uid, $username, $password, $email) = uc_user_login($username, $password);
if($uid > 0) {
    uc_user_synlogin($uid);  // 同步登录到其他应用
}
```

**替换方案**: JWT Token + Redis Session

```typescript
// ✅ 新代码
// src/services/auth.service.ts
export class AuthService {
  async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redis会话
    await redis.setex(`session:${user.id}`, 30 * 24 * 3600, JSON.stringify({
      userId: user.id,
      loginTime: new Date()
    }));

    return { token, user };
  }

  async logout(userId: number) {
    await redis.del(`session:${userId}`);
  }
}
```

### 2.3 注册相关 ⚠️ 核心替换

**位置**: `bbs/register.php`

```php
// ❌ 旧代码 - UCenter注册
$uid = uc_user_register($username, $password, $email);
if($uid <= 0) {
    showmessage('UCenter注册失败');
}
```

**替换方案**: 直接写入用户表

```typescript
// ✅ 新代码
// src/services/user.service.ts
export class UserService {
  async register(data: RegisterDto) {
    // 检查用户名是否存在
    const exists = await User.findOne({
      where: { username: data.username }
    });
    if (exists) {
      throw new Error('Username already exists');
    }

    // 检查邮箱
    const emailExists = await User.findOne({
      where: { email: data.email }
    });
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建用户
    const user = await User.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
      groupId: 10, // 默认用户组
      regDate: new Date(),
      regIp: ctx.ip,
    });

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { token, user };
  }
}
```

### 2.4 短消息相关 ⚠️ 需要迁移

**位置**: `bbs/pm.php`

```php
// ❌ 旧代码 - UCenter消息
uc_pm_send($fromuid, $touid, $subject, $message);
$msglist = uc_pm_list($uid, $page, $pagesize, $type);
```

**替换方案**: 使用本地消息表 `cdb_pms`

```typescript
// ✅ 新代码
// src/services/message.service.ts
export class MessageService {
  async send(fromId: number, toId: number, subject: string, message: string) {
    return await Message.create({
      msgFromId: fromId,
      msgToId: toId,
      subject,
      message,
      dateline: new Date(),
      new: 1,
    });
  }

  async getList(userId: number, page: number, pageSize: number) {
    const { rows, count } = await Message.findAndCountAll({
      where: { msgToId: userId },
      order: [['dateline', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return { messages: rows, total: count };
  }
}
```

### 2.5 头像服务 ⚠️ 需要替换

**位置**: 所有模板文件

```php
// ❌ 旧代码 - UCenter头像
{echo discuz_uc_avatar($discuz_uid)}

// UCenter API调用
function discuz_uc_avatar($uid) {
  return UC_API.'/avatar.php?uid='.$uid.'&size=middle';
}
```

**替换方案**: 对象存储 + CDN

```typescript
// ✅ 新方案1: 使用Gravatar
export function getAvatarUrl(userId: number, email: string, size = 'middle') {
  const sizeMap = { small: 80, middle: 160, large: 200 };
  const hash = md5(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${sizeMap[size]}`;
}

// ✅ 新方案2: 自定义头像存储
export function getAvatarUrl(userId: number, size = 'middle') {
  const sizeMap = { small: '80x80', middle: '160x160', large: '200x200' };
  return `${process.env.CDN_URL}/avatars/${userId}/${sizeMap[size]}.jpg`;
}

// React组件
function UserAvatar({ userId, email, size = 'middle' }) {
  const avatarUrl = getAvatarUrl(userId, email, size);
  return <img src={avatarUrl} alt="User Avatar" />;
}
```

### 2.6 好友系统 ⚠️ 需要迁移

**位置**: `bbs/misc.php?action=friend`

```php
// ❌ 旧代码 - UCenter好友
uc_friend_add($uid, $friendid);
$friends = uc_friend_getlist($uid, $page, $pagesize);
```

**替换方案**: 新建好友表

```typescript
// ✅ 新代码 - schema.prisma
model Friend {
  id        Int      @id @default(autoincrement())
  userId    Int
  friendId  Int
  status    Int      @default(0) // 0=待确认, 1=已确认
  createdAt DateTime @default(now())

  user    User @relation("UserFriends", fields: [userId], references: [id])
  friend  User @relation("FriendUsers", fields: [friendId], references: [id])

  @@unique([userId, friendId])
}

// src/services/friend.service.ts
export class FriendService {
  async addRequest(userId: number, friendId: number) {
    return await Friend.create({
      userId,
      friendId,
      status: 0, // 待确认
    });
  }

  async acceptRequest(userId: number, friendId: number) {
    await Friend.update({
      where: { userId_friendId: { userId: friendId, friendId: userId } },
      data: { status: 1 }
    });

    // 双向好友
    return await Friend.create({
      userId,
      friendId,
      status: 1,
    });
  }
}
```

### 2.7 积分兑换 ⚠️ 简化处理

**位置**: `bbs/memcp.php`

```php
// ❌ 旧代码 - UCenter积分兑换
uc_credit_exchange($uid, $from, $to, $amount);
```

**替换方案**: 本地积分系统

```typescript
// ✅ 新代码 - 简化为单应用积分
// schema.prisma
model User {
  // 扩展积分
  extCredits1 Int @default(0) // 金币
  extCredits2 Int @default(0) // 银币
  extCredits3 Int @default(0) // 铜币
  extCredits4 Int @default(0) // 点券
  // ...
}

// src/services/credit.service.ts
export class CreditService {
  async exchange(userId: number, fromType: number, toType: number, amount: number) {
    // 检查余额
    const user = await User.findById(userId);
    const fromBalance = user[`extCredits${fromType}`];

    if (fromBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // 汇率计算
    const rate = await this.getExchangeRate(fromType, toType);
    const toAmount = Math.floor(amount * rate);

    // 执行兑换
    await User.update(
      { id: userId },
      {
        [`extCredits${fromType}`]: fromBalance - amount,
        [`extCredits${toType}`]: user[`extCredits${toType}`] + toAmount
      }
    );

    // 记录日志
    await CreditLog.create({
      userId,
      fromType,
      toType,
      fromAmount: amount,
      toAmount,
    });
  }
}
```

### 2.8 API接口 ⚠️ 需要替换

**位置**: `bbs/api/uc.php`

```php
// ❌ 旧代码 - UCenter API接口
// bbs/api/uc.php - 处理UCenter的回调
```

**替换方案**: RESTful API

```typescript
// ✅ 新代码 - 统一API路由
// src/routes/index.ts
import Router from '@koa/router';
import { authController } from '../controllers/auth.controller';

const router = new Router();

// 用户相关
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/logout', authController.logout);
router.get('/api/auth/me', authController.getCurrentUser);

// 消息相关
router.get('/api/messages', messageController.getList);
router.post('/api/messages', messageController.send);

// 好友相关
router.get('/api/friends', friendController.getList);
router.post('/api/friends/request', friendController.addRequest);
router.post('/api/friends/accept', friendController.acceptRequest);

export default router;
```

---

## 3. 迁移方案

### 3.1 数据迁移SQL

```sql
-- 1. 迁移UCenter用户到本地用户表
INSERT INTO cdb_members (
  username, password, email, uid, regdate,
  groupid, extcredits1, extcredits2
)
SELECT
  username,
  password,
  email,
  uid as userid,
  regdate,
  8 as groupid,  -- 默认用户组
  0 as extcredits1,
  0 as extcredits2
FROM uc_members;

-- 2. 迁移UCenter短消息
INSERT INTO cdb_pms (
  msgfrom, msgfromid, msgto, msgtoid,
  subject, message, dateline, new, folder
)
SELECT
  pm.msgfrom,
  pm.msgfromid,
  pm.msgto,
  pm.msgtoid,
  pm.subject,
  pmm.message,
  pm.dateline,
  IF(pm.readstatus = 0, 1, 0) as new,
  'inbox'
FROM uc_pms pm
LEFT JOIN uc_pm_messages pmm ON pm.pmid = pmm.pmid;

-- 3. 迁移好友关系
INSERT INTO cdb_friends (
  uid, friendid, dateline
)
SELECT
  friendid as uid,
  uid as friendid,
  dateline
FROM uc_friends
WHERE status = 1;

-- 4. 迁移标签
INSERT INTO cdb_tags (
  tagname, status
)
SELECT
  tagname,
  1 as status
FROM uc_tags;
```

### 3.2 配置更新

```typescript
// ❌ 旧配置 - config.inc.php
define('UC_CONNECT', 'mysql');
define('UC_DBHOST', 'localhost');
define('UC_DBNAME', 'ucenter');
define('UC_DBUSER', 'root');
define('UC_DBPW', '');
define('UC_API', 'http://localhost/ucenter');

// ✅ 新配置 - .env
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379
DATABASE_URL=mysql://user:pass@localhost:3306/forum
CDN_URL=https://cdn.example.com
SMTP_HOST=smtp.example.com
SMTP_USER=noreply@example.com
SMTP_PASS=password
```

---

## 4. API接口对照表

| UCenter API | 新API | 说明 |
|-------------|-------|------|
| uc_user_login() | POST /api/auth/login | 登录 |
| uc_user_register() | POST /api/auth/register | 注册 |
| uc_user_synlogin() | 自动(JWT) | 同步登录不再需要 |
| uc_user_synlogout() | POST /api/auth/logout | 登出 |
| uc_user_edit() | PUT /api/user/profile | 修改资料 |
| uc_pm_send() | POST /api/messages | 发消息 |
| uc_pm_list() | GET /api/messages | 消息列表 |
| uc_friend_add() | POST /api/friends/request | 加好友 |
| uc_credit_exchange() | POST /api/credits/exchange | 积分兑换 |
| uc_get_user() | GET /api/user/:id | 获取用户 |

---

## 5. 完全移除UCenter后的架构

```
旧架构 (有UCenter):
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Discuz  │────▶│ UCenter │◀────│ UCHome  │
│ Forum   │     │ Server  │     │         │
└─────────┘     └─────────┘     └─────────┘
     │                 │
     └────uc_client────┘

新架构 (无UCenter):
┌─────────────┐     ┌─────────────┐
│ Discuz Forum│     │ React 前端  │
│   (Koa)     │◀────│    (SPA)    │
└─────────────┘     └─────────────┘
       │
       ├─ JWT认证
       ├─ Redis缓存
       ├─ MySQL数据库
       └─ 对象存储(CDN)
```

---

## 6. 检查清单

### 数据迁移
- [ ] 迁移uc_members到cdb_members
- [ ] 迁移uc_pms到cdb_pms
- [ ] 迁移uc_friends到cdb_friends
- [ ] 迁移uc_tags到cdb_tags
- [ ] 备份UCenter数据

### 代码替换
- [ ] 移除uc_client引入
- [ ] 替换uc_user_login为JWT
- [ ] 替换uc_user_synlogin为自动认证
- [ ] 替换uc_pm_*为本地消息服务
- [ ] 替换discuz_uc_avatar为CDN头像
- [ ] 移除api/uc.php

### 功能实现
- [ ] JWT认证中间件
- [ ] 密码bcrypt加密
- [ ] Redis会话管理
- [ ] 本地消息系统
- [ ] 好友系统
- [ ] 头像上传/CDN
- [ ] 邮件队列(可选)

### 测试
- [ ] 登录/注册流程
- [ ] 消息发送/接收
- [ ] 好友添加
- [ ] 积分系统
- [ ] 头像显示
- [ ] 跨设备登录

---

## 7. 总结

| 方面 | UCenter方式 | 新方式 | 说明 |
|------|------------|--------|------|
| 用户认证 | uc_user_login | JWT | 更安全，跨平台 |
| 同步登录 | uc_user_synlogin | 自动 | JWT自动实现 |
| 短消息 | uc_pm_* | 本地表 | 数据统一管理 |
| 头像 | UCenter服务 | CDN | 性能更好 |
| 好友 | uc_friend_* | 本地表 | 功能更灵活 |
| 积分 | uc_credit_exchange | 本地汇率 | 简化处理 |
| 通信 | uc_client | HTTP API | 标准化接口 |
