# 家族系统分析

## 系统概述

家族系统是论坛的用户组织功能，允许用户创建和加入家族，实现群体互动。

## 核心文件

| 文件 | 说明 |
|------|------|
| family/ | 家族系统目录 |
| facenter.php | 家族中心入口 |

## 功能模块

### 1. 家族创建
- 设定家族名称
- 设定家族宣言
- 支付创建费用
- 任命族长

### 2. 家族管理
- 成员招募
- 成员管理
- 家族等级
- 家族资金

### 3. 家族功能
- 家族聊天
- 家族活动
- 家族战争
- 家族排行榜

### 4. 成员系统
- 成员等级
- 成员权限
- 贡献度
- 在线状态

## 数据表

| 表名 | 说明 |
|------|------|
| cdb_fadate | 家族数据 |
| cdb_fauser | 家族成员关系 |

## 家族数据结构

```php
$family = [
    'id' => 家族ID,
    'name' => 家族名称,
    'description' => 家族宣言,
    'leader_id' => 族长ID,
    'level' => 家族等级,
    'funds' => 家族资金,
    'member_count' => 成员数,
    'max_members' => 最大成员数,
    'created_at' => 创建时间,
];

$member = [
    'user_id' => 用户ID,
    'family_id' => 家族ID,
    'role' => 角色, // 族长、副族长、精英、成员
    'contribution' => 贡献度,
    'joined_at' => 加入时间,
];
```

## 迁移策略

### 新数据结构
```sql
CREATE TABLE families (
    id INT PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    description TEXT,
    leader_id INT,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    funds DECIMAL(15,2) DEFAULT 0,
    max_members INT DEFAULT 30,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id)
);

CREATE TABLE family_members (
    id INT PRIMARY KEY,
    family_id INT,
    user_id INT,
    role ENUM('leader', 'vice_leader', 'elite', 'member') DEFAULT 'member',
    contribution INT DEFAULT 0,
    joined_at TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (family_id, user_id)
);

CREATE TABLE family_chat (
    id INT PRIMARY KEY,
    family_id INT,
    user_id INT,
    message TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE family_applications (
    id INT PRIMARY KEY,
    family_id INT,
    user_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API设计
```
GET    /api/families              # 家族列表
GET    /api/families/:id          # 家族详情
POST   /api/families              # 创建家族
PUT    /api/families/:id          # 更新家族信息
DELETE /api/families/:id          # 解散家族
POST   /api/families/:id/join     # 申请加入
POST   /api/families/:id/leave    # 离开家族
GET    /api/families/:id/members  # 成员列表
POST   /api/families/:id/kick     # 踢出成员
POST   /api/families/:id/promote  # 提升成员
GET    /api/families/:id/chat     # 家族聊天
```

### 前端组件
```
components/Family/
├── FamilyList.jsx         # 家族列表
├── FamilyDetail.jsx       # 家族详情
├── FamilyCreate.jsx       # 创建家族
├── FamilyMembers.jsx      # 成员管理
├── FamilyChat.jsx         # 家族聊天
└── FamilyRanking.jsx      # 家族排行
```
