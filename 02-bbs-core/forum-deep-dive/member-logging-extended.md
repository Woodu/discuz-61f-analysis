# 论坛核心功能深入分析 - member.php & logging.php

## member.php - 用户系统

### 主要action
1. register - 用户注册
   - 表单验证
   - UCenter注册
   - 本地记录同步
   - 邮件验证(可选)

2. viewprofile - 查看资料
   - 用户信息查询
   - 统计数据
   - 个人设置

3. memberlist - 会员列表
   - 分页显示
   - 搜索功能
   - 排序选项

4. credits - 积分详情
   - 各类积分显示
   - 积分规则
   - 变动记录

5. lostpasswd - 找回密码
   - 验证安全问题
   - 生成重置令牌
   - 发送邮件

6. activate - 激活账号
   - 邮箱验证
   - 积分自动分组

7. groupexpiry - 用户组过期处理
   - 自动切换回默认组

## logging.php - 登录认证

### 主要action
1. login - 用户登录
   - 失败限制(15分钟5次)
   - UCenter认证
   - 本地验证
   - 安全问题
   - Session创建
   - Cookie设置

2. logout - 登出
   - UCenter同步登出
   - 清除Cookie
   - 重置状态

### 安全机制
- formhash防CSRF
- IP级别失败限制
- MD5密码哈希
- 安全问题加密

### UCenter集成
- uc_user_login
- uc_user_synlogin
- uc_user_synlogout

