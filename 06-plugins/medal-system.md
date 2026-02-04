# 勋章系统分析

## 系统概述

勋章系统用于表彰论坛用户的贡献和成就，用户可以通过申请或系统自动获得勋章。

## 核心文件

| 文件 | 说明 |
|------|------|
| medal.php | 勋章中心主页面 |

## 功能模块

### 1. 勋章类型

| 类型 | 获得方式 |
|------|----------|
| 发帖勋章 | 达到发帖数 |
| 回复勋章 | 达到回复数 |
| 精华勋章 | 获得精华帖数 |
| 在线勋章 | 在线时长 |
| 贡献勋章 | 版主/管理员颁发 |
| 活动勋章 | 参与活动获得 |

### 2. 勋章申请
- 用户申请勋章
- 版主审核
- 自动颁发（满足条件）

### 3. 勋章展示
- 个人资料展示
- 帖子旁展示
- 勋章墙

## 数据表

| 表名 | 说明 |
|------|------|
| cdb_medals | 勋章基本信息 |
| cdb_medallog | 勋章颁发日志 |

## 勋章数据结构

```php
$medal = [
    'id' => 勋章ID,
    'name' => 勋章名称,
    'description' => 勋章描述,
    'image' => 勋章图片,
    'type' => 勋章类型,
    'conditions' => 获得条件,
    'price' => 申请价格（积分）,
];
```

## 迁移策略

### 新数据结构
```sql
CREATE TABLE medals (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    type ENUM('auto', 'apply', 'manual'),
    conditions JSON,         -- 获得条件
    displayorder INT,
    created_at TIMESTAMP
);

CREATE TABLE user_medals (
    id INT PRIMARY KEY,
    user_id INT,
    medal_id,
    obtained_at TIMESTAMP,
    granted_by INT,          -- 颁发者（手动颁发时）
    reason TEXT              -- 颁发理由
);

CREATE TABLE medal_applications (
    id INT PRIMARY KEY,
    user_id INT,
    medal_id INT,
    status ENUM('pending', 'approved', 'rejected'),
    applied_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INT,
    reason TEXT
);
```

### API设计
```
GET    /api/medals                # 勋章列表
GET    /api/medals/my             # 我的勋章
POST   /api/medals/:id/apply      # 申请勋章
GET    /api/medals/applications   # 申请列表（审核用）
POST   /api/medals/:id/grant      # 颁发勋章（管理员）
```
