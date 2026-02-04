# 银行系统分析

## 系统概述

银行系统是论坛的虚拟货币存储和交易功能，允许用户存取款、转账等操作。

## 文件清单

| 文件 | 说明 |
|------|------|
| bank.php | 银行主页面 |
| bank2.php | 存取款操作 |
| bank3.php | 转账操作 |

## 功能模块

### 1. 存款功能
- 存入论坛积分
- 获得利息
- 存款记录

### 2. 取款功能
- 取出存款
- 取款手续费
- 取款记录

### 3. 转账功能
- 用户间转账
- 转账手续费
- 转账记录

### 4. 账户管理
- 查看余额
- 交易历史
- 账户密码

## 数据表

| 表名 | 说明 |
|------|------|
| cdb_banklist | 用户银行账户 |
| cdb_banklog | 交易日志 |
| cdb_bankoperation | 操作记录 |

## 迁移策略

### 新数据结构
```sql
CREATE TABLE user_bank_accounts (
    id INT PRIMARY KEY,
    user_id INT,
    balance DECIMAL(15,2),
    password_hash VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE bank_transactions (
    id INT PRIMARY KEY,
    account_id INT,
    type ENUM('deposit', 'withdraw', 'transfer'),
    amount DECIMAL(15,2),
    fee DECIMAL(15,2),
    from_user_id INT,
    to_user_id INT,
    note TEXT,
    created_at TIMESTAMP
);
```

### API设计
```
GET    /api/bank/account        # 获取账户信息
POST   /api/bank/deposit        # 存款
POST   /api/bank/withdraw       # 取款
POST   /api/bank/transfer       # 转账
GET    /api/bank/transactions   # 交易记录
```
