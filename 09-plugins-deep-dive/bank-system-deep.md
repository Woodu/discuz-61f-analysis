# Bank银行系统深度分析

## 1. 系统概述

银行系统是一个简单的论坛经济插件，允许用户存取款、转账并获得利息。

## 2. 文件结构

```
bbs/plugins/bank/
├── bank.func.php           # 银行核心函数库 (129行)
├── admin.inc.php            # 后台管理
├── basic.inc.php           # 基础功能
├── basic.inc.inc.php       # 基础功能(包含)
├── other.inc.php           # 其他功能
├── setup.inc.php           # 安装/配置
└── bank.lang.php           # 语言包
```

## 3. 核心函数分析 (bank.func.php)

### 3.1 利息计算函数

```php
/**
 * 计算活期利息
 * @param int $moneynum 存款金额
 * @param int $begintime 存款时间戳
 * @return array ['all'=>总利息, 'bank'=>银行利息, 'system'=>系统利息]
 */
function hack_accrualCur($moneynum, $begintime) {
    global $hackVars, $bankinfo, $timestamp;

    $tempinfo = array();
    $tempinfo['all'] = $tempinfo['bank'] = $tempinfo['system'] = 0;

    // 获取当前利率
    $currate = hack_showMyCur($moneynum);

    // 计算存款天数
    $daynum = floor(($timestamp - $begintime) / 86400);

    if($moneynum > 0 && $daynum > 0 && $currate > 0) {
        // 总利息 = 本金 × 利率 × 天数
        $tempinfo['all'] = floor($moneynum * $currate * $daynum);

        // 利息分配逻辑
        if($hackVars['currentaccrual'] >= $currate) {
            // 系统承担全部利息
            $tempinfo['system'] = $tempinfo['all'];
        } elseif($hackVars['currentaccrual'] > 0) {
            // 系统部分承担
            $tempinfo['system'] = floor($moneynum * $hackVars['currentaccrual'] * $daynum);
            $tempinfo['bank'] = $tempinfo['all'] - $tempinfo['system'];
        } else {
            // 银行承担全部利息
            $tempinfo['bank'] = $tempinfo['all'];
        }
    }

    return $tempinfo;
}

/**
 * 计算定期利息
 * @param int $moneynum 存款金额
 * @param float $rate 利率
 * @param int $begintime 存款时间
 * @param int $endtime 到期时间
 * @return array
 */
function hack_accrualFix($moneynum, $rate, $begintime, $endtime) {
    global $hackVars, $timestamp;

    $tempinfo = array();
    $tempinfo['all'] = $tempinfo['bank'] = $tempinfo['system'] = 0;

    // 检查是否到期
    if($endtime <= $timestamp) {
        $daynum = floor(($endtime - $begintime) / 86400);

        if($moneynum > 0 && $daynum > 0 && $rate > 0) {
            $tempinfo['all'] = floor($moneynum * $rate * $daynum);

            // 利息分配逻辑
            if($hackVars['fixedaccrual'] >= $rate) {
                $tempinfo['system'] = $tempinfo['all'];
            } elseif($hackVars['fixedaccrual'] > 0) {
                $tempinfo['system'] = floor($moneynum * $hackVars['fixedaccrual'] * $daynum);
                $tempinfo['bank'] = $tempinfo['all'] - $tempinfo['system'];
            } else {
                $tempinfo['bank'] = $tempinfo['all'];
            }
        }
    }

    return $tempinfo;
}

/**
 * 计算预期利息
 */
function hack_accrualLen($moneynum, $rate, $begintime, $endtime) {
    global $timestamp;

    $tempinfo = 0;
    if($begintime < $timestamp) {
        $daynum = ceil(($timestamp - $begintime) / 86400);
        $tempinfo = ceil($moneynum * $rate * $daynum);

        // 超期额外利息
        if($endtime < $timestamp) {
            $moredaynum = ceil(($timestamp - $endtime) / 86400);
            $tempinfo = $tempinfo + ceil($moneynum * $rate * $moredaynum);
        }
    }

    return $tempinfo;
}
```

### 3.2 利率查询函数

```php
/**
 * 获取用户当前适用利率
 * @param int $moneynum 存款金额
 * @return float 利率
 */
function hack_showMyCur($moneynum) {
    global $bankinfo;

    // 按金额分档的利率表
    // 例如: 1000以下0.001, 1000-10000 0.002, 10000以上 0.003
    $temprate = $bankinfo['currentrate'];

    // 降序排列
    krsort($temprate);

    // 找到适用的利率
    foreach($temprate as $key => $value) {
        if($moneynum >= $key) {
            return $value;
        }
    }

    return 0;
}
```

**利率表示例**:
```php
$currentrate = array(
    100000 => 0.005,    // 10万以上: 0.5%/天
    10000 => 0.003,     // 1-10万: 0.3%/天
    1000 => 0.002,      // 1千-1万: 0.2%/天
    0 => 0.001,         // 1千以下: 0.1%/天
);
```

### 3.3 日志记录函数

```php
/**
 * 写入银行操作日志
 * @param int $bank 银行ID
 * @param float $num 金额
 * @param string $log 日志信息
 * @param int $issys 是否系统操作
 * @param string $other 对方用户
 */
function hack_writeBanklog($bank, $num, $log, $issys = 0, $other = '') {
    global $db, $tablepre, $discuz_uid, $discuz_user, $timestamp, $onlineip;

    $db->query("INSERT INTO {$tablepre}banklog
        (uid, username, bankid, issystem, opnum, remark, otheruser, optime, opip)
        VALUES
        ('$discuz_uid', '$discuz_user', '$bank', '$issys', '$num', '$log', '$other', '$timestamp', '$onlineip')"
    );
}
```

### 3.4 存款同步函数

```php
/**
 * 更新用户存款字段
 * @param int $intuid 用户ID
 */
function hack_updateDeposit($intuid = 0) {
    global $db, $tablepre, $discuz_uid, $depositcredits;

    if($intuid == 0) {
        $intuid = $discuz_uid;
    }

    // 计算用户在银行的总存款
    $query = $db->query("SELECT SUM(opnum) FROM {$tablepre}bankoperation
                            WHERE uid='$intuid' AND optype<'2'");
    $datanum = $db->result($query, 0);
    $datanum = intval($datanum);

    // 更新用户表的存款字段
    $db->query("UPDATE {$tablepre}members
                SET $depositcredits=$datanum
                WHERE uid='$intuid'");
}
```

## 4. 数据表结构

### 4.1 cdb_bank (银行账户表)

```sql
CREATE TABLE cdb_bank (
    uid INT UNSIGNED NOT NULL PRIMARY KEY,
    bankid TINYINT UNSIGNED NOT NULL DEFAULT '0',
    amount DECIMAL(10,2) NOT NULL DEFAULT '0.00',
    begintime INT UNSIGNED NOT NULL DEFAULT '0',
    endtime INT UNSIGNED NOT NULL DEFAULT '0',
    interestrate DECIMAL(10,4) NOT NULL DEFAULT '0.0000',
    KEY idx_bankid (bankid)
);
```

### 4.2 cdb_banklog (银行日志表)

```sql
CREATE TABLE cdb_banklog (
    logid INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uid INT UNSIGNED NOT NULL,
    username VARCHAR(50) NOT NULL,
    bankid TINYINT UNSIGNED NOT NULL,
    issystem TINYINT UNSIGNED NOT NULL DEFAULT '0',
    opnum DECIMAL(10,2) NOT NULL,
    remark VARCHAR(255) NOT NULL,
    otheruser VARCHAR(50) NOT NULL,
    optime INT UNSIGNED NOT NULL,
    opip VARCHAR(15) NOT NULL,
    KEY idx_uid (uid),
    KEY idx_optime (optime)
);
```

## 5. 业务流程

### 5.1 存款流程

```
用户输入金额
    ↓
检查金额有效性
    ↓
检查是否有足够积分
    ↓
扣除用户积分
    ↓
插入银行记录
    ↓
写入日志
    ↓
显示成功信息
```

### 5.2 取款流程

```
用户输入金额
    ↓
检查金额有效性
    ↓
检查是否有足够存款
    ↓
计算已产生利息
    ↓
发放利息
    ↓
扣除银行存款
    ↓
增加用户积分
    ↓
删除/更新银行记录
    ↓
写入日志
    ↓
显示成功信息
```

### 5.3 转账流程

```
用户输入对方用户名和金额
    ↓
验证对方用户存在
    ↓
检查转账金额
    ↓
检查自己余额
    ↓
执行转账(扣款→存款)
    ↓
写入双方日志
    ↓
发送通知消息
    ↓
显示成功信息
```

## 6. 插件配置

### 6.1 插件缓存

```php
// forumdata/cache/plugin_bank.php
$_DPLUGIN['bank'] = array(
    'name' => '银行系统',
    'directory' => 'bank',
    'copyright' => 'LFLY1573',
    'version' => '1.0',
    'available' => 1,
    'adminid' => 1,
    'modules' => array(),
    'vars' => array(
        'open' => 1,
        'currentrate' => array(
            100000 => '0.005',
            10000 => '0.003',
            1000 => '0.002',
            0 => '0.001'
        ),
        'fixedrate' => array(
            90 => '0.008',
            180 => '0.015',
            360 => '0.025'
        ),
        'currentaccrual' => '0.0001',
        'fixedaccrual' => '0',
        'transferfee' => '0.01',
        'mindeposit' => '100',
        'maxdeposit' => '1000000',
    ),
);
```

## 7. React实现

```typescript
// 银行服务
// services/bank.service.ts
import { prisma } from '@/lib/prisma';

export class BankService {
  /**
   * 存款
   */
  async deposit(userId: number, amount: number, creditType: string) {
    // 1. 检查用户余额
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { extcredits1: true, extcredits2: true, ... }
    });

    if (user.extcredits1 < amount) {
      throw new Error('余额不足');
    }

    // 2. 计算利率
    const rate = this.getInterestRate(amount);

    // 3. 执行事务
    return await prisma.$transaction(async (tx) => {
      // 扣除用户积分
      await tx.user.update({
        where: { id: userId },
        data: { extcredits1: { decrement: amount } }
      });

      // 创建银行记录
      await tx.bankAccount.create({
        data: {
          userId,
          amount,
          interestRate: rate,
          beginTime: new Date(),
        }
      });

      // 记录日志
      await tx.bankLog.create({
        data: {
          userId,
          operation: 'DEPOSIT',
          amount,
          remark: '存款',
        }
      });
    });
  }

  /**
   * 取款 (带利息)
   */
  async withdraw(userId: number, bankAccountId: number) {
    const account = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId }
    });

    if (account.userId !== userId) {
      throw new Error('无权操作此账户');
    }

    // 计算利息
    const interest = this.calculateInterest(
      account.amount,
      account.interestRate,
      account.beginTime,
      new Date()
    );

    const total = account.amount + interest;

    return await prisma.$transaction(async (tx) => {
      // 增加用户积分
      await tx.user.update({
        where: { id: userId },
        data: { extcredits1: { increment: total } }
      });

      // 删除银行记录
      await tx.bankAccount.delete({
        where: { id: bankAccountId }
      });

      // 记录日志
      await tx.bankLog.create({
        data: {
          userId,
          operation: 'WITHDRAW',
          amount: account.amount,
          interest: interest,
          total,
        }
      });
    });
  }

  /**
   * 获取适用利率
   */
  private getInterestRate(amount: number): number {
    const rates = [
      { threshold: 100000, rate: 0.005 },
      { threshold: 10000, rate: 0.003 },
      { threshold: 1000, rate: 0.002 },
      { threshold: 0, rate: 0.001 },
    ];

    for (const { threshold, rate } of rates) {
      if (amount >= threshold) {
        return rate;
      }
    }
    return 0;
  }

  /**
   * 计算利息
   */
  private calculateInterest(
    principal: number,
    rate: number,
    beginTime: Date,
    endTime: Date
  ): number {
    const days = Math.floor((endTime.getTime() - beginTime.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(principal * rate * days);
  }
}

// React组件
// features/bank/components/BankDashboard.tsx
function BankDashboard() {
  const { data: accounts } = useQuery({
    queryKey: ['bank', 'accounts'],
    queryFn: () => bankService.getAccounts(),
  });

  const depositMutation = useMutation({
    mutationFn: (amount: number) => bankService.deposit(user.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank', 'accounts']);
      queryClient.invalidateQueries(['user', 'credits']);
    },
  });

  return (
    <div>
      <h2>我的账户</h2>
      {accounts?.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}

      <DepositForm onSubmit={(amount) => depositMutation.mutate(amount)} />
      <WithdrawForm />
      <TransferForm />
    </div>
  );
}
```

## 8. Prisma Schema

```prisma
// prisma/schema.prisma

model BankAccount {
  id           Int      @id @default(autoincrement())
  userId       Int
  amount       Decimal  @db.Decimal(10, 2)
  interestRate Decimal  @db.Decimal(10, 4)
  beginTime    DateTime
  endTime      DateTime?
  accountType  Int      @default(0) // 0=活期, 1=定期
  user         User     @relation(fields: [userId], references: [id])

  @@index([userId])
}

model BankLog {
  id         Int      @id @default(autoincrement())
  userId     Int
  operation  String
  amount     Decimal  @db.Decimal(10, 2)
  interest   Decimal? @db.Decimal(10, 2)
  total      Decimal? @db.Decimal(10, 2)
  remark     String?
  otherUser  String?
  created    DateTime @default(now())
  ip         String
  user       User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([created])
}
```

## 9. 迁移注意事项

### 9.1 数据迁移SQL

```sql
-- 迁移银行账户
INSERT INTO bank_account (user_id, amount, interest_rate, begin_time, account_type)
SELECT
    uid,
    amount,
    interestrate / 10000,  -- 从万分比转换为小数
    FROM_UNIXTIME(begintime),
    0  -- 假设都是活期
FROM cdb_bank;
```

### 9.2 兼容性处理

```typescript
// 旧版使用 extcredits1-8
// 新版可以简化为 credits 表
// 迁移时需要处理积分类型映射

const CREDIT_TYPE_MAP = {
  1: 'extcredits1',
  2: 'extcredits2',
  // ...
};
```
