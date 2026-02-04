# Admin后台管理 - 深入分析报告（第4组）

## 分析概述

本报告包含Admin目录第4组文件的深入分析，包括：
- 数据库管理
- 日志系统
- 系统配置
- 工具函数

---

## 1. database.inc.php - 数据库管理（50KB）

### 文件结构
```
database.inc.php (约1500行)
├── 备份功能
│   ├── 数据库备份
│   ├── 选择表
│   ├── 分卷设置
│   ├── 压缩选项
│   └── 下载/存储
├── 恢复功能
│   ├── 上传备份文件
│   ├── 选择备份
│   ├── 执行恢复
│   └── 验证数据
├── 优化功能
│   ├── 表优化
│   ├── 表修复
│   ├── 索引优化
│   └── 查看表结构
└── SQL查询
    ├── 执行SQL
    ├── 导入/导出
    └── 字段信息
```

### 备份功能详解

#### 备份选项
```php
// 备份配置
$dumpsettings = array(
    'backup_type' => 'shell',  // shell方式或PHP方式
    'use_zip' => 1,           // 使用ZIP压缩
    'filename' => '',         // 备份文件名
    'filename_sufix' => 1,  // 添加时间戳后缀
    'volumsize' => 2048,     // 分卷大小(KB)
    'dumpfile_size' => 0,    // 当前分卷大小
);

// 选择要备份的表
$tables = $_POST['tables'];
// 格式: cdb_sessions, cdb_posts, ...
```

#### Shell备份命令
```bash
# 生成的mysqldump命令
mysqldump --opt --default-character-set=utf8 \
          --hex-blob --complete-insert \
          --add-drop-table --lock-tables \
          --skip-extended-insert \
          --quick \
          dbname > backup.sql
```

#### PHP备份实现
```php
// 逐表备份
foreach($tables as $table) {
    // 获取表结构
    $create_table = $db->query("SHOW CREATE TABLE $table");

    // 分批导出数据
    $offset = 0;
    $limit = 10000;

    do {
        $sql = "SELECT * FROM $table LIMIT $offset, $limit";
        $query = $db->query($sql);

        while($row = $db->fetch_array($query)) {
            // 生成INSERT语句
            // 写入备份文件
        }

        $offset += $limit;
    } while($count >= $limit);
}
```

### 恢复功能

#### 恢复流程
```
1. 上传备份文件
   ├── .sql文件
   ├── .zip压缩文件
   └── 多卷文件

2. 验证备份文件
   ├── 检查文件格式
   ├── 验证SQL语法
   └── 检查版本兼容性

3. 执行恢复
   ├── 禁用外键约束
   ├── 执行SQL语句
   ├── 重建索引
   └── 启用外键约束

4. 验证恢复结果
   ├── 检查错误日志
   ├── 验证数据完整性
   └── 显示恢复统计
```

#### 支持的备份格式
- .sql - SQL语句
- .sql.gz - gzip压缩
- .zip - ZIP压缩
- 多卷备份 - backup_1.sql, backup_2.sql, ...

### SQL查询功能

#### 安全措施
```php
// 权限检查
if($adminid != 1) {
    cpmsg('您没有权限执行此操作', 'error');
}

// SQL白名单检查
// 只允许执行 SELECT, SHOW, DESCRIBE 等安全操作
// 危险操作（DROP, DELETE等）需要超级管理员权限

// SQL执行
$result = $db->query($sql, $succeed);

// 显示结果
if($result && $succeed) {
    // 显示查询结果
} else {
    // 显示错误信息
}
```

---

## 2. logs.inc.php - 日志管理（21KB）

### 日志类型

| 日志类型 | 表 | 说明 |
|---------|-----|------|
| illegal | cdb_illegal | 非法登录日志 |
| rate | cdb_ratelog | 用户评分日志 |
| credits | cdb_creditslog | 积分变动日志 |
| mods | cdb_modworks | 版主操作日志 |
| ban | cdb_banned | 封禁管理日志 |
| cp | cdb_cplog | 控制面板日志 |
| error | cdb_errorlog | 错误日志 |

### 日志字段结构

#### 非法登录日志
```sql
CREATE TABLE cdb_illegal (
    id INT PRIMARY KEY,
    tid INT,              -- 主题ID
    pid INT,              -- 帖子ID
    uid INT,              -- 用户ID
    username VARCHAR(15),  -- 用户名
    attempt TINYINT,       -- 尝试次数
    ip VARCHAR(15),       -- IP地址
    dateline INT          -- 时间
);
```

#### 版主操作日志
```sql
CREATE TABLE cdb_modworks (
    id INT PRIMARY KEY,
    uid INT,              -- 版主ID
    username VARCHAR(15),  -- 版主用户名
    forumid INT,          -- 版块ID
    modaction TINYINT,    -- 操作类型
   操作类型:
    1: 删除主题
    2: 删除回复
    3: 批准主题
    4: 关闭主题
    5: 移动主题
    ...
    tid INT,             -- 主题ID
    pid INT,             -- 帖子ID
    subjects VARCHAR(255),  -- 主题标题
    dateline INT         -- 操作时间
);
```

### 日志查询

#### 搜索条件
```php
// 日志类型
$logtype = $_GET['type'];

// 时间范围
$searchfrom = $_GET['from'];
$searchto = $_GET['to'];

// 关键词
$keyword = $_GET['keyword'];

// 用户/版主
$uid = $_GET['uid'];
$username = $_GET['username'];

// 分页
$page = max(1, intval($_GET['page']));
$ppp = 20;

// 构建查询
WHERE 1=1
if($logtype) {
    // 过滤日志类型
}
if($keyword) {
    // 关键词搜索
}
if($from) {
    // 时间范围
    WHERE dateline >= $from AND dateline <= $to
}
```

### 日志导出

```php
// 导出为CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename=log_'.$type.'.csv');

// 输出CSV
echo "ID,时间,用户,IP,操作\n";

foreach($logs as $log) {
    echo "{$log['id']},{$log['dateline']},{$log['username']},{$log['ip']},{$log['action']}\n";
}

// 导出为Excel
// 可以使用PHPExcel库生成Excel文件
```

---

## 3. faq.inc.php - FAQ管理

### 数据结构

```sql
CREATE TABLE cdb_faqs (
    id INT PRIMARY KEY,
    fpid INT DEFAULT '0',    -- 父分类ID
    displayorder INT,
    identifier VARCHAR(50), -- 标识符
    title VARCHAR(255),    -- 问题
    message TEXT,          -- 答案
    type TINYINT,          -- 类型
    ...
);
```

### 分类结构

```
根分类 (fpid=0)
├── 注册相关
│   ├── 如何注册？
│   ├── 忘记密码怎么办？
│   └── ...
├── 功能使用
│   ├── 如何发帖？
│   ├── 如何上传图片？
│   └── ...
└── 账户管理
    ├── 如何修改头像？
    ├── 如何修改资料？
    └── ...
```

### FAQ操作

```php
// 添加FAQ
function add_faq($title, $message, $fpid, $identifier) {
    $sql = "INSERT INTO cdb_faqs
            (fpid, displayorder, title, message, type)
            VALUES ($fpid, $displayorder, '$title', '$message', '$type')";

    $db->query($sql);
}

// 编辑FAQ
function edit_faq($id, $title, $message, $fpid, $identifier) {
    $sql = "UPDATE cdb_faqs
            SET fpid='$fpid',
                title='$title',
                message='$message',
                identifier='$identifier'
            WHERE id=$id";

    $db->query($sql);
}

// 删除FAQ
function delete_faq($id) {
    $db->query("DELETE FROM cdb_faqs WHERE id=$id");
}
```

---

## 4. announcements.inc.php - 公告管理

### 数据结构

```sql
CREATE TABLE cdb_announcements (
    id INT PRIMARY KEY,
    subject VARCHAR(255),     -- 标题
    starttime INT,           -- 开始时间
    endtime INT,             -- 结束时间
    message TEXT,           -- 内容
    type TINYINT,           -- 类型（0=文字,1=链接）
    groups TEXT,             -- 可见用户组（序列化）
    displayorder INT,       -- 显示顺序
    author VARCHAR(15),      -- 发布者
    ...
);
```

### 公告类型

#### 类型0: 文字公告
```php
// 内容直接显示
<div class="announcement">
    <h3>$subject</h3>
    <div>$message</div>
    <p>发布者: $author | 时间: $starttime</p>
</div>
```

#### 类型1: 链接公告
```php
// 跳转到指定URL
<a href="$message">
    <h3>$subject</h3>
    <p>点击查看详情</p>
</a>
```

### 定时发布

```php
// 计算显示状态
$now = time();
$announcements = array();

foreach($all_announcements as $ann) {
    if($ann['starttime'] && $ann['starttime'] > $now) {
        // 未开始
        continue;
    }

    if($ann['endtime'] && $ann['endtime'] < $now) {
        // 已过期
        continue;
    }

    // 显示中
    $announcements[] = $ann;
}
```

### 权限控制

```php
// 显示公告的用户组
$groups = unserialize($announcement['groups']);
// 格式: array(1, 2, 3) - 用户组ID数组

// 检查用户权限
if(in_array($member['groupid'], $groups)) {
    // 用户有权限查看
    display_announcement($ann);
}
```

---

## 5. video.inc.php - 视频管理

### 支持的视频站点

```php
// 视频站点配置
$videosites = array(
    1 => 'youku',      // 优酷
    2 => 'ku6',        // 酷6
    3 => 'youtube',    // YouTube
    4 => 'tudou',      // 土豆
    5 => 'vimeo',     // Vimeo
    ...
    41 => 'other'      // 其他
);
```

### 视频嵌入代码

#### 优酷视频
```
[media=width,height,autoplay,0]
http://v.youku.com/v_show/id_XYZ123.html
[/media]
```

#### 土豆视频
```
[media=width,height,autoplay,0]
http://www.tudou.com/programs/view/Xyz123.html
[/media]
```

### 视频播放器

```javascript
// Flash播放器（旧版）
<embed src="player.swf"
       width="480"
       height="400"
       allowfullscreen="true"
       flashvars="file=video.flv">
</embed>

// HTML5播放器（新版）
<video width="480" height="400" controls>
    <source src="video.mp4" type="video/mp4">
</video>
```

---

## 6. runwizard.inc.php - 运行向导

### 向导步骤

```
步骤1: 论坛规模选择
├── 小型：<1000用户
├── 中型：1000-10000用户
└── 大型：>10000用户

步骤2: 安全级别设置
├── 基础安全
├── 标准安全
└── 高级安全

步骤3: 基本配置
├── 论坛名称
├── 管理员账号
└── 数据库配置

步骤4: 分类和版块初始化
├── 创建默认分类
├── 创建默认版块
└── 设置权限

步骤5: 完成
├── 生成配置文件
├── 初始化数据库
└── 创建管理员
```

### 配置保存

```php
// 每一步保存配置
$wizard_settings = array(
    'step' => $current_step,
    'size' => $_POST['size'],
    'security' => $_POST['security'],
    'sitename' => $_POST['sitename'],
    ...
);

// 保存到session或文件
save_wizard_settings($wizard_settings);
```

---

## 7. quickqueries.inc.php - 快速查询

### 预设查询

```php
// 论坛权限开关
// 批量设置论坛版块权限
$operations = array(
    'on' => 'forumstatus=1',
    'off' => 'forumstatus=0',
    'closed' => 'closed=1',
    'allon' => 'forumstatus=1', // 全部开启
    'alloff' => 'forumstatus=0', // 全部关闭
);

// 用户管理
$operations += array(
    'resetstyle' => 'styleid=""', // 重置样式
    'clearposts' => 'posts=0',    // 清空发帖数
    'cleardigest' => 'digests=0', // 清空精华数
    'resetcredit' => 'extcredits=0', // 清空积分
);

// 数据库清理
$operations += array(
    'delinactiveusers' => 'DELETE FROM cdb_members WHERE lastvisit < $timestamp',
    'cleanthreads' => 'DELETE FROM cdb_threads WHERE lastpost < $timestamp',
    ...
);
```

### 安全机制

```php
// 仅限超级管理员
if($adminid != 1) {
    cpmsg('您没有权限执行此操作', 'error');
}

// 操作确认
if(!isset($_POST['confirm']) || $_POST['confirm'] != 'yes') {
    cpmsg('请确认要执行此危险操作', 'form');
}

// 记录操作
cplog('执行快速查询: '.$operation);
```

---

## 8. zip.func.php - ZIP函数库

### ZIP压缩类

```php
class zipfile {
    var $datasec      = array();
    var $ctrl_dir     = array();
    var $end_central_directory = '';
    var $offset       = 0;

    // 添加文件到ZIP
    function addFile($file, $data, $opt = '') {
        // 计算文件信息
        // $file: 文件名
        // $data: 文件内容
        // $opt: 选项（压缩方法等）

        $this->datasec[$name] = array(
            'file' => $file,
            'size' => strlen($data),
            'compressed' => 0,
            'compression' => 0,
            'mtime' => time(),
        );

        return true;
    }

    // 生成ZIP文件
    function file() {
        // 生成ZIP文件
        // 返回ZIP二进制数据

        // ZIP文件结构
        // - 本地文件头
        // - 中央目录
        // - 文件数据
        // - 目录结束标记
        // - 结束标记
    }
}
```

### ZIP解压类

```php
class SimpleUnzip {
    var $comment;
    var $entries;
    var $filename;
    $dataptrs;

    // 读取ZIP文件
    function SimpleUnzip($filename) {
        $this->filename = $filename;
        $fp = @fopen($filename, 'rb');

        // 解析文件头
        // 解析中央目录
        // 解析文件列表
    }

    // 读取文件列表
    function getListing() {
        $list = array();

        foreach($this->entries as $entry) {
            $list[] = array(
                'filename' => $entry['filename'],
                'size' => $entry['size'],
                'compressed_size' => $entry['compressed_size'],
                'mtime' => $entry['mtime'],
            );
        }

        return $list;
    }

    // 提取单个文件
    function ExtractFile($index, $to) {
        // 检查索引
        // 解压数据
        // 写入目标文件
    }
}
```

### 压缩算法

| 算法 | ID | 说明 |
|------|----|------|
| Stored | 0 | 不压缩 |
| Deflated | 8 | DEFLATE算法（最常用）|
| Enhanced Deflated | 9 | 增强的DEFLATE |
| Imploded | 10 | Imploded（implode压缩）|
| Tokenized | 12 | Tokenized |

---

## 9. cpanel.share.php - 控制面板共享

### AdminSession类

```php
class AdminSession {
    var $session_id;
    var $adminid;
    var $adminname;
    var $timedout;
    var $error_count;

    // 创建会话
    function create($adminid, $adminname) {
        $this->session_id = md5(uniqid(microtime()));
        $this->adminid = $adminid;
        $this->adminname = $adminname;
        $this->timedout = 1800; // 30分钟
        $this->error_count = 0;

        // 保存到数据库或session
        $this->save();
    }

    // 验证会话
    function verify() {
        // 检查会话是否存在
        // 检查是否超时
        // 检查错误次数
    }

    // 销毁会话
    function destroy() {
        // 删除会话
    }
}
```

### 安全机制

```php
// IP白名单验证
if($admincp['checkip']) {
    $allowed_ips = explode("\n", trim($admincp['checkip']));

    if(!in_array($_SERVER['REMOTE_ADDR'], $allowed_ips)) {
        // IP不在白名单中
        cpmsg('您的IP不被允许访问', 'error');
    }
}

// 错误次数限制
if($session->error_count >= 3) {
    // 错误3次，锁定会话
    cpmsg('错误次数过多，请重新登录', 'error');
}
```

---

## 总结

### 第4组文件特点

这组文件提供了**完整的数据库和系统管理**功能：

1. **数据库管理**
   - 备份/恢复/优化
   - SQL查询执行
   - 多卷备份支持
   - ZIP压缩

2. **日志追踪**
   - 7种日志类型
   - 搜索和过滤
   - 导出功能
   - 审计追踪

3. **系统配置**
   - FAQ管理
   - 公告系统
   - 视频管理

4. **工具支持**
   - 运行向导
   - 快速查询
   - ZIP处理
   - 会话管理

### 关键技术点

1. **数据安全**
   - 完整的备份恢复机制
   - 多卷备份
   - 压缩存储
   - 完整性验证

2. **审计追踪**
   - 详细的操作日志
   - 多种日志类型
   - 时间范围查询
   - 导出分析

3. **用户体验**
   - 向导式安装
   - 快捷操作
   - 统一的消息提示
   - 错误处理

4. **扩展性**
   - 支持多种视频站点
   - 自定义FAQ分类
   - 可配置的公告
   - 灵活的备份选项
