---
tags:
  - macOS
  - 镜像
updateTime: 2025-11-25 08:58:40
outline: deep
title: 使用mist下载以往版本的macOS
description: 如何在arm mac上下载Intel架构的macOS
---
# 使用mist

- 安装mist
```zsh
brew install mist
```

- 下载macOS，以macOS Catalina为例
```zsh
sudo mist download installer 10.15.7 iso
```

mist可以直接提供iso格式镜像，具体详情请查看`mist download installer --help`