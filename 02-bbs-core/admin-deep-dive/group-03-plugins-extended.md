# Admin后台管理 - 深入分析报告（第3组-插件系统）

## plugins.inc.php - 插件管理系统深度分析

**文件信息**: 32KB, 约800行

---

## 1. 插件安装/卸载流程

### 安装过程

#### 手动创建（Lines 82-98）
```php
// 通过管理界面创建插件
if($newplugin) {
    // 验证插件名称
    if(!$name) {
        cpmsg('plugins_name_invalid', '', 'error');
    }

    // 验证标识符（必须唯一）
    if(!ispluginkey($identifier)) {
        cpmsg('plugins_identifier_invalid', '', 'error');
    }

    // 插入数据库
    $db->query("INSERT INTO {$tablepre}plugins
                (name, identifier, available, adminid)
                VALUES ('$name', '$identifier', '0', '$_G[adminid]')");
}
```

#### 导入系统（Lines 156-222）
```php
// 从导出文件导入插件
if(import_plugin()) {
    // 1. 验证序列化数据格式
    $plugin = unserialize($data);

    // 2. 检查版本兼容性
    if($plugin['version'] != $version) {
        // 版本不匹配警告
    }

    // 3. 防止重复标识符
    $exists = $db->result_first("SELECT pluginid
                                   FROM {$tablepre}plugins
                                   WHERE identifier='$plugin[identifier]'");

    // 4. 插入插件数据
    $db->query("INSERT INTO {$tablepre}plugins ...");

    // 5. 插入钩子数据
    foreach($plugin['hooks'] as $hook) {
        $db->query("INSERT INTO {$tablepre}pluginhooks ...");
    }

    // 6. 插入配置变量
    foreach($plugin['vars'] as $var) {
        $db->query("INSERT INTO {$tablepre}pluginvars ...");
    }
}
```

### 卸载过程（Lines 77-80）

```php
// 删除插件及其关联数据
if(is_array($delete)) {
    $deleteids = implode(',', $delete);

    // 删除插件配置变量
    $db->query("DELETE FROM {$tablepre}pluginvars
                WHERE pluginid IN ($deleteids)");

    // 删除插件记录
    $db->query("DELETE FROM {$tablepre}plugins
                WHERE pluginid IN ($deleteids)");

    // 更新缓存
    updatecache('plugins');
}
```

---

## 2. 插件配置格式解析

### 数据库架构

#### cdb_plugins 表
```sql
CREATE TABLE cdb_plugins (
    pluginid INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(40) NOT NULL UNIQUE,    -- 插件唯一标识符
    available TINYINT(1) DEFAULT '0',          -- 启用状态
    adminid SMALLINT(6) DEFAULT '0',           -- 管理员ID
    name VARCHAR(50),                          -- 插件名称
    description VARCHAR(255),                  -- 插件描述
    directory VARCHAR(50),                     -- 插件目录
    copyright VARCHAR(100),                    -- 版权信息
    modules TEXT,                              -- 序列化的模块定义
    version VARCHAR(20),                       -- 版本号
    ...
);
```

#### cdb_pluginvars 表
```sql
CREATE TABLE cdb_pluginvars (
    pluginvarid INT PRIMARY KEY AUTO_INCREMENT,
    pluginid INT NOT NULL,                     -- 关联插件ID
    displayorder SMALLINT(6) DEFAULT '0',
    title VARCHAR(100),                        -- 配置标题
    description VARCHAR(255),                  -- 配置描述
    variable VARCHAR(40),                      -- 变量名
    type VARCHAR(20),                          -- 变量类型
    value TEXT,                                -- 默认值
    extra TEXT,                                -- 额外选项（下拉/单选用）
    ...
);
```

### 变量类型（Lines 304-346）

| 类型 | 说明 | Extra参数 |
|------|------|-----------|
| **text** | 单行文本输入 | 无 |
| **textarea** | 多行文本区域 | 行数 |
| **number** | 数字输入框 | 最小值/最大值 |
| **select** | 下拉选择框 | 选项列表（换行分隔）|
| **radio** | 单选按钮组 | 选项列表（换行分隔）|
| **color** | 颜色选择器 | 无 |

### 配置示例

```php
// 插件变量配置示例
$pluginvars = array(
    array(
        'displayorder' => 1,
        'title' => '显示位置',
        'variable' => 'position',
        'type' => 'select',
        'value' => 'top',
        'extra' => "top\nbottom\nleft\nright"
    ),
    array(
        'displayorder' => 2,
        'title' => '显示数量',
        'variable' => 'limit',
        'type' => 'number',
        'value' => '10',
        'extra' => '1|50'  // 最小1，最大50
    ),
    array(
        'displayorder' => 3,
        'title' => '自定义文本',
        'variable' => 'custom_text',
        'type' => 'textarea',
        'value' => '',
        'extra' => '3'  // 3行
    )
);
```

---

## 3. 插件钩子机制实现

### 钩子注册（Lines 472-498）

```php
// 钩子存储结构
CREATE TABLE cdb_pluginhooks (
    pluginid INT,
    available TINYINT(1),
    title VARCHAR(100),             -- 钩子标题
    description VARCHAR(255),       -- 钩子描述
    code TEXT,                      -- 执行代码
    ...
);

// 注册钩子
function add_hook($pluginid, $title, $description, $code) {
    $db->query("INSERT INTO {$tablepre}pluginhooks
                (pluginid, title, description, code, available)
                VALUES ('$pluginid', '$title', '$description', '$code', '0')");
}
```

### 钩子执行

```php
// 运行时执行钩子
function plugin_hook($plugin_identifier, $hook_title) {
    global $db, $tablepre;

    $hook = $db->fetch_first("SELECT code
                                FROM {$tablepre}pluginhooks
                                WHERE pluginid IN (
                                    SELECT pluginid FROM {$tablepre}plugins
                                    WHERE identifier='$plugin_identifier'
                                    AND available='1'
                                )
                                AND title='$hook_title'
                                AND available='1'");

    if($hook) {
        // 使用eval执行钩子代码
        eval($hook['code']);
    }
}

// 使用示例
plugin_hook('myplugin', 'footer_output');
// 输出: eval("echo '<div>My Plugin Footer</div>';");
```

### 钩子位置

| 钩子位置 | 说明 |
|----------|------|
| footer_output | 页脚输出 |
| header_output | 头部输出 |
| post_message | 发帖后 |
| viewthread_start | 查看主题开始 |
| viewthread_end | 查看主题结束 |
| login_success | 登录成功 |
| register_complete | 注册完成 |

---

## 4. 插件缓存更新机制

### 缓存生成（cache.func.php 144-160行）

```php
// 更新插件缓存
function updatecache_plugins() {
    global $db, $tablepre;

    $plugins = array();
    $query = $db->query("SELECT * FROM {$tablepre}plugins
                         WHERE available='1'
                         ORDER BY displayorder");

    while($plugin = $db->fetch_array($query)) {
        $plugins[$plugin['identifier']] = $plugin;
    }

    // 生成缓存文件
    $data = "<?php\n";
    $data .= "// Plugin Cache - Generated: ".date('Y-m-d H:i:s')."\n";
    $data .= "\$_DPLUGIN = ".var_export($plugins, true).";\n";
    $data .= "?>";

    file_put_contents('./forumdata/cache/plugin.php', $data);
}
```

### 缓存文件结构

```php
// ./forumdata/cache/plugin.php
<?php
// Plugin Cache
$_DPLUGIN = array(
    'myplugin' => array(
        'pluginid' => '1',
        'identifier' => 'myplugin',
        'available' => '1',
        'name' => 'My Plugin',
        'directory' => 'myplugin/',
        'modules' => array(
            0 => array(
                'type' => '1',        // URL类型
                'name' => 'index',
                'url' => 'plugins.php?id=myplugin&action=index'
            )
        ),
        'hooks' => array(
            'footer_output' => 'echo "<div>Footer</div>";'
        ),
        'vars' => array(
            'position' => 'top',
            'limit' => '10'
        )
    )
);
?>
```

### 缓存更新触发点

| 触发点 | 代码位置 |
|--------|----------|
| 插件启用/禁用 | Lines 100, 218 |
| 配置修改 | Line 344 |
| 钩子修改 | Line 695 |
| 手动更新 | updatecache('plugins') |

---

## 5. 插件导入/导出系统

### 导出格式（Lines 106-154）

```php
// 导出插件数据
$plugin_data = array(
    'version' => '6.1.0',
    'plugin' => array(
        'name' => $plugin['name'],
        'identifier' => $plugin['identifier'],
        'description' => $plugin['description'],
        'directory' => $plugin['directory'],
        'copyright' => $plugin['copyright'],
        'modules' => $plugin['modules'],
        'version' => $plugin['version']
    ),
    'hooks' => $hooks_list,      // 钩子数组
    'vars' => $vars_list         // 配置变量数组
);

// 序列化并下载
$data = serialize($plugin_data);
header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="plugin_'.$plugin['identifier'].'.txt"');
echo $data;
```

### 导入验证流程

```php
function import_plugin($file) {
    // 1. 读取文件内容
    $data = file_get_contents($file);

    // 2. 验证序列化格式
    if(!$plugin = unserialize($data)) {
        return error('Invalid plugin file format');
    }

    // 3. 检查版本兼容性
    if(version_compare($plugin['version'], DISCUZ_VERSION, '>')) {
        return error('Plugin version too high');
    }

    // 4. 检查标识符是否已存在
    if($db->result_first("SELECT COUNT(*) FROM {$tablepre}plugins
                          WHERE identifier='$plugin[identifier]'")) {
        return error('Plugin identifier already exists');
    }

    // 5. 插入数据
    // ... 插入逻辑

    // 6. 清理临时文件
    @unlink($file);

    return success('Plugin imported successfully');
}
```

---

## 6. 插件目录结构

### 必需文件

```
plugins/
├── plugin_identifier/           # 插件目录（使用identifier命名）
│   ├── plugin.php              # 插件主文件（必需）
│   ├── install.php             # 安装脚本（可选）
│   ├── uninstall.php           # 卸载脚本（可选）
│   ├── config.inc.php          # 配置文件（可选）
│   ├── modules/                # 模块目录（可选）
│   │   ├── module1.inc.php
│   │   └── module2.inc.php
│   ├── template/               # 模板文件（可选）
│   │   └── plugin.htm
│   ├── static/                 # 静态资源（可选）
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── README.txt              # 说明文档
```

### 模块类型（Lines 611-631）

| 类型编号 | 类型说明 | 必需字段 |
|----------|----------|----------|
| **Type 1** | URL模块 | url |
| **Type 2** | 菜单模块 | menu |
| **Type 3** | 配置模块 | 无 |
| **Type 4** | 独立模块 | 无 |
| **Type 5** | 前台URL模块 | url |
| **Type 6** | 前台菜单模块 | menu |

---

## 7. 关键SQL操作

```sql
-- 查询所有插件
SELECT * FROM cdb_plugins ORDER BY displayorder;

-- 启用/禁用插件
UPDATE cdb_plugins SET available='1' WHERE pluginid='1';

-- 获取插件配置
SELECT pv.*, p.name, p.identifier
FROM cdb_pluginvars pv
JOIN cdb_plugins p ON p.pluginid = pv.pluginid
WHERE p.pluginid = '1'
ORDER BY pv.displayorder;

-- 获取插件钩子
SELECT * FROM cdb_pluginhooks
WHERE pluginid = '1' AND available = '1';

-- 删除插件（级联删除配置和钩子）
DELETE FROM cdb_pluginvars WHERE pluginid = '1';
DELETE FROM cdb_pluginhooks WHERE pluginid = '1';
DELETE FROM cdb_plugins WHERE pluginid = '1';

-- 检查标识符是否存在
SELECT COUNT(*) FROM cdb_plugins WHERE identifier = 'myplugin';
```

---

## 8. 安全机制

### 输入验证

```php
// 标识符验证
function ispluginkey($key) {
    return preg_match('/^[a-z0-9_]+$/i', $key);
}

// XSS防护
$title = dhtmlspecialchars(stripslashes($_POST['title']));

// SQL注入防护
$identifier = addslashes($identifier);
```

### 执行安全

```php
// 钩子代码执行时的安全考虑
// - 使用eval执行（潜在安全风险）
// - 建议迁移时改为：
//   1. 类方法调用
//   2. 闭包函数
//   3. 事件订阅模式
```

### 权限控制

```php
// 仅管理员可访问
if(!defined('IN_ADMINCP')) {
    exit('Access Denied');
}

// 创始人特权
if($adminid != 1) {
    cpmsg('只有创始人可以执行此操作', '', 'error');
}
```

---

## 9. 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Interface                          │
│  (plugins.inc.php)                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │  Install│     │ Config  │     │  Export │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │ Database│     │ Database│     │Serialize│
    │ -plugins│     │-pluginvars│    │   Data  │
    │-hooks   │     │          │     │         │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │Cache System │
                  │plugin.php   │
                  └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │Runtime      │
                  │Execution    │
                  └─────────────┘
```

---

## 10. 迁移建议

### 现代化改造方向

1. **Hook系统改造**
   - 从eval执行改为事件订阅
   - 使用PSR-14事件分发器
   - 支持异步钩子执行

2. **配置存储**
   - 从序列化改为JSON
   - 支持配置验证规则
   - 配置版本控制

3. **插件加载**
   - 延迟加载机制
   - 依赖注入容器
   - 插件间通信

4. **安全增强**
   - 代码签名验证
   - 沙箱执行环境
   - 权限细粒度控制

### 新架构示例

```typescript
// 现代化插件系统接口
interface Plugin {
  id: string;
  name: string;
  version: string;
  hooks: HookDefinition[];
  config: ConfigSchema;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

interface EventDispatcher {
  subscribe(event: string, handler: Function): void;
  dispatch(event: string, data: any): Promise<void>;
}

// 插件注册
await pluginManager.register({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  hooks: [
    { event: 'user.login', handler: 'onUserLogin' },
    { event: 'post.create', handler: 'onPostCreate' }
  ],
  config: {
    position: { type: 'select', options: ['top', 'bottom'] },
    limit: { type: 'number', min: 1, max: 50 }
  }
});
```

---

## 总结

Discuz! 6.1F 的插件系统是一个功能完整但架构较为基础的实现：

**优点**:
- 插件结构清晰，易于理解
- 支持钩子扩展
- 配置灵活
- 导入/导出方便

**缺点**:
- 使用eval执行钩子（安全隐患）
- 序列化存储（不便于调试）
- 缺乏依赖管理
- 无版本兼容性检查

**迁移要点**:
- 保持插件目录结构兼容性
- 重建Hook系统（事件驱动）
- 配置改用JSON格式
- 增强安全验证机制
