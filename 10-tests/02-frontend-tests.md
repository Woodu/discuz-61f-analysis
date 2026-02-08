# 前端测试用例规划

> **React 18 + TypeScript + Vite**
>
> **TDD 驱动开发**
>
> **创建时间**: 2026-02-07

---

## 测试工具

### 单元测试
```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jsdom": "^23.0.0"
}
```

### E2E 测试
```json
{
  "@playwright/test": "^1.40.0"
}
```

### 视觉测试
- Playwright Screenshot
- 截图对比

---

## 测试策略

### 测试金字塔
```
        /\
       /  \      E2E Tests (10%)
      /____\     关键用户流程
     /      \
    /        \   Component Tests (60%)
   /__________\  组件/Hook测试
  /            \
 /              \ Unit Tests (30%)
/________________\ 工具函数测试
```

### 覆盖率目标
- 组件测试: ≥80%
- Hook 测试: ≥90%
- 工具函数: 100%
- E2E: 关键流程 100%

---

## 测试用例目录

## 1. 基础组件 (UI Components)

### 1.1 Button 组件

#### 单元测试
- [ ] 渲染不同变体 (primary/secondary/ghost/danger)
- [ ] 渲染不同尺寸 (sm/md/lg)
- [ ] 响应点击事件
- [ ] 禁用状态不触发点击
- [ ] 加载状态显示 spinner
- [ ] 支持自定义 className
- [ ] 支持左/右图标
- [ ] 支持 asChild 模式 (链接)

```typescript
// src/shared/components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render primary variant correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-cat-bg');
  });

  it('should call onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show spinner in loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

### 1.2 Input 组件

#### 单元测试
- [ ] 渲染不同类型 (text/password/email/number)
- [ ] 显示 label
- [ ] 显示错误信息
- [ ] 显示 helper text
- [ ] 支持受控模式
- [ ] 支持非受控模式
- [ ] 禁用状态
- [ ] 必填标记显示
- [ ] 前/后缀图标

```typescript
// src/shared/components/ui/Input/Input.test.tsx
describe('Input Component', () => {
  it('should render with label', () => {
    render(<Input label="Username" name="username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input name="test" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should be controlled input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input name="test" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');

    expect(onChange).toHaveBeenCalled();
  });
});
```

### 1.3 Modal 组件

#### 单元测试
- [ ] 打开/关闭状态
- [ ] 点击遮罩关闭
- [ ] ESC 键关闭
- [ ] 渲染标题/内容/底部
- [ ] 禁止关闭时不响应
- [ ] 多个 modal 堆叠

#### E2E 测试
- [ ] 用户打开 modal 并操作

### 1.4 Form 组件

#### 单元测试
- [ ] 表单验证 (必填/格式/长度)
- [ ] 显示验证错误
- [ ] 提交成功回调
- [ ] 提交失败状态
- [ ] 字段级禁用
- [ ] 动态字段添加/删除

### 1.5 Table 组件

#### 单元测试
- [ ] 渲染表头和数据
- [ ] 排序功能
- [ ] 行选择
- [ ] 分页
- [ ] 空状态
- [ ] 加载状态

### 1.6 Pagination 组件

#### 单元测试
- [ ] 渲染正确的页码
- [ ] 上一页/下一页按钮
- [ ] 首页/末页跳转
- [ ] 页码变化回调

### 1.7 Card/Badge/Tag 组件

#### 单元测试
- [ ] Badge 不同颜色变体
- [ ] Tag 可关闭功能
- [ ] Card 渲染内容

### 1.8 Avatar 组件

#### 单元测试
- [ ] 渲染图片头像
- [ ] 回退到首字母
- [ ] 不同尺寸
- [ ] 在线状态指示器

### 1.9 Spinner 组件

#### 单元测试
- [ ] 渲染不同尺寸
- [ ] 动画存在

### 1.10 Skeleton 组件

#### 单元测试
- [ ] 渲染不同形状
- [ ] 动画效果

### 1.11 Toast 组件

#### 单元测试
- [ ] 显示 toast
- [ ] 自动关闭
- [ ] 手动关闭
- [ ] 多个 toast 堆叠
- [ ] 不同类型 (success/error/info/warning)

### 1.12 ErrorBoundary 组件

#### 单元测试
- [ ] 捕获子组件错误
- [ ] 显示错误信息
- [ ] 开发环境显示堆栈
- [ ] 重置功能

---

## 2. 布局组件 (Layout)

### 2.1 Header 组件

#### 单元测试
- [ ] 渲染 logo
- [ ] 渲染导航菜单
- [ ] 渲染用户信息 (登录后)
- [ ] 渲染通知徽标
- [ ] 搜索栏集成
- [ ] 移动端菜单按钮

#### E2E 测试
- [ ] 用户通过导航跳转页面
- [ ] 用户点击通知图标

### 2.2 Footer 组件

#### 单元测试
- [ ] 渲染链接
- [ ] 渲染版权信息

### 2.3 Sidebar 组件

#### 单元测试
- [ ] 展开/收起状态
- [ ] 渲染菜单项
- [ ] 激活状态高亮
- [ ] 嵌套菜单展开

### 2.4 Layout 组件

#### 单元测试
- [ ] 组合 Header/Footer/Sidebar
- [ ] 响应式布局切换
- [ ] 内容区域正确渲染

---

## 3. 认证页面 (Auth Pages)

### 3.1 登录页面 (LoginPage)

#### 单元测试
- [ ] 渲染登录表单
- [ ] 用户名/密码输入
- [ ] 表单验证
- [ ] 记住我功能
- [ ] 忘记密码链接
- [ ] 注册链接

#### E2E 测试
- [ ] 用户输入正确凭据登录成功
- [ ] 用户输入错误凭据显示错误
- [ ] 未输入内容显示验证错误
- [ ] 登录成功后跳转到首页
- [ ] 记住我功能保持登录状态

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/user/login');

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with incorrect credentials', async ({ page }) => {
    await page.goto('/user/login');

    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');
  });
});
```

### 3.2 注册页面 (RegisterPage)

#### 单元测试
- [ ] 渲染注册表单
- [ ] 用户名/邮箱/密码输入
- [ ] 密码强度指示器
- [ ] 密码确认匹配验证
- [ ] 验证码输入
- [ ] 服务条款勾选

#### E2E 测试
- [ ] 用户成功注册
- [ ] 用户名已存在显示错误
- [ ] 邮箱格式错误提示
- [ ] 密码强度提示
- [ ] 注册成功后自动登录

### 3.3 密码重置页面 (PasswordResetPage)

#### 单元测试
- [ ] 邮箱输入
- [ ] 发送重置邮件
- [ ] 新密码设置
- [ ] 密码确认验证

#### E2E 测试
- [ ] 用户请求密码重置
- [ ] 用户设置新密码
- [ ] 重置成功后可登录

---

## 4. 论坛页面 (Forum Pages)

### 4.1 版块列表页 (ForumListPage)

#### 单元测试
- [ ] 渲染版块分类
- [ ] 渲染版块列表
- [ ] 显示版块统计 (主题/帖子数)
- [ ] 显示最后发表主题
- [ ] 权限控制 (隐藏无权限版块)

#### E2E 测试
- [ ] 用户浏览版块列表
- [ ] 用户点击版块进入主题列表
- [ ] 未登录用户只能查看公开版块

### 4.2 主题列表页 (ThreadListPage)

#### 单元测试
- [ ] 渲染主题列表
- [ ] 分页功能
- [ ] 筛选功能 (全部/精华/热门)
- [ ] 排序功能
- [ ] 主题状态图标 (置顶/精华/锁定)
- [ ] 空状态

#### E2E 测试
- [ ] 用户浏览主题列表
- [ ] 用户点击主题进入详情
- [ ] 用户切换筛选条件
- [ ] 用户翻页

### 4.3 主题详情页 (ThreadDetailPage)

#### 单元测试
- [ ] 渲染主题标题/内容
- [ ] 渲染回复列表
- [ ] 楼层号显示
- [ ] 作者信息显示
- [ ] 分页加载回复
- [ ] 引用显示
- [ ] 附件显示

#### E2E 测试
- [ ] 用户查看主题详情
- [ ] 用户滚动加载更多回复
- [ ] 用户点击引用跳转
- [ ] 用户点击附件下载

### 4.4 发帖表单 (CreateThreadForm)

#### 单元测试
- [ ] 标题输入验证
- [ ] 内容输入验证
- [ ] BBCode 编辑器集成
- [ ] 标签输入
- [ ] 附件上传
- [ ] 表单提交

#### E2E 测试
- [ ] 用户创建新主题
- [ ] 用户上传附件
- [ ] 用户添加表情
- [ ] 发帖成功后跳转到主题
- [ ] 权限不足时提示

### 4.5 回复编辑器 (PostEditor)

#### 单元测试
- [ ] BBCode 工具栏
- [ ] 插入 BBCode 标签
- [ ] 表情选择器
- [ ] 附件上传
- [ ] 预览功能
- [ ] 自动保存草稿

#### E2E 测试
- [ ] 用户使用 BBCode 格式化文本
- [ ] 用户插入表情
- [ ] 用户上传图片
- [ ] 用户预览帖子

### 4.6 BBCode 编辑器 (BBCodeEditor)

#### 单元测试
- [ ] 粗体/斜体/下划线按钮
- [ ] 颜色/大小选择
- [ ] 链接/图片插入
- [ ] 引用/代码插入
- [ ] 列表插入
- [ ] 表格插入
- [ ] 预览模式切换

```typescript
// src/features/editor/components/BBCodeEditor.test.tsx
describe('BBCodeEditor', () => {
  it('should insert bold tag when bold button clicked', async () => {
    const { getByTestId, user } = setup(<BBCodeEditor />);

    const textarea = getByTestId('bbcode-textarea');
    await user.click(textarea);
    await user.type(textarea, 'test');

    const boldButton = getByTestId('button-bold');
    await user.click(boldButton);

    expect(textarea).toHaveValue('[b]test[/b]');
  });

  it('should open emoji picker when emoji button clicked', async () => {
    const { getByTestId, queryByTestId, user } = setup(<BBCodeEditor />);

    expect(queryByTestId('emoji-picker')).not.toBeInTheDocument();

    await user.click(getByTestId('button-emoji'));

    expect(getByTestId('emoji-picker')).toBeInTheDocument();
  });
});
```

### 4.7 附件上传 (AttachmentUpload)

#### 单元测试
- [ ] 拖拽上传
- [ ] 点击上传
- [ ] 文件类型验证
- [ ] 文件大小验证
- [ ] 上传进度
- [ ] 删除附件

#### E2E 测试
- [ ] 用户拖拽文件上传
- [ ] 用户选择多个文件
- [ ] 上传进度显示
- [ ] 上传成功显示预览

### 4.8 表情选择器 (EmojiPicker)

#### 单元测试
- [ ] 渲染表情分类
- [ ] 搜索表情
- [ ] 插入表情
- [ ] Pokemon 表情分类
- [ ] 自定义表情

---

## 5. 用户中心 (UserCP)

### 5.1 UserCP 布局 (UserCPLayout)

#### 单元测试
- [ ] 渲染侧边栏导航
- [ ] 激活状态高亮
- [ ] 内容区域显示

### 5.2 个人资料编辑 (ProfilePage)

#### 单元测试
- [ ] 渲染表单字段
- [ ] 验证输入
- [ ] 保存按钮

#### E2E 测试
- [ ] 用户编辑个人资料
- [ ] 保存成功提示

### 5.3 头像上传 (AvatarUpload)

#### 单元测试
- [ ] 选择文件
- [ ] 图片预览
- [ ] 裁剪功能
- [ ] 上传进度

#### E2E 测试
- [ ] 用户上传新头像
- [ ] 用户裁剪图片
- [ ] 头像更新成功

### 5.4 安全设置 (SecurityPage)

#### 单元测试
- [ ] 修改密码表单
- [ ] 密码强度验证
- [ ] 旧密码验证

#### E2E 测试
- [ ] 用户修改密码
- [ ] 修改成功后重新登录

### 5.5 偏好设置 (PreferencesPage)

#### 单元测试
- [ ] 通知偏好开关
- [ ] 邮件订阅设置
- [ ] 时区选择
- [ ] 主题选择

---

## 6. 版主面板 (ModCP)

### 6.1 ModCP 布局 (ModCPLayout)

#### 单元测试
- [ ] 渲染版主导航
- [ ] 权限检查

### 6.2 主题审核 (ModThreadsPage)

#### 单元测试
- [ ] 渲染主题列表
- [ ] 操作菜单 (置顶/加精/关闭/移动/删除)
- [ ] 批量选择
- [ ] 原因输入框

#### E2E 测试
- [ ] 版主置顶主题
- [ ] 版主加精主题
- [ ] 版主关闭主题
- [ ] 版主删除主题
- [ ] 版主批量操作

```typescript
// e2e/modcp/moderation.spec.ts
test.describe('Thread Moderation', () => {
  test('moderator should sticky thread', async ({ page }) => {
    await loginAsModerator(page);
    await page.goto('/modcp/threads');

    const threadRow = page.locator('[data-thread-id="123"]');
    await threadRow.locator('[data-testid="action-menu"]').click();
    await page.click('[data-testid="action-sticky"]');

    await page.fill('[data-testid="reason-input"]', '置顶公告');
    await page.click('[data-testid="confirm-action"]');

    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});
```

### 6.3 帖子审核 (ModPostsPage)

#### 单元测试
- [ ] 渲染帖子列表
- [ ] 删除/恢复操作
- [ ] 审核状态显示

#### E2E 测试
- [ ] 版主删除帖子
- [ ] 版主恢复帖子

### 6.4 操作日志 (ModLogsPage)

#### 单元测试
- [ ] 渲染日志列表
- [ ] 筛选功能
- [ ] 分页

---

## 7. 管理后台 (AdminCP)

### 7.1 AdminCP 布局 (AdminCPLayout)

#### 单元测试
- [ ] 渲染管理导航
- [ ] 权限检查 (仅管理员)

### 7.2 仪表盘 (AdminDashboardPage)

#### 单元测试
- [ ] 渲染统计卡片
- [ ] 渲染图表
- [ ] 渲染快捷操作
- [ ] 渲染最近活动

#### E2E 测试
- [ ] 管理员查看仪表盘
- [ ] 统计数据正确显示

### 7.3 用户管理 (AdminUsersPage)

#### 单元测试
- [ ] 渲染用户表格
- [ ] 搜索/筛选功能
- [ ] 分页
- [ ] 编辑用户对话框
- [ ] 封禁/解封操作

#### E2E 测试
- [ ] 管理员搜索用户
- [ ] 管理员编辑用户资料
- [ ] 管理员封禁用户
- [ ] 管理员调整用户组

### 7.4 版块管理 (AdminForumsPage)

#### 单元测试
- [ ] 渲染版块树
- [ ] 拖拽排序
- [ ] 新建版块表单
- [ ] 编辑版块表单
- [ ] 删除版块确认

#### E2E 测试
- [ ] 管理员创建新版块
- [ ] 管理员拖拽排序版块
- [ ] 管理员编辑版块信息
- [ ] 管理员删除版块

### 7.5 插件管理 (AdminPluginsPage)

#### 单元测试
- [ ] 渲染插件列表
- [ ] 启用/禁用插件
- [ ] 插件配置对话框

#### E2E 测试
- [ ] 管理员启用插件
- [ ] 管理员配置插件

### 7.6 系统设置 (AdminSettingsPage)

#### 单元测试
- [ ] 基本设置表单
- [ ] 邮件设置表单
- [ ] 缓存设置表单
- [ ] 安全设置表单

#### E2E 测试
- [ ] 管理员修改基本设置
- [ ] 管理员保存成功

### 7.7 日志查看 (AdminLogsPage)

#### 单元测试
- [ ] 筛选日志类型
- [ ] 筛选日期范围
- [ ] 搜索功能
- [ ] 日志详情对话框

---

## 8. Pokemon 系统

### 8.1 Pokemon 中心页 (PokemonCenterPage)

#### 单元测试
- [ ] 渲染欢迎信息
- [ ] 渲染快捷入口
- [ ] 显示用户宠物数量

#### E2E 测试
- [ ] 用户访问 Pokemon 中心
- [ ] 用户导航到各个功能

### 8.2 我的宠物页 (MyPokemonPage)

#### 单元测试
- [ ] 渲染宠物列表
- [ ] 筛选状态 (全部/队伍/仓库)
- [ ] 宠物卡片显示
- [ ] 空状态

#### E2E 测试
- [ ] 用户查看宠物列表
- [ ] 用户切换筛选条件

### 8.3 宠物详情页 (PokemonDetailPage)

#### 单元测试
- [ ] 渲染宠物信息
- [ ] 渲染属性/技能
- [ ] 渲染经验条
- [ ] 操作按钮 (训练/进化/释放)

#### E2E 测试
- [ ] 用户查看宠物详情
- [ ] 用户设置宠物昵称
- [ ] 用户配置技能

### 8.4 图鉴页 (PokedexPage)

#### 单元测试
- [ ] 渲染图鉴列表
- [ ] 搜索/筛选功能
- [ ] 分页加载

### 8.5 商店页 (PokemonShopPage)

#### 单元测试
- [ ] 渲染商品列表
- [ ] 商品详情
- [ ] 购买确认对话框
- [ ] 余额检查

#### E2E 测试
- [ ] 用户浏览商店
- [ ] 用户购买商品
- [ ] 余额不足提示

### 8.6 市场页 (PokemonMarketPage)

#### 单元测试
- [ ] 渲染市场列表
- [ ] 筛选功能
- [ ] 我的上架
- [ ] 上架对话框

#### E2E 测试
- [ ] 用户浏览市场
- [ ] 用户上架宠物
- [ ] 用户购买宠物

### 8.7 战斗页 (PokemonBattlePage)

#### 单元测试
- [ ] 渲染战斗界面
- [ ] 显示双方宠物
- [ ] 显示血条
- [ ] 技能按钮
- [ ] 战斗日志

#### E2E 测试
- [ ] 用户发起战斗
- [ ] 用户选择技能攻击
- [ ] 战斗结束显示结果
- [ ] 战斗奖励显示

```typescript
// e2e/pokemon/battle.spec.ts
test.describe('Pokemon Battle', () => {
  test('user should complete a battle', async ({ page }) => {
    await login(page);
    await page.goto('/pokemon/battle/wild');

    // Select pokemon
    await page.click('[data-testid="select-pokemon-1"]');
    await page.click('[data-testid="start-battle"]');

    // Wait for battle to load
    await expect(page.locator('[data-testid="battle-arena"]')).toBeVisible();

    // Use skill
    await page.click('[data-testid="skill-tackle"]');
    await page.waitForTimeout(1000);

    // Check battle log
    const log = page.locator('[data-testid="battle-log"]');
    await expect(log).toContainText('使用了撞击');

    // Wait for battle end
    await expect(page.locator('[data-testid="battle-result"]')).toBeVisible({ timeout: 30000 });
  });
});
```

### 8.8 Pokemon 组件

#### PokemonCard
- [ ] 渲染宠物图片
- [ ] 显示等级/属性
- [ ] 显示血条

#### StatBar
- [ ] 正确显示百分比
- [ ] 颜色变化 (绿/黄/红)

#### BattleArena
- [ ] 渲染双方站位
- [ ] 动画效果
- [ ] 技能特效

---

## 9. 银行系统 (Bank)

### 9.1 银行首页 (BankPage)

#### 单元测试
- [ ] 渲染账户信息
- [ ] 渲染余额
- [ ] 渲染快捷操作
- [ ] 渲染最近交易

#### E2E 测试
- [ ] 用户查看银行账户
- [ ] 用户检查余额

### 9.2 存款表单 (DepositForm)

#### 单元测试
- [ ] 金额输入验证
- [ ] 余额显示更新
- [ ] 成功提示

#### E2E 测试
- [ ] 用户存入金额
- [ ] 存款成功余额增加

### 9.3 取款表单 (WithdrawForm)

#### 单元测试
- [ ] 金额输入验证
- [ ] 余额检查
- [ ] 超出余额提示

#### E2E 测试
- [ ] 用户取出金额
- [ ] 取款成功余额减少
- [ ] 超出余额无法取款

### 9.4 转账表单 (TransferForm)

#### 单元测试
- [ ] 用户搜索
- [ ] 金额输入
- [ ] 余额检查
- [ ] 每日限额检查
- [ ] 转账确认

#### E2E 测试
- [ ] 用户转账给其他用户
- [ ] 转账成功提示
- [ ] 每日限额提示

### 9.5 交易记录 (TransactionList)

#### 单元测试
- [ ] 渲染交易列表
- [ ] 筛选交易类型
- [ ] 分页

---

## 10. 通知系统 (Notifications)

### 10.1 通知中心 (NotificationCenter)

#### 单元测试
- [ ] 渲染通知列表
- [ ] 筛选通知类型
- [ ] 未读/已读状态
- [ ] 标记已读
- [ ] 全部已读
- [ ] 删除通知
- [ ] 空状态

#### E2E 测试
- [ ] 用户打开通知中心
- [ ] 用户标记通知已读
- [ ] 用户点击通知跳转

### 10.2 通知徽标 (NotificationBadge)

#### 单元测试
- [ ] 显示未读数量
- [ ] 数量 > 99 显示 99+
- [ ] 点击打开通知中心

### 10.3 通知偏好 (NotificationPrefs)

#### 单元测试
- [ ] 渲染偏好列表
- [ ] 启用/禁用通知类型
- [ ] 推送开关
- [ ] 声音开关

#### E2E 测试
- [ ] 用户配置通知偏好
- [ ] 保存成功提示

### 10.4 Toast 容器 (ToastContainer)

#### 单元测试
- [ ] 显示 toast
- [ ] 自动关闭
- [ ] 手动关闭
- [ ] 多个 toast 堆叠

---

## 11. 短消息系统 (PM)

### 11.1 对话列表 (ConversationList)

#### 单元测试
- [ ] 渲染对话列表
- [ ] 显示未读数
- [ ] 显示最后消息
- [ ] 空状态

#### E2E 测试
- [ ] 用户浏览对话列表
- [ ] 用户点击对话进入详情

### 11.2 对话详情 (ConversationDetail)

#### 单元测试
- [ ] 渲染消息列表
- [ ] 发送消息
- [ ] 消息已读状态
- [ ] 输入状态指示
- [ ] 滚动到底部

#### E2E 测试
- [ ] 用户发送消息
- [ ] 用户接收消息 (实时)
- [ ] 消息自动标记已读

### 11.3 实时短消息 (RealtimePM)

#### 单元测试
- [ ] WebSocket 连接
- [ ] 接收新消息
- [ ] 发送消息
- [ ] 正在输入状态
- [ ] 消息已读回执

---

## 12. 搜索系统 (Search)

### 12.1 全局搜索栏 (SearchBar)

#### 单元测试
- [ ] 输入关键词
- [ ] 显示建议下拉
- [ ] 快捷搜索选项
- [ ] 回车搜索

#### E2E 测试
- [ ] 用户搜索主题
- [ ] 用户搜索用户
- [ ] 用户点击建议

### 12.2 搜索结果页 (SearchResultsPage)

#### 单元测试
- [ ] 渲染搜索结果
- [ ] 分组显示 (主题/帖子/用户)
- [ ] 高亮关键词
- [ ] 分页

#### E2E 测试
- [ ] 用户查看搜索结果
- [ ] 用户点击结果跳转

### 12.3 高级搜索 (AdvancedSearchPage)

#### 单元测试
- [ ] 渲染筛选表单
- [ ] 日期范围选择
- [ ] 版块选择
- [ ] 排序选择

#### E2E 测试
- [ ] 用户使用高级搜索
- [ ] 用户筛选结果

### 12.4 搜索历史 (SearchHistory)

#### 单元测试
- [ ] 渲染历史记录
- [ ] 点击历史搜索
- [ ] 清除历史

### 12.5 热门搜索 (HotSearch)

#### 单元测试
- [ ] 渲染热门标签
- [ ] 点击标签搜索

---

## 13. Hooks 和工具函数

### 13.1 useAuth Hook

#### 单元测试
- [ ] 返回用户信息
- [ ] 返回登录状态
- [ ] 返回权限检查
- [ ] 登录函数
- [ ] 登出函数

```typescript
// src/shared/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores/authStore';

describe('useAuth Hook', () => {
  it('should return user when authenticated', () => {
    useAuthStore.getState().setAuth({ accessToken: 'token' }, { id: 1, username: 'test' });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({ id: 1, username: 'test' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('username', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    useAuthStore.getState().setAuth({ accessToken: 'token' }, { id: 1 });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### 13.2 usePermission Hook

#### 单元测试
- [ ] 检查权限返回布尔值
- [ ] 版主权限检查
- [ ] 管理员权限检查

### 13.3 useWebSocket Hook

#### 单元测试
- [ ] 建立连接
- [ ] 监听事件
- [ ] 发送消息
- [ ] 断开连接
- [ ] 重连机制

### 13.4 useNotifications Hook

#### 单元测试
- [ ] 获取通知列表
- [ ] 获取未读数
- [ ] 标记已读
- [ ] 删除通知

### 13.5 useDebounce Hook

#### 单元测试
- [ ] 延迟执行
- [ ] 取消执行
- [ ] 立即执行

### 13.6 useInfiniteScroll Hook

#### 单元测试
- [ ] 触发加载更多
- [ ] 加载状态
- [ ] 是否还有更多

### 13.7 日期格式化 (formatDate)

#### 单元测试
- [ ] 格式化为 yyyy-MM-dd
- [ ] 格式化为相对时间
- [ ] 处理时区

```typescript
// src/shared/utils/date.test.ts
import { formatDate, formatRelativeTime, formatPostTime } from './date';

describe('Date Utils', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-02-07T10:30:00Z');
    expect(formatDate(date, 'yyyy-MM-dd HH:mm')).toBe('2026-02-07 18:30');
  });

  it('should format relative time', () => {
    const date = new Date(Date.now() - 1000 * 60 * 5); // 5分钟前
    expect(formatRelativeTime(date)).toContain('5分钟前');
  });

  it('should show relative time for recent posts', () => {
    const date = new Date(Date.now() - 1000 * 60 * 30); // 30分钟前
    expect(formatPostTime(date)).toContain('30分钟前');
  });

  it('should show absolute time for old posts', () => {
    const date = new Date('2025-01-01T10:00:00Z');
    expect(formatPostTime(date)).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
```

### 13.8 数字格式化 (formatNumber)

#### 单元测试
- [ ] 格式化大数字 (1.2k)
- [ ] 格式化货币
- [ ] 格式化百分比

### 13.9 className 合并 (cn)

#### 单元测试
- [ ] 合并多个 className
- [ ] 条件 className
- [ ] 覆盖冲突的类

```typescript
// src/shared/utils/cn.test.ts
import { cn } from './cn';

describe('cn utility', () => {
  it('should merge classnames', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should override tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
```

### 13.10 验证函数 (validation)

#### 单元测试
- [ ] 邮箱验证
- [ ] 用户名验证
- [ ] URL 验证
- [ ] 密码强度验证

---

## 14. 移动端适配 (Mobile)

### 14.1 响应式布局

#### 单元测试
- [ ] 移动端 Header
- [ ] 移动端导航
- [ ] 响应式断点

#### 视觉测试
- [ ] 移动端截图对比
- [ ] 平板端截图对比

### 14.2 触摸手势

#### 单元测试
- [ ] 滑动手势
- [ ] 下拉刷新
- [ ] 侧滑菜单

### 14.3 MOC 组件

#### 单元测试
- [ ] MOC 主题卡片
- [ ] MOC 版块列表
- [ ] MOC 帖子卡片

---

## 15. 关键用户流程 E2E

### 15.1 完整注册流程

```typescript
// e2e/flows/registration.spec.ts
test.describe('User Registration Flow', () => {
  test('complete registration process', async ({ page }) => {
    // 1. 访问注册页面
    await page.goto('/user/register');
    await expect(page).toHaveURL('/user/register');

    // 2. 填写注册表单
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'StrongPass123');
    await page.fill('input[name="confirmPassword"]', 'StrongPass123');

    // 3. 密码强度指示
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('强');

    // 4. 同意服务条款
    await page.check('input[name="agreeTerms"]');

    // 5. 提交注册
    await page.click('button[type="submit"]');

    // 6. 注册成功跳转首页
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('newuser');
  });
});
```

### 15.2 完整发帖流程

```typescript
// e2e/flows/create-thread.spec.ts
test.describe('Create Thread Flow', () => {
  test('user creates a new thread', async ({ page }) => {
    // 1. 登录
    await login(page, 'testuser', 'password');

    // 2. 进入版块
    await page.goto('/forum/1');

    // 3. 点击发帖按钮
    await page.click('[data-testid="create-thread-btn"]');

    // 4. 填写标题
    await page.fill('input[name="title"]', 'Test Thread Title');

    // 5. 填写内容
    const editor = page.locator('[data-testid="bbcode-editor"]');
    await editor.fill('This is test content');

    // 6. 添加标签
    await page.fill('input[name="tags"]', 'test');

    // 7. 提交
    await page.click('[data-testid="submit-thread"]');

    // 8. 验证成功
    await expect(page.locator('h1')).toContainText('Test Thread Title');
    await expect(page.locator('.post-content')).toContainText('This is test content');
  });
});
```

### 15.3 完整回复流程

```typescript
// e2e/flows/reply-thread.spec.ts
test.describe('Reply Thread Flow', () => {
  test('user replies to a thread', async ({ page }) => {
    await login(page);
    await page.goto('/thread/123');

    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 填写回复
    await page.fill('[data-testid="reply-editor"]', 'This is a reply');

    // 提交
    await page.click('[data-testid="submit-reply"]');

    // 验证回复显示
    await expect(page.locator('.post-content').last()).toContainText('This is a reply');
  });
});
```

### 15.4 版主操作流程

```typescript
// e2e/flows/moderation.spec.ts
test.describe('Moderation Flow', () => {
  test('moderator sticks and digests thread', async ({ page }) => {
    await loginAsModerator(page);
    await page.goto('/thread/123');

    // 打开操作菜单
    await page.click('[data-testid="moderation-menu"]');

    // 置顶
    await page.click('[data-testid="action-sticky"]');
    await page.fill('[data-testid="reason-input"]', '置顶公告');
    await page.click('[data-testid="confirm-action"]');

    // 验证置顶图标
    await expect(page.locator('[data-testid="icon-sticky"]')).toBeVisible();

    // 加精
    await page.click('[data-testid="moderation-menu"]');
    await page.click('[data-testid="action-digest"]');
    await page.click('[data-testid="confirm-action"]');

    // 验证精华图标
    await expect(page.locator('[data-testid="icon-digest"]')).toBeVisible();
  });
});
```

### 15.5 Pokemon 完整流程

```typescript
// e2e/flows/pokemon.spec.ts
test.describe('Pokemon Journey Flow', () => {
  test('user gets pokemon, trains and battles', async ({ page }) => {
    await login(page);

    // 1. 访问 Pokemon 中心
    await page.goto('/pokemon/center');

    // 2. 领取初始宠物
    await page.click('[data-testid="get-starter-pokemon"]');
    await page.click('[data-testid="choose-pikachu"]');
    await page.click('[data-testid="confirm-choose"]');

    // 3. 查看我的宠物
    await page.goto('/pokemon/my');
    await expect(page.locator('[data-testid="pokemon-card"]')).toHaveCount(1);

    // 4. 训练宠物
    await page.click('[data-testid="train-pokemon"]');
    await expect(page.locator('[data-testid="exp-gain"]')).toBeVisible();

    // 5. 发起战斗
    await page.goto('/pokemon/battle/wild');
    await page.click('[data-testid="start-battle"]');

    // 6. 使用技能
    await page.click('[data-testid="skill-tackle"]');

    // 7. 战斗结束
    await expect(page.locator('[data-testid="battle-result"]')).toBeVisible({ timeout: 30000 });
  });
});
```

### 15.6 银行完整流程

```typescript
// e2e/flows/bank.spec.ts
test.describe('Bank Flow', () => {
  test('user deposits, transfers and withdraws', async ({ page }) => {
    await login(page);
    await page.goto('/bank');

    // 1. 查看初始余额
    const initialBalance = await page.locator('[data-testid="balance"]').textContent();

    // 2. 存款
    await page.click('[data-testid="deposit-btn"]');
    await page.fill('input[name="amount"]', '1000');
    await page.click('[data-testid="confirm-deposit"]');

    // 验证余额增加
    await expect(page.locator('[data-testid="balance"]')).not.toHaveText(initialBalance!);

    // 3. 转账
    await page.click('[data-testid="transfer-btn"]');
    await page.fill('input[name="username"]', 'testuser2');
    await page.fill('input[name="amount"]', '500');
    await page.fill('input[name="note"]', 'Test transfer');
    await page.click('[data-testid="confirm-transfer"]');

    // 验证转账成功
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('转账成功');

    // 4. 取款
    await page.click('[data-testid="withdraw-btn"]');
    await page.fill('input[name="amount"]', '200');
    await page.click('[data-testid="confirm-withdraw"]');

    // 验证取款成功
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('取款成功');
  });
});
```

### 15.7 搜索流程

```typescript
// e2e/flows/search.spec.ts
test.describe('Search Flow', () => {
  test('user searches and views results', async ({ page }) => {
    await login(page);

    // 1. 使用全局搜索
    await page.fill('[data-testid="global-search"]', 'pokemon');
    await page.press('[data-testid="global-search"]', 'Enter');

    // 2. 查看结果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // 3. 点击结果
    await page.click('[data-testid="search-result-0"]');
    await expect(page).toHaveURL(/\/thread\/\d+/);
  });
});
```

---

## 16. 可访问性测试 (A11y)

### 16.1 键盘导航

#### E2E 测试
- [ ] Tab 键遍历所有交互元素
- [ ] Enter/Space 激活按钮
- [ ] Escape 关闭 modal

### 16.2 屏幕阅读器

#### E2E 测试
- [ ] 正确的 ARIA 标签
- [ ] 语义化 HTML
- [ ] 焦点管理

### 16.3 颜色对比

#### 视觉测试
- [ ] WCAG AA 标准
- [ ] 色盲模式测试

---

## 17. 性能测试

### 17.1 首屏加载

#### E2E 测试
- [ ] Lighthouse 性能分数 > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### 17.2 大列表渲染

#### E2E 测试
- [ ] 虚拟滚动 1000+ 项
- [ ] 帧率 > 30fps

---

## 18. 测试工具配置

### 18.1 Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### 18.2 Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### 18.3 测试工具函数

```typescript
// src/test/utils.ts
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper, ...options });
}

// Mock fixtures
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.png',
  groupId: 2,
};

export const mockThread = {
  id: 123,
  title: 'Test Thread',
  content: 'Test content',
  authorId: 1,
  forumId: 1,
  createdAt: '2026-02-07T10:00:00Z',
};

// Login helper for E2E
export async function login(page, username = 'testuser', password = 'password') {
  await page.goto('/user/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function loginAsModerator(page) {
  await login(page, 'moderator', 'password');
}

export async function loginAsAdmin(page) {
  await login(page, 'admin', 'password');
}
```

---

## 19. 测试执行计划

### 19.1 单元测试
- 执行方式：每个 PR 运行
- 覆盖率要求：≥80%
- 执行时间：< 5分钟

### 19.2 组件测试
- 执行方式：每个 PR 运行
- 覆盖率要求：≥80%
- 执行时间：< 10分钟

### 19.3 E2E 测试
- 执行方式：每个 PR 运行关键流程
- 覆盖率要求：关键流程 100%
- 执行时间：< 15分钟

### 19.4 完整测试
- 执行方式：合并前/发布前
- 全量测试套件
- 执行时间：< 30分钟

---

## 20. 测试用例统计

| 分类 | 测试数量 | 说明 |
|------|----------|------|
| 基础组件 | 60+ | 每个组件 5-8 个测试 |
| 布局组件 | 15+ | Layout 组件测试 |
| 认证页面 | 20+ | 登录/注册/重置 |
| 论坛页面 | 40+ | 列表/详情/编辑器 |
| 用户中心 | 25+ | UserCP 各页面 |
| 版主面板 | 20+ | ModCP 操作 |
| 管理后台 | 30+ | AdminCP 功能 |
| Pokemon | 35+ | 完整游戏系统 |
| 银行 | 20+ | 存取款转账 |
| 通知系统 | 15+ | 通知/Toast |
| 短消息 | 15+ | 对话/实时 |
| 搜索 | 15+ | 搜索/筛选 |
| Hooks | 25+ | 核心 Hook 测试 |
| 工具函数 | 30+ | 格式化/验证 |
| 移动端 | 15+ | 响应式/触摸 |
| 关键流程 E2E | 15+ | 完整用户流程 |
| 可访问性 | 10+ | A11y 测试 |
| **总计** | **395+** | **完整覆盖** |

---

## 下一步

测试用例规划完成后，可以开始 TDD 开发流程：
1. 编写测试用例
2. 运行测试（预期失败）
3. 编写最小实现
4. 运行测试（预期通过）
5. 重构优化
