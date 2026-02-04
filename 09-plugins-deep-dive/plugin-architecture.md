# Plugins插件系统架构分析

## 1. 插件系统概述

Discuz插件系统允许第三方开发者扩展论坛功能，而无需修改核心代码。

## 2. 插件注册机制

### 2.1 plugins/pet.inc.php - Pokemon插件注册

```php
<?php

// 定义插件标识常量
define("PET_INDEX", TRUE);

// 导航菜单添加
$navigation .= "&raquo; <a href=\"petcenter.php\">宠物中心</a>";

// 加载插件配置
@include DISCUZ_ROOT.'./forumdata/cache/plugin_pet.php';

// 获取插件设置
$petshopname = $_DPLUGIN['pet']['name'];
$petsettings = $_DPLUGIN['pet']['vars'];
$money = $petsettings['moneypet'];

// 积分类型映射
$moneypet = $petsettings['moneypet'];
$moneyid = ereg_replace("extcredits", "", $moneypet);

// 查询用户积分
$query = $db->query("SELECT uid, $money FROM {$tablepre}members
                     WHERE username='$discuz_user'");
$user = $db->fetch_array($query);
$usermoney = $user[$money];

// 权限检查
if(!$discuz_user) {
    showmessage('not_loggedin');
}

if($credits < 1) {
    showmessage('你的积分必须要大于1才能使用宠物系统！');
}

// 管理员关闭检查
if($petsettings[petclose] && !$isadmin && $adminid != '1') {
    showmessage('宠物系统暂时关闭！', "index.php");
}

// Discuz动作ID (用于权限统计)
$discuz_action = 171;

// 包含宠物配置
include './pet/petconfig.php';

// 修复头像显示
$query = $db->query("SELECT mf.avatar, mf.avatarwidth, mf.avatarheight,
                             u.stars, u.grouptitle
                     FROM {$tablepre}memberfields mf
                     LEFT JOIN {$tablepre}usergroups u
                     ON u.stars = u.stars
                     WHERE mf.uid='$discuz_uid'");
$member = $db->fetch_array($query);

// 用户头像
$userpet['avatar'] = $member['avatar']
    ? "<img src=\"$member[avatar]\" width=\"$member[avatarwidth]\" height=\"$member[avatarheight]\" border=\"0\">"
    : '<br>无头像<br>';

// 用户星级
$userstars = $member['customstars']
    ? $member['customstars']
    : $member['grouptitle'];

// 战斗信息
$petquery = $db->query("SELECT * FROM {$tablepre}mypetdata
                          WHERE username='$discuz_user';");
$petbattleinfo = $db->fetch_array($petquery);

if($petbattleinfo['totalbattle'] != 0) {
    $WinRate = ($petbattleinfo['winbattle'] / $petbattleinfo['totalbattle']) * 100;
} else {
    $WinRate = 0;
}

// 路由分发
switch($index) {
    default:
        include 'pet/petcenter.php';
        break;

    case 'armfixstore':
        include "pet/armfixstore.php";
        break;

    case 'petstore':
        include "pet/petstore.php";
        break;

    case 'petshop':
        include "pet/petshop.php";
        break;

    case 'mypet':
        include "pet/mypet.php";
        break;

    case 'itemshop':
        include "pet/itemshop.php";
        break;

    case 'itemuse':
        include "pet/itemuse.php";
        break;

    case 'weaponshop':
        include "pet/weaponshop.php";
        break;

    case 'petother':
        include "pet/petother.php";
        break;

    case 'petorphanage':
        include "pet/petorphanage.php";
        break;

    case 'petbattle':
        include "pet/petbattle.php";
        break;

    case 'pettop':
        include "pet/pettop.php";
        break;

    case 'itemmarket':
        include "pet/itemmarket.php";
        break;

    case 'viewpet':
        include "pet/viewpet.php";
        break;

    case 'petadmin':
        include "pet/petadmin.php";
        break;

    case 'mypetbox':
        include "pet/mypetbox.php";
        break;

    case 'petpk':
        include "pet/petpk.php";
        break;

    case 'petitemcenter':
        include "pet/petitemcenter.php";
        break;

    case 'peteventlog':
        include "pet/peteventlog.php";
        break;

    case 'itemtomarket':
        include "pet/itemtomarket.php";
        break;

    case 'petlist':
        include "pet/petlist.php";
        break;
}

?>
```

### 2.2 插件目录结构

```
bbs/plugins/
├── pet/                        # Pokemon插件(旧版)
├── bank/                       # 银行插件
├── googlesitemap/              # Google地图插件
├── moc/                        # 移动端插件
└── index.htm                   # 空文件
```

## 3. 插件配置表

### 3.1 cdb_plugins (插件表)

```sql
CREATE TABLE cdb_plugins (
    pluginid INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    available TINYINT UNSIGNED NOT NULL DEFAULT '0',
    adminid TINYINT UNSIGNED NOT NULL DEFAULT '0',
    name VARCHAR(30) NOT NULL DEFAULT '',
    identifier VARCHAR(40) NOT NULL DEFAULT '',
    description VARCHAR(100) NOT NULL '',
    directory VARCHAR(40) NOT NULL DEFAULT '',
    copyright VARCHAR(100) NOT NULL DEFAULT '',
    version VARCHAR(20) NOT NULL DEFAULT '',
    modules TEXT NOT NULL,
    hooks TEXT NOT NULL,
    creadatetime DATETIME NOT NULL,
    filelist TEXT NOT NULL,
    KEY idx_identifier (identifier)
);
```

### 3.2 插件缓存机制

```
后台启用插件
    ↓
写入 cdb_plugins 表
    ↓
生成 forumdata/cache/plugin_{identifier}.php
    ↓
$_DPLUGIN['{identifier}'] 可用
    ↓
插件代码执行
```

## 4. 钩子系统

### 4.1 钩子类型

| 钩子位置 | 说明 | 示例 |
|----------|------|------|
| global | 全局钩子，所有页面执行 | 初始化钩子 |
| index | 首页钩子 | 首页数据 |
| viewthread | 帖子页钩子 | 帖子内容下方 |
| forumdisplay | 版块页钩子 | 版块规则 |
| posting | 发帖钩子 | 发帖后处理 |

### 4.2 钩子实现

```php
// 1. 定义钩子 (在插件安装时写入数据库)
$hooks = array(
    'global' => array(
        'functions' => 'include_plugin_pet',  // 钩子函数名
    ),
    'viewthread' => array(
        'functions' => 'pet_show_in_thread',  // 在帖子中显示宠物
    ),
);

// 2. 注册钩子 (在include/global.func.php中执行)
foreach ($hookson[$script] as $hook) {
    if ($hook['available'] && $hook['plugins']) {
        foreach ($hook['plugins'] as $plugin) {
            if (in_array($pluginid, $hook['plugins'])) {
                // 调用钩子函数
                $hook['func']();
            }
        }
    }
}

// 3. 钩子函数实现
function pet_show_in_thread() {
    global $userpet, $db;

    // 在帖子中显示宠物卡片
    if ($userpet['id']) {
        echo "<div class='pet-card'>";
        echo "<img src='images/zpet/pet/{$userpet[class]}/{$userpet[level]}.gif'>";
        echo "<span>{$userpet['name']}</span>";
        echo "</div>";
    }
}
```

## 5. 插件生命周期

### 5.1 安装流程

```
上传插件文件
    ↓
后台 → 插件 → 安装
    ↓
读取 plugin.inc.php 或 plugin.conf.php
    ↓
执行安装脚本 setup.inc.php (如果存在)
    ↓
创建数据表 (如果需要)
    ↓
写入 cdb_plugins 表
    ↓
生成插件缓存
    ↓
启用成功
```

### 5.2 卸载流程

```
后台 → 插件 → 卸载
    ↓
清理插件数据 (可选)
    ↓
删除/禁用 cdb_plugins 记录
    ↓
删除插件缓存
    ↓
卸载完成
```

## 6. 现代替代方案

### 6.1 插件系统 vs 现代架构

| Discuz插件 | 现代方案 |
|-----------|----------|
| cdb_plugins表 | 数据库配置 |
| 钩子系统 | 事件系统 |
| 插件缓存 | 模块热加载 |
| PHP include | NPM包 |
| plugin.inc.php | package.json |

### 6.2 React插件化建议

```typescript
// 使用微前端架构
// features/pokemon/
// features/bank/
// features/chat/

// 组件注册系统
// src/plugins/registry.ts
import { PokemonPlugin } from './pokemon';
import { BankPlugin } from './bank';

const plugins = [
    new PokemonPlugin(),
    new BankPlugin(),
];

export function registerPlugins(app) {
    plugins.forEach(plugin => {
        app.register(plugin);
    });
}
```

### 6.3 事件系统

```typescript
// 事件总线替代钩子
// src/events/index.ts
import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

// 订阅事件
eventBus.on('thread:view', (data) => {
    console.log('Viewing thread:', data);
});

// 触发事件
eventBus.emit('thread:view', { tid: 123 });
```

## 7. 迁移策略

### 7.1 不使用插件系统

理由：
1. 现代框架使用组件化
2. 微前端架构更灵活
3. 避免PHP特有的限制

### 7.2 模块化替代

```
旧: 插件目录
    ↓
新: npm packages/
    ├── @pokeTB/forum
    ├── @pokeTB/pokemon
    └── @pokeTB/bank
```

### 7.3 配置管理

```typescript
// src/config/plugins.ts
export const plugins = {
  pokemon: {
    enabled: true,
    version: '1.0.0',
    settings: {
      maxPets: 6,
      enableBattle: true,
    },
  },
  bank: {
    enabled: true,
    interestRate: 0.003,
  },
};
```
