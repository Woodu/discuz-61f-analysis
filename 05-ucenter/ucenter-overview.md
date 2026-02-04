# UCenter系统分析

## 系统概述

UCenter (User Center) 是Comsenz开发的统一用户中心系统，用于实现多个应用之间的用户数据同步和统一管理。

### 版本信息
- 版本：UCenter 1.5
- 发布时间：2008年
- 功能：用户统一、应用集成、数据同步

---

## 目录结构

```
ucenter/
├── admin.php              # 管理后台入口
├── avatar.php             # 头像处理
├── index.php              # 前台入口
├── control/               # 控制器目录
│   ├── admin/            # 后台控制器
│   ├── app.php           # 应用管理
│   ├── user.php          # 用户管理
│   ├── pm.php            # 短消息
│   ├── friend.php        # 好友系统
│   ├── credit.php        # 积分系统
│   ├── feed.php          # 动态系统
│   ├── mail.php          # 邮件系统
│   ├── tag.php           # 标签系统
│   └── domain.php        # 域名管理
├── model/                 # 模型目录
│   ├── admin.php         # 管理员模型
│   ├── app.php           # 应用模型
│   ├── base.php          # 基础模型
│   ├── user.php          # 用户模型
│   ├── pm.php            # 短消息模型
│   └── friend.php        # 好友模型
├── lib/                   # 库文件
│   ├── db.class.php      # 数据库类
│   ├── mail.class.php    # 邮件类
│   ├── seccode.class.php # 验证码类
│   └── ucfactory.class.php # 工厂类
├── view/                  # 视图目录
│   ├── default/          # 默认模板
│   └── admin/            # 后台模板
├── api/                   # API接口
│   ├── dbbak.php         # 数据库备份
│   └── ...               # 其他API
├── data/                  # 数据目录
│   ├── cache/            # 缓存
│   ├── avatar/           # 头像
│   ├── backup/           # 备份
│   ├── logs/             # 日志
│   └── tpl/              # 模板缓存
├── images/                # 图片资源
├── js/                    # JavaScript
├── plugin/                # 插件目录
├── release/               # 版本文件
└── install/               # 安装文件
```

---

## 核心功能模块

### 1. 用户管理 (control/user.php)

#### 功能清单

| 功能 | 说明 |
|------|------|
| 用户注册 | 注册新用户 |
| 用户登录 | 登录验证 |
| 用户编辑 | 编辑用户资料 |
| 用户删除 | 删除用户 |
| 用户合并 | 合并重复用户 |
| 批量操作 | 批量导入/导出 |

#### 用户数据结构

```php
// 用户基本信息
$uid          // 用户ID
$username     // 用户名
$password     // 密码（MD5）
$email        // 邮箱
$regip        // 注册IP
$regdate      // 注册时间
$lastloginip  // 最后登录IP
$lastlogintime // 最后登录时间
$salt         // 密码盐值
$secques      // 安全问答
```

#### 核心方法

```php
// 用户注册
function onregister() {
    // 1. 验证用户名
    // 2. 验证邮箱
    // 3. 检查重复
    // 4. 插入数据库
    // 5. 返回用户ID
}

// 用户登录
function onlogin() {
    // 1. 验证用户名密码
    // 2. 生成认证token
    // 3. 更新登录信息
    // 4. 返回用户数据
}

// 获取用户信息
function onget() {
    // 根据uid或用户名获取用户信息
}
```

---

### 2. 应用管理 (control/app.php)

#### 功能说明

UCenter可以管理多个应用（如Discuz论坛、UCenter Home等），实现用户数据同步。

#### 应用数据结构

```php
// 应用信息
$appid        // 应用ID
$appname      // 应用名称
$appurl       // 应用URL
$appip        // 应用IP（白名单）
$authkey      // 通信密钥
$charset      // 字符集
$dbhost       # 数据库主机
$dbuser       # 数据库用户
$dbname       # 数据库名
$tableprefix  # 表前缀
$tagtemplates # 标签模板
```

#### 核心方法

```php
// 添加应用
function onadd() {
    // 1. 验证应用信息
    // 2. 生成通信密钥
    // 3. 保存到数据库
}

// 编辑应用
function onedit() {
    // 编辑应用配置
}

// 删除应用
function ondelete() {
    // 删除应用
}

// 应用列表
function onls() {
    // 返回应用列表
}
```

---

### 3. 短消息系统 (control/pm.php)

#### 功能说明

跨应用的站内短消息系统。

#### 消息类型

| 类型 | 说明 |
|------|------|
| 1 | 私人消息 |
| 2 | 群发消息 |
| 3 | 系统通知 |

#### 核心方法

```php
// 发送消息
function onsend() {
    // 1. 验证接收者
    // 2. 检查权限
    // 3. 保存消息
    // 4. 通知接收者
}

// 获取消息列表
function onls() {
    // 返回消息列表
}

// 查看消息
function onview() {
    // 返回消息详情
}

// 删除消息
function ondelete() {
    // 删除消息
}
```

---

### 4. 好友系统 (control/friend.php)

#### 功能说明

跨应用的好友关系管理。

#### 好友状态

| 状态 | 说明 |
|------|------|
| 1 | 等待验证 |
| 2 | 已是好友 |
| 3 | 黑名单 |

#### 核心方法

```php
// 添加好友
function onadd() {
    // 1. 检查是否已是好友
    // 2. 添加好友请求
    // 3. 通知对方
}

// 删除好友
function ondelete() {
    // 删除好友关系
}

// 好友列表
function onls() {
    // 返回好友列表
}
```

---

### 5. 积分系统 (control/credit.php)

#### 功能说明

跨应用的积分同步和兑换。

#### 积分配置

```php
// 积分规则
$appid        // 应用ID
$credit       // 积分ID
$title        // 积分名称
$unit         // 积分单位
$ratio        // 兑换比例
```

#### 核心方法

```php
// 更新积分
function onupdate() {
    // 1. 验证权限
    // 2. 更新积分
    // 3. 同步到各应用
}

// 积分兑换
function onexchange() {
    // 1. 验证积分余额
    // 2. 执行兑换
    // 3. 记录日志
}
```

---

### 6. 动态系统 (control/feed.php)

#### 功能说明

用户动态/活动流（类似朋友圈、时间线）。

#### 动态类型

| 类型 | 说明 |
|------|------|
| blog | 日志 |
| album | 相册 |
| doing | 状态 |
| thread | 主题 |
| post | 回复 |

#### 核心方法

```php
// 发布动态
function onadd() {
    // 1. 验证内容
    // 2. 保存动态
    // 3. 推送给好友
}

// 获取动态
function onlist() {
    // 返回动态列表
}
```

---

## UCenter API

### API通信协议

UCenter使用 **UC_CLIENT** 模式与应用通信，采用 **JSON/PHP序列化** 数据格式。

### API接口列表

| 接口 | 说明 | 参数 |
|------|------|------|
| uc_user_register | 注册用户 | username, password, email |
| uc_user_login | 用户登录 | username, password |
| uc_user_synlogin | 同步登录 | uid |
| uc_user_synlogout | 同步登出 | - |
| uc_get_user | 获取用户 | username |
| uc_user_edit | 编辑用户 | username, oldpw, newpw, email |
| uc_user_delete | 删除用户 | uid |
| uc_pm_send | 发送短消息 | fromuid, touid, subject, message |
| uc_pm_list | 消息列表 | uid, limit |
| uc_friend_add | 添加好友 | uid, friendid |
| uc_credit_exchange | 积分兑换 | uid, from, to, amount |

### API调用示例

```php
// 客户端调用（在Discuz中）
require_once './uc_client/client.php';

// 用户登录
list($uid, $username, $password, $email) = uc_user_login($username, $password);

// 同步登录
if($uid > 0) {
    uc_user_synlogin($uid);
}

// 发送短消息
uc_pm_send($fromuid, $touid, $subject, $message);

// 更新积分
uc_credit_exchange($uid, 1, 2, 100); // 100个积分1兑换为积分2
```

---

## 通信机制

### 1. 认证流程

```
用户登录Discuz
    ↓
Discuz调用 uc_user_login()
    ↓
UCenter验证用户
    ↓
返回用户信息
    ↓
Discuz创建本地Session
    ↓
Discuz调用 uc_user_synlogin()
    ↓
UCenter通知所有应用
    ↓
其他应用创建Session（同步登录）
```

### 2. 通信方式

| 方式 | 说明 |
|------|------|
| PHP直接调用 | 同一服务器，直接包含UC_CLIENT |
| HTTP API | 不同服务器，通过HTTP请求 |
| JavaScript | 前端同步登录/登出 |

### 3. 安全机制

- **通信密钥** (authkey)：每个应用独立密钥
- **IP白名单**：限制通信来源
- **时间戳验证**：防止重放攻击
- **数据加密**：uc_authcode()加密传输

---

## 数据表结构

### 核心表

| 表名 | 说明 |
|------|------|
| uc_members | 用户表 |
| uc_admins | 管理员表 |
| uc_applications | 应用表 |
| uc_pms | 短消息索引 |
| uc_pm_messages | 短消息内容 |
| uc_pm_lists | 短消息列表 |
| uc_friends | 好友表 |
| uc_friendvars | 好友分组 |
| uc_creditsettings | 积分设置 |
| uc_feeds | 动态表 |
| uc_tags | 标签表 |
| uc_mailqueue | 邮件队列 |
| uc_settings | 系统设置 |
| uc_sqlcache | SQL缓存 |
| uc_visitors | 访客记录 |
| uc_protectedmembers | 受保护用户 |
| uc_banned | 被禁用户 |
| uc_domain_whitelist | 域名白名单 |
| uc_badwords | 敏感词 |

---

## uc_client分析

### 目录结构

```
bbs/uc_client/
├── client.php              # 客户端主文件
├── control/               # 控制器
│   ├── app.php
│   ├── user.php
│   ├── pm.php
│   ├── friend.php
│   └── cache.php
├── data/                  # 缓存
│   ├── cache/            # 缓存文件
│   └── settings.inc.php  # 配置文件
├── lib/                   # 库文件
│   ├── db.class.php      # 数据库类
│   ├── sendmail.inc.php  # 邮件发送
│   ├── xml.class.php     # XML处理
│   └── ucfactory.class.php # 工厂类
└── model/                 # 模型
    ├── base.php
    ├── user.php
    ├── pm.php
    └── friend.php
```

### 客户端配置

```php
// uc_client/data/config.inc.php
define('UC_CONNECT', 'mysql');         // 连接方式
define('UC_DBHOST', 'localhost');      // 数据库主机
define('UC_DBUSER', 'root');           // 数据库用户
define('UC_DBPW', '');                 // 数据库密码
define('UC_DBNAME', 'ucenter');        // 数据库名
define('UC_DBCHARSET', 'utf8');        // 字符集
define('UC_DBTABLEPRE', 'uc_');        // 表前缀
define('UC_DBCONNECT', 0);             // 持久连接
define('UC_KEY', 'examplekey');        // 通信密钥
define('UC_API', 'http://localhost/ucenter'); // UC API地址
define('UC_CHARSET', 'utf-8');         // 字符集
define('UC_IP', '');                   // UC IP
define('UC_APPID', 1);                 // 应用ID
```

---

## UCenter Home分析

### 目录结构

```
home/wwwroot/
└── default/
    └── index.html    # 简单的首页
```

### 功能说明

UCenter Home是个人空间/社交网络应用，类似于：
- 个人主页
- 好友动态
- 日志/博客
- 相册
- 状态

与UCenter紧密集成，共享用户数据。

---

## 重构策略

### 1. 用户统一方案

#### 选项A：保留UCenter架构
- 独立的用户服务
- 微服务架构
- API网关统一认证

#### 选项B：合并到主应用
- 用户模块内置
- JWT认证
- Redis Session

#### 选项C：第三方服务
- Auth0
- Firebase Auth
- 自建OAuth服务

### 2. 数据迁移

```sql
-- UCenter用户 → 新用户表
INSERT INTO new_users (id, username, email, password, created_at)
SELECT uid, username, email, password, regdate
FROM uc_members;

-- 应用关联 → OAuth表
INSERT INTO oauth_applications (user_id, app_id, app_name)
SELECT uid, appid, appname
FROM uc_applications;
```

### 3. API设计

```
POST   /api/auth/register     # 注册
POST   /api/auth/login        # 登录
POST   /api/auth/logout       # 登出
GET    /api/user/profile      # 用户信息
PUT    /api/user/profile      # 编辑资料
GET    /api/user/friends      # 好友列表
POST   /api/pm/send           # 发送消息
GET    /api/pm/list           # 消息列表
```

### 4. 同步登录

#### JWT方案

```javascript
// 登录成功后
const token = jwt.sign({ userId: user.id }, SECRET);

// 发送到各应用
fetch('https://app1.com/api/auth/sync', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
});
fetch('https://app2.com/api/auth/sync', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 迁移检查清单

- [ ] 导出UCenter用户数据
- [ ] 导出应用配置
- [ ] 导出短消息
- [ ] 导出好友关系
- [ ] 导出积分规则
- [ ] 设计新用户表结构
- [ ] 设计JWT认证流程
- [ ] 设计同步登录机制
- [ ] 设计积分同步方案
- [ ] 设计短消息系统
- [ ] 测试用户登录
- [ ] 测试同步登录
- [ ] 测试积分同步
