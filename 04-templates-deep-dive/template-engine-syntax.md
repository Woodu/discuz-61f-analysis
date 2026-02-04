# 模板引擎和语法深入分析

## 1. 模板引擎完整流程图 (带行号)

### 1.1 parse_template() 函数流程 (14-89行)

```
14: function parse_template($tplfile, $templateid, $tpldir) {
15:     global $language, $subtemplates, $timestamp;
16:
17:     $nest = 5;  // 嵌套深度限制
18:     $file = basename($tplfile, '.htm');
19:     $objfile = DISCUZ_ROOT."./forumdata/templates/{$templateid}_$file.tpl.php";
20:
21:     // 打开模板文件
22:     if(!@$fp = fopen($tplfile, 'r')) {
23:         dexit("Current template file './$tpldir/$file.htm' not found...");
24:     }
25:     // 加载语言包
26:     elseif($language['discuz_lang'] != 'templates' && !include language('templates', $templateid, $tpldir)) {
27:         dexit("Current template pack do not have language file...");
28:     }
29:
30:     // 定义正则表达式
31:     $var_regexp = "((\\\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)(\[[a-zA-Z0-9_\-\.\"\'\[\]\$\x7f-\xff]+\])*)";
32:     $const_regexp = "([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)";
33:
34:     $subtemplates = array();
35:     // 处理子模板 (最多3层)
36:     for($i = 1; $i<=3; $i++) {
37:         if(strexists($template, '{subtemplate')) {
38:             $template = preg_replace("/[\n\r\t]*\{subtemplate\s+([a-z0-9_]+)\}[\n\r\t]*/ies", "loadsubtemplate('\\1')", $template);
39:         }
40:     }
41:
42:     // 移除HTML注释标签
43:     $template = preg_replace("/\<\!\-\-\{(.+?)\}\-\-\>/s", "{\\1}", $template);
44:
45:     // 处理语言变量
46:     $template = preg_replace("/\{lang\s+(.+?)\}/ies", "languagevar('\\1')", $template);
47:
48:     // 处理FAQ变量
49:     $template = preg_replace("/\{faq\s+(.+?)\}/ies", "faqvar('\\1')", $template);
50:
51:     // 处理换行符
52:     $template = str_replace("{LF}", "<?=\"\\n\"?>", $template);
53:
54:     // 处理简单变量 {$var}
55:     $template = preg_replace("/\{(\\\$[a-zA-Z0-9_\[\]\'\"\$\.\x7f-\xff]+)\}/s", "<?=\\1?>", $template);
56:
57:     // 处理复杂变量 {$array[key]}
58:     $template = preg_replace("/$var_regexp/es", "addquote('<?=\\1?>')", $template);
59:     $template = preg_replace("/\<\?\=\<\?\=$var_regexp\?\>\?\>/es", "addquote('<?=\\1?>')", $template);
60:
61:     // 添加子模板刷新检查
62:     $headeradd = '';
63:     if(!empty($subtemplates)) {
64:         $headeradd .= "\n0\n";
65:         foreach ($subtemplates as $fname) {
66:             $headeradd .= "|| checktplrefresh('$tplfile', '$fname', $timestamp, '$templateid', '$tpldir')\n";
67:         }
68:         $headeradd .=";";
69:     }
70:
71:     // 添加文件头
72:     $template = "<? if(!defined('IN_DISCUZ')) exit('Access Denied'); {$headeradd}?>\n$template";
73:
74:     // 处理 {template} 标签
75:     $template = preg_replace("/[\n\r\t]*\{template\s+([a-z0-9_]+)\}[\n\r\t]*/is", "\n<? include template('\\1'); ?>\n", $template);
76:
77:     // 处理 {eval} 标签
78:     $template = preg_replace("/[\n\r\t]*\{eval\s+(.+?)\}[\n\r\t]*/ies", "stripvtags('<? \\1 ?>','')", $template);
79:
80:     // 处理 {echo} 标签
81:     $template = preg_replace("/[\n\r\t]*\{echo\s+(.+?)\}[\n\r\t]*/ies", "stripvtags('<? echo \\1; ?>','')", $template);
82:
83:     // 处理 {elseif} 标签
84:     $template = preg_replace("/([\n\r\t]*)\{elseif\s+(.+?)\}([\n\r\t]*)/ies", "stripvtags('\\1<? } elseif(\\2) { ?>\\3','')", $template);
85:
86:     // 处理 {else} 标签
87:     $template = preg_replace("/([\n\r\t]*)\{else\}([\n\r\t]*)/is", "\\1<? } else { ?>\\2", $template);
88:
89:     // 处理嵌套结构 (最多5层)
90:     for($i = 0; $i < $nest; $i++) {
91:         // {loop} 循环
92:         $template = preg_replace("/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\}[\n\r]*(.+?)[\n\r]*\{\/loop\}[\n\r\t]*/ies", "stripvtags('<? if(is_array(\\1)) { foreach(\\1 as \\2) { ?>','\\3<? } } ?>')", $template);
93:         $template = preg_replace("/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\s+(\S+)\}[\n\r\t]*(.+?)[\n\r\t]*\{\/loop\}[\n\r\t]*/ies", "stripvtags('<? if(is_array(\\1)) { foreach(\\1 as \\2 => \\3) { ?>','\\4<? } } ?>')", $template);
94:
95:         // {if} 条件
96:         $template = preg_replace("/([\n\r\t]*)\{if\s+(.+?)\}([\n\r]*)(.+?)([\n\r]*)\{\/if\}([\n\r\t]*)/ies", "stripvtags('\\1<? if(\\2) { ?>\\3','\\4\\5<? } ?>\\6')", $template);
97:     }
98:
99:     // 处理常量
100:     $template = preg_replace("/\{$const_regexp\}/s", "<?=\\1?>", $template);
101:     $template = preg_replace("/ \?\>[\n\r]*\<\? /s", " ", $template);
102:
103:     // 写入编译后的文件
104:     if(!@$fp = fopen($objfile, 'w')) {
105:         dexit("Directory './forumdata/templates/' not found...");
106:     }
107:
108:     // 处理URL中的&符号
109:     $template = preg_replace("/\"(http)?[\w\.\/:]+\?[^\"]+?&[^\"]+?\"/e", "transamp('\\0')", $template);
110:     $template = preg_replace("/\<script[^\>]*?src=\"(.+?)\".*?\>\s*\<\/script\>/ise", "stripscriptamp('\\1')", $template);
111:
112:     // 处理 {block} 标签
113:     $template = preg_replace("/[\n\r\t]*\{block\s+([a-zA-Z0-9_]+)\}(.+?)\{\/block\}/ies", "stripblock('\\1', '\\2')", $template);
114:
115:     // 写入文件
116:     flock($fp, 2);
117:     fwrite($fp, $template);
118:     fclose($fp);
119: }
```

### 1.2 模板编译完整流程

```
用户访问页面
    ↓
PHP业务逻辑处理
    ↓
调用 template('模板名')
    ↓
检查 forumdata/templates/{templateid}_模板名.tpl.php 是否存在
    ├── 不存在 ↓
    └── 存在且未过期 → 直接 include 编译后的PHP文件
    ↓
调用 parse_template()
    ↓
读取 templates/{tpldir}/模板名.htm
    ↓
执行正则替换 (见上文)
    ↓
生成编译后的PHP代码
    ↓
写入 forumdata/templates/{templateid}_模板名.tpl.php
    ↓
include 编译后的PHP文件
    ↓
输出HTML到浏览器
```

## 2. 函数清单

### 2.1 主函数

| 函数 | 行号 | 说明 |
|------|------|------|
| parse_template | 14-89 | 解析模板文件并编译为PHP |
| loadsubtemplate | 91-103 | 加载子模板内容 |

### 2.2 辅助函数

| 函数 | 行号 | 说明 |
|------|------|------|
| transamp | 105-110 | 转换URL中的&符号 |
| addquote | 112-114 | 为数组访问添加引号 |
| languagevar | 116-122 | 获取语言变量 |
| faqvar | 124-133 | 获取FAQ链接 |
| stripvtags | 135-139 | 移除PHP标签 |
| stripscriptamp | 141-144 | 处理script标签中的& |
| stripblock | 146-159 | 处理block块 |

## 3. 正则表达式详解

### 3.1 变量正则 (第31行)

```php
$var_regexp = "((\\\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)(\[[a-zA-Z0-9_\-\.\"\'\[\]\$\x7f-\xff]+\])*)";
```

**匹配模式**:
- `\$variable` - 简单变量
- `\$array['key']` - 字符串键
- `\$array[0]` - 数字键
- `\$array["key"]` - 双引号键
- `\$object->property['key']` - 链式访问

### 3.2 常量正则 (第32行)

```php
$const_regexp = "([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)";
```

**匹配模式**:
- PHP常量 (CONSTANT_NAME)
- 支持中文变量名 (\x7f-\xff)

## 4. 模板语法完整参考

### 4.1 变量输出

#### 简单变量
```html
<!-- 模板 -->
{$username}
{$timestamp}

<!-- 编译后 -->
<?=$username?>
<?=$timestamp?>
```

#### 数组元素
```html
<!-- 模板 -->
{$forum[name]}
{$thread[author]}

<!-- 编译后 -->
<?=$forum['name']?>
<?=$thread['author']?>
```

#### 复杂访问
```html
<!-- 模板 -->
{$forum[fid]}
{$post[attachment][0][filename]}

<!-- 编译后 -->
<?=$forum['fid']?>
<?=$post['attachment'][0]['filename']?>
```

### 4.2 条件判断

#### if 语句
```html
<!-- 模板 -->
<!--{if $condition}-->
    内容
<!--{/if}-->

<!-- 编译后 -->
<? if($condition) { ?>
    内容
<? } ?>
```

#### if-else 语句
```html
<!-- 模板 -->
<!--{if $condition}-->
    内容A
<!--{else}-->
    内容B
<!--{/if}-->

<!-- 编译后 -->
<? if($condition) { ?>
    内容A
<? } else { ?>
    内容B
<? } ?>
```

#### if-elseif-else 语句
```html
<!-- 模板 -->
<!--{if $adminid == 1}-->
    管理员
<!--{elseif $adminid == 2}-->
    超级版主
<!--{else}-->
    普通用户
<!--{/if}-->

<!-- 编译后 -->
<? if($adminid == 1) { ?>
    管理员
<? } elseif($adminid == 2) { ?>
    超级版主
<? } else { ?>
    普通用户
<? } ?>
```

### 4.3 循环

#### 简单循环
```html
<!-- 模板 -->
<!--{loop $threadlist $thread}-->
    {$thread[subject]}
<!--{/loop}-->

<!-- 编译后 -->
<? if(is_array($threadlist)) { foreach($threadlist as $thread) { ?>
    <?=$thread['subject']?>
<? } } ?>
```

#### 带键循环
```html
<!-- 模板 -->
<!--{loop $forumlist $fid $forum}-->
    {$fid}: {$forum[name]}
<!--{/loop}-->

<!-- 编译后 -->
<? if(is_array($forumlist)) { foreach($forumlist as $fid => $forum) { ?>
    <?=$fid?>: <?=$forum['name']?>
<? } } ?>
```

### 4.4 模板包含

#### template 标签
```html
<!-- 模板 -->
{template header}

<!-- 编译后 -->
<? include template('header'); ?>
```

#### subtemplate 标签
```html
<!-- 模板 -->
{subtemplate header}

<!-- 编译后 -->
<!-- 直接嵌入子模板内容，不产生PHP代码 -->
<!-- 添加到 $subtemplates 数组用于刷新检查 -->
```

### 4.5 语言包

#### 语言变量
```html
<!-- 模板 -->
{lang forum_category}
{lang welcome}

<!-- 编译后 -->
<?=$language['forum_category']?>
<?=$language['welcome']?>
```

#### 带参数的语言
```html
<!-- 模板 -->
{lang forum_moderators}

<!-- 编译后 (假设定义了该语言项) -->
<!-- 语言包中: 'forum_moderators' => '版主: %s' -->
```

### 4.6 PHP代码执行

#### eval 标签
```html
<!-- 模板 -->
{eval $total = $count1 + $count2}
总数: {$total}

<!-- 编译后 -->
<? $total = $count1 + $count2 ?>
总数: <?=$total?>
```

#### echo 标签
```html
<!-- 模板 -->
{echo strtoupper($username)}

<!-- 编译后 -->
<? echo strtoupper($username); ?>
```

### 4.7 FAQ链接

```html
<!-- 模板 -->
{faq register}

<!-- 编译后 -->
<a href="faq.php?action=message&id=1" target="_blank">注册</a>
```

### 4.8 换行符

```html
<!-- 模板 -->
第一行{LF}第二行

<!-- 编译后 -->
第一行<?= "\n"?>第二行
```

### 4.9 常量

```html
<!-- 模板 -->
{BOARDURL}
{TIMESTAMP}
{FORMHASH}

<!-- 编译后 -->
<?=BOARDURL?>
<?=TIMESTAMP?>
<?=FORMHASH?>
```

### 4.10 block 块 (较少使用)

```html
<!-- 模板 -->
{block ad_header}
    广告内容
{/block}

<!-- 编译后 -->
<? $ad_header = <<<EOF
    广告内容
EOF;
?>
```

## 5. 关键代码片段分析

### 5.1 子模板加载机制 (36-40行)

```php
$subtemplates = array();
for($i = 1; $i<=3; $i++) {
    if(strexists($template, '{subtemplate')) {
        $template = preg_replace("/[\n\r\t]*\{subtemplate\s+([a-z0-9_]+)\}[\n\r\t]*/ies",
            "loadsubtemplate('\\1')", $template);
    }
}
```

**工作原理**:
1. 递归处理最多3层子模板
2. 直接嵌入子模板内容到当前模板
3. 记录所有子模板路径到 `$subtemplates` 数组
4. 用于后续的模板刷新检查

### 5.2 变量替换优先级 (46-59行)

```php
// 1. 移除HTML注释包装
$template = preg_replace("/\<\!\-\-\{(.+?)\}\-\-\>/s", "{\\1}", $template);

// 2. 语言变量
$template = preg_replace("/\{lang\s+(.+?)\}/ies", "languagevar('\\1')", $template);

// 3. FAQ变量
$template = preg_replace("/\{faq\s+(.+?)\}/ies", "faqvar('\\1')", $template);

// 4. 换行符
$template = str_replace("{LF}", "<?=\"\\n\"?>", $template);

// 5. 简单变量 {$var}
$template = preg_replace("/\{(\\\$[a-zA-Z0-9_\[\]\'\"\$\.\x7f-\xff]+)\}/s",
    "<?=\\1?>", $template);

// 6. 复杂变量 {$array[key]}
$template = preg_replace("/$var_regexp/es", "addquote('<?=\\1?>')", $template);
```

**处理顺序很重要**: 必须先处理简单变量，再处理复杂变量

### 5.3 嵌套结构处理 (68-72行)

```php
for($i = 0; $i < $nest; $i++) {  // $nest = 5
    $template = preg_replace("/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\}[\n\r]*(.+?)[\n\r]*\{\/loop\}[\n\r\t]*/ies",
        "stripvtags('<? if(is_array(\\1)) { foreach(\\1 as \\2) { ?>','\\3<? } } ?>')", $template);
    $template = preg_replace("/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\s+(\S+)\}[\n\r\t]*(.+?)[\n\r\t]*\{\/loop\}[\n\r\t]*/ies",
        "stripvtags('<? if(is_array(\\1)) { foreach(\\1 as \\2 => \\3) { ?>','\\4<? } } ?>')", $template);
    $template = preg_replace("/([\n\r\t]*)\{if\s+(.+?)\}([\n\r]*)(.+?)([\n\r]*)\{\/if\}([\n\r\t]*)/ies",
        "stripvtags('\\1<? if(\\2) { ?>\\3','\\4\\5<? } ?>\\6')", $template);
}
```

**为什么需要循环**:
- 处理嵌套的 if/loop 结构
- 每次循环处理一层嵌套
- 最多支持5层嵌套

### 5.4 安全检查 (第59行)

```php
$template = "<? if(!defined('IN_DISCUZ')) exit('Access Denied'); {$headeradd}?>\n$template";
```

**目的**:
- 防止直接访问编译后的模板文件
- 确保只能通过框架调用

### 5.5 URL处理 (81-82行)

```php
$template = preg_replace("/\"(http)?[\w\.\/:]+\?[^\"]+?&[^\"]+?\"/e", "transamp('\\0')", $template);
$template = preg_replace("/\<script[^\>]*?src=\"(.+?)\".*?\>\s*\<\/script\>/ise", "stripscriptamp('\\1')", $template);
```

**处理内容**:
- HTML属性中的 `&` → `&amp;`
- Script src 中的 `&amp;` → `&` (保持可执行)

## 6. 辅助函数详解

### 6.1 loadsubtemplate() (91-103行)

```php
function loadsubtemplate($file, $templateid = 0, $tpldir = '') {
    global $subtemplates;
    $tpldir = $tpldir ? $tpldir : TPLDIR;
    $templateid = $templateid ? $templateid : TEMPLATEID;

    $tplfile = DISCUZ_ROOT.'./'.$tpldir.'/'.$file.'.htm';
    if($templateid != 1 && !file_exists($tplfile)) {
        $tplfile = DISCUZ_ROOT.'./templates/default/'.$file.'.htm';
    }

    $subtemplates[] = $tplfile;
    return @implode('', file($tplfile));
}
```

**功能**:
1. 构建子模板路径
2. 如果非默认主题且文件不存在，回退到默认主题
3. 记录模板路径用于刷新检查
4. 返回模板内容

### 6.2 addquote() (112-114行)

```php
function addquote($var) {
    return str_replace("\\\"", "\"", preg_replace("/\[([a-zA-Z0-9_\-\.\x7f-\xff]+)\]/s",
        "['\\1']", $var));
}
```

**转换示例**:
- `$array[key]` → `$array['key']`
- `$var[name][0]` → `$var['name'][0]`

### 6.3 languagevar() (116-122行)

```php
function languagevar($var) {
    if(isset($GLOBALS['language'][$var])) {
        return $GLOBALS['language'][$var];
    } else {
        return "!$var!";  // 未定义的语言变量显示 !key!
    }
}
```

### 6.4 stripvtags() (135-139行)

```php
function stripvtags($expr, $statement) {
    $expr = str_replace("\\\"", "\"", preg_replace("/\<\?\=(\\\$.+?)\?\>/s", "\\1", $expr));
    $statement = str_replace("\\\"", "\"", $statement);
    return $expr.$statement;
}
```

**用途**: 移除临时添加的PHP标签，用于 if/elseif/loop 等结构的处理

## 7. 编译缓存机制

### 7.1 缓存文件位置

```
forumdata/templates/{templateid}_{filename}.tpl.php
```

**示例**:
- `forumdata/templates/1_discuz.tpl.php` (默认主题首页)
- `forumdata/templates/3_forumdisplay.tpl.php` (PokeTB主题版块页)

### 7.2 缓存刷新检查

```php
// 生成的文件头
<? if(!defined('IN_DISCUZ')) exit('Access Denied');
0
|| checktplrefresh('./templates/default/discuz.htm', './templates/default/header.htm', $timestamp, '1', 'default')
|| checktplrefresh('./templates/default/discuz.htm', './templates/default/footer.htm', $timestamp, '1', 'default')
?>
```

**检查机制**:
- 比较源文件和编译文件的修改时间
- 源文件更新时自动重新编译
- 子模板文件更新也会触发重新编译

### 7.3 手动清理缓存

后台 → 工具 → 更新缓存 → 模板缓存

## 8. 模板引擎特点

### 8.1 优点

1. **性能优秀**: 编译后直接执行PHP
2. **缓存机制**: 减少重复编译
3. **语法简洁**: 易于学习和使用
4. **嵌套支持**: 支持多层模板嵌套
5. **安全检查**: 防止直接访问编译文件

### 8.2 限制

1. **PHP依赖**: 编译结果是PHP代码
2. **调试困难**: 错误指向编译后的文件
3. **IDE支持差**: 无语法高亮和智能提示
4. **嵌套限制**: 最多5层 if/loop 嵌套
5. **正则限制**: 复杂表达式可能无法正确解析

## 9. 迁移到现代方案

### 9.1 JSX替代映射

| Discuz模板语法 | JSX等效写法 |
|---------------|------------|
| `{$variable}` | `{variable}` |
| `<!--{if $condition}-->...<!--{/if}-->` | `{condition && ...}` |
| `<!--{loop $array $item}-->...<!--{/loop}-->` | `{array.map(item => ...)}` |
| `{template header}` | `<Header />` |
| `{lang key}` | `{t('key')}` (i18next) |

### 9.2 React组件示例

```jsx
// 旧模板 (viewthread.htm)
<!--{loop $postlist $post}-->
<div class="post">
    <h3>{$post[subject]}</h3>
    <p>{$post[message]}</p>
</div>
<!--{/loop}-->

// 新组件 (ThreadView.jsx)
function ThreadView({ posts }) {
    return (
        <div className="thread">
            {posts.map(post => (
                <div key={post.pid} className="post">
                    <h3>{post.subject}</h3>
                    <p>{post.message}</p>
                </div>
            ))}
        </div>
    );
}
```

### 9.3 模板编译到组件映射表

| 旧模板 | 新组件 | 说明 |
|--------|--------|------|
| discuz.htm | HomePage | 首页 |
| forumdisplay.htm | ForumPage | 版块页 |
| viewthread.htm | ThreadPage | 帖子详情 |
| post_newthread.htm | NewThreadForm | 新主题表单 |
| header.htm | Header | 公共头部 |
| footer.htm | Footer | 公共底部 |

## 10. 实际模板示例

### 10.1 首页模板片段

```html
<!--{loop $forumlist $forum}-->
<div class="forum">
    <h3><a href="forumdisplay.php?fid={$forum[fid]}">{$forum[name]}</a></h3>
    <!--{if $forum[description]}-->
    <p>{$forum[description]}</p>
    <!--{/if}-->
</div>
<!--{/loop}-->
```

**编译后**:
```php
<? if(is_array($forumlist)) { foreach($forumlist as $forum) { ?>
<div class="forum">
    <h3><a href="forumdisplay.php?fid=<?=$forum['fid']?>"><?=$forum['name']?></a></h3>
    <? if($forum['description']) { ?>
    <p><?=$forum['description']?></p>
    <? } ?>
</div>
<? } } ?>
```

### 10.2 帖子列表模板片段

```html
<!--{loop $threadlist $thread}-->
<tr class="<!--{if $thread[digest]}-->digest<!--{elseif $thread[displayorder]}-->sticky<!--{else}-->normal<!--{/if}-->">
    <td>{$thread[subject]}</td>
    <td>{$thread[author]}</td>
    <td>{$thread[replies]}</td>
</tr>
<!--{/loop}-->
```

## 11. 性能优化建议

### 11.1 编译缓存优化

1. 生产环境锁定模板目录权限
2. 使用内存缓存 (APCu/Redis)
3. 预编译所有模板

### 11.2 迁移到React后的优化

1. **代码分割**: 路由级别的懒加载
2. **组件缓存**: React.memo 用于纯展示组件
3. **虚拟滚动**: 长列表使用 react-window
4. **请求优化**: React Query 的数据缓存

## 12. 安全注意事项

### 12.1 XSS防护

```php
// Discuz原版 (输出时转义)
{$message}  // 应该用 dhtmlspecialchars() 处理后

// React版 (默认转义)
<p>{message}</p>  // 自动转义
<p dangerouslySetInnerHTML={{__html: message}} />  // 不转义(危险)
```

### 12.2 模板注入防护

- 限制模板编辑权限
- 验证 {eval} 标签的使用
- 生产环境禁用模板在线编辑
