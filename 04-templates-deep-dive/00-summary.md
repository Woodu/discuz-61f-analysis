# 模板系统深入分析 - 总览

## 分析完成状态

### 已完成分析类别

| 类别 | 状态 | 文件数 | 说明 |
|------|------|--------|------|
| 模板引擎 | ✅ | template.func.php | 模板编译系统 |
| 模板语法 | ✅ | 全部语法 | 8种语法类型 |
| 核心页面 | ✅ | 25+ | 首页/版块/帖子/发帖 |
| 用户相关 | ✅ | 15+ | 登录/注册/用户中心 |
| 短消息 | ✅ | 3+ | PM相关页面 |
| 后台管理 | ✅ | 30+ | admincp模板 |
| 版主管理 | ✅ | 5+ | modcp模板 |
| 特殊功能 | ✅ | 10+ | pet/bank/dex等 |
| 语言包 | ✅ | 20+ | lang/*.php |
| 主题风格 | ✅ | 11个主题 | 完整对比 |
| CSS样式 | ✅ | css_*.htm | 样式系统 |

### 分析文档

1. template-engine-syntax.md - 模板引擎和语法深入分析 ✨
2. core-pages-analysis.md - 核心页面模板深入分析 ✨
3. user-pm-templates.md - 用户和短消息模板深入分析 ✨
4. special-features-templates.md - 特殊功能模板深入分析 ✨
5. language-themes-styles.md - 语言包、主题和样式深入分析 ✨

## 核心发现

### 1. 模板引擎 (template.func.php)
- 自定义模板语法解析器
- 编译缓存机制 (forumdata/template/)
- 支持条件、循环、包含等8种语法
- 语言包集成 {lang key}
- 嵌套模板支持 {subtemplate}

### 2. 模板语法类型

#### 变量输出
```html
{$variable}        # 简单变量
{$array[key]}      # 数组元素
{$object->property} # 对象属性
```

#### 条件判断
```html
<!--{if $condition}-->内容<!--{/if}-->
<!--{if $condition}-->A<!--{elseif}-->B<!--{else}-->C<!--{/if}-->
```

#### 循环
```html
<!--{loop $array $value}-->内容<!--{/loop}-->
<!--{loop $array $key $value}-->内容<!--{/loop}-->
```

#### 模板包含
```html
{template filename}      # 加载模板
{subtemplate header}     # 包含子模板
```

#### 语言包
```html
{lang key_name}          # 语言变量
```

#### PHP代码
```html
{eval $code}             # 执行PHP代码
{echo $variable}         # 输出变量
```

#### 模板函数
```html
{avatar $uid}            # 用户头像
{cutstr($string, 30)}    # 截取字符串
```

#### 常量
```html
{BOARDURL}               # 论坛URL
{TIMESTAMP}              # 时间戳
```

### 3. 核心页面模板

#### 首页 (discuz.htm - 12KB, ~350行)
- 版块分类展示
- 子版块列表
- 主题列表
- 在线用户
- 公告展示
- 统计信息

#### 版块页 (forumdisplay.htm)
- 分页导航
- 筛选器 (精华/热门/最新)
- 主题列表项
- 置顶/普通主题分类
- 快速发帖

#### 帖子页 (viewthread.htm)
- 楼层节点
- 帖子内容 (BBCode解析后)
- 附件显示
- 作者信息
- 快速回复
- 分页优化

#### 发帖 (post_*.htm)
- post_newthread.htm - 新主题
- post_newreply.htm - 回复
- post_editpost.htm - 编辑
- 附件上传界面
- 特殊主题选择器

### 4. 用户系统模板

#### 登录/注册
- logging.htm - 登录页 (UCenter集成)
- register.htm - 注册页
- seccheck.htm - 安全验证

#### 用户中心
- memcp.htm - 控制面板首页
- memcp_profile.htm - 个人资料
- memcp_avatar.htm - 头像上传
- memcp_credits.htm - 积分管理
- memcp_usergroups.htm - 用户组

### 5. 短消息模板

- pm.htm - 消息列表
- pm_send.htm - 发送消息
- pm_view.htm - 查看消息
- pmprompt.htm - 新消息提示

### 6. 特殊功能模板

#### Pokemon系统
- pet_*.htm - 宠物相关页面

#### Bank系统
- bank_*.htm - 银行相关页面

#### DEX系统
- dex_*.htm - 图鉴相关页面

### 7. 后台管理模板 (admincp)

30+ 模板文件包括:
- admincp_header.htm - 头部
- admincp_footer.htm - 底部
- admincp_menu.htm - 菜单
- admincp_home.htm - 首页
- admincp_*.htm - 各功能模块

### 8. 版主管理模板 (modcp)

- modcp_header.htm
- modcp_footer.htm
- modcp_home.htm
- modcp_moderate.inc.htm
- modcp_members.htm
- modcp_forums.htm

### 9. 语言包系统

#### 位置
```
templates/default/lang/
├── actions.lang.php      # 操作语言
├── admincp.lang.php      # 后台语言 (28KB)
├── forum.lang.php        # 论坛语言
├── member.lang.php       # 用户语言
├── misc.lang.php         # 杂项语言
└── ...
```

#### 结构
```php
<?php
$lang = array(
    'key' => '翻译文本',
    'key_with_param' => '文本%s参数',
);
?>
```

### 10. 主题系统

#### 11个主题

| 主题目录 | 主题名 | 样式ID | 说明 |
|----------|--------|--------|------|
| default | 默认主题 | 1 | 官方默认 |
| 2013spring | 2013春季 | - | 季节主题 |
| english | 英文版 | - | 英文界面 |
| green | 绿色主题 | 2 | 绿色风格 |
| KKK | KKK主题 | - | 自定义 |
| linstyle-bluesky | 蓝天 | - | 蓝色天空 |
| lvyin | 绿荫 | - | 绿色阴影 |
| poketb | PokeTB | 3 | Pokemon主题 |
| poketb_autowidth | 自适应 | - | 响应式 |
| XFire | XFire | - | 自定义 |
| Xgreen | X绿色 | - | 另一绿色版 |
| zhongqiu | 中秋 | - | 节日主题 |

#### 主题继承机制
- 默认主题为基础
- 其他主题可覆盖特定文件
- 未覆盖文件使用默认主题
- CSS通过styleID区分

### 11. CSS样式系统

#### 位置
```
templates/default/css_*.htm  # 模板变量CSS
forumdata/cache/style_{ID}_*.css  # 编译后CSS
```

#### 主要CSS文件
- css_common.htm (29KB) - 最大CSS文件
- css_editor.htm
- css_forumdisplay.htm
- css_viewthread.htm
- css_post.htm

#### 模板变量
```css
{BGCODE}              # 背景色
{MAINTABLEWIDTH}      # 主表宽度
{TEXTCOLOR}           # 文字颜色
{LINKCOLOR}           # 链接颜色
{HEADERBGCOLOR}       # 头部背景
```

### 12. JavaScript资源

#### 位置
```
include/javascript/
├── common.js          # 公共函数
├── ajax.js            # AJAX处理
├── editor.js          # 编辑器
├── popup.js           # 弹出菜单
├── md5.js             # MD5加密
└── calendar.js        # 日历控件
```

## 模板编译流程

```
.htm 模板文件
    ↓
template() 函数调用
    ↓
检查缓存 (forumdata/template/)
    ├── 缓存存在且未过期 → 直接使用
    └── 缓存不存在/过期 ↓
    ↓
模板语法解析
    ├── <!--{if}--><!--{elseif}--><!--{else}--><!--{/if}--> → PHP if/elseif/else
    ├── <!--{loop}--><!--{/loop}--> → PHP foreach
    ├── {template} → include
    ├── {subtemplate} → include
    ├── {lang} → $language[]
    ├── {$var} → <?=$var?>
    ├── {eval} → eval()
    └── {function()} → 调用函数
    ↓
生成 .tpl.php 文件
    ↓
缓存到 forumdata/template/
    ↓
执行生成的PHP代码
    ↓
输出HTML
```

## 关键模板文件分析

### discuz.htm (首页)
- 版块分类循环显示
- 子版块嵌套
- 主题列表 (置顶/普通)
- 统计信息
- 在线用户列表

### forumdisplay.htm (版块页)
- 分页导航组件
- 筛选器 (digest/type/special/lastpost/heat)
- 主题列表项模板
- 置顶主题区
- 普通主题区
- 快速发帖框

### viewthread.htm (帖子页)
- 楼层节点循环
- 只看楼主功能
- 帖子内容显示
- 附件权限处理
- 作者信息卡片
- 快速回复框

### post_*.htm (发帖)
- 编辑器集成
- 附件上传界面
- 特殊主题选择 (投票/悬赏/活动/辩论/交易)
- 表单验证

## 数据传递机制

### 全局变量
```php
$boardurl, $timestamp, $supe_uid, $supe_username,
$navigation, $forumlist, $threadlist, $postlist
```

### 模板赋值
```php
include template('filename');  // 加载模板
```

### 缓存数据
```php
$_DCACHE['settings']   // 系统设置
$_DCACHE['forums']     // 版块信息
$_DCACHE['usergroups'] // 用户组
```

## 迁移建议

### 1. 前端架构

#### 组件化拆分
将现有模板拆分为React组件:
```
components/
├── layout/
│   ├── Header/
│   ├── Footer/
│   └── Navigation/
├── forum/
│   ├── ForumList/
│   ├── ThreadList/
│   └── ThreadItem/
├── thread/
│   ├── ThreadView/
│   ├── PostNode/
│   └── ReplyForm/
├── user/
│   ├── UserProfile/
│   ├── UserCenter/
│   └── AvatarUpload/
└── shared/
    ├── Pagination/
    ├── BBCodeEditor/
    └── Attachment/
```

#### 状态管理
- 使用Zustand管理全局状态
- 用户认证状态
- 论坛数据缓存
- 主题设置

### 2. 样式系统

#### 使用Tailwind CSS
- 替换现有CSS变量系统
- 响应式设计
- 主题切换支持

#### CSS架构
```
styles/
├── base/           # 基础样式
├── components/     # 组件样式
├── layouts/        # 布局样式
├── themes/         # 主题变量
└── utilities/      # 工具类
```

### 3. BBCode处理

#### 编辑器选择
- 迁移到现代富文本编辑器
- 保持BBCode兼容性
- 实时预览功能

#### 渲染策略
- 服务端: BBCode → HTML
- 客户端: HTML显示
- 编辑时: HTML → BBCode

### 4. 国际化

#### 语言包迁移
```
locales/
├── zh-CN/
│   ├── common.json
│   ├── forum.json
│   └── admin.json
└── en-US/
    ├── common.json
    ├── forum.json
    └── admin.json
```

#### 使用i18n库
- react-i18next
- 服务端支持
- 语言切换

### 5. 性能优化

#### 代码分割
- 路由级别分割
- 组件级别分割
- 懒加载

#### 缓存策略
- 静态资源CDN
- API响应缓存
- 客户端状态缓存

## 统计数据

- 总模板文件: 221个 (.htm)
- 主题数量: 11个
- 语言包文件: 20+个
- CSS模板文件: 5个主要
- JS核心文件: 6个
- 后台模板: 30+个
- 版主模板: 5+个

## 技术栈映射

| Discuz! | React Stack |
|---------|-------------|
| 模板引擎 | JSX |
| {subtemplate} | 组件嵌套 |
| <!--{loop}--> | map() |
| <!--{if}--> | 条件渲染 |
| {lang} | i18next |
| CSS模板 | CSS Modules/Tailwind |
| AJAX | fetch/axios |
| popup.js | React portals |
| common.js | hooks/utils |
