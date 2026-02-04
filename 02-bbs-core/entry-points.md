# BBS核心入口文件分析

## 入口文件清单

| 文件 | 功能 | 模板 |
|------|------|------|
| index.php | 首页 | discuz.htm |
| forumdisplay.php | 版块列表 | forumdisplay.htm |
| viewthread.php | 帖子阅读 | viewthread.htm |
| post.php | 发帖/编辑 | post*.htm |
| member.php | 会员相关 | member*.htm |
| misc.php | 杂项功能 | misc*.htm |
| admincp.php | 后台管理入口 | admincp*.htm |
| modcp.php | 版主管理入口 | modcp*.htm |
| ajax.php | AJAX处理 | - |
| plugin.php | 插件入口 | - |

---

## 1. index.php - 首页

### 执行流程
```
1. define('CURSCRIPT', 'index')
2. require_once './include/common.inc.php'
3. require_once DISCUZ_ROOT.'./include/forum.func.php'
4. 加载缓存（分类、版块、统计）
5. 处理静态缓存
6. 查询在线用户
7. 显示公告
8. include template('discuz')
```

### 核心功能
- 静态缓存支持（减少数据库查询）
- 分类/版块树状显示
- 在线用户列表
- 系统公告
- 论坛统计（主题数、帖子数、会员数）

### 数据库查询
```sql
-- 版块信息
SELECT f.fid, f.fup, f.type, f.name, f.status, f.displayorder,
       f.styleid, f_threads, f_posts, f_todayposts, f_lastpost...

-- 在线用户数
SELECT COUNT(*) FROM {$tablepre}sessions

-- 在线用户详情
SELECT s.uid, s.username, s.groupid, s.action, s.lastactivity,
       f.name, t.subject
FROM {$tablepre}sessions s
LEFT JOIN {$tablepre}forums f ON s.fid = f.fid
LEFT JOIN {$tablepre}threads t ON s.tid = t.tid
```

---

## 2. forumdisplay.php - 版块列表

### 执行流程
```
1. define('CURSCRIPT', 'forumdisplay')
2. 验证版块存在性
3. 检查查看权限
4. 处理版块密码
5. 加载子版块
6. 加置顶/精华/普通主题
7. 处理分页
8. include template('forumdisplay')
```

### 核心功能
- 权限验证（用户组、版块权限）
- 版块密码保护
- 子版块显示
- 主题筛选（精华、置顶、评分等）
- 主题排序（时间、回复数、查看数）
- 分页显示
- 在线用户（当前版块）

### 数据库查询
```sql
-- 子版块
SELECT f.fid, f.fup, f.type, f.name, f.status...
FROM {$tablepre}forums f
WHERE f.fup = '$fid' AND f.status > 0 AND f.type = 'forum'

-- 主题列表（带分页）
SELECT t.*, y.userhead, m.gender
FROM {$tablepre}threads t
LEFT JOIN {$tablepre}members m ON t.authorid = m.uid
LEFT JOIN {$tablepre}ywuser y ON t.authorid = y.uid
WHERE t.fid = '$fid'
ORDER BY t.displayorder DESC, t.lastpost DESC
LIMIT $start, $tpp

-- 置顶主题
SELECT t.* FROM {$tablepre}threads t
WHERE t.tid IN ($stickytids)
```

### 过滤参数
- `filter=type` - 按类型筛选（投票、悬赏、活动等）
- `filter=digest` - 精华主题
- `filter=lastpost` - 按最后回复排序
- `filter=heat` - 热门主题

---

## 3. viewthread.php - 帖子阅读

### 执行流程
```
1. define('CURSCRIPT', 'viewthread')
2. 验证主题存在性
3. 检查查看权限
4. 处理付费主题
5. 更新查看计数
6. 加载主题信息
7. 加载回复列表（分页）
8. 加载附件
9. include template('viewthread')
```

### 核心功能
- 主题验证（是否存在、是否删除）
- 权限检查（查看、下载附件）
- 付费主题支持
- 回复分页
- 楼层显示
- 附件显示（图片、文件）
- 快速回复
- 帖子管理（编辑、删除、评分）
- 相关主题推荐

### 数据库查询
```sql
-- 主题信息
SELECT t.*, y.userhead, m.gender
FROM {$tablepre}threads t
WHERE t.tid = '$tid'

-- 回复列表
SELECT p.*, m.uid, m.username, m.groupid, m.adminid, m.gender,
       m.signature, m.customstatus, m.showemail
FROM {$tablepre}posts p
LEFT JOIN {$tablepre}members m ON p.authorid = m.uid
WHERE p.tid = '$tid' AND p.invisible = '0'
ORDER BY dat LIMIT $start, $ppp

-- 附件
SELECT a.*, af.description, af.credit
FROM {$tablepre}attachments a
LEFT JOIN {$tablepre}attachmentfields af ON a.aid = af.aid
WHERE a.pid IN ($pids)
```

### 特殊功能
- 付费阅读（`price` 字段）
- 楼层直达（`#pid` 锚点）
- 只看楼主
- 打印版本
- 分享功能

---

## 4. post.php - 发帖/编辑

### 执行流程
```
1. define('CURSCRIPT', 'post')
2. require_once './include/post.func.php'
3. 权限检查（发帖、回复、编辑）
4. 处理上传附件
5. 内容过滤（敏感词、UBB代码）
6. 保存到数据库
7. 更新统计
8. 同步到UCenter
9. 跳转或显示消息
```

### 发帖类型
- `newthread` - 发布新主题
- `reply` - 回复主题
- `edit` - 编辑帖子
- `quote` - 引用回复

### 特殊主题类型
- 投票帖（`poll`）
- 悬赏帖（`reward`）
- 活动帖（`activity`）
- 辩论帖（`debate`）

### 核心功能
- 权限验证（版块权限、用户组、发帖间隔）
- 附件上传（多文件、图片预览）
- 内容验证（长度、格式）
- UBB代码解析
- 敏感词过滤
- 审核机制（直接发布/需审核）
- 积分扣除/奖励

### 数据库操作
```sql
-- 新建主题
INSERT INTO {$tablepre}threads (fid, subject, author, authorid, dateline, ...)
VALUES ('$fid', '$subject', '$username', '$uid', '$timestamp', ...)

-- 新建回复
INSERT INTO {$tablepre}posts (tid, fid, author, authorid, message, ...)
VALUES ('$tid', '$fid', '$username', '$uid', '$message', ...)

-- 更新版块统计
UPDATE {$tablepre}forums
SET threads = threads + 1, posts = posts + 1, lastpost = '$lastpost'
WHERE fid = '$fid'
```

---

## 5. member.php - 会员相关

### 执行流程
```
1. define('CURSCRIPT', 'member')
2. 根据 $action 参数处理不同请求
3. 加载对应模板
```

### 功能模块

| action | 功能 | 模板 |
|--------|------|------|
| (空) | 在线会员 | whosonline.htm |
| list | 会员列表 | memberlist.htm |
| list/uid | 查看会员资料 | viewprofile.htm |
| register | 注册 | register.htm |
| activate | 激活 | activate.htm |
| lostpasswd | 找回密码 | getpasswd.htm |
| group | 用户组 | usergroups.htm |
| credits | 积分详情 | credits.htm |
| trade | 交易管理 | trade.htm |

### 核心功能
- 用户注册/登录
- 会员列表（分页、搜索）
- 会员资料查看
- 积分查询/交易
- 忘记密码
- 邮件验证
- 用户组权限查看

---

## 6. misc.php - 杂项功能

### 执行流程
```
1. define('CURSCRIPT', 'misc')
2. 根据 $action 参数处理不同请求
3. 调用对应处理函数
```

### 功能模块

| action | 功能 |
|--------|------|
| fav | 收藏管理 |
| remove | 删除收藏/订阅 |
| myfav | 我的收藏 |
| mysubscription | 我的订阅 |
| rate | 评分 |
| viewratings | 查看评分 |
| email | 发送邮件 |
| bbcode | BB代码说明 |
| faq | 帮助文档 |
| notice | 公告详情 |
| secqaa | 验证问答 |
| seccode | 验证码 |
| report | 举报 |
| attach | 附件操作 |
| switch | 切换版本 |
| ajax | AJAX请求 |

---

## 7. admincp.php - 后台管理入口

### 执行流程
```
1. require_once './include/common.inc.php'
2. 验证管理员身份
3. 加载后台菜单
4. 根据 $action 路由到 admin/ 目录对应文件
5. include template('admincp_XXX')
```

### 权限要求
- `adminid == 1` - 超级管理员（所有权限）
- `adminid == 2` - 管理员（部分权限）
- 其他用户无权访问

### 管理功能模块（admin/目录）
| 文件 | 功能 |
|------|------|
| forums.inc.php | 版块管理 |
| groups.inc.php | 用户组管理 |
| members.inc.php | 会员管理 |
| database.inc.php | 数据库操作 |
| attachments.inc.php | 附件管理 |
| templates.inc.php | 模板管理 |
| styles.inc.php | 样式管理 |
| plugins.inc.php | 插件管理 |
| announcements.inc.php | 公告管理 |
| advertisements.inc.php | 广告管理 |
| logs.inc.php | 日志查看 |
| tools.inc.php | 工具箱 |

---

## 8. modcp.php - 版主管理入口

### 执行流程
```
1. require_once './include/common.inc.php'
2. 验证版主身份
3. 确定管理版块
4. 根据 $action 路由到 modcp/ 目录
5. include template('modcp_XXX')
```

### 版主权限
- 通过 `cdb_moderators` 表确定
- 支持版块级权限控制
- 版主可管理：主题审核、帖子编辑、用户管理

### 版主功能模块（modcp/目录）
| 文件 | 功能 |
|------|------|
| moderate.inc.php | 内容审核 |
| editpost.inc.php | 编辑帖子 |
| members.inc.php | 用户管理 |
| forums.inc.php | 版块管理 |
| logs.inc.php | 操作日志 |
| report.inc.php | 举报处理 |

---

## 9. ajax.php - AJAX处理

### 执行流程
```
1. define('CURSCRIPT', 'ajax')
2. 根据 $action 参数处理AJAX请求
3. 输出JSON或HTML片段
```

### AJAX功能
- 实时搜索
- 动态加载
- 表单验证
- 数据更新
- 消息通知

---

## 10. plugin.php - 插件入口

### 执行流程
```
1. define('CURSCRIPT', 'plugin')
2. 获取插件标识 $id
3. 加载插件配置
4. 执行插件代码
5. include template('plugin_XXX')
```

### 插件调用方式
```
plugin.php?id=插件标识符
plugin.php?id=插件标识符:方法名
```

### 插件数据表
- `cdb_plugins` - 插件列表
- `cdb_pluginhooks` - 插件钩子
- `cdb_pluginvars` - 插件变量

---

## 公共依赖

所有入口文件都依赖：

```php
// 核心初始化
require_once './include/common.inc.php';

// 论坛函数
require_once DISCUZ_ROOT.'./include/forum.func.php';

// 数据库类（已在 common.inc.php 中初始化）
$db = new dbstuff();
$db->connect(...);

// 用户信息（已在 common.inc.php 中加载）
$discuz_uid
$discuz_user
$discuz_userss
$discuzgroupid
```

---

## 执行流程总结

```
用户请求
    ↓
入口文件 (index.php, forumdisplay.php, etc.)
    ↓
common.inc.php (初始化: 数据库、Session、权限、缓存)
    ↓
业务逻辑处理
    ↓
数据库操作 (db_mysql.class.php)
    ↓
模板渲染 (template())
    ↓
输出HTML
```
