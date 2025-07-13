---
title: 通过C和C++手把手构建属于你的Redis
description: 翻译博客 https://build-your-own.org/redis/
date: 2025-07-12 23:58:00
tags: ["翻译","C","C++","Redis"]
categories: ["内容翻译"]
outline: [2,3]
---
<script setup="ts">
//使用**内容**加粗的时候记得换行，不知道为什么，如果不换行，它就检查不出来。
import HoverNote from '@/theme/components/HoverNote.vue'
const text_rpc = "远程过程调用"
const text_motto_0 = "What i cannot create, I do not understand"
</script>
> [!NOTE] 前言
> 原文链接：<https://build-your-own.org/redis/>
>
> 原文作者：James Smith
>
> 译者：[Cheng](https://github.com/ChengCY-2254)
>
> 译者述：这个博客是完全没有中文翻译的，再加上redis的原理我确实想了解，在此之前，我只了解它是一个数据结构服务器，还有关于Redis为什么嗯这么快的八股文。关于C/C++方面，可能有些内容有所谬误，还请指正。

# 使用C/C++构建你自己的Redis

> 网络编程，数据结构和C语言底层

## 介绍

通过从头开始来编写代码来构建互联网的基础软件。
**如果你能构建一个Redis服务器，那么你就可以写出任何超越CRUD的软件！**
因为它能教会你三项技能。

- **网络编程** 更高层次的编程是为多台机器进行编写程序。想想HTTP服务器、<HoverNote triggerText="RPC" :note="text_rpc" />、数据库、分布式系统的方方面面。
- **数据结构** 将数据结构应用于实际的业务场景方面，Redis堪称典范。既然能从生产级软件中汲取经验，何必囿于纸上谈兵的理论知识呢？
- **底层C语言** C语言的过去、现在乃至将来都是系统编程和基础软件的基石。它是你通往众多底层项目开发领域的金汤匙。

**为什么要从头开始？**
查理德·费曼（Richard Feynman）的一句话：<HoverNote triggerText="实践出真知" :note="text_motto_0" />。你应该用项目来校验你的学习。

**为何选择本书？**
真实的Redis项目是一个庞大且凝聚了无数开发者心血的代码库。而本书则为你提纲挈领，化繁为简，一步步带你掌握它的核心要点。

## 项目源码

<https://build-your-own.org/redis/src.tgz>

## PDF/EPUB电子版与纸质版

本书的网页版可免费阅读，若您认为本书对您有所裨益，欢迎[购买](https://build-your-own.org/redis/99_wip.html)。

## 扩展阅读

我个人选择了一些书籍，对于那些想要从零到一构建一个Redis的开发者而言，具有极高的参考价值。

---

**Beej’s Guide to Network Programming.**

[Web](https://beej.us/guide/bgnet/)    [Amazon](https://amzn.to/3QBlgMZ)

这是一本网络编程的“葵花宝典”，内容全面，可作参考。这会是一个很好的补充。

**The Linux Programming Interface** by Michael Kerrisk.

[Web](https://man7.org/tlpi/)    [Amazon](https://amzn.to/40fyaDE)

套接字API只是Linux API接口中的冰山一角。如果您正在为Linux开发应用程序，您可能需要熟悉其他部分，例如IO、线程和进程、信号等其他API接口将是必经之路。

**The C Programming Language** by K&R.

[Amazon](https://amzn.to/3Fzzcku)

如果你不会C语言，但还想尝试该项目？无论你是新人还是老手，这本经典著作都能助您快速掌握C语言的精髓。
