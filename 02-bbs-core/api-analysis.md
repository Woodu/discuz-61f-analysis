# API接口分析

## 概述

Discuz! 6.1F 的API接口位于 `bbs/api/` 目录，包含内部API、UCenter API和外部支付API。

---

## 目录结构

```
bbs/api/
├── advcache.php            # 广告缓存更新
├── javascript.php          # JavaScript数据接口
├── uc.php                  # UCenter API
├── uc_1.0.php              # UCenter API 1.0版本
└── trade/                  # 支付交易API（加密）
    ├── alipay.php          # 支付宝
    ├── credit.php          # 信用支付
    └── tenpay.php          # 财付通
```

---

## 1. 内部API

### 1.1 advcache.php - 广告缓存

**类型**: 内部API
**功能**: 更新广告缓存

**参数**:
| 参数 | 说明 |
|------|------|
| type | 广告类型 |
| cid | 活动ID |
| update | 是否强制更新 |

**安全机制**:
- 整数验证
- 时间戳限制

**调用方式**:
```html
<script src="api/advcache.php?type=footer&cid=1"></script>
```

---

### 1.2 javascript.php - JS数据接口

**类型**: 内部API
**功能**: 提供JavaScript格式的数据

**参数**:
| 参数 | 说明 |
|------|------|
| key | 缓存键（可选）|
| verify | 验证码 |

**返回数据**:
- 用户信息
- 在线人数
- 新短消息
- 广告数据

**安全机制**:
- 域名白名单
- 数据签名验证

**调用示例**:
```javascript
<script src="api/javascript.php?key=userinfo"></script>
```

---

## 2. UCenter API

### 2.1 uc.php - UCenter接口

**类型**: UCenter API
**功能**: 与UCenter通信，实现用户同步

**支持的接口** (15个):

| 接口 | 说明 | 参数 |
|------|------|------|
| test | 测试连接 | - |
| deleteuser | 删除用户 | uid |
| renameuser | 重命名用户 | oldname, newname |
| getcredit | 获取积分 | uid, credit |
| getcreditsettings | 获取积分设置 | - |
| updatecreditsettings | 更新积分设置 | - |
| synlogin | 同步登录 | uid |
| synlogout | 同步登出 | - |
| updateclient | 更新应用 | - |
| updatepw | 修改密码 | username, password |
| getuser | 获取用户 | username |
| login | 用户登录 | username, password |
| email | 检查邮箱 | email |
| mergeuser | 合并用户 | olduid, newuid |
| friend | 好友操作 | uid, friendid, action |

**数据格式**: PHP序列化或JSON

**安全机制**:
- 时间戳验证
- 数据加密 (uc_authcode)
- IP白名单
- 操作密钥验证

---

### 2.2 uc_1.0.php - 旧版UC接口

**说明**: UCenter 1.0版本的兼容接口
**状态**: 已过时，与uc.php重复
**建议**: 可以删除，使用uc.php

---

## 3. 支付API (trade/)

**注意**: 这些文件使用Zend加密，无法直接分析源码

### 3.1 alipay.php - 支付宝

**类型**: 外部支付API
**功能**: 处理支付宝支付回调

**典型流程**:
1. 用户选择支付宝支付
2. 跳转到支付宝
3. 支付完成后回调此接口
4. 验证签名
5. 更新订单状态

### 3.2 tenpay.php - 财付通

**类型**: 外部支付API
**功能**: 处理财付通支付回调

### 3.3 credit.php - 信用支付

**类型**: 外部支付API
**功能**: 处理信用支付

**安全风险**:
- 使用Zend加密，无法审计代码
- 存在安全漏洞风险

---

## API调用示例

### 广告缓存更新
```html
<!-- 在页面底部调用 -->
<script src="api/advcache.php?type=footer&update=1"></script>
```

### 获取用户信息
```javascript
// 获取登录用户信息
<script src="api/javascript.php?key=userinfo"></script>
```

### UCenter同步登录
```php
// 用户登录后调用
uc_user_synlogin($uid);
// 内部会调用 api/uc.php?action=synlogin
```

---

## 安全机制分析

### 现有安全措施

| 措施 | 说明 | 覆盖范围 |
|------|------|----------|
| 整数验证 | 防止SQL注入 | 内部API |
| 域名白名单 | 限制调用来源 | JS API |
| 时间戳验证 | 防重放攻击 | UC API |
| 数据加密 | 保护传输数据 | UC API |
| IP白名单 | 限制服务器访问 | UC API |

### 安全缺陷

1. **缺乏API限流** - 可能被滥用
2. **缺乏完整的认证** - 内部API没有用户验证
3. **加密代码无法审计** - 支付API使用Zend加密
4. **缺乏请求签名** - 内部API签名机制不完善

---

## 重构建议

### 1. API标准化

**RESTful API设计**:
```
GET    /api/v1/users/:id        # 获取用户
POST   /api/v1/users            # 创建用户
PUT    /api/v1/users/:id        # 更新用户
DELETE /api/v1/users/:id        # 删除用户

GET    /api/v1/forums           # 获取版块
GET    /api/v1/forums/:id/threads # 获取主题

POST   /api/v1/auth/login       # 登录
POST   /api/v1/auth/logout      # 登出
GET    /api/v1/auth/me          # 当前用户
```

### 2. 认证升级

**JWT认证**:
```typescript
// 生成JWT
const token = jwt.sign(
  { userId: user.id },
  SECRET,
  { expiresIn: '7d' }
);

// 验证JWT
const decoded = jwt.verify(token, SECRET);
```

### 3. API版本控制

```
/api/v1/...  # 当前版本
/api/v2/...  # 未来版本
```

### 4. 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
}
```

### 5. 安全加固

- 实现API限流（rate limiting）
- 添加请求签名验证
- 支付API重新编写（移除Zend加密）
- 完善日志记录
- 添加CORS控制

### 6. 文档化

使用 OpenAPI/Swagger 自动生成API文档

### 7. SDK开发

为常用语言提供SDK:
- JavaScript/TypeScript
- PHP
- Python
- Go

---

## UCenter API迁移方案

### 方案A：保留UCenter

继续使用UCenter，重写API层：
```typescript
// UCenter API封装
class UCenterClient {
  async syncLogin(uid: number): Promise<void>
  async syncLogout(): Promise<void>
  async getUser(username: string): Promise<User | null>
  async updateUser(uid: number, data: any): Promise<boolean>
}
```

### 方案B：替换为JWT

完全废弃UCenter，使用JWT统一认证：
```typescript
// 用户登录
const user = await authenticate(username, password);
const token = jwt.sign({ userId: user.id }, SECRET);

// 跨应用同步
fetch('https://app1.com/api/auth/sync', {
  method: 'POST',
  body: JSON.stringify({ token })
});
fetch('https://app2.com/api/auth/sync', {
  method: 'POST',
  body: JSON.stringify({ token })
});
```

### 方案C：OAuth 2.0

建立统一的OAuth认证中心：
```
                    ┌─────────────┐
                    │  OAuth Server │
                    └─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  论坛    │      │  Home   │      │  其他应用 │
   └─────────┘      └─────────┘      └─────────┘
```

---

## 支付API重构

### 新支付架构

```typescript
// 支付接口
interface PaymentGateway {
  createOrder(amount: number, subject: string): Promise<string>;
  verifyNotification(data: any): Promise<boolean>;
  queryOrder(orderId: string): Promise<OrderStatus>;
}

// 支付宝实现
class AlipayGateway implements PaymentGateway {
  async createOrder(amount, subject) {
    // 调用支付宝API
  }
  // ...
}

// 财付通实现
class TenpayGateway implements PaymentGateway {
  // ...
}
```

---

## 总结

| API类型 | 文件数量 | 状态 | 建议 |
|---------|----------|------|------|
| 内部API | 2 | 需要改进 | RESTful重构 |
| UCenter API | 2 | 可用 | 长期替换为JWT |
| 支付API | 3 | 风险 | 重新编写 |

**优先级**:
1. 高：支付API（安全风险）
2. 中：UCenter API（架构改造）
3. 低：内部API（功能改进）
