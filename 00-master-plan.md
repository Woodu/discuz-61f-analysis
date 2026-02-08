# Discuz! 6.1F 完整重构规划

## 项目信息

- **原项目路径**: `D:\Dev\poketb.com`
- **规划文档路径**: `D:\Dev\bbs-migration-docs`
- **分析时间**: 2026-02-04

---

## ✅ 技术栈已确认！

### 后端
- **框架**: Koa 2.x
- **ORM**: Prisma 5.x
- **语言**: TypeScript 5.x
- **认证**: JWT
- **缓存**: Redis 7.x
- **WebSocket**: Socket.io 4.x

### 前端
- **框架**: React 18.x
- **状态管理**: Zustand 4.x
- **UI组件**: shadcn/ui
- **样式**: Tailwind CSS 3.x
- **数据请求**: TanStack Query 5.x
- **路由**: React Router 6.x

### 开发工具
- **构建**: Vite 5.x
- **包管理**: pnpm 8.x
- **代码规范**: ESLint + Prettier
- **文档**: VitePress

---

## 任务进度

| 阶段 | 状态 | 进度 |
|------|------|------|
| 1. 项目分析 | ✅ 完成 | 12/12 任务 |
| 2. 技术选型 | ✅ 完成 | 技术栈已确认 |
| 2.1. Admin深入分析 | ✅ 完成 | 40/40 文件 (100%) |
| 2.2. Forum核心深入分析 | ✅ 完成 | 12个核心文件 |
| 2.3. Template模板深入分析 | ✅ 完成 | 6个深度分析文件 ✨ |
| 2.4. Plugins插件深入分析 | ✅ 完成 | 5个深度分析文件 ✨ |
| 3. 数据模型设计 | ✅ 完成 | Prisma Schema + 分表策略 ✨ |
| 4. API设计 | ✅ 完成 | 69 RESTful + 15 WebSocket ✨ |
| 5. 前端架构设计 | ✅ 完成 | React + Vite + Zustand + 12大组件系统 ✨ |
| 6. 安全策略设计 | ✅ 完成 | 全栈安全防护方案 ✨ |
| 7. 测试用例规划 | ✅ 完成 | 540+ 测试用例 ✨ |
| 8. 阶段化实施计划 | ✅ 完成 | 7阶段 + Review机制 ✨ |
| 9. 项目实施 | ⏳ 进行中 | 0/7 阶段 |
| 10. 实施代码目录 | ✅ 完成 | 基础配置文件已初始化 ✨ |

---

## 分析文档清单

### 00-规划与追踪 (3个)
- `00-master-plan.md` - 主规划（本文件）
- `00-file-inventory.md` - 完整文件清单
- `08-design/01-tech-stack.md` - 技术栈确认 ✨

### 01-database-analysis/ (1个)
- `tables-list.md` - 110+张数据表

### 02-bbs-core/ (24个)
- `entry-points.md` - 核心入口
- `admin-system.md` - 后台管理（概要）
- `admin-deep-dive/group-01-framework.md` - 深入分析：框架和核心 ✨
- `admin-deep-dive/group-02-content-maintenance.md` - 深入分析：内容和维护 ✨
- `admin-deep-dive/group-03-extensions-summary.md` - 深入分析：扩展功能总览 ✨
- `admin-deep-dive/group-03-plugins-extended.md` - 插件系统深入 ✨
- `admin-deep-dive/group-03-extended-misc.md` - 道具/勋章/风格等 ✨
- `admin-deep-dive/group-03-threadtypes-extended.md` - 主题类型深入 ✨
- `admin-deep-dive/group-03-wizards-extended.md` - 积分/JS向导深入 ✨
- `admin-deep-dive/group-04-database-logs-tools.md` - 深入分析：数据库和工具 ✨
- `forum-deep-dive/00-summary.md` - 论坛核心深入分析总览 ✨
- `forum-deep-dive/forumdisplay-extended.md` - 版块列表深入 ✨
- `forum-deep-dive/viewthread-extended.md` - 主题查看深入 ✨
- `forum-deep-dive/post-extended.md` - 发帖回复深入 ✨
- `forum-deep-dive/member-logging-extended.md` - 用户登录深入 ✨
- `forum-deep-dive/pm-search-extended.md` - 短消息搜索深入 ✨
- `forum-deep-dive/misc-extended.md` - 杂项功能深入 ✨
- `forum-deep-dive/include-extended.md` - 核心库深入 ✨
- `modcp-system.md` - 版主管理
- `permission-system.md` - 权限系统
- `api-analysis.md` - API接口
- `wap-analysis.md` - WAP版本
- `bbcode-editor.md` - BBCode和编辑器分析 ✨
- `remaining-files.md` - 剩余PHP文件

### 03-include-deep-dive/ (3个)
- `core-init-global.md` - 核心初始化和全局函数 ✨
- `db-cache-template.md` - 数据库、缓存和模板 ✨
- `special-features.md` - 特殊功能和工具类 ✨

### 04-templates-deep-dive/ (6个) 🆕
- `00-summary.md` - 模板系统深入分析总览 ✨
- `template-engine-syntax.md` - 模板引擎和语法深入分析 ✨
- `core-pages-analysis.md` - 核心页面模板深入分析 ✨
- `user-pm-templates.md` - 用户和短消息模板深入分析 ✨
- `special-features-templates.md` - 特殊功能模板深入分析 ✨
- `language-themes-styles.md` - 语言包、主题和样式深入分析 ✨

### 05-templates/ (1个)
- `template-structure.md` - 模板系统（概要）

### 06-plugins/ (7个)
- `pokemon-system.md` - Pokemon系统
- `bank-system.md` - 银行系统
- `magic-system.md` - 道具系统
- `medal-system.md` - 勋章系统
- `dex-system.md` - DEX系统
- `family-system.md` - 家族系统
- `other-extensions.md` - 其他扩展

---
- `pokemon-system.md` - Pokemon系统
- `bank-system.md` - 银行系统
- `magic-system.md` - 道具系统
- `medal-system.md` - 勋章系统
- `dex-system.md` - DEX系统
- `family-system.md` - 家族系统
- `other-extensions.md` - 其他扩展

---

## 下一步计划

### 数据模型设计 (Prisma Schema)

需要设计的核心模型：

1. **用户系统**
   - User (用户)
   - UserGroup (用户组)
   - AdminGroup (管理员组)
   - Session (会话)

2. **论坛核心**
   - Forum (版块)
   - Thread (主题)
   - Post (帖子)
   - Attachment (附件)

3. **Pokemon系统**
   - PokemonSpecies (宠物种类)
   - UserPokemon (用户宠物)
   - PokemonMove (招式)
   - PokemonMarket (市场)
   - PokemonShop (商店)

4. **扩展功能**
   - BankAccount (银行账户)
   - Item (道具)
   - UserItem (用户道具)
   - Medal (勋章)
   - Family (家族)

5. **内容管理**
   - Announcement (公告)
   - Report (举报)
   - Log (日志)

---

## 目录结构

```
bbs-migration-docs/
├── 00-*.md                   # 规划文件
├── 01-database-analysis/     # 数据库分析
├── 02-bbs-core/              # 核心分析
├── 03-include-library/       # 库分析
├── 04-templates/             # 模板分析
├── 05-ucenter/               # UCenter分析
├── 06-plugins/               # 插件分析
├── 07-context/               # 上下文
├── 08-design/                # 设计文档
├── 09-plugins-deep-dive/      # 插件深入分析 🆕
│   ├── 01-tech-stack.md      # ✅ 技术栈
│   ├── 02-ucenter-replacement.md # ✅ UCenter替换方案
│   ├── 03-auth-design.md     # ✅ 认证系统设计 ✨
│   ├── 04-data-model.md      # ⏳ 数据模型
│   └── 05-api-design.md      # ⏳ API设计
├── 09-implementation/        # 实施计划
└── 10-migration/             # 迁移脚本
```
