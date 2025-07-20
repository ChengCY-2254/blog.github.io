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
const text_tcp_no_delay = "禁用TCP的Nagle算法，以减少数据传输的延迟（通过立即发送小数据包），适用于需要快速响应的应用（如实时游戏）"
const text_ip_qos = "IP网络中的服务质量（Quality of Service）机制，用于管理流量优先级、带宽分配或拥塞控制（如优先处理语音或视频数据）"
const text_wildcard_address = "监听所有可用的本地网络接口（所有IP地址）上的指定端口（如1234），使服务能接受来自任何网络接口的连接请求。​​"
const text_datagram = "数据包是网络层的路由单元，负责主机到主机的路由，数据报是传输层的服务单元，负责进程到进程的不可靠传输。​"
</script>

# 03.TCP服务器和客户端

> [!NOTE] 说明
> 原文链接：<https://build-your-own.org/redis/03_hello_cs>
>
> 原文作者：James Smith
>
> 译者：[Cheng](https://github.com/ChengCY-2254)

需要先熟悉socket API。本章提供的代码并不完善，也非完全正确，因为网络编程不仅仅是调用API那么简单，这些将随着你学习的深入而逐渐掌握。

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

### 步骤2：设置socket选项

有许多选项可以改变socket的行为，例如<HoverNote triggerText="TCP no delay" :note="text_tcp_no_delay"/>、<HoverNote triggerText="IP QoS" :note="text_ip_qos"/>等（这些我们目前无须关心）。这些选项通过`setsockopt()`API来设置。与`bind()`API类似，这只是想操作系统传递参数，因为实际的socket尚未真正创建。

```cpp
int val = 1;
setsockopt(fd,SOL_SOCKET,SO_REUSEADDR,&val,sizeof(val));
```

- 第二个和第三个参数的组合指定了要设置哪个选项。
- 第四个三数是选项值。
- 不同的选项使用不同的数据类型，因此也需要提供选项值的大小。

在这里，我们将`SO_REUSEADDR`选项设置为`int`值`1`，此选项接受布尔值`0`或`1`。它有什么用呢？这与延迟数据包以及TCP的`TIME_WAIT`状态有关。理解其原理需要相当多的TCO知识，你可以自行查阅相关解释。

`SO_REUSEADDR`的作用非常重要。如果没有将其设置为`1`,服务器在重启后可能无法绑定到之前使用的IP地址端口。这通常是TCP中不希望出现的行为。因此，即使你没有完全理解它的具体作用，也应该为所有监听socket都明确启用`SO_REUSEADDR`！

你可以在`man socket.7`，`man ip.7`，`man tcp.7`中查找其它socket选项，但不要指望能完全理解它们。

### 步骤3：绑定到地址

我们把服务器绑定到<HoverNote triggerText="通配地址" :note="text_wildcard_address"/>`0.0.0.0:1234`。这是`listen()`函数的一个参数。

```cpp
struct sockaddr_in addr = {};
addr.sin_family = AF_INET;
addr.sin_port = htons(1234);        // 端口
addr.sin_addr.s_addr = htonl(0);    // 一个通配地址
int rv = bind(fd, (const struct sockaddr *)&addr, sizeof(addr));
if (rv) { die("bind()"); }
```

`struct sockaddr_in`结构体存储一个IPv4地址和端口的组合，其中数字以大端序（big-endian）存储，并通过`htons()`和`htonl()`函数进行转换。例如，`1.2.3.4`这个IP地址由`htonl(0x1020304)`表示。

```cpp
struct sockaddr_in {
    uint16_t       sin_family; // AF_INET
    uint16_t       sin_port;   // 端口 大端序
    struct in_addr sin_addr;   // IPv4
};
struct in_addr {
    uint32_t       s_addr;     // IPv4 大端序
};
```

### 注：字节序

在内存中，整数有两种存储方式：

- 小端序（Little-endian）：最低有效字节在前。
- 大端序（Big-endian）：也称**网络字节序**，最高有效字节在前。

|顺序|uint16_t(0x0304)|uint32_t(0x1020304)|
|---|---|---|
|大端|04 03|04 03 02 01|
|小端|03 04|01 02 03 04|

两者的区别在于字节的排列顺序。翻转字节顺序被称为“字节序交换”。

在过去，存在两种字节序（大小端）的 CPU，因此任何协议或数据格式都必须选择其中一种字节序。此时软件需在 CPU 的字节序与格式的字节序之间进行转换。到 2025 年，小端序（Little-Endian）CPU 占据主导地位。若某格式采用大端序（Big-Endian），则需执行字节交换操作。

```cpp
uint32_t htonl(uint32_t hostlong);      // 长整型主机序转网络序
uint16_t htons(uint16_t hostshort);     // 短整型主机序转网络序
```

`htonl()`可以读作“Host to Network Long”（主机字节序转网络长整型）。这里的“Host”指的是CPU的字节序，“Network”指的是大端序，“Long”实际上是`uint32_t`，而非C语言中的`long`类型。在小端序的CPU上，这个函数会进行字节序交换。而在大端序的CPU上，它什么也不做。这个函数名很有意思，更有意思的是一个功能有着四种不同的命名。

```cpp
// 主机序→网络序（大端）的32位整数转换，用于IP地址等
uint32_t htonl(uint32_t hostlong);
// 网络序（大端）→主机序的32位整数转换，ntohl与htonl互为逆操作
uint32_t ntohl(uint32_t netlong);
// 主机序→大端序的32位转换（POSIX标准，功能等同htonl但更明确语义）
uint32_t htobe32(uint32_t host_32bits); 
// 大端序→主机序的32位转换（POSIX标准，功能等同ntohl）
uint32_t be32toh(uint32_t big_endian_32bits);
```

端绪转换是一种对称的过程，它是在两种字节序之间进行转换，而不是单纯的从一种转换到另一种。

### 注：IPv6地址

对于IPv6，使用`struct sockaddr_in6`结构体。

```cpp
struct sockaddr_in6 {
    uint16_t        sin6_family;   // AF_INET6
    uint16_t        sin6_port;     // 端口 大端序
    uint32_t        sin6_flowinfo; // 忽略
    struct in6_addr sin6_addr;     // IPv6
    uint32_t        sin6_scope_id; // 忽略
};
struct in6_addr {
    uint8_t         s6_addr[16];   // IPv6
};
```

`struct sockaddr_in`和`struct sockaddr_in6`两者大小不同，因此需要传入的结构体大小（即`addrlen`参数）：

```cpp
int bind(int sockfd,const struct sockaddr *addr,socklen_t addrlen);
```

实际上并不会真正使用`struct sockaddr`结构体，只需要将`struct sockaddr_in`或`struct sockaddr_in6`强制转换为此指针类型，以匹配函数参数传递时的原型要求。

### 步骤4：监听

前面所有的步骤的仅仅是在传递参数而已。真正的socket实际上是调用`listen()`之后才创建的。操作系统会自动处理TCP握手过程，并将已建立的连接放入一个队列中。应用程序随后可以通过`accept()`调用来获取这些连接。

```cpp
 // listen
rv = listen(fd, SOMAXCONN);
if (rv) { die("listen()"); }
```

第二个参数指定待处理连接队列的大小——Linux系统中SOMAXCONN宏默认为4096。不过该参数实际无关紧要，毕竟`accept()`参数本身并非性能瓶颈。

### 步骤5：接受连接

服务器进入一个循环，开始接受并处理每个客户端的连接。

```cpp
    while (true) {
        // accept
        struct sockaddr_in client_addr = {};
        socklen_t addrlen = sizeof(client_addr);
        int connfd = accept(fd, (struct sockaddr *)&client_addr, &addrlen);
        if (connfd < 0) {
            continue;   // error
        }

        do_something(connfd);
        close(connfd);
    }
```

`accept()`系统调用还会返回对端的地址信息。`addrlen`参数在此具有双重作用：传入时表示地址缓冲区的长度，返回时则更新为实际地址信息的长度。

### 步骤6：读和写

我们模拟处理的只包含一次`read()`操作和`write()`操作。

```cpp
static void do_something(int connfd) {
    char rbuf[64] = {};
    ssize_t n = read(connfd, rbuf, sizeof(rbuf) - 1);
    if (n < 0) {
        msg("read() error");
        return;
    }
    printf("client says: %s\n", rbuf);

    char wbuf[] = "world";
    write(connfd, wbuf, strlen(wbuf));
}
```

在网络通讯中，你完全可以使用`send`/`recv`函数来替代`read`/`write`。两者本质上是相同的，唯一的区别在于`send`/`recv`支持传递可选标志位——不过我们并不需要使用这个特性。

```cpp
ssize_t read(int fd, void *buf, size_t len);
ssize_t recv(int fd, void *buf, size_t len, int flags);         // 读
ssize_t write(int fd, const void *buf, size_t len);
ssize_t send(int fd, const void *buf, size_t len, int flags);   // 写
```

现阶段我们可以忽略了`write()`的返回值——完全没做错误处理。待到下一章，我们将编写功能完备的完整项目。

## 3.3 创建一个TCP客户端

我们的任务是，让客户端先向服务器发送数据，接着读取服务器返回的响应数据，最后关闭该连接即可。

```cpp
int fd = socket(AF_INET, SOCK_STREAM, 0);
if (fd < 0) {
    die("socket()");
}

struct sockaddr_in addr = {};
addr.sin_family = AF_INET;
addr.sin_port = ntohs(1234);
addr.sin_addr.s_addr = ntohl(INADDR_LOOPBACK);  // 127.0.0.1
int rv = connect(fd, (const struct sockaddr *)&addr, sizeof(addr));
if (rv) {
    die("connect");
}

char msg[] = "hello";
write(fd, msg, strlen(msg));

char rbuf[64] = {};
ssize_t n = read(fd, rbuf, sizeof(rbuf) - 1);
if (n < 0) {
    die("read");
}
printf("server says: %s\n", rbuf);
close(fd);
```

`INADDR_LOOPBACK`被定义为`0x7f000001`，也就是我们常用的`127.0.0.1`。

使用以下命令来编译我们的程序。

```ansi
g++ -Wall -Wextra -O2 -g 03_server.cpp -o server
g++ -Wall -Wextra -O2 -g 03_client.cpp -o client
```

请在一个终端窗口里启动服务器端程序：`./server`。

```ansi
$ ./server
client says: hello
```

接着在另一个命令提示符窗口启动客户端：`./client`。

```ansi
$ ./client
server says: world
```

## 3.4 更多socketAPI

这里存在着暂非必须但关键的知识点。

**需要理解`struct sockaddr`结构体。**

让我们来解析这些函数原型。

```cpp
int accept(int sockfd, struct sockaddr *addr, socklen_t len);
int connect(int sockfd, const struct sockaddr *addr, socklen_t len);
int bind(int sockfd, const struct sockaddr *addr, socklen_t len);
```

我们还没使用过`struct sockaddr`，而是将`struct sockaddr_in`或`struct sockaddr_in6`转换为这种指针类型。以下就是这些结构体的定义方式。

```cpp
// pointless
struct sockaddr {
    unsigned short  sa_family;      // AF_INET, AF_INET6
    char            sa_data[14];    // useless
};
// IPv4:port
struct sockaddr_in {
    sa_family_t     sin_family;     // AF_INET
    uint16_t        sin_port;       // port number, big-endian
    struct in_addr  sin_addr;       // IPv4 address
};
// IPv6:port
struct sockaddr_in6 {
    sa_family_t     sin6_family;    // AF_INET6
    uint16_t        sin6_port;      // port number, big-endian
    uint32_t        sin6_flowinfo;
    struct in6_addr sin6_addr;      // IPv6 address
    uint32_t        sin6_scope_id;
};
// can store both sockaddr_in & sockaddr_in6
struct sockaddr_storage {
    sa_family_t     ss_family;      // AF_INET, AF_INET6
    char __some_padding[__BIG_ENOUGH_NUMBER];
};
```

socket API的设计堪称奇怪，因为它定义了许多毫无价值的类型。

- `struct sockaddr *`结构体也没什么作用——实际上等同于**void\***。
- struct sockaddr_storage本用于兼容两种地址格式，但有更简洁的联合体类型可以替代 `union { struct sockaddr_in v4; struct sockaddr_in6 v6 }`。
- `struct sockaddr_in`和`struct sockaddr_in6`才是真正有用的结构体。
- `sin_addr/sin6_addr`是无意义的嵌套结构，只有一个字段。
- `*_family`是一个16位的整数，但它却被封装成了独立类型。

整套API的设计目标，可以通过简单的带标记联合体实现。

```cpp
struct fictional_sane_sockaddr {
    uint16_t family;    // tag: AF_INET, AF_INET6
    uint16_t port;
    union {
        struct { uint8_t ipv4[4]; };
        struct { uint8_t ipv6[16]; /* ... */ };
    };
};
// warning: not compatible with `struct sockaddr_*`
```

### 系统调用、API与库

在Linux系统中，每个socket函数都是libc库对系统调用的封装，这套socket API被称为BSD socket，所有主流平台都支持该标准。Windows平台与BSD socket的API大体相同，仅存在细微差别（函数命名不同）。

虽然存在各种socket库，但实际作用可能不如预期。真正的复杂性不在于API本身，而在于协议实现、事件循环等其它环节，因此这类库能发挥的作用有限。socket API本身非常简单，仅包含少量方法，稍微复杂的部分是`sockaddr_*`结构体家族。

### 在`connect()`前指定本机地址

客户端socket也可以在`connect()`前使用`bind()`来指定源地址。若不手动指定，系统将自动设置源地址。当存在多个可用地址的时候，这种方式特别有用。若bind()中端口号设置为0，系统会自动分配端口。

### 获取通讯双方地址

当使用通配符IP或这让系统自动分配端口时，需通过`getsockname()`获取TCP连接的本地地址，使用`getpeername()`获取远程地址（`accept()`返回的相同地址）。

```cpp
int getsockname(int fd, struct sockaddr *addr, socklen_t *addrlen); // 本地
int getpeername(int fd, struct sockaddr *addr, socklen_t *addrlen); // 远程
```

### 域名解析

`getaddrinfo()`函数用于解析域名获取IP地址，其手册页中提供了示例程序。

与其它socket API不同，该函数在Linux上并非系统调用，而是在实现的libc库中——因为域名解析是属于复杂的上层操作。系统需要先读取`/etc/resolv.conf`、`/etc/hosts`等配置文件，再通过UDP协议向DNS服务器发起查询。

### Socket和IPC（进程间通信）

单机进程通信机制（如Unix域套接字、管道等）本质上是一台机器内的网络通信，因此编程计数与网络通信相同。

Unix域套接字采用与网络套接字相同的API。可创建<HoverNote triggerText="数据报" :note="text_datagram"/>或字节流的形式的通信通道。创建时须在`socket()`方法中设置不同标识位，并使用`sockaddr_un`结构体，其余操作君宇网络套接字一致。详见`man unix.7`手册内容说明。

管道属于单向字节流，使用时需设计类似TCP套接字的通信协议——其复杂程度可能超出预期。我们将在下一章详解协议设计相关内容。

### 读写操作中的各种变体

我们采用read/write的系统调用属于socket操作，这是最通用的IO接口，同样可以用于磁盘文件、管道等场景。以下列出读写操作的变体以供参考。

|读|写|描述|
|---|---|:---|
|`read`|`write`|使用单个连续缓冲区进行读写|
|`readv`|`writev`|支持多个缓冲区的读写操作|
|`recv`|`send`|包含额外控制标志位|
|`recvfrom`|`sendto`|可获取/设置远端地址（基于数据包的通信）|
|`recvmsg`|`sendmsg`|具备更多标志位和控制参数的分散读写|
|`recvmmsg`|`sendmmsg`|通过单次系统调用完成多次recvmsg/sendmsg操作|

## 3.5 示例代码

::: details 03_client.cpp

```cpp
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/ip.h>

static void die(const char *msg) {
    int err = errno;
    fprintf(stderr, "[%d] %s\n", err, msg);
    abort();
}

int main() {
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        die("socket()");
    }

    struct sockaddr_in addr = {};
    addr.sin_family = AF_INET;
    addr.sin_port = ntohs(1234);
    addr.sin_addr.s_addr = ntohl(INADDR_LOOPBACK);  // 127.0.0.1
    int rv = connect(fd, (const struct sockaddr *)&addr, sizeof(addr));
    if (rv) {
        die("connect");
    }

    char msg[] = "hello";
    write(fd, msg, strlen(msg));

    char rbuf[64] = {};
    ssize_t n = read(fd, rbuf, sizeof(rbuf) - 1);
    if (n < 0) {
        die("read");
    }
    printf("server says: %s\n", rbuf);
    close(fd);
    return 0;
}
```

:::

::: details 03_server.cpp

```cpp
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/ip.h>


static void msg(const char *msg) {
    fprintf(stderr, "%s\n", msg);
}

static void die(const char *msg) {
    int err = errno;
    fprintf(stderr, "[%d] %s\n", err, msg);
    abort();
}

static void do_something(int connfd) {
    char rbuf[64] = {};
    ssize_t n = read(connfd, rbuf, sizeof(rbuf) - 1);
    if (n < 0) {
        msg("read() error");
        return;
    }
    fprintf(stderr, "client says: %s\n", rbuf);

    char wbuf[] = "world";
    write(connfd, wbuf, strlen(wbuf));
}

int main() {
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        die("socket()");
    }

    // this is needed for most server applications
    int val = 1;
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &val, sizeof(val));

    // bind
    struct sockaddr_in addr = {};
    addr.sin_family = AF_INET;
    addr.sin_port = ntohs(1234);
    addr.sin_addr.s_addr = ntohl(0);    // wildcard address 0.0.0.0
    int rv = bind(fd, (const struct sockaddr *)&addr, sizeof(addr));
    if (rv) {
        die("bind()");
    }

    // listen
    rv = listen(fd, SOMAXCONN);
    if (rv) {
        die("listen()");
    }

    while (true) {
        // accept
        struct sockaddr_in client_addr = {};
        socklen_t addrlen = sizeof(client_addr);
        int connfd = accept(fd, (struct sockaddr *)&client_addr, &addrlen);
        if (connfd < 0) {
            continue;   // error
        }

        do_something(connfd);
        close(connfd);
    }

    return 0;
}
```

:::
