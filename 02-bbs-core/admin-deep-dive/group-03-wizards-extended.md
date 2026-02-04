# Admin后台管理 - 深入分析报告（第3组-向导系统）

## 概述

本文档包含两个大型向导系统的深入分析：
1. **creditwizard.inc.php** - 积分系统向导（511行，33KB）
2. **jswizard.inc.php** - JavaScript代码向导（64KB）

---

## 1. creditwizard.inc.php - 积分系统向导

### 核心功能概述

积分向导是一个3步配置系统，用于管理Discuz的积分系统：

| 步骤 | 功能 | 说明 |
|------|------|------|
| **Step 1** | 积分配置 | 配置extcredits 1-8的基本属性 |
| **Step 2** | 公式配置 | 设置积分计算公式 |
| **Step 3** | 兑换配置 | 配置积分兑换和税率 |

### 积分数据结构

```sql
-- 积分配置存储在 cdb_settings 表中
-- extcredits 字段（序列化）
$extcredits = array(
    1 => array(
        'title' => '威望',              -- 积分名称
        'unit' => '',                  -- 单位
        'ratio' => 0,                  -- 兑换比例
        'available' => 1,              -- 是否启用
        'showinthread' => 1,           -- 是否在主题中显示
        'allowexchangeout' => 1,       -- 是否允许兑换出
        'allowexchangein' => 1,        -- 是否允许兑换入
        'lowerlimit' => 0              -- 下限
    ),
    2 => array(
        'title' => '金钱',
        'unit' => '枚',
        'ratio' => 10,
        'available' => 1,
        'showinthread' => 1,
        'allowexchangeout' => 1,
        'allowexchangein' => 1,
        'lowerlimit' => -100
    ),
    // ... extcredits 3-8
);
```

### Step 1: 积分配置（Lines 26-320）

#### 1.1 基本配置（Lines 85-111）

```php
// 积分基本字段
showsetting('creditwizard_credit_title', 'settingsnew[$i][title]', $extcredits[$i]['title'], 'text');
showsetting('creditwizard_credits_unit', 'settingsnew[$i][unit]', $extcredits[$i]['unit'], 'text');
showsetting('creditwizard_credits_ratio', 'settingsnew[$i][ratio]', $extcredits[$i]['ratio'], 'text');
showsetting('creditwizard_credits_init', 'settingsnew[$i][init]', intval($initcredits[$i]), 'text');
showsetting('creditwizard_credits_available', 'settingsnew[$i][available]', $extcredits[$i]['available'], 'radio');
showsetting('creditwizard_credits_show_in_thread', 'settingsnew[$i][showinthread]', $extcredits[$i]['showinthread'], 'radio');

// 积分保存逻辑（Lines 209-218）
foreach($_POST['settingsnew'] as $i => $settings) {
    $extcredits[$i] = array(
        'title' => dhtmlspecialchars(stripslashes($settings['title'])),
        'unit' => dhtmlspecialchars(stripslashes($settings['unit'])),
        'ratio' => ($settings['ratio'] > 0 ? (float)$settings['ratio'] : 0),
        'available' => intval($settings['available']),
        'showinthread' => intval($settings['showinthread']),
        'allowexchangeout' => intval($settings['allowexchangeout']),
        'allowexchangein' => intval($settings['allowexchangein']),
        'lowerlimit' => intval($settings['lowerlimit'])
    );
}

// 序列化保存
$db->query("UPDATE {$tablepre}settings
            SET value='" . addslashes(serialize($extcredits)) . "'
            WHERE variable='extcredits'");
```

#### 1.2 积分规则配置（Lines 97-107）

```php
// 支持的积分规则类型
$credit_rules = array(
    'post' => '发帖',                  -- 发新主题
    'reply' => '回复',                 -- 回复主题
    'digest' => '精华',                -- 被设为精华
    'postattach' => '上传附件',        -- 上传附件
    'getattach' => '下载附件',         -- 下载附件
    'search' => '搜索',                -- 搜索操作
    'promotion_visit' => '推广访问',   -- 推广链接访问
    'promotion_register' => '推广注册', -- 推广注册
    'tradefinished' => '交易完成',     -- 虚拟交易完成
    'votepoll' => '投票'               -- 参与投票
);

// 规则配置界面
foreach($credit_rules as $rule => $label) {
    showsetting(
        'settings_credits_policy_' . $rule,
        'settingsnew[policy_' . $rule . '][' . $credit . ']',
        intval($creditspolicy[$rule][$credit]),
        'text'
    );
}

// 规则数据结构
$creditspolicy = array(
    'post' => array(
        1 => 1,    -- extcredits1 +1
        2 => 2,    -- extcredits2 +2
        3 => 0     -- extcredits3 +0
    ),
    'reply' => array(
        1 => 0,
        2 => 1,
        3 => 0
    ),
    // ... 其他规则
);
```

#### 1.3 版块特定积分（Lines 113-168）

```php
// 版块积分规则存储在 cdb_forumfields 表
// 字段: postcredits, replycredits, digestcredits, postattachcredits, getattachcredits

// 查询版块积分规则
$query = $db->query("SELECT fid, name, postcredits, replycredits, digestcredits,
                              postattachcredits, getattachcredits
                      FROM {$tablepre}forumfields
                      WHERE fid IN (" . implode(',', array_keys($forum_ids)) . ")");

while($forum = $db->fetch_array($query)) {
    // 解析积分规则（逗号分隔的8个值）
    $forum['postcredits'] = explode(',', $forum['postcredits']);
    // 格式: [0, 2, 0, 0, 0, 0, 0, 0]
    //       对应: extcredits1-8的发帖奖励

    $forum['replycredits'] = explode(',', $forum['replycredits']);
    $forum['digestcredits'] = explode(',', $forum['digestcredits']);
    // ...
}

// 验证积分值范围（Lines 250-251）
foreach($forumcredit['postcredits'] as $credit => $value) {
    // 限制范围: -99 到 99
    $forumcredit['postcredits'][$credit] = max(-99, min(99, intval($value)));
}
```

#### 1.4 用户组积分评级（Lines 170-196）

```php
// 用户组积分评级系统
// 存储在 cdb_usergroups.raterange 字段
// 格式: credit_id\tmin_rating\tmax_rating\tmrpd

// 示例数据
$raterange = "1\t-5\t5\t10";
// 解析:
// - credit_id: 1 (extcredits1)
// - min_rating: -5 (最低评分)
// - max_rating: 5 (最高评分)
// - mrpd: 10 (Maximum Rating Per Day - 每日最大评分次数)

// 评级数据结构
$raterange_new = array();
foreach($usergroups as $groupid => $group) {
    $range = array(
        $groupid,                                    // 用户组ID
        intval($ratemin[$groupid]),                  // 最低评分
        intval($ratemax[$groupid]),                  // 最高评分
        intval($ratemrpd[$groupid])                  // 每日评分次数
    );

    // 验证（Lines 298-302）
    if(!$range[3] || $range[2] <= $range[1] || $range[3] < max(abs($range[1]), abs($range[2]))) {
        cpmsg('creditwizard_edit_rate_invalid', '', 'error');
    }

    $raterange_new[$groupid] = implode("\t", $range);
}

// 保存到数据库
$db->query("UPDATE {$tablepre}usergroups
            SET raterange='" . addslashes(serialize($raterange_new)) . "'
            WHERE groupid IN (" . implode(',', array_keys($usergroups)) . ")");
```

### Step 2: 公式配置（Lines 321-423）

```php
// 积分公式编辑器
// 支持的变量:
// - extcredits[1-8]: 各积分值
// - digestposts: 精华帖子数
// - posts: 发帖数
// - oltime: 在线时间
// - pageviews: 页面浏览量

// 公式示例（Lines 392）
$creditsformula = "(digestposts * 10 + posts * 2) / 10 + oltime / 3600";

// 公式验证（Lines 400-402）
function validate_credits_formula($formula) {
    // 1. 正则检查允许的字符
    $pattern = "/^([\+\-\*\/\.\d\(\)]|((extcredits[1-8]|digestposts|posts|pageviews|oltime)([\+\-\*\/\(\)]|$))+)+$/";

    if(!preg_match($pattern, $formula)) {
        return false;
    }

    // 2. 转换为可执行代码
    $php_formula = preg_replace(
        "/(digestposts|posts|pageviews|oltime|extcredits[1-8])/",
        "$_DSESSION['\\1']",
        $formula
    );

    // 3. 测试执行
    $_DSESSION = array(
        'digestposts' => 10,
        'posts' => 100,
        'pageviews' => 1000,
        'oltime' => 3600,
        'extcredits' => array(1 => 100, 2 => 500, ...)
    );

    return @eval("return ($php_formula);") !== false;
}

// 公式显示版本（Lines 405-416）
// 将变量名替换为可读的标题
$creditsformulaexp = $formula;
foreach($extcredits as $id => $credit) {
    $creditsformulaexp = str_replace(
        'extcredits' . $id,
        $credit['title'] ?: 'extcredits' . $id,
        $creditsformulaexp
    );
}
// 结果: "(精华帖子数 * 10 + 发帖数 * 2) / 10 + 在线时间 / 3600"
```

### Step 3: 兑换配置（Lines 424-509）

#### 3.1 兑换设置

```php
// 默认转账积分选择（Lines 428-433）
$creditstransselect = '<select name="creditstransnew">';
$creditstransselect .= '<option value="0">' . $lang['none'] . '</option>';

for($i = 1; $i <= 8; $i++) {
    if($extcredits[$i]['available']) {
        $selected = ($i == intval($creditstrans)) ? 'selected' : '';
        $creditstransselect .= '<option value="' . $i . '" ' . $selected . '>'
            . 'extcredits' . $i . ' (' . $extcredits[$i]['title'] . ')'
            . '</option>';
    }
}
$creditstransselect .= '</select>';

// 兑换税率（Lines 458-462）
showsetting(
    'settings_creditstax',
    '',
    '',
    showtextradio(
        'creditstaxnew',
        $creditstax,
        'creditstaxradio',
        array(
            array($lang['low'] . ' (0.01)', '0.01', $creditstax == '0.01'),
            array($lang['middle'] . ' (0.1)', '0.1', $creditstax == '0.1'),
            array($lang['high'] . ' (0.5)', '0.5', $creditstax == '0.5')
        )
    )
);

// 税率验证（Lines 495-497）
if($creditstaxnew < 0 || $creditstaxnew >= 1) {
    $creditstaxnew = 0;
}
```

#### 3.2 兑换计算逻辑

```php
// 积分兑换计算
function calculate_credit_exchange($from_credit, $to_credit, $amount) {
    global $extcredits, $creditstax;

    // 获取兑换比例
    $from_ratio = $extcredits[$from_credit]['ratio'];
    $to_ratio = $extcredits[$to_credit]['ratio'];

    if($from_ratio == 0 || $to_ratio == 0) {
        return error('Invalid exchange ratio');
    }

    // 计算基础兑换量
    $base_amount = $amount * $from_ratio / $to_ratio;

    // 扣除税率
    $tax = $base_amount * $creditstax;
    $final_amount = $base_amount - $tax;

    return array(
        'from_amount' => $amount,
        'to_amount' => round($final_amount, 2),
        'tax' => round($tax, 2),
        'rate' => $from_ratio / $to_ratio
    );
}

// 示例
// 兑换 1000 extcredits2 (ratio=10) 到 extcredits1 (ratio=1)
// 税率 0.1 (10%)
// 结果:
// - base_amount = 1000 * 10 / 1 = 10000
// - tax = 10000 * 0.1 = 1000
// - final_amount = 10000 - 1000 = 9000
```

### 积分操作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      积分操作流程                               │
└─────────────────────────────────────────────────────────────────┘

用户操作
   │
   ├─ 发帖 ──→ 扣除规则积分 ──→ 增加用户积分
   │             │
   │             ├─ 检查下限
   │             ├─ 检查版块规则
   │             └─ 记录日志
   │
   ├─ 兑换 ──→ 验证积分 ──→ 计算兑换 ──→ 扣税 ──→ 转账
   │             │            │           │
   │             │            │           └─ 税率: 0-1
   │             │            │
   │             │            └─ 比例计算
   │             │
   │             └─ 检查权限
   │
   ├─ 评分 ──→ 验证评级权限 ──→ 检查每日次数 ──→ 更新积分
   │
   └─ 公式 ──→ 执行公式计算 ──→ 更新显示
```

---

## 2. jswizard.inc.php - JavaScript代码向导

### 核心功能概述

JavaScript向导用于生成嵌入外部网站的JavaScript代码片段：

| 功能 | 说明 |
|------|------|
| **代码生成** | 生成各种类型的JS代码 |
| **模板系统** | 支持自定义显示模板 |
| **缓存控制** | 可配置缓存时间 |
| **安全验证** | MD5验证防止篡改 |

### JS代码类型（Line 16）

```php
$jstypes = array(
    0 => 'threads',       -- 最新主题
    1 => 'forums',        -- 论坛列表
    2 => 'memberrank',    -- 会员排行
    3 => 'stats',         -- 论坛统计
    4 => 'images',        -- 最新图片
    -1 => 'custom',       -- 自定义组合
    -2 => 'side'          -- 侧边栏模块
);
```

### 模板变量系统

#### threads 类型变量

```php
// 最新主题支持的变量
$thread_variables = array(
    '{prefix}' => '前缀图标',
    '{subject}' => '主题标题',
    '{author}' => '作者',
    '{dateline}' => '发布时间',
    '{replies}' => '回复数',
    '{views}' => '浏览数',
    '{lastpost}' => '最后回复',
    '{forumname}' => '版块名称',
    '{typename}' => '分类名称'
);

// 默认模板
$default_template = '{prefix} {subject} ({replies}/{views})<br />';
```

#### forums 类型变量

```php
// 论坛列表支持的变量
$forum_variables = array(
    '{forumname}' => '版块名称',
    '{description}' => '版块描述',
    '{threads}' => '主题数',
    '{posts}' => '帖子数',
    '{todayposts}' => '今日帖数'
);

// 默认模板
$default_template = '{forumname} ({threads}/{posts})<br />';
```

#### memberrank 类型变量

```php
// 会员排行支持的变量
$rank_variables = array(
    '{member}' => '用户名',
    '{credit}' => '积分值',
    '{posts}' => '发帖数',
    '{regdate}' => '注册时间'
);

// 默认模板
$default_template = '{member}: {credit}<br />';
```

### 代码生成流程

```php
// 1. 收集参数
$parameters = array(
    'threads_forums' => $_POST['forums'],           // 版块筛选
    'threads_special' => $_POST['special'],         // 特殊主题
    'threads_digest' => $_POST['digest'],           // 精华筛选
    'threads_orderby' => $_POST['orderby'],         // 排序方式
    'threads_startrow' => $_POST['startrow'],       // 起始行
    'threads_items' => $_POST['items'],             // 显示数量
    'threadmaxlength' => $_POST['maxlength'],       // 标题长度
    'jscharset' => $_POST['charset'],               // 字符编码
    'cachelife' => $_POST['cachelife'],             // 缓存时间
    'jstemplate' => $_POST['template']              // 显示模板
);

// 2. 构建URL参数（Lines 178-203）
$jsurl = "function=threads";
$jsurl .= "&fids=" . jsfids($parameters['threads_forums']);
$jsurl .= "&special=" . bindec(implode('', $parameters['threads_special']));
$jsurl .= "&digest=" . $parameters['threads_digest'];
$jsurl .= "&orderby=" . $parameters['threads_orderby'];
$jsurl .= "&startrow=" . $parameters['threads_startrow'];
$jsurl .= "&items=" . $parameters['threads_items'];
$jsurl .= "&maxlength=" . $parameters['threadmaxlength'];
$jsurl .= "&charset=" . $parameters['jscharset'];
$jsurl .= "&cachelife=" . $parameters['cachelife'];
$jsurl .= "&template=" . rawurlencode($parameters['jstemplate']);

// 3. 添加验证哈希（Lines 205-210）
$verify = md5($authkey . $jsurl);
$jsurlview = $boardurl . 'api/javascript.php?' . $jsurl . '&verify=' . $verify;

// 4. 生成输出代码
// 内部请求方式（PHP直接执行）
$inner_code = '{eval request(\'' . str_replace("'", "\'", $jskey) . '\');}';

// 外部请求方式（JavaScript引用）
$outer_code = '<script type="text/javascript" src="'
    . $jsurlview
    . '"></script>';
```

### 导入/导出系统

```php
// 导出格式（Lines 106-154）
$export_data = array(
    'version' => '6.1.0',
    'name' => $jsname,
    'url' => $jsurl,
    'parameter' => $parameters,
    'comment' => $comment
);

// Base64编码
$export_content = base64_encode(serialize($export_data));

header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="javascript_' . $jskey . '.txt"');
echo $export_content;

// 导入逻辑（Lines 757-816）
function import_javascript($file, $overwrite = false) {
    // 1. 读取并解码
    $content = file_get_contents($file);
    $data = unserialize(base64_decode($content));

    // 2. 验证数据
    if(empty($data['name']) || empty($data['url']) || empty($data['parameter'])) {
        return error('Invalid import file');
    }

    // 3. 生成唯一key
    $jskey = strtolower($data['name']);
    if(!$overwrite) {
        $jskey .= '_' . random(4);
    }

    // 4. 保存到数据库
    $db->query("INSERT INTO {$tablepre}request
                (variable, value)
                VALUES ('$jskey', '" . addslashes(serialize($data)) . "')");

    // 5. 清理文件
    @unlink($file);

    // 6. 更新缓存
    updatecache('javascript');

    return success('JavaScript imported successfully');
}
```

### 全局配置（Lines 818-877）

```php
// JavaScript系统全局设置
$js_settings = array(
    // 系统开关
    'jsstatus' => 1,                     -- 是否启用JS系统

    // 日期格式
    'jsdateformat' => 'Y-m-d H:i',       -- 日期显示格式

    // 允许的引用域名
    'jsrefdomains' => '',                -- 空表示允许所有
    // 格式: "example.com\nwww.example.com"

    // 侧边栏设置
    'infosidestatus' => array(
        0 => 0,      -- 侧边栏1: 关闭
        1 => 0,      -- 侧边栏2: 关闭
        2 => 1,      -- 侧边栏3: 开启
        3 => 1       -- 侧边栏4: 开启
    ),

    // 默认缓存时间（秒）
    'jscachelife' => 3600                -- 1小时
);
```

### 安全机制

```php
// 1. URL验证
function verify_js_url($url, $verify) {
    global $authkey;

    // 重新计算验证哈希
    $expected = md5($authkey . $url);

    return $verify === $expected;
}

// 2. 引用域名检查
function check_referrer_domain() {
    global $jsrefdomains;

    if(empty($jsrefdomains)) {
        return true;  -- 允许所有
    }

    $allowed = explode("\n", $jsrefdomains);
    $referer = parse_url($_SERVER['HTTP_REFERER']);
    $host = $referer['host'];

    return in_array($host, $allowed);
}

// 3. 参数清理
function clean_js_parameters($params) {
    // 移除危险字符
    $params = preg_replace('/[^\w\[\]=&,\/\.\-\:\?\s]/', '', $params);

    // 限制长度
    if(strlen($params) > 65535) {
        $params = substr($params, 0, 65535);
    }

    return $params;
}
```

### 数据存储结构

```sql
-- JavaScript配置存储在 cdb_request 表
CREATE TABLE cdb_request (
    variable VARCHAR(50) PRIMARY KEY,    -- JS唯一标识
    value TEXT                           -- 序列化的配置数据
);

-- value字段结构（序列化）
array(
    'version' => '6.1.0',
    'name' => '我的论坛',
    'url' => 'function=threads&fids=1,2,3&...',
    'parameter' => array(
        'threads_forums' => array(1, 2, 3),
        'threads_special' => array(0, 0, 0, 0, 0, 0, 0),
        'threads_digest' => 0,
        'threads_orderby' => 'lastpost',
        'threads_startrow' => 0,
        'threads_items' => 10,
        'threadmaxlength' => 50,
        'jscharset' => 'UTF-8',
        'cachelife' => 3600,
        'jstemplate' => '{prefix} {subject}<br />'
    ),
    'comment' => '显示最新主题'
);
```

---

## 3. 迁移建议

### 积分系统现代化

```typescript
// 积分类型定义
interface CreditType {
  id: number;                    // 1-8
  name: string;
  unit?: string;
  ratio: number;
  available: boolean;
  showInThread: boolean;
  allowExchangeOut: boolean;
  allowExchangeIn: boolean;
  lowerLimit: number;
}

// 积分规则
interface CreditRule {
  action: 'post' | 'reply' | 'digest' | 'upload' | 'download';
  credits: Record<number, number>;  // creditId => amount
}

// 积分服务
class CreditService {
  async getUserCredits(userId: number): Promise<Record<number, number>>;
  async addCredit(userId: number, creditId: number, amount: number, reason: string): Promise<void>;
  async exchange(userId: number, fromId: number, toId: number, amount: number): Promise<ExchangeResult>;
  async calculateExchange(fromId: number, toId: number, amount: number): Promise<ExchangeResult>;
}

interface ExchangeResult {
  fromAmount: number;
  toAmount: number;
  tax: number;
  rate: number;
}
```

### JavaScript系统现代化

```typescript
// JS配置定义
interface JSConfig {
  key: string;
  type: 'threads' | 'forums' | 'memberrank' | 'stats' | 'images' | 'custom' | 'side';
  name: string;
  enabled: boolean;
  parameters: JSParameters;
  template?: string;
  cacheTTL?: number;
  charset?: string;
}

interface JSParameters {
  forums?: number[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  filters?: Record<string, any>;
}

// 代码生成服务
class JavaScriptGeneratorService {
  async generateCode(config: JSConfig): Promise<string>;
  async validateConfig(config: JSConfig): Promise<boolean>;
  async getPreview(config: JSConfig): Promise<PreviewData>;
}

// REST API替代
app.get('/api/js/:key', async (req, res) => {
  const config = await JSConfig.findOne({ key: req.params.key, enabled: true });
  if (!config) return res.status(404).send('Not found');

  const data = await fetchData(config);
  const html = renderTemplate(data, config.template);

  res.set('Content-Type', 'application/javascript');
  res.send(`document.write('${escapeHtml(html)}');`);
});
```

---

## 总结

### 积分向导特点

1. **灵活配置**: 8种积分类型，每种可独立配置
2. **多级规则**: 全局、版块、用户组三级规则
3. **公式系统**: 支持复杂的积分计算公式
4. **兑换机制**: 带税率的积分兑换系统

### JS向导特点

1. **模板系统**: 灵活的变量替换模板
2. **多种类型**: 支持7种不同的内容类型
3. **安全验证**: MD5哈希防止URL篡改
4. **缓存控制**: 可配置的缓存机制
5. **导入导出**: 便于配置的备份和迁移

### 迁移要点

1. **数据结构**: 序列化数据转为JSON/关系表
2. **公式解析**: 使用安全的表达式解析器
3. **模板引擎**: 升级为现代模板系统
4. **API设计**: RESTful API替代直接PHP执行
5. **缓存优化**: 使用Redis替代文件缓存
