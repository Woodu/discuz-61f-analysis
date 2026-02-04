# 道具/魔法系统分析

## 系统概述

道具系统是论坛的特色功能，用户可以使用道具实现各种特殊效果，如隐身、改名、高亮帖子等。

## 核心文件

| 文件 | 说明 |
|------|------|
| magic.php | 道具中心主页面 |

## 功能模块

### 1. 道具类型

| 道具类型 | 说明 | 效果 |
|----------|------|------|
| 隐身卡 | 隐身上线 | 在线列表不显示 |
| 改名卡 | 修改用户名 | 更改用户名 |
| 金卡 | 增加积分 | 获得积分 |
| 删除卡 | 删除帖子 | 删除他人帖子 |
| 置顶卡 | 置顶帖子 | 临时置顶帖子 |
| 高亮卡 | 高亮帖子 | 帖子高亮显示 |
| 附带卡 | 附带签名 | 帖子附带签名 |
| 查岗卡 | 查看用户IP | 查看用户真实IP |
| 强退卡 | 强制用户下线 | 使指定用户下线 |

### 2. 道具获取
- 商城购买
- 系统奖励
- 活动赠送

### 3. 道具使用
- 使用道具
- 赠送道具
- 出售道具

## 数据表

| 表名 | 说明 |
|------|------|
| cdb_magics | 道具基本信息 |
| cdb_magiclog | 道具使用日志 |
| cdb_magicmarket | 道具市场 |

## 道具数据结构

```php
$magic = [
    'id' => 道具ID,
    'name' => 道具名称,
    'description' => 道具描述,
    'price' => 道具价格,
    'stock' => 库存,
    'type' => 道具类型,
    'displayorder' => 显示顺序,
];
```

## 迁移策略

### 新数据结构
```sql
CREATE TABLE items (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(50),
    price DECIMAL(10,2),
    stock INT,
    effect JSON,           -- 道具效果配置
    created_at TIMESTAMP
);

CREATE TABLE user_items (
    id INT PRIMARY KEY,
    user_id INT,
    item_id INT,
    quantity INT DEFAULT 1,
    obtained_at TIMESTAMP
);

CREATE TABLE item_usage_log (
    id INT PRIMARY KEY,
    user_id INT,
    item_id INT,
    target_type VARCHAR(50), -- user, post, thread
    target_id INT,
    effect JSON,
    used_at TIMESTAMP
);
```

### API设计
```
GET    /api/items              # 道具列表
GET    /api/items/my           # 我的道具
POST   /api/items/:id/use      # 使用道具
POST   /api/items/:id/gift     # 赠送道具
GET    /api/shop/items         # 商城道具
POST   /api/shop/items/:id/buy # 购买道具
```
