# Include目录深度分析：数据库、缓存和模板系统

## 文件概述

### 1. cache.func.php（~63KB）
- **功能**：Discuz! 6.1.0 的核心缓存系统
- **版本**：6.1.0F (20080606)
- **作用**：管理系统所有缓存数据的生成、更新和存储

### 2. db_mysql.class.php
- **功能**：MySQL数据库操作类
- **作用**：提供数据库连接、查询、结果处理等基础功能

### 3. template.func.php
- **功能**：模板编译系统
- **作用**：将HTML模板编译为可执行的PHP代码

---

## 一、缓存系统详细分析 (cache.func.php)

### 1.1 所有支持的缓存类型

通过分析 `updatecache()` 函数，系统支持以下缓存类型：

#### 基础设置缓存
- `settings` - 系统设置缓存
- `usergroups` - 用户组缓存
- `admingroups` - 管理员组缓存
- `styles` - 样式缓存

#### 内容相关缓存
- `forums` - 版块缓存
- `ranks` - 用户等级缓存
- `announcements` - 公告缓存
- `onlinelist` - 在线用户列表缓存
- `forumlinks` - 友情链接缓存

#### 功能模块缓存
- `bbcodes` - BBCode缓存
- `smilies` - 表情缓存
- `icons` - 图标缓存
- `medals` - 勋章缓存
- `magics` - 魔法功能缓存

#### 安全相关缓存
- `ipbanned` - IP封禁缓存
- `censor` - 敏感词过滤缓存
- `secqaa` - 安全问答缓存

#### 广告和营销
- `google` - Google广告缓存
- `plugins` - 插件缓存

#### 特殊功能缓存
- `birthdays` - 生日用户缓存
- `threadtypes` - 帖子类型缓存
- `faqs` - 常见问题缓存

### 1.2 缓存脚本分组

系统将缓存按页面进行分组管理：

```php
$cachescript = array(
    'index' => array('announcements', 'onlinelist', 'forumlinks', 'advs_index', 'tags_index'),
    'forumdisplay' => array('smilies', 'smileytypes', 'smilies_display', 'announcements_forum', 
                          'globalstick', 'floatthreads', 'forums', 'icons', 'onlinelist', 'advs_forumdisplay'),
    'viewthread' => array('smilies', 'smileytypes', 'smilies_display', 'forums', 'usergroups', 
                        'ranks', 'bbcodes', 'smilies', 'advs_viewthread', 'tags_viewthread', 'custominfo'),
    'post' => array('bbcodes_display', 'bbcodes', 'smilies_display', 'smilies', 'smileytypes', 'icons'),
    'profilefields' => array('fields_required', 'fields_optional'),
    'viewpro' => array('fields_required', 'fields_optional', 'custominfo'),
    'bbcodes' => array('bbcodes', 'smilies', 'smileytypes')
);
```

### 1.3 缓存文件存储格式

#### 缓存目录结构
```
forumdata/
├── cache/
│   ├── cache_[name].php     - 普通缓存文件
│   ├── style_[id].css        - CSS样式缓存
│   ├── style_[id]_common.css - 通用CSS
│   ├── style_[id]_editor.css - 编辑器CSS
│   ├── plugin_[id].php       - 插件缓存
│   ├── usergroup_[id].php    - 用户组缓存
│   └── google_var.js         - Google广告变量
```

#### 缓存文件内容格式
```php
<?php
//Discuz! cache file, DO NOT modify me!
//Created: M j, Y, G:i
//Identify: md5_hash

$_DCACHE['settings'] = array(
    'setting_name' => 'setting_value',
    // ...
);

?>
```

### 1.4 缓存更新触发条件

#### 自动更新条件
1. **系统设置变更** - 修改任何设置后自动更新settings缓存
2. **版块信息变更** - 添加/编辑/删除版块后更新forums缓存
3. **用户组变更** - 修改用户组权限后更新usergroups缓存
4. **样式变更** - 修改主题样式后更新styles和CSS缓存
5. **插件变更** - 启用/禁用插件后更新plugins缓存

#### 手动更新
通过 `updatecache($cachename)` 函数手动指定更新：
- `updatecache('settings')` - 仅更新设置
- `updatecache('forums')` - 仅更新版块
- `updatecache()` - 更新所有缓存

### 1.5 缓存构建逻辑

#### getcachearray() 函数工作流程
1. **确定查询参数** - 根据缓存名称确定表名、字段和条件
2. **执行数据库查询** - 从相应表中获取数据
3. **数据处理** - 对数据进行格式化和转换
4. **存储到数据库** - 将处理后的数据存储到 `caches` 表
5. **生成PHP代码** - 将数据转换为可执行的PHP代码

#### 特殊处理逻辑
- **settings缓存**：包含复杂的配置解析，如积分公式、水印配置、插件信息等
- **forums缓存**：构建版块层级关系，处理权限信息
- **usergroups缓存**：处理用户组权限、颜色、等级等
- **bbcodes缓存**：生成正则表达式替换规则
- **smilies缓存**：生成表情替换数组

---

## 二、数据库类分析 (db_mysql.class.php)

### 2.1 数据库连接管理

#### connect() 方法
```php
function connect($dbhost, $dbuser, $dbpw, $dbname = '', $pconnect = 0, $halt = TRUE, $dbcharset2 = '')
```
- **功能**：建立MySQL数据库连接
- **特性**：
  - 支持持久连接（pconnect）
  - 自动字符集设置（支持MySQL 4.1+）
  - 自动处理版本差异（MySQL 5.0.1+ 清除SQL模式）
  - 连接失败时的错误处理

### 2.2 核心查询方法

#### query() 方法
```php
function query($sql, $type = '')
```
- **功能**：执行SQL查询
- **特性**：
  - 支持UNBUFFERED查询（提高大数据量查询性能）
  - 自动重连机制（处理2006、2013错误）
  - 查询计数统计
  - 调试支持（SYS_DEBUG模式）

#### fetch_array() 方法
```php
function fetch_array($query, $result_type = MYSQL_ASSOC)
```
- **功能**：获取查询结果的一行数据
- **默认返回关联数组**

#### result_first() 方法
```php
function result_first($sql)
```
- **功能**：执行查询并返回第一行第一列的值
- **用途**：获取单个值查询（如COUNT、MAX等）

### 2.3 辅助方法

#### 数据操作相关
- `affected_rows()` - 获取影响行数
- `insert_id()` - 获取最后插入ID
- `num_rows()` - 获取结果集行数
- `num_fields()` - 获取结果集字段数

#### 错误处理
- `error()` - 获取错误信息
- `errno()` - 获取错误编号
- `halt()` - 错误处理（加载错误页面）

#### 资源管理
- `free_result()` - 释放结果集
- `close()` - 关闭连接
- `fetch_row()` - 获取行数据（数组形式）
- `fetch_fields()` - 获取字段信息

### 2.4 性能优化特性

1. **UNBUFFERED查询**：大数据量查询时使用，减少内存占用
2. **自动重连**：连接断开时自动重连
3. **查询统计**：记录查询次数，便于性能分析
4. **字符集自动适配**：根据数据库版本自动设置字符集

---

## 三、模板系统分析 (template.func.php)

### 3.1 template() 函数工作原理

虽然该文件没有直接的template()函数，但通过parse_template()函数实现模板编译：

```php
function parse_template($tplfile, $templateid, $tpldir)
```

### 3.2 模板编译机制

#### 编译流程
1. **文件读取** - 读取模板源文件（.htm）
2. **语言包加载** - 加载模板对应的语言包
3. **模板解析** - 将模板标签转换为PHP代码
4. **子模板处理** - 处理{subtemplate}标签
5. **变量替换** - 处理{variable}和常量
6. **逻辑标签** - 处理{if}、{loop}、{eval}等
7. **文件写入** - 将编译后的PHP代码写入缓存

#### 支持的模板标签

##### 变量输出
```html
{variable}          <!-- 输出变量 -->
{$variable}         <!-- 输出变量 -->
{CONSTANT}          <!-- 输出常量 -->
```

##### 条件判断
```html
{if condition}
    <!-- 内容 -->
{elseif condition}
    <!-- 内容 -->
{else}
    <!-- 内容 -->
{/if}
```

##### 循环遍历
```html
{loop array variable}
    <!-- 内容 -->
{/loop}

{loop array key variable}
    <!-- 内容 -->
{/loop}
```

##### 模板包含
```html
{template name}      <!-- 包含其他模板 -->
{subtemplate name}   <!-- 包含子模板 -->
```

##### 代码执行
```html
{eval code}          <!-- 执行PHP代码 -->
{echo expression}    <!-- 输出表达式 -->
```

### 3.3 模板缓存机制

#### 缓存文件位置
```
forumdata/templates/
├── [templateid]_[name].tpl.php
```

#### 缓存更新机制
1. **文件修改检测** - 检查模板源文件是否被修改
2. **编译时检查** - 每次编译时检查源文件时间戳
3. **语言包更新** - 语言包变更时自动重新编译

### 3.4 模板变量替换

#### 变量处理
- **支持数组访问**：`{array.key}`、`{array[key]}`
- **支持对象属性**：`{object.property}`
- **支持链式访问**：`{array.key.property}`

#### 特殊变量处理
- **语言变量**：`{lang variable}` - 自动加载语言包
- **FAQ链接**：`{faq variable}` - 自动生成FAQ链接
- **换行符**：`{LF}` - 转换为换行

### 3.5 模板处理流程总结

1. **源文件准备** - 读取.htm模板文件
2. **预处理** - 处理注释、语言变量、FAQ
3. **标签解析** - 将模板标签转换为PHP代码
4. **逻辑处理** - 处理条件、循环、代码执行
5. **子模板处理** - 递归处理子模板
6. **优化处理** - 去除多余空白、优化代码结构
7. **缓存写入** - 生成.tpl.php缓存文件

---

## 四、系统协同工作机制

### 4.1 缓存与数据库的交互

1. **缓存写入流程**：
```
   数据查询 → 数据处理 → 写入caches表 → 生成缓存文件
```

2. **缓存读取流程**：
```
   检查缓存文件 → 文件存在则直接使用 → 不存在则重建
```

### 4.2 模板与缓存的配合

1. **模板编译**使用缓存系统获取：
   - 语言包内容
   - FAQ信息
   - 全局变量

2. **样式编译**会：
   - 读取样式配置
   - 生成CSS文件
   - 缓存样式变量

### 4.3 性能优化策略

1. **缓存策略**：
   - 内存缓存 + 文件缓存
   - 智能缓存更新（仅更新变更部分）
   - 缓存文件身份验证（MD5校验）

2. **数据库优化**：
   - UNBUFFERED查询
   - 连接复用
   - 查询计数监控

3. **模板优化**：
   - 编译缓存
   - 静态内容合并
   - 输出缓冲

---

## 五、迁移建议

### 5.1 缓存系统迁移
1. 保留缓存更新机制的核心逻辑
2. 考虑使用现代缓存方案（Redis）
3. 保持缓存文件的版本控制机制

### 5.2 数据库抽象层
1. 保持当前查询接口的兼容性
2. 增加连接池支持
3. 添加查询日志和性能监控

### 5.3 模板引擎
1. 保留当前模板标签语法
2. 考虑升级到现代模板引擎（如Twig）
3. 保持模板缓存的效率特性

---

## 总结

这三个文件构成了Discuz! 6.1.0的核心基础设施：

- **cache.func.php**：实现了完整的缓存管理系统，支持多种数据类型的缓存更新和存储
- **db_mysql.class.php**：提供了稳定高效的数据库操作接口，具备连接管理和错误处理
- **template.func.php**：实现了模板编译系统，将静态模板转换为动态PHP代码

这三个组件协同工作，为整个论坛系统提供了高效的数据处理和内容展示能力。
## 缓存函数清单

通过分析 cache.func.php，所有支持的缓存类型如下：

### 基础设置缓存
- updatecache('settings') - 系统设置缓存
- updatecache('usergroups') - 用户组缓存  
- updatecache('admingroups') - 管理员组缓存
- updatecache('styles') - 样式缓存

### 内容相关缓存
- updatecache('forums') - 版块缓存
- updatecache('ranks') - 用户等级缓存
- updatecache('announcements') - 公告缓存
- updatecache('onlinelist') - 在线用户列表缓存
- updatecache('forumlinks') - 友情链接缓存

### 功能模块缓存
- updatecache('bbcodes') - BBCode缓存
- updatecache('smilies') - 表情缓存
- updatecache('icons') - 图标缓存
- updatecache('medals') - 勋章缓存
- updatecache('magics') - 魔法功能缓存

### 安全相关缓存
- updatecache('ipbanned') - IP封禁缓存
- updatecache('censor') - 敏感词过滤缓存
- updatecache('secqaa') - 安全问答缓存

### 广告和营销
- updatecache('google') - Google广告缓存
- updatecache('plugins') - 插件缓存

### 特殊功能缓存
- updatecache('birthdays') - 生日用户缓存
- updatecache('threadtypes') - 帖子类型缓存
- updatecache('faqs') - 常见问题缓存

## 缓存结构说明

### 缓存脚本分组
系统将缓存按页面分组管理：

- index页面：announcements, onlinelist, forumlinks等
- forumdisplay页面：smilies, forums, globalstick等
- viewthread页面：bbcodes, usergroups, ranks等
- post页面：bbcodes_display, smilies等

### 缓存文件存储
- 普通缓存：forumdata/cache/cache_[name].php
- 样式缓存：forumdata/cache/style_[id].css
- 用户组缓存：forumdata/cache/usergroup_[id].php
- 插件缓存：forumdata/cache/plugin_[id].php

## 数据库类方法列表

### 连接管理
- connect() - 建立数据库连接
- select_db() - 选择数据库
- close() - 关闭连接

### 查询方法
- query() - 执行SQL查询
- fetch_array() - 获取结果行
- result_first() - 获取首行首列
- fetch_row() - 获取行数据（数组）
- fetch_fields() - 获取字段信息

### 数据操作
- affected_rows() - 获取影响行数
- insert_id() - 获取最后插入ID
- num_rows() - 获取结果行数
- num_fields() - 获取字段数

### 资源管理
- free_result() - 释放结果集

### 错误处理
- error() - 获取错误信息
- errno() - 获取错误编号
- halt() - 错误处理

## 模板处理流程

### 编译流程
1. 读取模板源文件(.htm)
2. 加载语言包
3. 解析模板标签
4. 处理子模板
5. 变量替换
6. 逻辑标签处理
7. 写入缓存文件

### 支持的标签
- 变量输出：{variable}、{}、{CONSTANT}
- 条件判断：{if}、{elseif}、{else}、{/if}
- 循环遍历：{loop}、{/loop}
- 模板包含：{template}、{subtemplate}
- 代码执行：{eval}、{echo}

### 缓存机制
- 缓存文件：forumdata/templates/[id]_[name].tpl.php
- 自动检测文件修改
- 编译时检查时间戳
- 语言包变更自动重编译
