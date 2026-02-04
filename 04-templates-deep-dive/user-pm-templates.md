# 用户系统和短消息模板深入分析

## 1. 模板文件清单

### 1.1 用户相关模板

| 文件 | 行数 | 说明 |
|------|------|------|
| memcp_home.htm | ~200 | 用户控制面板首页 |
| memcp_profile.htm | ~150 | 个人资料编辑 |
| memcp_usergroups.htm | ~100 | 用户组管理 |
| memcp_credits.htm | ~120 | 积分管理 |
| memberlist.htm | ~80 | 会员列表 |
| logging.htm | ~120 | 登录页 |
| register.htm | ~200 | 注册页 |
| activate.htm | ~50 | 激活页 |
| lostpasswd.htm | ~80 | 找回密码 |
| space.htm | ~300 | 个人空间 |

### 1.2 短消息模板

| 文件 | 说明 |
|------|------|
| pm.htm | 短消息列表 |
| pm_send.htm | 发送短消息 |
| pm_view.htm | 查看短消息 |
| pm_checknew.htm | 检查新消息 |
| pmprompt.htm | 新消息提示 |

## 2. memcp_home.htm - 用户控制面板首页

### 2.1 模板结构

```
{subtemplate header}

<div class="container">
  <div id="nav">
    <a href="$indexname">$bbname</a> &raquo; {lang memcp}
  </div>

  <div class="content">
    <!-- 用户信息卡片 -->
    <div class="mainbox">
      <h3>{lang memcp_home_info}</h3>
      <table id="memberinfo" class="portalbox">
        <tr>
          <!-- 头像列 -->
          <td class="memberinfo_avatar">
            {echo discuz_uc_avatar($discuz_uid)}
            <p><a href="space.php?uid=$discuz_uid">$discuz_userss</a></p>
          </td>

          <!-- 基础信息列 -->
          <td class="memberinfo_forum">
            <ul>
              <li><label>UID:</label> $member[uid]</li>
              <li><label>{lang usergroup}:</label> $grouptitle</li>
              <li><label>{lang regdate}:</label> $member[regdate]</li>
              <li><label>{lang register} IP:</label> $member[regip]</li>
              <li><label>{lang lastvisit} IP:</label> $member[lastip]</li>
              <li><label>{lang lastvisit}:</label> $member[lastvisit]</li>
              <li><label>{lang lastpost}:</label> $member[lastpost]</li>
            </ul>
          </td>

          <!-- 积分统计列 -->
          <td class="memberinfo_forum">
            <ul>
              <li>{lang credits}: $credits</li>
              <!--{loop $extcredits $id $credit}-->
              <li>
                $credit[title]: $GLOBALS['extcredits'.$id] $credit[unit]
              </li>
              <!--{/loop}-->
              <li>{lang posts}: $member[posts]</li>
              <li>{lang digestposts}: $member[digestposts]</li>
            </ul>
          </td>
        </tr>
      </table>
    </div>

    <!-- 验证状态 (如果是待验证用户) -->
    <!--{if $validating}-->
    <div class="mainbox formbox">
      <h1>{lang memcp_validating}</h1>
      <form method="post" action="member.php?action=regverify">
        <input type="hidden" name="formhash" value="{FORMHASH}" />

        <!-- 验证状态 -->
        <tr>
          <th>{lang memcp_validating_status}</th>
          <td>
            <!--{if $validating['status'] == 0}-->
              待验证
            <!--{elseif $validating['status'] == 1}-->
              验证未通过
            <!--{/if}-->
          </td>
        </tr>

        <!-- 处理管理员 -->
        <!--{if $validating['admin']}-->
        <tr>
          <th>{lang memcp_validating_admin}</th>
          <td><a href="space.php?username=$validating[adminenc]">$validating[admin]</a></td>
        </tr>
        <!--{/if}-->

        <!-- 处理时间 -->
        <!--{if $validating['moddate']}-->
        <tr>
          <th>{lang memcp_validating_time}</th>
          <td>$validating[moddate]</td>
        </tr>
        <!--{/if}-->

        <!-- 备注信息 -->
        <!--{if $validating['remark']}-->
        <tr>
          <th>{lang memcp_validating_remark}</th>
          <td>$validating[remark]</td>
        </tr>
        <!--{/if}-->

        <!-- 申请留言 -->
        <tr>
          <th>{lang register_message}</th>
          <td>
            <textarea name="regmessagenew">$validating[message]</textarea>
          </td>
        </tr>

        <!-- 提交按钮 -->
        <!--{if $validating['status'] == 1}-->
        <tr class="btns">
          <td colspan="2">
            <button type="submit" name="verifysubmit">{lang submit}</button>
          </td>
        </tr>
        <!--{/if}-->
      </form>
    </div>
    <!--{/if}-->

    <!-- 最近积分日志 -->
    <div class="mainbox">
      <h3>{lang memcp_last_10_creditslog}</h3>
      <table>
        <thead>
          <tr>
            <td>{lang memcp_credits_log_transaction_fromto}</td>
            <td>{lang time}</td>
            <td>{lang memcp_credits_log_transaction_outgo}</td>
            <td>{lang memcp_credits_log_transaction_income}</td>
            <td>{lang action}</td>
          </tr>
        </thead>
        <tbody>
          <!--{loop $loglist $log}-->
          <tr>
            <td>
              <!--{if $log['fromto'] == 'BANK ACCOUNT'}-->
                {lang memcp_credits_transfer_bank}
              <!--{else}-->
                <a href="space.php?username=$log[fromtoenc]">$log[fromto]</a>
              <!--{/if}-->
            </td>
            <td>$log[dateline]</td>
            <td>
              <!--{if $log['send']}-->
                {$extcredits[$log[sendcredits]][title]} $log[send]
              <!--{/if}-->
            </td>
            <td>
              <!--{if $log['receive']}-->
                {$extcredits[$log[receivecredits]][title]} $log[receive]
              <!--{/if}-->
            </td>
            <td>
              <!--{if $log['operation'] == 'TFR'}-->
                {lang memcp_credits_transfer_send}
              <!--{elseif $log['operation'] == 'RCV'}-->
                {lang memcp_credits_transfer_receive}
              <!--{elseif $log['operation'] == 'EXC'}-->
                {lang memcp_credits_exchange}
              <!--{elseif $log['operation'] == 'UGP'}-->
                {lang memcp_usergroups_charged}
              <!--{elseif $log['operation'] == 'AFD'}-->
                {lang memcp_credits_transfer_bank}
              <!--{/if}-->
            </td>
          </tr>
          <!--{/loop}-->
        </tbody>
      </table>
    </div>

    <!-- 推广链接 -->
    <!--{if $creditspolicy['promotion_visit'] || $creditspolicy['promotion_register']}-->
    <div class="mainbox">
      <h3>{lang post_my_advisit}</h3>
      <table>
        <tr>
          <td>
            {lang post_promotion_url1}
            <input type="text" value="$boardurl?fromuid=$discuz_uid" />
            <button onclick="setcopy(...)">{lang copy}</button>
          </td>
        </tr>
        <tr>
          <td>
            {lang post_promotion_url2}
            <input type="text" value="$boardurl?fromuser=$discuz_user" />
            <button onclick="setcopy(...)">{lang copy}</button>
          </td>
        </tr>
        <tr>
          <td>
            <ul>
              <li>{lang my_promotion_url}</li>
              <!--{if $promotion_visit}-->
              <li>{lang credit_promotion_visit} $promotion_visit</li>
              <!--{/if}-->
              <!--{if $promotion_register}-->
              <li>{lang credit_promotion_register} $promotion_register</li>
              <!--{/if}-->
            </ul>
          </td>
        </tr>
      </table>
    </div>
    <!--{/if}-->
  </div>

  <!-- 侧边栏导航 -->
  <div class="side">
    {subtemplate personal_navbar}
  </div>
</div>

{subtemplate footer}
```

### 2.2 关键变量

| 变量 | 类型 | 说明 |
|------|------|------|
| $discuz_uid | int | 当前用户ID |
| $discuz_userss | string | 当前用户名 |
| $member | array | 用户信息 |
| $grouptitle | string | 用户组名称 |
| $extcredits | array | 扩展积分配置 |
| $validating | array | 验证信息 (待验证用户) |
| $loglist | array | 最近积分日志 |
| $promotion_visit | int | 访问推广奖励 |
| $promotion_register | int | 注册推广奖励 |

### 2.3 用户验证流程

```
注册提交
    ↓
发送验证邮件 (email验证)
    ↓
等待管理员审核
    ↓
验证状态: 0-待验证, 1-未通过
    ↓
用户可查看验证状态
    ↓
重新提交申请留言
    ↓
管理员再次审核
```

### 2.4 积分日志操作类型

| 操作代码 | 说明 |
|----------|------|
| TFR | 转账 (发送) |
| RCV | 转账 (接收) |
| EXC | 积分兑换 |
| UGP | 用户组购买 |
| AFD | 存入银行 |
| TRC | 交易 |
| RPC | 帖子购买 |
| SAC | 附件购买 |
| BGC | 银行利息 |

## 3. memcp_profile.htm - 个人资料编辑

### 3.1 模板结构

```
{subtemplate header}

<h1>{lang memcp_profile}</h1>

<form method="post" action="member.php?action=profile">
  <input type="hidden" name="formhash" value="{FORMHASH}" />

  <!-- 基础资料 -->
  <div class="mainbox formbox">
    <h3>{lang memcp_profile_basic}</h3>

    <!-- 用户名 (不可修改) -->
    <tr>
      <th>{lang username}</th>
      <td>$member[username] (不可修改)</td>
    </tr>

    <!-- 性别 -->
    <tr>
      <th>{lang gender}</th>
      <td>
        <select name="gendernew">
          <option value="0">{lang secret}</option>
          <option value="1" {if $member[gender]==1}selected{/if}>{lang male}</option>
          <option value="2" {if $member[gender]==2}selected{/if}>{lang female}</option>
        </select>
      </td>
    </tr>

    <!-- 生日 -->
    <tr>
      <th>{lang birthday}</th>
      <td>
        <input type="text" name="bdaynew_y" value="$member[bday][0]" size="4" />年
        <input type="text" name="bdaynew_m" value="$member[bday][1]" size="2" />月
        <input type="text" name="bdaynew_d" value="$member[bday][2]" size="2" />日
      </td>
    </tr>

    <!-- 所在地 -->
    <tr>
      <th>{lang location}</th>
      <td>
        <select name="provincenew">
          <!-- 省份列表 -->
        </select>
        <select name="citynew">
          <!-- 城市列表 -->
        </select>
      </td>
    </tr>

    <!-- 自我介绍 -->
    <tr>
      <th>{lang bio}</th>
      <td>
        <textarea name="bionew" rows="4">$member[bio]</textarea>
      </td>
    </tr>
  </div>

  <!-- 联系方式 -->
  <div class="mainbox formbox">
    <h3>{lang memcp_profile_contact}</h3>

    <tr>
      <th>{lang email}</th>
      <td>
        <input type="text" name="emailnew" value="$member[email]" />
        <!--{if $regverify == 1}-->
        <em>修改邮箱需要重新验证</em>
        <!--{/if}-->
      </td>
    </tr>

    <tr>
      <th>{lang msn}</th>
      <td><input type="text" name="msnnew" value="$member[msn]" /></td>
    </tr>

    <tr>
      <th>{lang qq}</th>
      <td><input type="text" name="qqnew" value="$member[qq]" /></td>
    </tr>

    <tr>
      <th>{lang homepage}</th>
      <td><input type="text" name="sitenew" value="$member[site]" /></td>
    </tr>

    <tr>
      <th>{lang aliww}</th>
      <td><input type="text" name="alwwnew" value="$member[aliww]" /></td>
    </tr>
  </div>

  <!-- 论坛设置 -->
  <div class="mainbox formbox">
    <h3>{lang memcp_profile_forum}</h3>

    <!-- 样式选择 -->
    <tr>
      <th>{lang style}</th>
      <td>
        <select name="styleidnew">
          <!--{loop $stylelist $style}-->
          <option value="$style[styleid]">$style[name]</option>
          <!--{/loop}-->
        </select>
      </td>
    </tr>

    <!-- 时区选择 -->
    <tr>
      <th>{lang timezone}</th>
      <td>
        <select name="timeoffsetnew">
          <!-- 时区选项 -->
        </select>
      </td>
    </tr>

    <!-- 每页帖子数 -->
    <tr>
      <th>{lang pppt}</th>
      <td>
        <select name="pppnew">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </td>
    </tr>

    <!-- 隐身模式 -->
    <tr>
      <th>{lang invisible}</th>
      <td>
        <label>
          <input type="checkbox" name="invisiblenew" value="1"
                 {if $member[invisible]}checked{/if} />
          {lang login_invisible_mode}
        </label>
      </td>
    </tr>
  </div>

  <!-- 提交按钮 -->
  <button type="submit" name="profilesubmit">{lang submit}</button>
</form>

{subtemplate footer}
```

## 4. memcp_usergroups.htm - 用户组管理

### 4.1 模板结构

```
{subtemplate header}

<h1>{lang memcp_usergroups}</h1>

<!-- 当前用户组 -->
<div class="mainbox">
  <h3>{lang memcp_usergroups_current}</h3>

  <table>
    <tr>
      <th>{lang usergroup}</th>
      <td>$grouptitle</td>
    </tr>
    <tr>
      <th>{lang memcp_usergroups_level}</th>
      <td>$member[groupexpiry]</td>
    </tr>
    <tr>
      <th>{lang memcp_usergroups_stars}</th>
      <td>
        <!--{loop $stars $star}-->
          <img src="{IMGDIR}/star_level{$star}.gif" />
        <!--{/loop}-->
      </td>
    </tr>
  </table>
</div>

<!-- 可用用户组 -->
<div class="mainbox">
  <h3>{lang memcp_usergroups_available}</h3>

  <table>
    <!--{loop $usergroupslist $groupid $group}-->
    <tr>
      <td>
        <h4>$group[grouptitle]</h4>
        <p>$group[description]</p>

        <!-- 所需积分 -->
        <p>
          <!--{loop $group[credits] $id $require}-->
            {$extcredits[$id][title]}: $require
          <!--{/loop}-->
        </p>

        <!-- 有效期 -->
        <p>{lang memcp_usergroups_expiry}: $group[expiry] {lang days}</p>

        <!-- 购买按钮 -->
        <!--{if $group[allowupgrade]}-->
          <form method="post" action="member.php?action=usergroups">
            <input type="hidden" name="groupid" value="$groupid" />
            <button type="submit">{lang memcp_usergroups_join}</button>
          </form>
        <!--{/if}-->
      </td>
    </tr>
    <!--{/loop}-->
  </table>
</div>

{subtemplate footer}
```

## 5. 短消息系统模板

### 5.1 pm.htm - 短消息列表

```
{subtemplate header}

<div id="nav">
  <a href="$indexname">$bbname</a> &raquo; {lang pm}
</div>

<!-- 短消息文件夹标签 -->
<div class="itemtitle">
  <ul>
    <li {if $folder == 'inbox'}class="current"{/if}>
      <a href="pm.php?folder=inbox">{lang pm_inbox}</a>
      <!--{if $newpm}-->(<em>$newpm</em>)<!--{/if}-->
    </li>
    <li {if $folder == 'outbox'}class="current"{/if}>
      <a href="pm.php?folder=outbox">{lang pm_outbox}</a>
    </li>
    <li {if $folder == 'track'}class="current"{/if}>
      <a href="pm.php?folder=track">{lang pm_track}</a>
    </li>
  </ul>
</div>

<!-- 短消息列表 -->
<div class="mainbox">
  <h3><!--{if $folder == 'inbox'}-->{lang pm_inbox}<!--{else}-->{lang pm_outbox}<!--{/if}--></h3>

  <!-- 批量操作 -->
  <form method="post" action="pm.php">
    <input type="hidden" name="formhash" value="{FORMHASH}" />

    <!-- 搜索框 -->
    <div class="searchbar">
      <input type="text" name="srchtxt" placeholder="{lang search_pm}" />
      <button type="submit">{lang search}</button>
    </div>

    <!-- 消息列表 -->
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" onclick="checkall()" /></th>
          <th>{lang pm_fromto}</th>
          <th>{lang subject}</th>
          <th>{lang pm_date}</th>
          <th>{lang pm_action}</th>
        </tr>
      </thead>
      <tbody>
        <!--{loop $pmlist $pm}-->
        <tr {if $pm[new]}class="newpm"{/if}>
          <td><input type="checkbox" name="delete[]" value="$pm[pmid]" /></td>
          <td>
            <!--{if $folder == 'inbox'}-->
              <a href="space.php?uid=$pm[uid]">$pm[author]</a>
            <!--{else}-->
              <a href="space.php?uid=$pm[touid]">$pm[touser]</a>
            <!--{/if}-->
          </td>
          <td>
            <a href="pm.php?action=view&pmid=$pm[pmid]">
              $pm[subject]
            </a>
            <!--{if $pm[new]}--><em>({lang new})</em><!--{/if}-->
          </td>
          <td>$pm[dateline]</td>
          <td>
            <a href="pm.php?action=view&pmid=$pm[pmid]">{lang view}</a>
            <a href="pm.php?action=delete&pmid=$pm[pmid]">{lang delete}</a>
          </td>
        </tr>
        <!--{/loop}-->
      </tbody>
    </table>

    <!-- 批量操作按钮 -->
    <div class="btns">
      <button type="submit" name="deletesubmit">{lang delete}</button>
      <!--{if $folder == 'inbox'}-->
      <button type="submit" name="markread">{lang pm_mark_read}</button>
      <!--{/if}-->
    </div>

    <!-- 分页 -->
    <div class="pages">$multipage</div>
  </form>
</div>

{subtemplate footer}
```

### 5.2 pm_send.htm - 发送短消息

```
{subtemplate header}

<h1><!--{if $pmid}-->{lang pm_reply}<!--{else}-->{lang pm_send}<!--{/if}--></h1>

<form method="post" action="pm.php?action=send">
  <input type="hidden" name="formhash" value="{FORMHASH}" />

  <!-- 收件人 -->
  <div class="mainbox formbox">
    <h3>{lang pm_to}</h3>

    <!--{if $pmid}-->
      <!-- 回复消息，收件人已固定 -->
      <input type="hidden" name="touid" value="$pm[touid]" />
      <p>$pm[touser]</p>
    <!--{else}-->
      <!-- 新消息，选择收件人 -->
      <input type="text" name="username" id="username"
             onblur="ajaxget('pm.php?action=checkuser&username='+this.value, 'userinfo')" />
      <span id="userinfo"></span>
    <!--{/if}-->
  </div>

  <!-- 消息内容 -->
  <div class="mainbox formbox">
    <h3>{lang pm_message}</h3>

    <!-- 主题 -->
    <tr>
      <th>{lang subject}</th>
      <td>
        <input type="text" name="subject" value="$pm[subject]" />
      </td>
    </tr>

    <!-- 内容 -->
    <tr>
      <th>{lang content}</th>
      <td>
        <textarea name="message" rows="10"></textarea>
        <!-- BBCode工具栏 -->
      </td>
    </tr>

    <!-- 选项 -->
    <tr>
      <th>{lang pm_options}</th>
      <td>
        <label>
          <input type="checkbox" name="saveoutbox" value="1" checked />
          {lang pm_save_outbox}
        </label>
      </td>
    </tr>

    <!-- 提交 -->
    <tr>
      <td colspan="2">
        <button type="submit" name="pmsubmit">{lang send}</button>
      </td>
    </tr>
  </div>
</form>

{subtemplate footer}
```

### 5.3 pm_view.htm - 查看短消息

```
{subtemplate header}

<h1>{lang pm_view}</h1>

<!-- 消息内容 -->
<div class="mainbox">
  <h3>$pm[subject]</h3>

  <table>
    <!-- 发件人信息 -->
    <tr>
      <td class="avatar">
        {echo discuz_uc_avatar($pm[uid])}
      </td>
      <td>
        <h4><a href="space.php?uid=$pm[uid]">$pm[author]</a></h4>
        <p>$pm[dateline]</p>
      </td>
    </tr>

    <!-- 消息正文 -->
    <tr>
      <td colspan="2" class="message">
        $pm[message]
      </td>
    </tr>
  </table>

  <!-- 操作按钮 -->
  <div class="btns">
    <a href="pm.php?action=send&pmid=$pm[pmid]">{lang pm_reply}</a>
    <a href="pm.php?action=delete&pmid=$pm[pmid]">{lang delete}</a>
    <a href="pm.php">{lang return}</a>
  </div>
</div>

<!-- 对话历史 (如果有) -->
<!--{if $pmhistory}-->
<div class="mainbox">
  <h3>{lang pm_history}</h3>

  <!--{loop $pmhistory $history}-->
  <table>
    <tr>
      <td><a href="space.php?uid=$history[uid]">$history[author]</a></td>
      <td>$history[message]</td>
      <td>$history[dateline]</td>
    </tr>
  </table>
  <!--{/loop}-->
</div>
<!--{/if}-->

{subtemplate footer}
```

### 5.4 pmprompt.htm - 新消息提示

```
<!--{if $newpm}-->
<div id="pmprompt" class="popupmenu_popup"
     style="display: none; position: fixed; right: 20px; bottom: 20px;">
  <h3>{lang pm_new}</h3>
  <p>{lang pm_new_prompt}</p>
  <ul>
    <!--{loop $newpm $pm}-->
    <li>
      <a href="pm.php?action=view&pmid=$pm[pmid]">
        $pm[subject] - {lang from} $pm[author]
      </a>
    </li>
    <!--{/loop}-->
  </ul>
  <a href="pm.php">{lang pm_inbox}</a>
  <a href="javascript:;" onclick="$('pmprompt').style.display='none'">
    {lang close}
  </a>
</div>

<script type="text/javascript">
  setTimeout(function() {
    $('pmprompt').style.display = 'block';
  }, 2000);
</script>
<!--{/if}-->
```

## 6. React组件拆分建议

### 6.1 用户控制面板

```jsx
// UserCenter
├── UserDashboard        // 用户面板首页
│   ├── UserCard        // 用户信息卡片
│   ├── CreditStats     // 积分统计
│   ├── ValidationStatus // 验证状态
│   ├── CreditLog       // 积分日志
│   └── PromotionLinks  // 推广链接
├── ProfileEditor       // 个人资料编辑
│   ├── BasicInfo      // 基础信息
│   ├── ContactInfo    // 联系方式
│   └── ForumSettings  // 论坛设置
├── UserGroupManager    // 用户组管理
│   ├── CurrentGroup   // 当前用户组
│   └── AvailableGroups // 可用用户组
└── UserSidebar         // 侧边栏导航
```

### 6.2 短消息系统

```jsx
// MessageSystem
├── MessageList         // 消息列表
│   ├── FolderTabs     // 文件夹标签
│   ├── MessageItem    // 单条消息
│   └── BulkActions    // 批量操作
├── MessageCompose      // 撰写消息
│   ├── RecipientInput // 收件人输入
│   ├── SubjectInput   // 主题输入
│   └── MessageEditor  // 消息编辑器
├── MessageView         // 查看消息
│   ├── MessageContent // 消息内容
│   ├── SenderInfo     // 发件人信息
│   └── MessageActions // 操作按钮
└── MessageNotification // 新消息提示
```

## 7. 数据流分析

### 7.1 用户信息获取

```php
// memcp.php
$discuz_uid = $_SESSION['uid'];
$member = DB::fetch_first("SELECT * FROM cdb_members WHERE uid='$discuz_uid'");
$extcredits = array();
for($i = 1; $i <= 8; $i++) {
  $extcredits[$i] = $_DCACHE['settings']['extcredits'][$i];
  $member['extcredits'.$i] = $member['extcredits'.$i];
}
$grouptitle = $_DCACHE['usergroups'][$member['groupid']]['grouptitle'];
```

### 7.2 积分日志查询

```php
// 获取最近10条积分日志
$loglist = array();
$query = DB::query("SELECT * FROM cdb_creditslog
                    WHERE uid='$discuz_uid'
                    ORDER BY dateline DESC
                    LIMIT 10");
while($log = DB::fetch($query)) {
  $loglist[] = $log;
}
```

### 7.3 短消息查询

```php
// pm.php
$folder = isset($_GET['folder']) ? $_GET['folder'] : 'inbox';

if($folder == 'inbox') {
  // 收件箱
  $sql = "SELECT pm.*, m.username as author
          FROM cdb_pms pm
          LEFT JOIN cdb_members m ON pm.msgfromid = m.uid
          WHERE pm.msgtoid = '$discuz_uid'
          ORDER BY pm.dateline DESC";
} elseif($folder == 'outbox') {
  // 发件箱
  $sql = "SELECT pm.*, m.username as touser
          FROM cdb_pms pm
          LEFT JOIN cdb_members m ON pm.msgtoid = m.uid
          WHERE pm.msgfromid = '$discuz_uid'
          ORDER BY pm.dateline DESC";
}

$pmlist = array();
$query = DB::query($sql);
while($pm = DB::fetch($query)) {
  $pmlist[] = $pm;
}
```

## 8. UCenter集成

### 8.1 头像显示

```html
<!-- Discuz模板 -->
{echo discuz_uc_avatar($discuz_uid)}

// UCenter API调用
function discuz_uc_avatar($uid) {
  return UC_API.'/avatar.php?uid='.$uid.'&size=middle';
}
```

### 8.2 React实现

```jsx
// UserAvatar组件
function UserAvatar({ uid, size = 'middle' }) {
  const avatarUrl = `${UC_API}/avatar.php?uid=${uid}&size=${size}`;
  return <img src={avatarUrl} alt="User Avatar" />;
}

// 使用TanStack Query缓存
function useUserAvatar(uid) {
  return useQuery({
    queryKey: ['avatar', uid],
    queryFn: () => fetchAvatar(uid),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
```
