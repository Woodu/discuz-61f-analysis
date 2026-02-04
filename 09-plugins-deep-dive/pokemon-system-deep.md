# Pokemon系统深度分析

## 1. 系统概述

Pokemon系统是本论坛最复杂的插件系统，是一个完整的在线宠物养成游戏。

### 1.1 目录结构

```
bbs/zpet/                    # 新版Pokemon系统 (主系统)
├── petindex.php            # 宠物中心首页 (78行)
├── mypet.php               # 我的宠物 (522行)
├── userpet.php            # 用户宠物信息
├── pk.php                  # PK对战 (495行)
├── pk.fun.php             # PK辅助函数
├── petshop.php            # 商店 (410行)
├── useitem.php            # 使用物品 (414行)
├── gym.php                 # 道馆挑战 (414行)
├── club.php                # 俱乐部
├── market.php             # 市场
├── pc.php                  # PC存储
├── pcbox.php              # PC盒子
├── catchpm.php            # 捕捉宠物
├── mybag.php              # 我的背包
├── plant.php              # 种植系统
├── pet.fun.php            # 宠物辅助函数
├── petitem.php           # 物品系统
├── petnextlv.php         # 等级计算 (23287行!)
├── sms.php                # 短消息
├── pmhome.php            # 私信首页
├── unistu.php             # 大学对战
├── vsuni.php              # VS大学
├── starpk.php             # 明星PK
└── ... (共40+文件)

bbs/plugins/pet/            # 旧版Pokemon系统
├── pet.inc.php            # 插件注册 (153行)
└── ...

bbs/mdex/                   # 图鉴资源
```

### 1.2 数据表结构 (24张表)

| 表名 | 说明 |
|------|------|
| cdb_zpetmypet | 用户宠物 (核心表) |
| cdb_zpetdex | Pokemon基础数据 |
| cdb_zpetdexhtm | 技能/招式数据 |
| cdb_zpetdexab | 属性克制关系 |
| cdb_zpetdexevo | 进化链数据 |
| cdb_zpetdexii | 第二代数据 |
| cdb_zpetdexmove | 移动/位置数据 |
| cdb_zpetfruitdex | 果实图鉴 |
| cdb_zpetfruitmap | 果实分布地图 |
| cdb_zpetuserdex | 用户图鉴进度 |
| cdb_zpetuni | 大学系统 |
| cdb_zpetlog | 日志 |
| cdb_zpetsms | 短消息 |
| cdb_zpetmarket | 市场 |
| cdb_zpetsx | 属性系数 |
| cdb_zpetmove1 | 招式槽1 |
| cdb_zpetmove2 | 招式槽2 |
| cdb_zpetbattle | 战斗记录 |
| ... (共24张) |

## 2. 核心文件深入分析

### 2.1 petindex.php - 首页 (78行)

```php
<?php
if(!defined("PET_INDEX")){
    die("Access Denied");
}

// ========== 排行榜查询 ==========
// 查询经验值前5的宠物
$query=$db->query("
    select id, petname, name, nowexp, rank, class, nowlv
    from cdb_zpetmypet
    order by nowexp desc
    LIMIT 5
");

$i=1;
while($pet=$db->fetch_array($query)){
    $petlv=lv($pet[nowexp]);  // 经验值转等级

    // 第1名显示大图
    if($i==1){
        if($pet[flash]==1 && $pet['class']!="ptbegg"){
            // 闪光宠物图片
            $query=$db->query("select * from cdb_zpetdex
                                   where class='$userpet[class]'
                                   AND uplv=$userpet[nowlv]");
            $power=$db->fetch_array($query);
            $starpetpic="<img src=images/zpet/pet/flashpm/$power[id].png>";
        }elseif($pet[otherpic]!=0){
            // 官方图片
            $starpetpic="<img src=images/zpet/p/".sprintf("%03d",$power[id])."-m.png>";
        }else{
            // 普通图片
            $starpetpic="<img src=images/zpet/pet/$pet[class]/$pet[nowlv].png>";
        }
        $starpet[petname]=$pet[petname];
        $starpetlv=$petlv;
        $starpet[name]=$pet[name];
    }

    // 等级徽章
    if($pet[rank] <= 0){
        $rank="";
    }elseif($pet[rank] > 6){
        $rank="<img src=images/zpet/rank/6.png>";
    }else{
        $rank="<img src=images/zpet/rank/".$pet[rank].".png>";
    }

    // 生成列表行
    $petLIST.="<tr>
        <td><img src=images/zpet/pet/$pet[class]/$pet[nowlv].gif></td>
        <td><a href=petcenter.php?action=viewpet&petid=$pet[id]&username=$pet[name]>
             $pet[petname]
         </a></td>
        <td>$pet[name]</td>
        <td>$rank</td>
        <td>$petlv</td>
    </tr>";
    $i=$i+1;
}

// ========== 大学排行榜 ==========
$query=$db->query("select * from cdb_zpetuni order by point desc LIMIT 5");
// ... 类似逻辑

include template('pet_index');
?>
```

**关键数据流**:
```
cdb_zpetmypet (查询) → 排序 → TOP 5 → 模板显示
     ↓
等级计算: lv(nowexp) → 显示等级
     ↓
图片路径: images/zpet/pet/{class}/{lv}.gif
```

### 2.2 mypet.php - 我的宠物 (522行)

```php
<?php
if(!defined("PET_INDEX")){
    die("Access Denied");
}
require './zpet/userpet.php';
require './zpet/infobar.inc.php';

$petmeau="mypet";

// ========== 切换宠物位置 ==========
$petid=$_POST['place'];
if($place!=""){
    $query=$db->query("SELECT name FROM cdb_zpetmypet WHERE id=$petid");
    $if=$db->fetch_array($query);

    if($petid==$userpet[id]){
        showmessage('已经是战斗宠了','petcenter.php?action=mypet');
    }

    if(addslashes($if[name])==$discuz_user){
        // 设置原宠物为非战斗
        $in=$db->query("UPDATE cdb_zpetmypet SET place=0 WHERE id=$userpet[id]");
        // 设置新宠物为战斗
        $in=$db->query("UPDATE cdb_zpetmypet SET place=1 WHERE id=$petid");
        showmessage('切换成功！','petcenter.php?action=mypet');
    }else{
        showmessage('不是你的宠物','petcenter.php?action=mypet');
    }
}

// ========== 删除宠物 ==========
elseif($del!=""){
    if($ok==""){
        showmessage('确认要删除么？');
    }else{
        $query=$db->query("select id from cdb_zpetmypet where id='$del'");
        if($if[id]!=$userpet[id]){
            $in=$db->query("DELETE from cdb_zpetmypet WHERE id='$del' and name='$discuz_user'");
            showmessage('已放生...');
        }else{
            showmessage('战斗宠物不能放生');
        }
    }
}

// ========== 背景图选择 ==========
elseif($userpet[bjok]==1&&$pmbg!=""){
    $in=$db->query("UPDATE cdb_zpetmypet SET pmbg='$pmbg' WHERE place=1 AND name='$discuz_user'");
    showmessage('背景更换成功','petcenter.php?action=mypet');
}

// ========== 切换图片风格 ==========
if($changepic=="1"&&$userpet['class']!="egg"){
    $in=$db->query("UPDATE cdb_zpetmypet SET otherpic=1 WHERE id='$userpet[id]'");
    showmessage('已切换到官方图片');
}elseif($changepic=="0"){
    $in=$db->query("UPDATE cdb_zpetmypet SET otherpic=0 WHERE id='$userpet[id]'");
    showmessage('已切换到原始图片');
}

// ========== 显示其他宠物列表 ==========
$query=$db->query("select * from cdb_zpetmypet where place=0 AND name='$discuz_user'");
while($otheruserpet=$db->fetch_array($query)){
    $otherlv=lv($otheruserpet[nowexp]);
    $otherpetLIST.="<tr>
        <td><img src=images/zpet/pet/$otheruserpet[class]/$otheruserpet[nowlv].gif></td>
        <td>$otheruserpet[petname]</td>
        <td>$otherlv</td>
        <td><img src=images/zpet/ball/$otheruserpet[ball].gif></td>
        <td><form method='post' action='#'>
            <input type='hidden' name='place' value='$otheruserpet[id]'>
            <input type='image' src='images/zpet/butt/1.png'>
        </form></td>
        <td><form method='post' action='#'>
            <input type='hidden' name='del' value='$otheruserpet[id]'>
            <input type='image' src='images/zpet/butt/2.png'>
        </form></td>
    </tr>";
}

// ========== 生成签名图代码 ==========
$code="[img]http://poketb.com/bbs/images/zpet/userpic/".$userpet[id].".png[/img]";

include template('pet_mypet');
?>
```

**核心功能**:
1. **切换战斗宠物**: place=1表示战斗中
2. **删除宠物**: 不能删除当前战斗宠物
3. **更换背景**: VIP功能(pmbjok=1)
4. **切换图片风格**: 官方/原始/动态图

### 2.3 pk.php - PK对战 (495行)

```php
<?php
if(!defined("PET_INDEX")){
    die("Access Denied");
}
require './zpet/userpet.php';
require './zpet/pk.fun.php';

// ========== 参数获取 ==========
$message=$_POST['messa'];
$userexp=$_POST['userexp'];
$memexp=$_POST['memexp'];
$pkright=$_POST['pkright'];

// ========== 基础验证 ==========
if($pkname==$discuz_user){
    showmessage('自己不能对自己发起挑战！');
    exit;
}

$query=$db->query("SELECT uid FROM cdb_members WHERE username='$pkname'");
$aname=$db->fetch_array($query);
$pkeduserid = $aname['uid'];

if($userpet[nowhp]==0&&$message!=""){
    showmessage('你的宠物已经处于濒死状态了！');
    exit;
}

// ========== 大学系统验证 ==========
$query=$db->query("select * from cdb_zpetuni where username='$discuz_user'");
$useruni=$db->fetch_array($query);

if($useruni[ocpk]==0){
    showmessage('你方未开启大学竞技！');
    exit;
}

// ========== PK时间间隔验证 ==========
if($pkright==""){
    $t=time()-$useruni[time2];
    if($t < 120){
        showmessage('每次参与时间不能小于2分钟！');
        exit;
    }
}

// ========== 等级差验证 ==========
$query=$db->query("select * from cdb_zpetmypet where place=1 AND name='$pkname'");
$mempet=$db->fetch_array($query);

$memlv=lv($mempet[nowexp]);
$hslv=$nowlv-$memlv;
if($hslv>=6){
    showmessage('等级差距超过6级！');
}

// ========== 属性克制计算 ==========
$query=$db->query("select * from cdb_zpetdex where class='$mempet[class]' AND uplv=$mempet[nowlv]");
$power=$db->fetch_array($query);

$mcha=char($mempet[cha]);  // 性格修正

// 计算对方属性
$mhp=floor(($power[hp]*2+$mempet[hp]+$mempet[hhp]/4)*$memlv/100+10+$memlv);
$matk=floor(userpet($power[atk],$mempet[atk],$memlv,$mempet[hat])*$mcha[atk]);
$mdef=floor(userpet($power[def],$mempet[def],$memlv,$mempet[hde])*$mcha[def]);
$msat=floor(userpet($power[sat],$mempet[sat],$memlv,$mempet[hsa])*$mcha[sat]);
$msde=floor(userpet($power[sde],$mempet[sde],$memlv,$mempet[hsd])*$mcha[sde]);
$mspd=floor(userpet($power[spd],$mempet[spd],$memlv,$mempet[hsp])*$mcha[spd]);

// ========== 属性相克计算 ==========
$usx1=gymsx($userpet[sx1]);
$usx2=gymsx($userpet[sx2]);
$msx1=gymsx($mempet[sx1]);
$msx2=gymsx($mempet[sx2]);

// 计算相克倍率
$query=$db->query("SELECT * FROM cdb_zpetsx WHERE id='$usx1'");
$pku=$db->fetch_array($query);
if($msx2!=17){
    $pksxuser=$pku[$msx1]*$pku[$msx2];
}else{
    $pksxuser=$pku[$msx1];
}

// ========== 战斗逻辑 ==========
if($pkright=="atk"){  // 物理攻击
    // 暴击判定
    $rnd=rand(1,16);
    if($rnd==1){
        $bon=2;  // 会心一击
        $mess.="我方宠物会心一击！\n";
    }elseif($rnd==2){
        $bon=0;  // 未命中
        $mess.="我方宠物没有打中\n";
    }else{
        $bon=1;  // 普通攻击
        $mess.="我方宠物成功攻击了！\n";
    }

    // 伤害计算公式
    $useratkhp=floor((($nowlv*0.4+2)*50*$uatk/$mdef/50+2)*$bon*rand(217,255)/255);

    // 扣血
    $memnowhp=$mempet[nowhp]-$useratkhp;

    // 经验值计算
    $userexp+=floor($useratkhp/$mhp*$memlv/2);

    if($memnowhp<=0){
        // 对方死亡，胜利
        $mess.="对方宠物被打败了！You WON!\n";
        $in=$db->query("UPDATE cdb_zpetuni SET point=point+$memlv WHERE username='$discuz_user'");
        $in=$db->query("UPDATE cdb_zpetmypet SET nowexp=nowexp+$userexp,honey=honey+3 WHERE place=1 AND name='$discuz_user'");
        $in=$db->query("UPDATE cdb_zpetmypet SET nowhp=0,honey=honey-3 WHERE place=1 AND name='$pkname'");
    }else{
        $in=$db->query("UPDATE cdb_zpetmypet SET nowhp=$memnowhp WHERE place=1 AND name='$pkname'");
    }
}
elseif($pkright=="sat"){  // 特殊攻击
    // 类似逻辑...
}

include template('pet_battle');
?>
```

**战斗公式**:
```
伤害 = ((等级×0.4+2) × 50 × 攻击力 / 防御力 / 50 + 2) × 暴击倍率 × 随机数

经验 = 伤害 / 对方最大HP × 对方等级 / 2
```

**属性相克**:
- 水(2) → 火(5) = 2.0倍伤害
- 火(5) → 草(3) = 2.0倍伤害
- 草(3) → 水(2) = 0.5倍伤害
- ...

### 2.4 petshop.php - 商店 (410行)

```php
<?php
if(!defined("PET_INDEX")){
    die("Access Denied");
}

// ========== 商店列表显示 ==========
if(!$buy){
    $sqllim=13;  // 每页显示数量
    if($page){
        $start = ($page - 1) * $sqllim;
    }else{
        $start = 0;
        $page = 1;
    }

    // 查询可购买的宠物
    $shoplist=$db->query("select COUNT(*) from cdb_zpetdex where shopid=1");
    $multipage=multi($db->result($shoplist, 0), $sqllim, $page, "petcenter.php?action=petshop");

    $query=$db->query("select * from cdb_zpetdex where shopid=1 ORDER BY id ASC LIMIT $start,$sqllim");
    while($total=$db->fetch_array($query)){
        $sx1=sxpic($total[sx1]);  // 属性1图标
        $sx2=sxpic($total[sx2]);  // 属性2图标
        $petLIST.="<tr>
            <td><img src=images/zpet/pet/$total[class]/$total[uplv].gif></td>
            <td>$total[name]</td>
            <td>$sx1 $sx2</td>
            <td>$total[shopcash]</td>
            <td><input type=radio name=petname value='$total[id]'>选择</td>
        </tr>";
    }
}

// ========== 购买宠物 ==========
$petname=$_POST['petname'];
if($buy=="ok"){
    $query=$db->query("SELECT * FROM cdb_zpetmypet WHERE name='$discuz_user'");
    $newpet=$db->fetch_array($query);

    $query=$db->query("SELECT * FROM cdb_zpetdex where id='$petname'");
    $petshop=$db->fetch_array($query);

    // 检查金钱
    if($usermoney<$petshop[shopcash]){
        showmessage('你的金币是空空如也！');
        exit;
    }

    // 检查宠物数量限制
    $query=$db->query("select COUNT(*) as allpet from cdb_zpetmypet where name='$discuz_user' and place!=3 and place!=4");
    $count=$db->fetch_array($query);

    if($count[allpet]<1){
        // 第1只宠物 = 战斗宠物
        $base=rbase();
        $nowhp=floor(($petshop[hp]*2+$base[hp])*1/100+10+1);
        $sex=petsex($petshop[id]);  // 随机性别

        // 检查是否闪光 (0.1%概率)
        $flash=rand(1,1000);
        if($flash==500){
            $flash=1;
        }else{
            $flash=0;
        }

        $cha=rand(1,25);  // 性格 (1-25)

        // 插入宠物数据
        $in=$db->query("INSERT INTO cdb_zpetmypet
            (name,petname,class,nowlv,nowexp,sex,hp,nowhp,atk,def,sat,sde,spd,
             honey,sx1,sx2,ball,item,bday,place,cha,flash)
            VALUES
            ('$discuz_user','$petshop[name]','$petshop[class]',$petshop[uplv],1,
             $sex,$base[hp],$nowhp,$base[atk],$base[def],$base[sat],$base[sde],
             $base[spd],70,'$petshop[sx1]','$petshop[sx2]',0,0,NOW(),1,$cha,$flash)");

        // 扣除金币
        $in=$db->query("UPDATE cdb_members SET $money=$money-$petshop[shopcash] WHERE uid='$discuz_uid'");
        $in=$db->query("UPDATE cdb_zpoketb SET money1=money1+$petshop[shopcash]");

        showmessage('成功购买了宠物！好好照顾它吧~~');
    }elseif($count[allpet]<6){
        // 第2-6只宠物 = 非战斗宠物
        // 类似逻辑，place=0
    }else{
        showmessage('你已经拥有6只宠物了，请先放生一些！');
    }
}

include template('pet_shop');
?>
```

**购买流程**:
```
选择宠物 → 检查金钱 → 检查数量 → 计算属性 → 插入数据库 → 扣除金币
```

## 3. 核心算法

### 3.1 等级计算

```php
function lv($exp){
    // 经验值公式: 10 × 等级² - 9
    // 等级 = sqrt((exp + 9) / 10)
    return floor(sqrt(($exp+9)/10));
}
```

**经验表**:
| 等级 | 所需经验 | 累计经验 |
|------|----------|----------|
| 1 | 1 | 1 |
| 10 | 91 | 100 |
| 50 | 2491 | 2500 |
| 100 | 9991 | 10000 |

### 3.2 属性克制 (cdb_zpetsx)

| 属性 | ID | 格斗 | 飞行 | 毒 | 地 | 岩石 | 虫 | 钢 | 恶 |
|------|----|----|----|----|----|----|----|----|
| 格斗 | 1 | 0.5 | 2 | 0.5 | 0.5 | 2 | 0.5 | 1 | 2 |
| 飞行 | 2 | 0.5 | 0.5 | 1 | 1 | 1 | 1 | 1 | 1 |
| 毒 | 3 | 2 | 1 | 0.5 | 0.5 | 0.5 | 0.5 | 1 | 0.5 |
| 地 | 4 | 2 | 1 | 2 | 0.5 | 2 | 0.5 | 1 | 0.5 |
| ... | | | | | | | | | | |

### 3.3 性格修正

```php
// 性格ID (1-25) 对应属性修正倍率
// 1: 攻击↑ 防御↓
// 2: 防御↑ 攻击↓
// 3: 速度↑ 特攻↓
// ...
```

## 4. React组件拆分建议

```typescript
// Pokemon系统架构
// features/pokemon/
├── pokemon/
│   ├── components/
│   │   ├── PokemonCard.tsx      // 宠物卡片
│   │   ├── PokemonStats.tsx     // 属性显示
│   │   ├── PokemonList.tsx      // 宠物列表
│   │   └── PokemonDetail.tsx    // 宠物详情
│   ├── hooks/
│   │   ├── usePokemon.ts         // 宠物数据
│   │   ├── useBattle.ts         // 战斗系统
│   │   └── useEvolution.ts      // 进化系统
│   ├── services/
│   │   ├── pokemon.service.ts   // 宠物API
│   │   ├── battle.service.ts    // 战斗API
│   │   └── market.service.ts    // 市场API
│   └── pages/
│       ├── MyPokemon.tsx        // 我的宠物
│       ├── PokemonShop.tsx      // 商店
│       ├── PokemonBattle.tsx    // 对战
│       └── PokemonGym.tsx        // 道馆

// 数据模型
interface Pokemon {
  id: number;
  userId: number;
  name: string;
  species: string;
  class: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  nature: number;
  gender: 'male' | 'female' | 'none';
  isShiny: boolean;
  place: number;  // 0=非战斗, 1=战斗中
}

interface BattleResult {
  winner: 'user' | 'opponent';
  damage: number;
  expGained: number;
  message: string;
}
```

## 5. 性能优化建议

1. **数据库索引**
```sql
ALTER TABLE cdb_zpetmypet ADD INDEX idx_name (name);
ALTER TABLE cdb_zpetmypet ADD INDEX idx_place (place);
ALTER TABLE cdb_zpetmypet ADD INDEX idx_exp (nowexp DESC);
```

2. **Redis缓存**
```typescript
// 缓存热门宠物数据
await redis.setex('pokemon:rankings', 300, JSON.stringify(top5));
```

3. **WebSocket实时战斗**
```typescript
// 战斗改为WebSocket推送
socket.emit('battle:attack', {
  battleId,
  damage,
  newHp
});
```
