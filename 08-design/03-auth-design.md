# 认证系统设计

> **替代 UCenter** - 基于 JWT 的现代化认证系统
>
> **设计时间**: 2026-02-07

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         认证系统架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  前端    │────│  API层   │────│  服务层  │              │
│  │  React   │    │   Koa    │    │ Service  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │               │                  │                   │
│       │          ┌────┴────┐        ┌────┴────┐            │
│       │          │ 中间件  │        │  业务   │            │
│       │          │ auth.ts │        │  逻辑   │            │
│       │          └────┬────┘        └────┬────┘            │
│       │               │                  │                   │
│       └───────────────┴──────────────────┘                   │
│                       │                                      │
│            ┌──────────┴──────────┐                          │
│            │     存储层           │                          │
│            ├──────────┬──────────┤                          │
│            │  MySQL   │  Redis   │                          │
│            │  (用户)  │ (会话)   │                          │
│            └──────────┴──────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| 认证协议 | JWT (JSON Web Token) | 无状态，跨平台 |
| 加密算法 | RS256 (RSA + SHA256) | 非对称加密，更安全 |
| 密码加密 | bcrypt | cost=10，自适应难度 |
| 会话存储 | Redis 7.x | 支持过期和主动失效 |
| Token刷新 | Refresh Token | 双Token机制 |
| 设备管理 | Device Fingerprint | 支持多设备管理 |

---

## 2. 数据模型

### 2.1 Prisma Schema

```prisma
// ==================== 用户表 ====================
model User {
  id              Int      @id @default(autoincrement())
  username        String   @unique @db.VarChar(50)
  email           String?  @unique @db.VarChar(100)
  password        String   @db.VarChar(255)
  salt            String?  @db.VarChar(50)  // 迁移旧密码使用

  // 用户组
  groupId         Int      @default(10)
  adminId         Int      @default(0)

  // 基础信息
  gender          Int      @default(0)
  birthday        DateTime?
  constellations  String?
  bio             String?  @db.Text
  signature       String?  @db.VarChar(500)

  // 头像
  avatar          String?  @db.VarChar(255)
  avatarStatus    Int      @default(0)

  // 状态
  status          Int      @default(0)  // 0=正常 1=待验证 2=已禁用
  emailVerified   Boolean  @default(false)

  // 积分
  credits         Int      @default(0)
  extCredits1     Int      @default(0)  // 金币
  extCredits2     Int      @default(0)  // 银币
  extCredits3     Int      @default(0)  // 铜币
  extCredits4     Int      @default(0)  // 点券
  extCredits5     Int      @default(0)
  extCredits6     Int      @default(0)
  extCredits7     Int      @default(0)
  extCredits8     Int      @default(0)

  // 统计
  posts           Int      @default(0)
  threads         Int      @default(0)
  digests         Int      @default(0)
  oltime          Int      @default(0)

  // 时间
  lastVisit       DateTime @default(now())
  lastPost        DateTime?
  lastActivity    DateTime @default(now())
  regDate         DateTime @default(now())
  regIp           String?  @db.VarChar(50)

  // 关系
  sessions        Session[]
  devices         Device[]
  refreshTokens   RefreshToken[]
  roles           UserRole[]
  posts           Post[]
  threads         Thread[]

  @@index([groupId])
  @@index([status])
  @@map("cdb_members")
}

// ==================== 用户组 ====================
model UserGroup {
  id              Int      @id @default(autoincrement()) @map("groupid")
  name            String   @map("grouptitle")
  type            String   @default("member") @db.VarChar(20)

  // 积分范围
  creditsHigher   Int      @default(0)
  creditsLower    Int      @default(0)

  // 显示
  stars           Int      @default(0)
  color           String?  @db.VarChar(50)
  icon            String?  @db.VarChar(255)

  // 权限
  allowVisit      Boolean  @default(true)
  readAccess      Int      @default(0)
  allowPost       Boolean  @default(false)
  allowReply      Boolean  @default(false)

  users           User[]

  @@map("cdb_usergroups")
}

// ==================== 会话表 (Redis为主，MySQL为辅) ====================
model Session {
  id              String   @id @default(uuid()) @map("sid")
  userId          Int
  ip              String?  @db.VarChar(50)
  userAgent       String?  @db.VarChar(500)
  lastActivity    DateTime @default(now())
  data            String?  @db.Text

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("cdb_sessions")
}

// ==================== 设备管理 ====================
model Device {
  id              Int      @id @default(autoincrement())
  userId          Int
  fingerprint     String   @db.VarChar(100)
  name            String?  @db.VarChar(100)  // 设备名称，如"Chrome on Windows"
  lastUsed        DateTime @default(now())
  isTrusted       Boolean  @default(false)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, fingerprint])
  @@index([userId])
  @@map("user_devices")
}

// ==================== Refresh Token ====================
model RefreshToken {
  id              Int      @id @default(autoincrement())
  userId          Int
  token           String   @unique @db.VarChar(500)
  deviceId        Int?
  expiresAt       DateTime
  revokedAt       DateTime?
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("user_refresh_tokens")
}

// ==================== 用户角色关联 ====================
model UserRole {
  id              Int      @id @default(autoincrement())
  userId          Int
  roleId          String   @db.VarChar(50)
  scope           String   @default("global") @db.VarChar(20)  // global | forum
  scopeId         Int?                                           // 版块ID
  createdAt       DateTime @default(now())

  @@unique([userId, roleId, scope, scopeId])
  @@index([userId])
  @@map("user_roles")
}

// ==================== 登录日志 ====================
model LoginLog {
  id              Int      @id @default(autoincrement())
  userId          Int?
  username        String?  @db.VarChar(50)
  ip              String   @db.VarChar(50)
  status          String   @db.VarChar(20)  // success | failed
  failureReason   String?  @db.VarChar(100)
  userAgent       String?  @db.VarChar(500)
  deviceId        Int?
  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([ip])
  @@index([createdAt])
  @@map("user_login_logs")
}
```

---

## 3. JWT Token 设计

### 3.1 Token 结构

#### Access Token (短期)
```json
{
  "sub": "123",                    // 用户ID
  "username": "admin",
  "email": "admin@example.com",
  "groupId": 1,
  "roles": ["super_admin"],
  "type": "access",
  "iat": 1738892800,               // 签发时间
  "exp": 1738979200,               // 过期时间 (24小时)
  "jti": "abc123...",              // Token唯一ID
  "deviceId": "chrome-win-123"    // 设备指纹
}
```

#### Refresh Token (长期)
```json
{
  "sub": "123",
  "type": "refresh",
  "iat": 1738892800,
  "exp": 1741568000,               // 过期时间 (30天)
  "jti": "xyz789...",
  "deviceId": "chrome-win-123"
}
```

### 3.2 Token 生成与验证

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AccessTokenPayload {
  sub: number;
  username: string;
  email?: string;
  groupId: number;
  roles: string[];
  type: 'access';
  deviceId: string;
}

export interface RefreshTokenPayload {
  sub: number;
  type: 'refresh';
  deviceId: string;
}

export class JWTService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    this.accessSecret = config.jwt.accessSecret;
    this.refreshSecret = config.jwt.refreshSecret;
  }

  // 生成 Access Token (24小时)
  generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      this.accessSecret,
      {
        expiresIn: '24h',
        issuer: 'forum-api',
        audience: 'forum-app',
        jwtid: this.generateJTI(),
      }
    );
  }

  // 生成 Refresh Token (30天)
  generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      this.refreshSecret,
      {
        expiresIn: '30d',
        issuer: 'forum-api',
        audience: 'forum-app',
        jwtid: this.generateJTI(),
      }
    );
  }

  // 验证 Access Token
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as AccessTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_TOKEN');
      }
      throw err;
    }
  }

  // 验证 Refresh Token
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  // 解码 Token (不验证，用于获取过期时间等)
  decode(token: string) {
    return jwt.decode(token);
  }

  private generateJTI(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

export const jwtService = new JWTService();
```

### 3.3 Token 刷新机制

```typescript
// src/services/auth.service.ts
export class AuthService {
  async login(credentials: LoginDto, context: RequestContext) {
    const { username, password } = credentials;
    const { ip, userAgent } = context;

    // 1. 验证用户
    const user = await this.validateUser(username, password);
    if (!user) {
      await this.logLoginAttempt(null, username, ip, userAgent, 'failed', 'invalid_credentials');
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 2. 检查用户状态
    if (user.status === 2) {
      throw new ForbiddenError('账户已被禁用');
    }

    // 3. 生成设备指纹
    const deviceId = this.generateDeviceFingerprint(userAgent, ip);

    // 4. 检查是否需要二次验证
    const needs2FA = await this.check2FARequired(user, deviceId);
    if (needs2FA) {
      return { requires2FA: true, tempToken: this.generateTempToken(user.id) };
    }

    // 5. 生成 Tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, deviceId);

    // 6. 记录设备
    await this.recordDevice(user.id, deviceId, userAgent);

    // 7. 更新最后登录
    await this.updateLastLogin(user.id, ip);

    // 8. 记录日志
    await this.logLoginAttempt(user.id, username, ip, userAgent, 'success');

    // 9. 设置 Redis 会话
    await redis.setex(
      `session:${user.id}:${deviceId}`,
      24 * 3600,
      JSON.stringify({ userId: user.id, deviceId, ip })
    );

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(refreshToken: string) {
    // 1. 验证 Refresh Token
    const payload = jwtService.verifyRefreshToken(refreshToken);

    // 2. 检查数据库中的 Token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // 3. 撤销旧 Token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // 4. 生成新 Tokens
    const tokens = await this.generateTokens(storedToken.user, payload.deviceId);

    return tokens;
  }

  async logout(userId: number, deviceId: string) {
    // 1. 撤销所有该设备的 Refresh Tokens
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        deviceId: { devices: { some: { fingerprint: deviceId } } },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // 2. 清除 Redis 会话
    await redis.del(`session:${userId}:${deviceId}`);
  }

  async logoutAll(userId: number) {
    // 撤销用户所有设备的 Token
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // 清除所有 Redis 会话
    const keys = await redis.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  private async generateTokens(user: User, deviceId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { roleId: true },
    });

    const roles = userRoles.map(r => r.roleId);

    const accessToken = jwtService.generateAccessToken({
      sub: user.id,
      username: user.username,
      email: user.email,
      groupId: user.groupId,
      roles,
      deviceId,
    });

    const refreshToken = jwtService.generateRefreshToken({
      sub: user.id,
      deviceId,
    });

    // 存储 Refresh Token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceId,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
```

---

## 4. 密码策略

### 4.1 密码加密

```typescript
// src/utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PasswordService {
  // 哈希密码
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // 验证密码
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // 验证密码强度
  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('密码长度至少8位');
    }

    if (password.length > 50) {
      errors.push('密码长度不能超过50位');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含数字');
    }

    // 检查常见弱密码
    const weakPasswords = ['password', '12345678', 'qwerty123'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('密码过于简单');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const passwordService = new PasswordService();
```

### 4.2 旧密码迁移 (MD5)

```typescript
// src/utils/password-migration.ts
import crypto from 'crypto';
import { passwordService } from './password';

// 旧系统使用 MD5(password + salt) 或 MD5(password)
export class PasswordMigration {
  // 检查是否为旧密码格式 (32位十六进制)
  isLegacyPassword(hash: string): boolean {
    return /^[a-f0-9]{32}$/i.test(hash);
  }

  // 验证旧密码并迁移
  async verifyAndMigrate(user: User, plainPassword: string): Promise<boolean> {
    const isLegacy = this.isLegacyPassword(user.password);

    if (isLegacy) {
      // 旧 MD5 验证
      const legacyValid = this.verifyLegacy(plainPassword, user.password, user.salt);

      if (legacyValid) {
        // 迁移到 bcrypt
        const newHash = await passwordService.hash(plainPassword);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: newHash,
            salt: null, // 不再需要
          },
        });
      }

      return legacyValid;
    }

    // 新 bcrypt 验证
    return passwordService.verify(plainPassword, user.password);
  }

  private verifyLegacy(password: string, hash: string, salt?: string | null): boolean {
    let input: string;

    if (salt) {
      // MD5(password + salt)
      input = crypto.createHash('md5').update(password + salt).digest('hex');
    } else {
      // MD5(password)
      input = crypto.createHash('md5').update(password).digest('hex');
    }

    return input === hash.toLowerCase();
  }
}

export const passwordMigration = new PasswordMigration();
```

---

## 5. 认证中间件

### 5.1 Koa 中间件

```typescript
// src/middleware/auth.ts
import { Context, Next } from 'koa';
import { jwtService } from '../utils/jwt';
import { prisma } from '../lib/prisma';

export interface AuthState {
  user?: {
    id: number;
    username: string;
    email?: string;
    groupId: number;
    roles: string[];
    deviceId: string;
  };
}

// 认证中间件
export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.cookies.get('access_token') || ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.state.user = null;
    return await next();
  }

  try {
    const payload = jwtService.verifyAccessToken(token);

    // 检查 Redis 会话是否有效
    const sessionKey = `session:${payload.sub}:${payload.deviceId}`;
    const session = await redis.get(sessionKey);

    if (!session) {
      ctx.state.user = null;
      return await next();
    }

    // 获取最新用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        groupId: true,
        status: true,
        roles: {
          select: { roleId: true },
        },
      },
    });

    if (!user || user.status === 2) {
      ctx.state.user = null;
      return await next();
    }

    ctx.state.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      groupId: user.groupId,
      roles: user.roles.map(r => r.roleId),
      deviceId: payload.deviceId,
    };
  } catch (err) {
    // Token 无效或过期
    ctx.state.user = null;
  }

  await next();
}

// 要求登录
export function requireAuth() {
  return async (ctx: Context, next: Next) => {
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized', message: '请先登录' };
      return;
    }
    await next();
  };
}

// 要求特定角色
export function requireRole(...roles: string[]) {
  return async (ctx: Context, next: Next) => {
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized', message: '请先登录' };
      return;
    }

    const hasRole = roles.some(role => ctx.state.user.roles.includes(role));

    if (!hasRole) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden', message: '权限不足' };
      return;
    }

    await next();
  };
}
```

### 5.2 权限检查中间件

```typescript
// src/middleware/permission.ts
import { Context, Next } from 'koa';
import { Permission, hasPermission } from '../lib/permission';

export function requirePermission(permission: Permission, context?: { forumId?: number }) {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
      return;
    }

    const forumId = context?.forumId || ctx.params.fid || ctx.params.forumId;
    const permitted = await hasPermission(user, permission, { forumId });

    if (!permitted) {
      ctx.status = 403;
      ctx.body = {
        error: 'Forbidden',
        message: '您没有执行此操作的权限',
        required: permission,
      };
      return;
    }

    await next();
  };
}
```

---

## 6. API 接口设计

### 6.1 认证 API

```typescript
// src/routes/auth.routes.ts
import Router from '@koa/router';
import { authController } from '../controllers/auth.controller';

const router = new Router({ prefix: '/api/auth' });

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 登出
router.post('/logout', requireAuth(), authController.logout);

// 登出所有设备
router.post('/logout-all', requireAuth(), authController.logoutAll);

// 刷新 Token
router.post('/refresh', authController.refresh);

// 获取当前用户
router.get('/me', requireAuth(), authController.getCurrentUser);

// 更新个人资料
router.put('/profile', requireAuth(), authController.updateProfile);

// 修改密码
router.put('/password', requireAuth(), authController.changePassword);

// 发送密码重置邮件
router.post('/password/reset', authController.requestPasswordReset);

// 重置密码
router.post('/password/reset/confirm', authController.resetPassword);

// 发送验证邮件
router.post('/email/verify', requireAuth(), authController.sendVerificationEmail);

// 验证邮箱
router.post('/email/verify/confirm', authController.verifyEmail);

// 获取登录设备列表
router.get('/devices', requireAuth(), authController.getDevices);

// 移除设备
router.delete('/devices/:deviceId', requireAuth(), authController.removeDevice);

export default router;
```

### 6.2 响应格式

```typescript
// 登录成功
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 123,
    "username": "admin",
    "email": "admin@example.com",
    "groupId": 1,
    "roles": ["super_admin"],
    "avatar": "https://cdn.example.com/avatars/123/middle.jpg"
  }
}

// 需要二次验证
{
  "requires2FA": true,
  "tempToken": "temp_abc123..."
}

// 错误响应
{
  "error": "Unauthorized",
  "message": "用户名或密码错误",
  "code": "INVALID_CREDENTIALS"
}
```

---

## 7. 安全策略

### 7.1 速率限制

```typescript
// src/middleware/rate-limit.ts
import Redis from 'ioredis';
import { Context, Next } from 'koa';

const redis = new Redis();

export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}) {
  return async (ctx: Context, next: Next) => {
    const key = `rate_limit:${options.keyPrefix}:${ctx.ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(options.windowMs / 1000));
    }

    if (current > options.maxRequests) {
      ctx.status = 429;
      ctx.body = {
        error: 'Too Many Requests',
        message: '请求过于频繁，请稍后再试',
        retryAfter: await redis.ttl(key),
      };
      return;
    }

    ctx.set('X-RateLimit-Limit', options.maxRequests.toString());
    ctx.set('X-RateLimit-Remaining', (options.maxRequests - current).toString());

    await next();
  };
}

// 使用
router.post('/login',
  rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'login' }),
  authController.login
);
```

### 7.2 登录失败处理

```typescript
// 登录失败后锁定账户
export class LoginProtection {
  async checkLoginAttempts(identifier: string): Promise<boolean> {
    const key = `login_attempts:${identifier}`;
    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts) >= 5) {
      const ttl = await redis.ttl(key);
      throw new TooManyAttemptsError(`登录失败次数过多，请${Math.ceil(ttl / 60)}分钟后再试`);
    }

    return true;
  }

  async recordFailure(identifier: string): Promise<void> {
    const key = `login_attempts:${identifier}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      await redis.expire(key, 15 * 60); // 15分钟
    }

    if (attempts >= 5) {
      // 可选：发送邮件通知
      await this.sendSecurityAlert(identifier);
    }
  }

  async clearAttempts(identifier: string): Promise<void> {
    await redis.del(`login_attempts:${identifier}`);
  }
}
```

### 7.3 Token 黑名单

```typescript
// 用于主动失效 Token（如用户修改密码后）
export class TokenBlacklist {
  async add(token: string, expiresIn: number): Promise<void> {
    const jti = jwtService.decode(token)?.jti;
    if (jti) {
      await redis.setex(`blacklist:${jti}`, expiresIn, '1');
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const jti = jwtService.decode(token)?.jti;
    if (!jti) return false;
    return !!(await redis.exists(`blacklist:${jti}`));
  }
}
```

### 7.4 HTTPS 与 Cookie 安全

```typescript
// src/config/security.ts
export const securityConfig = {
  // Cookie 设置
  cookie: {
    httpOnly: true,      // 防止 XSS
    secure: true,        // 仅 HTTPS
    sameSite: 'strict',  // 防止 CSRF
    domain: '.example.com',
    maxAge: 24 * 3600 * 1000,
  },

  // CORS
  cors: {
    origin: ['https://example.com'],
    credentials: true,
  },

  // Helmet 安全头
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
};
```

---

## 8. 前端集成

### 8.1 React 认证 Hook

```typescript
// src/hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }), // 不同步 accessToken，使用内存
    }
  )
);

// 自动刷新 Token
export function useAuthInit() {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!accessToken && refreshToken) {
      // 尝试刷新
      refreshTokens().then(setAuth).catch(clearAuth);
    }
  }, [accessToken, refreshToken]);

  // Axios 拦截器
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [accessToken]);

  // 响应拦截器 - 自动刷新
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && refreshToken) {
          try {
            const tokens = await refreshTokens();
            setAuth(tokens, useAuthStore.getState().user!);
            error.config.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return api.request(error.config);
          } catch {
            clearAuth();
            window.location.href = '/login';
          }
        }
        throw error;
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);
}
```

### 8.2 权限 Hook

```typescript
// src/hooks/usePermission.ts
export function usePermission(permission: Permission, forumId?: number) {
  const { user } = useAuthStore();

  const [can, setCan] = useState(false);

  useEffect(() => {
    if (!user) {
      setCan(false);
      return;
    }

    // 简单检查（后端二次验证）
    const hasPerm = user.roles.includes('super_admin') ||
      user.permissions?.includes(permission);

    setCan(hasPerm);
  }, [user, permission]);

  return can;
}

// 使用
function PostButton({ forumId }: { forumId: number }) {
  const canPost = usePermission(Permission.FORUM_POST, forumId);

  if (!canPost) {
    return <LockOutlined /> 您没有发帖权限;
  }

  return <Button>发布主题</Button>;
}
```

---

## 9. 配置文件

### 9.1 环境变量

```bash
# .env
NODE_ENV=production

# 数据库
DATABASE_URL="mysql://user:password@localhost:3306/forum"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT 密钥 (生产环境必须使用强随机密钥)
JWT_ACCESS_SECRET="your-access-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"

# JWT 过期时间
JWT_ACCESS_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="30d"

# 前端 URL
FRONTEND_URL="https://example.com"

# 邮件
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@example.com"
SMTP_PASS="password"
SMTP_FROM="论坛 <noreply@example.com>"

# CDN
CDN_URL="https://cdn.example.com"

# 文件上传
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif"
```

---

## 10. 迁移检查清单

### 数据迁移
- [ ] 迁移 `uc_members` 到 `users` 表
- [ ] 迁移用户组数据
- [ ] 迁移管理员权限
- [ ] 迁移版主关系
- [ ] 备份原始数据

### 功能实现
- [ ] JWT 认证中间件
- [ ] 密码加密与迁移
- [ ] Token 刷新机制
- [ ] Redis 会话管理
- [ ] 设备管理
- [ ] 登录日志
- [ ] 速率限制
- [ ] 邮件验证

### 测试
- [ ] 登录/注册流程
- [ ] Token 刷新
- [ ] 密码修改
- [ ] 邮箱验证
- [ ] 多设备管理
- [ ] 权限检查
- [ ] 速率限制
- [ ] 旧密码迁移

### 安全
- [ ] HTTPS 启用
- [ ] Cookie 安全设置
- [ ] CORS 配置
- [ ] CSRF 防护
- [ ] XSS 防护
- [ ] SQL 注入防护 (Prisma)
- [ ] 敏感信息日志过滤

---

## 11. 参考资料

| 文档 | 说明 |
|------|------|
| `02-ucenter-replacement.md` | UCenter 替换方案 |
| `02-bbs-core/permission-system.md` | 原权限系统分析 |
| [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519) | JWT 标准 |
| [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 认证安全最佳实践 |
