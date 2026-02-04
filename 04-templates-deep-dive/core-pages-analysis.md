# 核心页面模板深入分析

## 1. 模板文件清单与行数

| 模板文件 | 行数 | 大小 | 说明 |
|----------|------|------|------|
| discuz.htm | ~350 | 12KB | 首页主模板 |
| forumdisplay.htm | ~250 | 9KB | 版块列表页 |
| viewthread.htm | ~400+ | 15KB+ | 帖子阅读页 |
| post_newthread.htm | ~200 | - | 发新主题 |
| post_newreply.htm | ~150 | - | 回复主题 |
| post_editpost.htm | ~180 | - | 编辑帖子 |
| logging.htm | ~120 | - | 登录页 |
| register.htm | ~200 | - | 注册页 |
| header.htm | ~150 | - | 公共头部 |
| footer.htm | ~80 | - | 公共底部 |
| pmprompt.htm | ~60 | - | 短消息提示 |

## 2. discuz.htm - 首页模板分析

### 2.1 模板结构 (带行号)

```
1: {subtemplate header}           // 包含公共头部
2:
3: <div id="foruminfo">           // 论坛信息区 (4-39行)
4:   <div id="userinfo">          // 用户信息区 (5-30行)
5:     <div id="nav">             // 导航
7:       <!--{if $gid || !$discuz_uid}-->
8:         <a href="$indexname">$bbname</a>
9:       <!--{/if}-->
10:    <p>                        // 用户状态 (10-28行)
11:      <!--{if $discuz_uid}-->  // 已登录用户
12:        <!--{if $allowinvisible}-->
13:          在线状态切换按钮
14:        <!--{/if}-->
15:        {lang your_lastvisit}: <em>$lastvisittime</em>
16:        <a href="search.php?srchfrom=$newthreads">{lang show_newthreads}</a>
17:        <a href="member.php?action=markread">{lang mark_read}</a>
18:      <!--{elseif !empty($_DCOOKIE['loginuser'])}-->  // 未激活用户
19:        <em>$_DCOOKIE['loginuser']</em>, 激活链接
20:      <!--{else}-->             // 未登录用户
21:        <form id="loginform">  // 登录表单
22:          <input type="hidden" name="formhash" value="{FORMHASH}" />
23:          <input type="hidden" name="cookietime" value="2592000" />
24:          <input type="text" name="username" />
25:          <input type="password" name="password" />
26:          <button type="submit">{lang login}</button>
27:        </form>
28:      <!--{/if}-->
29:    </p>
30:  </div>
31:
32:  <div id="forumstats">         // 论坛统计 (32-38行)
33:    <p>
34:      今日/昨日/最高发帖统计
35:      <!--{if $rssstatus}-->RSS订阅链接<!--{/if}-->
36:    </p>
37:    <p>
38:      主题/帖子/会员统计 + 欢迎新会员
39:    </p>
40:  </div>
41:</div>

42: <!-- 公告滚动区 (41-108行) -->
42: <!--{if empty($gid) && $announcements}-->
43:   <div id="announcement">
44:     <marquee>公告内容</marquee>
45:   </div>
46:   <script>公告滚动脚本</script>
47: <!--{/if}-->

49: <!-- 广告位 (110行) -->
110: <!--{if $admode && !empty($advlist['text'])}-->
     广告内容
     <!--{else}-->
     空广告位
     <!--{/if}-->

112: <!-- 版块分类循环 (113-200+行) -->
113: <!--{loop $catlist $key $cat}-->
114:   <!--{if $cat['forumscount']}-->  // 有版块的分类
115:     <div class="mainbox forumlist">
116:       <span class="headactions">
117:         版主信息
118:         折叠/展开按钮
119:       </span>
120:       <h3><a href="$indexname?gid=$cat[fid]">$cat[name]</a></h3>
121:       <table id="category_$cat[fid]">
122:         <!--{if !$cat['forumcolumns']}-->  // 列表模式
123:           <thead>表头</thead>
124:           <!--{loop $cat[forums] $forumid}-->
125:             <!--{eval $forum=$forumlist[$forumid];}-->
126:             <tbody id="forum$forum[fid]">
127:               <tr>
128:                 <th>
129:                   版块图标
130:                   版块名称链接
131:                   今日发帖数 (如果有)
132:                   版块描述
133:                   子版块列表
134:                   版主列表
135:                 </th>
136:                 主题数
137:                 帖子数
138:                 最后发帖信息
139:               </tr>
140:             </tbody>
141:           <!--{/loop}-->
142:         <!--{else}-->  // 横向模式 (多栏显示)
143:           横向版块列表
144:         <!--{/if}-->
145:       </table>
146:     </div>
147:   <!--{/if}-->
148: <!--{/loop}-->

200: <!-- 在线用户列表 -->
<!--{if $whosonline && $maxonlinelist}-->
  在线用户详细信息
<!--{/if}-->

250: {subtemplate footer}
```

### 2.2 关键变量

| 变量 | 类型 | 说明 |
|------|------|------|
| $discuz_uid | int | 当前用户ID (0=未登录) |
| $bbname | string | 论坛名称 |
| $lastvisittime | string | 上次访问时间 |
| $newthreads | int | 新主题数量 |
| $catlist | array | 分类列表 |
| $forumlist | array | 版块列表 |
| $announcements | string | 公告内容 |
| $todayposts | int | 今日发帖数 |
| $postdata | array | 发帖统计数据 |
| $threads/$posts | int | 总主题/帖子数 |
| $totalmembers | int | 总会员数 |
| $lastmember | string | 最新会员名 |
| $whosonline | array | 在线用户列表 |

### 2.3 特色功能

1. **登录表单集成**: 首页直接登录
2. **公告滚动**: 使用marquee标签 + JS控制
3. **版块折叠**: 可折叠分类
4. **双显示模式**: 列表模式/横向模式
5. **最后访问时间**: 显示上次访问
6. **版主显示**: 支持平铺/下拉菜单两种模式

### 2.4 React组件拆分建议

```jsx
// HomePage
├── UserSection          // 用户信息区
│   ├── UserStatus      // 用户状态
│   ├── QuickStats      // 快速统计
│   └── LoginForm      // 登录表单
├── ForumStats          // 论坛统计
├── Announcement        // 公告滚动
├── ForumCategory       // 版块分类
│   ├── CategoryHeader  // 分类头部
│   └── ForumList      // 版块列表
│       └── ForumItem  // 单个版块
└── OnlineUsers        // 在线用户
```

## 3. forumdisplay.htm - 版块列表页分析

### 3.1 模板结构

```
1: {subtemplate header}
2:
3: <div id="foruminfo">              // 版块信息区
4:   <div id="headsearch">           // 功能链接区 (5-43行)
5:     <p>
6:       <!--{if $forum['rules']}-->版规链接<!--{/if}-->
7:       <!--{if $forum['recommendlist']}-->推荐链接<!--{/if}-->
8:       收藏本版块
9:       我的话题
10:      <!--{if $allowmodpost}-->审核管理<!--{/if}-->
11:      <!--{if $adminid == 1}-->回收站<!--{/if}-->
12:      <!--{if $forum['ismoderator']}-->版主面板<!--{/if}-->
13:      RSS订阅
14:    </p>
15:  </div>
16:
17:  <div id="nav">                  // 导航面包屑
18:    <p><a href="$indexname">$bbname</a> $navigation</p>
19:    <p>版主信息</p>
20:  </div>
21:</div>
22:
23: <!-- 版规和推荐 (61-105行) -->
24: <!--{if $forum['rules'] || $forum['recommendlist']}-->
25:   <table>
26:     <!--{if $forum['rules']}-->
27:       <td>版规内容</td>
28:     <!--{/if}-->
29:     <!--{if $forum['recommendlist']}-->
30:       <td>推荐主题列表</td>
31:     <!--{/if}-->
32:   </table>
33: <!--{/if}-->
34:
35: <!-- 子版块列表 -->
36: <!--{if $sublist && $forum['forumcolumns']}-->
37:   横向子版块
38: <!--{elseif $sublist}-->
39:   纵向子版块
40: <!--{/if}-->
41:
42: <!-- 主题筛选器 -->
43: <div class="pages_btns">
44:   分页导航
45:   筛选按钮组:
46:   - 全部主题
47:   - 精华主题
48:   - 热门主题
49:   - 最新主题
50:   </div>
51:
52: <!-- 主题列表 -->
53: <form>
54:   <table>
55:     <thead>表头</thead>
56:     <tbody>
57:       <!-- 置顶主题区 -->
58:       <!--{loop $threadlist $key $thread}-->
59:         <!--{if $thread[digest] || $thread[displayorder]}-->
60:           <tr class="special">
61:             主题信息
62:           </tr>
63:         <!--{/if}-->
64:       <!--{/loop}-->
65:
66:       <!-- 普通主题区 -->
67:       <!--{loop $threadlist $key $thread}-->
68:         <!--{if !$thread[digest] && !$thread[displayorder]}-->
69:           <tr>
70:             图标
71:             类型 (投票/悬赏/活动等)
72:             主题标题 (附件/热门/新帖等标记)
73:             作者
74:             回复/查看数
75:             最后发表
76:           </tr>
77:         <!--{/if}-->
78:       <!--{/loop}-->
79:     </tbody>
80:   </table>
81: </form>
82:
83: <!-- 快速发帖 -->
84: <!--{if $allowpost}-->
85:   <form>快速发帖框</form>
86: <!--{/if}-->
87:
88: {subtemplate footer}
```

### 3.2 关键变量

| 变量 | 类型 | 说明 |
|------|------|------|
| $forum | array | 当前版块信息 |
| $fid | int | 版块ID |
| $sublist | array | 子版块列表 |
| $threadlist | array | 主题列表 |
| $page | int | 当前页码 |
| $allowpost | bool | 是否允许发帖 |
| $allowmodpost | bool | 是否有审核权限 |
| $moderatedby | string | 版主列表 |

### 3.3 主题类型标识

| 类型 | 标识 | 说明 |
|------|------|------|
| 普通主题 | 无图标 | 常规主题 |
| 投票主题 | poll图标 | 投票帖 |
| 悬赏主题 | reward图标 | 悬赏帖 |
| 活动主题 | activity图标 | 活动帖 |
| 辩论主题 | debate图标 | 辩论帖 |
| 交易主题 | trade图标 | 交易帖 |
| 精华主题 | digest图标 | 精华帖 |
| 置顶主题 | 显示在顶部 | 置顶帖 |
| 热门主题 | hot图标 | 热门回复 |
| 新帖主题 | new图标 | 新帖 |

### 3.4 筛选器功能

**筛选类型**:
- `digest=1` - 精华主题
- `typeid=X` - 按主题类型
- `special=X` - 特殊主题 (1=投票, 2=悬赏, 3=活动, 4=辩论, 5=交易)
- `orderby=lastpost` - 按最后回复
- `orderby=views` - 按查看数
- `orderby=heats` - 按热门度

### 3.5 React组件拆分建议

```jsx
// ForumPage
├── ForumHeader         // 版块头部
│   ├── ForumActions   // 功能链接
│   └── Breadcrumb     // 面包屑
├── ForumRules         // 版规 (可折叠)
├── ForumRecommend     // 推荐主题
├── SubForumList       // 子版块列表
├── ThreadFilters      // 主题筛选器
├── ThreadList         // 主题列表
│   ├── PinnedThreads  // 置顶区
│   └── NormalThreads  // 普通区
│       └── ThreadItem // 单个主题
└── QuickPost          // 快速发帖
```

## 4. viewthread.htm - 帖子阅读页分析

### 4.1 模板结构

```
1: {subtemplate header}
2:
3: <style>自定义样式</style>
4:
5: <script src="viewthread.js"></script>
6: <script>引用功能脚本</script>
7:
8: <div id="foruminfo">              // 面包屑导航
9:   <p><a href="$indexname">$bbname</a> $navigation</p>
10:</div>
11:
12: <!-- 主题信息区 -->
13: <h1>$thread[subject]</h1>
14: <div class="threadinfo">
15:   作者、发布时间、查看/回复数
16: </div>
17:
18: <!-- 分页导航 -->
19: <div class="pages_btns">
20:   分页按钮
21:   功能按钮: 只看楼主 | 新回复 | 收藏 | 分享
22: </div>
23:
24: <!-- 帖子楼层列表 -->
25: <form>
26:   <div id="postlist">
27:     <!--{loop $postlist $post}-->
28:       <div id="post_$post[pid]" class="post">
29:
30:         <!-- 楼层作者信息 -->
31:         <div class="postauthor">
32:           <div class="avatar">$post[avatar]</div>
33:           <div class="username">
34:             $post[author]
35:             <!--{if $post[authorid]}-->认证图标<!--{/if}-->
36:           </div>
37:           <div class="userinfo">
38:             等级: $post[authortitle]
39:             积分: $post[credits]
40:             <!--{if $post[customstatus]}-->自定义头衔<!--{/if}-->
41:           </div>
42:           <!--{if $post['showpet']}-->宠物信息<!--{/if}-->
43:         </div>
44:
45:         <!-- 楼层内容 -->
46:         <div class="postcontent">
47:           <div class="postinfo">
48:             楼层: <!--{if $post[number] == 1}-->楼主<!--{else}-->$post[number]楼<!--{/if}-->
49:             时间: $post[dateline]
50:             <!--{if $post['rate']}-->评分信息<!--{/if}-->
51:             <!--{if $post['status']}-->状态图标<!--{/if}-->
52:           </div>
53:
54:           <div id="message_$post[pid]" class="message">
55:             $post[message]  // BBCode解析后的HTML
56:           </div>
57:
58:           <!-- 附件显示 -->
59:           <!--{if $post[attachment]}-->
60:             <div class="attachments">
61:               <!--{loop $post[attachment] $attach}-->
62:                 附件信息
63:                 <!--{if $attach['isimage']}-->图片预览<!--{/if}-->
64:                 <!--{if $attach['price']}-->付费附件<!--{/if}-->
65:               <!--{/loop}-->
66:             </div>
67:           <!--{/if}-->
68:
69:           <!-- 签名 -->
70:           <!--{if $post[signature]}-->
71:             <div class="signature">$post[signature]</div>
72:           <!--{/if}-->
73:         </div>
74:
75:         <!-- 楼层操作 -->
76:         <div class="postactions">
77:           <!--{if $allowpostreply}-->回复按钮<!--{/if}-->
78:           <!--{if $alloweditpost}-->编辑按钮<!--{/if}-->
79:           <!--{if $allowpostreply}-->引用按钮<!--{/if}-->
80:           报告按钮
81:           <!--{if $post[first]}-->管理选项<!--{/if}-->
82:         </div>
83:       </div>
84:     <!--{/loop}-->
85:   </div>
86: </form>
87:
88: <!-- 快速回复 -->
89: <!--{if $allowpostreply}-->
90:   <form id="postform">
91:     编辑器 (BBCode编辑器)
92:     <button type="submit">发表回复</button>
93:   </form>
94: <!--{/if}-->
95:
96: {subtemplate footer}
```

### 4.2 关键变量

| 变量 | 类型 | 说明 |
|------|------|------|
| $thread | array | 主题信息 |
| $postlist | array | 帖子列表 |
| $page | int | 当前页码 |
| $allowpostreply | bool | 是否允许回复 |
| $alloweditpost | bool | 是否允许编辑 |
| $maxsigrows | int | 签名最大行数 |
| $ratelogpids | array | 评分记录 |

### 4.3 楼层显示逻辑

**楼层编号计算**:
```php
$floor = ($page - 1) * $ppp + $post_number;  // $ppp = 每页帖子数
```

**特殊楼层**:
- 楼主 (第1楼): `$post[number] == 1`
- 只看楼主模式: 过滤 `$post[authorid] != $thread[authorid]`

### 4.4 宠物系统集成

```html
<!--{if $post['showpet']}-->
<div id="petinfo">
  宠物名称: $post[pet][name]
  宠物等级: $post[pet][level]
  宠物属性: ...
</div>
<!--{/if}-->
```

**数据库关联**:
- `cdb_pets` - 宠物基本信息
- `cdb_pet_skills` - 宠物技能
- `cdb_pet_items` - 宠物物品

### 4.5 附件权限处理

```html
<!--{if $attach['price'] && !$attach['paid']}-->
  付费附件，需要 $attach[price] 积分
<!--{elseif $allowgetattach}-->
  <a href="attachment.php?aid=$attach[aid]">下载附件</a>
<!--{else}-->
  无权限下载附件
<!--{/if}-->
```

### 4.6 React组件拆分建议

```jsx
// ThreadPage
├── ThreadHeader         // 主题头部
│   ├── Title          // 主题标题
│   └── MetaInfo       // 元信息
├── ThreadActions       // 功能按钮
├── PostList           // 帖子列表
│   └── PostNode      // 楼层节点
│       ├── AuthorInfo  // 作者信息
│       ├── PetInfo     // 宠物信息
│       ├── PostContent // 帖子内容
│       ├── Attachments // 附件
│       └── Signature   // 签名
├── Pagination          // 分页
└── QuickReply         // 快速回复
    └── BBCodeEditor  // BBCode编辑器
```

## 5. post_*.htm - 发帖相关模板

### 5.1 post_newthread.htm - 发新主题

```
{subtemplate header}

<h1>发布新主题</h1>

<form id="postform" method="post" action="post.php?action=newthread">
  <!-- 基础信息 -->
  <input type="text" name="subject" placeholder="标题" />
  <select name="typeid">
    <option value="">主题分类</option>
    <!--{loop $threadtypes $typeid $name}-->
      <option value="$typeid">$name</option>
    <!--{/loop}-->
  </select>

  <!-- 特殊主题选择 -->
  <!--{if $allowpostpoll}-->
    <label><input type="radio" name="special" value="1" /> 投票帖</label>
  <!--{/if}-->
  <!--{if $allowpostreward}-->
    <label><input type="radio" name="special" value="2" /> 悬赏帖</label>
  <!--{/if}-->
  <!--{if $allowpostactivity}-->
    <label><input type="radio" name="special" value="3" /> 活动帖</label>
  <!--{/if}-->
  <!--{if $allowpostdebate}-->
    <label><input type="radio" name="special" value="4" /> 辩论帖</label>
  <!--{/if}-->

  <!-- 编辑器 -->
  <textarea name="message" id="message"></textarea>
  <!-- BBCode编辑器工具栏 -->

  <!-- 附件上传 -->
  <!--{if $allowpostattach}-->
    <div id="attachlist">
      <input type="file" name="attach[]" />
      <!-- 已上传附件列表 -->
    </div>
  <!--{/if}-->

  <!-- 选项 -->
  <label>
    <input type="checkbox" name="parseurloff" value="1" />
    禁用 URL 识别
  </label>
  <label>
    <input type="checkbox" name="smileyoff" value="1" />
    禁用表情
  </label>
  <label>
    <input type="checkbox" name="bbcodeoff" value="1" />
    禁用 BBCode
  </label>

  <!-- 验证码 -->
  <!--{if $secqaacheck || $seccodecheck}-->
    验证码/问答
  <!--{/if}-->

  <button type="submit" name="topicsubmit">发表主题</button>
</form>

{subtemplate footer}
```

### 5.2 特殊主题表单

#### 投票帖 (special=1)
```html
<!-- 投票选项 -->
<input type="text" name="polloptions[]" />
<input type="text" name="polloptions[]" />
<!-- 最多添加 N 个选项 -->

<!-- 投票设置 -->
<input type="radio" name="maxchoices" value="1" /> 单选
<input type="radio" name="maxchoices" value="0" /> 多选
截止日期选择器
```

#### 悬赏帖 (special=2)
```html
悬赏积分: <input type="number" name="price" />
悬赏时限: <input type="number" name="rewardtimeout" />
```

#### 活动帖 (special=3)
```html
活动地点: <input type="text" name="activityplace" />
活动时间: <input type="datetime" name="activitystarttime" />
报名截止: <input type="datetime" name="activityexpiration" />
人数限制: <input type="number" name="activitynumber" />
```

#### 辩论帖 (special=4)
```html
正方观点: <textarea name="affirmativepoint"></textarea>
反方观点: <textarea name="negapoint"></textarea>
结束时间: <input type="datetime" name="endtime" />
```

### 5.3 post_newreply.htm - 回复主题

```
{subtemplate header}

<h1>回复主题</h1>

<!-- 主题信息 -->
<h2>$thread[subject]</h2>
<p>作者: $thread[author]</p>

<!-- 引用内容 (如果是引用回复) -->
<!--{if $quote}-->
  <div class="quote">$quote</div>
<!--{/if}-->

<form id="postform" method="post" action="post.php?action=newreply">
  <!-- 回复内容 -->
  <textarea name="message"></textarea>

  <!-- 附件 -->
  <!--{if $allowpostattach}-->
    附件上传
  <!--{/if}-->

  <!-- 选项 -->
  禁用选项...
  <!--{if $allowanonymous}-->
    <label>匿名回复</label>
  <!--{/if}-->

  <button type="submit">发表回复</button>
</form>

{subtemplate footer}
```

### 5.4 React组件拆分建议

```jsx
// PostThreadForm
├── BasicInfo          // 基础信息
│   ├── SubjectInput  // 标题输入
│   └── TypeSelect    // 分类选择
├── SpecialSelector    // 特殊主题选择
├── SpecialForms       // 特殊主题表单
│   ├── PollForm      // 投票表单
│   ├── RewardForm    // 悬赏表单
│   ├── ActivityForm  // 活动表单
│   ├── DebateForm    // 辩论表单
│   └── TradeForm     // 交易表单
├── BBCodeEditor      // BBCode编辑器
├── AttachmentUpload   // 附件上传
├── PostOptions       // 发帖选项
└── Captcha           // 验证码
```

## 6. logging.htm - 登录页分析

```
{subtemplate header}

<div id="loginbox">
  <h1>{lang login}</h1>

  <form id="loginform" method="post" action="logging.php?action=login&loginsubmit=true">
    <input type="hidden" name="formhash" value="{FORMHASH}" />
    <input type="hidden" name="cookietime" value="2592000" />
    <input type="hidden" name="loginfield" value="username" />

    <!-- 用户名 -->
    <input type="text" id="username" name="username"
           value="{lang username}" />

    <!-- 密码 -->
    <input type="password" id="password" name="password" />

    <!-- 安全提问 -->
    <select name="questionid">
      <option value="0">{lang security_question}</option>
      <option value="1">{lang security_question_1}</option>
      <!-- 更多选项 -->
    </select>
    <input type="text" name="answer" />

    <!-- 隐身登录 -->
    <label>
      <input type="checkbox" name="loginmode" value="invisible" />
      {lang login_invisible_mode}
    </label>

    <!-- 记住我 -->
    <label>
      <input type="checkbox" name="cookietime" value="2592000" checked />
      {lang login_cookie_time}
    </label>

    <button type="submit" name="loginsubmit">{lang login}</button>
  </form>

  <!-- UCenter集成 -->
  <!--{if $ucappopen['UCHOME']}-->
    <a href="UCHOME登录链接">使用UCenter账号登录</a>
  <!--{/if}-->

  <!-- 忘记密码 -->
  <a href="forgot.php">{lang lostpassword}</a>

  <!-- 注册链接 -->
  <a href="register.php">{lang register}</a>
</div>

{subtemplate footer}
```

## 7. register.htm - 注册页分析

```
{subtemplate header}

<div id="registerbox">
  <h1>{lang register}</h1>

  <form id="registerform" method="post" action="register.php?regsubmit=yes">
    <input type="hidden" name="formhash" value="{FORMHASH}" />

    <!-- 用户名 -->
    <input type="text" id="username" name="username"
           onblur="checkusername()" />
    <span id="checkusername"></span>

    <!-- 密码 -->
    <input type="password" id="password" name="password" />
    <input type="password" id="password2" name="password2" />

    <!-- 邮箱 -->
    <input type="text" id="email" name="email"
           onblur="checkemail()" />
    <span id="checkemail"></span>

    <!-- 基础信息 -->
    <input type="text" name="location" placeholder="{lang register_location}" />
    <input type="text" name="bio" placeholder="{lang register_bio}" />

    <!-- 自定义问题 (可选) -->
    <select name="questionid">
      <option value="0">{lang security_question}</option>
    </select>
    <input type="text" name="answer" />

    <!-- 邀请码 (如果需要) -->
    <!--{if $invitecode}-->
      <input type="text" name="invitecode" value="$invitecode" readonly />
    <!--{/if}-->

    <!-- 用户协议 -->
    <textarea readonly>用户协议内容...</textarea>
    <label>
      <input type="checkbox" name="agree" value="1" />
      {lang register_agree}
    </label>

    <!-- 验证码 -->
    <!--{if $seccodecheck}-->
      <img src="seccode.php" />
      <input type="text" name="seccodeverify" />
    <!--{/if}-->

    <button type="submit" name="regsubmit">{lang register}</button>
  </form>
</div>

<script>
// 实时验证
function checkusername() {
  ajaxget('register.php?action=checkusername&username=' + $('username').value, 'checkusername');
}
function checkemail() {
  ajaxget('register.php?action=checkemail&email=' + $('email').value, 'checkemail');
}
</script>

{subtemplate footer}
```

## 8. header.htm & footer.htm - 公共模板

### 8.1 header.htm 结构

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="$charset" />
  <title>$navtitle - $bbname</title>
  <meta name="keywords"="$metakeywords" />
  <meta name="description"="$metadescription" />
  <link rel="stylesheet" href="forumdata/cache/style_{STYLEID}_common.css" />
  <script src="include/javascript/common.js"></script>
  <script src="include/javascript/ajax.js"></script>
</head>
<body>

<div id="header">
  <!-- Logo -->
  <h2><a href="$indexname">$bbname</a></h2>

  <!-- 搜索框 -->
  <form id="searchform" method="post" action="search.php">
    <input type="text" name="srchtxt" />
    <select name="srchtype">
      <option value="title">{lang search_title}</option>
      <option value="full">{lang search_content}</option>
    </select>
    <button type="submit">{lang search}</button>
  </form>
</div>

<!-- 导航菜单 -->
<div id="nav">
  <ul>
    <li><a href="$indexname">{lang home}</a></li>
    <!--{loop $navs $nav}-->
      <li><a href="$nav[url]">$nav[name]</a></li>
    <!--{/loop}-->
  </ul>
</div>

<!-- 面包屑导航 (除首页外) -->
<!--{if $navigation}-->
  <div id="breadcrumb">$navigation</div>
<!--{/if}-->

<!-- 快速导航下拉 -->
<!--{if $forumjump}-->
  <select onchange="location.href=this.value">
    <option value="">{lang forum_jump}</option>
    <!--{loop $forumlist $forum}-->
      <option value="forumdisplay.php?fid=$forum[fid]">$forum[name]</option>
    <!--{/loop}-->
  </select>
<!--{/if}-->
```

### 8.2 footer.htm 结构

```html
<!-- 底部信息 -->
<div id="footer">
  <p>
    Powered by <strong>Discuz!</strong>
    <em>$version</em>
  </p>

  <!-- 后台管理链接 -->
  <!--{if $discuz_uid && $adminid == 1}-->
    <a href="admincp.php" target="_blank">{lang admincp}</a>
  </p>
  <!--{/if}-->

  <!-- 版主面板 -->
  <!--{if $discuz_uid && $modforums}-->
    <a href="modcp.php" target="_blank">{lang modcp}</a>
  <!--{/if}-->

  <!-- 统计代码 -->
  <!--{if $statcode}-->
    <div>$statcode</div>
  <!--{/if}-->

  <!-- 执行时间 -->
  <p>{lang debug_time}: $debuginfo</p>
</div>

<!-- 新消息提示 (如果有) -->
<!--{if $newpm}-->
  <script>showPrompt('newpm');</script>
<!--{/if}-->

</body>
</html>
```

## 9. 模板数据流

### 9.1 discuz.htm 数据来源

```php
// index.php (入口)
$catlist = $forumlist = array();  // 版块分类和列表
$announcements = '';              // 公告内容
$todayposts = $postdata = array(); // 统计数据
$whosonline = array();            // 在线用户
$newthreads = 0;                  // 新主题数

// 数据来源
- $_DCACHE['forums']     // 版块缓存
- $_DCACHE['categories'] // 分类缓存
- cdb_threads            // 主题表
- cdb_posts              // 帖子表
- cdb_members            // 用户表
- cdb_forums             // 版块表
```

### 9.2 forumdisplay.htm 数据来源

```php
// forumdisplay.php
$forum = array();          // 当前版块
$sublist = array();        // 子版块列表
$threadlist = array();     // 主题列表
$page = 1;                 // 当前页
$tpp = 20;                 // 每页主题数

// 主要查询
- cdb_forums              // 版块信息
- cdb_threads             // 主题列表
- cdb_posts               // 帖子信息
- $_DCACHE['forums']      // 缓存
```

### 9.3 viewthread.htm 数据来源

```php
// viewthread.php
$thread = array();         // 主题信息
$postlist = array();       // 帖子列表
$ratelogpids = array();    // 评分记录
$aids = array();           // 附件ID

// 主要查询
- cdb_threads             // 主题信息
- cdb_posts               // 帖子列表
- cdb_attachments         // 附件信息
- cdb_memberfields        // 用户扩展信息
- cdb_pets                // 宠物信息
```

## 10. 模板优化建议

### 10.1 性能优化

1. **减少嵌套层数**
   - 控制loop嵌套不超过3层
   - 使用扁平化数据结构

2. **延迟加载**
   - 长列表使用虚拟滚动
   - 图片懒加载

3. **代码分割**
   - 按路由拆分组件
   - 按功能拆分模块

### 10.2 用户体验优化

1. **加载状态**
   - Skeleton屏
   - 进度指示器

2. **错误处理**
   - 友好的错误提示
   - 重试机制

3. **响应式设计**
   - 移动端适配
   - 平板适配

### 10.3 React实现要点

```jsx
// 虚拟滚动长列表
import { FixedSizeList } from 'react-window';

function ThreadList({ threads }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={threads.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <div style={style}>
          <ThreadItem thread={threads[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// 延迟加载图片
function PostImage({ src }) {
  return (
    <LazyLoad height={200} offset={100}>
      <img src={src} loading="lazy" />
    </LazyLoad>
  );
}

// 错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage />;
    }
    return this.props.children;
  }
}
```
