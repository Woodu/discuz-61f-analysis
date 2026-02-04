# Admin后台管理 - 深入分析报告（第2组）

## 分析概述

本报告包含Admin目录第2组文件的深入分析，包括：
- 内容管理文件
- 系统维护文件
- 工具和统计文件

---

## 1. threads.inc.php - 主题管理（418行）

### 核心功能

#### 1.1 搜索功能（第20-288行）

**搜索条件**：
```php
// 基础条件
$forums[]       // 版块选择
$users[]        // 用户选择
$keywords       // 关键词
$special        // 特殊主题类型
$viewmod        // 只看自己的主题
$digest         // 精华主题
	- digest=1: 一级精华
	- digest=2: 二级精华
	- digest=3: 三级精华
$views         // 浏览量范围
$replies        // 回复数范围
$dateline       // 发帖时间范围
$order         // 排序方式
```

**SQL查询构建**：
```sql
SELECT t.*, f.name as forumname
FROM {$tablepre}threads t
LEFT JOIN {$tablepre}forums f ON f.fid=t.fid
WHERE 1=1
    AND t.fid IN ($forums)
    AND t.authorid IN ($users)
ORDER BY $order
LIMIT $start, $ppp
```

#### 1.2 批量操作（第290-417行）

**支持的操作**：
```php
// 移动版块
$moveto = $_POST['moveto'];

// 修改类型
$type = $_POST['type'];
// special = 0-6 (普通, 投票, 交易, 悬赏, 活动, 辩论, RSS)
// displayorder = 0-3 (普通, 置顶1-3)
// highlight = 0-5 (高亮颜色)

// 批量删除
$deleteids = implode(',', $_POST['delete']);

// 批量置顶/取消置顶
$operations = $_POST['stickytids'];

// 批量加精/取消精华
$digests = $_POST['digests'];

// 批量打开/关闭
$operations = $_POST['closeids'];

// 批量移动到回收站
$operation = $_POST['operation'];

// 删除附件
$deleteattach = $_POST['deleteattach'];

// 批量修改分类
$_POST['typeid']
```

### 主题类型详解

| Special | Type | 说明 |
|---------|------|------|
| 0 | 0 | 普通主题 |
| 1 | 1 | 投票主题 |
| 2 | 2 | 交易主题 |
| 3 | 3 | 悬赏主题 |
| 4 | 4 | 活动主题 |
| 5 | 5 | 辩论主题 |
| 6 | 6 | RSS主题 |

### DisplayOrder 说明

| 值 | 说明 |
|----|------|
| -3 | 回收站 |
| -2 | 待审核 |
| -1 | 回收站 |
| 0 | 普通 |
| 1-3 | 置顶1-3级 |

---

## 2. prune.inc.php - 批量删除（309行）

### 权限控制

```php
// 根据管理员等级限制操作时间范围
if($adminid == 1) {
    // 超级管理员：无限制
} elseif($adminid == 2) {
    // 普通管理员：限制16天
    $maxprunedays = 16;
} elseif($adminid == 3) {
    // 版主：限制8天
    $maxprunedays = 8;
}
```

### 删除流程

```
1. 选择删除条件
   ├── 时间范围（X天前）
   ├── 用户范围
   ├── 版块范围
   ├── 是否包含回复
   └── 是否删除附件

2. 执行删除
   ├── 先删除附件（物理文件+数据库记录）
   ├── 删除帖子数据（cdb_posts）
   └── 删除主题数据（cdb_threads）

3. 更新统计
   ├── 更新用户发帖数
   ├── 更新版块主题数/帖子数
   └── 更新论坛统计

4. 清理缓存
   └── 更新相关缓存
```

### 性能优化

```php
// 使用UNBUFFERED查询提高性能
@set_time_limit(0);
@ob_end_clean();
@ob_implicit_flush(true);

// 分批处理
$threadsperpage = 100;
```

---

## 3. recyclebin.inc.php - 回收站（234行）

### 回收站机制

```php
// 软删除：displayorder = -1
function deletethreads($tids) {
    // 更新主题状态到回收站
    // 主题内容仍在数据库中
    $db->query("UPDATE {$tablepre}threads
              SET displayorder=-1,
                  dateline=$timestamp,
                  moderatedby=$_COOKIE['admincp']
              WHERE tid IN ($tids)");
}

// 永久删除
function undeletethreads($tids) {
    // 从回收站恢复
    $db->query("UPDATE {$tablepre}threads
              SET displayorder=0
              WHERE tid IN ($tids)");
}
```

### 清理功能

```php
// 自动清理超过N天的回收站主题
$autocycleperiod = 30; // 默认30天

// 查询待清理主题
$threads = $db->query("SELECT * FROM {$tablepre}threads
                          WHERE displayorder=-1
                          AND dateline < $timestamp
                          ORDER BY dateline DESC");

// 永久删除
deletethreads($tids);
```

---

## 4. moderate.inc.php - 内容审核（707行）

### 审核状态

| 状态 | Displayorder | 说明 |
|------|-------------|------|
| 待审核 | -2 | 需要审核才能显示 |
| 已忽略 | -3 | 管理员忽略的内容 |

### 三大审核模块

#### 4.1 会员审核（第16-207行）

```php
// 新注册用户状态
// groupid = 8: 待审核用户

// 审核操作
if($moderate = $_POST['moderate']) {
    foreach($moderate as $uid => $status) {
        if($status == 'approve') {
            // 通过审核
            $db->query("UPDATE {$tablepre_members
                      SET groupid=$groupid,
                          adminid=$adminid
                      WHERE uid=$uid");
        } elseif($status == 'reject') {
            // 拒绝审核
            $db->query("DELETE FROM {$tablepre_members
                      WHERE uid=$uid");
        } elseif($status == 'ignore') {
            // 忽略（保持待审核状态）
        }
    }
}
```

#### 4.2 主题审核（第291-526行）

```php
// 审核操作类型
- approve: 通过
- ignore: 忽略
- delete: 删除
- delete: 永久删除

// 审核后更新
$moderation = array(
    'status' => $status,
    'moderator' => $admin,
    'dateline' => $timestamp,
);

// 发送PM通知
if($_POST['reason'] && $_POST['notify']) {
    // 发送审核结果通知
}
```

#### 4.3 回复审核（第528-706行）

```php
// 回复审核逻辑
// 与主题审核类似
// 但操作的是 cdb_posts 表

// 待审核回复
// invisible = -2

// 审核通过
// invisible = 0

// 审核忽略
// invisible = -3
```

---

## 5. misc.inc.php - 杂项设置

### 5.1 在线列表管理

```php
// 配置各用户组在线显示
$onlinegroups = array(
    7 => array(
        'title' => '版主',
        'color' => 'red',
        'displayorder' => 1
    ),
    8 => array(
        'title' => '超级版主',
        'color' => 'purple',
        'displayorder' => 2
    ),
    ...
);

// 保存配置
$settings['onlinegroups'] = $onlinegroups;
```

### 5.2 友情链接管理

```sql
CREATE TABLE cdb_flinks (
    id INT PRIMARY KEY,
    displayorder INT,
    name VARCHAR(100),
    url VARCHAR(255),
    description VARCHAR(255),
    logo VARCHAR(255),
    type TINYINT(1)
);
```

### 5.3 Discuz!代码管理

```php
// 自定义BBCode标签
$bbcodes = array(
    'hot' => array(
        'replacement' => '<span class="hot">$1</span>',
        'params' => 1,
        nest => 1,
    ),
    'free' => array(
        'replacement' => '<div class="free">$1</div>',
        'params' => 1,
        'nest' => 1,
    ),
    ...
);

// 保存到 cache_bbcodes.php
```

---

## 6. tools.inc.php - 工具箱

### 6.1 缓存更新

```php
// 更新的缓存类型
$settings = array(
    'settings' => array(),          // 系统设置
    'forums' => array(),             // 版块缓存
    'usergroups' => array(),         // 用户组缓存
    'styles' => array(),             // 样式缓存
    'plugins' => array(),             // 插件缓存
    'bbcodes' => array(),             // BBCode缓存
    'smilies' => array(),             // 表情缓存
    'attachtypes' => array(),         // 附件类型
);

// 更新缓存
updatesettings();
updateforums();
updateusergroups();
...
```

### 6.2 文件权限检查

```php
// 检查关键目录权限
$checkdirs = array(
    './attachments'     => 0777,
    './forumdata/cache'  => 0777,
    './forumdata/templates' => 0777,
    './forumdata/threadcaches' => 0777,
);

// 检查并尝试修复权限
foreach($checkdirs as $dir => $perm) {
    if(!is_dir($dir)) {
        mkdir($dir, $perm);
    }
    chmod($dir, $perm);
}
```

---

## 7. counter.inc.php - 访问统计

### 统计更新

```php
// 更新版块统计
function updateforumcount($fid) {
    // 统计主题数
    $threads = $db->result_first("SELECT COUNT(*)
                                        FROM {$tablepre}threads
                                        WHERE fid='$fid'");

    // 统计帖子数
    $posts = $db->result_first("SELECT COUNT(*)
                                     FROM {$tablepre}posts
                                     WHERE fid='$fid'");

    // 更新版块表
    $db->query("UPDATE {$tablepre}forums
              SET threads=$threads,
                  posts=$posts
              WHERE fid='$fid'");
}

// 更新用户统计
function updateusercount($uid) {
    // 统计发帖数
    $threads = $db->result_first("SELECT COUNT(*)
                                        FROM {$tablepre}threads
                                        WHERE authorid='$uid'");

    // 统计精华数
    $digests = $db->result_first("SELECT COUNT(*)
                                        FROM {$tablepre}threads
                                        WHERE authorid='$uid'
                                        AND digest>0");

    // 更新用户表
    $db->query("UPDATE {$tablepre}members
              SET threads=$threads,
                  digestthreads=$digests
              WHERE uid='$uid'");
}
```

### 数据修正

```php
// 修正错误的统计数据
// 比如帖子数不正确等

// 重新计算用户发帖数
$query = $db->query("SELECT authorid, COUNT(*) as posts
                            FROM {$tablepre}posts
                            GROUP BY authorid");

while($user = $db->fetch_array($query)) {
    $db->query("UPDATE {$tablepre}members
              SET posts={$user['posts']}
              WHERE uid={$user['authorid']}");
}
```

---

## 8. checktools.inc.php - 检查工具

### 8.1 文件完整性检查

```php
// MD5校验文件
$md5file = DISCUZ_ROOT.'./forumdata/discuzmd5.md5';
$md5data = file($md5file);
$md5array = explode("\n", $md5data);

// 检查每个文件的MD5
foreach($md5array as $line) {
    list($file, $md5) = explode(',', trim($line));
    $realmd5 = md5_file(DISCUZ_ROOT.$file);

    if($realmd5 != $md5) {
        $badfiles[] = $file;
    }
}
```

### 8.2 FTP连接测试

```php
// 测试FTP连接
$ftp = @ftp_connect($ftphost, $ftpuser, $ftppw);

if($ftp) {
    // 测试登录
    $login = @ftp_login($ftp, $ftpuser, $ftppw);

    if($login) {
        // 测试操作
        // 如：列出目录、创建目录、上传文件
    }
}
```

---

## 总结

### 第2组文件特点

这组文件构成了**内容管理和系统维护**的核心：

1. **内容生命周期管理**
   - 主题创建→审核→显示→删除→回收站→清理

2. **批量操作支持**
   - 高效的批量处理
   - 数据一致性保证
   - 操作日志记录

3. **系统维护工具**
   - 缓存管理
   - 权限检查
   - 数据修正
   - 文件验证

4. **安全机制**
   - 权限分级
   - 时间范围限制
   - 操作确认
   - 详细日志
