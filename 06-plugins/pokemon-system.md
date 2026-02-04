# Pokemon游戏系统分析

## 系统概述

Pokemon系统是本项目最复杂的插件，包含24张数据表和完整的在线游戏功能。这是一个功能齐全的宠物养成、对战、交易系统。

## 目录结构

```
bbs/
├── zpet/                    # 新版Pokemon系统（主系统）
│   ├── petindex.php        # 宠物中心首页
│   ├── mypet.php           # 我的宠物
│   ├── catchpm.php         # 捕捉宠物
│   ├── market.php          # 宠物市场
│   ├── shop.php            # 商店
│   ├── gym.php             # 道馆挑战
│   ├── club.php            # 俱乐部
│   ├── pk.php              # 对战系统
│   └── ...
├── pet/                     # 旧版Pokemon系统
│   ├── petbattle.php       # 战斗系统
│   ├── weaponshop.php      # 武器店
│   └── ...
├── mdex/                    # Pokemon图鉴
│   └── (图片资源)
├── dex.php                  # DEX查询入口
├── dexajax.php              # DEX AJAX接口
├── mdex.php                 # 图鉴入口
└── plantajax.php            # 种植相关
```

---

## 功能模块

### 1. 宠物管理系统

#### 宠物属性
| 属性 | 说明 |
|------|------|
| HP | 生命值 |
| 攻击 | 物理攻击力 |
| 防御 | 物理防御力 |
| 特攻 | 特殊攻击力 |
| 特防 | 特殊防御力 |
| 速度 | 行动速度 |

#### 等级系统
- 等级范围：1-100级
- 经验值公式：`10 × 等级² - 9`
- 升级获得属性点

#### 宠物获取方式
- **捕捉**：在指定地点捕捉野生宠物
- **购买**：从商店购买
- **交易**：从市场购买其他玩家的宠物
- **进化**：宠物进化获得新形态

#### 核心文件
```php
// petindex.php - 宠物中心
switch($action) {
    case 'mypet':      // 我的宠物
    case 'catch':      // 捕捉宠物
    case 'market':     // 市场
    case 'shop':       // 商店
    case 'gym':        // 道馆
    case 'club':       // 俱乐部
    case 'pk':         // 对战
}
```

---

### 2. 图鉴系统

#### 数据表结构
| 表名 | 说明 |
|------|------|
| cdb_zpetdex | Pokemon基础数据 |
| cdb_zpetdexab | 属性克制关系 |
| cdb_zpetdexevo | 进化链数据 |
| cdb_zpetdexhtm | 招式/技能数据 |
| cdb_zpetdexii | 第二代数据 |
| cdb_zpetdexmove | 移动/位置数据 |
| cdb_zpetfruitdex | 果实图鉴 |
| cdb_zpetfruitmap | 果实分布地图 |

#### 图鉴功能
- Pokemon信息查询
- 技能/招式查询
- 属性相克查询
- 进化条件查询
- 分布地图查询

#### 用户图鉴进度
| 表名 | 说明 |
|------|------|
| cdb_zpetuserdex | 用户图鉴完成度 |

---

### 3. 交易系统

#### 宠物市场
| 表名 | 说明 |
|------|------|
| cdb_zpetmarket | 市场挂单 |
| cdb_zpetshop | 商店物品 |
| cdb_zpetuseritem | 用户道具背包 |

#### 交易流程
```
卖家：
1. 选择宠物上架
2. 设置价格
3. 确认挂单

买家：
1. 浏览市场
2. 选择宠物
3. 支付购买
4. 获得宠物
```

#### 物品系统
| 物品类型 | 说明 |
|----------|------|
| 捕捉道具 | 用于捕捉野生宠物 |
| 培养道具 | 增加属性值 |
| 恢复道具 | 恢复HP |
| 进化道具 | 触发进化 |

---

### 4. 战斗系统

#### 战斗类型
| 类型 | 说明 |
|------|------|
| PVP | 玩家对战 |
| PVE | 野怪/道馆战斗 |
| 俱乐部战 | 俱乐部之间的对战 |

#### 战斗机制
- 回合制战斗
- 属性克制系统
- 速度决定先手
- 暴击/闪避机制

#### 伤害计算
```
基础伤害 = (攻击 / 防御) × 基础威力
属性加成 = 克制系数 (0.5x, 1x, 2x)
暴击加成 = 1.5x
最终伤害 = 基础伤害 × 属性加成 × 暴击加成
```

#### 道馆系统
| 表名 | 说明 |
|------|------|
| cdb_zpetgym | 道馆数据 |

#### 战斗文件
- `zpet/pk.php` - 主对战系统
- `pet/petbattle.php` - 旧版战斗

---

### 5. 社交系统

#### 俱乐部系统
| 表名 | 说明 |
|------|------|
| cdb_zpetclubdata | 俱乐部数据 |
| cdb_zpetclubmember | 俱乐部成员 |

#### 俱乐部功能
- 创建俱乐部
- 加入俱乐部
- 俱乐部等级
- 俱乐部资金
- 俱乐部聊天

#### 排行榜
| 表名 | 说明 |
|------|------|
| cdb_zpetuni | 排行榜数据 |

#### 排行类型
- 等级排行榜
- 战斗排行榜
- 财富排行榜

---

### 6. 用户数据

#### 用户宠物
| 表名 | 说明 |
|------|------|
| cdb_zpetmypet | 用户拥有的宠物 |

#### 宠物数据结构
```php
$pet = [
    'id' => 宠物ID,
    'uid' => 用户ID,
    'petid' => Pokemon ID,
    'name' => 宠物名称,
    'level' => 等级,
    'exp' => 经验值,
    'hp' => 当前HP,
    'maxhp' => 最大HP,
    'atk' => 攻击,
    'def' => 防御,
    'satk' => 特攻,
    'sdef' => 特防,
    'spd' => 速度,
    'skills' => 技能列表,
    'nature' => 性格,
    'gender' => 性别,
];
```

#### 用户库存
| 表名 | 说明 |
|------|------|
| cdb_zpetuseritem | 用户物品 |
| cdb_zpetuserfruit | 用户果实 |
| cdb_zpetuserchestnut | 用户栗子(货币) |

---

## 与论坛集成

### 积分系统
- 使用论坛积分作为游戏货币
- 战斗胜利/失败影响积分
- 交易消耗积分

### 用户绑定
- 宠物绑定论坛用户ID
- 显示论坛头像和用户名
- 帖子中可展示宠物信息

### 权限控制
- 基于用户组权限
- 版块可设置是否允许宠物功能

---

## 数据表完整清单

| 表名 | 说明 |
|------|------|
| cdb_zpetdex | Pokemon图鉴基础数据 |
| cdb_zpetdexab | 属性克制关系 |
| cdb_zpetdexevo | 进化链数据 |
| cdb_zpetdexhtm | 招式数据 |
| cdb_zpetdexii | 二代数据 |
| cdb_zpetdexmove | 移动数据 |
| cdb_zpetfruitdex | 果实图鉴 |
| cdb_zpetfruitmap | 果实分布 |
| cdb_zpetgym | 道馆系统 |
| cdb_zpetlog | 操作日志 |
| cdb_zpetmappm | 地图PM分布 |
| cdb_zpetmarket | 宠物市场 |
| cdb_zpetmypet | 用户宠物 |
| cdb_zpetshop | 商店系统 |
| cdb_zpetsms | 短消息 |
| cdb_zpetsx | 属性系统 |
| cdb_zpetuni | 排行榜 |
| cdb_zpetuserchestnut | 用户栗子 |
| cdb_zpetuserdex | 用户图鉴 |
| cdb_zpetuserfruit | 用户果实 |
| cdb_zpetuseritem | 用户物品 |
| cdb_zpetweight | 重量系统 |
| cdb_zpoketb | Pokemon TB数据 |
| cdb_zpoketbii | Pokemon TB II数据 |
| cdb_zrandomteam | 随机队伍 |

---

## 迁移策略

### 1. 数据迁移
```sql
-- 用户宠物
INSERT INTO new_pokemon_pets (id, user_id, species_id, level, ...)
SELECT id, uid, petid, level, ...
FROM cdb_zpetmypet;

-- 图鉴数据
INSERT INTO new_pokemon_species (id, name, type1, type2, ...)
SELECT petid, name, property, property2, ...
FROM cdb_zpetdex;
```

### 2. 功能模块化
将Pokemon系统拆分为独立模块：
- `PokemonService` - 核心服务
- `BattleService` - 战斗系统
- `MarketService` - 交易系统
- `ClubService` - 俱乐部系统

### 3. API设计
```
GET    /api/pokemon/my           # 我的宠物
GET    /api/pokemon/:id          # 宠物详情
POST   /api/pokemon/catch        # 捕捉宠物
GET    /api/pokemon/market       # 市场列表
POST   /api/pokemon/market/buy   # 购买宠物
GET    /api/pokemon/gym          # 道馆列表
POST   /api/pokemon/battle       # 发起战斗
GET    /api/pokemon/pokedex/:id  # 图鉴查询
```

### 4. 前端组件
```
components/Pokemon/
├── PokemonCenter.jsx      # 宠物中心
├── MyPokemon.jsx          # 我的宠物
├── PokemonDetail.jsx      # 宠物详情
├── PokemonMarket.jsx      # 宠物市场
├── PokemonBattle.jsx      # 对战系统
├── PokemonGym.jsx         # 道馆挑战
└── Pokedex.jsx            # 图鉴
```

---

## 关键代码示例

### 捕捉宠物
```php
// catchpm.php
$wildPokemon = getRandomWildPokemon();
if (catchSuccess($rate, $item)) {
    addPetToUser($uid, $wildPokemon);
    logCatch($uid, $wildPokemon);
}
```

### 战斗计算
```php
// pk.php
function calculateDamage($attacker, $defender, $move) {
    $baseDamage = ($attacker['atk'] / $defender['def']) * $move['power'];
    $typeBonus = getTypeEffectiveness($move['type'], $defender['type']);
    $critical = (rand(1, 100) <= 6) ? 1.5 : 1;
    return $baseDamage * $typeBonus * $critical;
}
```

### 市场交易
```php
// market.php
function buyPet($marketId, $buyerId) {
    $listing = getMarketListing($marketId);
    if (deductCredits($buyerId, $listing['price'])) {
        transferPet($listing['seller_id'], $buyerId, $listing['pet_id']);
        removeMarketListing($marketId);
    }
}
```
