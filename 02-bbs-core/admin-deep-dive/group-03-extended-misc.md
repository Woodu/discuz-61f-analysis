# Admin后台管理 - 深入分析报告（第3组-扩展模块）

## 概述

本文档包含对6个扩展管理模块的深入分析：
1. **magics.inc.php** - 道具系统
2. **medals.inc.php** - 勋章系统
3. **styles.inc.php** - 风格管理
4. **templates.inc.php** - 模板编辑
5. **smilies.inc.php** - 表情管理
6. **advertisements.inc.php** - 广告管理

---

## 1. magics.inc.php - 道具系统（~302行）

### 核心功能

#### 道具类型（Type字段）

| Type | 说明 | 示例 |
|------|------|------|
| **1** | 普通道具 | 隐身卡、改名卡 |
| **2** | 指向性道具 | 查岗卡、强退卡 |
| **3** | 特殊道具 | 金卡、超级卡 |

### 数据表结构

```sql
-- 道具定义表
CREATE TABLE cdb_magics (
    magicid INT PRIMARY KEY AUTO_INCREMENT,
    type TINYINT(3),                    -- 道具类型
    name VARCHAR(50),                    -- 道具名称
    identifier VARCHAR(40) UNIQUE,       -- 唯一标识
    description TEXT,                    -- 道具描述
    displayorder SMALLINT(6),
    price INT,                           -- 售价（积分）
    num INT,                            -- 库存数量
    supplytype TINYINT(1),              -- 0=无限制 1=每天 2=每周 3=每月
    supplynum INT,                      -- 供应数量
    weight SMALLINT(5),                 -- 权重
    filename VARCHAR(50),               -- 实现文件
    magicperm TEXT,                     -- 序列化权限
    available TINYINT(1)                -- 启用状态
);

-- 道具库存表
CREATE TABLE cdb_membermagics (
    uid INT,
    magicid INT,
    num SMALLINT(6) UNSIGNED,
    type TINYINT(1),
    dateline INT,
    PRIMARY KEY (uid, magicid)
);

-- 道具市场表
CREATE TABLE cdb_magicmarket (
    mid INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    magicid INT,
    price INT,
    num SMALLINT(6),
    dateline INT
);

-- 道具使用日志
CREATE TABLE cdb_magiclog (
    logid INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    magicid INT,
    magicnum SMALLINT(6),
    magicprice INT,
    magictext TEXT,
    useip VARCHAR(15),
    dateline INT
);
```

### 常见道具类型

```php
// 隐身卡 - 隐藏在线状态
$magics['stealth'] = array(
    'name' => '隐身卡',
    'description' => '使用后30分钟内隐身',
    'price' => 100,
    'type' => 1
);

// 改名卡 - 修改用户名
$magics['rename'] = array(
    'name' => '改名卡',
    'description' => '可以修改一次用户名',
    'price' => 500,
    'type' => 1
);

// 金卡 - 增加积分
$magics['gold'] = array(
    'name' => '金卡',
    'description' => '使用后获得1000积分',
    'price' => 800,
    'type' => 1
);

// 删除帖 - 删除指定帖子
$magics['deletepost'] = array(
    'name' => '删除帖',
    'description' => '删除指定用户的帖子',
    'price' => 200,
    'type' => 2
);

// 查岗卡 - 查看用户IP
$magics['check'] = array(
    'name' => '查岗卡',
    'description' => '查看指定用户的IP地址',
    'price' => 150,
    'type' => 2
);

// 强退卡 - 强制用户下线
$magics['forceexit'] = array(
    'name' => '强退卡',
    'description' => '强制指定用户下线',
    'price' => 300,
    'type' => 2
);

// 置顶帖 - 置顶主题
$magics['stick'] = array(
    'name' => '置顶帖',
    'description' => '置顶主题24小时',
    'price' => 500,
    'type' => 3
);

// 高亮帖 - 高亮主题
$magics['highlight'] = array(
    'name' => '高亮帖',
    'description' => '高亮主题颜色',
    'price' => 200,
    'type' => 3
);
```

### 道具权限结构

```php
// 权限配置（序列化存储）
$magicperm = array(
    'usergroups' => "\t1\t2\t3\t",        -- 允许使用的用户组
    'targetgroups' => "\t4\t5\t",        -- 可作用的用户组
    'forum' => "\t10\t20\t",             -- 限制版块
    'useperday' => 5,                    -- 每日使用次数
    'useperiod' => 3600                  -- 使用间隔（秒）
);
```

### 关键代码片段

```php
// 道具使用逻辑
function use_magic($uid, $magicid, $target = 0) {
    global $db;

    // 1. 检查道具是否存在
    $magic = get_magic($magicid);
    if(!$magic || !$magic['available']) {
        return '道具不存在或已禁用';
    }

    // 2. 检查用户库存
    $inventory = $db->fetch_first("SELECT * FROM cdb_membermagics
                                     WHERE uid='$uid' AND magicid='$magicid'");
    if(!$inventory || $inventory['num'] <= 0) {
        return '道具数量不足';
    }

    // 3. 检查权限
    $perm = unserialize($magic['magicperm']);
    if(!in_array($user['groupid'], explode("\t", $perm['usergroups']))) {
        return '您无权使用此道具';
    }

    // 4. 执行道具效果
    $result = execute_magic($magic, $uid, $target);

    // 5. 扣除库存
    $db->query("UPDATE cdb_membermagics
                SET num=num-1 WHERE uid='$uid' AND magicid='$magicid'");

    // 6. 记录日志
    $db->query("INSERT INTO cdb_magiclog
                (uid, magicid, magicnum, magicprice, useip, dateline)
                VALUES ('$uid', '$magicid', 1, '$magic[price]', '$ip', '".time()."')");

    return $result;
}
```

---

## 2. medals.inc.php - 勋章系统（~336行）

### 数据表结构

```sql
-- 勋章定义表
CREATE TABLE cdb_medals (
    medalid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    available TINYINT(1),               -- 启用状态
    image VARCHAR(50),                  -- 勋章图片
    displayorder SMALLINT(6),
    description TEXT,
    type TINYINT(1),                    -- 0=管理员颁发 1=自动颁发
    expiration INT,                     -- 有效期（秒）
    permission TEXT                     -- 颁发条件公式
);

-- 勋章颁发日志
CREATE TABLE cdb_medallog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    medalid INT,
    type TINYINT,                       -- 1=有效 2=待审核 3=无效
    status TINYINT,                     -- 0=永久 1=有时限
    expiration INT,                     -- 过期时间
    dateline INT
);

-- 用户勋章存储（在memberfields中）
-- cdb_memberfields.medals 存储格式：medalid|expiration\tmedalid|expiration
```

### 勋章类型

```php
// Type 0: 管理员手动颁发
$medal_manual = array(
    'name' => '贡献勋章',
    'type' => 0,
    'description' => '由管理员手动颁发'
);

// Type 1: 自动颁发（基于条件公式）
$medal_auto = array(
    'name' => '发帖达人',
    'type' => 1,
    'permission' => 'posts >= 100',
    'description' => '发帖数达到100自动获得'
);
```

### 自动颁发公式系统

支持的公式变量：

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `digestposts` | 精华帖子数 | 50 |
| `posts` | 总发帖数 | 1000 |
| `oltime` | 在线时间（秒） | 36000 |
| `pageviews` | 页面浏览量 | 10000 |
| `extcredits[1-8]` | 各类积分 | 参考积分配置 |
| `regdate` | 注册时间 | 时间戳 |
| `regip` | 注册IP | IP地址 |

### 公式示例

```php
// 简单条件
'posts > 100'                          // 发帖大于100
'extcredits[1] >= 500'                 // 威望大于500

// 复合条件
'posts > 100 AND digestposts > 10'     // 发帖100且精华10
'extcredits[2] >= 1000 OR oltime > 72000'  // 金币1000或在线20小时

// 复杂公式
'(digestposts * 10 + posts * 2) / 10 >= 50'  // 综合评分

// 公式验证
function validate_formula($formula) {
    // 转换为PHP可执行代码
    $php_formula = preg_replace(
        '/(digestposts|posts|pageviews|oltime|extcredits\[[1-8]\])/',
        '$_DSESSION[\'\\1\']',
        $formula
    );

    // 测试执行
    return @eval("return ($php_formula);") !== false;
}

// 运行时执行
function check_medal_condition($uid, $formula) {
    global $db;

    // 获取用户数据
    $user = $db->fetch_first("SELECT posts, digestposts, oltime, regdate
                                FROM cdb_members WHERE uid='$uid'");

    // 构建评估环境
    $_DSESSION = array(
        'posts' => $user['posts'],
        'digestposts' => $user['digestposts'],
        'oltime' => $user['oltime'],
        'pageviews' => $user['pageviews'],
        'extcredits' => array(...)
    );

    // 执行公式
    $result = eval("return ($formula);");

    return $result === true;
}
```

### 勋章存储格式

```php
// cdb_memberfields.medals 字段格式
// 格式: medalid|expiration\tmedalid|expiration

// 示例: 用户拥有3个勋章
"1|0\t2|1672531200\t3|1675209600"

// 解析
$medals = array();
$medal_list = explode("\t", $user['medals']);
foreach($medal_list as $medal_str) {
    list($medalid, $expiration) = explode('|', $medal_str);
    $medals[] = array(
        'medalid' => $medalid,
        'expiration' => $expiration  // 0表示永久
    );
}

// 检查勋章是否过期
function is_medal_expired($expiration) {
    return $expiration > 0 && $expiration < time();
}
```

---

## 3. styles.inc.php - 风格管理（~398行）

### 数据表结构

```sql
-- 风格定义表
CREATE TABLE cdb_styles (
    styleid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    templateid INT,                     -- 关联模板ID
    available TINYINT(1)
);

-- 模板定义表
CREATE TABLE cdb_templates (
    templateid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    directory VARCHAR(100),             -- 模板目录路径
    copyright VARCHAR(200)
);

-- 风格变量表
CREATE TABLE cdb_stylevars (
    stylevarid INT PRIMARY KEY AUTO_INCREMENT,
    styleid INT,
    variable VARCHAR(30),               -- CSS变量名
    substitute TEXT                     -- CSS值
);
```

### 预定义CSS变量

```php
$predefinedvars = array(
    // 颜色变量
    'bgcolor' => '页面背景色',
    'altbg1' => '交替背景色1',
    'altbg2' => '交替背景色2',
    'link' => '链接颜色',
    'bordercolor' => '边框颜色',
    'headercolor' => '头部背景色',
    'headertext' => '头部文字色',
    'catcolor' => '分类背景色',
    'tabletext' => '表格文字色',
    'text' => '正文颜色',
    'lighttext' => '浅色文字',
    'highlightlink' => '高亮链接色',

    // 字体变量
    'font' => '默认字体',
    'fontsize' => '默认字号',
    'msgfontsize' => '消息字号',
    'msgbigsize' => '大消息字号',
    'msgsmallsize' => '小消息字号',
    'smfont' => '小字体',
    'smfontsize' => '小字号',

    // 布局变量
    'borderwidth' => '边框宽度',
    'tablespace' => '表格间距',
    'maintablewidth' => '主表格宽度',
    'boxspace' => '盒子间距',
    'inputborder' => '输入框边框',

    // 背景变量
    'tablebg' => '表格背景',
    'portalboxbgcode' => '门户盒子背景',
    'noticebg' => '公告背景',
    'commonboxborder' => '通用盒子边框',
    'commonboxbg' => '通用盒子背景'
);
```

### 风格导出格式

```php
// 风格导出数据结构
$style_data = array(
    'version' => '6.1.0',
    'name' => '风格名称',
    'templateid' => 1,
    'tplname' => '模板名称',
    'directory' => './templates/default',
    'copyright' => '版权信息',
    'stylevars' => array(
        'bgcolor' => '#FFFFFF',
        'link' => '#0066CC',
        'text' => '#333333',
        // ... 更多CSS变量
    )
);

// 序列化导出
$data = serialize($style_data);
header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="style_'.$styleid.'.txt"');
echo $data;
```

### 风格应用逻辑

```php
// 加载用户风格
function load_user_style($uid) {
    global $db;

    // 获取用户选择
    $styleid = $db->result_first("SELECT styleid
                                    FROM cdb_members
                                    WHERE uid='$uid'");

    // 如果没有选择，使用默认风格
    if(!$styleid) {
        $styleid = $GLOBALS['styleid'];
    }

    // 加载风格变量
    $stylevars = array();
    $query = $db->query("SELECT variable, substitute
                          FROM cdb_stylevars
                          WHERE styleid='$styleid'");

    while($var = $db->fetch_array($query)) {
        $stylevars[$var['variable']] = $var['substitute'];
    }

    return $stylevars;
}

// 应用到模板
function apply_style_vars($template, $stylevars) {
    foreach($stylevars as $var => $value) {
        $template = str_replace('{'.$var.'}', $value, $template);
    }
    return $template;
}
```

---

## 4. templates.inc.php - 模板编辑器（~580行）

### 模板目录结构

```
./templates/
├── default/                    -- 默认模板
│   ├── common/                -- 公共组件
│   │   ├── header.htm
│   │   ├── footer.htm
│   │   └── ...
│   ├── forum/                 -- 论坛相关
│   │   ├── forumdisplay.htm   -- 版块列表
│   │   ├── viewthread.htm     -- 主题查看
│   │   ├── post.htm           -- 发帖页面
│   │   └── ...
│   ├── member/                -- 用户相关
│   │   ├── profile.htm
│   │   ├── register.htm
│   │   └── ...
│   ├── lang/                  -- 语言包
│   │   ├── lang_template.php
│   │   ├── lang_admincp.php
│   │   └── ...
│   └── css/                   -- 样式文件
│       └── style.css
├── green/                     -- 绿色风格
└── custom/                    -- 自定义模板
```

### Discuz模板语法

```html
<!-- 模板变量 -->
{variable}
{$_SESSION[username]}

<!-- 循环 -->
<!--{loop $array $key $value}-->
    {$key}: {$value}
<!--{/loop}-->

<!-- 条件 -->
<!--{if $condition}-->
    内容
<!--{elseif $other}-->
    其他内容
<!--{else}-->
    默认内容
<!--{/if}-->

<!-- 模板包含 -->
{template header}
{subtemplate common/footer}

<!-- 语言变量 -->
{lang login}
{lang register}

<!-- 表达式 -->
<!--{eval echo $a + $b;}-->
<!--{eval $i++;}-->

<!-- 注释 -->
<!--{这是注释，不会输出}-->
```

### 模板编译

```php
// Discuz模板编译器
function template_compile($source, $target) {
    // 1. 读取模板文件
    $content = file_get_contents($source);

    // 2. 语法转换
    $content = template_parse($content);

    // 3. 保存编译后的PHP文件
    file_put_contents($target, $content);
}

// 语法解析
function template_parse($template) {
    // 替换变量
    $template = preg_replace(
        '/\{([a-zA-Z0-9_\[\]\'\"\$\.\x7f-\xff]+)\}/s',
        '<?php echo \\1; ?>',
        $template
    );

    // 解析循环
    $template = preg_replace(
        '/\{loop\s+(\S+)\s+(\S+)\s+(\S+)\}(.+?)\{\/loop\}/is',
        '<?php if(is_array(\\1)) foreach(\\1 as \\2 => \\3) { ?>\\4<?php } ?>',
        $template
    );

    // 解析条件
    $template = preg_replace(
        '/\{if\s+(.+?)\}(.+?)\{\/if\}/is',
        '<?php if(\\1) { ?>\\2<?php } ?>',
        $template
    );

    // 解析模板包含
    $template = preg_replace(
        '/\{template\s+(\w+)\}/',
        '<?php include template(\'\\1\'); ?>',
        $template
    );

    // 解析语言变量
    $template = preg_replace(
        '/\{lang\s+(\w+)\}/',
        '<?php echo $lang[\'\\1\']; ?>',
        $template
    );

    return $template;
}
```

### 模板编辑功能

```php
// 编辑模板
if($do == 'edit') {
    $file = DISCUZ_ROOT . './templates/' . $template . '/' . $filename;

    // 读取文件
    $content = file_get_contents($file);

    // 显示编辑表单
    showformheader('templates&do=update');
    showsetting('template_content', 'content', $content, 'textarea');
    showsubmit('submit', 'submit');
    showformfooter();

    // 保存修改
    if(submitcheck('submit')) {
        $content = stripslashes($_POST['content']);

        // 写入文件
        file_put_contents($file, $content);

        // 更新模板缓存
        updatetemplate($template);

        cpmsg('template_update_succeed', 'templates');
    }
}

// 比较模板差异
function compare_template($template1, $template2) {
    $file1 = DISCUZ_ROOT . './templates/default/' . $filename;
    $file2 = DISCUZ_ROOT . './templates/' . $template . '/' . $filename;

    if(file_exists($file1) && file_exists($file2)) {
        return md5_file($file1) != md5_file($file2);
    }

    return false;
}
```

---

## 5. smilies.inc.php - 表情管理（~399行）

### 数据表结构

```sql
-- 表情分类表
CREATE TABLE cdb_imagetypes (
    typeid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30),
    type ENUM('smiley', 'icon'),
    displayorder SMALLINT(6),
    directory VARCHAR(30)                 -- 图片目录
);

-- 表情表
CREATE TABLE cdb_smilies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    typeid INT,
    displayorder SMALLINT(6),
    code VARCHAR(30),                     -- 表情代码
    url VARCHAR(30),                      -- 图片文件名
    type ENUM('smiley', 'icon')
);
```

### 表情目录结构

```
./images/smilies/
├── default/                 -- 默认表情
│   ├── smile.gif
│   ├── sad.gif
│   ├── bigsmile.gif
│   └── ...
├── cool/                    -- 酷酷表情
├── yellown/                 -- 黄脸表情
└── custom/                  -- 自定义表情
```

### 表情代码生成

```php
// 表情代码生成模式
// 格式: prefix + middle + suffix

// 示例配置
$prefix = ':';              -- 前缀
$suffix = '';               -- 后缀
$middle = 'filename';       -- 中间部分类型

// 中间部分类型
// 0: 无（只有prefix+suffix）
// 1: 文件名
// 2: 随机数
// 3: 表情ID

// 生成示例
// middle=0: ":" → ":"
// middle=1: "smile" → ":smile"
// middle=2: "1234" → ":1234"
// middle=3: "1" → ":1"

// JavaScript生成代码
function generate_smiley_code(file) {
    var prefix = $('#prefix').val();
    var suffix = $('#suffix').val();
    var middle_type = $('#middle').val();

    var middle = '';
    switch(middle_type) {
        case '0': middle = ''; break;
        case '1': middle = file; break;
        case '2': middle = Math.floor(Math.random() * 10000); break;
        case '3': middle = smiley_id; break;
    }

    return prefix + middle + suffix;
}
```

### 表情导入/导出

```php
// 导出表情包
function export_smilies($typeid) {
    global $db;

    // 获取分类信息
    $type = $db->fetch_first("SELECT * FROM cdb_imagetypes
                                WHERE typeid='$typeid'");

    // 获取表情列表
    $smilies = array();
    $query = $db->query("SELECT * FROM cdb_smilies
                          WHERE typeid='$typeid'
                          ORDER BY displayorder");

    while($smiley = $db->fetch_array($query)) {
        $smilies[] = $smiley;
    }

    // 构建导出数据
    $data = array(
        'version' => '6.1.0',
        'name' => $type['name'],
        'directory' => $type['directory'],
        'smilies' => $smilies
    );

    // 序列化并下载
    $content = serialize($data);
    header('Content-Type: text/plain');
    header('Content-Disposition: attachment; filename="smiley_'.$type['name'].'.txt"');
    echo $content;
}

// 导入表情包
function import_smilies($file, $overwrite = false) {
    // 解析数据
    $data = unserialize(file_get_contents($file));

    // 检查是否存在
    $exists = $db->result_first("SELECT COUNT(*) FROM cdb_imagetypes
                                   WHERE name='$data[name]'");

    if($exists && !$overwrite) {
        return error('Smiley package already exists');
    }

    // 创建分类
    $db->query("INSERT INTO cdb_imagetypes
                (name, type, displayorder, directory)
                VALUES ('$data[name]', 'smiley', 0, '$data[directory]')");

    $typeid = $db->insert_id();

    // 导入表情
    foreach($data['smilies'] as $smiley) {
        $db->query("INSERT INTO cdb_smilies
                    (typeid, displayorder, code, url, type)
                    VALUES ('$typeid', '$smiley[displayorder]',
                            '$smiley[code]', '$smiley[url]', 'smiley')");
    }

    return success('Smilies imported successfully');
}
```

---

## 6. advertisements.inc.php - 广告管理（~459行）

### 数据表结构

```sql
-- 广告表
CREATE TABLE cdb_advertisements (
    advid INT PRIMARY KEY AUTO_INCREMENT,
    available TINYINT(1),
    type VARCHAR(30),                     -- 广告类型
    title VARCHAR(100),                   -- 广告标题
    targets TEXT,                         -- 目标页面（tab分隔）
    parameters TEXT,                      -- 序列化参数
    code TEXT,                            -- 生成的广告代码
    displayorder INT,
    starttime INT,                        -- 开始时间
    endtime INT                           -- 结束时间
);

-- 广告缓存表
-- cache_advs_index.php    -- 首页广告
-- cache_advs_forumdisplay.php  -- 版块页广告
-- cache_advs_viewthread.php    -- 主题页广告
-- cache_advs_register.php      -- 注册页广告
-- cache_advs_archiver.php      -- 移动端广告
```

### 广告类型

```php
$ad_types = array(
    'headerbanner' => '头部横幅',
    'footerbanner' => '底部横幅',
    'text' => '文字广告',
    'thread' => '帖子内广告',
    'interthread' => '帖间广告',
    'float' => '浮动广告',
    'couplebanner' => '对联广告',
    'intercat' => '分类间广告'
);

$ad_styles = array(
    'code' => '自定义代码',
    'text' => '文字链接',
    'image' => '图片',
    'flash' => 'Flash动画'
);
```

### 目标页面系统

```php
// targets字段格式（tab分隔）
// 示例: "all\t0\t10\t20\t30"

$targets = explode("\t", $adv['targets']);
foreach($targets as $target) {
    switch($target) {
        case 'all':
            // 所有页面显示
            break;
        case '0':
            // 首页显示
            break;
        case 'register':
            // 注册页显示
            break;
        case 'archiver':
            // 移动端显示
            break;
        default:
            // 特定版块
            if(is_numeric($target)) {
                // 在版块 $target 显示
            }
    }
}
```

### 广告参数结构

```php
// parameters字段（序列化）
$parameters = array(
    'style' => 'image',                  -- 广告样式
    'html' => '<div>...</div>',          -- HTML代码
    'title' => '广告标题',                -- 文字标题
    'link' => 'http://...',              -- 链接地址
    'url' => 'image.jpg',                -- 图片URL
    'width' => 468,                      -- 宽度
    'height' => 60,                      -- 高度
    'position' => 1,                     -- 显示位置
    'displayorder' => 1,                 -- 显示顺序
    'sourcecode' => '',                  -- 源代码
    'floath' => 100                      -- 浮动高度
);

// 序列化存储
$advnew['parameters'] = serialize($parameters);
```

### 广告代码生成

```php
// 浮动广告代码
if($type == 'float') {
    $code = 'theFloaters.addItem(\'floatAdv1\', 6, \'document.documentElement.clientHeight-'.$floath.'\',
        \'<div style="position: absolute;">'.$html.'</div>\');';
}

// 对联广告代码
if($type == 'couplebanner') {
    $code = 'theFloaters.addItem(\'coupleBannerL\', 6, 0,
        \'<div style="position: absolute; left: 6px;">'.$html.'</div>\');
        theFloaters.addItem(\'coupleBannerR\', \'document.body.clientWidth-6\', 0,
        \'<div style="position: absolute; right: 6px;">'.$html.'</div>\');';
}

// 文字广告代码
if($style == 'text') {
    $code = '<a href="'.$link.'" target="_blank">'.$title.'</a>';
}

// 图片广告代码
if($style == 'image') {
    $code = '<a href="'.$link.'" target="_blank">
        <img src="'.$url.'" width="'.$width.'" height="'.$height.'" border="0" />
    </a>';
}

// Flash广告代码
if($style == 'flash') {
    $code = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"
        width="'.$width.'" height="'.$height.'">
        <param name="movie" value="'.$url.'">
        <param name="quality" value="high">
        <embed src="'.$url.'" quality="high"
            pluginspage="http://www.macromedia.com/go/getflashplayer"
            type="application/x-shockwave-flash"
            width="'.$width.'" height="'.$height.'">
        </embed>
    </object>';
}
```

### 广告时间控制

```php
// 检查广告是否在有效期内
function is_ad_available($ad) {
    $now = time();

    // 检查启用状态
    if(!$ad['available']) {
        return false;
    }

    // 检查时间范围
    if($ad['starttime'] && $now < $ad['starttime']) {
        return false;
    }

    if($ad['endtime'] && $now > $ad['endtime']) {
        return false;
    }

    return true;
}

// 自动过期处理
function expire_ads() {
    global $db;

    $now = time();

    // 禁用过期广告
    $db->query("UPDATE cdb_advertisements
                SET available='0'
                WHERE endtime > 0 AND endtime < '$now'");
}
```

### 广告缓存更新

```php
// 更新广告缓存
function update_ad_cache() {
    global $db, $tablepre;

    $now = time();

    // 清空缓存文件
    @unlink('./forumdata/cache/cache_advs_index.php');
    @unlink('./forumdata/cache/cache_advs_forumdisplay.php');
    @unlink('./forumdata/cache/cache_advs_viewthread.php');

    // 重新生成缓存
    $cache = array();

    // 首页广告
    $query = $db->query("SELECT * FROM {$tablepre}advertisements
                          WHERE available='1'
                          AND (starttime=0 OR starttime<$now)
                          AND (endtime=0 OR endtime>$now)
                          AND (targets LIKE '%all%' OR targets LIKE '%\t0\t%')
                          ORDER BY displayorder");

    while($adv = $db->fetch_array($query)) {
        $cache[] = $adv;
    }

    // 保存缓存
    $data = "<?php\n";
    $data .= "// Advertisement Cache\n";
    $data .= "\$_DCACHE['advs']['index'] = ".var_export($cache, true).";\n";
    $data .= "?>";

    file_put_contents('./forumdata/cache/cache_advs_index.php', $data);
}
```

---

## 总结

### 共同特点

1. **权限控制**: 所有模块都有基于用户组的权限系统
2. **序列化存储**: 复杂配置使用serialize()存储
3. **缓存机制**: 使用缓存文件提高性能
4. **导入/导出**: 支持数据的备份和迁移
5. **时间控制**: 多数模块支持时间范围限制

### 迁移考虑

1. **数据模型转换**: 将序列化数据转为JSON
2. **权限系统重构**: 使用RBAC替代简单的用户组
3. **缓存优化**: 使用Redis/Memcached
4. **API化**: 将管理功能改为REST API
5. **前端分离**: 使用React构建新的管理界面
