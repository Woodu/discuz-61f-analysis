# 开发规范文档

本目录包含 PokeTB Forum 项目的开发规范文档，供开发团队参考。

## 文档说明

### 后端规范
- **backend-development-standards.md** - 后端开发完整规范
  - 认证集成规范
  - 用户 ID 访问规范
  - 模块导入规范
  - 错误处理规范
  - API 响应格式规范
  - 数据库访问规范

- **backend-quick-reference.md** - 后端快速参考卡片
  - 认证集成快速检查
  - 常见错误对照
  - 新模块检查清单

### 前端规范
- **frontend-development-standards.md** - 前端开发完整规范
  - API 调用规范
  - React Query Hooks 规范
  - 组件开发规范
  - 类型定义规范
  - 目录结构规范

- **frontend-quick-reference.md** - 前端快速参考卡片
  - API 客户端选择
  - URL 参数处理
  - React Query 模板
  - 常见错误

## 开发方法论

本项目采用 **TDD (测试驱动开发) + 子进程** 的开发模式：

1. **先写测试** - 在实现功能前先编写测试用例
2. **使用子进程** - 通过 Task tool 创建专用代理
3. **确保测试通过** - 每个阶段完成后所有测试必须通过

## 核心规则速查

### 后端
- ✅ 使用 `authMiddleware` 包裹需要认证的路由
- ✅ 从 `ctx.state.user.userId` 获取用户ID（不是 `ctx.state.userId`）
- ✅ 使用 ES6 `import` 而非 `require()`
- ✅ 使用标准错误类型（`ValidationError`, `NotFoundError` 等）

### 前端
- ✅ API 调用使用 `authApiClient`（不要用原始 `axios`）
- ✅ URL 参数作为字符串拼接（不用 axios 风格的 params）
- ✅ 创建对应的 React Query hooks
- ✅ API 函数放在 `features/{feature}/api/` 目录

## 文档版本

- 创建时间: 2026-02-11
- 最后更新: 2026-02-11
- 版本: 1.0

---

**注意**: 本目录中的文档是从实际项目代码库 (`poketb-renew/backend/docs` 和 `poketb-renew/frontend/docs`) 复制而来，如需更新请同步修改源文件。
