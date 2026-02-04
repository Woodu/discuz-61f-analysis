# 特殊功能模板深入分析

## 1. Pokemon系统模板 (55+文件)

### 1.1 模板文件完整清单

#### 核心页面 (5个)
| 文件 | 说明 |
|------|------|
| pet_index.htm | 宠物系统首页 |
| pet_center.htm | 宠物中心 |
| pet_mypet.htm | 我的宠物 |
| pet_list.htm | 宠物列表 |
| pet_info.htm | 宠物详情 |

#### 战斗相关 (5个)
| 文件 | 说明 |
|------|------|
| pet_battle.htm | 战斗界面 |
| petbattle.htm | 战斗页面 |
| pet_gym.htm | 道馆挑战 |
| pet_starpk.htm | 明星PK |
| pet_active.htm | 活动战斗 |

#### 商店系统 (6个)
| 文件 | 说明 |
|------|------|
| pet_shop.htm | 商店首页 |
| pet_itemshop.htm | 道具商店 |
| pet_itemcenter.htm | 道具中心 |
| pet_store.htm | 商店 |
| pet_mybag.htm | 我的背包 |
| pet_market.htm | 宠物市场 |

#### 等级进化 (5个)
| 文件 | 说明 |
|------|------|
| pet_pc.htm | 电脑存储 |
| pet_pc_box.htm | 电脑盒子 |
| pet_plant.htm | 种植系统 |
| pet_town.htm | 城镇 |
| pet_map.htm | 地图 |

#### 俱乐部系统 (5个)
| 文件 | 说明 |
|------|------|
| pet_club_index.htm | 俱乐部首页 |
| pet_club_myclub.htm | 我的俱乐部 |
| pet_club_build.htm | 建设俱乐部 |
| pet_club_chat.htm | 俱乐部聊天 |
| pet_club_admin.htm | 俱乐部管理 |

#### 社交系统 (4个)
| 文件 | 说明 |
|------|------|
| pet_pmhome.htm | 私信首页 |
| pet_pmbg.htm | 私信背景 |
| pet_pmcatch.htm | 捕获私信 |
| pet_pmunivs.htm | 宇宙私信 |

#### 其他功能 (25+个)
| 文件 | 说明 |
|------|------|
| pet_menu.htm | 导航菜单 |
| pet_inc.htm | 公共包含 |
| pet_inc_user.htm | 用户包含 |
| pet_navbar.htm | 导航栏 |
| pet_view_inc.htm | 查看包含 |
| pet_orphanage.htm | 孤儿院 |
| pet_other.htm | 其他功能 |
| pet_user.htm | 用户页面 |
| pet_userdex.htm | 用户图鉴 |
| pet_admin_index.htm | 后台首页 |
| pet_log.htm | 日志系统 |
| pet_sms.htm | 短消息 |
| petlist.htm | 宠物列表(备用) |
| petmenu.htm | 菜单(备用) |

### 1.2 pet_index.htm - 宠物首页分析

#### 模板结构

```html
{template header}

<div class="container">
  <!-- 导航 -->
  <div id="nav">
    <a href="$indexname">$bbname</a> &raquo; <a href="petcenter.php">宠物中心首页</a>
  </div>

  <!-- 三栏布局 -->
  <style>
  #leftbar { float: left; width: 16%; padding-right: 4%; }
  #rightbar { float: left; width: 18%; padding-left: 10px; }
  #mainbar { float: left; width: 60%; }
  </style>

  <!-- 左侧栏 - 菜单 -->
  <div id="leftbar" class="side">
    {template pet_inc}  <!-- 宠物菜单组件 -->
  </div>

  <!-- 中间栏 - 主内容 -->
  <div id="mainbar" class="content">

    <!-- 系统公告 -->
    <table id="memberinfo" class="portalbox">
      <tr>
        <td align="center">
          <b>宠物系统公告</b><br />
          $ALLsee
        </td>
      </tr>
    </table>

    <!-- Logo图片 -->
    <img src="images/zpet/other/indexlogo_3.png" />

    <!-- 用户宠物列表 -->
    <div class="mainbox formbox">
      <h1>用户宠物</h1>
      <table>
        <thead>
          <tr>
            <td>昵称</td>
            <td>种族</td>
            <td>性别</td>
            <td>属性</td>
            <td>等级</td>
          </tr>
        </thead>
        <tbody>
          $petLIST  <!-- 循环输出宠物 -->
        </tbody>
      </table>
    </div>

    <!-- 大学列表 -->
    <div class="mainbox formbox">
      <h1>大学列表</h1>
      <table>
        <thead>
          <tr>
            <td>用户名</td>
            <td>大学名</td>
            <td>等级</td>
          </tr>
        </thead>
        <tbody>
          $uniLIST
        </tbody>
      </table>
    </div>
  </div>

  <!-- 右侧栏 - 信息 -->
  <div id="rightbar">

    <!-- 明星宠物 -->
    <div class="mainbox formbox">
      <h1>明星宠物</h1>
      <table>
        <thead>
          <tr>
            <td>等级最高的宠物</td>
          </tr>
        </thead>
        <tr>
          <td align="center">$starpetpic</td>
        </tr>
        <tr>
          <td>宠物昵称: $starpet[petname]</td>
        </tr>
        <tr>
          <td>宠物等级: $starpetlv</td>
        </tr>
        <tr>
          <td>种族名称: $starpet[name]</td>
        </tr>
      </table>
    </div>

    <!-- 宠物排行 -->
    <div class="mainbox formbox">
      <h1>宠物排行</h1>
      $rankLIST
    </div>

  </div>
</div>

{template footer}
```

#### 关键变量

| 变量 | 类型 | 说明 |
|------|------|------|
| $ALLsee | string | 系统公告 |
| $petLIST | string | 用户宠物列表HTML |
| $uniLIST | string | 大学列表HTML |
| $starpet | array | 明星宠物信息 |
| $starpetpic | string | 明星宠物图片 |
| $starpetlv | int | 明星宠物等级 |
| $rankLIST | string | 排行榜HTML |

### 1.3 pet_battle.htm - 战斗界面

```
{template header}

<div class="pet-battle-container">

  <!-- 战斗场景 -->
  <div class="battle-scene">
    <img src="images/zpet/battle/battle_bg.png" class="battle-bg" />

    <!-- 我方宠物 -->
    <div class="my-pet">
      <img src="$mypet[image]" alt="$mypet[name]" />
      <div class="pet-info">
        <h3>$mypet[name]</h3>
        <div class="hp-bar">
          <div class="hp-current" style="width: $mypet[hp_percent]%"></div>
        </div>
        <p>HP: $mypet[hp]/$mypet[maxhp]</p>
        <p>等级: $mypet[level]</p>
      </div>
    </div>

    <!-- 对方宠物 -->
    <div class="enemy-pet">
      <img src="$enemy[image]" alt="$enemy[name]" />
      <div class="pet-info">
        <h3>$enemy[name]</h3>
        <div class="hp-bar">
          <div class="hp-current" style="width: $enemy[hp_percent]%"></div>
        </div>
        <p>HP: $enemy[hp]/$enemy[maxhp]</p>
      </div>
    </div>

    <!-- 战斗日志 -->
    <div class="battle-log">
      <!--{loop $battlelog $log}-->
      <p>$log[message]</p>
      <!--{/loop}-->
    </div>
  </div>

  <!-- 操作面板 -->
  <div class="battle-actions">
    <h3>选择行动</h3>

    <!-- 技能列表 -->
    <div class="skills">
      <!--{loop $skills $skill}-->
      <button type="button" onclick="useSkill($skill[id])">
        $skill[name]
        <br />
        <small>PP: $skill[pp]/$skill[maxpp]</small>
      </button>
      <!--{/loop}-->
    </div>

    <!-- 道具 -->
    <div class="items">
      <button type="button" onclick="openItemBag()">使用道具</button>
    </div>

    <!-- 其他 -->
    <div class="other-actions">
      <button type="button" onclick="tryEscape()">逃跑</button>
      <button type="button" onclick="catchPet()">捕捉</button>
    </div>
  </div>

</div>

<script>
function useSkill(skillId) {
  ajaxget('petbattle.php?action=skill&skillid=' + skillId, 'battle-log');
}

function openItemBag() {
  showWindow('itembag', 'petitemcenter.php');
}

function tryEscape() {
  ajaxget('petbattle.php?action=escape', 'battle-log');
}

function catchPet() {
  ajaxget('petbattle.php?action=catch', 'battle-log');
}
</script>

{template footer}
```

### 1.4 pet_shop.htm - 宠物商店

```
{template header}

<div class="pet-shop-container">

  <!-- 商店分类 -->
  <div class="shop-categories">
    <ul>
      <li {if $category == 'all'}class="active"{/if}>
        <a href="petshop.php?category=all">全部商品</a>
      </li>
      <li {if $category == 'ball'}class="active"{/if}>
        <a href="petshop.php?category=ball">精灵球</a>
      </li>
      <li {if $category == 'item'}class="active"{/if}>
        <a href="petshop.php?category=item">道具</a>
      </li>
      <li {if $category == 'tm'}class="active"{/if}>
        <a href="petshop.php?category=tm">技能学习机</a>
      </li>
    </ul>
  </div>

  <!-- 商品列表 -->
  <div class="shop-items">
    <table>
      <thead>
        <tr>
          <th>商品</th>
          <th>名称</th>
          <th>价格</th>
          <th>说明</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!--{loop $items $item}-->
        <tr>
          <td>
            <img src="$item[image]" alt="$item[name]" />
          </td>
          <td>$item[name]</td>
          <td>
            <!--{if $item[price_type] == 'credits'}-->
              $item[price] 积分
            <!--{elseif $item[price_type] == 'money'}-->
              $item[price] 游戏币
            <!--{/if}-->
          </td>
          <td>$item[description]</td>
          <td>
            <form method="post" action="petshop.php?action=buy">
              <input type="hidden" name="itemid" value="$item[id]" />
              <input type="number" name="amount" value="1" min="1" max="99" />
              <button type="submit">购买</button>
            </form>
          </td>
        </tr>
        <!--{/loop}-->
      </tbody>
    </table>
  </div>

  <!-- 用户背包 -->
  <div class="my-bag">
    <h3>我的背包</h3>
    <table>
      <!--{loop $bagitems $bagitem}-->
      <tr>
        <td>$bagitem[name] x $bagitem[count]</td>
        <td>
          <button onclick="useItem($bagitem[id])">使用</button>
        </td>
      </tr>
      <!--{/loop}-->
    </table>
  </div>

</div>

{template footer}
```

### 1.5 pet_club_index.htm - 俱乐部首页

```
{template header}

<div class="pet-club-container">

  <!-- 俱乐部列表 -->
  <div class="club-list">
    <h1>宠物俱乐部</h1>

    <!-- 创建俱乐部 -->
    <!--{if !$myclub}-->
    <div class="create-club">
      <button onclick="showWindow('createclub', 'pet_club.php?action=create')">
        创建俱乐部
      </button>
    </div>
    <!--{/if}-->

    <!-- 俱乐部列表 -->
    <table>
      <thead>
        <tr>
          <th>俱乐部名称</th>
          <th>会长</th>
          <th>等级</th>
          <th>成员数</th>
          <th>资金</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!--{loop $clubs $club}-->
        <tr>
          <td>
            <img src="$club[icon]" alt="$club[name]" />
            <a href="pet_club.php?action=view&clubid=$club[id]">
              $club[name]
            </a>
          </td>
          <td><a href="space.php?uid=$club[ownerid]">$club[owner]</a></td>
          <td>$club[level]</td>
          <td>$club[member_count]</td>
          <td>$club[money]</td>
          <td>
            <!--{if $club[can_join]}-->
              <a href="pet_club.php?action=join&clubid=$club[id]">加入</a>
            <!--{elseif $club[is_member]}-->
              <a href="pet_club.php?action=view&clubid=$club[id]">进入</a>
            <!--{/if}-->
          </td>
        </tr>
        <!--{/loop}-->
      </tbody>
    </table>
  </div>

  <!-- 我的俱乐部 -->
  <!--{if $myclub}-->
  <div class="my-club">
    <h2>我的俱乐部</h2>

    <div class="club-info">
      <img src="$myclub[icon]" />
      <h3>$myclub[name]</h3>
      <p>等级: $myclub[level]</p>
      <p>资金: $myclub[money]</p>
      <p>成员: $myclub[member_count]/$myclub[max_members]</p>
    </div>

    <!-- 俱乐部功能 -->
    <div class="club-actions">
      <a href="pet_club.php?action=build">建设</a>
      <a href="pet_club.php?action=chat">聊天</a>
      <a href="pet_club.php?action=members">成员管理</a>
      <!--{if $myclub[is_admin]}-->
        <a href="pet_club.php?action=admin">管理</a>
      <!--{/if}-->
    </div>
  </div>
  <!--{/if}-->

</div>

{template footer}
```

## 2. Bank银行系统模板

### 2.1 模板文件清单

| 文件 | 说明 |
|------|------|
| bank_index.htm | 银行首页 |
| bank_deposit.htm | 存款 |
| bank_withdraw.htm | 取款 |
| bank_transfer.htm | 转账 |
| bank_log.htm | 交易日志 |
| bank_admin.htm | 后台管理 |

### 2.2 bank_index.htm - 银行首页

```
{template header}

<div class="bank-container">

  <div id="nav">
    <a href="$indexname">$bbname</a> &raquo; <a href="bank.php">银行</a>
  </div>

  <!-- 银行信息 -->
  <div class="bank-info">
    <h1>$bank[name]</h1>

    <table>
      <tr>
        <th>我的账户</th>
        <td>$account[amount] $extcredits[$bank[credit]]</td>
      </tr>
      <tr>
        <th>存款利率</th>
        <td>$bank[interest_rate]% / 天</td>
      </tr>
      <tr>
        <th>转账手续费</th>
        <td>$bank[transfer_fee]%</td>
      </tr>
    </table>
  </div>

  <!-- 操作菜单 -->
  <div class="bank-actions">
    <ul>
      <li><a href="bank.php?action=deposit">存款</a></li>
      <li><a href="bank.php?action=withdraw">取款</a></li>
      <li><a href="bank.php?action=transfer">转账</a></li>
      <li><a href="bank.php?action=log">交易记录</a></li>
    </ul>
  </div>

  <!-- 最新公告 -->
  <!--{if $bank[announcement]}-->
  <div class="bank-announcement">
    <h3>银行公告</h3>
    <p>$bank[announcement]</p>
  </div>
  <!--{/if}-->

</div>

{template footer}
```

## 3. DEX图鉴系统模板

### 3.1 模板文件

| 文件 | 说明 |
|------|------|
| dex_index.htm | 图鉴首页 |
| dex_list.htm | 图鉴列表 |
| dex_detail.htm | 图鉴详情 |
| dex_my.htm | 我的图鉴 |

## 4. Magic道具系统模板

### 4.1 模板文件

| 文件 | 说明 |
|------|------|
| magic_list.htm | 道具列表 |
| magic_my.htm | 我的道具 |
| magic_shop.htm | 道具商店 |
| magic_use.htm | 使用道具 |

## 5. Medal勋章系统模板

### 5.1 模板文件

| 文件 | 说明 |
|------|------|
| medal_list.htm | 勋章列表 |
| medal_my.htm | 我的勋章 |
| medal_apply.htm | 申请勋章 |

## 6. Family家族系统模板

### 6.1 模板文件

| 文件 | 说明 |
|------|------|
| family_index.htm | 家族首页 |
| family_create.htm | 创建家族 |
| family_join.htm | 加入家族 |
| family_members.htm | 家族成员 |

## 7. React组件拆分建议

### 7.1 Pokemon系统

```jsx
// PokemonSystem
├── PokemonDashboard     // 宠物面板
│   ├── PokemonList    // 宠物列表
│   ├── PokemonCard    // 宠物卡片
│   └── PokemonStats   // 宠物属性
├── PokemonBattle        // 战斗系统
│   ├── BattleScene    // 战斗场景
│   ├── BattleLog      // 战斗日志
│   ├── SkillPanel     // 技能面板
│   └── ItemPanel      // 道具面板
├── PokemonShop          // 商店系统
│   ├── ShopCategories // 商店分类
│   ├── ShopItems      // 商品列表
│   └── MyBag          // 我的背包
├── PokemonClub          // 俱乐部系统
│   ├── ClubList       // 俱乐部列表
│   ├── ClubDetail     // 俱乐部详情
│   ├── ClubBuild      // 建设俱乐部
│   └── ClubChat       // 俱乐部聊天
├── PokemonPC            // 电脑存储
│   ├── PCBox          // 存储盒子
│   └── PokemonStorage // 存储管理
└── PokemonSocial        // 社交系统
    ├── PMHome         // 私信首页
    └── UniSystem      // 大学系统
```

### 7.2 Bank银行系统

```jsx
// BankSystem
├── BankDashboard        // 银行首页
│   ├── AccountInfo    // 账户信息
│   ├── BankStats      // 银行统计
│   └── BankActions    // 操作菜单
├── BankDeposit          // 存款
├── BankWithdraw         // 取款
├── BankTransfer         // 转账
└── BankLog             // 交易日志
```

### 7.3 其他扩展系统

```jsx
// Extensions
├── DexSystem            // 图鉴系统
│   ├── DexList        // 图鉴列表
│   ├── DexDetail      // 图鉴详情
│   └── MyDex          // 我的图鉴
├── MagicSystem          // 道具系统
│   ├── MagicList      // 道具列表
│   ├── MagicShop      // 道具商店
│   └── MagicInventory // 道具背包
├── MedalSystem          // 勋章系统
│   ├── MedalList      // 勋章列表
│   └── MedalCase      // 我的勋章
└── FamilySystem         // 家族系统
    ├── FamilyList     // 家族列表
    ├── FamilyDetail   // 家族详情
    └── FamilyMembers  // 家族成员
```

## 8. 数据模型关系

### 8.1 Pokemon系统数据表

```
cdb_pets              - 宠物基本信息
├── pet_id           - 宠物ID
├── user_id          - 用户ID
├── species_id       - 种族ID
├── nickname         - 昵称
├── level            - 等级
├── exp              - 经验值
├── hp               - 当前HP
├── maxhp            - 最大HP
├── attack           - 攻击力
├── defense          - 防御力
├── sp_attack        - 特攻
├── defense          - 特防
├── speed            - 速度
├── gender           - 性别
├── nature           - 性格
├── ability          - 特性
└── shiny            - 是否闪光

cdb_pet_species       - 宠物种族
├── species_id       - 种族ID
├── name             - 名称
├── type1            - 属性1
├── type2            - 属性2
├── base_hp          - 基础HP
├── base_attack      - 基础攻击
├── base_defense     - 基础防御
├── base_sp_attack   - 基础特攻
├── base_sp_defense  - 基础特防
├── base_speed       - 基础速度
├── growth_rate      - 成长率
├── description      - 描述
└── image            - 图片

cdb_pet_moves         - 宠物招式
├── move_id          - 招式ID
├── name             - 名称
├── type             - 属性
├── power            - 威力
├── accuracy         - 命中
├── pp               - PP值
├── category         - 类别 (物理/特殊/变化)
└── description      - 描述

cdb_pet_moves_learned - 已学招式
├── id               - 记录ID
├── pet_id           - 宠物ID
├── move_id          - 招式ID
├── current_pp       - 当前PP

cdb_pet_items         - 道具
├── item_id          - 道具ID
├── name             - 名称
├── type             - 类型
├── effect           - 效果
├── price            - 价格
└── description      - 描述

cdb_pet_inventory      - 背包
├── id               - 记录ID
├── user_id          - 用户ID
├── item_id          - 道具ID
├── count            - 数量

cdb_pet_clubs         - 俱乐部
├── club_id          - 俱乐部ID
├── name             - 名称
├── owner_id         - 会长ID
├── level            - 等级
├── exp              - 经验
├── money            - 资金
├── icon             - 图标
└── max_members      - 最大成员数

cdb_pet_club_members  - 俱乐部成员
├── id               - 记录ID
├── club_id          - 俱乐部ID
├── user_id          - 用户ID
├── join_time        - 加入时间
└── contribution     - 贡献度
```

### 8.2 Bank系统数据表

```
cdb_bank_accounts     - 银行账户
├── uid              - 用户ID
├── amount           - 存款金额
├── credit_type      - 积分类型
├── last_deposit     - 最后存款时间
├── last_withdraw    - 最后取款时间
└── interest_earned  - 累计利息

cdb_bank_logs         - 银行日志
├── id               - 记录ID
├── uid              - 用户ID
├── type             - 类型 (存款/取款/转账)
├── amount           - 金额
├── balance          - 操作后余额
├── fromto_uid       - 对方用户ID (转账)
└── dateline         - 时间戳
```

## 9. 性能优化建议

### 9.1 Pokemon系统

1. **战斗动画优化**
   - 使用CSS动画而非JS动画
   - 虚拟DOM优化
   - 懒加载战斗资源

2. **数据缓存**
   - 缓存宠物数据
   - 缓存商店商品
   - Redis缓存排行榜

3. **WebSocket实时战斗**
   - 实时同步战斗状态
   - 减少轮询请求

### 9.2 银行系统

1. **事务处理**
   - 数据库事务保证一致性
   - 乐观锁处理并发

2. **利率计算**
   - 定时任务批量计算
   - 避免实时计算

## 10. 安全注意事项

### 10.1 宠物战斗

- 服务端验证所有操作
- 防止修改HP/技能PP
- 防止快速刷经验

### 10.2 银行转账

- 二次确认转账
- 限制每日转账次数
- 异常交易检测
- 记录完整日志

### 10.3 商城购买

- 验证商品有效性
- 防止负数购买
- 库存管理
- 交易日志
