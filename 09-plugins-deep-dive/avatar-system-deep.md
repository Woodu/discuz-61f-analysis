# 用户头像系统深度分析

## 1. 系统概述

Discuz! 6.1F 的头像系统基于 UCenter 实现，使用 Flash 组件上传头像，通过特定的目录结构存储头像文件。

---

## 2. 头像显示流程

### 2.1 核心函数: `discuz_uc_avatar()`

**位置**: `include/global.func.php:1102`

```php
function discuz_uc_avatar($uid, $size = '', $returnsrc = FALSE) {
    // 支持三种尺寸: big, middle, small
    $size = in_array($size, array('big', 'middle', 'small')) ? $size : 'middle';

    // 格式化UID为9位数字
    $uid = abs(intval($uid));
    $uid = sprintf("%09d", $uid);

    // 分层目录结构用于负载均衡
    $dir1 = substr($uid, 0, 3);   // 前3位
    $dir2 = substr($uid, 3, 2);   // 中间2位
    $dir3 = substr($uid, 5, 2);   // 后2位

    // 生成头像路径
    $avatar_path = UC_API.'/data/avatar/'.$dir1.'/'.$dir2.'/'.$dir3.'/'.substr($uid, -2)."_avatar_$size.jpg";

    if($returnsrc) {
        return $avatar_path;  // 仅返回URL
    } else {
        // 返回HTML <img> 标签，带错误处理
        return '<img src="'.$avatar_path.'" onerror="this.onerror=null;this.src=\''.UC_API.'/images/noavatar_'.$size.'.gif\'">';
    }
}
```

### 2.2 路径结构说明

```
UC_API/data/avatar/
├── 000/           # dir1 (uid前3位)
│   ├── 00/        # dir2 (uid第4-5位)
│   │   ├── 00/    # dir3 (uid第6-7位)
│   │   │   ├── 01_avatar_big.jpg      # UID=1
│   │   │   ├── 01_avatar_middle.jpg
│   │   │   └── 01_avatar_small.jpg
│   │   ├── 01/
│   │   └── ...
│   └── 01/
├── 001/
└── ...
```

**示例**:
- UID = `123`
- 格式化后 = `000000123`
- dir1 = `000`, dir2 = `00`, dir3 = `01`
- 文件名 = `23_avatar_middle.jpg`
- 完整路径 = `UC_API/data/avatar/000/00/01/23_avatar_middle.jpg`

### 2.3 在帖子中显示头像

**位置**: `viewthread.php:558-565`

```php
// 检查是否开启头像显示
$showavatars = $customshow{1} == 2 ? $showsettings{1} : $customshow{1};

if($showavatars) {
    $post['avatar'] = '<div class="avatar">'.discuz_uc_avatar($post['authorid'],'big');

    // 用户组头像
    if($_DCACHE['usergroups'][$post['groupid']]['groupavatar']) {
        $post['avatar'] .= '<br /><img src="'.$_DCACHE['usergroups'][$post['groupid']]['groupavatar'].'" border="0" alt="" />';
    }

    $post['avatar'] .= '</div>';
} else {
    $post['avatar'] = '';
}
```

**模板调用**: `templates/default/viewthread.htm:306-307`

```html
<!--{if $post['avatar'] && $showavatars}-->
    $post[avatar]
<!--{/if}-->
```

---

## 3. 头像上传流程

### 3.1 用户控制面板头像设置

**位置**: `memcp.php:154-157`

```php
} elseif($typeid == 6) {
    // 加载UCenter客户端
    require_once DISCUZ_ROOT.'/uc_client/client.php';

    // 生成Flash上传组件
    $uc_avatarflash = uc_avatar($discuz_uid);
}
```

### 3.2 UCenter Avatar Flash组件

**位置**: `uc_client/client.php:474-505`

```php
function uc_avatar($uid, $type = 'virtual', $returnhtml = 1) {
    $uid = intval($uid);

    // 生成加密输入参数
    $uc_input = uc_api_input("uid=$uid");

    // Flash组件URL
    $uc_avatarflash = UC_API.'/images/camera.swf?inajax=1&appid='.UC_APPID.'&input='.$uc_input.'&agent='.md5($_SERVER['HTTP_USER_AGENT']).'&ucapi='.urlencode(str_replace('http://', '', UC_API)).'&avatartype='.$type;

    if($returnhtml) {
        // 返回Flash Object HTML
        return '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ...>
            <param name="movie" value="'.$uc_avatarflash.'" />
            <embed src="'.$uc_avatarflash.'" ... />
        </object>';
    } else {
        // 返回Flash参数数组
        return array(...);
    }
}
```

### 3.3 Flash上传流程

```
用户访问 memcp.php?action=profile&typeid=6
    ↓
加载 camera.swf Flash组件
    ↓
Flash调用 UCenter API
    ↓
上传图片到UC服务器
    ↓
服务器裁剪生成3种尺寸
    ↓
保存到 /data/avatar/ 目录
    ↓
返回成功
```

---

## 4. 数据表结构

### 4.1 cdb_memberfields 表

```sql
CREATE TABLE cdb_memberfields (
    uid MEDIUMINT UNSIGNED NOT NULL PRIMARY KEY,
    avatar VARCHAR(255) NOT NULL DEFAULT '',
    avatarwidth TINYINT UNSIGNED NOT NULL DEFAULT '0',
    avatarheight TINYINT UNSIGNED NOT NULL DEFAULT '0',
    -- 其他字段...
);
```

**注意**: Discuz 6.1F 中 avatar 字段实际并未使用，头像完全由UCenter管理。

---

## 5. 头像尺寸规范

| 尺寸 | 宽×高 | 用途 |
|------|-------|------|
| big | 200×250 | 帖子中显示 |
| middle | 120×120 | 个人空间默认 |
| small | 48×48 | 下拉菜单等 |

**默认头像**:
- `UC_API/images/noavatar_big.gif`
- `UC_API/images/noavatar_middle.gif`
- `UC_API/images/noavatar_small.gif`

---

## 6. 现代替代方案

### 6.1 不使用UCenter的理由

1. **Flash已淘汰**: 现代浏览器不再支持Flash
2. **依赖外部服务**: UCenter需要独立部署
3. **安全性**: Flash存在已知安全漏洞
4. **用户体验差**: 上传流程复杂

### 6.2 React实现方案

```typescript
// services/avatar.service.ts
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export class AvatarService {
  /**
   * 上传头像
   */
  async uploadAvatar(userId: number, file: File, buffer: Buffer) {
    // 1. 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('不支持的图片格式');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('图片大小不能超过5MB');
    }

    // 2. 生成唯一文件名
    const ext = file.name.split('.').pop();
    const filename = `${userId}_${uuidv4()}.${ext}`;

    // 3. 创建用户目录
    const userDir = join(process.cwd(), 'public', 'avatars', this.getUserDir(userId));
    await mkdir(userDir, { recursive: true });

    // 4. 保存原图
    const originalPath = join(userDir, `original.${ext}`);
    await writeFile(originalPath, buffer);

    // 5. 生成3种尺寸 (使用 sharp)
    const sizes = {
      big: { width: 200, height: 250 },
      middle: { width: 120, height: 120 },
      small: { width: 48, height: 48 },
    };

    for (const [size, { width, height }] of Object.entries(sizes)) {
      const resized = await sharp(buffer)
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const sizePath = join(userDir, `${size}.jpg`);
      await writeFile(sizePath, resized);
    }

    // 6. 更新数据库
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: filename },
    });

    return {
      original: `/avatars/${this.getUserDir(userId)}/original.${ext}`,
      big: `/avatars/${this.getUserDir(userId)}/big.jpg`,
      middle: `/avatars/${this.getUserDir(userId)}/middle.jpg`,
      small: `/avatars/${this.getUserDir(userId)}/small.jpg`,
    };
  }

  /**
   * 获取用户目录 (兼容Discuz格式)
   */
  private getUserDir(uid: number): string {
    const uidStr = uid.toString().padStart(9, '0');
    const dir1 = uidStr.substring(0, 3);
    const dir2 = uidStr.substring(3, 5);
    const dir3 = uidStr.substring(5, 7);
    return `${dir1}/${dir2}/${dir3}`;
  }

  /**
   * 获取头像URL
   */
  getAvatarUrl(uid: number, size: 'big' | 'middle' | 'small' = 'middle'): string {
    const userDir = this.getUserDir(uid);
    const path = `/avatars/${userDir}/${size}.jpg`;

    // 检查文件是否存在
    const fullPath = join(process.cwd(), 'public', path);
    if (existsSync(fullPath)) {
      return path;
    }

    // 返回默认头像
    return `/images/noavatar_${size}.png`;
  }
}
```

### 6.3 React组件

```tsx
// features/user/components/AvatarUpload.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface AvatarUploadProps {
  userId: number;
  currentAvatar?: string;
  onSuccess?: (urls: string[]) => void;
}

export function AvatarUpload({ userId, currentAvatar, onSuccess }: AvatarUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.post(`/users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess?.(result.data.urls);
    } catch (error) {
      console.error('上传失败:', error);
    }
  }, [userId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {/* 当前头像预览 */}
      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">大头像</p>
          <Avatar src={currentAvatar} size="big" />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">中头像</p>
          <Avatar src={currentAvatar} size="middle" />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">小头像</p>
          <Avatar src={currentAvatar} size="small" />
        </div>
      </div>

      {/* 上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖放图片到此处...</p>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              点击或拖放图片到此处上传<br />
              支持 JPG、PNG、GIF、WebP 格式，最大5MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// 通用头像组件
// components/ui/avatar.tsx
interface AvatarProps {
  src?: string;
  size?: 'big' | 'middle' | 'small';
  alt?: string;
  className?: string;
}

const sizeMap = {
  big: 'w-[200px] h-[250px]',
  middle: 'w-[120px] h-[120px]',
  small: 'w-[48px] h-[48px]',
};

export function Avatar({ src, size = 'middle', alt, className }: AvatarProps) {
  const sizeClass = sizeMap[size];

  return (
    <div className={cn("rounded overflow-hidden bg-muted", sizeClass, className)}>
      <img
        src={src || `/images/noavatar_${size}.png`}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = `/images/noavatar_${size}.png`;
        }}
      />
    </div>
  );
}
```

### 6.4 API路由

```typescript
// pages/api/users/[id]/avatar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AvatarService } from '@/services/avatar.service';
import { auth } from '@/middleware/auth';

export const config = {
  api: {
    bodyParser: false, // 禁用bodyParser以处理multipart/form-data
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证用户身份
  const user = await auth(req, res);
  if (!user || parseInt(req.query.id as string) !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const avatarService = new AvatarService();

    // 解析multipart/form-data
    const formData = await parseFormData(req);

    const file = formData.files?.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const urls = await avatarService.uploadAvatar(user.id, file, file.content);

    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 6.5 数据库Schema

```prisma
// prisma/schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  avatar    String?  // 头像文件名
  // ...
}

// 头像不需要单独表，直接存储文件名即可
```

---

## 7. 迁移策略

### 7.1 数据迁移

```sql
-- 从UCenter迁移头像文件
-- 需要从 UC_ROOT/data/avatar/ 复制到新系统的 public/avatars/

-- 检查现有头像
SELECT uid, avatar
FROM cdb_memberfields
WHERE avatar != '';
```

### 7.2 兼容性处理

```typescript
// 兼容旧系统头像URL
export function getLegacyAvatarUrl(uid: number, size: 'big' | 'middle' | 'small' = 'middle'): string {
  const uidStr = uid.toString().padStart(9, '0');
  const dir1 = uidStr.substring(0, 3);
  const dir2 = uidStr.substring(3, 5);
  const dir3 = uidStr.substring(5, 7);
  const file = uidStr.substring(7);

  return `https://old-domain/uc/data/avatar/${dir1}/${dir2}/${dir3}/${file}_avatar_${size}.jpg`;
}

// 渐进式迁移: 先检查新系统，没有则使用旧系统
export function getAvatarUrl(uid: number, size: 'big' | 'middle' | 'small' = 'middle'): string {
  const newUrl = `/avatars/${getUserDir(uid)}/${size}.jpg`;

  if (existsSync(join(process.cwd(), 'public', newUrl))) {
    return newUrl;
  }

  return getLegacyAvatarUrl(uid, size);
}
```

---

## 8. 总结

### 8.1 旧系统架构

```
用户 → memcp.php → UCenter Flash → UCenter服务器 → 文件系统
                ↓
        camera.swf组件
```

### 8.2 新系统架构

```
用户 → React组件 → API路由 → Sharp处理 → 文件系统/CDN
                            ↓
                        Prisma数据库
```

### 8.3 迁移优势

| 特性 | 旧系统 | 新系统 |
|------|--------|--------|
| 上传方式 | Flash | HTML5 Dropzone |
| 图片处理 | 服务器端裁剪 | Sharp库处理 |
| 存储结构 | UCenter目录 | 兼容旧格式 |
| 响应式 | 否 | 是 |
| CDN支持 | 否 | 是 |
| 用户体验 | 差 | 优秀 |
