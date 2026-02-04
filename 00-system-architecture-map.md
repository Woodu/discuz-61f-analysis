# Discuz! 6.1F 完整系统架构图

## 系统总览

```
Discuz! 6.1F Forum System
├── 前端展示层
│   ├── 模板系统 (Template Engine)
│   ├── 静态资源 (JS/CSS/Images)
│   └── WAP移动端 (MOC Plugin)
├── 后端处理层
│   ├── 核心入口 (Entry Points)
│   ├── 业务逻辑 (Business Logic)
│   └── 数据处理 (Data Layer)
└── 外部服务层
    ├── UCenter (用户中心)
    ├── 缓存系统 (Cache)
    └── 文件存储 (Uploads)
```

---

## 一、核心入口文件系统

```
bbs/ (根目录)
├── index.php                  # 论坛首页
│   └── 加载 → include/common.inc.php
│       ├── 数据库初始化 ($db)
│       ├── 用户认证 (discuz_uid)
│       ├── 缓存加载 ($_DCACHE)
│       └── 模板引擎初始化
├── forumdisplay.php           # 版块列表
│   ├── 权限检查 (forumperm)
│   ├── 主题列表查询
│   ├── 分页处理 (multi)
│   └── 模板: forumdisplay
├── viewthread.php             # 帖子阅读
│   ├── 主题信息加载
│   ├── 帖子列表查询 (分页)
│   ├── 附件处理
│   ├── 快速回复
│   └── 模板: viewthread
├── post.php                   # 发帖/回复
│   ├── 新主题 (newthread)
│   ├── 回复 (newreply)
│   ├── 编辑 (edit)
│   ├── 投票/交易/活动等特殊类型
│   └── 模板: post_*
├── member.php                 # 用户中心
│   ├── 注册 (register)
│   ├── 登录 (logging)
│   ├── 查看 (viewpro)
│   ├── 忘记密码 (lostpasswd)
│   └── 模板: member_*
├── misc.php                   # 杂项功能
│   ├── 查看 (viewratings|viewwarnings|viewattach)
│   ├── 报价 (pay)
│   ├── Ajax请求
│   └── 模板: misc_*
├── search.php                 # 搜索功能
│   ├── 关键字搜索
│   ├── 标签搜索
│   ├── 全文搜索
│   └── 模板: search
├── pm.php                     # 短消息
│   ├── 收件箱
│   ├── 发件箱
│   ├── 发送消息
│   └── 模板: pm_*
├── memcp.php                  # 用户控制面板
│   ├── 个人资料 (profile)
│   ├── 头像设置 (typeid=6)
│   ├── 积分管理 (credits)
│   ├── 用户组 (usergroups)
│   └── 模板: memcp_*
├── admin.php                  # 后台入口
│   └── 路由到 admin/ 目录
├── modcp.php                  # 版主管理
│   ├── 帖子管理
│   ├── 用户管理
│   └── 模板: modcp_*
├── rss.php                    # RSS订阅
├── faq.php                    # 帮助文档
├── stats.php                  # 统计信息
├── ranklist.php               # 排行榜
├── topic.php                  # 专题
├── space.php                  # 个人空间
├── archive.php                # 存档版本
├── redirect.php               # URL跳转
├── ajax.php                   # Ajax处理
└── logging.php                # 登录处理
```

---

## 二、用户认证系统 (UCenter集成)

```
UCenter 用户中心
├── 用户数据
│   ├── uc_members (用户表)
│   ├── uc_memberfields (扩展字段)
│   └── 用户同步机制
├── 认证流程
│   ├── 用户登录
│   │   ├── BBS调用: uc_user_login()
│   │   ├── UCenter验证
│   │   ├── 返回用户信息
│   │   ├── BBS创建session
│   │   └── 同步登录: uc_user_synlogin()
│   ├── 用户注册
│   │   ├── BBS调用: uc_user_register()
│   │   ├── UCenter创建用户
│   │   └── 返回UID
│   ├── 用户登出
│   │   ├── BBS清除session
│   │   └── 同步登出: uc_user_synlogout()
│   └── 用户编辑
│       ├── 修改密码: uc_user_edit()
│       ├── 修改邮箱
│       └── 删除用户: uc_user_delete()
├── 头像系统
│   ├── 上传: uc_avatar() → Flash组件
│   │   ├── camera.swf (Flash上传器)
│   │   └── 裁剪生成3种尺寸
│   ├── 存储: /data/avatar/{dir1}/{dir2}/{dir3}/
│   ├── 显示: discuz_uc_avatar()
│   │   ├── big (200x250)
│   │   ├── middle (120x120)
│   │   └── small (48x48)
│   └── 默认头像: noavatar_*.gif
├── 积分系统
│   ├── extcredits1-8 (8种积分)
│   ├── 积分兑换
│   ├── 积分转账
│   └── 积分策略配置
├── 好友系统
│   ├── 好友添加: uc_friend_add()
│   ├── 好友删除: uc_friend_delete()
│   └── 好友列表: uc_friend_ls()
└── 短消息系统 (UC PM)
    ├── 发送: uc_pm_send()
    ├── 列表: uc_pm_list()
    ├── 查看: uc_pm_view()
    └── 删除: uc_pm_delete()
```

---

## 三、论坛核心功能

```
论坛核心
├── 版块系统 (Forums)
│   ├── 数据表: cdb_forums
│   ├── 版块类型
│   │   ├── group (分类)
│   │   ├── forum (版块)
│   │   └── sub (子版块)
│   ├── 版块权限
│   │   ├── viewperm (查看权限)
│   │   ├── postperm (发帖权限)
│   │   ├── replyperm (回复权限)
│   │   └── getattachperm (下载附件权限)
│   ├── 版块设置
│   │   ├── threadtypes (主题分类)
│   │   ├── threadsorts (主题信息)
│   │   └── modrecommend (版主推荐)
│   └── 版块模板
├── 主题系统 (Threads)
│   ├── 数据表: cdb_threads
│   ├── 主题类型
│   │   ├── 0 = 普通主题
│   │   ├── 1 = 投票主题 (poll)
│   │   ├── 2 = 交易主题 (trade)
│   │   ├── 3 = 悬赏主题 (reward)
│   │   ├── 4 = 活动主题 (activity)
│   │   └── 5 = 辩论主题 (debate)
│   ├── 主题状态
│   │   ├── digest (精华: 1/2/3)
│   │   ├── displayorder (显示顺序)
│   │   ├── closed (关闭)
│   │   ├── price (售价)
│   │   └── special (特殊类型)
│   ├── 主题操作
│   │   ├── 置顶/置顶
│   │   ├── 精华/取消精华
│   │   ├── 关闭/打开
│   │   ├── 移动
│   │   ├── 复制
│   │   ├── 合并
│   │   └── 删除
│   └── 主题附件
│       ├── cdb_attachments
│       ├── 附件类型
│       │   ├── 普通附件
│       │   └── 图片附件
│       └── 附件付费 (attachprice)
├── 帖子系统 (Posts)
│   ├── 数据表: cdb_posts
│   ├── 帖子类型
│   │   ├── first = 1 (首帖/主题内容)
│   │   ├── first = 0 (回复帖)
│   └── 帖子内容
│       ├── message (BBCode内容)
│       ├── usesig (是否使用签名)
│       ├── htmlon (是否允许HTML)
│       └── bbcodeoff (是否禁用BBCode)
├── 投票系统 (Poll)
│   ├── 数据表: cdb_polls
│   ├── 多选项/单选
│   ├── 投票截止时间
│   ├── 投票结果显示
│   └── 投票者记录
├── 交易系统 (Trade)
│   ├── 数据表: cdb_trades
│   ├── 商品信息
│   │   ├── price (价格)
│   │   ├── quality (成色)
│   │   ├── loc (地区)
│   │   └── transport (运输方式)
│   ├── 交易订单
│   └── 交易状态
├── 悬赏系统 (Reward)
│   ├── 数据表: cdb_rewardlog
│   ├── 悬赏金额
│   ├── 最佳答案
│   ├── 退款机制
│   └── 悬赏过期
├── 活动系统 (Activity)
│   ├── 数据表: cdb_activities
│   ├── 活动信息
│   │   ├── starttime (开始时间)
│   │   ├── deadline (报名截止)
│   │   ├── activityplace (地点)
│   │   └── cost (费用)
│   ├── 报名管理
│   └── 活动状态
└── 辩论系统 (Debate)
    ├── 数据表: cdb_debates
    ├── 正方/反方
    ├── 辩论观点
    └── 辩论结束
```

---

## 四、用户组与权限系统

```
用户组系统
├── 用户组类型
│   ├── 系统组 (system='private')
│   │   ├── 管理员 (adminid=1)
│   │   ├── 超级版主 (adminid=2)
│   │   ├── 版主 (adminid=3)
│   │   └── 禁止发言
│   ├── 会员组 (type='member')
│   │   ├── 根据积分自动升级
│   │   ├── creditshigher (升级所需积分下限)
│   │   └── creditslower (升级所需积分上限)
│   └── 特殊组 (type='special')
│       ├── 由管理员添加/移除
│       ├── 可能有费用 (dailyprice)
│       └── 有有效期
├── 权限控制
│   ├── 基础权限
│   │   ├── readaccess (阅读权限)
│   │   ├── allowvisit (允许访问)
│   │   ├── allowpost (允许发帖)
│   │   ├── allowreply (允许回复)
│   │   ├── allowdirectpost (无需审核直接发帖)
│   │   └── allowgetattach (允许下载附件)
│   ├── 高级权限
│   │   ├── allowgetimage (允许查看图片)
│   │   ├── allowsendpm (允许发短消息)
│   │   ├── allowmagics (允许使用道具)
│   │   ├── allowmediacode (允许播放多媒体)
│   │   └── maxprice (最大售价)
│   └── 管理权限
│       ├── alloweditpost (允许编辑帖子)
│       ├── allowdelpost (允许删除帖子)
│       ├── allowstickthread (允许置顶)
│       └── allowmodpost (允许审核)
├── 扩展用户组
│   ├── extgroupids (扩展用户组ID列表)
│   ├── groupterms (用户组有效期)
│   ├── groupexpiry (过期时间)
│   └── 可同时属于多个扩展组
└── 等级系统
    ├── stars (星级)
    ├── grouptitle (组头衔)
    ├── color (颜色)
    └── icon (图标)
```

---

## 五、后台管理系统

```
后台管理系统 (admin/)
├── 入口: admin.php → admin/index.php
├── 左侧导航菜单
│   ├── 首页 (home)
│   │   ├── 系统信息
│   │   ├── 版本信息
│   │   └── 快速导航
│   ├── 设置 (settings)
│   │   ├── 基本设置 (settings.inc.php)
│   │   │   ├── 站点信息
│   │   │   ├── 论坛功能
│   │   │   ├── 搜索优化
│   │   │   └── 时间设置
│   │   ├── 论坛版块 (forums.inc.php)
│   │   │   ├── 添加/编辑版块
│   │   │   ├── 版块权限
│   │   │   ├── 版块合并
│   │   │   └── 版块排序
│   │   ├── 用户组 (groups.inc.php)
│   │   │   ├── 管理员组
│   │   │   ├── 会员组
│   │   │   ├── 特殊组
│   │   │   └── 权限设置
│   │   ├── 积分设置 (credits.inc.php)
│   │   │   ├── 积分策略
│   │   │   ├── 积分公式
│   │   │   ├── 积分转换
│   │   │   └── 积分兑换
│   │   ├── 邮件设置 (email.inc.php)
│   │   ├── 防灌水设置 (secqaacheck)
│   │   └── 优化设置 (optimize.inc.php)
│   ├── 用户 (members)
│   │   ├── 用户管理 (members.inc.php)
│   │   │   ├── 搜索用户
│   │   │   ├── 编辑用户
│   │   │   ├── 删除用户
│   │   │   └── 用户数据清理
│   │   ├── 头志管理 (usergroups.inc.php)
│   │   ├── 管理员管理 (admins.inc.php)
│   │   └── 访问日志 (members.inc.php)
│   ├── 内容 (content)
│   │   ├── 帖子管理 (prune.inc.php)
│   │   │   ├── 搜索帖子
│   │   │   ├── 批量删除
│   │   │   └── 批量移动
│   │   ├── 主题管理 (threads.inc.php)
│   │   │   ├── 审核
│   │   │   ├── 关闭
│   │   │   └── 移动
│   │   ├── 附件管理 (attachments.inc.php)
│   │   │   ├── 附件搜索
│   │   │   ├── 批量删除
│   │   │   └── 附件大小统计
│   │   ├── 交易管理 (trades.inc.php)
│   │   ├── 标签管理 (tags.inc.php)
│   │   └── 评分管理 (ratelog.inc.php)
│   ├── 扩展 (extended)
│   │   ├── 插件 (plugins.inc.php)
│   │   │   ├── 插件列表
│   │   │   ├── 启用/禁用
│   │   │   ├── 插件配置
│   │   │   └── 插件钩子
│   │   ├── 道具 (magics.inc.php)
│   │   │   ├── 道具列表
│   │   │   ├── 道具配置
│   │   │   └── 道具商店
│   │   ├── 勋章 (medals.inc.php)
│   │   │   ├── 勋章列表
│   │   │   ├── 勋章颁发
│   │   │   └── 勋章申请
│   │   ├── 主题分类 (threadtypes.inc.php)
│   │   ├── 主题信息 (threadsorts.inc.php)
│   │   ├── 积分向导 (creditwizard.inc.php)
│   │   ├── JS向导 (jswizard.inc.php)
│   │   └── 广告管理 (adv.inc.php)
│   ├── 界面 (styles)
│   │   ├── 模板管理 (templates.inc.php)
│   │   │   ├── 模板列表
│   │   │   ├── 模板编辑
│   │   │   └── 模板导入/导出
│   │   ├── 样式管理 (styles.inc.php)
│   │   ├── 语言包 (languages.inc.php)
│   │   └── 编辑器 (editors.inc.php)
│   ├── 工具 (tools)
│   │   ├── 系统工具 (tools.inc.php)
│   │   │   ├── 文件校验
│   │   │   ├── 数据库检查
│   │   │   └── 缓存更新
│   │   ├── 数据库 (database.inc.php)
│   │   │   ├── 数据库备份
│   │   │   ├── 数据库恢复
│   │   │   └── SQL运行
│   │   ├── 日志管理 (logs.inc.php)
│   │   │   ├── 系统日志
│   │   │   ├── 管理日志
│   │   │   ├── 用户日志
│   │   │   └── 评分日志
│   │   ├── 通知 (notices.inc.php)
│   │   └── 实时状态 (misc.inc.php)
│   └── 帮助 (faq)
│       └── 帮助文档管理
└── 通用功能
    ├── 分页 (multi)
    ├── 表单验证
    ├── 权限检查 (adminid)
    ├── 操作日志
    └── 缓存更新
```

---

## 六、模板系统

```
模板引擎 (Template Engine)
├── 模板目录结构
│   ├── templates/default/ (默认模板)
│   │   ├── *.htm (模板文件)
│   │   ├── css_*.htm (CSS样式)
│   │   ├── lang.lang.php (语言包)
│   │   └── images/ (图片资源)
│   ├── templates/*/ (其他模板)
│   └── forumdata/templates/ (编译缓存)
├── 模板语法
│   ├── 变量输出
│   │   ├── $variable
│   │   ├── {$array.key}
│   │   └── {constant}
│   ├── 逻辑控制
│   │   <!--{if condition}-->
│   │   <!--{elseif condition}-->
│   │   <!--{else}-->
│   │   <!--{/if}-->
│   │   <!--{loop $array $value}-->
│   │   <!--{loop $array $key $value}-->
│   │   <!--{/loop}-->
│   ├── 模板包含
│   │   <!--{template header}-->
│   │   <!--{subtemplate common/header}-->
│   │   └── <!--{include file.htm}-->
│   ├── 语言变量
│   │   ├── {lang xxx}
│   │   └── {lang forum_xxx}
│   ├── 钩子调用
│   │   <!--{hook/a}-->
│   │   └── <!--{hook/b param}-->
│   ├── PHP代码
│   │   <!--{eval echo 'xxx';}-->
│   │   └── <!--{eval @include('xxx.php');}-->
│   ├── 广告位
│   │   <!--{ad/header}-->
│   │   └── <!--{ad/text}-->
│   └── 自定义标签
│       ├── {echo discuz_uc_avatar($uid)}
│       ├── {eval showstars($stars);}
│       └── {date $timestamp}
├── 模板处理流程
│   ├── 1. 加载模板源文件
│   ├── 2. 模板语法解析
│   ├── 3. 转换为PHP代码
│   ├── 4. 写入编译缓存
│   └── 5. include编译后的PHP文件
├── 模板函数
│   ├── template($file) - 加载模板
│   ├── parse_template($file) - 解析模板
│   ├── checktplrefresh() - 检查模板更新
│   └── templatetype() - 获取模板类型
└── 核心模板文件
    ├── discuz.htm (主框架)
    ├── header.htm (页头)
    ├── footer.htm (页脚)
    ├── forumdisplay.htm (版块列表)
    ├── viewthread.htm (帖子查看)
    ├── post_*.htm (发帖相关)
    ├── memcp_*.htm (用户面板)
    └── css_common.htm (公共样式)
```

---

## 七、插件系统

```
插件系统 (Plugins)
├── 插件注册
│   ├── plugins/pet.inc.php (Pokemon插件)
│   ├── plugins/bank/ (银行插件)
│   ├── plugins/moc/ (移动端插件)
│   └── 插件表: cdb_plugins
├── 插件结构
│   ├── plugin.inc.php (插件声明)
│   ├── setup.inc.php (安装脚本)
│   ├── admin.inc.php (后台设置)
│   └── 插件缓存
│       └── forumdata/cache/plugin_{identifier}.php
├── 钩子系统
│   ├── global (全局钩子)
│   ├── index (首页钩子)
│   ├── viewthread (帖子页钩子)
│   ├── forumdisplay (版块页钩子)
│   └── posting (发帖钩子)
├── Pokemon插件 (核心插件)
│   ├── 数据表 (24张表)
│   │   ├── cdb_mypetdata (宠物数据)
│   │   ├── cdb_zpet_mypet (宠物详细)
│   │   ├── cdb_zpet_pklog (战斗日志)
│   │   ├── cdb_zpet_shop (商店)
│   │   ├── cdb_zpet_item (道具)
│   │   ├── cdb_zpet_skill (技能)
│   │   ├── cdb_zpet_move (招式)
│   │   ├── cdb_zpet_trade (交易)
│   │   └── ... (其他表)
│   ├── 核心功能 (~40个文件)
│   │   ├── petindex.php (首页)
│   │   ├── mypet.php (我的宠物)
│   │   ├── pk.php (战斗)
│   │   ├── petshop.php (商店)
│   │   ├── petbattle.php (PVP战斗)
│   │   ├── petlist.php (宠物列表)
│   │   ├── viewpet.php (查看宠物)
│   │   ├── itemshop.php (道具店)
│   │   ├── itemmarket.php (道具市场)
│   │   ├── weaponshop.php (装备店)
│   │   ├── armfixstore.php (装备修理)
│   │   ├── petother.php (其他操作)
│   │   ├── petorphanage.php (孤儿院)
│   │   ├── pettop.php (排行榜)
│   │   ├── petadmin.php (管理)
│   │   └── ... (其他文件)
│   ├── 游戏机制
│   │   ├── 等级系统: lv($exp) = floor(sqrt(($exp+9)/10))
│   │   ├── 战斗伤害公式
│   │   ├── 属性克制 (18种属性)
│   │   ├── 进化系统
│   │   ├── 技能学习
│   │   └── 装备系统
│   └── 集成点
│       ├── 导航菜单注入
│       ├── 帖子中显示宠物
│       └── 个人面板集成
├── Bank银行插件
│   ├── 数据表
│   │   ├── cdb_bank (账户表)
│   │   └── cdb_banklog (日志表)
│   ├── 功能
│   │   ├── 活期存款 (currentaccrual)
│   │   ├── 定期存款 (fixedaccrual)
│   │   ├── 转账
│   │   └── 利息计算
│   └── 利率系统
│       └── 分档利率
│           ├── 100000以上: 0.5%
│           ├── 10000-100000: 0.3%
│           ├── 1000-10000: 0.2%
│           └── 1000以下: 0.1%
├── MOC移动端插件
│   ├── 检测: is_mobile()
│   ├── 独立模板
│   ├── 简化功能
│   └── 响应式建议: 改用Tailwind
└── 其他扩展
    ├── 道具系统 (Magic)
    ├── 勋章系统 (Medal)
    ├── 家族系统 (Family)
    └── DEX图鉴系统
```

---

## 八、缓存系统

```
缓存系统
├── 缓存类型
│   ├── 数据库缓存 (forumdata/cache/)
│   │   ├── cache_settings.php (系统设置)
│   │   ├── cache_usergroups.php (用户组)
│   │   ├── cache_forumattachperm.php (附件权限)
│   │   └── cache_*.php (其他缓存)
│   ├── 模板缓存 (forumdata/templates/)
│   │   └── 1_*.tpl.php (编译后的模板)
│   ├── 用户组缓存
│   │   └── usergroup_*.php
│   └── 插件缓存
│       └── plugin_*.php
├── 缓存函数
│   ├── updatecache() - 更新所有缓存
│   ├── updatesession() - 更新会话
│   ├── updatemodworks() - 更新版主工作
│   └── getcache() - 获取缓存
└── 缓存更新时机
    ├── 后台保存设置时
    ├── 版块/用户组修改后
    ├── 插件启用/禁用时
    └── 手动更新
```

---

## 九、数据库结构

```
数据库 (cdb_ 前缀)
├── 用户相关 (110+张表)
│   ├── cdb_members (用户基础)
│   ├── cdb_memberfields (用户扩展)
│   ├── cdb_usergroups (用户组)
│   ├── cdb_admingroups (管理员组)
│   └── cdb_validating (待审核用户)
├── 论坛核心
│   ├── cdb_forums (版块)
│   ├── cdb_threads (主题)
│   ├── cdb_posts (帖子)
│   ├── cdb_attachments (附件)
│   ├── cdb_attachmentfields (附件扩展)
│   └── cdb_forums (版块设置)
├── 特殊主题
│   ├── cdb_polls (投票)
│   ├── cdb_polloptions (投票选项)
│   ├── cdb_trades (交易)
│   ├── cdb_activities (活动)
│   ├── cdb_activityapplies (活动报名)
│   ├── cdb_debates (辩论)
│   └── cdb_rewardlog (悬赏)
├── 积分系统
│   ├── cdb_creditslog (积分日志)
│   ├── cdb_paymentlog (付费日志)
│   └── cdb_orders (订单)
├── 管理相关
│   ├── cdb_adminsessions (管理员会话)
│   ├── cdb_modworks (版主工作)
│   ├── cdb_ratelog (评分日志)
│   ├── cdb_banlogs (封禁日志)
│   ├── cdb_illegallog (违规日志)
│   └── cdb_warns (警告)
├── 消息系统
│   ├── cdb_pms (短消息)
│   └── cdb_pmfolders (文件夹)
├── 插件数据 (24+张表)
│   ├── Pokemon系统 (24张)
│   ├── Bank系统 (2张)
│   └── 其他插件
├── 系统设置
│   ├── cdb_settings (全局设置)
│   ├── cdb_styles (模板风格)
│   ├── cdb_templates (模板)
│   ├── cdb_plugins (插件)
│   ├── cdb_advertisements (广告)
│   └── cdb_announcements (公告)
└── 其他
    ├── cdb_tags (标签)
    ├── cdb_threadsmod (主题管理日志)
    ├── cdb_favorites (收藏)
    ├── cdb_subscriptions (订阅)
    └── cdb_searchindex (搜索索引)
```

---

## 十、安全机制

```
安全机制
├── 防注入
│   ├── daddslashes() - 转义特殊字符
│   ├── 魔术引号 (MAGIC_QUOTES_GPC)
│   └── SQL参数化
├── 防XSS
│   ├── dhtmlspecialchars() - HTML转义
│   ├── HTML标签过滤
│   └── BBCode限制
├── 验证码
│   ├── seccode (图片验证码)
│   ├── secqaa (问答验证)
│   └── 注册/发帖验证
├── 防灌水
│   ├── 发帖间隔限制
│   ├── 新手审核
│   ├── IP频率限制
│   └── 敏感词过滤 (censor)
├── 权限验证
│   ├── forumperm() (版块权限)
│   ├── 群组权限检查
│   ├── 管理员权限 (adminid)
│   └── IP白名单
├── 会话安全
│   ├── authcode加密
│   ├── sid验证
│   ├── 登录IP记录
│   └── 异地登录检测
└── 文件上传安全
    ├── 文件类型检查
    ├── 文件大小限制
    ├── 文件名处理
    └── 存储目录隔离
```

---

## 十一、核心包含文件系统

```
include/ 目录
├── common.inc.php - 核心初始化
│   ├── 常量定义 (CURSCRIPT, IN_DISCUZ)
│   ├── 加载配置 (config.php)
│   ├── 数据库连接 ($db)
│   ├── 缓存加载 ($_DCACHE)
│   ├── 用户认证 ($discuz_uid)
│   ├── 会话处理 ($sid)
│   └── 全局变量初始化
├── global.func.php - 全局函数库
│   ├── discuz_uc_avatar() - 头像
│   ├── authcode() - 加密解密
│   ├── daddslashes() - 转义
│   ├── dhtmlspecialchars() - HTML转义
│   ├── multi() - 分页
│   ├── showmessage() - 提示信息
│   ├── sendpm() - 发短消息
│   ├── updatemodworks() - 更新版主工作
│   └── ... (200+个函数)
├── template.func.php - 模板函数
│   ├── template() - 加载模板
│   ├── parse_template() - 解析模板
│   ├── checktplrefresh() - 检查更新
│   └── 模板语法处理
├── misc.func.php - 杂项函数
│   ├── convertip() - IP转地址
│   ├── random() - 随机数
│   ├──submitcheck() - 表单验证
│   └── proctemp() - 临时数据处理
├── discuzcode.func.php - BBCode解析
│   ├── discuzcode() - BBCode转HTML
│   ├── cutstr() - 字符串截断
│   ├── bbcode2html() - BBCode转换
│   ├── parseurl() - URL解析
│   ├── parsetrubbish() - 垃圾过滤
│   └── smiley处理
├── editor.func.php - 编辑器函数
│   ├── html2bbcode() - HTML转BBCode
│   ├── bbcode2html() - BBCode转HTML
│   └── 编辑器工具栏
├── cache.func.php - 缓存函数
│   ├── updatecache() - 更新缓存
│   ├── getcache() - 获取缓存
│   ├── arrayeval() - 数组转PHP
│   └── 缓存文件写入
├── post.func.php - 发帖函数
│   ├── newthread() - 新主题
│   ├── newreply() - 新回复
│   ├── editpost() - 编辑帖子
│   └── 帖子验证处理
├── forum.func.php - 论坛函数
│   ├── forum() - 获取版块信息
│   ├── forumperm() - 版块权限
│   ├── formulaperm() - 公式权限
│   └── 版块树形结构
├── request.func.php - 请求处理
│   ├── parse_bbcode_url() - BBCode URL解析
│   ├── 各类UBB代码处理
│   └── 表情代码处理
└── 其他
    ├── mail.func.php - 邮件函数
    ├── space.func.php - 个人空间
    ├── trade.func.php - 交易函数
    ├── pm.func.php - 短消息
    └── ajax.inc.php - Ajax处理
```

---

## 系统间交互流程

```
完整请求流程
├── 用户访问
│   ├── 1. 浏览器请求 → index.php
│   ├── 2. 加载 common.inc.php
│   │   ├── 连接数据库
│   │   ├── 加载缓存
│   │   ├── 验证用户 (UCenter)
│   │   └── 初始化环境
│   ├── 3. 执行业务逻辑
│   │   ├── 查询数据库
│   │   ├── 处理数据
│   │   └── 权限检查
│   ├── 4. 加载模板
│   │   ├── template('xxx')
│   │   ├── 解析模板语法
│   │   ├── 编译为PHP
│   │   └── 执行编译后的PHP
│   └── 5. 输出HTML
├── UCenter交互
│   ├── 用户登录 → uc_user_login() → UCenter API
│   ├── 用户注册 → uc_user_register() → UCenter API
│   ├── 同步登录 → uc_user_synlogin() → 所有应用
│   ├── 头像上传 → uc_avatar() → Flash → UCenter
│   └── 短消息 → uc_pm_*() → UCenter PM
├── 缓存机制
│   ├── 首次访问 → 生成缓存文件
│   ├── 后续访问 → 直接读取缓存
│   ├── 数据更新 → 自动刷新缓存
│   └── 手动更新 → 后台操作
└── 插件系统
    ├── 钩子触发 → 执行插件代码
    ├── 插件缓存 → $_DPLUGIN
    └── 插件配置 → 后台设置
```

---

## 总结：系统特点

1. **UCenter强依赖**: 用户、头像、短消息、好友都依赖UCenter
2. **模板编译**: 自定义模板引擎，编译后为PHP执行
3. **插件系统**: 钩子机制，可扩展性强
4. **分层缓存**: 数据库缓存、模板缓存分离
5. **权限复杂**: 用户组+版块权限+操作权限多层控制
6. **特殊主题**: 6种特殊主题类型
7. **积分系统**: 8种扩展积分，可互相转换
8. **管理后台**: 功能完整，分模块管理
