---
title: 关于OpenResty反向代理长任务API提前返回504的解决办法
description: OpenResty反向代理API提前关闭连接导致系统报错
tags:
  - OpenResty
  - API
  - Nginx
  - 504 time out
updateTime: 2025-06-30 12:57:24
outline: deep
---
# 关于OpenResty反向代理长任务API提前返回504的解决办法

> 当你的API明明正常运行，OpenResty却总是返回504 Gateway Time-out？我们来解决这个问题。

## 问题现象

在使用OpenResty作为反向代理时，你可能会遇到这样的情况：

- API在后台服务器上正常运行并返回了正确结果
- OpenResty却返回了504 Gateway Time-out错误
- 问题主要发生在执行时间较长的API任务上
- 错误日志中出现类似upstream timed out的记录

## 根本原因

问题核心在于**OpenResty/Nginx**的默认超时设置：

| 超时参数 | 默认值 | 作用描述 |
| --------- | --------- | --------- |
| `proxy_read_timeout` | 60s | 等待上游服务器响应的最大时间 |
| `proxy_connect_timeout` | 60s | 与上游服务器建立连接的超时时间 |
| `proxy_send_timeout` | 60s | 向上游服务器发送请求的超时时间 |

## 解决方案

添加上面列出的参数，并修改默认值

```nginx{5-7}
location /your-api-path/ {
    proxy_pass http://your-backend-server;
    
    # 核心超时设置（根据需求调整）
    proxy_read_timeout 600s;     # 接收响应超时（关键参数）
    proxy_connect_timeout 75s;   # 连接上游超时
    proxy_send_timeout 600s;     # 发送请求超时
    
    # 优化建议配置
    proxy_buffering off;         # 禁用缓冲，适合长任务
    proxy_http_version 1.1;      # 使用HTTP/1.1
}
```
