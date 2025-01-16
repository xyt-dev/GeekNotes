---
lang: zh-CN
title: XY6Notes
description: 页面的描述
order: 1
index: false
---

# Hello

Hello vuepress!

| First Header | Second Header |
| ---- | ---- |
| Content Cell | Content Cell |

[GitHub](https://github.com)

[[toc]]


```ts{2,7-8} title=".vuepress/config.ts" :no-line-numbers
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  title: "你好， VuePress",

  theme: defaultTheme({
    logo: "https://vuejs.org/images/logo.png",
  }),
});
```

一加一等于: {{ 1 + 1 }}

<span v-for="i in 3"> span: {{ i }} </span>

这是默认主题内置的 `<Badge />` 组件 <Badge text="演示" />