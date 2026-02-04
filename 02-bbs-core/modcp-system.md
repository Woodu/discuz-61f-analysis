# Modcp版主管理系统分析

## 系统概述

Modcp (Moderator Control Panel) 是Discuz!的版主管理面板，提供版块级别的管理功能。与AdminCP的全局管理不同，版主只能管理自己负责的版块。

## 目录结构

```
bbs/modcp/
├── moderate.inc.php          # 内容审核 (13KB)
├── members.inc.php           # 用户管理
├── forums.inc.php            # 版块管理
├── editpost.inc.php          # 编辑帖子
├── prune.inc.php             # 批量操作
├── report.inc.php            # 举报处理
├── logs.inc.php              # 操作日志
├── announcements.inc.php     # 公告管理
├── forumaccess.inc.php       # 版块权限
├── home.inc.php              # 首页
├── login.inc.php             # 登录
├── noperm.inc.php            # 无权限提示
└── index.php                 # 索引
```

---

## 权限系统

### 1. 版主身份验证

```php
// 验证版主身份
$ismoderator = modauth($fid, $discuz_uid);

// 检查版块权限
if(!$forum['ismoderator']) {
    showmessage('admin_nopermission');
}
```

### 2. 版主权限来源

**数据表**: `cdb_moderators`

```php
$moderator = [
    'uid' => 版主用户ID,
    'fid' => 管理的版块ID,
    'displayorder' => 显示顺序,
    'inherited' => 是否继承,
];
```

### 3. 权限限制

| 限制 | 说明 |
|------|------|
| 版块限制 | 只能管理负责的版块 |
| 用户限制 | 不能管理高等级用户（adminid < 自己） |
| 操作限制 | 部分危险操作需要更高权限 |

---

## 主要功能模块

### 1. 内容审核 (moderate.inc.php - 13KB)

**功能概述**: 审核待审核的帖子和回复

**审核流程**:

```
待审核内容列表
    ↓
选择操作
    ├── 通过
    ├── 删除
    ├── 忽略
    └── 批量操作
    ↓
更新状态
```

**待审核内容类型**:

| 类型 | 说明 |
|------|------|
| 新主题 | 需要审核的新主题 |
| 新回复 | 需要审核的回复 |
| 编辑 | 编辑后需要审核的内容 |

**涉及表**:
- `cdb_threads` - 主题
- `cdb_posts` - 帖子
- `validate` 字段标识待审核状态

**SQL示例**:
```sql
-- 查询待审核主题
SELECT * FROM cdb_threads
WHERE fid='$fid' AND displayorder='-2'
ORDER BY dateline DESC;

-- 查询待审核回复
SELECT * FROM cdb_posts
WHERE fid='$fid' AND invisible='-2'
ORDER BY dateline DESC;
```

---

### 2. 用户管理 (members.inc.php)

**功能概述**: 版块内的用户管理

**可用操作**:

| 操作 | 说明 | 限制 |
|------|------|------|
| 查看用户 | 查看用户信息 | 无 |
| 禁言 | 禁止用户发帖 | 不能禁高等级用户 |
| 解除禁言 | 恢复发帖权限 | 无 |
| 警告 | 发送警告消息 | 无 |
| 查看发帖 | 查看用户在本版块的帖子 | 无 |

**权限检查**:
```php
// 禁言操作权限检查
if($member['adminid'] <= $adminid) {
    showmessage('user_no_permission');
}
```

---

### 3. 版块管理 (forums.inc.php)

**功能概述**: 管理版块设置

**可编辑的版块设置**:

| 设置项 | 说明 |
|--------|------|
| 版块名称 | 修改版块名称 |
| 版块描述 | 修改版块描述 |
| 版块规则 | 修改版块规则 |
| 公告 | 发布版块公告 |
| 帖子排序 | 设置默认排序方式 |
| 主题类型 | 允许的主题类型 |

**不能修改**:
- 版块权限（需要后台管理）
- 版主设置（需要后台管理）
- 版块结构（需要后台管理）

---

### 4. 编辑帖子 (editpost.inc.php)

**功能概述**: 编辑用户的帖子和回复

**编辑权限**:

| 情况 | 是否可编辑 |
|------|-----------|
| 自己的帖子 | ✅ |
| 普通用户的帖子 | ✅ |
| 管理员的帖子 | ❌ |
| 高等级版主的帖子 | ❌ |

**编辑操作**:
- 修改内容
- 修改标题
- 添加附件
- 设置精华
- 设置置顶（仅限本版块）

---

### 5. 批量操作 (prune.inc.php)

**功能概述**: 批量管理主题和回复

**批量操作类型**:

| 操作 | 说明 |
|------|------|
| 批量删除 | 删除选中的主题/回复 |
| 批量移动 | 移动到其他版块 |
| 批量置顶 | 设置置顶 |
| 批量精华 | 设置精华 |
| 批量关闭 | 关闭主题 |
| 批量移动到回收站 | 软删除 |

**筛选条件**:
- 作者
- 时间范围
- 回复数范围
- 查看数范围
- 主题状态

---

### 6. 举报处理 (report.inc.php)

**功能概述**: 处理用户举报

**举报流程**:

```
用户举报
    ↓
生成举报记录
    ↓
版主查看
    ├── 忽略举报
    ├── 处理举报
    └── 转交管理员
    ↓
更新举报状态
```

**涉及表**:
- `cdb_reports` - 举报记录

**举报状态**:
| 状态 | 值 |
|------|-----|
| 待处理 | 0 |
| 已处理 | 1 |
| 已忽略 | 2 |

---

### 7. 操作日志 (logs.inc.php)

**功能概述**: 查看版主操作日志

**日志记录**:

| 操作类型 | 说明 |
|----------|------|
| 删除帖子 | 删除了哪些帖子 |
| 编辑帖子 | 编辑了哪些帖子 |
| 禁言用户 | 禁言了哪些用户 |
| 审核内容 | 审核通过/拒绝 |
| 移动主题 | 移动到哪个版块 |

**日志内容**:
```php
$log = [
    'uid' => 操作者ID,
    'username' => 操作者用户名,
    'action' => 操作类型,
    'fid' => 版块ID,
    'tid' => 主题ID,
    'pid' => 帖子ID,
    'data' => 操作数据,
    'dateline' => 操作时间,
];
```

---

### 8. 公告管理 (announcements.inc.php)

**功能概述**: 发布和管理版块公告

**公告类型**:

| 类型 | 说明 |
|------|------|
| 文字公告 | 纯文字公告 |
| URL公告 | 跳转到URL |
| 论坛公告 | 链接到主题 |

**公告设置**:
- 标题
- 内容
- 显示时间
- 显示顺序
- 目标用户组

---

### 9. 版块权限 (forumaccess.inc.php)

**功能概述**: 查看和设置特殊用户权限

**权限类型**:

| 权限 | 说明 |
|------|------|
| 访问权限 | 允许/禁止访问 |
| 查看权限 | 允许/禁止查看 |
| 发帖权限 | 允许/禁止发帖 |
| 回复权限 | 允许/禁止回复 |

**特殊权限表**:
- `cdb_access` - 用户版块访问权限

---

## 与AdminCP的区别

| 功能 | AdminCP | Modcp |
|------|---------|-------|
| 管理范围 | 全局论坛 | 指定版块 |
| 用户管理 | 所有用户 | 本版块用户 |
| 版块管理 | 所有设置 | 部分设置 |
| 危险操作 | 允许 | 禁止 |
| 系统设置 | 完全访问 | 不允许 |
| 模板编辑 | 允许 | 不允许 |

---

## 前端界面

### Modcp布局

```
┌────────────────────────────────────────┐
│  Logo    版主控制面板    用户信息       │
├────────┬───────────────────────────────┤
│        │                               │
│ 导航   │     主要内容区                │
│        │                               │
│ - 首页 │                               │
│ - 审核 │                               │
│ - 用户 │                               │
│ - 版块 │                               │
│ - 日志 │                               │
│        │                               │
└────────┴───────────────────────────────┘
```

### 模板文件

| 模板 | 说明 |
|------|------|
| modcp_header.htm | 头部 |
| modcp_footer.htm | 底部 |
| modcp_home.htm | 首页 |
| modcp_moderate.htm | 审核 |
| modcp_members.htm | 用户管理 |
| modcp_forum.htm | 版块管理 |

---

## 数据表关系

```
版主系统
    ├── cdb_moderators        # 版主关系
    ├── cdb_access           # 特殊权限
    ├── cdb_reports          # 举报
    ├── cdb_modworks         # 版主工作统计
    └── cdb_forumfields      # 版块扩展字段
```

---

## 重构建议

### 1. API设计

```
# 版主权限检查
GET    /api/modcp/permission/:fid

# 内容审核
GET    /api/modcp/pending/:fid
POST   /api/modcp/approve
POST   /api/modcp/reject

# 用户管理
GET    /api/modcp/users/:fid
POST   /api/modcp/users/:uid/ban
DELETE /api/modcp/users/:uid/ban

# 举报处理
GET    /api/modcp/reports/:fid
POST   /api/modcp/reports/:id/handle

# 操作日志
GET    /api/modcp/logs/:fid
```

### 2. 权限中间件

```typescript
// 版主权限检查
async function modPermission(fid: number, uid: number) {
  const moderator = await db.moderators.findOne({
    where: { fid, uid }
  });

  if (!moderator) {
    throw new Error('Not a moderator');
  }

  return moderator;
}

// 检查是否可以管理用户
function canManageUser(mod: Moderator, target: User): boolean {
  return target.adminid === 0 || target.adminid > mod.adminid;
}
```

### 3. 前端组件

```
pages/Modcp/
├── ModcpLayout.tsx          # 版主面板布局
├── Dashboard.tsx            # 首页
├── Moderate.tsx             # 内容审核
│   ├── ThreadList.tsx
│   ├── PostList.tsx
│   └── ReviewModal.tsx
├── Users.tsx                # 用户管理
│   ├── UserList.tsx
│   └── BanModal.tsx
├── Forums.tsx               # 版块管理
├── Reports.tsx              # 举报处理
│   ├── ReportList.tsx
│   └── HandleModal.tsx
└── Logs.tsx                 # 操作日志
```

### 4. 与AdminCP的集成

```typescript
// 统一权限系统
enum PermissionLevel {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  MODERATOR = 3,
  USER = 4,
}

interface AdminUser {
  id: number;
  username: string;
  level: PermissionLevel;
  permissions: string[];
  moderatorFor: number[]; // 管理的版块ID
}

// 权限检查
function hasPermission(
  user: AdminUser,
  permission: string,
  fid?: number
): boolean {
  // 超级管理员拥有所有权限
  if (user.level === PermissionLevel.SUPER_ADMIN) {
    return true;
  }

  // 检查具体权限
  if (!user.permissions.includes(permission)) {
    return false;
  }

  // 检查版块权限（版主）
  if (fid && user.level === PermissionLevel.MODERATOR) {
    return user.moderatorFor.includes(fid);
  }

  return true;
}
```
