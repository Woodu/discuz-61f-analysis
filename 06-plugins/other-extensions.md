# 其他扩展功能分析

## 功能清单

### 1. 团队系统 (team.php)
**功能说明**: 用户团队管理功能
**数据**: 可能使用独立表或用户表扩展
**迁移**: 可考虑整合到家族系统

### 2. 好人卡系统 (ptbgood.php)
**功能说明**: 类似点赞/感谢系统
**特点**:
- 发送好人卡
- 好人卡统计
- 好人卡排行

**数据表**: `cdb_ptbgood` (推测)

### 3. 排行榜系统 (ranklist.php)
**功能说明**: 各类排行榜
**排行类型**:
- 发帖排行
- 回复排行
- 积分排行
- 在线排行
- 宠物排行

### 4. 邀请系统 (invite.php)
**功能说明**: 用户邀请注册功能
**功能**:
- 生成邀请链接
- 邀请奖励
- 邀请统计
- 邀请关系

**数据表**: `cdb_invites` (推测)

### 5. 活动/任务系统 (campaign.php)
**功能说明**: 论坛活动或用户任务
**功能**:
- 活动发布
- 活动参与
- 任务奖励

### 6. Helper功能
**文件列表**:
- `helperrt.php` - 可能是回复相关
- `helpertitle.php` - 标题相关
- `helpermss.php` - 消息相关
- `helpernewth.php` - 新主题相关
- `helperfur.php` - 其他功能
- `helperfid.php` - 版块相关
- `helpercou#stopped.php` - 优惠券/停止相关

**用途**: 这些可能是辅助功能或快捷操作的入口

### 7. 其他辅助功能

| 文件 | 功能 |
|------|------|
| topic.php | 专题功能 |
| topicadmin.php | 专题管理 |
| digg.php | 顶帖功能 |
| digu.png | 顶帖图标 |
| redirect.php | 重定向处理 |
| announcement.php | 公告系统 |
| digest.php | 精华帖管理 |
| sitemap.php | 站点地图 |
| rss.php | RSS订阅 |
| repairpost.php | 帖子修复 |
| faq.php | 帮助文档 |
| help.php | 帮助页面 |
| logging.php | 登录处理 |
| space.php | 个人空间 |
| stats.php | 统计页面 |

## 社交分享

项目包含多个社交平台的分享图标：

| 文件 | 平台 |
|------|------|
| sina.png | 新浪微博 |
| renren.png | 人人网 |
| qqshuqian.png | QQ书签 |
| qqsqpce.png | QQ空间 |
| twitter.png | Twitter |

## 站点地图

| 文件 | 说明 |
|------|------|
| sitemap.php | 地图生成脚本 |
| sitemap_1.xml | 地图文件1 |
| sitemap_2.xml | 地图文件2 |
| sitemap_baidu.xml | 百度地图 |
| sitemap_index.xml | 地图索引 |
| sitemap_baidu.xml | 主地图文件 |

## 迁移建议

### 1. 可选功能
以下功能在重构时可以考虑是否保留：
- 好人卡系统 (可用点赞/感谢替代)
- 社交分享 (可用现代分享SDK)
- 传统论坛统计 (可用现代分析工具)

### 2. 必须保留
- 排行榜系统 (用户活跃度)
- 邀请系统 (用户增长)
- 活动系统 (社区运营)

### 3. 数据表设计

```sql
-- 排行榜（可使用聚合查询，无需独立表）
CREATE VIEW user_rankings AS
SELECT
    user_id,
    COUNT(*) as post_count,
    SUM(credits) as total_credits,
    RANK() OVER (ORDER BY COUNT(*) DESC) as post_rank
FROM posts
GROUP BY user_id;

-- 邀请系统
CREATE TABLE invitations (
    code VARCHAR(50) PRIMARY KEY,
    inviter_id INT,
    invitee_id INT,
    status ENUM('pending', 'accepted', 'expired'),
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP
);

-- 活动系统
CREATE TABLE campaigns (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    type VARCHAR(50),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    rewards JSON,
    status ENUM('draft', 'active', 'ended'),
    created_at TIMESTAMP
);

CREATE TABLE campaign_participants (
    id INT PRIMARY KEY,
    campaign_id INT,
    user_id INT,
    progress JSON,
    rewards_claimed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. API设计

```
# 排行榜
GET    /api/rankings/posts       # 发帖排行
GET    /api/rankings/credits     # 积分排行
GET    /api/rankings/online      # 在线排行

# 邀请
GET    /api/invitations/my       # 我的邀请
POST   /api/invitations          # 创建邀请
GET    /api/invitations/:code    # 查询邀请
POST   /api/invitations/:code/accept # 接受邀请

# 活动
GET    /api/campaigns            # 活动列表
GET    /api/campaigns/:id        # 活动详情
POST   /api/campaigns/:id/join   # 参加活动
GET    /api/campaigns/:id/progress # 活动进度
```
