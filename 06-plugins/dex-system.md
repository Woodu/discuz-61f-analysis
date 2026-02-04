# DEX系统分析

## 系统概述

DEX (Pokedex) 系统是Pokemon图鉴的查询系统，提供Pokemon信息、技能、属性相克等查询功能。

## 核心文件

| 文件 | 说明 |
|------|------|
| dex.php | DEX主入口 |
| dexajax.php | AJAX查询接口 |
| mdex.php | 移动版DEX |
| dex/ | DEX相关资源目录 |
| mdex/ | 移动版DEX资源 |

## 功能模块

### 1. Pokemon信息查询
- 按名称/ID查询
- 按属性筛选
- 按世代筛选

### 2. 技能查询
- 技能列表
- 技能效果
- 学习等级

### 3. 属性相克查询
- 属性克制表
- 双属性计算
- 推荐属性

### 4. 进化信息
- 进化链
- 进化条件
- 进化形态

## 数据来源

DEX系统使用Pokemon游戏数据表：
- `cdb_zpetdex` - Pokemon基础信息
- `cdb_zpetdexab` - 属性克制
- `cdb_zpetdexevo` - 进化数据
- `cdb_zpetdexhtm` - 招式数据

## 迁移策略

DEX系统本质上是Pokemon数据的查询接口，可以整合到Pokemon主系统：

### API设计
```
GET    /api/pokedex/species       # Pokemon列表
GET    /api/pokedex/species/:id   # Pokemon详情
GET    /api/pokedex/moves         # 技能列表
GET    /api/pokedex/types         # 属性列表
GET    /api/pokedex/evolution/:id # 进化链
GET    /api/pokedex/weakness/:id  # 弱点分析
```

### 前端组件
```
components/Pokedex/
├── PokedexSearch.jsx      # 搜索组件
├── PokedexList.jsx        # Pokemon列表
├── PokemonCard.jsx        # Pokemon卡片
├── PokemonDetail.jsx      # Pokemon详情
├── TypeChart.jsx          # 属性相克表
└── EvolutionChain.jsx     # 进化链
```
