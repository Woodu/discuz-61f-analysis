# 数据模型设计 (Prisma Schema)

> **基于 Discuz! 6.1F + Pokemon系统 + 插件系统**
>
> **设计时间**: 2026-02-07

---

## 1. 设计原则

### 1.1 命名规范
- 表名: `PascalCase` (Prisma默认)
- 字段名: `camelCase`
- 外键: `{relation}Id`
- 时间戳: `createdAt`, `updatedAt`

### 1.2 通用字段
```prisma
// 所有表包含的通用字段
id          Int      @id @default(autoincrement())
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

### 1.3 数据类型映射

| MySQL | Prisma | 说明 |
|-------|--------|------|
| VARCHAR(n) | String | 可变字符串 |
| TEXT | String | 长文本 |
| INT | Int | 整数 |
| BIGINT | BigInt | 大整数 |
| TINYINT | Int | 小整数 (0-255) |
| DECIMAL | Decimal | 精确数值 |
| DATETIME | DateTime | 日期时间 |
| TIMESTAMP | DateTime | 时间戳 |

---

## 2. 完整 Prisma Schema

### 2.1 用户系统 (替代 UCenter)

```prisma
// ==================== 用户表 ====================
model User {
  id              Int      @id @default(autoincrement())
  username        String   @unique @db.VarChar(50)
  email           String?  @unique @db.VarChar(100)
  password        String   @db.VarChar(255)

  // 用户组
  groupId         Int      @default(10)
  adminId         Int      @default(0)

  // 基础信息
  gender          Int      @default(0)       // 0=保密 1=男 2=女
  nickname        String?  @db.VarChar(50)   // 昵称
  bio             String?  @db.Text          // 个人简介
  signature       String?  @db.VarChar(500)  // 签名

  // 头像
  avatar          String?  @db.VarChar(255)
  avatarStatus    Int      @default(0)

  // 状态
  status          Int      @default(0)       // 0=正常 1=待验证 2=已禁用
  emailVerified   Boolean  @default(false)
  invisible       Boolean  @default(false)   // 隐身模式

  // 积分 (8个扩展积分)
  credits         Int      @default(0)       // 基础积分
  extCredits1     Int      @default(0)       // 金币 (Pokemon货币)
  extCredits2     Int      @default(0)       // 银币 (银行)
  extCredits3     Int      @default(0)       // 铜币
  extCredits4     Int      @default(0)       // 点券
  extCredits5     Int      @default(0)       // 游戏币
  extCredits6     Int      @default(0)
  extCredits7     Int      @default(0)
  extCredits8     Int      @default(0)

  // 统计
  posts           Int      @default(0)
  threads         Int      @default(0)
  digests         Int      @default(0)       // 精华数
  oltime          Int      @default(0)       // 在线时长(分钟)

  // 时间
  lastVisit       DateTime @default(now())
  lastPost        DateTime?
  lastActivity    DateTime @default(now())
  regDate         DateTime @default(now())
  regIp           String?  @db.VarChar(50)

  // 关系
  sessions        Session[]
  devices         Device[]
  refreshTokens   RefreshToken[]
  roles           UserRole[]
  posts           Post[]
  threads         Thread[]
  sentMessages    PrivateMessage[]      @relation("SentMessages")
  receivedMessages PrivateMessage[]    @relation("ReceivedMessages")
  buddies         Buddy[]              @relation("UserBuddies")
  buddyOf         Buddy[]              @relation("BuddyOfUsers")
  favorites       Favorite[]
  bankAccount     BankAccount?
  pokemonPets     PokemonPet[]
  pokemonDex      PokemonUserDex?
  pokemonItems    PokemonUserItem[]
  pokemonFruits   PokemonUserFruit[]
  medals          UserMedal[]
  logs            UserLoginLog[]
  modLogs         ModLog[]

  @@index([groupId])
  @@index([status])
  @@index([regDate])
  @@map("users")
}

// ==================== 用户组 ====================
model UserGroup {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(50)
  type            String   @default("member") @db.VarChar(20) // member/system/special

  // 积分范围 (自动升级)
  creditsHigher   Int      @default(0)
  creditsLower    Int      @default(0)

  // 显示
  stars           Int      @default(0)
  color           String?  @db.VarChar(20)
  icon            String?  @db.VarChar(255)

  // 基础权限
  allowVisit      Boolean  @default(true)
  readAccess      Int      @default(0)
  allowPost       Boolean  @default(false)
  allowReply      Boolean  @default(false)

  // 主题权限
  allowPostPoll   Boolean  @default(false)
  allowPostReward Boolean  @default(false)
  allowPostTrade  Boolean  @default(false)

  // 附件权限
  allowGetAttach  Boolean  @default(false)
  allowPostAttach Boolean  @default(false)

  // 特殊权限
  allowSearch     Boolean  @default(false)
  allowAnonymous  Boolean  @default(false)

  // 限制
  maxPrice        Int      @default(0)
  maxPmNum        Int      @default(0)
  maxSigSize      Int      @default(0)
  maxBioSize      Int      @default(0)

  // 管理权限
  allowModPost    Boolean  @default(false)
  allowModUser    Boolean  @default(false)
  allowBanUser    Boolean  @default(false)
  allowViewIp     Boolean  @default(false)
  allowStickThread Boolean @default(false)
  allowDigestThread Boolean @default(false)

  users           User[]

  @@index([type])
  @@map("user_groups")
}

// ==================== 管理员组 ====================
model AdminGroup {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(50)

  // 管理权限
  allowEditPost   Boolean  @default(false)
  allowEditPoll   Boolean  @default(false)
  allowDelPost    Boolean  @default(false)
  allowStickReply Boolean  @default(false)
  allowMassPrune  Boolean  @default(false)
  allowRefund     Boolean  @default(false)
  allowCensorWord Boolean  @default(false)
  allowViewIp     Boolean  @default(false)
  allowBanIp      Boolean  @default(false)
  allowBanUser    Boolean  @default(false)
  allowBanVisit   Boolean  @default(false)
  allowPostAnnounce Boolean @default(false)
  allowViewLog    Boolean  @default(false)
  disablePostCtrl Boolean  @default(false)

  @@map("admin_groups")
}

// ==================== 会话表 ====================
model Session {
  id              String   @id @default(uuid()) @db.VarChar(36)
  userId          Int
  ip              String?  @db.VarChar(50)
  userAgent       String?  @db.VarChar(500)
  lastActivity    DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([lastActivity])
  @@map("sessions")
}

// ==================== 设备管理 ====================
model Device {
  id              Int      @id @default(autoincrement())
  userId          Int
  fingerprint     String   @db.VarChar(100)
  name            String?  @db.VarChar(100)
  lastUsed        DateTime @default(now())
  isTrusted       Boolean  @default(false)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, fingerprint])
  @@index([userId])
  @@map("devices")
}

// ==================== Refresh Token ====================
model RefreshToken {
  id              Int      @id @default(autoincrement())
  userId          Int
  token           String   @unique @db.VarChar(500)
  deviceId        Int?
  expiresAt       DateTime
  revokedAt       DateTime?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ==================== 用户角色关联 ====================
model UserRole {
  id              Int      @id @default(autoincrement())
  userId          Int
  roleId          String   @db.VarChar(50)
  scope           String   @default("global") @db.VarChar(20) // global/forum
  scopeId         Int?                                      // 版块ID

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId, scope, scopeId])
  @@index([userId])
  @@map("user_roles")
}

// ==================== 登录日志 ====================
model UserLoginLog {
  id              Int      @id @default(autoincrement())
  userId          Int?
  username        String?  @db.VarChar(50)
  ip              String   @db.VarChar(50)
  status          String   @db.VarChar(20)   // success/failed
  failureReason   String?  @db.VarChar(100)
  userAgent       String?  @db.VarChar(500)
  deviceId        Int?
  createdAt       DateTime @default(now())

  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([ip])
  @@index([createdAt])
  @@map("user_login_logs")
}

// ==================== 被禁用户 ====================
model BannedUser {
  id              Int      @id @default(autoincrement())
  userId          Int      @unique
  username        String   @db.VarChar(50)
  reason          String?  @db.Text
  bannedBy        Int
  banType         String   @db.VarChar(20)   // login/post/visit
  expiresAt       DateTime

  @@index([userId])
  @@index([expiresAt])
  @@map("banned_users")
}
```

### 2.2 论坛核心

```prisma
// ==================== 论坛版块 ====================
model Forum {
  id              Int      @id @default(autoincrement())
  parentId        Int?     // 父版块ID (0为顶级)
  type            String   @default("forum") @db.VarChar(20) // group/forum/sub
  name            String   @db.VarChar(100)
  description     String?  @db.Text
  icon            String?  @db.VarChar(255)
  status          Int      @default(1)       // 1=正常 0=关闭

  // 显示顺序
  displayOrder    Int      @default(0)

  // 访问控制
  password        String?  @db.VarChar(50)
  viewPerm        String?  @db.Text         // 允许查看的用户组ID
  postPerm        String?  @db.Text         // 允许发帖的用户组ID
  replyPerm       String?  @db.Text         // 允许回复的用户组ID
  getAttachPerm   String?  @db.Text         // 允许下载附件的用户组ID
  postAttachPerm  String?  @db.Text         // 允许上传附件的用户组ID

  // 统计
  threads         Int      @default(0)
  posts           Int      @default(0)
  todayPosts      Int      @default(0)

  // 扩展
  styleId         Int?                      // 风格ID
  allowHtml       Boolean  @default(false)
  allowBbcode     Boolean  @default(true)
  allowImgCode    Boolean  @default(true)
  allowSmilies    Boolean  @default(true)

  // 关系
  threads         Thread[]
  moderators      Moderator[]
  parent          Forum?   @relation("ForumHierarchy", fields: [parentId], references: [id])
  children        Forum[]  @relation("ForumHierarchy")

  @@index([parentId])
  @@index([displayOrder])
  @@map("forums")
}

// ==================== 版主 ====================
model Moderator {
  id              Int      @id @default(autoincrement())
  userId          Int
  forumId         Int
  displayOrder    Int      @default(0)
  isInherited     Boolean  @default(false) // 是否继承

  user            User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  forum           Forum    @relation(fields: [forumId], references: [id], onDelete: Cascade)

  @@unique([userId, forumId])
  @@index([forumId])
  @@map("moderators")
}

// ==================== 主题 ====================
model Thread {
  id              Int      @id @default(autoincrement())
  forumId         Int
  authorId        Int
  author          String   @db.VarChar(50)
  subject         String   @db.VarChar(255)

  // 类型
  typeId          Int?                      // 主题分类ID
  special         Int      @default(0)       // 0=普通 1=投票 2=交易 3=悬赏 4=活动 5=辩论

  // 状态
  status          Int      @default(0)       // 位标记
  displayOrder    Int      @default(0)
  digest          Int      @default(0)       // 精华等级 0-3
  rate            Int      @default(0)
  price           Int      @default(0)       // 售价

  // 统计
  views           Int      @default(0)
  replies         Int      @default(0)
  favorites       Int      @default(0)

  // 时间
  postedAt        DateTime @default(now())
  lastPost        DateTime @default(now())
  lastPoster      String   @db.VarChar(50)
  lastPosterId    Int?

  // 关闭/置顶
  closed          Boolean  @default(false)
  stickied         Boolean  @default(false)

  // 关系
  forum           Forum    @relation(fields: [forumId], references: [id], onDelete: Cascade)
  authorUser      User     @relation(fields: [authorId], references: [id])
  posts           Post[]
  poll            Poll?

  @@index([forumId])
  @@index([authorId])
  @@index([postedAt])
  @@index([lastPost])
  @@index([displayOrder])
  @@map("threads")
}

// ==================== 帖子 ====================
model Post {
  id              Int      @id @default(autoincrement())
  threadId        Int
  authorId        Int
  author          String   @db.VarChar(50)

  // 内容
  subject         String?  @db.VarChar(255)
  message         String   @db.Text
  useSig          Boolean  @default(false)
  htmlOn          Boolean  @default(false)
  bbcodeOff       Boolean  @default(false)
  smileyOff       Boolean  @default(false)

  // 状态
  invisible       Int      @default(0)       // 0=正常 -1=待审核 1=已删除
  anonymous       Boolean  @default(false)
  isFirst         Boolean  @default(false)   // 是否首帖
  rate            Int      @default(0)

  // IP
  postIp          String?  @db.VarChar(50)
  port            Int?

  // 时间
  postedAt        DateTime @default(now())

  // 关系
  thread          Thread   @relation(fields: [threadId], references: [id], onDelete: Cascade)
  authorUser      User     @relation(fields: [authorId], references: [id])
  attachments     Attachment[]
  rates           Rate[]

  @@index([threadId])
  @@index([authorId])
  @@index([postedAt])
  @@index([invisible])
  @@map("posts")
}

// ==================== 附件 ====================
model Attachment {
  id              Int      @id @default(autoincrement())
  postId          Int
  userId          Int

  // 文件信息
  fileName        String   @db.VarChar(255)
  fileType        String   @db.VarChar(50)
  fileSize        Int
  filePath        String   @db.VarChar(255)
  thumbPath       String?  @db.VarChar(255)
  downloads       Int      @default(0)

  // 描述
  description     String?  @db.VarChar(255)

  // 价格
  price           Int      @default(0)

  // 时间
  uploadedAt      DateTime @default(now())

  // 关系
  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([userId])
  @@map("attachments")
}

// ==================== 投票 ====================
model Poll {
  id              Int      @id @default(autoincrement())
  threadId        Int      @unique
  userId          Int

  // 投票设置
  maxChoices      Int      @default(1)
  expiration      DateTime?
  multiple        Boolean  @default(false)
  public          Boolean  @default(true)   // 是否公开投票者
  preview         Boolean  @default(false)

  // 选项
  options         Json     // 投票选项 [{option: "A", votes: 10}, ...]
  voters          Json     // 投票记录 [userId1, userId2, ...]

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  thread          Thread   @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@map("polls")
}

// ==================== 评分 ====================
model Rate {
  id              Int      @id @default(autoincrement())
  postId          Int
  userId          Int
  username        String   @db.VarChar(50)
  extCreditsId    Int                      // 积分类型 (1-8)
  score           Int
  reason          String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([userId])
  @@map("rates")
}
```

### 2.3 私信与好友

```prisma
// ==================== 私信 ====================
model PrivateMessage {
  id              Int      @id @default(autoincrement())
  fromId          Int
  toId            Int

  // 内容
  subject         String   @db.VarChar(255)
  message         String   @db.Text

  // 状态
  status          Int      @default(0)       // 0=未读 1=已读
  folder          String   @default("inbox") @db.VarChar(20) // inbox/outbox
  delStatus       Int      @default(0)       // 位标记: from删除/to删除

  // 时间
  createdAt       DateTime @default(now())
  readAt          DateTime?
  deletedAt       DateTime?

  // 关系
  fromUser        User     @relation("SentMessages", fields: [fromId], references: [id], onDelete: Cascade)
  toUser          User     @relation("ReceivedMessages", fields: [toId], references: [id], onDelete: Cascade)

  @@index([fromId])
  @@index([toId])
  @@index([createdAt])
  @@map("private_messages")
}

// ==================== 好友 ====================
model Buddy {
  id              Int      @id @default(autoincrement())
  userId          Int
  buddyId         Int

  // 分组
  groupId         Int      @default(0)

  // 描述
  description     String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  user            User     @relation("UserBuddies", fields: [userId], references: [id], onDelete: Cascade)
  buddy           User     @relation("BuddyOfUsers", fields: [buddyId], references: [id], onDelete: Cascade)

  @@unique([userId, buddyId])
  @@index([userId])
  @@map("buddies")
}

// ==================== 收藏 ====================
model Favorite {
  id              Int      @id @default(autoincrement())
  userId          Int
  type            String   @db.VarChar(20)   // thread/forum/user
  targetId        Int
  description     String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type, targetId])
  @@map("favorites")
}
```

### 2.4 Pokemon 系统 (24张表整合)

```prisma
// ==================== Pokemon 物种 ====================
model PokemonSpecies {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(50)
  nameEn          String?  @db.VarChar(50)

  // 属性
  type1           String   @db.VarChar(20)   // 草/火/水/电/超能/飞行/虫/岩石/地面/钢/格斗/冰/幽灵/龙/恶/一般
  type2           String?  @db.VarChar(20)

  // 种族值
  baseHp          Int      @default(0)
  baseAtk         Int      @default(0)
  baseDef         Int      @default(0)
  baseSatk        Int      @default(0)
  baseSdef        Int      @default(0)
  baseSpd         Int      @default(0)

  // 成长
  growthRate      String   @db.VarChar(20)   // 经验成长类型
  baseExp         Int      @default(0)
  catchRate       Int      @default(0)

  // 进化
  evolutionChain  Int?                      // 进化链ID
  evolveLevel     Int?
  evolveItem      String?  @db.VarChar(50)
  evolveFrom      Int?

  // 技能池
  skill1          String?  @db.VarChar(50)
  skill2          String?  @db.VarChar(50)
  skill3          String?  @db.VarChar(50)
  skill4          String?  @db.VarChar(50)

  // 描述
  description     String?  @db.Text

  // 图像
  image           String?  @db.VarChar(255)

  // 世代
  generation      Int      @default(1)

  @@index([type1])
  @@index([evolutionChain])
  @@map("pokemon_species")
}

// ==================== Pokemon 技能 ====================
model PokemonMove {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(50)
  nameEn          String?  @db.VarChar(50)

  // 属性
  type            String   @db.VarChar(20)
  category        String   @db.VarChar(20)   // physical/special/status

  // 威力
  power           Int      @default(0)
  accuracy        Int      @default(100)
  pp              Int      @default(0)

  // 效果
  effect          String?  @db.Text
  priority        Int      @default(0)

  // 学习方式
  learnMethod     String   @db.VarChar(20)   // level_up/tm/breed/tutor
  learnLevel      Int?

  @@index([type])
  @@index([learnMethod])
  @@map("pokemon_moves")
}

// ==================== 用户宠物 ====================
model PokemonPet {
  id              Int      @id @default(autoincrement())
  userId          Int
  speciesId       Int

  // 名称
  nickname        String?  @db.VarChar(50)
  originalName    String   @db.VarChar(50)

  // 等级与经验
  level           Int      @default(1)
  exp             Int      @default(0)

  // 性别 (0=无 1=雄 2=雌)
  gender          Int      @default(0)

  // 性格
  nature          String?  @db.VarChar(20)

  // 特性
  ability         String?  @db.VarChar(50)

  // 个体值 (0-31)
  ivHp            Int      @default(0)
  ivAtk           Int      @default(0)
  ivDef           Int      @default(0)
  ivSatk          Int      @default(0)
  ivSdef          Int      @default(0)
  ivSpd           Int      @default(0)

  // 努力值 (0-255)
  evHp            Int      @default(0)
  evAtk           Int      @default(0)
  evDef           Int      @default(0)
  evSatk          Int      @default(0)
  evSdef          Int      @default(0)
  evSpd           Int      @default(0)

  // 当前属性值
  hp              Int      @default(0)
  maxHp           Int      @default(0)
  atk             Int      @default(0)
  def             Int      @default(0)
  satk            Int      @default(0)
  sdef            Int      @default(0)
  spd             Int      @default(0)

  // 技能 (4个)
  move1           String?  @db.VarChar(50)
  move2           String?  @db.VarChar(50)
  move3           String?  @db.VarChar(50)
  move4           String?  @db.VarChar(50)

  // 状态
  isEgg           Boolean  @default(false)  // 是否是蛋
  isShiny         Boolean  @default(false)  // 是否异色

  // 位置 (party=队伍 pc=存储)
  location        String   @default("pc") @db.VarChar(20)
  position        Int      @default(0)

  // 战绩
  battles         Int      @default(0)
  wins            Int      @default(0)
  losses          Int      @default(0)

  // 背景
  obtainedAt      DateTime @default(now())
  obtainedFrom    String?  @db.VarChar(50)   // catch/breed/trade/gift

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  species         PokemonSpecies @relation(fields: [speciesId], references: [id])

  @@index([userId])
  @@index([location])
  @@index([speciesId])
  @@map("pokemon_pets")
}

// ==================== 用户图鉴 ====================
model PokemonUserDex {
  id              Int      @id @default(autoincrement())
  userId          Int      @unique

  // 图鉴进度
  seenCount       Int      @default(0)
  caughtCount     Int      @default(0)

  // 已见过/捕获的Pokemon ID列表
  seenSpecies     Json     @default("[]")   // [1, 2, 3, ...]
  caughtSpecies   Json     @default("[]")

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("pokemon_user_dex")
}

// ==================== Pokemon 商店 ====================
model PokemonShop {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  type            String   @db.VarChar(20)   // item/fruit/pokemon

  // 商品信息
  itemId          Int?                      // 对应 item/fruit/species ID
  price           Int
  stock           Int      @default(-1)      // -1=无限

  // 描述
  description     String?  @db.Text
  effect          String?  @db.Text

  // 显示
  icon            String?  @db.VarChar(255)
  displayOrder    Int      @default(0)

  @@index([type])
  @@map("pokemon_shop")
}

// ==================== 用户物品 ====================
model PokemonUserItem {
  id              Int      @id @default(autoincrement())
  userId          Int
  itemId          Int
  itemName        String   @db.VarChar(50)

  // 数量
  quantity        Int      @default(1)

  // 描述
  effect          String?  @db.Text

  @@index([userId])
  @@index([itemId])
  @@map("pokemon_user_items")
}

// ==================== Pokemon 果实 ====================
model PokemonFruit {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(50)
  nameEn          String?  @db.VarChar(50)

  // 效果
  effect          String?  @db.Text
  hpRestore       Int      @default(0)
  atkBoost        Int      @default(0)
  defBoost        Int      @default(0)

  // 稀有度
  rarity          Int      @default(1)       // 1-5

  // 价格
  price           Int      @default(0)

  @@map("pokemon_fruits")
}

// ==================== 用户果实 ====================
model PokemonUserFruit {
  id              Int      @id @default(autoincrement())
  userId          Int
  fruitId         Int
  quantity        Int      @default(0)

  @@index([userId])
  @@index([fruitId])
  @@map("pokemon_user_fruits")
}

// ==================== Pokemon 市场 ====================
model PokemonMarket {
  id              Int      @id @default(autoincrement())
  sellerId        Int
  petId           Int

  // 价格
  price           Int

  // 状态
  status          String   @default("active") @db.VarChar(20) // active/sold/cancelled

  // 时间
  createdAt       DateTime @default(now())
  expiresAt       DateTime?

  @@index([sellerId])
  @@index([status])
  @@index([expiresAt])
  @@map("pokemon_market")
}

// ==================== Pokemon 道馆 ====================
model PokemonGym {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  badgeName       String   @db.VarChar(50)

  // 馆主
  leaderId        Int?
  leaderName      String?  @db.VarChar(50)

  // 属性
  type            String   @db.VarChar(20)

  // 奖励
  rewardCredits   Int      @default(0)
  rewardItem      String?  @db.VarChar(50)

  // 要求
  minLevel        Int      @default(0)
  requiredBadges  Json?    // [badgeId1, badgeId2, ...]

  // 显示顺序
  displayOrder    Int      @default(0)

  @@map("pokemon_gyms")
}

// ==================== 战斗记录 ====================
model PokemonBattle {
  id              Int      @id @default(autoincrement())
  attackerId      Int
  defenderId      Int?

  // 战斗类型
  type            String   @db.VarChar(20)   // pvp/pve/gym

  // 结果
  result          String?  @db.VarChar(20)   // win/lose/draw

  // 日志
  battleLog       Json?    // 战斗过程记录

  // 时间
  createdAt       DateTime @default(now())

  @@index([attackerId])
  @@index([createdAt])
  @@map("pokemon_battles")
}

// ==================== 属性相克 ====================
model PokemonTypeEffectiveness {
  id              Int      @id @default(autoincrement())
  attackingType   String   @db.VarChar(20)
  defendingType   String   @db.VarChar(20)
  effectiveness   Decimal  @db.Decimal(2, 1) // 0.5/1/2

  @@unique([attackingType, defendingType])
  @@map("pokemon_type_effectiveness")
}

// ==================== 俱乐部 ====================
model PokemonClub {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  description     String?  @db.Text

  // 等级
  level           Int      @default(1)
  exp             Int      @default(0)

  // 资金
  credits         Int      @default(0)

  // 成员
  memberCount     Int      @default(0)
  maxMembers      Int      @default(20)

  // 馆领
  leaderId        Int

  // 标志
  icon            String?  @db.VarChar(255)

  @@index([leaderId])
  @@map("pokemon_clubs")
}

// ==================== 俱乐部成员 ====================
model PokemonClubMember {
  id              Int      @id @default(autoincrement())
  clubId          Int
  userId          Int

  // 职位
  position        String   @default("member") @db.VarChar(20) // leader/vice/member

  // 贡献
  contribution    Int      @default(0)

  // 加入时间
  joinedAt        DateTime @default(now())

  @@unique([clubId, userId])
  @@index([clubId])
  @@index([userId])
  @@map("pokemon_club_members")
}
```

### 2.5 银行系统

```prisma
// ==================== 银行账户 ====================
model BankAccount {
  id              Int      @id @default(autoincrement())
  userId          Int      @unique

  // 余额
  balance         Int      @default(0)

  // 账户状态
  status          Int      @default(1)       // 1=正常 0=冻结

  // 密码 (交易密码)
  password        String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs            BankLog[]

  @@map("bank_accounts")
}

// ==================== 银行日志 ====================
model BankLog {
  id              Int      @id @default(autoincrement())
  accountId       Int
  userId          Int

  // 操作类型
  type            String   @db.VarChar(20)   // deposit/withdraw/transfer/interest

  // 金额
  amount          Int

  // 余额
  balanceBefore   Int
  balanceAfter    Int

  // 转账相关
  toUserId        Int?
  toUserName      String?  @db.VarChar(50)

  // 备注
  note            String?  @db.VarChar(255)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  account         BankAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([userId])
  @@index([createdAt])
  @@map("bank_logs")
}
```

### 2.6 道具与勋章

```prisma
// ==================== 道具 ====================
model Magic {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  identifier      String   @unique @db.VarChar(50)

  // 类型
  type            String   @default("item") @db.VarChar(20)

  // 价格
  price           Int      @default(0)

  // 描述
  description     String?  @db.Text

  // 效果
  effect          String?  @db.Text

  // 库存
  stock           Int      @default(-1)

  // 显示
  icon            String?  @db.VarChar(255)
  displayOrder    Int      @default(0)

  @@index([type])
  @@map("magics")
}

// ==================== 用户道具 ====================
model UserMagic {
  id              Int      @id @default(autoincrement())
  userId          Int
  magicId         Int

  // 数量
  quantity        Int      @default(1)

  // 过期时间
  expiresAt       DateTime?

  @@index([userId])
  @@index([magicId])
  @@map("user_magics")
}

// ==================== 勋章 ====================
model Medal {
  id              Int      @id @default(autoincrement())
  name            String   @db.VarChar(100)
  image           String   @db.VarChar(255)

  // 描述
  description     String?  @db.Text

  // 类型
  type            String   @default("manual") @db.VarChar(20) // manual/auto

  // 自动颁发条件
  autoCondition   Json?    // {posts: 100, days: 30}

  // 显示顺序
  displayOrder    Int      @default(0)

  @@map("medals")
}

// ==================== 用户勋章 ====================
model UserMedal {
  id              Int      @id @default(autoincrement())
  userId          Int
  medalId         Int

  // 颁发时间
  awardedAt       DateTime @default(now())

  // 关系
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, medalId])
  @@index([userId])
  @@map("user_medals")
}
```

### 2.7 系统管理

```prisma
// ==================== 系统设置 ====================
model Setting {
  id              Int      @id @default(autoincrement())
  key             String   @unique @db.VarChar(100)
  value           String   @db.Text
  type            String   @default("string") @db.VarChar(20) // string/number/boolean/json
  category        String   @db.VarChar(50)

  description     String?  @db.VarChar(255)

  @@index([category])
  @@map("settings")
}

// ==================== 版主日志 ====================
model ModLog {
  id              Int      @id @default(autoincrement())
  modId           Int
  modName         String   @db.VarChar(50)
  action          String   @db.VarChar(50)   // delete/stick/move/close/etc
  targetType      String   @db.VarChar(20)   // thread/post
  targetId        Int

  // 原因
  reason          String?  @db.VarChar(255)

  // IP
  ip              String?  @db.VarChar(50)

  // 时间
  createdAt       DateTime @default(now())

  // 关系
  mod             User     @relation(fields: [modId], references: [id])

  @@index([modId])
  @@index([createdAt])
  @@map("mod_logs")
}

// ==================== 管理员日志 ====================
model AdminLog {
  id              Int      @id @default(autoincrement())
  adminId         Int
  adminName       String   @db.VarChar(50)
  action          String   @db.VarChar(50)
  target          String   @db.VarChar(100)

  // 详细信息
  detail          String?  @db.Text

  // IP
  ip              String?  @db.VarChar(50)

  // 时间
  createdAt       DateTime @default(now())

  @@index([adminId])
  @@index([createdAt])
  @@map("admin_logs")
}

// ==================== 公告 ====================
model Announcement {
  id              Int      @id @default(autoincrement())
  authorId        Int
  subject         String   @db.VarChar(255)
  message         String   @db.Text

  // 显示
  displayOrder    Int      @default(0)
  startTime       DateTime @default(now())
  endTime         DateTime?

  // 状态
  status          Int      @default(1)       // 1=显示 0=隐藏

  @@index([startTime])
  @@index([endTime])
  @@index([status])
  @@map("announcements")
}
```

---

## 3. 数据分表策略

### 3.1 需要分表的表

| 表名 | 分表策略 | 预估数据量 | 说明 |
|------|----------|-----------|------|
| `posts` | 按月分表 | 1000万+ | 核心数据，永久保留 |
| `threads` | 按月分表 | 500万+ | 核心数据，永久保留 |
| `attachments` | 按季度分表 | 500万+ | 核心数据，永久保留 |
| `user_login_logs` | 按月分表 | 1000万+ | 日志数据，永久保留 |
| `mod_logs` | 按月分表 | 100万+ | 日志数据，永久保留 |
| `admin_logs` | 按月分表 | 50万+ | 日志数据，永久保留 |
| `private_messages` | 按月分表 | 500万+ | 核心数据，永久保留 |
| `pokemon_battles` | 按月分表 | 100万+ | 游戏数据，永久保留 |

> **重要**: 所有数据永久保留，分表仅用于性能优化，不删除任何历史数据。

### 3.2 分表命名规则

| 策略 | 命名格式 | 示例 |
|------|----------|------|
| 按月 | `{table}_{YYYY}{MM}` | `posts_202401`, `posts_202402` |
| 按季度 | `{table}_{YYYY}q{N}` | `attachments_2024q1` |
| 按年 | `{table}_{YYYY}` | `threads_2024` |
| 按ID范围 | `{table}_{range}` | `posts_0_1m`, `posts_1m_2m` |

### 3.3 分表工具类

```typescript
// src/lib/sharding/utils.ts
export enum ShardingStrategy {
  ByYear = 'by_year',
  ByMonth = 'by_month',
  ByQuarter = 'by_quarter',
  ByIdRange = 'by_id_range',
  ByHash = 'by_hash',
}

export function getShardedTableName(
  baseName: string,
  date: Date,
  strategy: ShardingStrategy
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  switch (strategy) {
    case ShardingStrategy.ByYear:
      return `${baseName}_${year}`;
    case ShardingStrategy.ByMonth:
      return `${baseName}_${year}${month}`;
    case ShardingStrategy.ByQuarter:
      return `${baseName}_${year}q${quarter}`;
    default:
      return baseName;
  }
}

export function getActiveShardTables(
  baseName: string,
  strategy: ShardingStrategy,
  startTime: Date,
  retainMonths: number
): string[] {
  const tables: string[] = [];
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setMonth(cutoffDate.getMonth() - retainMonths);

  let current = new Date(startTime);
  current.setDate(1);

  while (current <= now) {
    if (current >= cutoffDate) {
      tables.push(getShardedTableName(baseName, current, strategy));
    }
    current.setMonth(current.getMonth() + 1);
  }

  return tables;
}
```

### 3.4 分表 Repository

```typescript
// src/lib/sharding/post.repository.ts
import { PrismaClient } from '@prisma/client';
import { getShardedTableName, ShardingStrategy } from './utils';

export class PostRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    threadId: number;
    authorId: number;
    author: string;
    message: string;
    postedAt: Date;
  }) {
    const tableName = getShardedTableName(
      'posts',
      data.postedAt,
      ShardingStrategy.ByMonth
    );

    return await this.prisma.$queryRawUnsafe(`
      INSERT INTO ${tableName} (
        thread_id, author_id, author, message, posted_at
      ) VALUES (
        ${data.threadId}, ${data.authorId}, '${data.author}',
        '${this.escapeSql(data.message)}', '${data.postedAt.toISOString()}'
      )
    `);
  }

  async findByThreadId(threadId: number, page: number = 1, pageSize: number = 20) {
    const tables = getActiveShardTables('posts', ShardingStrategy.ByMonth,
      new Date('2006-01-01'), 36);
    const offset = (page - 1) * pageSize;

    const unions = tables.map(t => `
      SELECT id, thread_id, author, message, posted_at
      FROM ${t} WHERE thread_id = ${threadId} AND invisible = 0
    `).join(' UNION ALL ');

    const sql = `
      SELECT * FROM (${unions}) AS combined
      ORDER BY posted_at ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return await this.prisma.$queryRawUnsafe(sql);
  }

  private escapeSql(str: string): string {
    return str.replace(/'/g, "''");
  }
}
```

### 3.5 分表迁移脚本

```typescript
// scripts/migration/create-sharded-tables.ts
async function createShardedPostsTables() {
  const baseName = 'posts';
  const startYear = 2006;
  const endYear = new Date().getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const tableName = getShardedTableName(
        baseName,
        new Date(year, month - 1),
        ShardingStrategy.ByMonth
      );

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          thread_id BIGINT UNSIGNED NOT NULL,
          author_id BIGINT UNSIGNED NOT NULL,
          author VARCHAR(50) NOT NULL,
          subject VARCHAR(255) DEFAULT NULL,
          message TEXT NOT NULL,
          invisible TINYINT NOT NULL DEFAULT 0,
          posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_thread_id (thread_id),
          INDEX idx_author_id (author_id),
          INDEX idx_posted_at (posted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }
  }
}

async function migratePostsToShards() {
  const batchSize = 1000;
  let offset = 0;

  while (true) {
    const posts = await prisma.$queryRawUnsafe(`
      SELECT * FROM posts ORDER BY id LIMIT ${batchSize} OFFSET ${offset}
    `);

    if (!posts || posts.length === 0) break;

    for (const post of posts) {
      const tableName = getShardedTableName(
        'posts',
        new Date(post.posted_at),
        ShardingStrategy.ByMonth
      );

      await prisma.$executeRawUnsafe(`
        INSERT INTO ${tableName} (
          id, thread_id, author_id, author, subject, message, posted_at
        ) VALUES (
          ${post.id}, ${post.thread_id}, ${post.author_id},
          '${post.author}', ${post.subject ? `'${post.subject}'` : 'NULL'},
          '${post.message.replace(/'/g, "''")}', '${post.posted_at}'
        )
        ON DUPLICATE KEY UPDATE thread_id = VALUES(thread_id)
      `);
    }

    offset += batchSize;
  }
}
```

### 3.6 分表维护任务

```typescript
// scripts/jobs/sharding-maintenance.ts
export class ShardingMaintenance {
  /**
   * 创建下个月的分表 (定时任务: 每月1号执行)
   */
  async createNextMonthTables() {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    const tablesToCreate = [
      'posts', 'threads', 'user_login_logs',
      'mod_logs', 'admin_logs', 'private_messages',
      'pokemon_battles'
    ];

    for (const baseName of tablesToCreate) {
      const tableName = getShardedTableName(
        baseName,
        nextMonth,
        ShardingStrategy.ByMonth
      );

      await this.createShardTable(tableName, baseName);
      console.log(`Created table: ${tableName}`);
    }
  }

  /**
   * 优化分表 (定时任务: 每周凌晨执行)
   * 只优化最近3个月的活跃分表
   */
  async optimizeActiveTables() {
    const tables = [
      { name: 'posts', months: 3 },
      { name: 'threads', months: 3 },
      { name: 'attachments', months: 3 }, // 优化最近3个季度
    ];

    for (const table of tables) {
      if (table.name === 'attachments') {
        await this.optimizeQuarterlyTables(table.name, table.months);
      } else {
        await this.optimizeMonthlyTables(table.name, table.months);
      }
    }
  }

  /**
   * 分析分表大小，生成报告
   */
  async analyzeShardSizes() {
    const result = await prisma.$queryRawUnsafe(`
      SELECT
        table_name,
        ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
        table_rows
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name LIKE '%\\_%'
      ORDER BY (data_length + index_length) DESC
    `);

    return result;
  }

  private async createShardTable(tableName: string, baseName: string) {
    // 根据基础表结构创建分表
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        thread_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED NOT NULL,
        author VARCHAR(50) NOT NULL,
        subject VARCHAR(255) DEFAULT NULL,
        message TEXT NOT NULL,
        invisible TINYINT NOT NULL DEFAULT 0,
        posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_thread_id (thread_id),
        INDEX idx_author_id (author_id),
        INDEX idx_posted_at (posted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      ${baseName === 'posts' ? 'PARTITION BY RANGE (TO_DAYS(posted_at)) (PARTITION p_old VALUES LESS THAN (TO_DAYS("2006-01-01")), PARTITION p_current VALUES LESS THAN MAXVALUE)' : ''}
    `);
  }

  private async optimizeMonthlyTables(baseName: string, recentMonths: number) {
    const now = new Date();
    for (let i = 0; i < recentMonths; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const tableName = getShardedTableName(baseName, date, ShardingStrategy.ByMonth);

      await prisma.$executeRawUnsafe(`OPTIMIZE TABLE ${tableName}`);
      console.log(`Optimized: ${tableName}`);
    }
  }

  private async optimizeQuarterlyTables(baseName: string, recentQuarters: number) {
    const now = new Date();
    for (let i = 0; i < recentQuarters; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i * 3);
      const tableName = getShardedTableName(baseName, date, ShardingStrategy.ByQuarter);

      await prisma.$executeRawUnsafe(`OPTIMIZE TABLE ${tableName}`);
      console.log(`Optimized: ${tableName}`);
    }
  }
}
```

### 3.7 分表使用示例

```typescript
// Service 层完全透明，自动处理分表路由
class PostService {
  constructor(private postRepo: PostRepository) {}

  // 创建帖子 - 自动路由到对应月份分表
  async createPost(data: CreatePostDto) {
    return await this.postRepo.create({
      ...data,
      postedAt: new Date(), // 自动根据这个日期选择分表
    });
  }

  // 查询帖子 - 自动跨所有分表查询
  async getThreadPosts(threadId: number, page: number) {
    return await this.postRepo.findByThreadId(threadId, page);
    // 内部自动 UNION ALL 所有 posts_YYYYMM 分表
  }

  // 用户发帖历史 - 跨分表查询
  async getUserPosts(userId: number, page: number) {
    return await this.postRepo.findByAuthorId(userId, page);
  }
}

// 对业务层完全透明，不需要知道分表的存在
```

---

## 4. 表关系图

```
用户系统:
User (用户)
├── UserGroup (用户组)
├── UserRole (角色关联)
├── Session (会话)
├── Device (设备)
├── RefreshToken (刷新令牌)
└── UserLoginLog (登录日志)

论坛核心:
Forum (版块)
├── Thread (主题)
│   ├── Post (帖子)
│   │   └── Attachment (附件)
│   └── Poll (投票)
└── Moderator (版主)

社交系统:
User (用户)
├── PrivateMessage (私信)
├── Buddy (好友)
└── Favorite (收藏)

Pokemon系统:
PokemonSpecies (物种)
├── PokemonPet (用户宠物)
├── PokemonUserDex (图鉴)
├── PokemonMove (技能)
├── PokemonMarket (市场)
├── PokemonBattle (战斗)
└── PokemonClub (俱乐部)

银行系统:
User (用户)
└── BankAccount (账户)
    └── BankLog (日志)
```

---

## 5. 数据迁移 SQL

### 5.1 用户迁移

```sql
-- 从 uc_members + cdb_members 迁移到 users
INSERT INTO users (
  username, email, password, groupId,
  extCredits1, extCredits2,
  regDate, regIp, posts, threads
)
SELECT
  m.username,
  m.email,
  m.password,
  COALESCE(m.groupid, 10) as groupId,
  COALESCE(m.extcredits1, 0),
  COALESCE(m.extcredits2, 0),
  FROM_UNIXTIME(m.regdate) as regDate,
  INET_NTOA(m.regip) as regIp,
  COALESCE(m.posts, 0),
  0
FROM cdb_members m
GROUP BY m.uid;
```

### 5.2 Pokemon 数据迁移

```sql
-- 用户宠物
INSERT INTO pokemon_pets (
  userId, speciesId, nickname, level, exp,
  hp, maxHp, atk, def, satk, sdef, spd,
  move1, move2, move3, move4
)
SELECT
  uid, petid, name, level, exp,
  hp, maxhp, atk, def, satk, sdef, spd,
  skill1, skill2, skill3, skill4
FROM cdb_zpetmypet;

-- 图鉴数据
INSERT INTO pokemon_species (
  id, name, nameEn, type1, type2,
  baseHp, baseAtk, baseDef, baseSatk, baseSdef, baseSpd
)
SELECT
  petid, name, name_en, property, property2,
  hp, atk, def, satk, sdef, spd
FROM cdb_zpetdex;
```

### 5.3 银行数据迁移

```sql
INSERT INTO bank_accounts (userId, balance, password)
SELECT
  uid,
  COALESCE(money, 0),
  password
FROM cdb_bank;
```

---

## 6. 索引优化建议

### 6.1 用户表
```sql
CREATE INDEX idx_users_groupid ON users(groupId);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_regdate ON users(regDate);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### 6.2 论坛表
```sql
-- 主题表
CREATE INDEX idx_threads_forumid ON threads(forumId);
CREATE INDEX idx_threads_authorid ON threads(authorId);
CREATE INDEX idx_threads_postedat ON threads(postedAt DESC);
CREATE INDEX idx_threads_lastpost ON threads(lastPost DESC);
CREATE INDEX idx_threads_stickied_digest ON threads(stickied, digest, displayOrder);

-- 帖子表
CREATE INDEX idx_posts_threadid ON posts(threadId);
CREATE INDEX idx_posts_authorid ON posts(authorId);
CREATE INDEX idx_posts_postedat ON posts(postedAt);
```

### 6.3 Pokemon 表
```sql
CREATE INDEX idx_pokemon_pets_userid ON pokemon_pets(userId);
CREATE INDEX idx_pokemon_pets_location ON pokemon_pets(location);
CREATE INDEX idx_pokemon_pets_speciesid ON pokemon_pets(speciesId);
CREATE INDEX idx_pokemon_market_status ON pokemon_market(status, expiresAt);
```

---

## 7. 检查清单

### 设计完成
- [x] 用户系统 (替代UCenter)
- [x] 论坛核心 (版块/主题/帖子)
- [x] 权限系统 (用户组/角色)
- [x] Pokemon系统 (核心表)
- [x] 银行系统
- [x] 道具与勋章
- [x] 系统管理

### 待完善
- [ ] WordPress集成表 (如需要)
- [ ] 移动端专用表 (响应式替代)
- [ ] 插件钩子系统

### 数据迁移
- [ ] 用户数据迁移脚本
- [ ] Pokemon数据迁移脚本
- [ ] 银行数据迁移脚本
- [ ] 帖子/附件迁移脚本 (分表)

### 性能优化
- [x] 索引优化
- [x] 分表策略设计 (按时间分表，所有数据永久保留)
- [ ] 分表Repository实现
- [ ] 分表迁移脚本
- [ ] 定时创建分表任务
- [ ] 定时优化分表任务
- [ ] 读写分离配置
- [ ] Redis缓存策略

### 数据归档 (可选)

如需要，可将很少访问的旧数据(如2年以上)标记为"归档"状态，但数据仍在同一分表中，只是应用层做查询优化：
- 热数据: 近12个月的数据，优先查询
- 冷数据: 12个月以上，按需加载
- 所有数据都保留，只是查询优先级不同
