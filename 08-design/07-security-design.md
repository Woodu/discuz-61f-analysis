# 安全策略设计

> **全栈安全防护方案**
>
> **设计时间**: 2026-02-07

---

## 1. 安全原则

### 1.1 纵深防御

- 多层防护：网络层 → 应用层 → 数据层
- 最小权限原则：默认拒绝，显式授权
- 纵深防御：即使一层失效，其他层仍能保护

### 1.2 安全开发生命周期

```
需求分析 → 设计 → 开发 → 测试 → 部署 → 运维
   ↓        ↓      ↓      ↓       ↓       ↓
  安全需求  威胁建模 安全编码 安全扫描 安全配置 监控响应
```

---

## 2. 认证安全

### 2.1 密码策略

#### 密码要求

```typescript
// 密码强度验证
export interface PasswordPolicy {
  minLength: 8;           // 最小长度
  maxLength: 32;          // 最大长度
  requireUppercase: true;  // 必须包含大写
  requireLowercase: true;  // 必须包含小写
  requireNumber: true;     // 必须包含数字
  requireSpecial: false;   // 可选特殊字符
  preventCommon: true;     // 禁止常见密码
  preventUserInfo: true;   // 禁止包含用户信息
}

// 密码强度检测
export function checkPasswordStrength(password: string, user?: { username: string; email: string }): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < 8) {
    issues.push('密码长度至少8位');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // 复杂度检查
  if (!/[A-Z]/.test(password)) issues.push('需包含大写字母');
  else score += 1;
  if (!/[a-z]/.test(password)) issues.push('需包含小写字母');
  else score += 1;
  if (!/[0-9]/.test(password)) issues.push('需包含数字');
  else score += 1;
  if (!/[^A-Za-z0-9]/.test(password)) {
    // issues.push('建议包含特殊字符');
  } else {
    score += 1;
  }

  // 用户信息检查
  if (user) {
    if (password.toLowerCase().includes(user.username.toLowerCase())) {
      issues.push('不能包含用户名');
      score = Math.max(0, score - 2);
    }
    if (password.toLowerCase().includes(user.email.split('@')[0].toLowerCase())) {
      issues.push('不能包含邮箱前缀');
      score = Math.max(0, score - 2);
    }
  }

  // 常见密码检查
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    issues.push('该密码过于简单');
    score = 0;
  }

  // 重复字符检查
  if (/(.)\1{2,}/.test(password)) {
    issues.push('包含过多重复字符');
    score = Math.max(0, score - 1);
  }

  return {
    strength: score >= 4 ? 'strong' : score >= 2 ? 'medium' : 'weak',
    score: Math.min(5, score),
    issues,
  };
}

// 常见弱密码列表（示例）
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'abc123',
  'password123', 'admin123', 'welcome123',
  // ... 更多常见密码
];
```

#### 密码存储

```typescript
// 使用 Argon2id 哈希算法
import argon2 from 'argon2';

export class PasswordService {
  // 哈希配置
  private static readonly HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536,      // 64 MB
    timeCost: 3,            // 迭代次数
    parallelism: 4,         // 并行度
  };

  // 哈希密码
  static async hash(password: string): Promise<string> {
    return argon2.hash(password, this.HASH_OPTIONS);
  }

  // 验证密码
  static async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  // 检查密码是否需要重新哈希（当算法参数更新时）
  static async needsRehash(hash: string): Promise<boolean> {
    return await argon2.needsRehash(hash, this.HASH_OPTIONS);
  }
}
```

### 2.2 JWT 安全

#### Token 配置

```typescript
// src/backend/config/jwt.config.ts
export const JWT_CONFIG = {
  // Access Token
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: '15m',          // 短期有效
    algorithm: 'RS256' as const, // 使用非对称加密
  },

  // Refresh Token
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: '7d',           // 长期有效
    algorithm: 'HS256' as const,
  },

  // Token 轮换（每次刷新生成新的 refresh token）
  rotateTokens: true,
};
```

#### Token 签发

```typescript
// src/backend/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  // 生成 Access Token
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.accessToken.secret, {
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
      algorithm: JWT_CONFIG.accessToken.algorithm,
      issuer: 'poketb-forum',
      audience: 'poketb-api',
      subject: payload.userId.toString(),
      jwtid: crypto.randomUUID(), // JWT ID，用于吊销
    });
  }

  // 生成 Refresh Token
  static generateRefreshToken(userId: number): string {
    const tokenId = crypto.randomUUID();
    const token = jwt.sign(
      { userId, tokenId },
      JWT_CONFIG.refreshToken.secret,
      {
        expiresIn: JWT_CONFIG.refreshToken.expiresIn,
        algorithm: JWT_CONFIG.refreshToken.algorithm,
        jwtid: tokenId,
      }
    );

    // 存储 refresh token 到数据库/Redis
    await Redis.set(
      `refresh_token:${userId}:${tokenId}`,
      '1',
      'EX',
      7 * 24 * 60 * 60 // 7天
    );

    return token;
  }

  // 验证 Access Token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_CONFIG.accessToken.secret, {
        algorithms: [JWT_CONFIG.accessToken.algorithm],
        issuer: 'poketb-forum',
        audience: 'poketb-api',
      }) as TokenPayload;
    } catch {
      return null;
    }
  }

  // 吊销 Token（用于登出）
  static async revokeToken(jti: string, exp: number): Promise<void> {
    // 将 token ID 加入黑名单，过期时间为 token 剩余有效期
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await Redis.set(`token_blacklist:${jti}`, '1', 'EX', ttl);
    }
  }

  // 检查 token 是否被吊销
  static async isTokenRevoked(jti: string): Promise<boolean> {
    return await Redis.exists(`token_blacklist:${jti}`) === 1;
  }
}
```

### 2.3 多因素认证（MFA）

#### TOTP 配置

```typescript
// src/backend/services/mfa.service.ts
import { authenticator } from 'otplib';

export class MFAService {
  // 生成 TOTP 密钥
  static generateSecret(username: string): {
    secret: string;
    qrCode: string;
  } {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      username,
      'PokeTB Forum',
      secret
    );

    return {
      secret,
      qrCode: otpauthUrl,
    };
  }

  // 验证 TOTP 代码
  static verifyTOTP(secret: string, token: string): boolean {
    return authenticator.verify({
      token,
      secret,
      window: 2, // 允许时间偏差
    });
  }

  // 生成备用恢复码
  static generateRecoveryCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex'));
    }
    return codes;
  }
}
```

### 2.4 会话管理

#### 会话配置

```typescript
// src/backend/config/session.config.ts
export const SESSION_CONFIG = {
  // Cookie 设置
  cookie: {
    name: 'session_id',
    httpOnly: true,          // 防止 XSS
    secure: true,            // 仅 HTTPS
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  },

  // 会话存储（Redis）
  store: 'redis',
  ttl: 24 * 60 * 60,         // 24秒

  // 会话安全
  rolling: true,             // 滚动更新过期时间
  resave: false,
  saveUninitialized: false,

  // 指纹验证（防止会话劫持）
  validateFingerprint: true,
};
```

---

## 3. 授权安全

### 3.1 RBAC 权限模型

```typescript
// src/backend/types/permission.ts

// 权限定义
export enum Permission {
  // 论坛权限
  FORUM_VIEW = 'forum:view',
  FORUM_READ = 'forum:read',
  FORUM_POST = 'forum:post',
  FORUM_REPLY = 'forum:reply',
  FORUM_EDIT = 'forum:edit',
  FORUM_DELETE = 'forum:delete',

  // 主题权限
  THREAD_CREATE = 'thread:create',
  THREAD_EDIT_OWN = 'thread:edit:own',
  THREAD_EDIT_ANY = 'thread:edit:any',
  THREAD_DELETE_OWN = 'thread:delete:own',
  THREAD_DELETE_ANY = 'thread:delete:any',
  THREAD_STICKY = 'thread:sticky',
  THREAD_DIGEST = 'thread:digest',
  THREAD_CLOSE = 'thread:close',
  THREAD_MOVE = 'thread:move',

  // 版主权限
  MOD_THREADS = 'mod:threads',
  MOD_POSTS = 'mod:posts',
  MOD_USERS = 'mod:users',
  MOD_LOGS = 'mod:logs',

  // 管理员权限
  ADMIN_ALL = 'admin:*',
  ADMIN_USERS = 'admin:users',
  ADMIN_FORUMS = 'admin:forums',
  ADMIN_PLUGINS = 'admin:plugins',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_LOGS = 'admin:logs',

  // Pokemon 权限
  POKEMON_VIEW = 'pokemon:view',
  POKEMON_PLAY = 'pokemon:play',
  POKEMON_TRADE = 'pokemon:trade',
  POKEMON_BATTLE = 'pokemon:battle',

  // 银行权限
  BANK_VIEW = 'bank:view',
  BANK_DEPOSIT = 'bank:deposit',
  BANK_WITHDRAW = 'bank:withdraw',
  BANK_TRANSFER = 'bank:transfer',
}

// 用户组权限映射
export const GROUP_PERMISSIONS: Record<UserGroupId, Permission[]> = {
  // 游客
  [UserGroupId.GUEST]: [
    Permission.FORUM_VIEW,
    Permission.FORUM_READ,
    Permission.POKEMON_VIEW,
  ],

  // 普通会员
  [UserGroupId.MEMBER]: [
    Permission.FORUM_VIEW,
    Permission.FORUM_READ,
    Permission.FORUM_POST,
    Permission.FORUM_REPLY,
    Permission.THREAD_CREATE,
    Permission.THREAD_EDIT_OWN,
    Permission.THREAD_DELETE_OWN,
    Permission.POKEMON_VIEW,
    Permission.POKEMON_PLAY,
    Permission.POKEMON_BATTLE,
    Permission.BANK_VIEW,
    Permission.BANK_DEPOSIT,
    Permission.BANK_WITHDRAW,
    Permission.BANK_TRANSFER,
  ],

  // 版主
  [UserGroupId.MODERATOR]: [
    // 继承会员权限
    ...GROUP_PERMISSIONS[UserGroupId.MEMBER],
    // 版主权限
    Permission.MOD_THREADS,
    Permission.MOD_POSTS,
    Permission.MOD_USERS,
    Permission.MOD_LOGS,
    Permission.THREAD_EDIT_ANY,
    Permission.THREAD_DELETE_ANY,
    Permission.THREAD_STICKY,
    Permission.THREAD_DIGEST,
    Permission.THREAD_CLOSE,
    Permission.THREAD_MOVE,
  ],

  // 超级版主
  [UserGroupId.SUPER_MODERATOR]: [
    ...GROUP_PERMISSIONS[UserGroupId.MODERATOR],
  ],

  // 管理员
  [UserGroupId.ADMIN]: [
    Permission.ADMIN_ALL,
  ],
};
```

### 3.2 权限检查中间件

```typescript
// src/backend/middleware/permission.middleware.ts
import { Context } from 'koa';

export function requirePermission(permission: Permission) {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录',
        },
      };
      return;
    }

    // 检查权限
    const hasPermission = await checkUserPermission(user.id, permission);

    if (!hasPermission) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '权限不足',
        },
      };
      return;
    }

    // 检查版主权限（如果需要）
    if (permission.startsWith('mod:')) {
      const forumId = ctx.params.forumId || ctx.params.id;
      if (forumId) {
        const canModerate = await checkModeratorPermission(user.id, parseInt(forumId));
        if (!canModerate) {
          ctx.status = 403;
          ctx.body = {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '您没有管理该版块的权限',
            },
          };
          return;
        }
      }
    }

    await next();
  };
}

// 检查用户权限（带缓存）
async function checkUserPermission(userId: number, permission: Permission): Promise<boolean> {
  const cacheKey = `permission:${userId}:${permission}`;

  // 先从缓存读取
  const cached = await Redis.get(cacheKey);
  if (cached !== null) {
    return cached === '1';
  }

  // 从数据库查询
  const hasPermission = await db.userPermission.findFirst({
    where: {
      userId,
      permission,
    },
  });

  const result = !!hasPermission;

  // 缓存结果（5分钟）
  await Redis.set(cacheKey, result ? '1' : '0', 'EX', 300);

  return result;
}

// 检查版主权限
async function checkModeratorPermission(userId: number, forumId: number): Promise<boolean> {
  const cacheKey = `moderator:${userId}:${forumId}`;

  const cached = await Redis.get(cacheKey);
  if (cached !== null) {
    return cached === '1';
  }

  const moderator = await db.forumModerator.findFirst({
    where: {
      userId,
      forumId,
    },
  });

  const result = !!moderator;

  await Redis.set(cacheKey, result ? '1' : '0', 'EX', 300);

  return result;
}
```

### 3.3 资源级权限控制

```typescript
// src/backend/services/authorization.service.ts
export class AuthorizationService {
  // 检查用户是否可以编辑帖子
  static async canEditPost(userId: number, postId: number): Promise<boolean> {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        thread: {
          select: { forumId: true, isLocked: true },
        },
      },
    });

    if (!post) return false;
    if (post.thread.isLocked) return false;

    // 作者可以编辑自己的帖子
    if (post.authorId === userId) {
      // 检查是否有编辑自己帖子的权限
      return await checkUserPermission(userId, Permission.THREAD_EDIT_OWN);
    }

    // 管理员和版主可以编辑
    return await checkUserPermission(userId, Permission.THREAD_EDIT_ANY);
  }

  // 检查用户是否可以删除主题
  static async canDeleteThread(userId: number, threadId: number): Promise<boolean> {
    const thread = await db.thread.findUnique({
      where: { id: threadId },
      select: {
        authorId: true,
        forumId: true,
        isDigest: true,
      },
    });

    if (!thread) return false;

    // 精华帖不能被普通用户删除
    if (thread.isDigest && thread.authorId === userId) {
      return false;
    }

    // 作者可以删除自己的主题
    if (thread.authorId === userId) {
      return await checkUserPermission(userId, Permission.THREAD_DELETE_OWN);
    }

    // 管理员和版主可以删除
    return await checkUserPermission(userId, Permission.THREAD_DELETE_ANY);
  }

  // 检查用户是否可以在版块发帖
  static async canPostInForum(userId: number, forumId: number): Promise<boolean> {
    // 基础权限检查
    const hasPermission = await checkUserPermission(userId, Permission.FORUM_POST);
    if (!hasPermission) return false;

    // 检查版块特定限制
    const forum = await db.forum.findUnique({
      where: { id: forumId },
      select: {
        allowPost: true,
        allowGroupIds: true,
      },
    });

    if (!forum || !forum.allowPost) return false;

    // 检查用户组限制
    if (forum.allowGroupIds && forum.allowGroupIds.length > 0) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { groupId: true },
      });

      if (!forum.allowGroupIds.includes(user!.groupId)) {
        return false;
      }
    }

    return true;
  }
}
```

---

## 4. 数据安全

### 4.1 敏感数据加密

```typescript
// src/backend/services/encryption.service.ts
import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = Buffer.from(
    process.env.ENCRYPTION_KEY!,
    'hex'
  );
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;
  private static readonly TAG_LENGTH = 16;

  // 加密数据
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const salt = crypto.randomBytes(this.SALT_LENGTH);

    // 派生密钥
    const key = crypto.pbkdf2Sync(
      this.KEY,
      salt,
      100000,
      32,
      'sha256'
    );

    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      key,
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // 组合: salt + iv + authTag + encrypted
    return salt.toString('hex') +
           iv.toString('hex') +
           authTag.toString('hex') +
           encrypted;
  }

  // 解密数据
  static decrypt(encryptedText: string): string {
    const salt = Buffer.from(
      encryptedText.slice(0, this.SALT_LENGTH * 2),
      'hex'
    );
    const iv = Buffer.from(
      encryptedText.slice(this.SALT_LENGTH * 2, (this.SALT_LENGTH + this.IV_LENGTH) * 2),
      'hex'
    );
    const authTag = Buffer.from(
      encryptedText.slice((this.SALT_LENGTH + this.IV_LENGTH) * 2, (this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH) * 2),
      'hex'
    );
    const encrypted = encryptedText.slice((this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH) * 2);

    // 派生密钥
    const key = crypto.pbkdf2Sync(
      this.KEY,
      salt,
      100000,
      32,
      'sha256'
    );

    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      key,
      iv
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // 哈希敏感字段（用于搜索，不可逆）
  static hashField(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value + process.env.HASH_SALT!)
      .digest('hex');
  }
}
```

### 4.2 PII 数据处理

```typescript
// src/backend/services/pii.service.ts
export class PIIService {
  // 脱敏显示
  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2
      ? local.slice(0, 2) + '*'.repeat(local.length - 2)
      : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
  }

  static maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  static maskIP(ip: string): string {
    if (ip.includes(':')) {
      // IPv6
      const parts = ip.split(':');
      return parts.slice(0, 3).join(':') + ':****:****';
    }
    // IPv4
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.***.***`;
  }

  // 日志中的敏感信息过滤
  static sanitizeLogData(data: any): any {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'email',
      'phone',
      'idCard',
    ];

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field =>
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeLogData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
```

### 4.3 数据库安全

```typescript
// prisma/schema.prisma - 安全相关配置

// 1. 敏感字段加密
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  // 使用 @map 将敏感字段映射到不同的列名
  password  String  @map("pwd_hash")  // 列名混淆

  @@map("users")
}

// 2. 审计日志
model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  action    String   // CREATE/UPDATE/DELETE
  resource  String   // user/thread/post
  resourceId Int
  changes   Json?    // 变更内容
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@map("audit_logs")
}

// 3. 软删除支持
model Thread {
  id        Int      @id @default(autoincrement())
  title     String
  deletedAt DateTime? // 软删除时间戳

  @@index([deletedAt])
  @@map("threads")
}
```

---

## 5. 通信安全

### 5.1 HTTPS 配置

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.poketb.com;

    # SSL 证书
    ssl_certificate /etc/ssl/certs/poketb.crt;
    ssl_certificate_key /etc/ssl/private/poketb.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 其他安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss://api.poketb.com;" always;
}
```

### 5.2 CORS 配置

```typescript
// src/backend/config/cors.config.ts
export const CORS_CONFIG = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://poketb.com',
      'https://www.poketb.com',
    ];

    // 开发环境允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // 无 origin（同源请求）或允许的 origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('CORS not allowed'));
  },

  credentials: true,          // 允许携带 Cookie

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],

  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  maxAge: 86400,              // 预检请求缓存时间（秒）
};
```

---

## 6. 输入验证

### 6.1 请求验证 Schema

```typescript
// src/backend/schemas/validation.schema.ts
import { z } from 'zod';

// 用户注册验证
export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .refine(async (username) => {
      const exists = await db.user.findUnique({ where: { username } });
      return !exists;
    }, '用户名已存在'),

  email: z.string()
    .email('邮箱格式不正确')
    .refine(async (email) => {
      const exists = await db.user.findUnique({ where: { email } });
      return !exists;
    }, '邮箱已被注册'),

  password: z.string()
    .min(8, '密码至少8个字符')
    .max(32, '密码最多32个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字'),

  captcha: z.string().min(1, '请输入验证码'),
  captchaKey: z.string(),
});

// 发帖验证
export const createThreadSchema = z.object({
  title: z.string()
    .min(5, '标题至少5个字符')
    .max(100, '标题最多100个字符')
    .trim(),

  content: z.string()
    .min(10, '内容至少10个字符')
    .max(50000, '内容最多50000字符'),

  forumId: z.number().int().positive(),

  tags: z.array(z.string().max(20)).max(5, '最多5个标签').optional(),

  attachmentIds: z.array(z.number().int().positive()).optional(),
});

// 搜索验证
export const searchSchema = z.object({
  q: z.string()
    .min(2, '搜索关键词至少2个字符')
    .max(100, '搜索关键词最多100字符')
    .transform(val => val.trim()),

  type: z.enum(['all', 'thread', 'post', 'user', 'pokemon']).default('all'),

  page: z.number().int().positive().default(1),

  pageSize: z.number().int().positive().max(100).default(20),
});
```

### 6.2 XSS 防护

```typescript
// src/backend/services/sanitization.service.ts
import * as sanitizeHtml from 'sanitize-html';

export class SanitizationService {
  // HTML 净化（用于富文本）
  static sanitizeHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class', 'id'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {
        a: ['http', 'https', 'mailto'],
        img: ['http', 'https', 'data'],
      },
      selfClosing: ['br', 'img'],
    });
  }

  // BBCode 转换为安全 HTML
  static bbcodeToHtml(bbcode: string): string {
    let html = bbcode;

    // 危险标签过滤
    html = html.replace(/\[javascript\].*?\[\/javascript\]/gis, '');
    html = html.replace(/\[script\].*?\[\/script\]/gis, '');
    html = html.replace(/\[iframe\].*?\[\/iframe\]/gis, '');

    // URL 白名单验证
    html = html.replace(/\[url\](.*?)\[\/url\]/gi, (match, url) => {
      if (this.isUrlSafe(url)) {
        return `<a href="${this.encodeHtml(url)}" target="_blank" rel="noopener noreferrer">${this.encodeHtml(url)}</a>`;
      }
      return this.encodeHtml(match);
    });

    // 基本 BBCode 转换...
    // （这里简化，实际需要完整的 BBCode 解析器）

    return this.sanitizeHtml(html);
  }

  // URL 安全检查
  static isUrlSafe(url: string): boolean {
    try {
      const parsed = new URL(url);
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return false;
      }

      // 防止内网访问
      const hostname = parsed.hostname;
      const privatePatterns = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^localhost$/i,
      ];

      return !privatePatterns.some(pattern => pattern.test(hostname));
    } catch {
      return false;
    }
  }

  // HTML 实体编码
  static encodeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}
```

### 6.3 SQL 注入防护

```typescript
// Prisma 自动处理 SQL 注入
// 所有查询都使用参数化查询

// ❌ 错误：直接拼接 SQL（不要这样做）
const unsafeQuery = `SELECT * FROM users WHERE username = '${username}'`;

// ✅ 正确：使用 Prisma 参数化查询
const safeQuery = db.user.findMany({
  where: {
    username: username, // Prisma 自动转义
  },
});

// 原始查询时使用参数化
const result = await prisma.$queryRaw`
  SELECT * FROM users
  WHERE username = ${username}
  AND created_at > ${since}
`;
```

---

## 7. 文件上传安全

### 7.1 文件验证

```typescript
// src/backend/services/upload.service.ts
import { extname, basename } from 'path';
import { createHash } from 'crypto';

export class UploadService {
  // 允许的文件类型
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // 允许的文件扩展名
  private static readonly ALLOWED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf',
    '.doc', '.docx',
  ];

  // 文件大小限制（字节）
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // 图片大小限制
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  async uploadFile(
    file: File,
    userId: number
  ): Promise<Attachment> {
    // 1. 验证文件大小
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }

    // 2. 验证 MIME 类型
    const detectedMime = await this.detectMimeType(file);
    if (!this.ALLOWED_MIME_TYPES.includes(detectedMime)) {
      throw new Error('INVALID_FILE_TYPE');
    }

    // 3. 验证文件扩展名
    const ext = extname(file.name).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error('INVALID_FILE_EXTENSION');
    }

    // 4. MIME 与扩展名一致性检查
    if (!this.isMimeTypeConsistent(detectedMime, ext)) {
      throw new Error('MIME_MISMATCH');
    }

    // 5. 图片特殊处理
    if (detectedMime.startsWith('image/')) {
      await this.validateImage(file);
    }

    // 6. 病毒扫描（集成 ClamAV 等）
    await this.scanForViruses(file);

    // 7. 生成安全文件名
    const safeFilename = this.generateSafeFilename(file.name, userId);

    // 8. 计算文件哈希
    const hash = await this.calculateFileHash(file);

    // 9. 存储文件（OSS/本地）
    const url = await this.storeFile(file, safeFilename);

    // 10. 保存到数据库
    return await db.attachment.create({
      data: {
        filename: safeFilename,
        originalName: basename(file.name),
        size: file.size,
        mimeType: detectedMime,
        url,
        hash,
        uploadedBy: userId,
      },
    });
  }

  // 检测真实 MIME 类型
  private async detectMimeType(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer.slice(0, 12));

    // 文件签名检测
    const signatures: Record<string, RegExp> = {
      'image/jpeg': /^FF D8 FF/,
      'image/png': /^89 50 4E 47/,
      'image/gif': /^47 49 46/,
      'image/webp': /^52 49 46 46/,
      'application/pdf': /^25 50 44 46/,
    };

    const hex = Array.from(uint8)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    for (const [mime, pattern] of Object.entries(signatures)) {
      if (pattern.test(hex)) {
        return mime;
      }
    }

    return file.type;
  }

  // MIME 与扩展名一致性检查
  private isMimeTypeConsistent(mime: string, ext: string): boolean {
    const mimeExtMap: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    };

    return mimeExtMap[mime]?.includes(ext) ?? false;
  }

  // 图片验证
  private async validateImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // 检查图片尺寸
        if (img.width > 10000 || img.height > 10000) {
          reject(new Error('IMAGE_TOO_LARGE'));
          return;
        }

        // 检查图片大小
        if (file.size > this.MAX_IMAGE_SIZE) {
          reject(new Error('IMAGE_TOO_LARGE'));
          return;
        }

        resolve();
      };

      img.onerror = () => reject(new Error('INVALID_IMAGE'));

      img.src = URL.createObjectURL(file);
    });
  }

  // 病毒扫描
  private async scanForViruses(file: File): Promise<void> {
    // 集成 ClamAV 或其他杀毒软件
    const clamscan = require('clamscan.js');

    const clamscanInstance = await new clamscan().init();
    const result = await clamscanInstance.scanFile(file.path);

    if (result.isInfected) {
      throw new Error('FILE_INFECTED');
    }
  }

  // 生成安全文件名
  private generateSafeFilename(originalName: string, userId: number): string {
    const ext = extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${userId}_${timestamp}_${random}${ext}`;
  }

  // 计算文件哈希（用于重复检测）
  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    return createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  }

  // 存储文件
  private async storeFile(file: File, filename: string): Promise<string> {
    // 使用 OSS 或本地存储
    if (process.env.OSS_ENABLED === 'true') {
      return await this.storeToOSS(file, filename);
    }
    return await this.storeLocally(file, filename);
  }
}
```

### 7.2 文件访问控制

```typescript
// 访问控制的中间件
export async function checkFileAccess(ctx: Context, next: Next) {
  const attachmentId = parseInt(ctx.params.id);

  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      thread: {
        select: {
          forumId: true,
        },
      },
    },
  });

  if (!attachment) {
    ctx.status = 404;
    return;
  }

  // 检查权限
  const user = ctx.state.user;

  // 公开附件：所有人可访问
  if (attachment.isPublic) {
    return await next();
  }

  // 登录用户可访问
  if (user) {
    return await next();
  }

  // 附件所属主题的版块权限检查
  if (attachment.thread) {
    const canAccess = await checkUserPermission(
      user?.id,
      Permission.FORUM_READ,
      attachment.thread.forumId
    );

    if (canAccess) {
      return await next();
    }
  }

  ctx.status = 403;
}
```

---

## 8. 速率限制

### 8.1 速率限制配置

```typescript
// src/backend/middleware/rate-limit.middleware.ts
import Redis from 'ioredis';
import { isLocalIp } from '../utils/ip';

export interface RateLimitConfig {
  windowMs: number;      // 时间窗口（毫秒）
  maxRequests: number;   // 最大请求数
  keyPrefix: string;     // Redis 键前缀
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean;     // 是否跳过失败请求
}

// 速率限制器
export function rateLimit(config: RateLimitConfig) {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  });

  return async (ctx: Context, next: Next) => {
    // 跳过本地 IP
    if (isLocalIp(ctx.ip)) {
      return await next();
    }

    const key = `${config.keyPrefix}:${ctx.ip}`;

    // 获取当前计数
    const current = await redis.incr(key);

    if (current === 1) {
      // 设置过期时间
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    // 设置响应头
    ctx.set('X-RateLimit-Limit', config.maxRequests.toString());
    ctx.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current).toString());
    ctx.set('X-RateLimit-Reset', (Date.now() + config.windowMs).toString());

    // 检查是否超限
    if (current > config.maxRequests) {
      const ttl = await redis.ttl(key);
      ctx.set('Retry-After', ttl.toString());

      ctx.status = 429;
      ctx.body = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求过于频繁，请稍后再试',
          retryAfter: ttl,
        },
      };
      return;
    }

    await next();
  };
}

// 预定义的限制规则
export const RateLimitRules = {
  // 登录/注册：严格限制
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    keyPrefix: 'rate_limit:auth',
  }),

  // 发帖/回复：中等限制
  post: rateLimit({
    windowMs: 5 * 60 * 1000, // 5分钟
    maxRequests: 10,
    keyPrefix: 'rate_limit:post',
  }),

  // 短消息：中等限制
  pm: rateLimit({
    windowMs: 10 * 60 * 1000, // 10分钟
    maxRequests: 20,
    keyPrefix: 'rate_limit:pm',
  }),

  // 搜索：宽松限制
  search: rateLimit({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 30,
    keyPrefix: 'rate_limit:search',
  }),

  // API通用限制
  api: rateLimit({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    keyPrefix: 'rate_limit:api',
  }),
};
```

### 8.2 用户级速率限制

```typescript
// 基于用户的速率限制
export function userRateLimit(config: RateLimitConfig) {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  });

  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      // 未登录用户使用 IP 限制
      return rateLimit(config)(ctx, next);
    }

    const key = `${config.keyPrefix}:user:${user.id}`;

    // 获取当前计数
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    // 检查 VIP 用户（更高限制）
    let maxRequests = config.maxRequests;
    if (user.groupId === UserGroupId.VIP) {
      maxRequests *= 2;
    } else if (user.groupId === UserGroupId.ADMIN) {
      maxRequests = Infinity; // 管理员无限制
    }

    if (current > maxRequests && maxRequests !== Infinity) {
      const ttl = await redis.ttl(key);
      ctx.set('Retry-After', ttl.toString());

      ctx.status = 429;
      ctx.body = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求过于频繁，请稍后再试',
        },
      };
      return;
    }

    await next();
  };
}
```

---

## 9. 安全日志

### 9.1 安全事件日志

```typescript
// src/backend/services/security-logger.service.ts
export enum SecurityEventType {
  // 认证事件
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_FAILED = 'MFA_FAILED',

  // 授权事件
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',

  // 数据事件
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETION = 'DATA_DELETION',

  // 攻击事件
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',

  // 文件事件
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_DELETE = 'FILE_DELETE',

  // 管理事件
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_ACTION = 'ADMIN_ACTION',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
}

export class SecurityLogger {
  // 记录安全事件
  static async log(
    type: SecurityEventType,
    data: {
      userId?: number;
      ip?: string;
      userAgent?: string;
      details?: Record<string, any>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<void> {
    await db.securityLog.create({
      data: {
        type,
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
        details: data.details || {},
        severity: data.severity || this.getSeverity(type),
        createdAt: new Date(),
      },
    });

    // 高危事件实时告警
    if (data.severity === 'critical' || data.severity === 'high') {
      await this.sendAlert(type, data);
    }
  }

  // 获取事件严重级别
  private static getSeverity(type: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
    const critical = [
      SecurityEventType.ADMIN_LOGIN,
      SecurityEventType.PRIVILEGE_ESCALATION,
      SecurityEventType.SQL_INJECTION_ATTEMPT,
    ];

    const high = [
      SecurityEventType.BRUTE_FORCE_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.CSRF_ATTEMPT,
      SecurityEventType.DATA_DELETION,
    ];

    if (critical.includes(type)) return 'critical';
    if (high.includes(type)) return 'high';
    if (type.includes('FAILED')) return 'medium';
    return 'low';
  }

  // 发送告警
  private static async sendAlert(type: SecurityEventType, data: any): Promise<void> {
    // 发送到监控系统
    await sendToMonitoring({
      level: 'error',
      message: `Security Event: ${type}`,
      data,
    });

    // 发送邮件/短信通知管理员
    if (data.severity === 'critical') {
      await notifyAdmins({
        subject: `[CRITICAL] ${type}`,
        body: JSON.stringify(data, null, 2),
      });
    }
  }
}
```

### 9.2 审计日志

```typescript
// 记录所有敏感操作
export class AuditLogger {
  static async log(data: {
    userId: number;
    action: string;
    resource: string;
    resourceId: number;
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    };
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes,
        ipAddress: data.ip,
        userAgent: data.userAgent,
        createdAt: new Date(),
      },
    });
  }
}
```

---

## 10. 安全配置清单

### 10.1 环境变量

```bash
# .env.example

# JWT 密钥（使用 RSA 非对称加密）
JWT_ACCESS_SECRET=<RSA_PRIVATE_KEY>
JWT_REFRESH_SECRET=<strong_random_secret>

# 加密密钥
ENCRYPTION_KEY=<64_hex_chars_for_AES-256>
HASH_SALT=<random_salt_for_hashing>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<strong_password>

# 数据库
DATABASE_URL=mysql://user:password@localhost:3306/forum?ssl=true

# OSS
OSS_ACCESS_KEY=<access_key>
OSS_SECRET_KEY=<secret_key>
OSS_BUCKET=poketb-uploads

# 邮件
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@poketb.com
SMTP_PASS=<password>

# 安全
ALLOWED_ORIGINS=https://poketb.com,https://www.poketb.com
COOKIE_DOMAIN=.poketb.com
RATE_LIMIT_ENABLED=true

# 监控
SENTRY_DSN=<sentry_dsn>
```

### 10.2 部署前检查清单

- [ ] 所有密钥使用强随机生成
- [ ] 生产环境不使用默认密码
- [ ] 启用 HTTPS 并配置 HSTS
- [ ] 配置正确的 CORS
- [ ] 禁用 DEBUG 模式
- [ ] 配置 CSP 头
- [ ] 启用速率限制
- [ ] 配置日志监控
- [ ] 配置自动备份
- [ ] 测试恢复流程
- [ ] 配置防火墙规则
- [ ] 定期安全扫描

---

## 11. 安全检查清单总结

| 类别 | 检查项 |
|------|--------|
| **认证** | ✅ 密码强度要求<br>✅ Argon2id 哈希<br>✅ JWT 签发/验证<br>✅ Token 黑名单<br>✅ MFA 支持 |
| **授权** | ✅ RBAC 权限模型<br>✅ 资源级权限控制<br>✅ 版主权限隔离 |
| **数据** | ✅ 敏感数据加密<br>✅ PII 脱敏<br>✅ 审计日志 |
| **通信** | ✅ HTTPS/TLS 1.3<br>✅ HSTS<br>✅ CORS 配置<br>✅ CSP 头 |
| **输入** | ✅ 请求验证<br>✅ XSS 防护<br>✅ SQL 注入防护 |
| **文件** | ✅ MIME 类型验证<br>✅ 文件签名检测<br>✅ 病毒扫描<br>✅ 访问控制 |
| **限制** | ✅ 速率限制<br>✅ 用户级限制<br>✅ IP 黑名单 |
| **日志** | ✅ 安全事件日志<br>✅ 审计日志<br>✅ 异常告警 |

---

## 12. 下一步

- [ ] 项目脚手架搭建
- [ ] 缓存策略设计（可选）
