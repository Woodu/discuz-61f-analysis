# 论坛核心功能深入分析 - misc.php等其他功能

## misc.php - 杂项功能集合

### 主要action
1. fav - 收藏管理
2. rate - 评分功能
3. report - 举报
4. attach - 附件购买
5. notice - 公告详情
6. faq - 帮助文档

## space.php - 个人空间
- 用户信息展示
- 个人动态
- 发帖统计
- 隐私设置

## tag.php - 标签功能
- 标签创建
- 跨应用同步(UCenter)
- 标签浏览

## ajax.php - AJAX处理
- 验证码处理
- 用户名/邮箱验证
- 邀请码验证
- 实时表单验证

### 输出格式
- 统一使用showmessage
- JSON格式(部分)
- HTML片段

### 性能考虑
- Cookie缓存
- 最小化查询
- 异步请求

