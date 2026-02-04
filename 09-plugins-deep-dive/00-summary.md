# Plugins插件系统深入分析 - 总览

## 分析完成状态

### 已完成分析类别

| 系统 | 状态 | 文件数 | 说明 |
|------|------|--------|------|
| Pokemon系统 (zpet) | ✅ | 40+ | 完整游戏系统 |
| Bank银行系统 | ✅ | 8 | 银行存取款 |
| MOC移动端 | ✅ | ~50 | 移动端适配 |
| DEX图鉴 | ✅ | 4 | 图鉴查询 |
| 插件系统架构 | ✅ | 1 | 注册机制 |

### 分析文档

1. pokemon-system-deep.md - Pokemon系统深入分析 ✨
2. bank-system-deep.md - 银行系统深入分析 ✨
3. moc-system-deep.md - MOC移动端系统深入分析 ✨
4. plugin-architecture.md - 插件架构分析 ✨

## 核心发现

### 1. Pokemon系统 (最复杂的插件)

#### 功能模块
- **宠物管理**: 40个PHP文件，24张数据表
- **战斗系统**: PK对战，道馆挑战，属性克制
- **经济系统**: 商店购买，市场交易，积分兑换
- **社交系统**: 俱乐部，大学，好友对战
- **养成系统**: 等级升级，技能学习，进化
- **存储系统**: PC存储，背包管理

#### 核心文件分析
| 文件 | 行数 | 功能 |
|------|------|------|
| petindex.php | 78 | 首页排行榜 |
| mypet.php | 522 | 我的宠物管理 |
| pk.php | 495 | PK对战系统 |
| petshop.php | 410 | 商店购买 |
| useitem.php | 414 | 物品使用 |
| gym.php | 414 | 道馆挑战 |
| club.php | - | 俱乐部系统 |

### 2. Bank银行系统

#### 功能
- 存款/取款
- 转账功能
- 利率计算
- 定期存款
- 交易日志

#### 核心文件
| 文件 | 功能 |
|------|------|
| bank.func.php | 银行核心函数库 |
| admin.inc.php | 后台管理 |
| basic.inc.php | 基础功能 |

### 3. MOC移动端系统

#### 功能
- 完整的移动端适配
- 独立的模板处理
- 简化的页面结构

#### 核心文件
| 文件 | 功能 |
|------|------|
| index.php | 移动端首页 |
| login.php | 登录 |
| forumdisplay.php | 版块列表 |
| viewthread.php | 帖子阅读 |

### 4. 插件注册机制

#### 注册流程
```php
// plugins/pet.inc.php
define("PET_INDEX", TRUE);
@include DISCUZ_ROOT.'./forumdata/cache/plugin_pet.php';
$petsettings = $_DPLUGIN['pet']['vars'];
```

#### 钩子系统
- 通过插件表 `cdb_plugins` 管理
- 缓存插件配置到 `forumdata/cache/plugin_*.php`
- 使用 `$_DPLUGIN` 全局变量访问

## 数据表统计

### Pokemon系统 (24张表)
```
cdb_zpetmypet       - 用户宠物
cdb_zpetdex        - 宠物图鉴
cdb_zpetdexhtm     - 技能数据
cdb_zpetuni        - 大学系统
cdb_zpetlog        - 日志
cdb_zpetsms        - 短消息
cdb_zpetmarket     - 市场
... (共24张)
```

### Bank系统 (2张表)
```
cdb_bank           - 银行账户
cdb_banklog        - 银行日志
```

## 代码质量分析

### Pokemon系统
- **优点**: 功能完整，可玩性高
- **缺点**: 代码混乱，大量硬编码，SQL注入风险
- **重构难度**: 高

### Bank系统
- **优点**: 代码相对规范
- **缺点**: 利率计算复杂
- **重构难度**: 中

### MOC系统
- **优点**: 独立性好
- **缺点**: 重复代码多
- **重构难度**: 低

## 迁移建议

### 1. Pokemon系统
```typescript
// 独立微服务架构
// services/pokemon/
├── pokemon.entity.ts
├── pokemon.service.ts
├── battle.service.ts
├── evolution.service.ts
└── market.service.ts
```

### 2. Bank系统
```typescript
// 集成到主系统
// services/bank/
├── bank.entity.ts
├── bank.service.ts
└── interest.service.ts
```

### 3. MOC系统
```typescript
// 使用响应式设计替代
// 不再需要独立的移动端
```

## 优先级

| 系统 | 优先级 | 说明 |
|------|--------|------|
| Pokemon | 高 | 核心功能，用户粘性高 |
| Bank | 中 | 经济系统重要 |
| MOC | 低 | 响应式可替代 |
| DEX | 中 | 数据查询功能 |
