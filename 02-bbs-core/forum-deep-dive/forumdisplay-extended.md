# 论坛核心功能深入分析 - forumdisplay.php

## 概述

`forumdisplay.php` 是论坛版块列表和主题列表的核心功能文件。

**文件位置**: `D:\Dev\poketb.com\bbs\forumdisplay.php`
**文件大小**: ~437行

---

## 完整执行流程

### 核心流程图

```
1. 初始化 (define CURSCRIPT, 加载函数库)
   ↓
2. 版块验证 (存在性、类型、状态检查)
   ↓
3. 权限验证 (用户组、版块权限、密码、公式权限)
   ↓
4. 子版块加载 (查询并显示子版块)
   ↓
5. 筛选处理 (digest/type/special/时间范围)
   ↓
6. 置顶主题 (全局置顶和分类置顶)
   ↓
7. 普通主题查询 (分页、排序、筛选)
   ↓
8. 主题处理 (标题、图标、附件、状态)
   ↓
9. 统计更新 (访问时间、浏览量)
   ↓
10. 在线用户 (当前版块在线用户)
   ↓
11. 模板渲染 (传递变量、加载模板)
```

---

## SQL查询详解

### 1. 版块信息查询
```sql
SELECT f.*, ff.*
FROM {$tablepre}forums f
LEFT JOIN {$tablepre}forumfields ff ON f.fid = ff.fid
WHERE f.fid = '$fid'
```

### 2. 子版块查询
```sql
SELECT f.fid, f.name, f.threads, f.posts, f.lastpost, ff.*
FROM {$tablepre}forums f
LEFT JOIN {$tablepre}forumfields ff ON f.fid = ff.fid
WHERE f.fup = '$fid' AND f.status > 0
ORDER BY f.displayorder
```

### 3. 主题列表查询
```sql
SELECT t.*, y.userhead, m.gender
FROM {$tablepre}threads t
LEFT JOIN {$tablepre}members m ON t.authorid = m.uid
LEFT JOIN {$tablepre}ywuser y ON t.authorid = y.uid
WHERE t.fid = '$fid' AND t.displayorder >= 0
ORDER BY t.displayorder DESC, t.lastpost DESC
LIMIT $start, $tpp
```

---

## 权限检查系统

### 权限层级
1. 用户组基础权限 (readaccess)
2. 版块级权限 (viewperm, postperm)
3. 公式权限 (formulaperm)
4. 版块密码 (password)

### 关键函数
- forumperm() - 检查用户组权限
- formulaperm() - 公式权限验证

---

## 筛选功能

| 参数 | 条件 | 说明 |
|------|------|------|
| digest | t.digest > 0 | 精华主题 |
| type | t.typeid = X | 主题分类 |
| special | t.special IN (1,2,3,4,5) | 特殊主题 |
| lastpost | ORDER BY lastpost | 按最后回复 |
| heat | ORDER BY views | 按浏览数 |

---

## 缓存机制

1. 静态缓存 (threadcache)
2. Cookie缓存 (oldtopics, fid)
3. 延迟更新 (浏览量)

---

## 性能优化建议

1. 使用预处理语句防SQL注入
2. 优化LEFT JOIN
3. 引入Redis缓存
4. 分离数据获取和展示
