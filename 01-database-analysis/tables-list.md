# 数据库表清单

## 数据库文件

| 文件名 | 大小 | 说明 |
|--------|------|------|
| poketb_new.sql | 42MB | 新数据库dump |
| poketb_new_schema.sql | 54KB | 新数据库表结构 |
| poketb_ptb.sql | 191MB | 完整数据库dump（含Pokemon数据） |
| poketb_ptb_schema.sql | 161KB | 完整数据库表结构 |

## 表前缀规则

- `cdb_` - Discuz! 核心表
- `ptbbbs_` - BBS相关表
- `ptbnew_` - WordPress相关表
- `ptbnew_mf_` - Metabox Framework表
- `uc_` - UCenter相关表（无前缀）
- `cdb_zpet*` / `cdb_zpet*` - Pokemon插件表

---

## 按分类整理的表清单

### 1. Discuz! 核心表 (cdb_)

#### 论坛核心
| 表名 | 说明 |
|------|------|
| cdb_forums | 论坛版块 |
| cdb_threads | 主题 |
| cdb_posts | 帖子 |
| cdb_attachments | 附件 |
| cdb_forumfields | 版块扩展字段 |
| cdb_pms | 私信 |
| cdb_buddys | 好友 |
| cdb_favorites | 收藏 |

#### 用户管理
| 表名 | 说明 |
|------|------|
| cdb_members | 会员基础信息 |
| cdb_memberfields | 会员扩展字段 |
| cdb_banned | 被禁用户 |
| cdb_validating | 待验证用户 |

#### 用户组与权限
| 表名 | 说明 |
|------|------|
| cdb_usergroups | 用户组 |
| cdb_admingroups | 管理员组 |
| cdb_moderators | 版主关系 |
| cdb_access | 访问权限 |

#### 内容管理
| 表名 | 说明 |
|------|------|
| cdb_profilefields | 个人资料字段 |
| cdb_bbcodes | BB代码 |
| cdb_smilies | 表情 |
| cdb_styles | 样式 |
| cdb_templates | 模板 |

#### 系统设置
| 表名 | 说明 |
|------|------|
| cdb_settings | 系统设置 |
| cdb_plugins | 插件 |
| cdb_pluginvars | 插件变量 |
| cdb_crons | 定时任务 |

#### 积分与道具
| 表名 | 说明 |
|------|------|
| cdb_credits | 积分规则 |
| cdb_magics | 道具/魔法 |
| cdb_magicmarket | 道具市场 |
| cdb_medals | 勋章 |
| cdb_usergroups | 用户组积分设置 |

#### 统计与日志
| 表名 | 说明 |
|------|------|
| cdb_stats | 统计数据 |
| cdb_adminactions | 管理员操作日志 |
| cdb_modworks | 版主操作日志 |
| cdb_illegal | 违规日志 |

---

### 2. Pokemon游戏系统表 (cdb_zpet*)

| 表名 | 说明 |
|------|------|
| cdb_zpetdex | 宝可梦图鉴（基础数据） |
| cdb_zpetdexab | 宝可梦能力/技能 |
| cdb_zpetdexevo | 宝可梦进化链 |
| cdb_zpetdexhtm | 宝可梦招式 |
| cdb_zpetdexii | 宝可梦II代数据 |
| cdb_zpetdexmove | 宝可梦移动/位置 |
| cdb_zpetfruitdex | 水果/树果图鉴 |
| cdb_zpetfruitmap | 水果地图分布 |
| cdb_zpetgym | 道馆系统 |
| cdb_zpetlog | 游戏日志 |
| cdb_zpetmappm | 地图PM分布 |
| cdb_zpetmarket | 玩家市场 |
| cdb_zpetmypet | 用户拥有的宠物 |
| cdb_zpetshop | 商店系统 |
| cdb_zpetsms | 游戏内短信 |
| cdb_zpetsx | 属性相克系统 |
| cdb_zpetuni | 联盟系统 |
| cdb_zpetuserchestnut | 用户栗子/货币 |
| cdb_zpetuserdex | 用户图鉴进度 |
| cdb_zpetuserfruit | 用户水果库存 |
| cdb_zpetuseritem | 用户物品 |
| cdb_zpetweight | 重量/负重系统 |
| cdb_zpoketb | Pokemon TB 主数据 |
| cdb_zpoketbii | Pokemon TB II 数据 |
| cdb_zrandomteam | 随机队伍 |

**Pokemon系统表数量：24张**

---

### 3. WordPress集成表 (ptbnew_)

| 表名 | 说明 |
|------|------|
| ptbnew_posts | 文章/页面 |
| ptbnew_postmeta | 文章元数据 |
| ptbnew_comments | 评论 |
| ptbnew_terms | 分类/标签 |
| ptbnew_term_relationships | 文章-分类关系 |
| ptbnew_term_taxonomy | 分类法 |
| ptbnew_termmeta | 分类元数据 |
| ptbnew_users | WordPress用户 |
| ptbnew_usermeta | WordPress用户元 |
| ptbnew_options | WordPress设置 |
| ptbnew_links | 友情链接 |

---

### 4. Metabox Framework表 (ptbnew_mf_)

| 表名 | 说明 |
|------|------|
| ptbnew_mf_custom_field_options | 自定义字段选项 |
| ptbnew_mf_custom_field_properties | 自定义字段属性 |
| ptbnew_mf_module_groups | 模块组 |
| ptbnew_mf_panel_category | 面板分类 |
| ptbnew_mf_panel_custom_field | 面板自定义字段 |
| ptbnew_mf_panel_standard_field | 面板标准字段 |
| ptbnew_mf_post_meta | 文章元数据 |
| ptbnew_mf_posttypes_taxonomies | 文章类型分类法 |
| ptbnew_mf_write_panels | 编辑面板 |

---

### 5. BBS相关表 (ptbbbs_)

| 表名 | 说明 |
|------|------|
| ptbbbs_forums | BBS版块 |
| ptbbbs_topics | BBS主题 |
| ptbbbs_posts | BBS帖子 |
| ptbbbs_users | BBS用户 |
| ptbbbs_usermeta | BBS用户元 |
| ptbbbb_bbwp_ids | 博客帖子ID映射 |

---

### 6. UCenter表 (uc_)

| 表名 | 说明 |
|------|------|
| uc_members | UCenter统一用户 |
| uc_admins | UCenter管理员 |
| uc_applications | 应用注册 |
| uc_creditsettings | 积分设置 |
| uc_feeds | 动态/活动流 |
| uc_friends | 好友关系 |
| uc_mailqueue | 邮件队列 |
| uc_pms | 短消息索引 |
| uc_pm_lists | 短消息列表 |
| uc_pm_members | 短消息成员关系 |
| uc_protectedmembers | 受保护用户 |
| uc_settings | UCenter设置 |
| uc_sqlcache | SQL缓存 |
| uc_tags | 标签 |
| uc_domain_whitelist | 域名白名单 |
| uc_badwords | 敏感词 |
| uc_visitors | 访客记录 |

---

## 统计

| 分类 | 表数量 |
|------|--------|
| Discuz! 核心表 | ~40 |
| Pokemon 系统 | 24 |
| WordPress | ~15 |
| Metabox Framework | 9 |
| BBS | 6 |
| UCenter | ~16 |
| **总计** | **~110** |

---

## 核心数据关系

```
用户系统:
uc_members (统一用户)
├── cdb_members (Discuz!用户)
├── ptbbbs_users (BBS用户)
└── ptbnew_users (WordPress用户)

内容系统:
cdb_forums (版块)
├── cdb_threads (主题)
│   ├── cdb_posts (帖子)
│   └── cdb_attachments (附件)
└── cdb_moderators (版主)

Pokemon系统:
cdb_zpetdex (图鉴数据)
├── cdb_zpetmypet (用户宠物)
├── cdb_zpetuserdex (图鉴进度)
├── cdb_zpetshop (商店)
├── cdb_zpetmarket (玩家市场)
└── cdb_zpetgym (道馆)
```
