# Admin后台管理 - 深入分析报告（第3组-主题类型）

## threadtypes.inc.php - 主题类型管理（38KB）

**文件信息**: 约770行

---

## 1. 主题类型定义结构

### 数据表结构

```sql
-- 主题类型表
CREATE TABLE cdb_threadtypes (
    typeid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),                    -- 类型名称
    description VARCHAR(255),            -- 类型描述
    displayorder SMALLINT(6),            -- 显示顺序
    special TINYINT(1),                  -- 是否特殊类型
    template TEXT,                       -- 模板内容
    modelid INT                          -- 关联模型ID
);

-- 类型选项表
CREATE TABLE cdb_typeoptions (
    optionid INT PRIMARY KEY AUTO_INCREMENT,
    classid INT,                         -- 分类ID
    typeid INT,                          -- 类型ID
    displayorder SMALLINT(6),
    title VARCHAR(100),                  -- 选项标题
    identifier VARCHAR(50),              -- 标识符
    type VARCHAR(20),                     -- 选项类型
    unit VARCHAR(30),                    -- 单位
    required TINYINT(1),                 -- 是否必填
    unchangeable TINYINT(1),             -- 是否不可修改
    search TINYINT(1),                   -- 是否可搜索
    rules TEXT                           -- 验证规则
);

-- 类型选项变量表
CREATE TABLE cdb_typeoptionvars (
    sortid INT PRIMARY KEY AUTO_INCREMENT,
    typeid INT,
    fid INT,                             -- 版块ID
    expiration INT,                      -- 过期时间
    value TEXT                           -- 选项值
);

-- 版块字段表（存储类型关联）
CREATE TABLE cdb_forumfields (
    fid INT PRIMARY KEY,
    threadtypes TEXT                     -- 序列化的类型配置
);
```

### 类型配置存储格式

```php
// cdb_forumfields.threadtypes 字段格式
// 序列化的数组结构
$forum_threadtypes = array(
    'types' => array(
        '1' => '提问',
        '2' => '分享',
        '3' => '讨论'
    ),
    'flat' => array(
        '1' => '提问',
        '2' => '分享',
        '3' => '讨论'
    ),
    'selectbox' => array(
        '1' => '提问',
        '2' => '分享',
        '3' => '讨论'
    )
);

// 存储格式
$a:3:{
    s:5:"types";
    a:3:{i:1;s:6:"提问";i:2;s:6:"分享";i:3;s:6:"讨论";}
    s:4:"flat";
    a:3:{i:1;s:6:"提问";i:2;s:6:"分享";i:3;s:6:"讨论";}
    s:8:"selectbox";
    a:3:{i:1;s:6:"提问";i:2;s:6:"分享";i:3;s:6:"讨论";}
}
```

---

## 2. 主题类型权限控制

### 版块-类型关联

```php
// 查询有关联类型的版块
function get_threadtype_forums() {
    global $db, $tablepre;

    $forums = array();
    $query = $db->query("SELECT f.fid, f.name, ff.threadtypes
                          FROM {$tablepre}forums f
                          LEFT JOIN {$tablepre}forumfields ff ON f.fid = ff.fid
                          WHERE ff.threadtypes <> '' AND ff.threadtypes IS NOT NULL");

    while($forum = $db->fetch_array($query)) {
        $forum['threadtypes'] = unserialize($forum['threadtypes']);
        $forums[] = $forum;
    }

    return $forums;
}

// 检查版块是否允许使用某类型
function check_threadtype_permission($fid, $typeid) {
    $forum = get_forum_fields($fid);
    $types = $forum['threadtypes']['types'];

    return isset($types[$typeid]);
}
```

### 类型选项权限

```php
// 类型选项权限配置
// Line 437-442
$option_permissions = array(
    'available' => 0,      -- 是否可选
    'required' => 0,       -- 是否必填
    'unchangeable' => 0,   -- 是否不可修改
    'search' => 0          -- 是否可搜索
);

// 权限检查逻辑
function validate_option_permission($option, $value) {
    // 检查必填
    if($option['required'] && empty($value)) {
        return error('该选项为必填项');
    }

    // 检查不可修改
    if($option['unchangeable'] && isset($old_value)) {
        return error('该选项不可修改');
    }

    // 验证规则
    if($option['rules']) {
        $rules = unserialize($option['rules']);
        if(!validate_by_rules($value, $rules)) {
            return error('选项值不符合验证规则');
        }
    }

    return success();
}
```

---

## 3. 主题类型模板系统

### 模板语法

```php
// 模板中的变量占位符格式
// {variablename} - 显示变量名
// [variablenamevalue] - 显示变量值

// 示例模板（Lines 449-451）
$typetemplate = '
    <li><b>{title}</b>: [titlevalue]</li>
    <li><b>{price}</b>: [pricevalue] 元</li>
    <li><b>{condition}</b>: [conditionvalue]</li>
    <li><b>{location}</b>: [locationvalue]</li>
    <li><b>{contact}</b>: [contactvalue]</li>
';

// 模板解析函数（Lines 822-830）
function parse_type_template($template, $values) {
    // 替换变量名
    $parsed = preg_replace('/\{(\w+)\}/e', '"$1"', $template);

    // 替换变量值
    foreach($values as $key => $value) {
        $parsed = str_replace("[$key" . "value]", $value, $parsed);
    }

    return $parsed;
}

// JavaScript插入函数（Lines 495-505）
function insertvar(text) {
    var textarea = $('typetemplate');
    textarea.focus();

    // 兼容不同浏览器的文本插入
    if(document.selection) {
        // IE
        var sel = document.selection.createRange();
        sel.text = '<li><b>{' + text + '}</b>: [' + text + 'value]</li>\r\n';
    } else if(textarea.selectionStart || textarea.selectionStart == '0') {
        // Firefox, Chrome
        var startPos = textarea.selectionStart;
        var endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos)
            + '<li><b>{' + text + '}</b>: [' + text + 'value]</li>\r\n'
            + textarea.value.substring(endPos, textarea.value.length);
    } else {
        // 其他
        textarea.value += '<li><b>{' + text + '}</b>: [' + text + 'value]</li>\r\n';
    }
}
```

### 模板变量定义

```php
// 可用的模板变量（从typeoptions中获取）
$template_variables = array(
    'title' => '标题',
    'price' => '价格',
    'condition' => '成色',
    'location' => '所在地',
    'contact' => '联系方式',
    'delivery' => '交易方式',
    'payment' => '支付方式'
);

// 动态生成变量插入按钮（Lines 437-442）
foreach($template_variables as $var => $label) {
    echo '<a href="javascript:;" onclick="insertvar(\''.$var.'\')">'.$label.'</a> ';
}
```

---

## 4. 显示顺序管理

### 排序接口（Line 54）

```php
// 显示顺序输入框
<input type="text" name="displayordernew[' . $type['typeid'] . ']"
       value="' . $type['displayorder'] . '" size="3" />

// 批量更新显示顺序
if(submitcheck('submit')) {
    foreach($_POST['displayordernew'] as $typeid => $order) {
        $db->query("UPDATE {$tablepre}threadtypes
                    SET displayorder='$order'
                    WHERE typeid='$typeid'");
    }

    updatecache('threadtypes');
    cpmsg('threadtypes_update_succeed', 'threadtypes');
}
```

### 动态行添加（Lines 63-95）

```php
// JavaScript动态添加类型行
var rowdata = {
    typeid: 0,
    name: '',
    description: '',
    displayorder: 0,
    special: 0
};

function addtype() {
    // 创建新行HTML
    var newRow = '<tr>'
        + '<td><input type="checkbox" name="delete[]" value="new" /></td>'
        + '<td><input type="text" name="displayordernew[new]" value="0" size="3" /></td>'
        + '<td><input type="text" name="namenew[new]" value="" size="20" /></td>'
        + '<td><input type="text" name="descriptionnew[new]" value="" size="40" /></td>'
        + '<td>' + get_forum_checkbox_html('new') + '</td>'
        + '<td>&nbsp;</td>'
        + '</tr>';

    // 添加到表格
    $('#typetable tbody').append(newRow);
}
```

---

## 5. 类型选项分类

### 选项分类结构

```php
// 选项分类（Lines 286-371）
class TypeOptionClass {
    var $classid;
    var $typeid;
    var $name;
    var $displayorder;
    var $options = array();
}

// 获取分类下的选项
function get_options_by_class($classid) {
    global $db, $tablepre;

    $options = array();
    $query = $db->query("SELECT * FROM {$tablepre}typeoptions
                          WHERE classid='$classid'
                          ORDER BY displayorder");

    while($option = $db->fetch_array($query)) {
        $options[] = $option;
    }

    return $options;
}

// 创建新分类
function create_option_class($typeid, $name, $displayorder) {
    global $db, $tablepre;

    $db->query("INSERT INTO {$tablepre}typeoptions
                (classid, typeid, displayorder, title, identifier, type)
                VALUES (0, '$typeid', '$displayorder', '$name', '', 'class')");

    return $db->insert_id();
}
```

---

## 6. 主题类型与版块关联

### 关联数据更新（Lines 150-175）

```php
// 更新版块的类型关联
function update_forum_threadtypes($typeid, $forum_ids, $action = 'add') {
    global $db, $tablepre;

    foreach($forum_ids as $fid) {
        // 获取当前关联
        $threadtypes = $db->result_first("SELECT threadtypes
                                           FROM {$tablepre}forumfields
                                           WHERE fid='$fid'");

        $types = unserialize($threadtypes);

        if($action == 'add') {
            // 添加关联
            $types['types'][$typeid] = $type_name;
            $types['flat'][$typeid] = $type_name;
            $types['selectbox'][$typeid] = $type_name;
        } elseif($action == 'delete') {
            // 删除关联
            unset($types['types'][$typeid]);
            unset($types['flat'][$typeid]);
            unset($types['selectbox'][$typeid]);
        }

        // 更新数据库
        $db->query("UPDATE {$tablepre}forumfields
                    SET threadtypes='" . addslashes(serialize($types)) . "'
                    WHERE fid='$fid'");
    }
}

// 删除类型时清理关联（Lines 104-127）
function delete_threadtype($typeid) {
    global $db, $tablepre;

    // 1. 删除类型选项变量
    $db->query("DELETE FROM {$tablepre}typeoptionvars
                WHERE typeid='$typeid'");

    // 2. 删除交易选项变量（如果存在）
    $db->query("DELETE FROM {$tablepre}tradeoptionvars
                WHERE typeid='$typeid'");

    // 3. 删除类型变量
    $db->query("DELETE FROM {$tablepre}typevars
                WHERE typeid='$typeid'");

    // 4. 删除类型定义
    $db->query("DELETE FROM {$tablepre}threadtypes
                WHERE typeid='$typeid'");

    // 5. 更新所有版块的关联
    $query = $db->query("SELECT fid, threadtypes
                          FROM {$tablepre}forumfields
                          WHERE threadtypes <> ''");

    while($forum = $db->fetch_array($query)) {
        $types = unserialize($forum['threadtypes']);
        unset($types['types'][$typeid]);
        unset($types['flat'][$typeid]);
        unset($types['selectbox'][$typeid]);

        $db->query("UPDATE {$tablepre}forumfields
                    SET threadtypes='" . addslashes(serialize($types)) . "'
                    WHERE fid='$forum[fid]'");
    }

    // 6. 更新缓存
    updatecache('threadtypes');
}
```

---

## 7. 类型验证规则

### 规则格式

```php
// cdb_typeoptions.rules 字段格式（序列化）
$rules = array(
    'min' => 0,              -- 最小值
    'max' => 10000,          -- 最大值
    'regex' => '',           -- 正则表达式
    'message' => ''          -- 错误提示
);

// 示例规则
$price_rules = array(
    'min' => 0,
    'max' => 999999,
    'message' => '价格必须在0-999999之间'
);

$phone_rules = array(
    'regex' => '/^1[3-9]\d{9}$/',
    'message' => '请输入正确的手机号码'
);

$email_rules = array(
    'regex' => '/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/',
    'message' => '请输入正确的邮箱地址'
);
```

### 验证函数

```php
// 验证选项值
function validate_type_option_value($option, $value) {
    $rules = unserialize($option['rules']);

    // 最小值验证
    if(isset($rules['min']) && $value < $rules['min']) {
        return array(
            'success' => false,
            'message' => $rules['message'] ?: '值不能小于' . $rules['min']
        );
    }

    // 最大值验证
    if(isset($rules['max']) && $value > $rules['max']) {
        return array(
            'success' => false,
            'message' => $rules['message'] ?: '值不能大于' . $rules['max']
        );
    }

    // 正则验证
    if(!empty($rules['regex']) && !preg_match($rules['regex'], $value)) {
        return array(
            'success' => false,
            'message' => $rules['message'] ?: '格式不正确'
        );
    }

    return array('success' => true);
}
```

---

## 8. 前端显示

### 类型选择框

```php
// 生成类型选择框（发帖页面）
function threadtype_selectbox($fid) {
    global $db, $tablepre;

    // 获取版块允许的类型
    $threadtypes = $db->result_first("SELECT threadtypes
                                       FROM {$tablepre}forumfields
                                       WHERE fid='$fid'");

    $types = unserialize($threadtypes);

    if(empty($types['selectbox'])) {
        return '';
    }

    // 生成HTML
    $html = '<select name="typeid">';
    $html .= '<option value="0">请选择类型</option>';

    foreach($types['selectbox'] as $typeid => $name) {
        $html .= '<option value="' . $typeid . '">' . $name . '</option>';
    }

    $html .= '</select>';

    return $html;
}
```

### 类型信息显示

```php
// 显示主题类型信息
function show_threadtype_info($tid) {
    global $db, $tablepre;

    // 获取主题类型
    $thread = $db->fetch_first("SELECT typeid, typeid as type
                                  FROM {$tablepre}threads
                                  WHERE tid='$tid'");

    if(!$thread['typeid']) {
        return '';
    }

    // 获取类型定义
    $type = $db->fetch_first("SELECT * FROM {$tablepre}threadtypes
                               WHERE typeid='$thread[typeid]'");

    // 获取类型选项值
    $values = array();
    $query = $db->query("SELECT * FROM {$tablepre}typeoptionvars
                          WHERE typeid='$thread[typeid]'
                          AND sortid='$thread[sortid]'");

    while($var = $db->fetch_array($query)) {
        $values[$var['optionid']] = $var['value'];
    }

    // 解析模板
    $html = parse_type_template($type['template'], $values);

    return $html;
}
```

---

## 9. 数据库关系图

```
┌─────────────────────┐
│  cdb_threadtypes    │
│  - typeid (PK)      │
│  - name             │
│  - template         │
│  - special          │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴──────┐
    │             │
┌───▼────────┐  ┌▼──────────────┐
│cdb_typesops│  │cdb_forumfields│
│- optionid  │  │- fid (PK)     │
│- typeid(FK)│  │- threadtypes  │
│- classid   │  │  (serialized) │
└─────┬──────┘  └───────────────┘
      │
      │ 1:N
      │
┌─────▼──────────────┐
│cdb_typeoptionvars  │
│- sortid (PK)       │
│- typeid (FK)       │
│- fid               │
│- value             │
└────────────────────┘
```

---

## 10. 迁移建议

### 现代化改造

1. **数据结构优化**
   - 将序列化数据转为关联表
   - 使用JSON替代serialize
   - 添加索引优化查询

2. **模板系统升级**
   - 使用现代模板引擎（如Handlebars）
   - 支持组件化模板
   - 前后端分离

3. **验证规则改进**
   - 使用JSON Schema
   - 支持自定义验证器
   - 前端实时验证

### 新架构示例

```typescript
// 主题类型定义
interface ThreadType {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  special: boolean;
  template?: string;
  options: TypeOption[];
  forums: number[];  // 关联版块ID列表
}

interface TypeOption {
  id: number;
  typeId: number;
  classId?: number;
  title: string;
  identifier: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'radio' | 'checkbox';
  required: boolean;
  unchangeable: boolean;
  searchable: boolean;
  validation?: ValidationRule;
}

interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

// 服务接口
class ThreadTypeService {
  async getTypesByForum(forumId: number): Promise<ThreadType[]>;
  async getTypeById(id: number): Promise<ThreadType>;
  async createType(type: Partial<ThreadType>): Promise<ThreadType>;
  async updateType(id: number, type: Partial<ThreadType>): Promise<void>;
  async deleteType(id: number): Promise<void>;
  async validateOption(option: TypeOption, value: any): Promise<boolean>;
}
```
