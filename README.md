# Discuz! 6.1F 迁移重构文档

## 项目概述

本文档记录了 Discuz! 6.1F 论坛系统的完整分析，为现代化重构提供详细的技术参考。

## 原项目信息

- **原系统**: Discuz! 6.1F
- **原项目路径**: `D:\Dev\poketb.com`
- **分析时间**: 2026-02-04 ~ 2026-02-05
- **分析范围**: 全系统代码 + 插件 + 数据库

## 文档结构

```
├── 00-*.md                      # 规划文件
│   ├── 00-master-plan.md        # 主规划文档
│   ├── 00-file-inventory.md     # 完整文件清单
│   └── 00-system-architecture-map.md  # 系统架构图
│
├── 01-database-analysis/        # 数据库分析
│   └── tables-list.md           # 110+张数据表清单
│
├── 02-bbs-core/                 # 核心分析
│   ├── entry-points.md          # 核心入口
│   ├── admin-system.md          # 后台管理
│   ├── admin-deep-dive/         # 后台深入分析
│   ├── forum-deep-dive/         # 论坛核心深入分析
│   ├── modcp-system.md          # 版主管理
│   ├── permission-system.md     # 权限系统
│   └── ...
│
├── 03-include-deep-dive/        # 核心库深入分析
│   ├── core-init-global.md      # 初始化和全局函数
│   ├── db-cache-template.md     # 数据库/缓存/模板
│   └── special-features.md      # 特殊功能
│
├── 04-templates-deep-dive/      # 模板系统深入分析
│   ├── 00-summary.md            # 总览
│   ├── template-engine-syntax.md # 模板引擎和语法
│   ├── core-pages-analysis.md   # 核心页面
│   ├── user-pm-templates.md     # 用户和短消息
│   ├── special-features-templates.md # 特殊功能
│   └── language-themes-styles.md # 语言包和样式
│
├── 06-plugins/                  # 插件概览
│   ├── pokemon-system.md        # Pokemon系统
│   ├── bank-system.md           # 银行系统
│   └── ...
│
├── 08-design/                   # 设计文档
│   ├── 01-tech-stack.md         # 技术栈确认 ✅
│   ├── 02-ucenter-replacement.md # UCenter替换方案 ✅
│   ├── 03-auth-design.md        # 认证系统设计 ✅
│   ├── 04-theme-design.md       # Poketb主题复刻 ✅ ✨
│   ├── 05-data-model.md         # 数据模型设计 ✅ ✨
│   ├── 06-api-design.md         # API设计 ✅ ✨
│   └── 07-security-design.md    # 安全策略设计 ✅ ✨
│
├── 10-tests/                    # 测试用例规划 ✅
│   ├── README.md                # 测试规划总览 ✅ ✨
│   ├── 01-backend-tests.md      # 后端测试用例 (141个) ✅ ✨
│   └── 02-frontend-tests.md     # 前端测试用例 (395个) ✅ ✨
│
├── 11-implementation/           # 实施计划 ✅
│   └── 01-phases-review.md      # 阶段化实施与Review ✅ ✨
│
├── 12-implementation/           # 实施代码目录 ✅
│   ├── backend/                # 后端项目 (Koa + TS + Prisma)
│   ├── frontend/               # 前端项目 (React + Vite + TS)
│   ├── docker-compose.yml      # Docker 开发环境
│   └── README.md               # 实施代码说明
│
├── 08-design/                   # 设计文档
│
└── 09-plugins-deep-dive/        # 插件深入分析
    ├── 00-summary.md            # 插件总览
    ├── pokemon-system-deep.md   # Pokemon深度 (40+文件, 24表)
    ├── bank-system-deep.md      # 银行深度
    ├── moc-system-deep.md       # 移动端深度
    ├── plugin-architecture.md   # 插件架构
    └── avatar-system-deep.md    # 头像系统
```

## 技术栈确认

### 后端
- **框架**: Koa 2.x
- **ORM**: Prisma 5.x
- **语言**: TypeScript 5.x
- **认证**: JWT (替代UCenter)
- **缓存**: Redis 7.x
- **WebSocket**: Socket.io 4.x

### 前端
- **框架**: React 18.x
- **状态管理**: Zustand 4.x
- **UI组件**: shadcn/ui
- **样式**: Tailwind CSS 3.x
- **数据请求**: TanStack Query 5.x
- **路由**: React Router 6.x

## 分析进度

| 阶段 | 状态 | 进度 |
|------|------|------|
| 1. 项目分析 | ✅ 完成 | 12/12 任务 |
| 2. 技术选型 | ✅ 完成 | 技术栈已确认 |
| 2.1. Admin深入分析 | ✅ 完成 | 40/40 文件 (100%) |
| 2.2. Forum核心深入分析 | ✅ 完成 | 12个核心文件 |
| 2.3. Template模板深入分析 | ✅ 完成 | 6个深度分析文件 |
| 2.4. Plugins插件深入分析 | ✅ 完成 | 5个深度分析文件 |
| 5. 认证设计 | ✅ 完成 | JWT认证系统 |
| 6. 主题复刻设计 | ✅ 完成 | Poketb主题复刻 |
| 3. 数据模型设计 | ✅ 完成 | Prisma Schema + 分表策略 |
| 8. 前端架构设计 | ✅ 完成 | React + Vite + Zustand + 12大组件系统 ✨ |
| 4. API设计 | ✅ 完成 | 69 RESTful + 15 WebSocket ✨ |
| 10. 安全策略设计 | ✅ 完成 | 全栈安全防护方案 ✨ |
| 11. 测试用例规划 | ✅ 完成 | 540+ 测试用例 ✨ |
| 12. 阶段化实施计划 | ✅ 完成 | 7阶段 + Review机制 ✨ |
| 13. 项目实施 | ⏳ 待开始 | 0/7 阶段 |

## 核心系统架构

```
Discuz! 6.1F
├── 前端展示层 (模板系统 + WAP)
├── 后端处理层 (入口 + 业务逻辑)
├── UCenter集成 (用户/头像/短消息)
├── 插件系统 (Pokemon/Bank/MOC等)
└── 缓存系统 (110+张数据表)
```

## 关键发现

1. **UCenter强依赖**: 用户、头像、短消息都依赖UCenter
2. **复杂插件系统**: Pokemon系统就有24张表、40+文件
3. **自定义模板引擎**: 编译后为PHP执行
4. **110+张数据表**: 包含完整的论坛/游戏/经济系统

## 下一步

1. API设计 (RESTful + WebSocket)
2. 项目脚手架搭建

## 许可

本文档仅供技术参考使用。
