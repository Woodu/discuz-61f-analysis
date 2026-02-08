# Poketb Default 主题复刻设计

> **目标**: 基于 React + Tailwind CSS 复刻 poketb-default 样式
>
> **设计时间**: 2026-02-07

---

## 1. 原始样式分析

### 1.1 整体布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  #header                                                     │
│  ├─ h2.logo (左侧Logo)                                        │
│  └─ #ad_headerbanner (右侧广告位)                             │
├─────────────────────────────────────────────────────────────┤
│  #menu (导航栏 - 31px高)                                       │
│  ├─ .frameswitch (左侧切换)                                   │
│  ├─ .avataonline (用户信息区)                                 │
│  └─ ul.nav (右侧菜单)                                         │
├─────────────────────────────────────────────────────────────┤
│  #foruminfo (面包屑 + 用户状态 + 统计)                          │
│  ├─ #userinfo (左侧)                                          │
│  └─ #forumstats (右侧统计)                                    │
├─────────────────────────────────────────────────────────────┤
│  #announcement (公告滚动区 - 36px高)                           │
├─────────────────────────────────────────────────────────────┤
│  .mainbox.forumlist (版块列表)                                 │
│  ├─ span.headactions (管理操作)                               │
│  ├─ h3.category (分类标题)                                     │
│  └─ table.forum-table                                         │
│     ├─ thead.category (表头)                                  │
│     └─ tbody (版块行)                                         │
├─────────────────────────────────────────────────────────────┤
│  .box (友情链接 + 在线用户)                                     │
├─────────────────────────────────────────────────────────────┤
│  #footer                                                      │
│  └─ #copyright (版权信息)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 颜色变量 (原始 Discuz 模板变量)

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `{TABLEBG}` | #FFF | 表格/盒子背景 |
| `{BORDERCOLOR}` | #DDEEEE | 边框颜色 |
| `{HEADERTEXT}` | #FFF | 标题文字颜色 |
| `{CATBORDER}` | #BDD8E8 | 分类边框 |
| `{CATCOLOR}` | #DDEEF7 | 分类背景色 |
| `{TABLETEXT}` | #333333 | 表格文字 |
| `{LINK}` | #0954A6 | 链接颜色 |
| `{HIGHLIGHTLINK}` | #FF6600 | 高亮链接 (橙色) |
| `{NOTICETEXT}` | #FF6600 | 通知文字 (橙色) |
| `{TEXT}` | #333333 | 普通文字 |
| `{LIGHTTEXT}` | #666666 | 浅色文字 |
| `{ALTBG1}` | #F7F7F7 | 交替背景1 |
| `{ALTBG2}` | #FFFFFF | 交替背景2 |
| `{BGBORDER}` | #DDEEEE | 背景边框 |
| `{MAINTABLEWIDTH}` | 1000px | 主容器宽度 |

### 1.3 字体系统

```css
/* 原始字体 */
font-family: Microsoft YaHei, Comic Sans MS, Tahoma, Helvetica, Arial, sans-serif;
font-size: 12px/1.6em;
```

---

## 2. Tailwind CSS 配置

### 2.1 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      // 容器宽度 (复刻原版 1000px)
      container: {
        center: true,
        padding: '0',
        screens: {
          'xl': '1000px',
        },
      },

      // 颜色系统 - 复刻原版
      colors: {
        // 主背景色
        bg: {
          white: '#FFFFFF',
          alt1: '#F7F7F7',
          alt2: '#FFFFFF',
          table: '#FFFFFF',
        },

        // 边框色
        border: {
          DEFAULT: '#DDEEEE',
          light: '#E8F3F8',
          cat: '#BDD8E8',
        },

        // 分类/标题色
        cat: {
          bg: '#DDEEF7',
          border: '#BDD8E8',
          text: '#333333',
        },

        // 文字色
        text: {
          DEFAULT: '#333333',
          light: '#666666',
          header: '#FFFFFF',
          table: '#333333',
        },

        // 链接色
        link: {
          DEFAULT: '#0954A6',
          hover: '#FF6600',
          highlight: '#FF6600',
        },

        // 通知/强调色
        notice: {
          bg: '#FFF8C5',
          border: '#FDB939',
          text: '#FF6600',
        },

        // 按钮色
        btn: {
          primary: '#DDEEF7',
          primaryHover: '#C8E0EF',
          submit: '#FFF8C5',
          submitBorder: '#FDB939',
        },
      },

      // 字体家族
      fontFamily: {
        sans: [
          'Microsoft YaHei',
          'Comic Sans MS',
          'Tahoma',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },

      // 字体大小 (基准 12px)
      fontSize: {
        'xs': ['11px', '1.5'],
        'sm': ['12px', '1.6'],
        'base': ['12px', '1.6'],
        'lg': ['14px', '1.6'],
      },

      // 间距系统 (复刻原版 5px 基准)
      spacing: {
        '0.5': '2px',
        '1': '5px',
        '2': '10px',
        '3': '15px',
        '4': '20px',
        '5': '25px',
        '6': '30px',
        '8': '40px',
        '10': '50px',
        '12': '60px',
      },

      // 圆角
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '3px',
      },

      // 阴影 (复刻原版边框效果)
      boxShadow: {
        'border': '0 1px 0 #DDEEEE',
        'border-light': '0 1px 0 #E8F3F8',
        'cat': '0 1px 0 #BDD8E8',
      },

      // 线性渐变 (复刻原版 header 背景)
      backgroundImage: {
        'header-gradient': 'linear-gradient(180deg, #7AC4EA 0%, #5BA7D1 100%)',
        'cat-gradient': 'linear-gradient(180deg, #F7FAFD 0%, #EFF2F5 100%)',
        'button-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F0F5F9 100%)',
      },

      // 高度
      minHeight: {
        'header': '40px',
        'menu': '31px',
        'announcement': '36px',
        'forum-row': '40px',
      },

      // Z-index 层级
      zIndex: {
        'dropdown': 100,
        'sticky': 50,
        'header': 40,
      },
    },
  },
  plugins: [
    // 可添加自定义插件
  ],
};
```

### 2.2 全局样式 (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==================== 基础样式复刻 ==================== */

/* 重置样式 - 匹配原版 */
@layer base {
  * {
    word-wrap: break-word;
  }

  body {
    @apply text-text-base font-sans text-sm leading-relaxed text-center bg-bg-white;
  }

  /* 链接样式 */
  a {
    @apply text-link no-underline;
  }

  a:hover {
    @apply underline;
  }

  a img {
    @apply border-none;
  }

  /* 表格样式 */
  table {
    @apply border-collapse empty-cells-show;
  }

  /* 表单元素 */
  input, textarea, select, button {
    @apply text-text-base font-sans;
  }

  input, textarea {
    @apply border-border bg-bg-white px-1 py-0.5;
  }

  button {
    @apply cursor-pointer;
  }
}

/* ==================== 组件样式 ==================== */

@layer components {
  /* 主容器 - 复刻 .wrap */
  .wrap {
    @apply mx-auto text-left max-w-[1000px];
  }

  /* 主盒子 - 复刻 .mainbox */
  .mainbox {
    @apply bg-bg-white border border-border p-2 mb-2;
  }

  /* 盒子标题 - 复刻 .mainbox h1/h3 */
  .mainbox-title {
    @apply h-[31px] px-4 leading-[31px] bg-header-gradient text-text-header border-b border-border-cat;
  }

  /* 分类表头 - 复刻 thead.category */
  .thead-category {
    @apply bg-cat-gradient text-text-cat;
  }

  /* 表格行 - 复刻 tbody tr */
  .table-row {
    @apply border-t border-border bg-bg-alt1;
  }

  .table-row:hover {
    @apply bg-bg-alt2;
  }

  /* 导航菜单 - 复刻 #menu */
  .nav-menu {
    @apply h-[31px] border border-border-cat bg-header-gradient;
  }

  /* 导航链接 - 复刻 #menu li a */
  .nav-link {
    @apply block px-2 py-1 text-text-header no-underline bg-[length:1px_12px] bg-left-center bg-no-repeat;
    background-image: url('/images/menu_itemline.gif');
  }

  .nav-link:hover,
  .nav-link.active {
    @apply bg-bg-white border-y border-l border-border-cat;
    background-image: none;
  }

  /* 分页 - 复刻 .pages */
  .pagination {
    @apply float-left h-6 leading-6 border border-border-cat bg-bg-white text-text-light overflow-hidden;
  }

  .pagination a,
  .pagination strong,
  .pagination span {
    @apply float-left px-2 leading-6;
  }

  .pagination a:hover {
    @apply bg-bg-alt1;
  }

  .pagination strong {
    @apply font-bold text-notice-text bg-cat-bg;
  }

  /* 按钮组 - 复刻 .pages_btns */
  .pages-btns {
    @apply clear-both w-full pb-2 overflow-hidden;
  }

  /* 通知框 - 复刻 .notice */
  .notice-box {
    @apply text-xs border border-notice-border bg-notice-bg p-2 mb-2 text-notice-text;
    background-image: url('/images/notice.gif');
    background-position: 1em 0.7em;
    background-repeat: no-repeat;
    padding-left: 3em;
  }

  /* 公告滚动区 - 复刻 #announcement */
  .announcement {
    @apply h-9 leading-9 overflow-hidden border-t border-dashed border-border-cat;
  }

  .announcement-content {
    @apply border border-border-white px-2.5 leading-9 overflow-hidden;
  }

  /* 底部操作栏 - 复刻 .footoperation */
  .foot-operation {
    @apply bg-cat-bg px-1.5 py-1 border-t border-border-cat;
  }

  /* 图例 - 复刻 .legend */
  .legend {
    @apply border border-border-light bg-bg-alt1 px-2.5 my-2.5 mx-auto w-[500px] text-center leading-9;
  }

  .legend label {
    @apply px-5 inline-flex items-center;
  }

  .legend img {
    @apply align-middle mr-2.5;
  }

  /* 弹出菜单 - 复刻 .popupmenu_popup */
  .popup-menu {
    @apply text-left leading-relaxed p-2.5 overflow-hidden border border-border-cat bg-cat-gradient;
  }

  /* 头部操作区 - 复刻 .headactions */
  .head-actions {
    @apply float-right leading-none pt-2.5 pr-2.5 text-text-header;
  }

  .head-actions a,
  .head-actions span,
  .head-actions strong {
    @apply pr-2.5 mr-2 bg-[length:1px_10px] bg-right-center bg-no-repeat text-text-header;
    background-image: url('/images/headactions_line.gif');
  }
}

/* ==================== 工具样式 ==================== */

@layer utilities {
  /* 论坛图标背景 */
  .forum-icon {
    @apply bg-[length:40px_40px] bg-left-center bg-no-repeat pl-14;
    background-image: url('/images/forum.gif');
  }

  .forum-icon.new {
    background-image: url('/images/forum_new.gif');
  }

  /* 箭头图标 */
  .arrow-right {
    @apply bg-[length:5px_9px] bg-left-center bg-no-repeat pl-2.5;
    background-image: url('/images/arrow_right.gif');
  }

  /* 在线图标 */
  .online-icon {
    @apply bg-[length:15px_15px] bg-left-center bg-no-repeat pl-5;
    background-image: url('/images/online.gif');
  }

  /* 最后帖子图标 */
  .lastpost-icon {
    @apply inline;
    background-image: url('/images/lastpost.gif');
  }
}
```

---

## 3. React 组件设计

### 3.1 页面布局组件

```typescript
// src/components/layout/MainLayout.tsx
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-white">
      {/* 主容器 - 复刻 .wrap */}
      <div className="wrap">{children}</div>
    </div>
  );
}

// src/components/layout/Header.tsx
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header id="header" className="w-full overflow-hidden">
      {/* Logo 区域 */}
      <h2 className="float-left p-0">
        <Link to="/" title="PokeTB 论坛">
          <img
            src="/images/logo.png"
            alt="PokeTB Logo"
            className="h-12"
          />
        </Link>
      </h2>

      {/* 右侧广告位 */}
      <div id="ad_headerbanner" className="float-right mt-4">
        {/* 广告内容 */}
      </div>
    </header>
  );
}

// src/components/layout/NavMenu.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

const navItems = [
  { path: '/memberlist', label: '会员列表' },
  { path: '/search', label: '搜索' },
  { path: '/faq', label: '帮助' },
];

export function NavMenu() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <nav id="menu" className="nav-menu clear-both">
      {/* 左侧切换按钮 (可选) */}
      <span className="frameswitch float-left h-[30px] leading-[30px] pl-2.5">
        {/* 帧切换功能已废弃，可隐藏 */}
      </span>

      {/* 用户信息区 */}
      <span className="avataonline float-left border-l border-border-white pl-7">
        {user ? (
          <>
            <cite>
              <Link to="/profile" className="dropmenu font-bold">
                {user.username}
              </Link>
            </cite>
            <Link to="/logout">退出</Link>
          </>
        ) : (
          <>
            <Link to="/register">注册</Link>
            <Link to="/login">登录</Link>
          </>
        )}
      </span>

      {/* 右侧菜单 */}
      <ul className="float-right pr-2.5 pt-1 border-r border-border-white">
        {navItems.map((item) => (
          <li
            key={item.path}
            className={`float-left ${
              location.pathname === item.path ? 'current font-bold' : ''
            }`}
          >
            <Link
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}

        {/* 版主/管理员菜单 */}
        {user && user.adminId > 0 && (
          <li className="float-left">
            <Link
              to={user.adminId === 1 ? '/admin' : '/modcp'}
              className="nav-link"
            >
              {user.adminId === 1 ? '管理中心' : '版主管理'}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-border bg-bg-alt2 text-text-base py-3 mx-auto max-w-[1000px]"
    >
      <div className="flex justify-between items-start">
        {/* Logo */}
        <img
          src="/images/logo_small.png"
          alt="PokeTB"
          className="float-left mr-2.5"
        />

        {/* 链接 */}
        <div id="footlinks" className="float-right -mt-1 text-right">
          <a href="mailto:admin@poketb.com">联系我们</a>
          <span className="text-text-light mx-1">|</span>
          <a href="/archive" target="_blank">无图版</a>
          <span className="text-text-light mx-1">|</span>
          <a href="/mobile" target="_blank">手机版</a>
        </div>
      </div>

      {/* 版权信息 */}
      <div
        id="copyright"
        className="text-xs font-sans leading-relaxed mt-2"
      >
        <Powered by />
        <strong>
          <a href="https://github.com" className="text-[#0954A6]">
            PokeTB Forum
          </a>
        </strong>
        <em className="text-[#FF9D25]"> © 2006-2026</em>
      </div>

      {/* 调试信息 (开发环境) */}
      {import.meta.env.DEV && (
        <div id="debuginfo" className="text-text-light text-xs mt-1">
          {process.env.NODE_ENV} Mode
        </div>
      )}

      {/* 返回顶部按钮 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="scrolltop cursor-pointer float-right mt-2 text-xs text-link"
      >
        ▲ 返回顶部
      </button>
    </footer>
  );
}
```

### 3.2 论坛列表组件

```typescript
// src/components/forum/ForumList.tsx
import { ForumCategory } from '@/types/forum';

interface ForumListProps {
  categories: ForumCategory[];
}

export function ForumList({ categories }: ForumListProps) {
  return (
    <>
      {categories.map((category) => (
        <div key={category.id} className="mainbox forumlist">
          {/* 分类标题栏 */}
          <div className="flex items-center justify-between">
            <h3 className="mainbox-title">
              <Link
                to={`/forum/category/${category.id}`}
                className="text-text-header no-underline"
              >
                {category.name}
              </Link>
            </h3>

            {/* 管理操作区 */}
            <span className="head-actions">
              {category.moderators && (
                <span>版主: {category.moderators}</span>
              )}
              <button
                onClick={() => toggleCategory(category.id)}
                className="ml-2 cursor-pointer"
              >
                <img
                  src={`/images/${category.collapsed ? 'collapsed_yes' : 'collapsed_no'}.gif`}
                  alt={category.collapsed ? '展开' : '收起'}
                />
              </button>
            </span>
          </div>

          {/* 论坛列表表格 */}
          <table
            id={`category_${category.id}`}
            className="w-full border-separate border-spacing-0"
            style={{ display: category.collapsed ? 'none' : 'table' }}
          >
            {/* 表头 */}
            <thead className="thead-category">
              <tr>
                <th className="border-t border-border-light">论坛</th>
                <td className="border-t border-border-light w-20 text-center">主题</td>
                <td className="border-t border-border-light w-20 text-center">文章</td>
                <td className="border-t border-border-light w-64 text-right pr-4">
                  最后发表
                </td>
              </tr>
            </thead>

            {/* 论坛行 */}
            <tbody>
              {category.forums.map((forum) => (
                <tr
                  key={forum.id}
                  id={`forum_${forum.id}`}
                  className="table-row"
                >
                  <th className="forum-icon h-10 text-left">
                    {/* 论坛图标 */}
                    <ForumIcon forum={forum} />

                    {/* 论坛名称和描述 */}
                    <h2 className="inline">
                      <Link
                        to={`/forum/${forum.id}`}
                        className="text-text-base no-underline hover:underline"
                      >
                        {forum.name}
                      </Link>
                      {forum.todayPosts > 0 && !forum.redirect && (
                        <em className="text-link-highlight">
                          {' '}
                          (今日: {forum.todayPosts})
                        </em>
                      )}
                    </h2>

                    {forum.description && (
                      <p className="text-text-light text-xs mt-1">
                        {forum.description}
                      </p>
                    )}

                    {forum.subForums && (
                      <p className="text-xs text-text-light">
                        子版块: {forum.subForums}
                      </p>
                    )}

                    {forum.moderators && (
                      <p className="moderators text-xs">
                        版主:{' '}
                        {forum.moderators.map((mod) => (
                          <Link
                            key={mod.id}
                            to={`/user/${mod.id}`}
                            className="text-link-highlight"
                          >
                            {mod.name}
                          </Link>
                        ))}
                      </p>
                    )}
                  </th>

                  {/* 主题数 */}
                  <td className="nums text-center">
                    {forum.redirect ? '--' : forum.threads}
                  </td>

                  {/* 文章数 */}
                  <td className="nums text-center">
                    {forum.redirect ? '--' : forum.posts}
                  </td>

                  {/* 最后发表 */}
                  <td className="lastpost text-right pr-4">
                    {forum.lastPost ? (
                      <span className="inline leading-relaxed text-xs">
                        <div>
                          主题:{' '}
                          <Link
                            to={`/thread/${forum.lastPost.threadId}`}
                            className="max-w-[200px] inline-block align-middle overflow-hidden text-ellipsis whitespace-nowrap"
                            title={forum.lastPost.subject}
                          >
                            {truncate(forum.lastPost.subject, 28)}
                          </Link>
                        </div>
                        <div>
                          作者:{' '}
                          {forum.lastPost.author ? (
                            forum.lastPost.author
                          ) : (
                            '匿名'
                          )}
                          <Link
                            to={`/thread/${forum.lastPost.threadId}`}
                            className="lastpost-icon"
                          >
                            <img
                              src="/images/lastpost.gif"
                              alt=""
                              className="align-middle ml-1"
                            />
                          </Link>
                        </div>
                        <div>时间: {forum.lastPost.dateline}</div>
                      </span>
                    ) : (
                      '从未'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

// 论坛图标组件
function ForumIcon({ forum }: { forum: Forum }) {
  if (forum.redirect) {
    return <img src="/images/forum_link.gif" alt="" className="float-left ml-1" />;
  }

  return (
    <img
      src={`/images/forum${forum.hasNew ? '_new' : ''}.gif`}
      alt=""
      className="float-left ml-1"
    />
  );
}
```

### 3.3 公告组件

```typescript
// src/components/announcement/AnnouncementBar.tsx
import { useState, useEffect } from 'react';
import { Announcement } from '@/types/announcement';

interface AnnouncementBarProps {
  announcements: Announcement[];
}

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  return (
    <div
      id="announcement"
      className="announcement"
      onMouseEnter={() => {/* 暂停滚动 */}}
      onMouseLeave={() => {/* 继续滚动 */}}
    >
      <div className="announcement-content">
        <ul className="float-left">
          {announcements.map((item, index) => (
            <li
              key={item.id}
              className={`float-left mr-5 arrow-right ${
                index === currentIndex ? 'block' : 'hidden'
              }`}
            >
              <Link
                to={`/announcement/${item.id}`}
                className="text-text-base"
              >
                {item.subject}
              </Link>
              {item.dateline && (
                <em className="text-text-light text-xs ml-1.5">
                  {item.dateline}
                </em>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 3.4 统计信息组件

```typescript
// src/components/forum/ForumStats.tsx
import { useForumStats } from '@/hooks/useForumStats';

export function ForumStats() {
  const { stats, loading } = useForumStats();

  if (loading) return <div className="h-10" />;

  return (
    <div id="foruminfo" className="w-full overflow-hidden my-2.5 text-text-base">
      {/* 统计信息 */}
      <div id="forumstats" className="float-right text-right pr-1.5">
        <p className="my-0">
          今日: <em className="text-text-table">{stats.todayPosts}</em>,{' '}
          昨日: <em className="text-text-table">{stats.yesterdayPosts}</em>,{' '}
          最高日: <em className="text-text-table">{stats.maxDayPosts}</em>
          <Link to="/digest" className="ml-2">
            精华区
          </Link>
        </p>
        <p className="my-0">
          主题: <em className="text-text-table">{stats.threads}</em>,{' '}
          文章: <em className="text-text-table">{stats.posts}</em>,{' '}
          会员: <em className="text-text-table">{stats.members}</em>,{' '}
          欢迎新会员{' '}
          <cite className="font-bold">
            <Link
              to={`/user/${stats.newestMember.id}`}
              className="text-text-base"
            >
              {stats.newestMember.username}
            </Link>
          </cite>
        </p>
      </div>
    </div>
  );
}
```

### 3.5 图例组件

```typescript
// src/components/forum/Legend.tsx
export function Legend() {
  return (
    <div className="legend">
      <label>
        <img src="/images/forum_new.gif" alt="有新帖" />
        有新帖的论坛
      </label>
      <label>
        <img src="/images/forum.gif" alt="无新帖" />
        无新帖的论坛
      </label>
    </div>
  );
}
```

---

## 4. 样式映射表

### 4.1 CSS 类名映射

| 原始类名 | Tailwind 类名 | 说明 |
|----------|---------------|------|
| `.wrap` | `.wrap` | 主容器 (自定义) |
| `.mainbox` | `.mainbox` | 主盒子 (自定义) |
| `.forumlist` | `.forumlist` | 论坛列表 |
| `#header` | `#header` | 头部 |
| `#menu` | `.nav-menu` | 导航菜单 |
| `#footer` | `#footer` | 底部 |
| `.headactions` | `.head-actions` | 头部操作区 |
| `.pages` | `.pagination` | 分页 |
| `.notice` | `.notice-box` | 通知框 |
| `.legend` | `.legend` | 图例 |
| `.popupmenu_popup` | `.popup-menu` | 弹出菜单 |

### 4.2 颜色映射

| 用途 | 原始值 | Tailwind 类 |
|------|--------|-------------|
| 主背景 | #FFF | `bg-bg-white` |
| 边框 | #DDEEEE | `border-border` |
| 分类背景 | #DDEEF7 | `bg-cat-bg` |
| 链接 | #0954A6 | `text-link` |
| 高亮链接 | #FF6600 | `text-link-highlight` |
| 文字 | #333 | `text-text-base` |
| 浅色文字 | #666 | `text-text-light` |

---

## 5. 图片资源清单

### 5.1 必需图片

| 文件名 | 用途 | 尺寸 |
|--------|------|------|
| `logo.png` | 论坛Logo | - |
| `forum.gif` | 无新帖版块图标 | 40x40 |
| `forum_new.gif` | 有新帖版块图标 | 40x40 |
| `forum_link.gif` | 链接版块图标 | 40x40 |
| `collapsed_yes.gif` | 折叠状态 | - |
| `collapsed_no.gif` | 展开状态 | - |
| `lastpost.gif` | 最后发表图标 | 10x10 |
| `arrow_right.gif` | 右箭头 | 5x9 |
| `menu_itemline.gif` | 菜单分隔线 | 1x12 |
| `headactions_line.gif` | 操作区分隔线 | 1x10 |
| `notice.gif` | 通知图标 | - |
| `online.gif` | 在线图标 | 15x15 |

### 5.2 图片迁移建议

```typescript
// src/config/images.ts
export const images = {
  logo: '/images/logo.png',
  forum: {
    default: '/images/forum.gif',
    new: '/images/forum_new.gif',
    link: '/images/forum_link.gif',
  },
  icons: {
    collapse: {
      yes: '/images/collapsed_yes.gif',
      no: '/images/collapsed_no.gif',
    },
    arrowRight: '/images/arrow_right.gif',
    lastPost: '/images/lastpost.gif',
    online: '/images/online.gif',
  },
};

// 使用示例
import { images } from '@/config/images';

<img src={images.forum.new} alt="" />
```

---

## 6. 响应式适配

虽然原版是固定宽度 (1000px)，但新版本可以添加响应式支持：

```css
/* 添加到 globals.css */
@layer utilities {
  /* 小屏幕适配 */
  @media (max-width: 1024px) {
    .wrap {
      @apply px-2;
    }

    /* 隐藏部分列 */
    .hide-on-mobile {
      @apply hidden;
    }

    /* 调整导航 */
    .nav-menu ul {
      @apply flex-wrap justify-center;
    }
  }

  /* 平板适配 */
  @media (min-width: 768px) and (max-width: 1024px) {
    .wrap {
      @apply max-w-[95%];
    }
  }
}
```

---

## 7. 组件使用示例

```typescript
// src/pages/HomePage.tsx
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import { ForumStats } from '@/components/forum/ForumStats';
import { AnnouncementBar } from '@/components/announcement/AnnouncementBar';
import { ForumList } from '@/components/forum/ForumList';
import { Legend } from '@/components/forum/Legend';
import { Footer } from '@/components/layout/Footer';

export function HomePage() {
  const { categories, announcements, stats } = useForumData();

  return (
    <MainLayout>
      <Header />
      <NavMenu />

      <ForumStats stats={stats} />
      <AnnouncementBar announcements={announcements} />
      <ForumList categories={categories} />
      <Legend />

      <Footer />
    </MainLayout>
  );
}
```

---

## 8. 迁移检查清单

### 数据准备
- [ ] 导出原版图片资源
- [ ] 创建 CDN 存储桶
- [ ] 准备 Logo 和图标文件

### 样式实现
- [ ] 配置 Tailwind CSS
- [ ] 创建 globals.css
- [ ] 实现基础布局组件
- [ ] 实现论坛列表组件
- [ ] 实现导航组件
- [ ] 实现页脚组件

### 测试
- [ ] 视觉对比测试 (并排对比)
- [ ] 响应式测试
- [ ] 浏览器兼容性测试
- [ ] 性能测试

### 优化
- [ ] 图片压缩和 CDN
- [ ] CSS 优化
- [ ] 懒加载实现
- [ ] 缓存策略

---

## 9. 参考资源

| 资源 | 说明 |
|------|------|
| 原模板路径 | `D:\Dev\poketb.com\bbs\templates\poketb\` |
| 原CSS | `css_common.htm` |
| 原模板 | `discuz.htm`, `viewthread.htm`, `header.htm` |
| Tailwind 文档 | https://tailwindcss.com |
| shadcn/ui | https://ui.shadcn.com |
