# Markdown Extension Examples

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## 一个项目创建快速复制的示例

```md
---
title: 我是标题
description: 我是描述
date: 2025-07-13 9:58:00
tags: ["翻译","C","C++","Redis"]
categories: ["内容翻译"]
outline: [2,3]
---
<script setup="ts">
import HoverNote from '@/theme/components/HoverNote.vue'
</script>
```

## Syntax Highlighting

VitePress provides Syntax Highlighting powered by [Shiki](https://github.com/shikijs/shiki), with additional features like line-highlighting:

**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## More

Check out the documentation for the [full list of markdown extensions](https://vitepress.dev/guide/markdown).
