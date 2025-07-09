---
tags:
  - git
  - github
  - 数据泄露
  - GitGuardian
updateTime: 2025-07-06 13:38:06
outline: deep
title: git仓库中的隐私数据泄露
description: git仓库中的token数据泄露
---
# git仓库中的隐私数据泄露

今天在开开心心的写一个[tg图片机器人](https://github.com/ChengCY-2254/telegram-images-bot)的代码。
突然收到了来自[GitGuardian](https://www.gitguardian.com)的一封邮件，翻译过来一看，tg token泄露了。
连忙查看处理方式。
首先将远程仓库删除，因为本地有着记录，也刚刚共享没多久。

## 解决步骤-叨叨版

在telegram撤销token。

还好**GItGuardian**提供了解决步骤。

你需要先安装`git-filter-repo`。

然后再执行`git filter-repo --use-base-name --path .env --invert-paths`

因为我泄露的是`.env`文件，所以把文件删除了就没事了。

直接执行会有一个警告，让你确认是否删除，因为它会对仓库进行重写。

在你对删除的文件确认无误后就可以追加上`--force`参数以进行仓库重构。

最后在重新共享到github即可。

## 解决步骤-代码版

### 安装`git-filter-repo`

```sh
brew install git-filter-repo
```

### 重构仓库

这一步对泄露隐私的文件进行移除，我在这里需要移除的文件是`.env`。

```sh
git filter-repo --use-base-name --path .env --invert-paths
```

### 重构确认

这一步对上一步的操作进行二次确认，因为该操作是不可逆的。

```sh
git filter-repo --use-base-name --path .env --invert-paths --force
```

## 碎碎叨

不过现在的扫描器还真是多啊，以后需要注意不要把密钥提交上去了。

比较庆幸的是，它不是代码硬编码，不然就得用一堆正则表达式了。

细思极恐的是，我才共享项目五分钟不到，就被扫到了。

不敢想象它要是没有发邮件，我这机器人就被冒用了。
