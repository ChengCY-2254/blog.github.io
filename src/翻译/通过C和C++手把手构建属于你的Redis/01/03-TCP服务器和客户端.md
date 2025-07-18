---
title: 通过C/C++手把手构建属于你的Redis--TCP服务器和客户端
description: 翻译博客 https://build-your-own.org/redis/03_hello_cs
date: 2025-07-17 13:42:34
tags: ["翻译","C","C++","Redis","client","server"]
categories: ["内容翻译"]
outline: [2,3]
---
<script setup="ts">
import HoverNote from '@/theme/components/HoverNote.vue'
const text_vps = "Virtual private server"
</script>

# 03.TCP服务器和客户端

> [!NOTE] 说明
> 原文链接：<https://build-your-own.org/redis/03_hello_cs>
>
> 原文作者：James Smith
>
> 译者：[Cheng](https://github.com/ChengCY-2254)

需要先熟悉SocketAPI。本章提供的代码并不完善，也非完全正确，因为网络编程不仅仅是调用API那么简单，这些将随着你学习的深入而逐渐掌握。

## 3.1 先决条件

### 熟悉Linux

尽管网络编程的原理大致相同，但在Windows和macOS等平台上存在着诸多差异。对于初学者而言，最方便的方式是直接使用Linux，即便你没有任何Linux经验。事实上，你无须深入了解Linux也能在上面进行编程。

1. 通过VitualBox、WSL或云服务提供商（<HoverNote triggerText="VPS" :note="text_vps"/>）获取一个Linux环境。
2. 掌握文件的编辑、移动、复制和删除操作。你无须在Linux中编写代码，只需学会如何将文件复制到Linux环境中，或者与虚拟机共享文件。
3. 使用`g++`编译代码。你无须折腾makefile这类复杂的构建系统。

```ansi
$ g++ -Wall -Wextra -Og -g foo.cpp bar.cpp -o prog
$ ./prog
```

### 基本编程技能

1. C语言编程概念：数组、结构体、内存和指针。
2. 调试技巧：
   - 使用`printf()`打印信息。使用`assert()`验证逻辑。
   - 使用`strace`检查系统调用。
   - 使用`gdb`检查正在运行的程序和核心转储，查看堆栈跟踪等。

C++特性仅用于提供一些辅助性的便利，比如`vector`和`string`。你不需要了解C++，但需要了解动态数组的概念，例如：

```cpp
struct MyString { char *data; size_t length;size_t capacity; };
```

### 学会查阅文档

本书并非参考手册，所以不会涵盖socket API的所有细节。

```ansi
man socket.2
```

此命令将会显示`socket()`系统调用的man手册页。在Linux系统商，所有的socket API都是系统调用。man手册页分为多个章节，由其数字后缀指明。例如：

- `man read.2`返回`read()`系统当用的手册页（第二章专用于系统调用）。
- `man read`返回`read` shell命令的手册页（会返回第一章，这不是我们想要的内容）
- `man socket.2`返回socket()系统调用。
- `man socket.7`返回套接字接口描述，而不是系统调用。

man手册页非常适合查找你已经知道的事物，但不适合学习新事物。有很棒的在线学习资源，例如[Beej's Guide](https://beej.us/guide/bgnet/)

## 3.2 创建TCP服务器

让我们实现伪代码：从客户端读取数据，然后写入响应，只需要做这两个操作。

```python
fd = socket()
bind(fd,address)
listen(fd)
while True:
    conn_fd = accept(fd)
    do_something_with(conn_fd)
    close(conn_fd)
```

### 步骤1：获取Socket句柄

`socket()`系统调用需要三个整数参数。

```c
int fd = socket(AF_INET,SOCK_STREAM,0);
```

1. `AF_INET`适用于IPv4。若要使用IPv6或双栈socket，请使用`AF_INET6`。
2. `SOCK_STREAM`用于TCP。若要使用UDP，请使用`SOCK_DGRAM`。
3. 第三个参数通常为`0`，对我们当前的需求来说是多余的。

这三个参数的组合决定了Socket的协议类型：

|协议|参数|
|---|---|
|IPv4+TCP|`socket(AF_INET,SOCK_STREAM,0)`|
|IPv6+TCP|`socket(AF_INET6,SOCK_STREAM,0)`|
|IPv4+UDP|`socket(AF_INET,SOCK_DGRAM,0)`|
|IPv6+UDP|`socket(AF_INET6,SOCK_DGRAM,0)`|

`mam socket.2`列出了所有标志，但只接受其中某些组合。我们目前只关注**TCP**，所以你可以暂时忽略这些参数。顺带一提，你可以查阅`man ip.7`来了解如何创建**TCP/UDP socket**以及所需的头文件。
