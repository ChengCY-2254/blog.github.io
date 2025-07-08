---
tags:
  - kms
  - windows
updateTime: 2025-07-06 13:38:06
outline: deep
title: Windows KMS激活服务器
description: 一个kms服务器，通过命令快速激活Windows副本
---

kms server地址: `kms.hutao.run`

## 如何使用？

以管理员身份打开powershell
slmgr -upk 如果有无法激活的密钥，那么就先卸载掉
slmgr -ipk xxxxx-xxxxx-xxxxx-xxxxx-xxxxx 密钥在下方列出来
slmgr -skms kms.hutao.run
slmgr -ato
slmgr -dlv

| 系统版本    | 密钥 |
| --------- | ----------- |
| Windows 11 专业版 Windows 10 专业版    | W269N-WFGWX-YVC9B-4J6C9-T83GX       |
| LTSC 2024  LTSC 2021 LTSC 2019 | M7XTQ-FN8P6-TTKYV-9D4CC-J462D        |

其它密钥请前往微软的官方文档查询
[密钥管理服务 (KMS) 客户端激活和产品密钥](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys?tabs=server2025%2Cwindows1110ltsc%2Cversion1803%2Cwindows81)
