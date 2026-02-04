# Templates模板系统分析

## 模板目录结构

```
bbs/templates/
├── default/          # 默认模板（主模板）
├── 2013spring/       # 2013春季主题
├── english/          # 英文模板
├── green/            # 绿色主题
├── KKK/              # KKK主题
├── linstyle-bluesky/ # 蓝天主题
├── lvyin/            # 绿荫主题
├── poketb/           # PokeTB主题（自定义）
├── poketb_autowidth/ # 自适应宽度主题
├── XFire/            # XFire主题
├── Xgreen/           # X绿色主题
└── zhongqiu/         # 中秋主题
```

---

## 模板文件清单

### 首页相关

| 文件 | 说明 |
|------|------|
| discuz.htm | 首页主模板 |
| index.htm | 首页（备用） |
| header.htm | 公共头部 |
| footer.htm | 公共底部 |
| pmprompt.htm | 短消息提示 |

### 版块相关

| 文件 | 说明 |
|------|------|
| forumdisplay.htm | 版块列表页 |
| forumdisplay_subforum.htm | 子版块列表 |
| forumdisplay_thread.htm | 主题列表项 |

### 帖子相关

| 文件 | 说明 |
|------|------|
| viewthread.htm | 帖子阅读页 |
| viewthread_node.htm | 帖子楼层节点 |
| viewthread_fastpost.htm | 快速回复 |
| viewthread_printable.htm | 打印版本 |

### 发帖相关

| 文件 | 说明 |
|------|------|
| post_newthread.htm | 发布新主题 |
| post_newreply.htm | 回复主题 |
| post_editpost.htm | 编辑帖子 |
| post_preview.htm | 帖子预览 |

### 用户相关

| 文件 | 说明 |
|------|------|
| register.htm | 注册页面 |
| logging.htm | 登录页面 |
| memberlist.htm | 会员列表 |
| viewprofile.htm | 查看会员资料 |
| my.htm | 用户中心 |
| memcp.htm | 用户控制面板 |
| memcp_profile.htm | 个人资料编辑 |
| memcp_avatar.htm | 头像上传 |
| memcp_credits.htm | 积分管理 |
| memcp_usergroups.htm | 用户组 |

### 短消息

| 文件 | 说明 |
|------|------|
| pm.htm | 短消息列表 |
| pm_send.htm | 发送短消息 |
| pm_view.htm | 查看短消息 |

### 搜索

| 文件 | 说明 |
|------|------|
| search.htm | 搜索页面 |
| search_threads.htm | 搜索结果-主题 |
| search_posts.htm | 搜索结果-帖子 |

### 后台管理 (admincp)

| 文件 | 说明 |
|------|------|
| admincp_header.htm | 后台头部 |
| admincp_footer.htm | 后台底部 |
| admincp_menu.htm | 后台菜单 |
| admincp_login.htm | 后台登录 |
| admincp_home.htm | 后台首页 |
| admincp_forums.htm | 版块管理 |
| admincp_members.htm | 会员管理 |
| admincp_usergroups.htm | 用户组管理 |
| admincp_threads.htm | 主题管理 |
| admincp_prune.htm | 批量删除 |
| admincp_attach.htm | 附件管理 |
| admincp_settings.htm | 系统设置 |
| admincp_styles.htm | 风格管理 |
| admincp_templates.htm | 模板编辑 |
| admincp_plugins.htm | 插件管理 |
| admincp_tasks.htm | 任务管理 |
| admincp_logs.htm | 日志查看 |

### 版主管理 (modcp)

| 文件 | 说明 |
|------|------|
| modcp_header.htm | 版主面板头部 |
| modcp_footer.htm | 版主面板底部 |
| modcp_home.htm | 版主面板首页 |
| modcp_moderate.inc.htm | 内容审核 |
| modcp_members.htm | 用户管理 |
| modcp_forums.htm | 版块管理 |

### 其他

| 文件 | 说明 |
|------|------|
| faq.htm | 帮助文档 |
| rules.htm | 论坛规则 |
| stats.htm | 统计页面 |
| announcement.htm | 公告 |
| redirect.htm | 跳转页面 |
| showmessage.htm | 消息提示 |
| nopost.htm | 禁止发帖提示 |
| secure.htm | 安全验证 |

---

## 模板语法

### 1. 变量输出

```html
<!-- 简单变量 -->
{$variable}

<!-- 数组元素 -->
{$array[key]

<!-- 对象属性 -->
{$object->property}
```

### 2. 条件判断

```html
<!-- if -->
<!--{if $condition}-->
    内容
<!--{/if}-->

<!-- if-else -->
<!--{if $condition}-->
    内容A
<!--{else}-->
    内容B
<!--{/if}-->

<!-- if-elseif-else -->
<!--{if $condition1}-->
    内容A
<!--{elseif $condition2}-->
    内容B
<!--{else}-->
    内容C
<!--{/if}-->
```

### 3. 循环

```html
<!-- foreach -->
<!--{loop $array $value}-->
    {$value}
<!--{/loop}-->

<!-- foreach with key -->
<!--{loop $array $key $value}-->
    {$key}: {$value}
<!--{/loop}-->
```

### 4. 子模板包含

```html
<!-- 包含子模板 -->
{subtemplate header}
{subtemplate footer}

<!-- 动态模板 -->
{template $templatename}
```

### 5. 语言包

```html
<!-- 语言变量 -->
{lang index}
{lang forum_thread}

<!-- 带参数的语言变量 -->
{lang forum_moderators}
```

### 6. 常量

```html
<!-- 使用常量 -->
{BOARDURL}
{TIMESTAMP}
```

### 7. 模板函数

```html
<!-- 调用PHP函数 -->
{echo $variable}
{strip_tags($content)}

<!-- 自定义处理 -->
{avatar $uid}
{cutstr($string, 30)}
```

---

## 模板变量

### 全局变量

| 变量 | 说明 |
|------|------|
| $boardurl | 论坛URL |
| $timestamp | 当前时间戳 |
| $supe_uid | 当前用户ID |
| $supe_username | 当前用户名 |
| $navigation | 导航菜单 |

### 首页变量

| 变量 | 说明 |
|------|------|
| $forumlist | 版块列表 |
| $catlist | 分类列表 |
| $whosonline | 在线用户 |
| $announcements | 公告列表 |
| $threads | 主题列表 |
| $posts | 帖子列表 |

### 版块页变量

| 变量 | 说明 |
|------|------|
| $forum | 当前版块信息 |
| $sublist | 子版块列表 |
| $threadlist | 主题列表 |
| $page | 分页信息 |
| $foruminfo | 版块详细信息 |

### 帖子页变量

| 变量 | 说明 |
|------|------|
| $thread | 主题信息 |
| $postlist | 回复列表 |
| $aids | 附件ID列表 |
| $page | 分页信息 |

---

## 模板继承机制

### header.htm 结构

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="{$charset}">
    <title>$navtitle - {$bbname}</title>
    <link rel="stylesheet" href="forumdata/cache/style_{STYLEID}_common.css">
    <script src="include/javascript/common.js"></script>
</head>
<body>
    <!-- 顶部导航 -->
    <div id="header">
        <!-- logo、搜索、用户信息 -->
    </div>

    <!-- 导航菜单 -->
    <div id="nav">
        <!--{loop $navs $nav}-->
            {$nav[name]}
        <!--{/loop}-->
    </div>
```

### footer.htm 结构

```html
    <!-- 底部信息 -->
    <div id="footer">
        <p>Powered by <strong>Discuz!</strong></p>
        <p>{$timeline}</p>
    </div>
</body>
</html>
```

### 典型页面结构

```html
<!--{template header}-->

<!-- 面包屑导航 -->
<div id="breadcrumb">
    {$navigation}
</div>

<!-- 主内容区 -->
<div id="content">
    <!-- 页面特定内容 -->
</div>

<!-- 侧边栏（可选） -->
<div id="sidebar">
    <!-- 侧边栏内容 -->
</div>

<!--{template footer}-->
```

---

## CSS资源

### 样式文件位置

```
forumdata/cache/style_{STYLEID}_*.css
```

### 主要CSS文件

| 文件 | 说明 |
|------|------|
| style_{ID}_common.css | 通用样式 |
| style_{ID}_editor.css | 编辑器样式 |
| style_{ID}_forumdisplay.css | 版块列表样式 |
| style_{ID}_viewthread.css | 帖子阅读样式 |
| style_{ID}_post.css | 发帖样式 |

### CSS CDN

项目使用外部CDN：
```
//cdn.suicune.cn/bbs/forumdata/cache/style_{STYLEID}_*.css
```

---

## JavaScript资源

### JS文件位置

```
include/javascript/
├── common.js        # 公共函数
├── ajax.js          # AJAX处理
├── editor.js        # 编辑器
├── popup.js         # 弹出菜单
├── md5.js           # MD5加密
└── calendar.js      # 日历控件
```

---

## 模板渲染流程

```
入口文件 (index.php)
    ↓
业务逻辑处理
    ↓
准备模板数据
    ↓
调用 template() 函数
    ↓
检查模板缓存
    ├── 缓存存在 → 使用缓存
    └── 缓存不存在 → 编译模板
    ↓
替换模板变量
    ├── <!--{if}--> 条件处理
    ├── <!--{loop}--> 循环处理
    ├── {subtemplate} 包含处理
    └── {$var} 变量替换
    ↓
生成HTML
    ↓
输出到浏览器
```

---

## 模板缓存

### 缓存位置

```
forumdata/template/
├── template_*.php  # 编译后的模板
└── cache/          # 缓存目录
```

### 缓存机制

1. 首次访问时编译模板
2. 编译结果存入 `forumdata/template/`
3. 后续请求直接使用缓存
4. 模板修改后自动重新编译
5. 可通过后台清理缓存

---

## 插件模板

### 插件模板位置

```
plugins/[plugin_id]/templates/
```

### 插件模板调用

```html
<!-- 插件模板 -->
{template plugin_[plugin_id]_[template_name]}
```

---

## 模板与样式关系

| 模板目录 | 对应样式 |
|----------|----------|
| default | style_1 |
| green | style_2 |
| poketb | style_3 |
| ... | ... |

样式ID存储在：
- `cdb_styles` 表
- `$styleid` 变量
- `$_DCACHE['settings']['styleid']` 缓存

---

## 重构建议

### 1. 模板引擎选择

推荐使用现代模板引擎：
- **EJS** - 类似传统模板语法
- **Pug (Jade)** - 简洁语法
- **Handlebars** - 逻辑分离
- **React JSX** - 组件化

### 2. 组件拆分

将现有模板拆分为可复用组件：
```
components/
├── Header/
├── Footer/
├── ForumList/
├── ThreadList/
├── PostItem/
├── UserAvatar/
└── ...
```

### 3. 样式系统

- 使用 **CSS Modules** 或 **CSS-in-JS**
- 考虑 **Tailwind CSS** 或 **Ant Design**
- 响应式设计（移动端适配）

### 4. 状态管理

- 使用 React Context 或 Redux
- 组件间状态共享
- 用户认证状态管理

### 5. 数据获取

- 使用 fetch/axios
- RESTful API 设计
- 数据缓存策略

---

## 迁移映射表

| 旧模板 | React组件 | 说明 |
|--------|-----------|------|
| discuz.htm | HomePage | 首页 |
| forumdisplay.htm | ForumPage | 版块列表 |
| viewthread.htm | ThreadPage | 帖子阅读 |
| post_newthread.htm | NewThreadForm | 发帖 |
| my.htm | UserCenter | 用户中心 |
| header.htm | Header组件 | 头部 |
| footer.htm | Footer组件 | 底部 |
