---
tags:
  - 崩坏星穹铁道
  - PlayCover
  - crashes
updateTime: 2025-07-02 10:52:23
outline: deep
description: 关于mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法
title: mac崩坏星穹铁道3.4版本playcover侧载无法启动的解决办法
---
在/etc/hosts文件下加入对以下域名的屏蔽。

如果你玩的是国服

```txt
0.0.0.0 globaldp-prod-cn01.bhsr.com
```

使用命令

```sh
echo "0.0.0.0 globaldp-prod-cn01.bhsr.com" | sudo tee -a /etc/hosts
```

如果你玩的是国际服

```txt
0.0.0.0 globaldp-prod-os01.starrails.com
```

使用命令

```sh
echo "0.0.0.0 globaldp-prod-cn01.bhsr.com" | sudo tee -a /etc/hosts
```

---

感谢github用户[tongoclinh](https://github.com/tongoclinh)对国际服屏蔽端点的补充

感谢playcover开发者[TheMoonThatRises](https://github.com/TheMoonThatRises)进行的命令补充

---
参考回答-playcover issues-1672-[Bug]: [CN Genshin Impact (Yuanshen) crashes](https://github.com/PlayCover/PlayCover/issues/1672#issuecomment-2343617972)

问题讨论-playcover issues-1905-[Bug]: [Honkai Star Rail crashes after the tap to start scene 3.4](https://github.com/PlayCover/PlayCover/issues/1905)
