# 权限系统分析

## 系统概述

Discuz! 6.1F 使用多层次的权限系统，包括用户组权限、版块权限、管理员权限和版主权限。

---

## 权限层次

```
权限系统
├── 用户组权限 (usergroups)
│   ├── 基础权限
│   ├── 主题权限
│   ├── 帖子权限
│   └── 特殊权限
├── 版块权限 (forums + access)
│   ├── 全局版块权限
│   └── 特殊用户权限
├── 管理员权限 (admingroups)
│   ├── 后台管理权限
│   └── 功能模块权限
└── 版主权限 (moderators)
    ├── 版块管理权限
    └── 内容审核权限
```

---

## 1. 用户组权限

### 数据表: cdb_usergroups

### 组类型

| 组ID | 组名 | 类型 |
|------|------|------|
| 1 | 游客 | 系统组 |
| 2 | 会员 | 系统组 |
| 3 | 管理员 | 系统组 |
| 4 | 超级版主 | 系统组 |
| 5 | 版主 | 系统组 |
| 6+ | 自定义组 | 普通组 |

### 权限字段结构

```php
$usergroup = [
    // 基础信息
    'groupid' => 组ID,
    'grouptitle' => 组名称,
    'creditshigher' => 积分下限,
    'creditslower' => 积分上限,
    'stars' => 星级,
    'color' => 颜色,
    'icon' => 图标,

    // 基础权限
    'allowvisit' => 允许访问,
    'readaccess' => 阅读权限,
    'allowgetattach' => 允许下载附件,
    'allowpost' => 允许发帖,
    'allowreply' => 允许回复,
    'allowpostpoll' => 允许发布投票,
    'allowpostreward' => 允许发布悬赏,
    'allowposttrade' => 允许发布交易,
    'allowpostactivity' => 允许发布活动,

    // 主题操作
    'allowdirectpost' => 直接发布(无需审核),
    'alloweditpost' => 允许编辑帖子,
    'allowdeletepost' => 允许删除帖子,
    'allowstickypost' => 允许置顶帖子,
    'allowdigestpost' => 允许设精华,

    // 附件权限
    'allowpostattach' => 允许上传附件,
    'allowpostimage' => 允许上传图片,
    'allowsetattachperm' => 允许设置附件权限,

    // 特殊权限
    'allowsearch' => 允许搜索,
    'allowcstatus' => 允许自定义状态,
    'allowuseblog' => 允许使用博客,
    'allowhidden' => 允许隐藏帖,
    'allowanonymous' => 允许匿名发帖,
    'allowstat' => 允许查看统计,

    // 管理
    'allowmodpost' => 允许管理帖子,
    'allowmoduser' => 允许管理用户,
    'allowmodrate' => 允许评分,

    // 限制
    'maxprice' => 最大售价,
    'maxpmnum' => 短消息数量,
    'maxsigsize' => 签名大小,
    'maxbiosize' => 简介大小,
    'maxattachsize' => 最大附件大小,
    'maxsizeperday' => 每日上传限制,
];
```

### 权限检查流程

```php
// 检查用户权限
function checkperm($perm) {
    global $forum, $discuz_uid;

    // 获取用户组权限
    $groupperms = $GLOBALS['groupperms'];

    // 检查是否有权限
    if($groupperms[$perm]) {
        return true;
    }

    // 检查版块特殊权限
    if($forum && isset($forum[$perm])) {
        return $forum[$perm];
    }

    return false;
}
```

---

## 2. 版块权限

### 数据表

| 表名 | 说明 |
|------|------|
| cdb_forums | 版块基础信息 |
| cdb_forumfields | 版块扩展字段和权限 |
| cdb_access | 特殊用户权限 |

### 版块权限结构

```php
$forum = [
    // 基础信息
    'fid' => 版块ID,
    'fup' => 上级版块,
    'type' => 类型(group/forum/sub),
    'name' => 名称,
    'status' => 状态,

    // 权限覆盖（可选，覆盖用户组权限）
    'allowview' => 允许查看,
    'allowpost' => 允许发帖,
    'allowreply' => 允许回复,
    'allowgetattach' => 允许下载附件,
    'allowpostattach' => 允许上传附件,

    // 附加权限
    'allowanonymous' => 允许匿名,
    'allowhtml' => 允许HTML,
    'allowbbcode' => 允许BBCode,
    'allowimgcode' => 允许图片代码,
    'allowsmilies' => 允许表情,

    // 其他设置
    'password' => 访问密码,
    'viewperm' => 查看权限(用户组),
    'postperm' => 发帖权限(用户组),
    'replyperm' => 回复权限(用户组),
    'getattachperm' => 下载权限(用户组),
    'postattachperm' => 上传权限(用户组),
];
```

### 特殊用户权限 (cdb_access)

```php
$access = [
    'uid' => 用户ID,
    'fid' => 版块ID,
    'allowview' => 允许查看,
    'allowpost' => 允许发帖,
    'allowreply' => 允许回复,
    'allowgetattach' => 允许下载,
];
```

### 权限检查流程

```php
// 检查版块访问权限
function forumperm($forum) {
    global $discuz_uid, $discuz_user;

    // 检查密码保护
    if($forum['password']) {
        // 验证密码
    }

    // 检查用户组权限
    if($forum['viewperm'] && !preg_match("/\t{$forum['viewperm']}\t/", $GLOBALS['forum']['viewperm'])) {
        return false;
    }

    // 检查特殊用户权限
    $access = $db->fetch_first(
        "SELECT * FROM {$tablepre}access WHERE uid='$discuz_uid' AND fid='{$forum['fid']}'"
    );

    if($access) {
        return $access['allowview'];
    }

    return true;
}
```

---

## 3. 管理员权限

### 数据表

| 表名 | 说明 |
|------|------|
| cdb_admins | 管理员账号 |
| cdb_admingroups | 管理员组权限 |

### 管理员类型

| adminid | 类型 | 说明 |
|---------|------|------|
| 1 | 超级管理员 | 所有权限 |
| 2 | 普通管理员 | 分配的权限 |
| 3 | 超级版主 | 版主权限 |
| -1 | 特殊 | 禁用 |

### 管理员组权限

```php
$admingroup = [
    'admingid' => 管理员组ID,
    'alloweditpost' => 允许编辑帖子,
    'alloweditpoll' => 允许编辑投票,
    'allowstickreply' => 允许置顶回复,
    'allowdelpost' => 允许删除帖子,
    'allowmassprune' => 允许批量删除,
    'allowrefund' => 允许退款,
    'allowcensorword' => 允许审核词,
    'allowviewip' => 允许查看IP,
    'allowbanip' => 允许封IP,
    'allowbanuser' => 允许封用户,
    'allowbanvisituser' => 允许禁止访问,
    'allowpostannounce' => 允许发布公告,
    'allowviewlog' => 允许查看日志,
    'disablepostctrl' => 禁用发帖控制',
    'supe_allowpush' => 允许推送,
];
```

### 后台权限检查

```php
// 检查后台权限
function admincheck($action) {
    global $adminid, $admingroup;

    // 超级管理员拥有所有权限
    if($adminid == 1) {
        return true;
    }

    // 检查具体权限
    if($admingroup[$action]) {
        return true;
    }

    return false;
}
```

---

## 4. 版主权限

### 数据表: cdb_moderators

```php
$moderator = [
    'uid' => 用户ID,
    'fid' => 版块ID,
    'displayorder' => 显示顺序,
    'inherited' => 是否继承,
];
```

### 版主权限检查

```php
// 检查是否为版主
function ismoderator($fid, $uid) {
    global $db, $tablepre;

    return $db->result_first(
        "SELECT uid FROM {$tablepre}moderators WHERE fid='$fid' AND uid='$uid'"
    );
}

// 检查版主权限
function modcheck($fid, $uid, $action) {
    // 首先检查是否为版主
    if(!ismoderator($fid, $uid)) {
        return false;
    }

    // 版主默认拥有的权限
    $modperms = [
        'allowmodpost' => true,
        'allowdelpost' => true,
        'alloweditpost' => true,
        'allowstickypost' => true, // 仅限本版块
        'allowdigestpost' => true,
    ];

    return isset($modperms[$action]) && $modperms[$action];
}
```

---

## 权限缓存

### 缓存文件

```
forumdata/cache/
├── cache_usergroups.php    # 用户组缓存
├── cache_admingroups.php   # 管理员组缓存
└── cache_forums.php        # 版块缓存
```

### 缓存结构

```php
// cache_usergroups.php
$_DCACHE['usergroups'] = [
    1 => [/* 游客组 */],
    2 => [/* 会员组 */],
    3 => [/* 管理员组 */],
    // ...
];
```

---

## 重构建议

### 1. 统一权限模型

```typescript
// 权限定义
enum Permission {
  // 论坛基础
  FORUM_VIEW = 'forum:view',
  FORUM_POST = 'forum:post',
  FORUM_REPLY = 'forum:reply',

  // 主题操作
  THREAD_EDIT = 'thread:edit',
  THREAD_DELETE = 'thread:delete',
  THREAD_STICKY = 'thread:sticky',
  THREAD_DIGEST = 'thread:digest',

  // 帖子操作
  POST_EDIT = 'post:edit',
  POST_DELETE = 'post:delete',

  // 附件
  ATTACH_UPLOAD = 'attach:upload',
  ATTACH_DOWNLOAD = 'attach:download',

  // 用户管理
  USER_BAN = 'user:ban',
  USER_DELETE = 'user:delete',

  // 管理员
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_FORUMS = 'admin:forums',
  ADMIN_USERS = 'admin:users',
}

// 角色定义
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

// 用户角色关联
interface UserRole {
  userId: number;
  roleId: string;
  scope?: 'global' | 'forum';
  scopeId?: number; // 版块ID
}

// 权限检查
async function hasPermission(
  user: User,
  permission: Permission,
  context?: { forumId?: number }
): Promise<boolean> {
  // 获取用户所有角色
  const roles = await getUserRoles(user.id);

  // 超级管理员
  if (roles.some(r => r.id === 'super_admin')) {
    return true;
  }

  // 检查权限
  for (const role of roles) {
    // 全局角色
    if (role.scope === 'global' && role.permissions.includes(permission)) {
      return true;
    }

    // 版块角色
    if (role.scope === 'forum' && context?.forumId === role.scopeId) {
      if (role.permissions.includes(permission)) {
        return true;
      }
    }
  }

  return false;
}
```

### 2. 数据库设计

```sql
-- 角色表
CREATE TABLE roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  module VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色权限关联
CREATE TABLE role_permissions (
  role_id VARCHAR(50),
  permission_id VARCHAR(50),
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- 用户角色关联
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  role_id VARCHAR(50),
  scope ENUM('global', 'forum') DEFAULT 'global',
  scope_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 版块角色关联（版主）
CREATE TABLE forum_moderators (
  forum_id INT,
  user_id INT,
  role_id VARCHAR(50),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (forum_id, user_id),
  FOREIGN KEY (forum_id) REFERENCES forums(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. 权限中间件

```typescript
// Koa中间件
import { Context } from 'koa';

export function requirePermission(permission: Permission) {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
      return;
    }

    const forumId = ctx.params.forumId || ctx.params.fid;
    const hasPerm = await hasPermission(user, permission, { forumId });

    if (!hasPerm) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
      return;
    }

    await next();
  };
}

// 使用
router.post(
  '/api/forums/:fid/threads',
  requirePermission(Permission.FORUM_POST),
  createThread
);
```

### 4. 前端权限检查

```typescript
// React权限Hook
function usePermission(permission: Permission, forumId?: number) {
  const { user } = useAuth();

  const [can, setCan] = useState(false);

  useEffect(() => {
    checkPermission(user, permission, { forumId }).then(setCan);
  }, [user, permission, forumId]);

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
