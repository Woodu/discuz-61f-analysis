# 语言包、主题和样式系统深入分析

## 1. 语言包系统

### 1.1 语言包文件结构

```
templates/default/lang/
├── actions.lang.php      # 操作相关
├── admincp.lang.php      # 后台管理 (28KB)
├── admincp_menu.lang.php # 后台菜单
├── custom.lang.php       # 自定义语言
├── emails.lang.php       # 邮件模板
├── forum.lang.php        # 论坛相关
├── member.lang.php       # 用户相关
├── misc.lang.php         # 杂项
├── plugins.lang.php      # 插件语言
├── pm.lang.php           # 短消息
└── templates.lang.php    # 模板语言
```

### 1.2 语言包格式

```php
<?php
/*
    [Discuz!] (C)2001-2009 Comsenz Inc.
    This is NOT a freeware
*/

$language = array(
    'key_name' => '翻译文本',
    'key_with_param' => '带参数的文本 %s',
    'key_multi_params' => '多个参数: %s, %d',
);

// 返回语言数组
return $language;
?>
```

### 1.3 关键语言包文件分析

#### forum.lang.php (论坛语言)

```php
$language = array(
    // 论坛基础
    'forum' => '论坛',
    'forum_name' => '论坛名称',
    'forum_threads' => '主题',
    'forum_posts' => '帖子',
    'forum_moderators' => '版主',
    'forum_lastpost' => '最后发表',

    // 版块相关
    'forum_subforums' => '子版块',
    'forum_rules' => '版规',
    'forum_redirect' => '跳转版块',
    'forum_category' => '分类',

    // 主题相关
    'thread' => '主题',
    'thread_subject' => '标题',
    'thread_author' => '作者',
    'thread_replies' => '回复',
    'thread_views' => '查看',
    'thread_lastpost' => '最后回复',
    'thread_digest' => '精华',
    'thread_sticky' => '置顶',
    'thread_closed' => '关闭',
    'thread_new' => '新帖',

    // 操作相关
    'post_new' => '发帖',
    'post_reply' => '回复',
    'post_edit' => '编辑',
    'post_delete' => '删除',
);
```

#### member.lang.php (用户语言)

```php
$language = array(
    // 用户信息
    'username' => '用户名',
    'password' => '密码',
    'uid' => 'UID',
    'usergroup' => '用户组',
    'regdate' => '注册时间',
    'lastvisit' => '最后访问',
    'posts' => '帖子数',
    'digestposts' => '精华帖',

    // 用户操作
    'login' => '登录',
    'logout' => '退出',
    'register' => '注册',
    'profile' => '个人资料',
    'edit_profile' => '修改资料',

    // 用户组
    'usergroup_admin' => '管理员',
    'usergroup_supermod' => '超级版主',
    'usergroup_moderator' => '版主',
    'usergroup_member' => '会员',
    'usergroup_guest' => '游客',

    // 积分相关
    'credits' => '积分',
    'extcredits' => '扩展积分',
    'credit_transfer' => '转账',
    'credit_exchange' => '兑换',
);
```

#### admincp.lang.php (后台语言 - 28KB)

```php
$language = array(
    // 后台头部
    'header_admincp' => '后台管理',
    'header_welcome' => '欢迎',
    'header_logout' => '退出',

    // 菜单项
    'menu_home' => '首页',
    'menu_forum' => '论坛',
    'menu_user' => '用户',
    'menu_topic' => '内容',
    'menu_extended' => '扩展',
    'menu_tool' => '工具',

    // 功能模块
    'settings' => '系统设置',
    'forums' => '版块管理',
    'members' => '用户管理',
    'threads' => '主题管理',
    'attachments' => '附件管理',
    'plugins' => '插件管理',
    'templates' => '模板管理',
    'styles' => '风格管理',
    'logs' => '日志查看',
    'database' => '数据库',

    // 15个设置分组
    'settings_basic' => '基本设置',
    'settings_access' => '访问控制',
    'settings_post' => '发帖设置',
    'settings_attachments' => '附件设置',
    'settings_user' => '用户设置',
    'settings_credits' => '积分设置',
    'settings_seo' => 'SEO设置',
    'settings_times' => '时间设置',
    'settings_mail' => '邮件设置',
    'settings_caching' => '缓存设置',
    'settings_sec' => '安全设置',
    'settings_perms' => '权限设置',
    'settings_ucenter' => 'UCenter设置',
    'settings_verify' => '验证设置',
    'settings_misc' => '杂项设置',
    'settings_space' => '空间设置',
);
```

### 1.4 模板中使用语言包

```html
<!-- 简单语言变量 -->
{lang forum_name}
{lang login}
{lang register}

<!-- 带参数的语言变量 (需要在PHP中预处理) -->
{lang welcome_user}  // 需要传递 $username 变量
```

### 1.5 语言加载机制

```php
// include/global.func.php
function language($file, $templateid = 0, $tpldir = '') {
    $tpldir = $tpldir ? $tpldir : TPLDIR;
    $templateid = $templateid ? $templateid : TEMPLATEID;

    // 构建语言包路径
    $langfile = DISCUZ_ROOT.'./'.$tpldir.'/lang/'.$file.'.lang.php';

    // 如果不存在且非默认主题，尝试使用默认主题语言包
    if($templateid != 1 && !file_exists($langfile)) {
        $langfile = DISCUZ_ROOT.'./templates/default/lang/'.$file.'.lang.php';
    }

    // 包含语言包
    return include $langfile;
}

// 使用示例
$language = language('forum');
echo $language['forum_name'];
```

## 2. 主题系统

### 2.1 主题清单 (11个)

| 主题目录 | 主题名 | 风格ID | 文件数 | 说明 |
|----------|--------|--------|--------|------|
| default | 默认主题 | 1 | 221 | 官方默认模板 |
| 2013spring | 2013春季主题 | - | ~50 | 季节限定 |
| english | 英文版 | - | ~50 | 英文界面 |
| green | 绿色主题 | 2 | ~80 | 绿色风格 |
| KKK | KKK主题 | - | ~60 | 用户定制 |
| linstyle-bluesky | 蓝天主题 | - | ~70 | 蓝色天空风格 |
| lvyin | 绿荫主题 | - | ~60 | 绿色阴影风格 |
| poketb | PokeTB主题 | 3 | ~100 | Pokemon主题 |
| poketb_autowidth | 自适应主题 | - | ~50 | 响应式布局 |
| XFire | XFire主题 | - | ~60 | 用户定制 |
| Xgreen | X绿色主题 | - | ~60 | 另一绿色版 |
| zhongqiu | 中秋主题 | - | ~50 | 节日限定 |

### 2.2 主题继承机制

```
default (默认主题 - 基础)
    ├── green (覆盖部分CSS和图片)
    ├── poketb (覆盖部分模板和图片)
    └── poketb_autowidth (继承poketb，修改CSS)
```

**继承规则**:
1. 默认主题为基础，包含所有221个模板文件
2. 其他主题只需覆盖需要修改的文件
3. 未覆盖的文件自动使用默认主题
4. 通过 `cdb_styles` 表管理主题配置

### 2.3 主题配置表 (cdb_styles)

```sql
CREATE TABLE cdb_styles (
    styleid SMALLINT(6) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL DEFAULT '',
    templateid SMALLINT(6) UNSIGNED NOT NULL DEFAULT '0',
    PRIMARY KEY (styleid)
);

-- 示例数据
INSERT INTO cdb_styles VALUES
(1, '默认风格', 1),
(2, '绿意盎然', 2),
(3, 'PokeTB', 3);
```

### 2.4 主题切换实现

```php
// 用户选择主题
if(isset($_GET['styleid'])) {
    $styleid = intval($_GET['styleid']);

    // 保存到Cookie
    dsetcookie('styleid', $styleid, 31536000);
} elseif(isset($_DCOOKIE['styleid'])) {
    $styleid = intval($_DCOOKIE['styleid']);
} else {
    $styleid = $_DCACHE['settings']['styleid'];
}

// 加载主题配置
$styleid = intval($styleid);
$style = $_DCACHE['style_'.$styleid];

// 模板目录
$tpldir = $style['tpldir'] ? $style['tpldir'] : 'templates/default';
define('TPLDIR', $tpldir);

// 模板ID
define('TEMPLATEID', $style['templateid'] ? $style['templateid'] : 1);
```

### 2.5 主题文件结构对比

#### default/ (221 files)
```
templates/default/
├── discuz.htm           # 首页
├── forumdisplay.htm     # 版块页
├── viewthread.htm       # 帖子页
├── post_*.htm          # 发帖相关
├── member_*.htm        # 用户相关
├── memcp_*.htm         # 用户中心
├── pm*.htm             # 短消息
├── admincp_*.htm       # 后台 (30+)
├── modcp_*.htm         # 版主 (5+)
├── css_*.htm           # CSS模板 (5+)
├── lang/               # 语言包 (20+)
└── images/             # 图片资源
```

#### poketb/ (~100 files - 覆盖文件)
```
templates/poketb/
├── discuz.htm           # 修改的首页 (Pokemon风格)
├── viewthread.htm       # 修改的帖子页 (显示宠物)
├── pet_*.htm           # Pokemon系统 (55+)
├── css_*.htm           # 修改的CSS
├── lang/               # 语言包覆盖
└── images/             # Pokemon图片资源
    ├── zpet/          # 宠物系统图片
    └── ...
```

## 3. CSS样式系统

### 3.1 CSS模板文件 (5个主要文件)

| 文件 | 大小 | 说明 |
|------|------|------|
| css_common.htm | 29KB (最大) | 通用样式 |
| css_editor.htm | ~10KB | 编辑器样式 |
| css_forumdisplay.htm | ~8KB | 版块页样式 |
| css_viewthread.htm | ~10KB | 帖子页样式 |
| css_post.htm | ~8KB | 发帖页样式 |

### 3.2 css_common.htm - 通用样式分析

```
/* 模板变量定义 */
{BGCOLOR}              # 背景色
{MENUBG}              # 菜单背景
{MENUTEXT}            # 菜单文字
{CATBORDER}           # 分类边框
{HEADERBGCOLOR}       # 头部背景
{TABLEBG}             # 表格背景
{TABLEBORDER}         # 表格边框
{TEXTCOLOR}           # 文字颜色
{LINKCOLOR}           # 链接颜色
{HOVERCOLOR}          # 悬停颜色
{LIGHTTEXT}           # 浅色文字
{MAINTABLEWIDTH}      # 主表宽度

/* 通用CSS */
body {
    background-color: {BGCOLOR};
    color: {TEXTCOLOR};
    font-family: {FONT};
    font-size: {FONTSIZE};
}

a {
    color: {LINKCOLOR};
    text-decoration: none;
}

a:hover {
    color: {HOVERCOLOR};
}

/* 布局 */
#wrapper {
    width: {MAINTABLEWIDTH};
    margin: 0 auto;
}

#header {
    background-color: {HEADERBGCOLOR};
    padding: 10px;
}

#nav {
    background-color: {MENUBG};
    color: {MENUTEXT};
}

/* 表格 */
table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    border: 1px solid {TABLEBORDER};
    padding: 8px;
}

/* 按钮 */
button, .btn {
    background-color: {MENUBG};
    color: {MENUTEXT};
    border: 1px solid {MENUBG};
    padding: 5px 15px;
}

button:hover {
    background-color: {HOVERCOLOR};
}

/* 表单 */
input[type="text"],
input[type="password"],
textarea,
select {
    border: 1px solid {TABLEBORDER};
    padding: 5px;
    font-size: {FONTSIZE};
}

/* 工具类 */
.clear {
    clear: both;
}

.center {
    text-align: center;
}

.right {
    float: right;
}

.left {
    float: left;
}

/* 论坛特定 */
.forumlist {
    margin-bottom: 10px;
}

.threadlist {
    margin-bottom: 10px;
}

.postnode {
    padding: 10px;
    border-bottom: 1px solid {TABLEBORDER};
}
```

### 3.3 CSS编译机制

```
css_common.htm (模板)
    ↓
cache.func.php -> updatecss()
    ↓
替换模板变量
{BGCOLOR} → #FFFFFF
{LINKCOLOR} → #0066CC
...
    ↓
生成 style_1_common.css
    ↓
forumdata/cache/style_1_common.css
    ↓
模板中引用
<link href="forumdata/cache/style_{STYLEID}_common.css" />
```

### 3.4 CSS变量替换

```php
// include/cache.func.php
function updatecss($templateid) {
    global $style;

    // CSS模板文件
    $cssfiles = array(
        'common',
        'editor',
        'forumdisplay',
        'viewthread',
        'post'
    );

    foreach($cssfiles as $cssfile) {
        // 读取模板
        $tplfile = DISCUZ_ROOT.'./templates/'.$style['tpldir'].'/css_'.$cssfile.'.htm';
        $csscontent = file_get_contents($tplfile);

        // 替换变量
        $csscontent = str_replace(
            array('{BGCOLOR}', '{LINKCOLOR}', '{TEXTCOLOR}', ...),
            array($style['bgcolor'], $style['linkcolor'], $style['textcolor'], ...),
            $csscontent
        );

        // 写入缓存
        $cachefile = DISCUZ_ROOT.'./forumdata/cache/style_'.$templateid.'_'.$cssfile.'.css';
        file_put_contents($cachefile, $csscontent);
    }
}
```

### 3.5 Pokemon主题CSS覆盖

```css
/* templates/poketb/css_pokemon.htm - Pokemon特定样式 */

/* 宠物卡片 */
.pet-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    padding: 15px;
    margin: 10px;
    color: white;
}

/* 宠物属性 */
.pet-type-fire {
    background-color: #F08030;
}

.pet-type-water {
    background-color: #6890F0;
}

.pet-type-grass {
    background-color: #78C850;
}

.pet-type-electric {
    background-color: #F8D030;
}

/* 战斗场景 */
.battle-scene {
    background-image: url('images/zpet/battle/bg.png');
    background-size: cover;
    min-height: 400px;
    position: relative;
}

/* 血条 */
.hp-bar {
    width: 100%;
    height: 20px;
    background-color: #ccc;
    border-radius: 10px;
    overflow: hidden;
}

.hp-current {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s ease;
}
```

## 4. JavaScript资源

### 4.1 JS文件清单

| 文件 | 大小 | 说明 |
|------|------|------|
| common.js | ~30KB | 公共函数库 |
| ajax.js | ~10KB | AJAX处理 |
| editor.js | ~20KB | 编辑器 |
| popup.js | ~5KB | 弹出菜单 |
| md5.js | ~5KB | MD5加密 |
| calendar.js | ~10KB | 日历控件 |
| viewthread.js | ~8KB | 帖子页功能 |

### 4.2 common.js - 公共函数

```javascript
// 获取元素
function $(id) {
    return document.getElementById(id);
}

// AJAX请求
function ajaxget(url, targetid) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            $(targetid).innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// 复制到剪贴板
function setcopy(text, msg) {
    if(window.clipboardData) {
        window.clipboardData.setData('Text', text);
        if(msg) alert(msg);
    } else {
        // Firefox等浏览器
        prompt('Press Ctrl+C to copy', text);
    }
}

// 显示/隐藏元素
function toggle_collapse(id, force) {
    var obj = $(id);
    if(force !== undefined) {
        obj.style.display = force ? '' : 'none';
    } else {
        obj.style.display = obj.style.display == 'none' ? '' : 'none';
    }
}

// 显示菜单
function showMenu(id) {
    var menu = $(id + '_menu');
    menu.style.display = 'block';
}

// 隐藏菜单
function hideMenu(id) {
    var menu = $(id + '_menu');
    menu.style.display = 'none';
}

// 确认对话框
function confirm(msg) {
    return window.confirm(msg);
}
```

### 4.3 ajax.js - AJAX处理

```javascript
// AJAX对象
var ajax = {
    // 发送GET请求
    get: function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    callback(xhr.responseText, xhr);
                } else {
                    callback(null, xhr);
                }
            }
        };
        xhr.send();
    },

    // 发送POST请求
    post: function(url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    callback(xhr.responseText, xhr);
                } else {
                    callback(null, xhr);
                }
            }
        };
        xhr.send(data);
    },

    // JSON请求
    json: function(url, callback) {
        this.get(url, function(text, xhr) {
            if(text) {
                try {
                    var data = JSON.parse(text);
                    callback(data, xhr);
                } catch(e) {
                    callback(null, xhr);
                }
            } else {
                callback(null, xhr);
            }
        });
    }
};
```

### 4.4 editor.js - BBCode编辑器

```javascript
var editor = {
    // 插入BBCode
    insert: function(tag, value) {
        var textarea = $('message');
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var text = textarea.value;

        var selection = text.substring(start, end);
        var replacement = '[' + tag + ']' + selection + '[/' + tag + ']';

        textarea.value = text.substring(0, start) + replacement +
                       text.substring(end);

        textarea.focus();
    },

    // 插入URL
    url: function() {
        var url = prompt('请输入URL:');
        if(url) {
            this.insert('url', url);
        }
    },

    // 插入图片
    image: function() {
        var url = prompt('请输入图片URL:');
        if(url) {
            this.insert('img', url);
        }
    },

    // 粗体
    bold: function() {
        this.insert('b', '');
    },

    // 斜体
    italic: function() {
        this.insert('i', '');
    },

    // 下划线
    underline: function() {
        this.insert('u', '');
    },

    // 引用
    quote: function() {
        this.insert('quote', '');
    },

    // 代码
    code: function() {
        this.insert('code', '');
    }
};
```

## 5. React迁移方案

### 5.1 国际化 (i18n)

```jsx
// 使用react-i18next
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

// 初始化
i18n.init({
  lng: 'zh-CN',
  fallbackLng: 'en',
  resources: {
    'zh-CN': {
      translation: {
        'forum_name': '论坛',
        'login': '登录',
        'register': '注册',
        'welcome_back': '欢迎回来，{{name}}',
      }
    },
    'en-US': {
      translation: {
        'forum_name': 'Forum',
        'login': 'Login',
        'register': 'Register',
        'welcome_back': 'Welcome back, {{name}}',
      }
    }
  }
});

// 使用
function LoginPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('login')}</h1>
      <button>{t('register')}</button>
    </div>
  );
}
```

### 5.2 主题系统

```jsx
// 使用Tailwind CSS + CSS Variables
// globals.css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --link-color: #0066cc;
  --primary-color: #0066cc;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --link-color: #4da6ff;
  --primary-color: #4da6ff;
}

[data-theme="pokemon"] {
  --bg-color: #f5f5f5;
  --text-color: #333333;
  --link-color: #667eea;
  --primary-color: #667eea;
}

// ThemeContext.js
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用
function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="default">默认主题</option>
      <option value="dark">暗黑主题</option>
      <option value="pokemon">Pokemon主题</option>
    </select>
  );
}
```

### 5.3 CSS-in-JS (Styled Components)

```jsx
import styled from 'styled-components';

// 使用主题变量
const ForumCard = styled.div`
  background-color: ${props => props.theme.bgColor};
  color: ${props => props.theme.textColor};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 8px;
  padding: 16px;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

// 使用
function ForumList({ forums }) {
  return (
    <div>
      {forums.map(forum => (
        <ForumCard key={forum.id}>
          <h3>{forum.name}</h3>
          <p>{forum.description}</p>
        </ForumCard>
      ))}
    </div>
  );
}
```

### 5.4 样式迁移映射表

| Discuz CSS | Tailwind CSS | 说明 |
|------------|--------------|------|
| `.clear` | `clearfix` | 清除浮动 |
| `.center` | `text-center` | 文字居中 |
| `.left` | `float-left` | 左浮动 |
| `.right` | `float-right` | 右浮动 |
| `.btn` | `btn` | 按钮基础样式 |
| `.mainbox` | `card` | 卡片容器 |
| `.formbox` | `form` | 表单容器 |

## 6. 性能优化

### 6.1 CSS优化

1. **按需加载**
```jsx
// 路由级别的CSS加载
const HomePage = lazy(() => import('./HomePage/Home.module.css'));
const ForumPage = lazy(() => import('./ForumPage/Forum.module.css'));
```

2. **CSS压缩**
```javascript
// 生产环境
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [new TerserPlugin()],
  },
};
```

3. **关键CSS提取**
```jsx
// 使用critters
const critters = require('critters');

// 提取关键CSS用于首屏
```

### 6.2 JS优化

1. **代码分割**
```jsx
// 路由级别分割
const HomePage = lazy(() => import('./pages/HomePage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
```

2. **Tree Shaking**
```javascript
// 只导入需要的函数
import { debounce } from 'lodash-es';
// 而不是
import _ from 'lodash';
```

3. **代码压缩**
```javascript
// terser配置
{
  compress: {
    drop_console: true,  // 移除console
    pure_funcs: ['console.log'],  // 移除特定函数
  }
}
```
