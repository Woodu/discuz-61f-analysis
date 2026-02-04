# 论坛核心功能深入分析 - include核心库

## include/newthread.inc.php
新主题创建处理逻辑
- 数据验证
- 特殊主题初始化
- 数据库插入
- 缓存更新

## include/newreply.inc.php
回复处理逻辑
- 回复验证
- 辩论帖处理
- 统计更新
- 通知发送

## include/editpost.inc.php
编辑处理逻辑
- 权限验证
- 编辑历史
- 差异计算

## include/post.func.php
发帖相关函数库
- checkpost() - 帖子验证
- checkbbcodes() - BBCode检查
- updatepostcredits() - 积分更新
- attachment_upload() - 附件上传

## include/misc.func.php
杂项函数库
- formulaperm() - 公式权限
- payment() - 付费处理
- sendpm() - 发送消息
- email() - 邮件发送

### 关键函数调用关系
post.php → post.func.php → newthread/newreply/editpost.inc.php

