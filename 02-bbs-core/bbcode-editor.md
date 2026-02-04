# 编辑器和BBCode系统分析

## 概述

Discuz! 6.1F 使用自定义的 **BBCode** (Bulletin Board Code) 语法作为富文本编辑格式。这是数据迁移的关键问题。

## 核心文件

| 文件 | 功能 |
|------|------|
| `include/discuzcode.func.php` | BBCode解析核心 |
| `include/editor.func.php` | 编辑器函数 |
| `include/javascript/bbcode.js` | 前端BBCode处理 |
| `include/javascript/editor.js` | 编辑器脚本 |
| `include/javascript/post_editor.js` | 发帖编辑器 |
| `forumdata/cache/cache_bbcodes.php` | BBCode定义缓存 |

---

## BBCode语法规范

### 基础文本格式

| BBCode | 说明 | HTML输出 |
|--------|------|----------|
| `[b]文本[/b]` | 粗体 | `<strong>文本</strong>` |
| `[i]文本[/i]` | 斜体 | `<i>文本</i>` |
| `[u]文本[/u]` | 下划线 | `<u>文本</u>` |
| `[s]文本[/s]` | 删除线 | `<strike>文本</strike>` |
| `[color=red]文本[/color]` | 颜色 | `<font color="red">文本</font>` |
| `[size=5]文本[/size]` | 字号1-7 | `<font size="5">文本</font>` |
| `[font=Arial]文本[/font]` | 字体 | `<font face="Arial">文本</font>` |
| `[align=center]文本[/align]` | 对齐 | `<p align="center">文本</p>` |
| `[float=left]文本[/float]` | 浮动 | `<span style="float: left">文本</span>` |

### 布局元素

| BBCode | 说明 | HTML输出 |
|--------|------|----------|
| `[quote]内容[/quote]` | 引用 | `<blockquote>内容</blockquote>` |
| `[indent]内容[/indent]` | 缩进 | `<blockquote>内容</blockquote>` |
| `[list]内容[/list]` | 列表 | `<ul>内容</ul>` |
| `[list=1]内容[/list]` | 数字列表 | `<ul type="1">内容</ul>` |
| `[*]项目` | 列表项 | `<li>项目</li>` |
| `[table]内容[/table]` | 表格 | `<table>内容</table>` |
| `[tr]内容[/tr]` | 表格行 | `<tr>内容</tr>` |
| `[td]内容[/td]` | 表格单元格 | `<td>内容</td>` |

### 链接和媒体

| BBCode | 说明 | HTML输出 |
|--------|------|----------|
| `[url]链接[/url]` | 链接 | `<a href="链接">链接</a>` |
| `[url=http://...]文字[/url]` | 带文字链接 | `<a href="http://...">文字</a>` |
| `[email]邮件[/email]` | 邮件 | `<a href="mailto:邮件">邮件</a>` |
| `[email=xxx@...]文字[/email]` | 带文字邮件 | `<a href="mailto:xxx@...">文字</a>` |
| `[img]图片URL[/img]` | 图片 | `<img src="图片URL">` |
| `[img=宽,高]图片URL[/img]` | 带尺寸图片 | `<img width="宽" height="高" src="图片URL">` |
| `[swf]Flash URL[/swf]` | Flash | Flash播放器 |

### 代码块

| BBCode | 说明 | HTML输出 |
|--------|------|----------|
| `[code]代码[/code]` | 代码块 | `<div class="blockcode"><code>代码</code></div>` |
| `[php]代码[/php]` | PHP高亮 | 语法高亮的代码块 |
| `[pbo]代码[/pbo]` | PBO代码 | 自定义高亮 |
| `[xse]代码[/xse]` | XSE代码 | 自定义高亮 |

### 特殊功能

| BBCode | 说明 | HTML输出 |
|--------|------|----------|
| `[hide]内容[/hide]` | 回复可见 | 隐藏内容提示 |
| `[hide=积分]内容[/hide]` | 积分购买 | 积分购买提示 |
| `[free]内容[/free]` | 免费 | 直接显示 |
| `[media=w,h,auto,0]URL[/media]` | 媒体 | 媒体播放器 |
| `[attach]附件ID[/attach]` | 附件 | 附件展示 |

### 表情

```php
// 表情代码 → 图片映射
:) → <img src="images/smilies/smile.gif">
:D → <img src="images/smilies/biggrin.gif">
:( → <img src="images/smilies/sad.gif">
:P → <img src="images/smilies/tongue.gif">
```

---

## discuzcode() 函数解析流程

```php
function discuzcode($message, $smileyoff, $bbcodeoff, $htmlon,
                    $allowsmilies, $allowbbcode, $allowimgcode,
                    $allowhtml, $jammer, $parsetype, $authorid,
                    $allowmediacode, $pid)
```

### 解析步骤

```
1. 代码块预处理
   ├── [code] → codedisp()
   ├── [php] → phpcodedisp()
   ├── [pbo] → pbocodedisp()
   └── [xse] → xsecodedisp()

2. HTML转义
   └── dhtmlspecialchars() 转义特殊字符

3. 表情替换
   └── 替换表情代码为图片

4. 自定义BBCode
   └── 替换 cache_bbcodes.php 中的自定义代码

5. URL/Email解析
   ├── [url] → parseurl()
   └── [email] → parseemail()

6. 基础BBCode解析
   ├── [b], [i], [u] 等
   ├── [color], [size], [font]
   ├── [align], [float]
   └── [list], [table]

7. 特殊标签
   ├── [quote] → tpl_quote()
   ├── [free] → tpl_free()
   ├── [hide] → tpl_hide_reply()
   ├── [hide=积分] → creditshide()
   └── [media] → parsemedia()

8. 图片处理
   ├── [img] → bbcodeurl()
   └── [swf] → bbcodeurl()

9. 代码块还原
   └── 替换占位符为实际HTML

10. 高亮处理
    └── highlight() 高亮关键词

11. 最终输出
    └── nl2br() + 空格处理
```

---

## BBCode示例对比

### 输入 (BBCode)

```bbcode
[b]粗体文字[/b]
[i]斜体文字[/i]
[u]下划线[/u]
[color=red]红色文字[/color]
[size=5]大号字[/size]

[url=http://example.com]链接文字[/url]
[img]http://example.com/image.jpg[/img]

[quote]
引用内容
[/quote]

[code]
console.log('Hello World');
[/code]

[list]
[*]项目1
[*]项目2
[/list]
```

### 输出 (HTML)

```html
<strong>粗体文字</strong>
<i>斜体文字</i>
<u>下划线</u>
<font color="red">红色文字</font>
<font size="5">大号字</font>

<a href="http://example.com" target="_blank">链接文字</a>
<img src="http://example.com/image.jpg" border="0" onclick="zoom(this, this.src)" onload="attachimg(this, 'load')" alt="" />

<blockquote>
引用内容
</blockquote>

<div class="blockcode">
    <code>console.log('Hello World');</code>
</div>

<ul>
    <li>项目1</li>
    <li>项目2</li>
</ul>
```

---

## 编辑器组件

### 前端编辑器

Discuz! 6.1F 使用的是 **纯JavaScript编辑器**（基于textarea + 工具栏）：

```
include/javascript/
├── post_editor.js        # 发帖编辑器
├── editor.js             # 编辑器核心
├── bbcode.js             # BBCode处理
└── post.js               # 发帖脚本
```

### 编辑器功能

| 功能 | 说明 |
|------|------|
| **格式工具栏** | 粗体、斜体、下划线、颜色等 |
| **插入功能** | 图片、链接、附件、表情 |
| **预览** | 实时预览BBCode渲染效果 |
| **快捷键** | Ctrl+B 粗体、Ctrl+I 斜体等 |
| **全屏模式** | 全屏编辑 |

---

## 数据存储格式

### 数据库中的存储

**cdb_posts 表的 message 字段**：
```sql
CREATE TABLE cdb_posts (
    pid INT PRIMARY KEY,
    tid INT,
    message TEXT,         -- 存储原始BBCode格式
    useip VARCHAR(15),
    ...
);
```

**存储示例**：
```bbcode
[b]欢迎[/b]来到[i]论坛[/i]！

[quote]引用内容[/quote]

[code]
print('Hello World');
[/code]

[url=http://example.com]点击这里[/url]
```

---

## 数据迁移策略

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **A: 保持BBCode** | 无需转换数据 | 需要BBCode解析器 | ⭐⭐⭐⭐ |
| **B: 转HTML** | 兼容性好 | 数据量大，不可逆 | ⭐⭐ |
| **C: 转Markdown** | 现代化 | 转换复杂，可能丢失 | ⭐⭐ |
| **D: 双格式存储** | 灵活 | 占用空间 | ⭐⭐⭐⭐⭐ |

### 推荐方案：双格式存储

```sql
ALTER TABLE posts ADD COLUMN content_markdown TEXT;
ALTER TABLE posts ADD COLUMN content_html TEXT;
ALTER TABLE posts ADD COLUMN content_format ENUM('bbcode', 'markdown') DEFAULT 'bbcode';
```

**工作流程**：
```
1. 迁移阶段：保持BBCode，实时转换显示
2. 过渡阶段：新内容用Markdown，旧内容BBCode
3. 完成阶段：全部转换为Markdown
```

---

## 重构实现方案

### 1. BBCode解析器（TypeScript）

```typescript
// bbcode-parser.ts

interface BBCodeRule {
  tag: string;
  pattern: RegExp;
  replace: string | ((match: string, ...args: string[]) => string);
  allowed?: boolean;
}

class BBCodeParser {
  private rules: BBCodeRule[] = [
    // 基础格式
    { tag: 'b', pattern: /\[b\](.+?)\[\/b\]/gi, replace: '<strong>$1</strong>' },
    { tag: 'i', pattern: /\[i\](.+?)\[\/i\]/gi, replace: '<em>$1</em>' },
    { tag: 'u', pattern: /\[u\](.+?)\[\/u\]/gi, replace: '<u>$1</u>' },

    // 颜色和大小
    { tag: 'color', pattern: /\[color=([#\w]+)\](.+?)\[\/color\]/gi, replace: '<span style="color: $1">$2</span>' },
    { tag: 'size', pattern: /\[size=(\d+)\](.+?)\[\/size\]/gi, replace: '<span style="font-size: $1px">$2</span>' },

    // 链接
    { tag: 'url', pattern: /\[url\](.+?)\[\/url\]/gi, replace: '<a href="$1">$1</a>' },
    { tag: 'url', pattern: /\[url=([^\]]+)\](.+?)\[\/url\]/gi, replace: '<a href="$1">$2</a>' },

    // 图片
    { tag: 'img', pattern: /\[img\](.+?)\[\/img\]/gi, replace: '<img src="$1" alt="" />' },
    { tag: 'img', pattern: /\[img=(\d+)[x,](\d+)\](.+?)\[\/img\]/gi, replace: '<img width="$1" height="$2" src="$3" alt="" />' },

    // 引用
    { tag: 'quote', pattern: /\[quote\](.+?)\[\/quote\]/gis, replace: '<blockquote>$1</blockquote>' },

    // 列表
    { tag: 'list', pattern: /\[list\](.+?)\[\/list\]/gis, replace: this.parseList },

    // 代码
    { tag: 'code', pattern: /\[code\](.+?)\[\/code\]/gis, replace: '<pre><code>$1</code></pre>' },
  ];

  parse(bbcode: string): string {
    let html = bbcode;

    for (const rule of this.rules) {
      if (typeof rule.replace === 'function') {
        html = html.replace(rule.pattern, rule.replace);
      } else {
        html = html.replace(rule.pattern, rule.replace);
      }
    }

    return html;
  }

  private parseList(match: string, ...args: string[]): string {
    const items = match.split('[*]').filter(item => item.trim());
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
  }
}

export const bbcodeParser = new BBCodeParser();
```

### 2. Markdown编辑器集成

```typescript
// 使用 Tiptap 作为编辑器
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BBCodeExtension from './bbcode-extension';

const PostEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BBCodeExtension,  // 自定义BBCode支持
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <div className="editor">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
```

### 3. BBCode ↔ Markdown 转换器

```typescript
// bbcode-converter.ts

class BBCodeConverter {
  // BBCode → Markdown
  toMarkdown(bbcode: string): string {
    let md = bbcode;

    // 基础格式
    md = md.replace(/\[b\](.+?)\[\/b\]/gi, '**$1**');
    md = md.replace(/\[i\](.+?)\[\/i\]/gi, '*$1*');
    md = md.replace(/\[u\](.+?)\[\/u\]/gi, '<u>$1</u>');

    // 标题
    md = md.replace(/\[size=7\](.+?)\[\/size\]/gi, '# $1');
    md = md.replace(/\[size=6\](.+?)\[\/size\]/gi, '## $1');

    // 链接
    md = md.replace(/\[url=([^\]]+)\](.+?)\[\/url\]/gi, '[$2]($1)');

    // 图片
    md = md.replace(/\[img\](.+?)\[\/img\]/gi, '![]($1)');

    // 引用
    md = md.replace(/\[quote\](.+?)\[\/quote\]/gis, '> $1');

    // 代码
    md = md.replace(/\[code\](.+?)\[\/code\]/gis, '```\n$1\n```');

    // 列表
    md = md.replace(/\[\*]\s*/g, '- ');
    md = md.replace(/\[list\](.+?)\[\/list\]/gis, '$1');
    md = md.replace(/\[list=1\](.+?)\[\/list\]/gis, '$1'); // 有序列表

    return md;
  }

  // Markdown → BBCode
  fromMarkdown(markdown: string): string {
    let bbcode = markdown;

    // 基础格式
    bbcode = bbcode.replace(/\*\*(.+?)\*\*/g, '[b]$1[/b]');
    bbcode = bbcode.replace(/\*(.+?)\*/g, '[i]$1[/i]');

    // 链接
    bbcode = bbcode.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[url=$2]$1[/url]');

    // 图片
    bbcode = bbcode.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[img]$2[/img]');

    // 引用
    bbcode = bbcode.replace(/^>\s+(.+)$/gm, '[quote]$1[/quote]');

    // 代码
    bbcode = bbcode.replace(/```(\w*)([\s\S]*?)```/g, '[code]$2[/code]');

    return bbcode;
  }
}

export const bbcodeConverter = new BBCodeConverter();
```

### 4. 数据迁移脚本

```typescript
// migration/convert-content.ts

import { PrismaClient } from '@prisma/client';
import { bbcodeParser } from '../lib/bbcode-parser';
import { bbcodeConverter } from '../lib/bbcode-converter';

const prisma = new PrismaClient();

async function migratePostContent() {
  const posts = await prisma.post.findMany({
    where: {
      contentFormat: 'bbcode'
    },
    take: 100, // 批量处理
  });

  for (const post of posts) {
    // 转换为Markdown
    const markdown = bbcodeConverter.toMarkdown(post.content);

    // 生成HTML
    const html = bbcodeParser.parse(post.content);

    // 更新数据库
    await prisma.post.update({
      where: { id: post.id },
      data: {
        contentMarkdown: markdown,
        contentHtml: html,
        contentFormat: 'markdown',
      }
    });
  }
}

// 后台API路由
router.post('/api/admin/migrate-content', async (ctx) => {
  const { count } = ctx.request.body;

  // 执行迁移
  await migratePostContent();

  ctx.body = { success: true, message: `已迁移 ${count} 个帖子` };
});
```

### 5. 前端渲染组件

```typescript
// components/PostContent.tsx

import { useMemo } from 'react';
import { bbcodeParser } from '@/lib/bbcode-parser';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';

interface PostContentProps {
  content: string;
  format: 'bbcode' | 'markdown' | 'html';
}

export function PostContent({ content, format }: PostContentProps) {
  const renderedContent = useMemo(() => {
    switch (format) {
      case 'bbcode':
        return bbcodeParser.parse(content);
      case 'markdown':
        // 使用 ReactMarkdown 渲染
        return <ReactMarkdown>{content}</ReactMarkdown>;
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
      default:
        return content;
    }
  }, [content, format]);

  return (
    <div className="prose prose-sm max-w-none">
      {renderedContent}
    </div>
  );
}
```

---

## 编辑器推荐方案

### Tiptap (推荐 ⭐⭐⭐⭐⭐)

**优势**:
- 现代化的块级编辑器
- 支持Markdown和富文本
- 高度可扩展
- TypeScript原生支持
- 移动端友好

**集成示例**:
```typescript
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

const extensions = [
  StarterKit,
  Image,
  Link,
  Placeholder,
  BBCodeExtension,  // 自定义BBCode兼容扩展
];
```

### 备选方案

| 编辑器 | 优势 | 劣势 |
|--------|------|------|
| **Quill** | 功能全面、文档丰富 | 不够现代 |
| **Draft.js** | Facebook出品、可控性强 | 学习曲线陡 |
| **Slate** | 完全可控、现代化 | 需要更多代码 |
| **lexical** | Meta出品、最新 | 生态还不够成熟 |

---

## 迁移路线图

### 阶段1: 兼容期（3个月）
```
旧内容: BBCode格式存储
新内容: Markdown格式存储
编辑器: Markdown + BBCode预览
显示: 自动检测格式并渲染
```

### 阶段2: 转换期（6个月）
```
后台任务: 批量转换BBCode→Markdown
用户编辑: 自动转换旧帖为Markdown
显示: 统一使用Markdown渲染
```

### 阶段3: 完成期（长期）
```
所有内容: Markdown格式
BBCode: 仅作为导入工具保留
```

---

## 总结

### 关键点

1. **数据格式**: 数据库中存储的是 **原始BBCode**
2. **解析核心**: `discuzcode()` 函数负责BBCode→HTML转换
3. **迁移策略**: 双格式存储是最佳方案
4. **编辑器选择**: Tiptap + 自定义BBCode扩展
5. **向后兼容**: 必须支持旧BBCode内容渲染

### 技术选型

| 组件 | 选择 |
|------|------|
| 编辑器 | Tiptap |
| BBCode解析器 | 自定义 (TypeScript) |
| Markdown渲染 | react-markdown + rehype |
| 代码高亮 | Prism.js 或 Shiki |
| 数据存储 | 双格式 (BBCode + Markdown) |

### 下一步

1. 创建 BBCode 解析器
2. 创建 BBCode ↔ Markdown 转换器
3. 集成 Tiptap 编辑器
4. 实现数据迁移脚本
5. 测试渲染效果
