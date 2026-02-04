# WAP版本分析

## 概述

Discuz! 6.1F 的WAP版本位于 `bbs/wap/` 目录，是针对移动设备的简化版本，使用WML（Wireless Markup Language）协议。

---

## 目录结构

```
bbs/wap/
├── index.php                 # WAP入口文件
└── include/                  # WAP功能模块
    ├── forum.inc.php         # 版块列表
    ├── global.func.php       # 全局函数
    ├── goto.inc.php          # 跳转功能
    ├── home.inc.php          # 首页
    ├── login.inc.php         # 登录
    ├── my.inc.php            # 个人中心
    ├── myphone.inc.php       # 手机个人中心
    ├── pm.inc.php            # 短消息
    ├── post.inc.php          # 发帖回复
    ├── register.inc.php      # 注册
    ├── search.inc.php        # 搜索
    ├── stats.inc.php         # 统计
    └── thread.inc.php        # 帖子阅读
```

---

## 文件清单

| 文件 | 功能 | 代码量 |
|------|------|--------|
| index.php | 入口路由 | ~50行 |
| include/home.inc.php | 首页 | ~150行 |
| include/forum.inc.php | 版块列表 | ~200行 |
| include/thread.inc.php | 帖子阅读 | ~300行 |
| include/post.inc.php | 发帖回复 | ~250行 |
| include/login.inc.php | 登录 | ~100行 |
| include/register.inc.php | 注册 | ~150行 |
| include/pm.inc.php | 短消息 | ~120行 |
| include/my.inc.php | 个人中心 | ~180行 |
| include/search.inc.php | 搜索 | ~100行 |
| include/stats.inc.php | 统计 | ~80行 |
| include/goto.inc.php | 跳转 | ~50行 |
| include/global.func.php | 全局函数 | ~200行 |
| include/myphone.inc.php | 手机个人中心 | ~100行 |

---

## 技术架构

### 协议和编码

| 项目 | 说明 |
|------|------|
| 标记语言 | WML 1.1 |
| 字符编码 | UTF-8 |
| 输出格式 | 纯文本，无CSS/JS |
| 图片支持 | 无（或极简） |

### WML示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.1//EN" "http://www.wapforum.org/DTD/wml_1.1.xml">
<wml>
  <card id="main" title="论坛首页">
    <p><a href="home.php">论坛首页</a></p>
    <p><a href="forum.php">版块列表</a></p>
    <p>在线: <strong>$online</strong> 人</p>
  </card>
</wml>
```

---

## 核心功能

### 1. 首页 (home.inc.php)

**功能**:
- 显示论坛名称
- 用户信息/登录状态
- 新消息提示
- 论坛列表（最多10个）
- 在线人数统计
- 搜索入口
- 工具链接

**数据查询**:
```sql
-- 获取版块列表
SELECT * FROM cdb_forums WHERE status>0 ORDER BY displayorder

-- 获取在线人数
SELECT COUNT(*) FROM cdb_sessions
```

---

### 2. 版块列表 (forum.inc.php)

**功能**:
- 显示版块下的主题列表
- 支持精华帖筛选
- 显示子版块
- 分页显示
- 版块内搜索

**参数**:
- `fid` - 版块ID
- `filter` - 筛选类型（精华/普通）
- `page` - 页码

---

### 3. 帖子阅读 (thread.inc.php)

**功能**:
- 帖子详情
- 长文本分页
- 回复列表
- 快速回复
- 上下帖导航

**特殊处理**:
- 长帖子自动分页（每页2000字）
- 去除UBB代码复杂格式
- 简化附件显示

---

### 4. 发帖回复 (post.inc.php)

**功能**:
- 发布新主题
- 回复主题
- 权限检查
- 内容审核

**限制**:
- 新手保护期（24小时内不能发帖）
- 发帖间隔限制
- 内容长度限制

---

### 5. 登录/注册

**登录** (login.inc.php):
- 支持用户名/UID登录
- 与UCenter同步
- Cookie设置

**注册** (register.inc.php):
- 用户名检查
- 邮箱验证
- 密码强度检查
- 与UCenter同步注册

---

## 与桌面版对比

| 功能 | WAP版本 | 桌面版 |
|------|---------|--------|
| **界面** | 纯文本WML | HTML+CSS |
| **样式** | 无样式 | 丰富样式 |
| **脚本** | 无JavaScript | 复杂JS交互 |
| **图片** | 不支持 | 完整支持 |
| **附件** | 仅列表 | 预览下载 |
| **UBB代码** | 简化 | 完整支持 |
| **特殊帖子** | 基础类型 | 投票/悬赏等 |
| **分页** | 简单分页 | 复杂分页 |
| **搜索** | 基础搜索 | 高级搜索 |
| **个人中心** | 基础功能 | 完整功能 |

---

## 用户体验

### WAP版本优势

1. **加载速度快** - 纯文本，无资源
2. **节省流量** - 极简数据
3. **兼容性好** - 支持老式手机
4. **代码简单** - 易于维护

### WAP版本局限

1. **界面简陋** - 无样式，体验差
2. **功能受限** - 缺少高级功能
3. **操作不便** - 简单链接导航
4. **技术过时** - WML已被废弃

---

## 设备检测

```php
// 检测移动设备
function is_wap() {
    // 检查User-Agent
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
        $ua = strtolower($_SERVER['HTTP_USER_AGENT']);
        $mobile = array('nokia', 'sony', 'ericsson', 'mot', 'samsung', 'htc', 'android');
        foreach ($mobile as $device) {
            if (strpos($ua, $device) !== false) {
                return true;
            }
        }
    }
    return false;
}
```

---

## Google AdSense集成

```php
// WAP页面中的广告代码
if ($admode) {
    echo "<p>" . $google_ad . "</p>";
}
```

---

## 是否保留建议

### 分析

| 方面 | 评估 |
|------|------|
| 技术先进性 | 🔴 过时（WML已废弃）|
| 用户需求 | 🟡 低（用户少）|
| 维护成本 | 🟢 低（代码简单）|
| 功能价值 | 🟢 低（功能基础）|
| SEO价值 | 🟢 低（移动端已由响应式替代）|

### 建议

#### 方案A：完全废弃 ⭐ 推荐

**理由**:
- WML协议已过时
- 现代手机支持完整HTML
- 响应式设计已解决移动端问题

**实施**:
1. 移除wap目录
2. 实现响应式设计
3. 移动端使用统一域名

#### 方案B：保留但不再维护

**理由**:
- 仍有少量老设备用户
- 保留作为备用方案

**实施**:
1. 保留但不宣传
2. 不再更新功能
3. 逐步引导用户到新版

#### 方案C：重写为现代移动端

**理由**:
- 移动用户增长
- 需要更好的移动体验

**实施**:
1. 使用现代技术重写
2. PWA支持
3. 移动端优化

### 结论

**推荐：方案A - 完全废弃**

将移动端用户统一迁移到响应式桌面版，使用现代Web技术提供更好的移动体验。WAP版本的代码可以保留作为历史参考，但不再作为主要访问方式。

---

## 重构建议（如果保留）

### 现代化改造

```typescript
// 移动端路由
const mobileRoutes = [
  { path: '/m', component: MobileHome },
  { path: '/m/forums/:id', component: MobileForum },
  { path: '/m/threads/:id', component: MobileThread },
];

// 响应式布局
<div className="container">
  <MobileView><MobileLayout /></MobileView>
  <BrowserView><DesktopLayout /></BrowserView>
</div>
```

### PWA支持

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/m',
        '/m/forums',
        '/m/static/styles.css',
      ]);
    })
  );
});
```

### 移动端优化

- 触摸操作优化
- 大按钮设计
- 简化导航
- 快速加载
- 离线支持
