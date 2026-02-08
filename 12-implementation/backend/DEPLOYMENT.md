# 部署指南

本文档描述如何部署 PokeTB Forum 后端服务到生产环境。

## 目录

- [环境准备](#环境准备)
- [环境变量配置](#环境变量配置)
- [数据库配置](#数据库配置)
- [构建与部署](#构建与部署)
- [Docker 部署](#docker-部署)
- [性能优化](#性能优化)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)

## 环境准备

### 系统要求

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6（可选，用于缓存）
- 至少 2GB RAM
- 至少 10GB 磁盘空间

### 依赖服务

1. **PostgreSQL 数据库**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # CentOS/RHEL
   sudo yum install postgresql-server
   sudo postgresql-setup initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Redis（可选）**
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server

   # CentOS/RHEL
   sudo yum install redis
   sudo systemctl start redis
   sudo systemctl enable redis
   ```

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 应用配置
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/poketb_forum

# JWT 配置
JWT_ACCESS_SECRET=your-secure-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 加密配置
ENCRYPTION_KEY=your-secure-encryption-key-min-32-chars
HASH_SALT=your-secure-salt-min-16-chars

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# CORS 配置
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 日志配置
LOG_LEVEL=info
```

### 生成安全密钥

使用以下命令生成安全的随机密钥：

```bash
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 生成加密密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成哈希盐
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 数据库配置

### 1. 创建数据库

```bash
# 登录到 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE poketb_forum;
CREATE USER poketb_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE poketb_forum TO poketb_user;
\q
```

### 2. 运行迁移

```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate
```

### 3. 填充初始数据（可选）

```bash
pnpm db:seed
```

## 构建与部署

### 1. 安装依赖

```bash
pnpm install --production=false
```

### 2. 构建项目

```bash
pnpm build
```

### 3. 使用 PM2 运行（推荐）

安装 PM2：

```bash
npm install -g pm2
```

创建 ecosystem 配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'poketb-forum-backend',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
  }],
};
```

启动服务：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

常用命令：

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs poketb-forum-backend

# 重启服务
pm2 restart poketb-forum-backend

# 停止服务
pm2 stop poketb-forum-backend

# 删除服务
pm2 delete poketb-forum-backend
```

### 4. 使用 Systemd 运行

创建服务文件 `/etc/systemd/system/poketb-forum.service`：

```ini
[Unit]
Description=PokeTB Forum Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/poketb-forum/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/poketb-forum/backend/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable poketb-forum
sudo systemctl start poketb-forum
```

## Docker 部署

### 1. 构建 Docker 镜像

```bash
docker build -t poketb-forum-backend:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name poketb-forum-backend \
  -p 3001:3001 \
  --env-file .env \
  --restart unless-stopped \
  poketb-forum-backend:latest
```

### 3. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - HASH_SALT=${HASH_SALT}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=poketb_forum
      - POSTGRES_USER=poketb_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

运行：

```bash
docker-compose up -d
```

## 性能优化

### 1. 数据库优化

- 使用连接池
- 配置适当的缓存大小
- 定期运行 VACUUM
- 创建适当的索引

### 2. 应用优化

- 启用集群模式（PM2）
- 使用 Redis 缓存
- 启用 Gzip 压缩
- 配置适当的日志级别

### 3. Nginx 反向代理

```nginx
upstream poketb_backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name api.poketb.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://poketb_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 监控与日志

### 1. 日志管理

日志文件位置：
- 应用日志：`logs/combined.log`
- 错误日志：`logs/error.log`
- 异常日志：`logs/exceptions.log`
- PM2 日志：`logs/pm2-*.log`

### 2. 监控工具

推荐使用：
- **PM2 Monitor**: `pm2 monit`
- **Grafana + Prometheus**: 应用指标监控
- **Sentry**: 错误追踪
- **ELK Stack**: 日志聚合

### 3. 健康检查

定期检查服务状态：

```bash
curl http://localhost:3001/api/health
```

## 故障排查

### 1. 服务无法启动

```bash
# 检查端口占用
netstat -tulpn | grep 3001

# 检查日志
tail -f logs/error.log

# 检查环境变量
pnpm check-env
```

### 2. 数据库连接失败

```bash
# 测试数据库连接
psql -U poketb_user -d poketb_forum -h localhost

# 检查 PostgreSQL 状态
sudo systemctl status postgresql
```

### 3. 内存不足

```bash
# 检查内存使用
free -h

# 检查进程内存
ps aux --sort=-%mem | head

# 调整 PM2 内存限制
pm2 reset poketb-forum-backend
```

### 4. 性能问题

```bash
# 检查数据库查询
# 在 .env 中设置
LOG_LEVEL=debug

# 分析慢查询
sudo -u postgres psql -d poketb_forum -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

2. **使用 HTTPS**
   - 配置 SSL 证书
   - 强制 HTTPS 重定向

3. **限制访问**
   - 配置防火墙规则
   - 使用 IP 白名单

4. **备份策略**
   - 定期备份数据库
   - 备份配置文件
   - 测试恢复流程

5. **监控异常**
   - 设置告警规则
   - 定期审查日志

## 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 运行迁移
pnpm prisma:migrate

# 重新构建
pnpm build

# 重启服务
pm2 restart poketb-forum-backend
```

## 回滚策略

如果部署出现问题：

```bash
# 回滚到上一个版本
git revert HEAD

# 或者切换到特定版本
git checkout <previous-tag>

# 重新构建和部署
pnpm install
pnpm build
pm2 restart poketb-forum-backend
```
