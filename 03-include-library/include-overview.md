# Include核心库分析

## 目录结构

```
bbs/include/
├── admin/                    # 后台管理相关
├──.archiver.inc.php          # 存档版本
├── cache.func.php            # 缓存函数
├── common.inc.php            # 公共初始化（核心！）
├── cron.func.php             # 定时任务
├── db_*.php                  # 数据库类
├── discuz.func.php           # Discuz核心函数
├── editor.func.php           # 编辑器函数
├── global.func.php           # 全局函数
├── misc.func.php             # 杂项函数
├── newreply.func.php         # 回复处理
├── post.func.php             # 发帖处理
├── sendpm.func.php           # 短消息发送
├── space.inc.php             # 个人空间
└── javascript/              # JavaScript库
```

---

## 1. common.inc.php - 系统初始化核心

### 功能概述
这是Discuz!最重要的核心文件，所有入口文件都会首先加载它。

### 执行流程

```
1. 定义常量（脚本执行时间、内存限制）
2. 错误处理设置
3. 魔术引号处理
4. 全局变量安全检查
5. 数据库连接
6. 缓存加载
7. 用户认证
8. 权限检查
9. 模板初始化
10. 插件系统初始化
```

### 关键代码结构

```php
// 1. 环境检测
define('DISCUZ_ROOT', './');
define('IN_DISCUZ', true);
define('DISCUZ_RELEASE', '20090421');
define('DISCUZ_VERSION', '6.1.0');

// 2. 时区设置
date_default_timezone_set('UTC');

// 3. 安全检查（防止全局变量注入）
foreach(array('_COOKIE', '_POST', '_GET') as $_request) {
    foreach($$_request as $_key => $_value) {
        $_key{0} != '_' && $$_key = daddslashes($_value);
    }
}

// 4. 数据库连接
require_once DISCUZ_ROOT.'./include/db_'.$database.'.class.php';
$db = new dbstuff;
$db->connect($dbhost, $dbuser, $dbpw, $dbname, $pconnect, true, $dbcharset);
unset($dbhost, $dbuser, $dbpw, $dbname, $pconnect);

// 5. 加载缓存
require_once DISCUZ_ROOT.'./include/cache.func.php';
@extract($settings = getcacheinfo('settings', 1), EXTR_OVERWRITE);

// 6. 用户认证（与UCenter通信）
require_once DISCUZ_ROOT.'./uc_client/client.php';
list($discuz_uid, $discuz_user, $discuz_pw, $discuz_secques) = uc_addslashes(explode("\t", uc_authcode($uc_auth, 'DECODE')), 1);

// 7. Session处理
require_once DISCUZ_ROOT.'./include/session.inc.php';

// 8. 模板初始化
$tpldir = $tpldir ? $tpldir : dirname($styletplfile);

// 9. 插件钩子初始化
$pluginhooks = array();
```

### 初始化后可用的全局变量

| 变量 | 说明 |
|------|------|
| $db | 数据库连接对象 |
| $discuz_uid | 当前用户ID |
| $discuz_user | 当前用户名 |
| $discuz_pw | 当前用户密码 |
| $discuz_secques | 安全问答 |
| $discuzgroupid | 当前用户组ID |
| $timestamp | 当前时间戳 |
| $boardurl | 论坛URL |
| $tablepre | 表前缀 |

---

## 2. 数据库类 (db_mysql.class.php)

### 类结构

```php
class dbstuff {
    var $link;
    var $querynum = 0;
    var $dbcharset;
    var $tablepre;

    // 连接数据库
    function connect($dbhost, $dbuser, $dbpw, $dbname, $pconnect = 0, $quiet = 0)

    // 执行查询
    function query($sql, $type = '')

    // 获取结果集（数组）
    function fetch_array($query, $result_type = MYSQL_ASSOC)

    // 获取第一行第一列
    function result_first($sql)

    // 获取第一行
    function fetch_first($sql)

    // 获取所有行
    function fetch_all($sql)

    // 获取行数
    function num_rows($query)

    // 获取插入ID
    function insert_id()

    // 关闭连接
    function close()

    // 错误处理
    function halt($message = '', $sql = '')
}
```

### 使用示例

```php
// 查询
$query = $db->query("SELECT * FROM {$tablepre}threads WHERE tid='$tid'");
while($thread = $db->fetch_array($query)) {
    // 处理结果
}

// 获取单值
$subject = $db->result_first("SELECT subject FROM {$tablepre}threads WHERE tid='$tid'");

// 插入
$db->query("INSERT INTO {$tablepre}posts (message) VALUES ('$message')");
$pid = $db->insert_id();
```

---

## 3. global.func.php - 全局函数库

### 核心函数分类

#### 3.1 字符串处理

```php
// 转义HTML特殊字符
function dhtmlspecialchars($string) {
    if(is_array($string)) {
        foreach($string as $key => $val) {
            $string[$key] = dhtmlspecialchars($val);
        }
    } else {
        $string = str_replace(array('&', '"', '<', '>'), array('&amp;', '&quot;', '&lt;', '&gt;'), $string);
    }
    return $string;
}

// 添加斜杠（防SQL注入）
function daddslashes($string, $force = 0) {
    if(!MAGIC_QUOTES_GPC || $force) {
        if(is_array($string)) {
            foreach($string as $key => $val) {
                $string[$key] = daddslashes($val, $force);
            }
        } else {
            $string = addslashes($string);
        }
    }
    return $string;
}

// 截取字符串
function cutstr($string, $length, $dot = ' ...') {
    // 中文字符处理
}
```

#### 3.2 安全函数

```php
// 生成表单验证hash
function formhash() {
    global $discuz_user, $discuz_uid, $discuz_secques, $timestamp;
    return substr(md5(substr($discuz_user.$discuz_uid.$discuz_secques.$timestamp.substr(md5(random(6)), -8)), 0, 8);
}

// 验证表单hash
function submitcheck($var, $allowget = 0) {
    // 验证表单提交
}

// IP访问检查
function ipbanned($onlineip) {
    // 检查IP是否被封禁
}
```

#### 3.3 用户相关

```php
// 清除Cookie
function clearcookies() {
    global $cookiedomain, $cookiepath, $timestamp;
    dsetcookie('auth', '', -86400 * 365);
    dsetcookie('sid', '', -86400 * 365);
    dsetcookie('loginuser', '', -86400 * 365);
}

// 设置Cookie
function dsetcookie($var, $value, $life = 0, $prefix = 1) {
    // Cookie设置逻辑
}

// 用户头像URL
function avatar($uid, $size = 'small', $returnsrc = 0) {
    // 返回用户头像地址
}
```

#### 3.4 时间处理

```php
// 格式化时间
function dgmdate($timestamp, $format = 'dt', $timeoffset = '') {
    // 时间格式化
}

// 计算时区
function tmktime($hour, $minute, $second, $month, $day, $year) {
    // 时区时间戳
}
```

#### 3.5 缓存处理

```php
// 更新设置缓存
function updatesettings() {
    global $db, $tablepre;
    $settings = array();
    $query = $db->query("SELECT * FROM {$tablepre}settings");
    while($setting = $db->fetch_array($query)) {
        $settings[$setting['variable']] = $setting['value'];
    }
    savecacheinfo('settings', $settings);
}

// 获取缓存信息
function getcacheinfo($cachename, $mode = 0) {
    // 缓存读取
}

// 保存缓存信息
function savecacheinfo($cachename, $data = '') {
    // 缓存写入
}
```

#### 3.6 内容过滤

```php
// 敏感词过滤
function censor($message) {
    global $ censor;
    // 敏感词替换
}

// UBB代码解析
function bbcode2html($message) {
    // UBB转HTML
}

// 表情处理
function smiley($message) {
    // 表情替换
}
```

---

## 4. cache.func.php - 缓存系统

### 缓存类型

```php
// 更新所有缓存
function updatecache() {
    // 更新各个缓存项
}

// 更新设置缓存
function updatesettings() {
    // 系统设置缓存
}

// 更新版块缓存
function updateforums() {
    // 版块缓存
}

// 更新用户组缓存
function updateusergroups() {
    // 用户组缓存
}

// 更新风格缓存
function updatestyles() {
    // 风格/模板缓存
}

// 更新插件缓存
function updateplugins() {
    // 插件缓存
}
```

### 缓存存储位置
- 缓存文件：`forumdata/cache/cache_*.php`
- 运行时存储在 `$GLOBALS[]` 中

---

## 5. post.func.php - 发帖处理

### 核心功能

```php
// 发帖验证
function postcheck() {
    // 检查发帖权限、时间间隔、内容验证
}

// 新建主题
function newthread($fid, $subject, $message) {
    // 创建新主题
    // 1. 验证权限
    // 2. 过滤内容
    // 3. 写入 threads 表
    // 4. 写入 posts 表
    // 5. 更新版块统计
    // 6. 更新用户积分
    // 7. 同步到UCenter
}

// 回复主题
function newreply($tid, $message) {
    // 回复主题
    // 流程类似 newthread
}

// 编辑帖子
function editpost($pid, $message) {
    // 编辑帖子
}

// 附件处理
function attach_upload() {
    // 附件上传处理
}

// UBB代码解析
function post_bbcode2html($message) {
    // UBB转HTML
}
```

### 特殊帖子处理
- 投票帖
- 悬赏帖
- 活动帖
- 辩论帖

---

## 6. forum.func.php - 论坛函数

### 核心函数

```php
// 版块权限检查
function forum($fid) {
    // 检查用户是否有访问权限
    // 返回版块信息
}

// 导航生成
function navigation($forumname = '', $threadname = '') {
    // 生成面包屑导航
    // 首页 > 分类 > 版块 > 主题
}

// 在线用户
function whosonline() {
    // 获取在线用户列表
}

// 主题排序
function threadsort($forums) {
    // 主题排序处理
}

// 版块树
function forumselect() {
    // 生成版块下拉选择
}
```

---

## 7. misc.func.php - 杂项函数

### 功能模块

```php
// 搜索功能
function search() {
    // 全文搜索处理
}

// RSS生成
function rss() {
    // RSS订阅生成
}

// 邮件发送
function sendmail() {
    // 邮件发送
}

// 验证码
function seccode() {
    // 验证码生成/验证
}

// 统计更新
function updatemodworks() {
    // 更新版主工作统计
}

// 收藏/订阅
function favorites() {
    // 收藏管理
}
```

---

## 8. discuz.func.php - Discuz核心函数

### 核心功能

```php
// 用户积分计算
function updatecredit($uid, $credits) {
    // 更新用户积分
    // 支持多种积分类型
}

// 用户组权限检查
function checkgroupperm($groupid, $perm) {
    // 检查用户组权限
}

// 版主检查
function ismoderator($fid, $uid) {
    // 检查是否为版主
}

// 帖子删除
function deletethread($tid) {
    // 删除主题及所有回复
}

// 帖子移动
function movethread($tid, $newfid) {
    // 移动主题到其他版块
}
```

---

## 9. session.inc.php - 会话管理

### Session处理流程

```php
// 1. 清除过期Session
// 2. 创建/更新Session
// 3. 记录用户行为
// 4. 更新在线状态
// 5. 更新用户最后访问时间
```

### Session数据存储
- 表：`cdb_sessions`
- 字段：sid, uid, ip, lastactivity, action, fid, tid

---

## 10. 编辑器相关

### 编辑器函数
- `editor.func.php` - 编辑器初始化
- 支持UBB代码编辑
- 支持所见即所得编辑
- 支持附件上传

### JavaScript库
- `include/javascript/`
  - `common.js` - 公共函数
  - `ajax.js` - AJAX处理
  - `editor.js` - 编辑器
  - `popup.js` - 弹出菜单
  - `md5.js` - MD5加密

---

## 核心库依赖关系

```
入口文件 (index.php, etc.)
    ↓
common.inc.php
    ├→ db_mysql.class.php (数据库)
    ├→ cache.func.php (缓存)
    ├→ session.inc.php (会话)
    └→ uc_client/client.php (UCenter通信)
    ↓
业务处理
    ├→ global.func.php (全局函数)
    ├→ forum.func.php (论坛函数)
    ├→ post.func.php (发帖处理)
    └→ misc.func.php (杂项函数)
    ↓
模板渲染
```

---

## 重构要点

### 需要保留的核心逻辑
1. **安全机制**：SQL注入、XSS、CSRF防护
2. **权限系统**：用户组、版块权限
3. **缓存策略**：减少数据库查询
4. **积分系统**：复杂的积分规则
5. **插件架构**：钩子系统

### 可以优化的部分
1. **数据库操作**：使用ORM替代原生SQL
2. **模板引擎**：使用现代模板引擎
3. **会话管理**：使用Redis等
4. **用户认证**：JWT等现代方案
5. **代码结构**：模块化、面向对象
