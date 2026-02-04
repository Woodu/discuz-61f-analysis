# 论坛核心功能深入分析 - viewthread.php

## 概述

`viewthread.php` 是论坛主题查看的核心功能文件，负责展示主题内容、回复列表、附件处理等功能。

**文件位置**: `D:\Dev\poketb.com\bbs\viewthread.php`
**文件大小**: ~640行

---

## 完整执行流程

### 核心流程图

```
1. 初始化 (define CURSCRIPT, 缓存检查)
   ↓
2. 主题验证 (存在性、访问权限)
   ↓
3. 特殊主题处理 (活动帖iframe)
   ↓
4. 权限验证 (查看、付费、附件)
   ↓
5. 主题信息加载 (更新访问记录)
   ↓
6. 只看楼主处理 (筛选作者)
   ↓
7. 帖子列表查询 (分页优化策略)
   ↓
8. 附件查询 (权限检查)
   ↓
9. 在线用户查询 (当前页作者)
   ↓
10. 帖子处理 (楼层、格式化、BBCode)
   ↓
11. 模板渲染 (传递变量)
```

---

## 关键SQL查询

### 1. 主题信息查询
```sql
SELECT * FROM {$tablepre}threads t
WHERE t.tid='$tid' AND t.displayorder>='0'
```

### 2. 帖子列表查询（复杂关联）
```sql
SELECT p.*, m.*, mf.*, 
       a.clubname, 
       b.id, b.name AS petuser, b.class, b.nowlv, b.nowexp,
       k.id as pmid,
       y.uni, y.viplosemon, y.userhead
FROM {$tablepre}posts p
LEFT JOIN {$tablepre}members m ON m.uid=p.authorid
LEFT JOIN {$tablepre}memberfields mf ON mf.uid=m.uid
LEFT JOIN {$tablepre}zpetmypet b ON b.name=m.username AND b.place=1
LEFT JOIN {$tablepre}zpetdex k ON k.class=b.class AND k.uplv=b.nowlv
LEFT JOIN {$tablepre}zpetuni y ON y.username=m.username
LEFT JOIN {$tablepre}zpetclubdata a ON a.id=y.clubid
WHERE p.tid='$tid' AND p.invisible='0'
ORDER BY dateline LIMIT $start, $ppp
```

**关联表说明**：
- posts: 帖子主表
- members: 用户基本信息
- memberfields: 用户扩展信息
- zpetmypet: 宠物系统
- zpetdex: 宠物图鉴
- zpetuni: 宠物宇宙
- zpetclubdata: 俱乐部数据

### 3. 分页优化查询

```php
// 前翻页（标准查询）
$pageadd = "ORDER BY dateline LIMIT $start_limit, $ppp";

// 后翻页（优化查询）
if($pagebydesc) {
    $firstpagesize = ($thread['replies'] + 1) % $ppp;
    $realpage = $totalpage - $page + 1;
    $start_limit = ($realpage - 2) * $ppp + $firstpagesize;
    $pageadd = "ORDER BY dateline DESC LIMIT $start_limit, $ppp2";
}
```

---

## 权限系统

### 权限检查流程

```php
// 1. 论坛查看权限
if(empty($forum['allowview'])) {
    if(!$forum['viewperm'] && !$readaccess) {
        showmessage('group_nopermission');
    }
}

// 2. 帖子阅读权限
if($thread['readperm'] > $readaccess) {
    showmessage('thread_nopermission');
}

// 3. 付费主题检查
if($thread['price'] > 0) {
    // 检查是否已付费
    $query = $db->query("SELECT tid FROM {$tablepre}paymentlog 
                        WHERE tid='$tid' AND uid='$discuz_uid'");
    if(!$db->num_rows($query)) {
        $threadpay = TRUE;
    }
}

// 4. 附件下载权限
$allowgetattach = $forum['allowgetattach'] || 
                 forumperm($forum['getattachperm']);
```

---

## 特殊主题处理

### 1. 投票帖 (special=1)
```php
case 1: 
    include_once DISCUZ_ROOT.'./include/viewthread_poll.inc.php'; 
    break;
```

### 2. 活动帖 (digest=-2)
```php
if($thread['digest'] == '-2') {
    $campaign = $db->fetch_first("SELECT * FROM {$tablepre}campaigns WHERE tid='$tid'");
    $iframeurl = $campaign['url']."siteid=$insenz[siteid]";
    include template('viewthread_iframe');
    exit;
}
```

---

## 楼层计算逻辑

```php
// 楼层计算
if($pagebydesc) {
    // 后翻页：从后往前数
    $post['number'] = $numpost + $ppp2--;
    $post['count'] = $ppp3 - $postcount - 1;
} else {
    // 前翻页：从前往后数
    $post['number'] = ++$numpost;
    $post['count'] = $postcount;
}
```

---

## 只看楼主功能

```php
// URL参数：?tid=xxx&authorid=xxx
$authorid = intval($authorid);
if($authorid) {
    // 更新回复数
    $thread['replies'] = $db->result_first(
        "SELECT COUNT(*) FROM {$tablepre}posts 
         WHERE tid='$tid' AND invisible='0' 
         AND authorid='$authorid' AND anonymous='0'"
    ) - 1;
    
    // 添加筛选条件
    $onlyauthoradd = "AND p.authorid='$authorid' AND p.anonymous='0'";
}
```

---

## 附件处理

### 附件权限检查

```php
if($post['attachment']) {
    if($allowgetattach && !$threadpay) {
        // 有权限：收集附件ID
        $attachpids .= ",$post[pid]";
        
        // 提取附件标签
        preg_match_all("/\[attach\](\d+)\[\/attach\]/i", 
                      $post['message'], $matchaids);
        $attachtags[$post['pid']] = $matchaids[1];
    } else {
        // 无权限：移除附件标签
        $post['message'] = preg_replace(
            "/\[attach\](\d+)\[\/attach\]/i", 
            '', 
            $post['message']
        );
    }
}
```

---

## 缓存机制

### 1. 页面缓存策略

```php
// 缓存条件
if($cachethreadlife && $forum['threadcaches'] 
   && !$discuz_uid && $page == 1 && !$forum['special']) {
    viewthread_loadcache();
}

// 缓存评分算法
$threadcachemark = 100 - (
    $thread['displayorder'] * 15 +      // 置顶权重
    $thread['digest'] * 10 +            // 精华权重
    min($thread['views'] / 10, 50) +    // 浏览量权重
    max(-10, (15 - $forum['lastpostdays'])) +  // 活跃度权重
    min($thread['replies'] / $ppp * 1.5, 15)   // 回复数权重
);
```

### 2. 浏览量延迟更新

```php
// 文件缓存方式
if($delayviewcount == 1 || $delayviewcount == 3) {
    $logfile = './forumdata/cache/cache_threadviews.log';
    $fp = fopen(DISCUZ_ROOT.$logfile, 'a');
    fwrite($fp, "$tid\n");
    fclose($fp);
} else {
    // 直接更新数据库
    $db->query("UPDATE LOW_PRIORITY {$tablepre}threads 
                SET views=views+1 WHERE tid='$tid'", 'UNBUFFERED');
}
```

---

## 宠物系统深度集成

### 宠物信息处理

```php
// 等级计算
$post['lv'] = floor(($post['nowexp'] + 9) / 10);

// 宇宙图标
for($n = 1; $n <= $post['uni']; $n++) {
    $post['unipic'] .= "<img src=images/zpet/uni/$n.png>";
}

// 宠物头像
if($post['userhead'] != 0) {
    $post['userpic'] = "<img src=images/zpet/userhead/$post[userhead].png>";
} elseif($post['gender'] == 2) {
    $post['userpic'] = "<img src=images/zpet/other/girl.png>";
} else {
    $post['userpic'] = "<img src=images/zpet/other/boy.png>";
}

// 宠物排名
if($post['rank'] >= 6) {
    $post['petrank'] = "<img src=images/zpet/rank/6.png>";
} elseif($post['rank'] > 0) {
    $post['petrank'] = "<img src=images/zpet/rank/$post[rank].png>";
}
```

---

## 性能优化

### 1. 分页优化

- 前50页：正向查询 `ORDER BY dateline ASC`
- 后50页：反向查询 `ORDER BY dateline DESC`
- 减少数据扫描量

### 2. 查询优化

- 使用索引字段 (tid, authorid, dateline)
- LEFT JOIN优化
- UNBUFFERED查询

### 3. 缓存策略

- 页面静态缓存
- 浏览量延迟更新
- 用户访问记录Cookie缓存

---

## 总结

viewthread.php 是最复杂的论坛核心文件：

**特点**：
1. 复杂的分页优化算法
2. 完善的权限检查系统
3. 深度集成的宠物系统
4. 灵活的缓存机制
5. 多种特殊主题支持

**迁移建议**：
1. 分离数据获取和展示
2. 使用Redis缓存
3. API化改造
4. 分离宠物系统为独立模块
