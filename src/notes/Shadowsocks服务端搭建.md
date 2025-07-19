---
title: 在谷歌云 (GCP)上搭建Shadowsocks-libev服务端教程
description: 本教程详细指导如何在GCP的Ubuntu服务器上搭建Shadowsocks-libev服务端，包含从创建服务器到配置防火墙的全部步骤。
date: 2025-07-19 10:57:14
tags: ["GCP", "Ubuntu", "Shadowsocks", "代理", "翻墙"]
categories: ["技术教程"]
outline: [2,3]
---

# 概述

> [!NOTE] 提示
> 本教程由AI辅助生成

本教程将指导你在Google Cloud (GCP)的Ubuntu服务器上搭建Shadowsocks-libev服务端。教程从创建服务器开始，到最终完成配置，特别适合新手操作。

## 主要内容

1. 在Google Cloud上创建Ubuntu系统的虚拟机
2. 连接并配置服务器
3. 安装配置Shadowsocks-libev服务
4. 设置GCP防火墙规则
5. 开启BBR网络优化（可选）
6. 客户端连接测试

## 前提条件

* Google Cloud Platform账号（新用户有免费额度）
* 基本命令行操作能力

## 创建Google Cloud VM实例

1. **登录控制台**  
   访问<https://console.cloud.google.com/>

2. **创建VM实例**  
   导航到 `Compute Engine` > `VM实例` > 点击`创建实例`

3. **配置实例**  
   * **名称**：`shadowsocks-server`（建议）
   * **区域**：选地理位置近的区域（如`asia-east1`）
   * **机器类型**：`e2-micro`（免费额度足够）
   * **启动磁盘**：
     * 操作系统：`Ubuntu`
     * 版本：`Ubuntu 22.04 LTS`
   * **防火墙**：勾选`允许HTTP/HTTPS流量`
   * **网络标签**：添加`shadowsocks`标签

4. **完成创建**  
   点击`创建`按钮，等待实例启动

5. **记录IP地址**  
   在实例列表中复制`外部IP`地址

## 连接服务器

使用浏览器内置SSH工具：

1. 在VM实例列表中找到你的实例
2. 点击`连接`列下的`SSH`按钮
3. 新窗口会自动打开服务器终端
4. 确认出现`username@shadowsocks-server:~$`提示符

## 安装Shadowsocks-libev

在SSH终端执行：

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装Shadowsocks
sudo apt install shadowsocks-libev -y

# 验证安装
ss-server -h
```

---

## 配置Shadowsocks服务

创建配置文件：

```bash
sudo nano /etc/shadowsocks-libev/config.json
```

配置内容：

```json
{
    "server": "0.0.0.0",
    "server_port": 8388,
    "password": "YOUR_STRONG_PASSWORD",
    "method": "aes-256-gcm",
    "timeout": 300,
    "mode": "tcp_and_udp"
}
```

* 替换`YOUR_STRONG_PASSWORD`为高强度密码（建议含大小写字母+数字+符号）
* 可修改`server_port`端口号（1025-65535范围）

保存并退出（`Ctrl+X` > `Y` > `Enter`）

## 启动服务并设置自启

```bash
# 启动服务
sudo systemctl start shadowsocks-libev

# 开机自启
sudo systemctl enable shadowsocks-libev

# 检查状态
sudo systemctl status shadowsocks-libev
```

确认输出包含`active (running)`字样

## 配置GCP防火墙

1. 导航到 `VPC网络` > `防火墙`
2. 点击`创建防火墙规则`
3. 配置：
   * **名称**：`allow-shadowsocks-port`
   * **目标**：`指定目标标记` > 输入`shadowsocks`
   * **来源IP范围**：`0.0.0.0/0`
   * **协议端口**：
     * TCP：输入端口号（如8388）
     * UDP：输入相同端口号
4. 点击`创建`

## BBR网络加速（推荐）

```bash
# 编辑配置文件
sudo nano /etc/sysctl.conf

# 文件末尾添加
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr

# 应用配置
sudo sysctl -p

# 验证生效
sysctl net.ipv4.tcp_congestion_control
```

确认输出为`net.ipv4.tcp_congestion_control = bbr`

## 客户端连接配置

连接需要以下信息：

1. **服务器地址**：GCP实例的外部IP
2. **端口号**：配置文件中设置的端口
3. **密码**：配置文件中设置的密码
4. **加密方法**：`aes-256-gcm`

推荐客户端：
| 平台       | 客户端名称                  |

|------------|----------------------------|
| Windows    | shadowsocks-windows        |
| macOS      | ShadowsocksX-NG           |
| Android    | shadowsocks-android       |
| iOS        | Shadowrocket (付费)       |

测试方法：

1. 连接后访问<https://www.google.com>
2. 通过<https://whatismyip.com/>确认显示的是你的GCP服务器IP
