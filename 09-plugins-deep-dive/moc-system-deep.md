# MOC移动端系统深度分析

## 1. 系统概述

MOC (Mobile Center) 是一个完整的移动端适配插件，为Discuz论坛提供WAP/移动设备访问功能。

## 2. 文件结构

```
bbs/plugins/moc/                    # MOC移动端系统 (~50个文件)
├── index.php                      # 移动端首页
├── login.php                      # 登录页面
├── logging.php                    # 登录处理
├── common.inc.php                 # 公共包含
├── dcommon.inc.php                # 公共定义
├── config.inc.php                 # 配置文件
├── forum.func.php                 # 论坛函数
├── template.func.php              # 模板处理
├── forums.php                     # 版块列表
├── forumdisplay.php               # 版块显示
├── threads.php                    # 主题列表
├── posts.php                      # 帖子列表
├── newthread.inc.php              # 发新主题
├── newreply.inc.php               # 回复主题
├── viewthread.php                 # 查看帖子
├── viewthread_poll.inc.php         # 投票帖子
├── viewthread_reward.inc.php       # 悬赏帖子
├── viewthread_trade.inc.php       # 交易帖子
├── viewthread_activity.inc.php     # 活动帖子
├── viewthread_debate.inc.php       # 辩论帖子
├── space.php                      # 个人空间
├── viewpro.php                    # 查看资料
├── pm.php                         # 短消息
├── messages.php                   # 消息列表
├── search.php                     # 搜索
├── smilies.php                    # 表情
├── attachment.php                 # 附件处理
├── attimage.php                   # 附件图片
├── moderation.inc.php              // 版主操作
└── ... (共~50个文件)
```

## 3. 核心文件分析

### 3.1 common.inc.php - 公共包含

```php
<?php
if(!defined('IN_DISCUZ')) {
    exit('Access Denied');
}

// 加载Discuz核心
require_once DISCUZ_ROOT.'./include/common.inc.php';

// MOC专用配置
$mobic = 'mobic/';  // 模板目录

// 移动端检测
function is_mobile() {
    $user_agents = array(
        'iPhone', 'iPad', 'iPod', 'Android', 'BlackBerry',
        'Mobile', 'Symbian', 'Phone', 'Windows CE'
    );

    foreach ($user_agents as $agent) {
        if (strpos($_SERVER['HTTP_USER_AGENT'], $agent) !== false) {
            return true;
        }
    }

    return false;
}

// 检查是否强制使用移动版
if ($_GET['mobile'] == 'yes' || is_mobile()) {
    define('MOC_VERSION', true);
} else {
    define('MOC_VERSION', false);
}

// 简化的分页函数
function moc_multi($num, $perpage, $curpage, $mpurl) {
    $multipage = '';
    if($num > $perpage) {
        $page = 5;
        $offset = floor(($curpage - 1) / $page);
        $pages = @ceil($num / $perpage);

        $from = $offset * $page + 1;
        $to = min(($offset + 1) * $page, $pages);
        $multipage = "<select name='page' onchange=\"location.href='$mpurl&page='+this.value\">";

        for($i = $from; $i <= $to; $i++) {
            $multipage .= "<option value='$i'".($i == $curpage ? " selected" : "").">$i</option>";
        }

        $multipage .= "</select>";
    }

    return $multipage;
}

// 简化的模板函数
function moc_template($file) {
    global $mobic;
    $tplfile = DISCUZ_ROOT.'./plugins/moc/template/'.$file.'.htm';

    if (!file_exists($tplfile)) {
        // 回退到默认模板
        $tplfile = DISCUZ_ROOT.'./plugins/moc/template/default_'.$file.'.htm';
    }

    return $tplfile;
}
?>
```

### 3.2 index.php - 移动端首页

```php
<?php
require_once 'common.inc.php';

if(!$discuz_uid) {
    // 未登录，显示登录页
    include template('login');
    exit;
}

// 加载论坛数据
$query = $db->query("SELECT * FROM {$tablepre}forums WHERE status='1' ORDER BY displayorder");
while($forum = $db->fetch_array($query)) {
    $forumlist[] = $forum;
}

// 加载最新主题
$query = $db->query("SELECT * FROM {$tablepre}threads
                     ORDER BY dateline DESC LIMIT 20");
while($thread = $db->fetch_array($query)) {
    $threadlist[] = $thread;
}

// 移动端优化
// 1. 减少每页显示数量
// 2. 简化模板
// 3. 移除复杂功能

include template('index');
?>
```

### 3.3 forums.php - 版块列表

```php
<?php
require_once 'common.inc.php';

// 版块分类查询
$query = $db->query("SELECT * FROM {$tablepre}forums
                     WHERE type='forum'
                     AND status='1'
                     ORDER BY displayorder");

$catlist = array();
while($forum = $db->fetch_array($query)) {
    if($forum['fup']) {
        // 子版块
        $catlist[$forum['fup']]['forums'][] = $forum;
    } else {
        // 顶级分类
        if (!isset($catlist[$forum['fid']])) {
            $catlist[$forum['fid']] = array();
        }
        $catlist[$forum['fid']] = $forum;
    }
}

// 移动端显示优化
// 只显示一级分类和直接子版块
// 隐藏深层嵌套

include template('forums');
?>
```

### 3.4 viewthread.php - 帖子阅读

```php
<?php
require_once 'common.inc.php';

$tid = intval($_GET['tid']);

// 查询主题信息
$query = $db->query("SELECT * FROM {$tablepre}threads WHERE tid='$tid'");
$thread = $db->fetch_array($query);

// 查询帖子列表
$ppp = 10;  // 移动端每页显示10条(桌面版是20)
$page = max(1, intval($_GET['page']));

$start = ($page - 1) * $ppp;

$query = $db->query("SELECT * FROM {$tablepre}posts
                     WHERE tid='$tid'
                     ORDER BY dateline LIMIT $start, $ppp");
while($post = $db->fetch_array($query)) {
    $postlist[] = $post;
}

// 移动端优化
// 1. 简化分页
// 2. 隐藏复杂功能
// 3. 只显示核心内容

include template('viewthread');
?>
```

## 4. 模板处理

### 4.1 template.func.php - 模板函数

```php
<?php
/**
 * 移动端模板加载
 */
function moc_loadtemplate($file) {
    global $mobic, $tpldir;

    $tplfile = DISCUZ_ROOT.'./plugins/moc/template/'.$file.'.htm';

    if (file_exists($tplfile)) {
        return file_get_contents($tplfile);
    }

    // 回退到默认模板
    return file_get_contents(DISCUZ_ROOT.'./plugins/moc/template/default_'.$file.'.htm');
}

/**
 * 移动端模板解析
 */
function moc_parsetemplate($tplfile, $data) {
    // 简化的模板解析器
    // 不支持复杂语法，只支持变量替换

    $content = file_get_contents($tplfile);

    foreach ($data as $key => $value) {
        $content = str_replace('{$'.$key.'}', $value, $content);
    }

    return $content;
}
?>
```

## 5. 与桌面版的差异

### 5.1 功能简化

| 功能 | 桌面版 | 移动版 |
|------|--------|--------|
| 每页显示 | 20条 | 10条 |
| 分页组件 | 复杂 | 简化下拉 |
| 模板语法 | 完整 | 简化 |
| 复杂功能 | 全部 | 移除 |
| 图片显示 | 原图 | 缩略图 |

### 5.2 响应式建议

**不使用MOC，改用响应式设计**:

```css
/* 响应式替代 */
@media (max-width: 768px) {
  /* 移动端样式 */
  .thread-list {
    /* 单列显示 */
  }

  .post-content {
    /* 简化布局 */
  }

  .sidebar {
    /* 隐藏侧边栏 */
    display: none;
  }

  .pagination {
    /* 移动端分页 */
  }
}

@media (min-width: 769px) {
  /* 桌面端样式 */
}
```

## 6. 迁移建议

### 6.1 不迁移MOC

理由：
1. 响应式设计是现代标准
2. 维护两套代码成本高
3. 用户体验更好

### 6.2 使用React + Tailwind

```tsx
// 响应式布局
import { useBreakpoint } from '@/hooks/useBreakpoint';

function ThreadList() {
  const isMobile = useBreakpoint('md');

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-3"
    )}>
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
```

### 6.3 PWA支持

```typescript
// 添加PWA支持
// public/manifest.json
{
  "name": "PokeTB Forum",
  "short_name": "PokeTB",
  "description": "Pokemon TB Forum",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```
