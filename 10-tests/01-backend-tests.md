# 后端测试用例规划

## 测试工具栈

### 核心测试框架
- **单元测试框架**: Jest 29.x
- **API 测试**: Supertest 6.x
- **HTTP 断言**: Chai + Chai HTTP
- **Mock 工具**: jest.mock, jest.fn()
- **覆盖率**: istanbul / Jest coverage

### 测试环境
- **测试数据库**: SQLite (内存) 或独立测试数据库
- **Redis Mock**: redis-mock 或 fakeredis
- **测试数据工厂**: faker.js + factories
- **测试 Runner**: Jest CLI + npm scripts

### 辅助工具
- **时间 Mock**: lolex / @sinonjs/fake-timers
- **HTTP Mock**: nock (外部服务)
- **WebSocket Mock**: socket.io-client / mock-socket
- **测试数据库清理**: database-cleaner

## 测试策略

### 测试金字塔
```
        /\
       /  \      E2E Tests (5%)
      /----\
     /      \    Integration Tests (25%)
    /--------\
   /          \  Unit Tests (70%)
  /------------\
```

### 测试覆盖率目标
- **总体覆盖率**: ≥ 80%
- **关键业务逻辑**: ≥ 90%
- **安全相关代码**: ≥ 95%
- **边界条件**: ≥ 85%

---

## 1. 认证与授权模块 (Auth)

### 单元测试

#### 密码服务 (PasswordService)
- [ ] **哈希密码 - 正常情况**
  - 描述: 使用 bcrypt 哈希用户密码
  - 输入: `{ password: "MySecureP@ssw0rd!" }`
  - 预期输出: 返回 60 字符的 bcrypt hash
  - 测试代码框架:
  ```typescript
  describe('PasswordService.hash', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'MySecureP@ssw0rd!';
      const hash = await passwordService.hash(password);
      expect(hash).toMatch(/^\$2[aby]?\$\d{2}\$.{53}$/);
      expect(hash).not.toBe(password);
      expect(hash.length).toBe(60);
    });
  });
  ```

- [ ] **哈希密码 - 空密码**
  - 描述: 尝试哈希空密码应抛出错误
  - 输入: `{ password: "" }`
  - 预期输出: 抛出 `ValidationError`
  - 测试代码框架:
  ```typescript
  it('should throw error for empty password', async () => {
    await expect(passwordService.hash(''))
      .rejects.toThrow(ValidationError);
  });
  ```

- [ ] **验证密码 - 正确密码**
  - 描述: 使用正确的密码验证哈希
  - 输入: `{ password: "MySecureP@ssw0rd!", hash: "<bcrypt-hash>" }`
  - 预期输出: 返回 `true`
  - 测试代码框架:
  ```typescript
  describe('PasswordService.verify', () => {
    it('should return true for correct password', async () => {
      const password = 'MySecureP@ssw0rd!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await passwordService.verify(password, hash);
      expect(isValid).toBe(true);
    });
  });
  ```

- [ ] **验证密码 - 错误密码**
  - 描述: 使用错误的密码验证哈希
  - 输入: `{ password: "WrongPassword", hash: "<bcrypt-hash>" }`
  - 预期输出: 返回 `false`
  - 测试代码框架:
  ```typescript
  it('should return false for incorrect password', async () => {
    const hash = await bcrypt.hash('CorrectPassword', 10);
    const isValid = await passwordService.verify('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
  ```

- [ ] **检查密码强度 - 强密码**
  - 描述: 验证强密码符合要求
  - 输入: `{ password: "MySecureP@ss123" }`
  - 预期输出: 返回 `{ valid: true, strength: 'strong', score: 4 }`
  - 测试代码框架:
  ```typescript
  describe('PasswordService.checkStrength', () => {
    it('should validate strong password', () => {
      const result = passwordService.checkStrength('MySecureP@ss123');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });
  });
  ```

- [ ] **检查密码强度 - 弱密码**
  - 描述: 检测弱密码并返回改进建议
  - 输入: `{ password: "123456" }`
  - 预期输出: 返回 `{ valid: false, strength: 'weak', suggestions: [...] }`
  - 测试代码框架:
  ```typescript
  it('should reject weak password', () => {
    const result = passwordService.checkStrength('123456');
    expect(result.valid).toBe(false);
    expect(result.strength).toBe('weak');
    expect(result.suggestions).toContain('至少包含8个字符');
    expect(result.suggestions).toContain('包含大写字母');
  });
  ```

- [ ] **检查密码强度 - 常见密码**
  - 描述: 检测常见密码
  - 输入: `{ password: "password" }`
  - 预期输出: 返回 `{ valid: false, inCommonList: true }`
  - 测试代码框架:
  ```typescript
  it('should detect common passwords', () => {
    const result = passwordService.checkStrength('password');
    expect(result.valid).toBe(false);
    expect(result.inCommonList).toBe(true);
  });
  ```

- [ ] **生成随机密码**
  - 描述: 生成符合要求的随机密码
  - 输入: `{ length: 16 }`
  - 预期输出: 返回 16 字符强密码
  - 测试代码框架:
  ```typescript
  describe('PasswordService.generate', () => {
    it('should generate secure random password', () => {
      const password = passwordService.generate(16);
      expect(password).toHaveLength(16);
      expect(passwordService.checkStrength(password).valid).toBe(true);
    });
  });
  ```

#### JWT 服务 (JWTService)
- [ ] **签发令牌 - 标准用户**
  - 描述: 为标准用户签发 JWT
  - 输入: `{ userId: 1, type: 'access' }`
  - 预期输出: 返回有效的 JWT token
  - 测试代码框架:
  ```typescript
  describe('JWTService.sign', () => {
    it('should sign JWT for user', async () => {
      const token = await jwtService.sign({ userId: 1 }, 'access');
      const decoded = jwt.decode(token) as any;
      expect(token).toBeTruthy();
      expect(decoded.userId).toBe(1);
      expect(decoded.type).toBe('access');
    });
  });
  ```

- [ ] **签发令牌 - 刷新令牌**
  - 描述: 签发刷新令牌（更长有效期）
  - 输入: `{ userId: 1, type: 'refresh' }`
  - 预期输出: 返回有效期为 7 天的 JWT
  - 测试代码框架:
  ```typescript
  it('should sign refresh token with longer expiry', async () => {
    const token = await jwtService.sign({ userId: 1 }, 'refresh');
    const decoded = jwt.decode(token) as any;
    const expiry = decoded.exp - decoded.iat;
    expect(expiry).toBe(7 * 24 * 60 * 60); // 7 days
  });
  ```

- [ ] **验证令牌 - 有效令牌**
  - 描述: 验证有效的 JWT
  - 输入: `{ token: "<valid-jwt>" }`
  - 预期输出: 返回解码的 payload
  - 测试代码框架:
  ```typescript
  describe('JWTService.verify', () => {
    it('should verify valid token', async () => {
      const token = await jwtService.sign({ userId: 1 }, 'access');
      const payload = await jwtService.verify(token);
      expect(payload.userId).toBe(1);
    });
  });
  ```

- [ ] **验证令牌 - 过期令牌**
  - 描述: 验证过期令牌应失败
  - 输入: `{ token: "<expired-jwt>" }`
  - 预期输出: 抛出 `TokenExpiredError`
  - 测试代码框架:
  ```typescript
  it('should throw error for expired token', async () => {
    const token = jwt.sign({ userId: 1 }, SECRET, { expiresIn: '0s' });
    await expect(jwtService.verify(token))
      .rejects.toThrow(TokenExpiredError);
  });
  ```

- [ ] **验证令牌 - 篡改令牌**
  - 描述: 验证被篡改的令牌应失败
  - 输入: `{ token: "<tampered-jwt>" }`
  - 预期输出: 抛出 `JsonWebTokenError`
  - 测试代码框架:
  ```typescript
  it('should throw error for tampered token', async () => {
    let token = await jwtService.sign({ userId: 1 }, 'access');
    token = token.slice(0, -10) + 'tampered';
    await expect(jwtService.verify(token))
      .rejects.toThrow(JsonWebTokenError);
  });
  ```

- [ ] **刷新令牌 - 正常流程**
  - 描述: 使用刷新令牌获取新的访问令牌
  - 输入: `{ refreshToken: "<valid-refresh-token>" }`
  - 预期输出: 返回新的访问令牌
  - 测试代码框架:
  ```typescript
  describe('JWTService.refresh', () => {
    it('should refresh access token', async () => {
      const refreshToken = await jwtService.sign({ userId: 1 }, 'refresh');
      const newToken = await jwtService.refresh(refreshToken);
      expect(newToken).toBeTruthy();
      const payload = await jwtService.verify(newToken);
      expect(payload.userId).toBe(1);
    });
  });
  ```

- [ ] **吊销令牌**
  - 描述: 将令牌加入黑名单
  - 输入: `{ token: "<jwt>" }`
  - 预期输出: 令牌被加入 Redis 黑名单
  - 测试代码框架:
  ```typescript
  describe('JWTService.revoke', () => {
    it('should revoke token', async () => {
      const token = await jwtService.sign({ userId: 1 }, 'access');
      await jwtService.revoke(token);
      await expect(jwtService.verify(token))
        .rejects.toThrow('Token revoked');
    });
  });
  ```

- [ ] **解析令牌 - 无需验证**
  - 描述: 解析 JWT 但不验证签名
  - 输入: `{ token: "<jwt>" }`
  - 预期输出: 返回 payload
  - 测试代码框架:
  ```typescript
  describe('JWTService.decode', () => {
    it('should decode token without verification', () => {
      const token = jwt.sign({ userId: 1 }, 'any-secret');
      const payload = jwtService.decode(token);
      expect(payload.userId).toBe(1);
    });
  });
  ```

#### MFA 服务 (MFAService)
- [ ] **生成 TOTP 密钥**
  - 描述: 为用户生成 TOTP 密钥
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回 secret 和 QR 码 URL
  - 测试代码框架:
  ```typescript
  describe('MFAService.generateSecret', () => {
    it('should generate TOTP secret', () => {
      const result = mfaService.generateSecret(1);
      expect(result.secret).toMatch(/^[A-Z2-7]{16}$/);
      expect(result.qrCodeUrl).toContain('otpauth://totp');
      expect(result.qrCodeUrl).toContain('Discuz');
    });
  });
  ```

- [ ] **验证 TOTP 代码 - 正确代码**
  - 描述: 验证正确的 TOTP 代码
  - 输入: `{ secret: "<base32-secret>", code: "<valid-totp>" }`
  - 预期输出: 返回 `true`
  - 测试代码框架:
  ```typescript
  describe('MFAService.verifyTOTP', () => {
    it('should verify valid TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const code = totp.generate(secret);
      const isValid = mfaService.verifyTOTP(secret, code);
      expect(isValid).toBe(true);
    });
  });
  ```

- [ ] **验证 TOTP 代码 - 错误代码**
  - 描述: 验证错误的 TOTP 代码
  - 输入: `{ secret: "<secret>", code: "000000" }`
  - 预期输出: 返回 `false`
  - 测试代码框架:
  ```typescript
  it('should reject invalid TOTP code', () => {
    const isValid = mfaService.verifyTOTP('SECRET', '000000');
    expect(isValid).toBe(false);
  });
  ```

- [ ] **生成恢复码**
  - 描述: 为用户生成 10 个恢复码
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回 10 个唯一恢复码
  - 测试代码框架:
  ```typescript
  describe('MFAService.generateRecoveryCodes', () => {
    it('should generate 10 unique recovery codes', () => {
      const codes = mfaService.generateRecoveryCodes(1);
      expect(codes).toHaveLength(10);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      });
    });
  });
  ```

- [ ] **使用恢复码**
  - 描述: 使用恢复码禁用 MFA
  - 输入: `{ userId: 1, code: "<valid-recovery-code>" }`
  - 预期输出: MFA 被禁用，恢复码被消耗
  - 测试代码框架:
  ```typescript
  describe('MFAService.useRecoveryCode', () => {
    it('should consume recovery code and disable MFA', async () => {
      const codes = mfaService.generateRecoveryCodes(1);
      const success = await mfaService.useRecoveryCode(1, codes[0]);
      expect(success).toBe(true);
      const remainingCodes = await mfaService.getRemainingCodes(1);
      expect(remainingCodes).toHaveLength(9);
    });
  });
  ```

#### 中间件测试
- [ ] **认证中间件 - 有效令牌**
  - 描述: 请求携带有效 JWT 应通过
  - 输入: `{ headers: { Authorization: "Bearer <jwt>" } }`
  - 预期输出: req.user 被设置，调用 next()
  - 测试代码框架:
  ```typescript
  describe('authMiddleware', () => {
    it('should pass with valid token', async () => {
      const token = await jwtService.sign({ userId: 1 }, 'access');
      const ctx = { headers: { authorization: `Bearer ${token}` } };
      await authMiddleware(ctx, async () => {});
      expect(ctx.state.user).toBeDefined();
      expect(ctx.state.user.userId).toBe(1);
    });
  });
  ```

- [ ] **认证中间件 - 无令牌**
  - 描述: 请求无令牌应返回 401
  - 输入: `{ headers: {} }`
  - 预期输出: 返回 401 Unauthorized
  - 测试代码框架:
  ```typescript
  it('should return 401 without token', async () => {
    const ctx = { headers: {} };
    await authMiddleware(ctx, async () => {});
    expect(ctx.status).toBe(401);
    expect(ctx.body.error).toContain('未提供认证令牌');
  });
  ```

- [ ] **权限检查中间件 - 有权限**
  - 描述: 用户有所需权限应通过
  - 输入: `{ user: { permissions: ['post.create'] }, required: ['post.create'] }`
  - 预期输出: 调用 next()
  - 测试代码框架:
  ```typescript
  describe('requirePermission', () => {
    it('should pass with required permission', async () => {
      const ctx = {
        state: { user: { userId: 1, permissions: ['post.create'] } }
      };
      const middleware = requirePermission('post.create');
      await middleware(ctx, async () => {});
      expect(ctx.status).not.toBe(403);
    });
  });
  ```

- [ ] **权限检查中间件 - 无权限**
  - 描述: 用户无权限应返回 403
  - 输入: `{ user: { permissions: [] }, required: ['post.create'] }`
  - 预期输出: 返回 403 Forbidden
  - 测试代码框架:
  ```typescript
  it('should return 403 without permission', async () => {
    const ctx = {
      state: { user: { userId: 1, permissions: [] } }
    };
    const middleware = requirePermission('post.create');
    await middleware(ctx, async () => {});
    expect(ctx.status).toBe(403);
  });
  ```

#### RBAC 权限系统
- [ ] **检查权限 - 直接权限**
  - 描述: 用户直接拥有权限
  - 输入: `{ userId: 1, permission: 'post.delete' }`
  - 预期输出: 返回 `true`
  - 测试代码框架:
  ```typescript
  describe('RBAC.hasPermission', () => {
    it('should check direct user permission', async () => {
      await prisma.userPermission.create({
        data: { userId: 1, permission: 'post.delete' }
      });
      const hasPermission = await rbac.hasPermission(1, 'post.delete');
      expect(hasPermission).toBe(true);
    });
  });
  ```

- [ ] **检查权限 - 组权限**
  - 描述: 通过用户组获得权限
  - 输入: `{ userId: 1, permission: 'moderator.ban' }`
  - 预期输出: 返回 `true`
  - 测试代码框架:
  ```typescript
  it('should check group permission', async () => {
      data: { userId: 1, groupId: 2 }
    });
    await prisma.groupPermission.create({
      data: { groupId: 2, permission: 'moderator.ban' }
    });
    const hasPermission = await rbac.hasPermission(1, 'moderator.ban');
    expect(hasPermission).toBe(true);
  });
  ```

- [ ] **分配权限**
  - 描述: 为用户分配权限
  - 输入: `{ userId: 1, permission: 'admin.settings' }`
  - 预期输出: 权限被保存
  - 测试代码框架:
  ```typescript
  describe('RBAC.grantPermission', () => {
    it('should grant permission to user', async () => {
      await rbac.grantPermission(1, 'admin.settings');
      const hasPermission = await rbac.hasPermission(1, 'admin.settings');
      expect(hasPermission).toBe(true);
    });
  });
  ```

- [ ] **撤销权限**
  - 描述: 撤销用户权限
  - 输入: `{ userId: 1, permission: 'post.delete' }`
  - 预期输出: 权限被删除
  - 测试代码框架:
  ```typescript
  describe('RBAC.revokePermission', () => {
    it('should revoke user permission', async () => {
      await rbac.grantPermission(1, 'post.delete');
      await rbac.revokePermission(1, 'post.delete');
      const hasPermission = await rbac.hasPermission(1, 'post.delete');
      expect(hasPermission).toBe(false);
    });
  });
  ```

- [ ] **获取所有权限**
  - 描述: 获取用户所有权限（直接+组）
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回权限数组
  - 测试代码框架:
  ```typescript
  describe('RBAC.getUserPermissions', () => {
    it('should return all user permissions', async () => {
      await rbac.grantPermission(1, 'post.create');
      await rbac.grantPermission(1, 'post.delete');
      const permissions = await rbac.getUserPermissions(1);
      expect(permissions).toContain('post.create');
      expect(permissions).toContain('post.delete');
    });
  });
  ```

### 集成测试

- [ ] **用户登录 - 完整流程**
  - 描述: 用户使用用户名密码登录
  - API端点: `POST /api/auth/login`
  - 请求:
  ```json
  {
    "username": "testuser",
    "password": "SecurePass123!",
    "mfaCode": "123456"
  }
  ```
  - 预期响应: `200 OK`
  ```json
  {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": { "id": 1, "username": "testuser" }
  }
  ```
  - 测试代码框架:
  ```typescript
  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('SecurePass123!', 10);
      await prisma.user.create({
        data: { username: 'testuser', password: hashedPassword }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'SecurePass123!' });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.user.username).toBe('testuser');
    });
  });
  ```

- [ ] **用户登录 - 错误密码**
  - 描述: 使用错误密码登录
  - API端点: `POST /api/auth/login`
  - 请求: `{ username: "testuser", password: "WrongPass" }`
  - 预期响应: `401 Unauthorized`
  ```json
  { "error": "用户名或密码错误" }
  ```

- [ ] **用户登出**
  - 描述: 用户登出并吊销令牌
  - API端点: `POST /api/auth/logout`
  - 请求: `{ refreshToken: "<token>" }`
  - 预期响应: `200 OK`

- [ ] **刷新令牌**
  - 描述: 使用刷新令牌获取新访问令牌
  - API端点: `POST /api/auth/refresh`
  - 请求: `{ refreshToken: "<valid-refresh-token>" }`
  - 预期响应: `200 OK`
  ```json
  { "accessToken": "<new-jwt>" }
  ```

- [ ] **启用 MFA**
  - 描述: 为账户启用多因素认证
  - API端点: `POST /api/auth/mfa/enable`
  - 请求: `{ code: "123456", secret: "<base32-secret>" }`
  - 预期响应: `200 OK`
  ```json
  { "recoveryCodes": ["XXXX-XXXX", ...] }
  ```

### 安全测试

- [ ] **暴力破解防护**
  - 描述: 多次失败登录应触发速率限制
  - 攻击向量: 连续发送错误密码
  - 预期行为: 5 次失败后锁定 15 分钟
  - 测试代码框架:
  ```typescript
  describe('Brute Force Protection', () => {
    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrong' })
          .expect(401);
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrong' });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('账户已锁定');
    });
  });
  ```

- [ ] **令牌重放攻击**
  - 描述: 已吊销的令牌不能重复使用
  - 攻击向量: 使用已注销的令牌
  - 预期行为: 返回 401 Unauthorized

- [ ] **会话固定**
  - 描述: 登录后应生成新会话令牌
  - 攻击向量: 尝试复用旧会话
  - 预期行为: 旧令牌失效

---

## 2. 用户系统 (Users)

### 单元测试

#### 用户服务 (UserService)
- [ ] **创建用户 - 正常情况**
  - 描述: 创建新用户
  - 输入: `{ username: "newuser", password: "Secure123!", email: "test@example.com" }`
  - 预期输出: 返回用户对象（不包含密码）
  - 测试代码框架:
  ```typescript
  describe('UserService.create', () => {
    it('should create new user', async () => {
      const userData = {
        username: 'newuser',
        password: 'Secure123!',
        email: 'test@example.com'
      };

      const user = await userService.create(userData);

      expect(user.id).toBeDefined();
      expect(user.username).toBe('newuser');
      expect(user.password).toBeUndefined();
      expect(user.email).toBe('test@example.com');
    });
  });
  ```

- [ ] **创建用户 - 重复用户名**
  - 描述: 创建重复用户名应失败
  - 输入: `{ username: "existing" }`
  - 预期输出: 抛出 `DuplicateEntryError`
  - 测试代码框架:
  ```typescript
  it('should reject duplicate username', async () => {
    await userService.create({ username: 'test', password: 'Pass123!' });
    await expect(
      userService.create({ username: 'test', password: 'Pass123!' })
    ).rejects.toThrow(DuplicateEntryError);
  });
  ```

- [ ] **获取用户 - ID 查询**
  - 描述: 通过 ID 获取用户
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回用户对象
  - 测试代码框架:
  ```typescript
  describe('UserService.findById', () => {
    it('should find user by ID', async () => {
      const created = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      const user = await userService.findById(created.id);
      expect(user.username).toBe('test');
    });
  });
  ```

- [ ] **获取用户 - 用户名查询**
  - 描述: 通过用户名获取用户
  - 输入: `{ username: "testuser" }`
  - 预期输出: 返回用户对象
  - 测试代码框架:
  ```typescript
  describe('UserService.findByUsername', () => {
    it('should find user by username', async () => {
      await userService.create({ username: 'testuser', password: 'Pass123!' });
      const user = await userService.findByUsername('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });
  });
  ```

- [ ] **更新用户资料**
  - 描述: 更新用户基本信息
  - 输入: `{ userId: 1, updates: { bio: "Hello world" } }`
  - 预期输出: 返回更新后的用户
  - 测试代码框架:
  ```typescript
  describe('UserService.update', () => {
    it('should update user profile', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      const updated = await userService.update(user.id, {
        bio: 'Hello world'
      });
      expect(updated.bio).toBe('Hello world');
    });
  });
  ```

- [ ] **更新密码**
  - 描述: 更新用户密码
  - 输入: `{ userId: 1, oldPassword: "old", newPassword: "new" }`
  - 预期输出: 密码更新成功
  - 测试代码框架:
  ```typescript
  describe('UserService.changePassword', () => {
    it('should change user password', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'OldPass123!'
      });

      await userService.changePassword(user.id, 'OldPass123!', 'NewPass456!');

      const isValid = await passwordService.verify('NewPass456!', user.password);
      expect(isValid).toBe(true);
    });
  });
  ```

- [ ] **删除用户 - 软删除**
  - 描述: 软删除用户（标记删除）
  - 输入: `{ userId: 1 }`
  - 预期输出: 用户被标记为已删除
  - 测试代码框架:
  ```typescript
  describe('UserService.delete', () => {
    it('should soft delete user', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      await userService.delete(user.id);
      const deleted = await userService.findById(user.id);
      expect(deleted.deletedAt).toBeTruthy();
    });
  });
  ```

- [ ] **封禁用户**
  - 描述: 封禁用户账户
  - 输入: `{ userId: 1, reason: "Spamming", duration: 7 }`
  - 预期输出: 用户被标记为封禁
  - 测试代码框架:
  ```typescript
  describe('UserService.ban', () => {
    it('should ban user for duration', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      const ban = await userService.ban(user.id, 'Spamming', 7);
      expect(user.isBanned).toBe(true);
      expect(ban.reason).toBe('Spamming');
    });
  });
  ```

- [ ] **解封用户**
  - 描述: 解除用户封禁
  - 输入: `{ userId: 1 }`
  - 预期输出: 用户恢复正常状态
  - 测试代码框架:
  ```typescript
  describe('UserService.unban', () => {
    it('should unban user', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      await userService.ban(user.id, 'Spamming', 7);
      await userService.unban(user.id);
      const updated = await userService.findById(user.id);
      expect(updated.isBanned).toBe(false);
    });
  });
  ```

- [ ] **获取在线用户**
  - 描述: 获取在线用户列表
  - 输入: `{ limit: 10 }`
  - 预期输出: 返回在线用户数组
  - 测试代码框架:
  ```typescript
  describe('UserService.getOnlineUsers', () => {
    it('should return online users', async () => {
      await redis.set(`user:1:online`, '1', 'EX', 300);
      await redis.set(`user:2:online`, '1', 'EX', 300);
      const online = await userService.getOnlineUsers();
      expect(online.length).toBeGreaterThanOrEqual(2);
    });
  });
  ```

#### 用户组服务 (UserGroupService)
- [ ] **创建用户组**
  - 描述: 创建新的用户组
  - 输入: `{ name: "VIP Members", color: "#FFD700" }`
  - 预期输出: 返回用户组对象
  - 测试代码框架:
  ```typescript
  describe('UserGroupService.create', () => {
    it('should create user group', async () => {
      const group = await userGroupService.create({
        name: 'VIP Members',
        color: '#FFD700'
      });
      expect(group.name).toBe('VIP Members');
      expect(group.color).toBe('#FFD700');
    });
  });
  ```

- [ ] **分配用户到组**
  - 描述: 将用户添加到用户组
  - 输入: `{ userId: 1, groupId: 2 }`
  - 预期输出: 用户被加入组
  - 测试代码框架:
  ```typescript
  describe('UserGroupService.addUser', () => {
    it('should add user to group', async () => {
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      const group = await userGroupService.create({ name: 'VIP' });
      await userGroupService.addUser(user.id, group.id);
      const userGroups = await userGroupService.getUserGroups(user.id);
      expect(userGroups).toContainEqual(
        expect.objectContaining({ name: 'VIP' })
      );
    });
  });
  ```

- [ ] **从组移除用户**
  - 描述: 将用户从组移除
  - 输入: `{ userId: 1, groupId: 2 }`
  - 预期输出: 用户被移出组

#### 头像服务 (AvatarService)
- [ ] **上传头像 - 有效图片**
  - 描述: 上传用户头像
  - 输入: `{ userId: 1, file: <image-buffer> }`
  - 预期输出: 头像 URL
  - 测试代码框架:
  ```typescript
  describe('AvatarService.upload', () => {
    it('should upload avatar', async () => {
      const imageBuffer = fs.readFileSync('test/fixtures/avatar.jpg');
      const url = await avatarService.upload(1, imageBuffer, 'image/jpeg');
      expect(url).toMatch(/\/avatars\/\w+\.jpg$/);
    });
  });
  ```

- [ ] **上传头像 - 无效格式**
  - 描述: 上传非图片文件应失败
  - 输入: `{ userId: 1, file: <pdf-buffer> }`
  - 预期输出: 抛出 `ValidationError`
  - 测试代码框架:
  ```typescript
  it('should reject non-image file', async () => {
    const pdfBuffer = Buffer.from('PDF content');
    await expect(
      avatarService.upload(1, pdfBuffer, 'application/pdf')
    ).rejects.toThrow(ValidationError);
  });
  ```

- [ ] **裁剪头像**
  - 描述: 裁剪头像到指定尺寸
  - 输入: `{ avatarUrl: "...", crop: { x: 0, y: 0, width: 100, height: 100 } }`
  - 预期输出: 返回裁剪后的头像 URL

#### 密码重置服务 (PasswordResetService)
- [ ] **请求重置**
  - 描述: 发送密码重置邮件
  - 输入: `{ email: "user@example.com" }`
  - 预期输出: 重置令牌被保存，邮件被发送
  - 测试代码框架:
  ```typescript
  describe('PasswordResetService.requestReset', () => {
    it('should send reset email', async () => {
      await userService.create({
        username: 'test',
        email: 'test@example.com',
        password: 'Pass123!'
      });
      const token = await passwordResetService.requestReset('test@example.com');
      expect(token).toBeDefined();
      const saved = await redis.get(`password_reset:${token}`);
      expect(saved).toBeTruthy();
    });
  });
  ```

- [ ] **验证重置令牌**
  - 描述: 验证密码重置令牌
  - 输入: `{ token: "<reset-token>" }`
  - 预期输出: 返回用户 ID

- [ ] **重置密码**
  - 描述: 使用令牌重置密码
  - 输入: `{ token: "...", newPassword: "NewPass123!" }`
  - 预期输出: 密码被更新，令牌失效
  - 测试代码框架:
  ```typescript
  describe('PasswordResetService.reset', () => {
    it('should reset password with valid token', async () => {
      const user = await userService.create({
        username: 'test',
        email: 'test@example.com',
        password: 'OldPass123!'
      });
      const token = await passwordResetService.requestReset('test@example.com');
      await passwordResetService.reset(token, 'NewPass456!');
      const isValid = await passwordService.verify('NewPass456!', user.password);
      expect(isValid).toBe(true);
    });
  });
  ```

### 集成测试

- [ ] **用户注册**
  - API端点: `POST /api/users/register`
  - 请求:
  ```json
  {
    "username": "newuser",
    "password": "SecurePass123!",
    "email": "new@example.com",
    "captcha": "abc123"
  }
  ```
  - 预期响应: `201 Created`
  ```json
  {
    "id": 1,
    "username": "newuser",
    "email": "new@example.com"
  }
  ```

- [ ] **获取用户资料**
  - API端点: `GET /api/users/:id`
  - 预期响应: `200 OK`
  ```json
  {
    "id": 1,
    "username": "testuser",
    "avatar": "https://...",
    "posts": 100,
    "threads": 10,
    "joinedAt": "2024-01-01T00:00:00Z"
  }
  ```

- [ ] **更新用户资料**
  - API端点: `PATCH /api/users/:id`
  - 请求: `{ bio: "Updated bio" }`
  - 预期响应: `200 OK`

- [ ] **上传头像**
  - API端点: `POST /api/users/:id/avatar`
  - 请求: multipart/form-data with avatar file
  - 预期响应: `200 OK`
  ```json
  { "avatarUrl": "https://cdn.example.com/avatars/123.jpg" }
  ```

### 安全测试

- [ ] **用户名枚举**
  - 描述: 登录错误不应泄露用户是否存在
  - 攻击向量: 测试不同用户名的错误信息
  - 预期行为: 错误信息一致

- [ ] **邮箱枚举**
  - 描述: 注册/重置错误不应泄露邮箱是否被使用
  - 攻击向量: 测试不同邮箱
  - 预期行为: 总是返回成功（已存在时也发送邮件）

- [ ] **权限提升**
  - 描述: 普通用户不能提升自己权限
  - 攻击向量: 修改请求设置 isAdmin: true
  - 预期行为: 返回 403

---

## 3. 论坛核心 (Forum Core)

### 单元测试

#### 版块服务 (ForumService)
- [ ] **创建版块**
  - 描述: 创建新版块
  - 输入: `{ name: "技术讨论", description: "...", parentId: null }`
  - 预期输出: 返回版块对象
  - 测试代码框架:
  ```typescript
  describe('ForumService.create', () => {
    it('should create forum', async () => {
      const forum = await forumService.create({
        name: '技术讨论',
        description: '讨论技术问题'
      });
      expect(forum.name).toBe('技术讨论');
      expect(forum.slug).toBe('ji-shu-tao-lun');
    });
  });
  ```

- [ ] **获取版块树**
  - 描述: 获取版块层级结构
  - 输入: `{}`
  - 预期输出: 返回树形结构
  - 测试代码框架:
  ```typescript
  describe('ForumService.getTree', () => {
    it('should return forum tree', async () => {
      const parent = await forumService.create({ name: '技术' });
      await forumService.create({ name: '前端', parentId: parent.id });
      await forumService.create({ name: '后端', parentId: parent.id });

      const tree = await forumService.getTree();
      expect(tree[0].children).toHaveLength(2);
    });
  });
  ```

- [ ] **更新版块**
  - 描述: 更新版块信息
  - 输入: `{ forumId: 1, updates: { name: "新名称" } }`
  - 预期输出: 版块被更新

- [ ] **删除版块**
  - 描述: 删除版块及其子版块
  - 输入: `{ forumId: 1 }`
  - 预期输出: 版块被软删除

#### 主题服务 (ThreadService)
- [ ] **创建主题**
  - 描述: 创建新主题
  - 输入: `{ forumId: 1, userId: 1, title: "Hello", content: "World" }`
  - 预期输出: 返回主题对象
  - 测试代码框架:
  ```typescript
  describe('ThreadService.create', () => {
    it('should create thread', async () => {
      const forum = await forumService.create({ name: '测试' });
      const user = await userService.create({
        username: 'test',
        password: 'Pass123!'
      });
      const thread = await threadService.create({
        forumId: forum.id,
        userId: user.id,
        title: 'Hello World',
        content: 'This is a test thread'
      });
      expect(thread.title).toBe('Hello World');
      expect(thread.forumId).toBe(forum.id);
    });
  });
  ```

- [ ] **获取主题列表**
  - 描述: 分页获取版块主题
  - 输入: `{ forumId: 1, page: 1, limit: 20 }`
  - 预期输出: 返回主题数组
  - 测试代码框架:
  ```typescript
  describe('ThreadService.list', () => {
    it('should return paginated threads', async () => {
      const forum = await forumService.create({ name: '测试' });
      for (let i = 0; i < 25; i++) {
        await threadService.create({
          forumId: forum.id,
          userId: 1,
          title: `Thread ${i}`,
          content: 'Content'
        });
      }
      const result = await threadService.list(forum.id, { page: 1, limit: 20 });
      expect(result.threads).toHaveLength(20);
      expect(result.total).toBe(25);
    });
  });
  ```

- [ ] **获取主题详情**
  - 描述: 获取主题及其第一楼
  - 输入: `{ threadId: 1 }`
  - 预期输出: 返回主题和首帖内容

- [ ] **更新主题**
  - 描述: 更新主题标题/内容
  - 输入: `{ threadId: 1, updates: { title: "New Title" } }`
  - 预期输出: 主题被更新

- [ ] **删除主题 - 软删除**
  - 描述: 软删除主题
  - 输入: `{ threadId: 1 }`
  - 预期输出: 主题标记为已删除
  - 测试代码框架:
  ```typescript
  describe('ThreadService.delete', () => {
    it('should soft delete thread', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      await threadService.delete(thread.id);
      const deleted = await threadService.findById(thread.id);
      expect(deleted.deletedAt).toBeTruthy();
    });
  });
  ```

- [ ] **置顶主题**
  - 描述: 置顶主题
  - 输入: `{ threadId: 1, type: "top" }`
  - 预期输出: 主题被置顶
  - 测试代码框架:
  ```typescript
  describe('ThreadService.pin', () => {
    it('should pin thread', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      await threadService.pin(thread.id, 'top');
      const pinned = await threadService.findById(thread.id);
      expect(pinned.isPinned).toBe(true);
    });
  });
  ```

- [ ] **加精主题**
  - 描述: 设置精华主题
  - 输入: `{ threadId: 1 }`
  - 预期输出: 主题被标记为精华
  - 测试代码框架:
  ```typescript
  describe('ThreadService.highlight', () => {
    it('should highlight thread', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      await threadService.highlight(thread.id);
      const highlighted = await threadService.findById(thread.id);
      expect(highlighted.isHighlighted).toBe(true);
    });
  });
  ```

- [ ] **关闭主题**
  - 描述: 关闭主题（禁止回复）
  - 输入: `{ threadId: 1 }`
  - 预期输出: 主题被关闭
  - 测试代码框架:
  ```typescript
  describe('ThreadService.close', () => {
    it('should close thread', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      await threadService.close(thread.id);
      const closed = await threadService.findById(thread.id);
      expect(closed.isClosed).toBe(true);
    });
  });
  ```

- [ ] **移动主题**
  - 描述: 移动主题到其他版块
  - 输入: `{ threadId: 1, targetForumId: 2 }`
  - 预期输出: 主题被移动

#### 帖子服务 (PostService)
- [ ] **创建回复**
  - 描述: 回复主题
  - 输入: `{ threadId: 1, userId: 1, content: "Reply" }`
  - 预期输出: 返回回复对象
  - 测试代码框架:
  ```typescript
  describe('PostService.create', () => {
    it('should create reply', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      const post = await postService.create({
        threadId: thread.id,
        userId: 1,
        content: 'This is a reply'
      });
      expect(post.content).toBe('This is a reply');
      expect(post.floor).toBe(2);
    });
  });
  ```

- [ ] **引用回复**
  - 描述: 引用其他帖子回复
  - 输入: `{ threadId: 1, userId: 1, content: "...", quotePostId: 5 }`
  - 预期输出: 返回带引用的回复
  - 测试代码框架:
  ```typescript
  describe('PostService.createWithQuote', () => {
    it('should create quoted reply', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'Test',
        content: 'Content'
      });
      const original = await postService.create({
        threadId: thread.id,
        userId: 2,
        content: 'Original post'
      });
      const quote = await postService.create({
        threadId: thread.id,
        userId: 1,
        content: 'I agree',
        quotePostId: original.id
      });
      expect(quote.quotePostId).toBe(original.id);
    });
  });
  ```

- [ ] **编辑帖子**
  - 描述: 编辑帖子内容
  - 输入: `{ postId: 1, content: "Updated", editReason: "typo" }`
  - 预期输出: 帖子被更新，编辑记录被保存
  - 测试代码框架:
  ```typescript
  describe('PostService.update', () => {
    it('should update post with edit history', async () => {
      const post = await postService.create({
        threadId: 1,
        userId: 1,
        content: 'Original'
      });
      const updated = await postService.update(post.id, {
        content: 'Updated',
        editReason: 'Fixed typo'
      });
      expect(updated.content).toBe('Updated');
      expect(updated.editCount).toBe(1);
    });
  });
  ```

- [ ] **删除帖子**
  - 描述: 删除帖子
  - 输入: `{ postId: 1 }`
  - 预期输出: 帖子被软删除
  - 测试代码框架:
  ```typescript
  describe('PostService.delete', () => {
    it('should soft delete post', async () => {
      const post = await postService.create({
        threadId: 1,
        userId: 1,
        content: 'Test'
      });
      await postService.delete(post.id);
      const deleted = await postService.findById(post.id);
      expect(deleted.deletedAt).toBeTruthy();
    });
  });
  ```

- [ ] **获取主题帖子列表**
  - 描述: 分页获取主题的所有回复
  - 输入: `{ threadId: 1, page: 1, limit: 20 }`
  - 预期输出: 返回帖子数组

#### 附件服务 (AttachmentService)
- [ ] **上传附件**
  - 描述: 上传主题/帖子附件
  - 输入: `{ file: <buffer>, postId: 1 }`
  - 预期输出: 返回附件 URL
  - 测试代码框架:
  ```typescript
  describe('AttachmentService.upload', () => {
    it('should upload attachment', async () => {
      const file = Buffer.from('test content');
      const attachment = await attachmentService.upload({
        file,
        name: 'test.txt',
        mimeType: 'text/plain',
        userId: 1
      });
      expect(attachment.url).toBeTruthy();
      expect(attachment.size).toBe(file.length);
    });
  });
  ```

- [ ] **删除附件**
  - 描述: 删除附件
  - 输入: `{ attachmentId: 1 }`
  - 预期输出: 附件被删除，文件被移除

### 集成测试

- [ ] **浏览版块**
  - API端点: `GET /api/forums/:slug`
  - 预期响应: `200 OK`
  ```json
  {
    "id": 1,
    "name": "技术讨论",
    "description": "...",
    "threads": 100,
    "posts": 1000,
    "lastPost": { ... }
  }
  ```

- [ ] **创建主题**
  - API端点: `POST /api/threads`
  - 请求:
  ```json
  {
    "forumId": 1,
    "title": "新主题",
    "content": "主题内容",
    "attachments": [...]
  }
  ```
  - 预期响应: `201 Created`

- [ ] **查看主题**
  - API端点: `GET /api/threads/:id`
  - 预期响应: `200 OK`
  ```json
  {
    "id": 1,
    "title": "主题标题",
    "posts": [
      { "floor": 1, "content": "...", "author": {...} },
      { "floor": 2, "content": "...", "author": {...} }
    ]
  }
  ```

- [ ] **回复主题**
  - API端点: `POST /api/posts`
  - 请求: `{ threadId: 1, content: "回复内容" }`
  - 预期响应: `201 Created`

### 安全测试

- [ ] **XSS 防护**
  - 描述: 帖子内容应被过滤
  - 攻击向量: `<script>alert(1)</script>`
  - 预期行为: 内容被转义或移除

- [ ] **SQL 注入防护**
  - 描述: 搜索参数不应注入 SQL
  - 攻击向量: `title: "'; DROP TABLE threads; --"`
  - 预期行为: 参数被转义

- [ ] **权限检查**
  - 描述: 只作者/管理员可编辑帖子
  - 攻击向量: 用户尝试编辑他人帖子
  - 预期行为: 返回 403

---

## 4. 版主系统 (Moderation)

### 单元测试

- [ ] **检查版主权限**
  - 描述: 验证用户是否是版主
  - 输入: `{ userId: 1, forumId: 2 }`
  - 预期输出: 返回权限对象
  - 测试代码框架:
  ```typescript
  describe('ModerationService.checkPermission', () => {
    it('should return moderator permissions', async () => {
      await prisma.moderator.create({
        data: { userId: 1, forumId: 2, permissions: ['edit', 'delete'] }
      });
      const perms = await moderationService.checkPermission(1, 2);
      expect(perms.canEdit).toBe(true);
      expect(perms.canDelete).toBe(true);
      expect(perms.canBan).toBe(false);
    });
  });
  ```

- [ ] **审核主题**
  - 描述: 版主审核待审核主题
  - 输入: `{ threadId: 1, action: "approve" }`
  - 预期输出: 主题状态更新
  - 测试代码框架:
  ```typescript
  describe('ModerationService.moderateThread', () => {
    it('should approve pending thread', async () => {
      const thread = await threadService.create({
        forumId: 1,
        userId: 2,
        title: 'Pending',
        content: 'Content',
        status: 'pending'
      });
      await moderationService.moderateThread(thread.id, 'approve', 1);
      const updated = await threadService.findById(thread.id);
      expect(updated.status).toBe('published');
    });
  });
  ```

- [ ] **批量删除帖子**
  - 描述: 批量删除多个帖子
  - 输入: `{ postIds: [1, 2, 3], reason: "spam" }`
  - 预期输出: 所有帖子被删除

- [ ] **记录管理日志**
  - 描述: 记录版主操作
  - 输入: `{ moderatorId: 1, action: "delete", target: "thread", targetId: 5 }`
  - 预期输出: 日志被保存
  - 测试代码框架:
  ```typescript
  describe('ModerationService.logAction', () => {
    it('should log moderator action', async () => {
      await moderationService.logAction({
        moderatorId: 1,
        action: 'delete_thread',
        targetId: 5,
        reason: 'Spam'
      });
      const logs = await moderationService.getActionLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('delete_thread');
    });
  });
  ```

### 集成测试

- [ ] **置顶主题**
  - API端点: `POST /api/moderation/threads/:id/pin`
  - 请求: `{ type: "top" }`
  - 预期响应: `200 OK`

- [ ] **批量操作**
  - API端点: `POST /api/moderation/batch`
  - 请求: `{ action: "delete", threadIds: [1, 2, 3] }`
  - 预期响应: `200 OK`

### 安全测试

- [ ] **跨版块操作**
  - 描述: 版主不能操作其他版块
  - 攻击向量: 版主 A 操作版块 B
  - 预期行为: 返回 403

---

## 5. Pokemon 系统

### 单元测试

- [ ] **创建宠物**
  - 描述: 为用户创建宠物
  - 输入: `{ userId: 1, speciesId: 25, nickname: "皮卡丘" }`
  - 预期输出: 返回宠物对象
  - 测试代码框架:
  ```typescript
  describe('PokemonService.create', () => {
    it('should create pokemon for user', async () => {
      const pokemon = await pokemonService.create({
        userId: 1,
        speciesId: 25,
        nickname: '皮卡丘'
      });
      expect(pokemon.speciesId).toBe(25);
      expect(pokemon.nickname).toBe('皮卡丘');
      expect(pokemon.level).toBe(1);
      expect(pokemon.exp).toBe(0);
    });
  });
  ```

- [ ] **增加经验值**
  - 描述: 为宠物增加经验值
  - 输入: `{ pokemonId: 1, exp: 100 }`
  - 预期输出: 经验值增加，可能升级
  - 测试代码框架:
  ```typescript
  describe('PokemonService.addExp', () => {
    it('should add exp and level up', async () => {
      const pokemon = await pokemonService.create({
        userId: 1,
        speciesId: 25
      });
      const updated = await pokemonService.addExp(pokemon.id, 1000);
      expect(updated.exp).toBe(1000);
      expect(updated.level).toBeGreaterThan(1);
    });
  });
  ```

- [ ] **学习技能**
  - 描述: 宠物学习新技能
  - 输入: `{ pokemonId: 1, skillId: 10 }`
  - 预期输出: 技能被添加
  - 测试代码框架:
  ```typescript
  describe('PokemonService.learnSkill', () => {
    it('should teach skill to pokemon', async () => {
      const pokemon = await pokemonService.create({ userId: 1, speciesId: 25 });
      await pokemonService.learnSkill(pokemon.id, 10);
      const skills = await pokemonService.getSkills(pokemon.id);
      expect(skills).toContainEqual(expect.objectContaining({ id: 10 }));
    });
  });
  ```

- [ ] **进化宠物**
  - 描述: 宠物进化
  - 输入: `{ pokemonId: 1 }`
  - 预期输出: 物种改变
  - 测试代码框架:
  ```typescript
  describe('PokemonService.evolve', () => {
    it('should evolve pokemon', async () => {
      const pokemon = await pokemonService.create({ userId: 1, speciesId: 133 }); // Eevee
      const evolved = await pokemonService.evolve(pokemon.id, 134); // Vaporeon
      expect(evolved.speciesId).toBe(134);
    });
  });
  ```

- [ ] **宠物战斗 - 计算伤害**
  - 描述: 计算技能伤害
  - 输入: `{ attacker: {...}, defender: {...}, skill: {...} }`
  - 预期输出: 返回伤害值
  - 测试代码框架:
  ```typescript
  describe('BattleService.calculateDamage', () => {
    it('should calculate skill damage', () => {
      const attacker = { attack: 50, level: 10 };
      const defender = { defense: 30, level: 10 };
      const skill = { power: 40, type: 'electric' };
      const damage = battleService.calculateDamage(attacker, defender, skill);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(100);
    });
  });
  ```

- [ ] **宠物交易**
  - 描述: 用户间交易宠物
  - 输入: `{ fromUserId: 1, toUserId: 2, pokemonId: 5, price: 1000 }`
  - 预期输出: 交易完成，金币转移
  - 测试代码框架:
  ```typescript
  describe('PokemonService.trade', () => {
    it('should trade pokemon between users', async () => {
      const pokemon = await pokemonService.create({ userId: 1, speciesId: 25 });
      await pokemonService.trade(pokemon.id, 1, 2, 1000);
      const updated = await pokemonService.findById(pokemon.id);
      expect(updated.userId).toBe(2);
    });
  });
  ```

### 集成测试

- [ ] **获取宠物列表**
  - API端点: `GET /api/pokemon`
  - 预期响应: `200 OK`
  ```json
  [
    { "id": 1, "nickname": "皮卡丘", "level": 10, "species": {...} }
  ]
  ```

- [ ] **宠物战斗**
  - API端点: `POST /api/pokemon/battle`
  - 请求: `{ attackerId: 1, defenderId: 2 }`
  - 预期响应: `200 OK`

---

## 6. 银行系统 (Bank)

### 单元测试

- [ ] **创建账户**
  - 描述: 为用户创建银行账户
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回账户对象
  - 测试代码框架:
  ```typescript
  describe('BankService.createAccount', () => {
    it('should create bank account', async () => {
      const account = await bankService.createAccount(1);
      expect(account.userId).toBe(1);
      expect(account.balance).toBe(0);
    });
  });
  ```

- [ ] **存款**
  - 描述: 存入金币
  - 输入: `{ userId: 1, amount: 1000 }`
  - 预期输出: 余额增加
  - 测试代码框架:
  ```typescript
  describe('BankService.deposit', () => {
    it('should deposit money', async () => {
      await bankService.createAccount(1);
      await bankService.deposit(1, 1000);
      const account = await bankService.getAccount(1);
      expect(account.balance).toBe(1000);
    });
  });
  ```

- [ ] **取款 - 有余额**
  - 描述: 取出金币
  - 输入: `{ userId: 1, amount: 500 }`
  - 预期输出: 余额减少
  - 测试代码框架:
  ```typescript
  describe('BankService.withdraw', () => {
    it('should withdraw with sufficient balance', async () => {
      await bankService.createAccount(1);
      await bankService.deposit(1, 1000);
      await bankService.withdraw(1, 500);
      const account = await bankService.getAccount(1);
      expect(account.balance).toBe(500);
    });
  });
  ```

- [ ] **取款 - 余额不足**
  - 描述: 余额不足应失败
  - 输入: `{ userId: 1, amount: 2000 }`
  - 预期输出: 抛出 `InsufficientFundsError`
  - 测试代码框架:
  ```typescript
  it('should reject withdrawal with insufficient balance', async () => {
    await bankService.createAccount(1);
    await bankService.deposit(1, 100);
    await expect(bankService.withdraw(1, 200))
      .rejects.toThrow(InsufficientFundsError);
  });
  ```

- [ ] **转账**
  - 描述: 转账给其他用户
  - 输入: `{ fromUserId: 1, toUserId: 2, amount: 100 }`
  - 预期输出: 双方余额更新
  - 测试代码框架:
  ```typescript
  describe('BankService.transfer', () => {
    it('should transfer between accounts', async () => {
      await bankService.createAccount(1);
      await bankService.createAccount(2);
      await bankService.deposit(1, 1000);
      await bankService.transfer(1, 2, 100);
      const account1 = await bankService.getAccount(1);
      const account2 = await bankService.getAccount(2);
      expect(account1.balance).toBe(900);
      expect(account2.balance).toBe(100);
    });
  });
  ```

- [ ] **每日限额检查**
  - 描述: 检查是否超过每日交易限额
  - 输入: `{ userId: 1, amount: 50000 }`
  - 预期输出: 返回是否超限
  - 测试代码框架:
  ```typescript
  describe('BankService.checkDailyLimit', () => {
    it('should enforce daily limit', async () => {
      await bankService.createAccount(1);
      await bankService.deposit(1, 100000);
      await expect(bankService.withdraw(1, 50000))
        .rejects.toThrow('超过每日限额');
    });
  });
  ```

- [ ] **计算利息**
  - 描述: 计算并发放利息
  - 输入: `{}`
  - 预期输出: 所有账户获得利息
  - 测试代码框架:
  ```typescript
  describe('BankService.applyInterest', () => {
    it('should apply interest to accounts', async () => {
      await bankService.createAccount(1);
      await bankService.deposit(1, 10000);
      await bankService.applyInterest(); // 1% daily
      const account = await bankService.getAccount(1);
      expect(account.balance).toBe(10100);
    });
  });
  ```

### 集成测试

- [ ] **查看账户**
  - API端点: `GET /api/bank/account`
  - 预期响应: `200 OK`
  ```json
  {
    "balance": 5000,
    "dailyWithdrawn": 1000,
    "dailyLimit": 10000,
    "transactions": [...]
  }
  ```

- [ ] **转账操作**
  - API端点: `POST /api/bank/transfer`
  - 请求: `{ toUserId: 2, amount: 100, note: "还款" }`
  - 预期响应: `200 OK`

---

## 7. 短消息系统 (PM)

### 单元测试

- [ ] **发送消息**
  - 描述: 发送短消息
  - 输入: `{ fromUserId: 1, toUserId: 2, content: "Hello" }`
  - 预期输出: 消息被保存
  - 测试代码框架:
  ```typescript
  describe('PMService.send', () => {
    it('should send private message', async () => {
      const message = await pmService.send({
        fromUserId: 1,
        toUserId: 2,
        content: 'Hello World'
      });
      expect(message.content).toBe('Hello World');
      expect(message.toUserId).toBe(2);
    });
  });
  ```

- [ ] **标记已读**
  - 描述: 标记消息为已读
  - 输入: `{ messageId: 1, userId: 2 }`
  - 预期输出: 消息状态更新
  - 测试代码框架:
  ```typescript
  describe('PMService.markAsRead', () => {
    it('should mark message as read', async () => {
      const message = await pmService.send({
        fromUserId: 1,
        toUserId: 2,
        content: 'Test'
      });
      await pmService.markAsRead(message.id, 2);
      const updated = await pmService.findById(message.id);
      expect(updated.readAt).toBeTruthy();
    });
  });
  ```

- [ ] **获取对话列表**
  - 描述: 获取用户的所有对话
  - 输入: `{ userId: 1 }`
  - 预期输出: 返回对话列表
  - 测试代码框架:
  ```typescript
  describe('PMService.getConversations', () => {
    it('should return user conversations', async () => {
      await pmService.send({ fromUserId: 1, toUserId: 2, content: 'Hi' });
      await pmService.send({ fromUserId: 1, toUserId: 3, content: 'Hey' });
      const conversations = await pmService.getConversations(1);
      expect(conversations).toHaveLength(2);
    });
  });
  ```

- [ ] **搜索消息**
  - 描述: 搜索用户消息
  - 输入: `{ userId: 1, query: "keyword" }`
  - 预期输出: 返回匹配消息

### 集成测试

- [ ] **获取对话**
  - API端点: `GET /api/pm/conversations`
  - 预期响应: `200 OK`

- [ ] **发送消息**
  - API端点: `POST /api/pm/send`
  - 预期响应: `201 Created`

---

## 8. 通知系统 (Notifications)

### 单元测试

- [ ] **创建通知**
  - 描述: 创建新通知
  - 输入: `{ userId: 1, type: "reply", data: {...} }`
  - 预期输出: 通知被创建
  - 测试代码框架:
  ```typescript
  describe('NotificationService.create', () => {
    it('should create notification', async () => {
      const notification = await notificationService.create({
        userId: 1,
        type: 'reply',
        data: { threadId: 5, postId: 10 }
      });
      expect(notification.type).toBe('reply');
      expect(notification.read).toBe(false);
    });
  });
  ```

- [ ] **批量标记已读**
  - 描述: 批量标记通知为已读
  - 输入: `{ userId: 1 }`
  - 预期输出: 所有未读通知被标记
  - 测试代码框架:
  ```typescript
  describe('NotificationService.markAllRead', () => {
    it('should mark all notifications as read', async () => {
      await notificationService.create({ userId: 1, type: 'reply' });
      await notificationService.create({ userId: 1, type: 'mention' });
      await notificationService.markAllRead(1);
      const notifications = await notificationService.getUnread(1);
      expect(notifications).toHaveLength(0);
    });
  });
  ```

### 集成测试

- [ ] **获取通知列表**
  - API端点: `GET /api/notifications`
  - 预期响应: `200 OK`

---

## 9. 文件上传 (Upload)

### 单元测试

- [ ] **验证 MIME 类型**
  - 描述: 验证文件 MIME 类型
  - 输入: `{ mimeType: "image/jpeg" }`
  - 预期输出: 返回 true/false
  - 测试代码框架:
  ```typescript
  describe('UploadService.validateMimeType', () => {
    it('should accept valid mime type', () => {
      const isValid = uploadService.validateMimeType('image/jpeg');
      expect(isValid).toBe(true);
    });

    it('should reject invalid mime type', () => {
      const isValid = uploadService.validateMimeType('application/x-msdownload');
      expect(isValid).toBe(false);
    });
  });
  ```

- [ ] **验证文件签名**
  - 描述: 验证文件魔数
  - 输入: `{ buffer: <file-buffer>, extension: "jpg" }`
  - 预期输出: 返回 true/false
  - 测试代码框架:
  ```typescript
  describe('UploadService.validateSignature', () => {
    it('should validate JPEG signature', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const isValid = uploadService.validateSignature(jpegBuffer, 'jpg');
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const fakeBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      const isValid = uploadService.validateSignature(fakeBuffer, 'jpg');
      expect(isValid).toBe(false);
    });
  });
  ```

- [ ] **生成缩略图**
  - 描述: 生成图片缩略图
  - 输入: `{ imageBuffer: <buffer>, size: 150 }`
  - 预期输出: 返回缩略图 buffer
  - 测试代码框架:
  ```typescript
  describe('UploadService.generateThumbnail', () => {
    it('should generate thumbnail', async () => {
      const image = await fs.readFile('test/fixtures/image.jpg');
      const thumbnail = await uploadService.generateThumbnail(image, 150);
      expect(thumbnail).toBeInstanceOf(Buffer);
      expect(thumbnail.length).toBeLessThan(image.length);
    });
  });
  ```

### 集成测试

- [ ] **上传图片**
  - API端点: `POST /api/upload`
  - 请求: multipart/form-data with file
  - 预期响应: `200 OK`
  ```json
  {
    "url": "https://cdn.example.com/uploads/xxx.jpg",
    "thumbnailUrl": "https://cdn.example.com/uploads/xxx_thumb.jpg"
  }
  ```

### 安全测试

- [ ] **恶意文件上传**
  - 描述: 拒绝可执行文件
  - 攻击向量: 上传 .exe 文件伪装成 .jpg
  - 预期行为: 文件签名验证失败

---

## 10. 搜索系统 (Search)

### 单元测试

- [ ] **全文搜索**
  - 描述: 搜索主题/帖子
  - 输入: `{ query: "关键词", type: "threads" }`
  - 预期输出: 返回搜索结果
  - 测试代码框架:
  ```typescript
  describe('SearchService.search', () => {
    it('should search threads', async () => {
      await threadService.create({
        forumId: 1,
        userId: 1,
        title: 'TypeScript 教程',
        content: '...'
      });
      const results = await searchService.search('TypeScript', 'threads');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('TypeScript');
    });
  });
  ```

- [ ] **搜索建议**
  - 描述: 获取搜索建议
  - 输入: `{ query: "typ" }`
  - 预期输出: 返回建议列表

### 集成测试

- [ ] **搜索接口**
  - API端点: `GET /api/search?q=xxx`
  - 预期响应: `200 OK`

---

## 11. WebSocket 实时通信

### 单元测试

- [ ] **连接处理**
  - 描述: 用户连接 WebSocket
  - 输入: `{ socket: <socket>, userId: 1 }`
  - 预期输出: 用户被加入在线列表
  - 测试代码框架:
  ```typescript
  describe('WebSocketService.handleConnection', () => {
    it('should add user to online list', (done) => {
      const client = createClient();
      client.on('connect', () => {
        client.emit('auth', { token: '<valid-jwt>' });
        client.on('online', (users) => {
          expect(users).toContainEqual(expect.objectContaining({ id: 1 }));
          done();
        });
      });
    });
  });
  ```

- [ ] **推送通知**
  - 描述: 向用户推送通知
  - 输入: `{ userId: 1, notification: {...} }`
  - 预期输出: 通知被发送

### 集成测试

- [ ] **实时通知**
  - 描述: 通过 Socket.io 接收通知
  - 测试代码框架:
  ```typescript
  describe('WebSocket Notifications', () => {
    it('should receive notification in real-time', (done) => {
      const client = createClient();
      client.on('notification', (data) => {
        expect(data.type).toBe('reply');
        done();
      });
      // Trigger notification...
    });
  });
  ```

---

## 12. 安全模块 (Security)

### 单元测试

- [ ] **敏感数据加密**
  - 描述: 加密敏感字段
  - 输入: `{ data: "sensitive info" }`
  - 预期输出: 返回加密数据
  - 测试代码框架:
  ```typescript
  describe('SecurityService.encrypt', () => {
    it('should encrypt sensitive data', () => {
      const encrypted = securityService.encrypt('sensitive');
      expect(encrypted).not.toBe('sensitive');
      const decrypted = securityService.decrypt(encrypted);
      expect(decrypted).toBe('sensitive');
    });
  });
  ```

- [ ] **PII 数据脱敏**
  - 描述: 脱敏日志中的个人信息
  - 输入: `{ email: "user@example.com" }`
  - 预期输出: `u***@example.com`
  - 测试代码框架:
  ```typescript
  describe('SecurityService.maskPII', () => {
    it('should mask email', () => {
      const masked = securityService.maskEmail('user@example.com');
      expect(masked).toBe('u***@example.com');
    });

    it('should mask phone', () => {
      const masked = securityService.maskPhone('13812345678');
      expect(masked).toBe('138****5678');
    });
  });
  ```

- [ ] **速率限制检查**
  - 描述: 检查请求是否超限
  - 输入: `{ key: "user:1", limit: 10, window: 60 }`
  - 预期输出: 返回是否允许
  - 测试代码框架:
  ```typescript
  describe('RateLimitService.check', () => {
    it('should allow requests under limit', async () => {
      for (let i = 0; i < 9; i++) {
        await rateLimitService.check('user:1', 10, 60);
      }
      const result = await rateLimitService.check('user:1', 10, 60);
      expect(result.allowed).toBe(true);
    });

    it('should block requests over limit', async () => {
      for (let i = 0; i < 10; i++) {
        await rateLimitService.check('user:1', 10, 60);
      }
      const result = await rateLimitService.check('user:1', 10, 60);
      expect(result.allowed).toBe(false);
    });
  });
  ```

- [ ] **XSS 过滤**
  - 描述: 过滤 XSS 攻击代码
  - 输入: `{ html: "<script>alert(1)</script>" }`
  - 预期输出: 安全的 HTML
  - 测试代码框架:
  ```typescript
  describe('SecurityService.sanitizeHTML', () => {
    it('should remove script tags', () => {
      const clean = securityService.sanitizeHTML('<script>alert(1)</script>');
      expect(clean).not.toContain('<script>');
    });

    it('should allow safe tags', () => {
      const clean = securityService.sanitizeHTML('<p>Hello</p>');
      expect(clean).toContain('<p>');
    });
  });
  ```

### 安全测试

- [ ] **SQL 注入**
  - 攻击向量: `'; DROP TABLE users; --`
  - 预期行为: 参数被转义

- [ ] **XSS 攻击**
  - 攻击向量: `<img src=x onerror=alert(1)>`
  - 预期行为: 标签被移除

- [ ] **CSRF 攻击**
  - 攻击向量: 无 CSRF token 的 POST 请求
  - 预期行为: 返回 403

---

## 测试工具函数

### Mock 数据工厂
```typescript
// tests/factories/user.ts
export const userFactory = {
  create: (overrides = {}) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: 'SecurePass123!',
    ...overrides
  })
};

// tests/factories/thread.ts
export const threadFactory = {
  create: (overrides = {}) => ({
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    ...overrides
  })
};
```

### 测试辅助函数
```typescript
// tests/helpers/auth.ts
export async function createTestUser(overrides = {}) {
  return await prisma.user.create({
    data: userFactory.create(overrides)
  });
}

export async function createTestToken(userId: number) {
  return await jwtService.sign({ userId }, 'access');
}

export async function authenticateUser(app: Application, user: any) {
  const token = await createTestToken(user.id);
  return { Authorization: `Bearer ${token}` };
}
```

### 数据库清理
```typescript
// tests/setup/database.ts
export async function cleanupDatabase() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
}

export async function setupTestDatabase() {
  await cleanupDatabase();
  // Seed test data...
}
```

---

## 测试执行

### 运行所有测试
```bash
npm test
```

### 运行特定模块
```bash
npm test -- auth
npm test -- users
npm test -- pokemon
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

### 运行集成测试
```bash
npm run test:integration
```

### 运行安全测试
```bash
npm run test:security
```

---

## 持续集成

### GitHub Actions 配置示例
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 测试覆盖率目标

| 模块 | 目标覆盖率 | 优先级 |
|------|-----------|--------|
| Auth | ≥ 95% | 高 |
| Users | ≥ 90% | 高 |
| Forum Core | ≥ 85% | 高 |
| Pokemon | ≥ 80% | 中 |
| Bank | ≥ 90% | 高 |
| PM | ≥ 80% | 中 |
| Upload | ≥ 90% | 高 |
| Security | ≥ 95% | 高 |

---

## 测试最佳实践

1. **测试隔离**: 每个测试独立运行，不依赖其他测试
2. **快速失败**: 先测试失败条件，再测试成功条件
3. **清晰命名**: 测试名称应描述被测试的行为
4. **AAA 模式**: Arrange (准备) -> Act (执行) -> Assert (断言)
5. **Mock 外部依赖**: 数据库、Redis、邮件等
6. **使用工厂**: 统一生成测试数据
7. **清理状态**: 每个测试后清理数据库和缓存
8. **边界测试**: 测试空值、null、极大/极小值
9. **并发测试**: 测试竞态条件
10. **性能测试**: 关键路径需包含性能测试
