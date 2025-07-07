---
desc: "本文描述了如何使用Nginx代理生成更简洁的url"
tags: 
 - "vitepress"
 - "nginx"
 - "url"
updateTime: 2025-07-06 14:02:04
outline: deep
---
# 使用Nginx代理vitepress的时候生成更简洁的url

在[官方文档](https://vitepress.dev/zh/guide/routing#generating-clean-url)中，不知为何没有给出对Nginx服务器配置更简洁url的文档。

在这里进行一次补充说明。

## Nginx配置

加入以下指令

```nginx
rewrite ^(/.*)\.html$ $1 permanent;
```

## vitepress配置

再按照[官方文档](https://vitepress.dev/zh/reference/site-config#cleanurls)的说明，在`.vitepress/config.mts`添加如下配置。

```js{3}
export default defineConfig({
    //开启简洁的url
    cleanUrls:true,
})
```
