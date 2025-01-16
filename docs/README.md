---
lang: zh-CN
title: XY6Notes
description: Notes using vuepress
order: 1
index: false
---

# XY6Notes

## 部署

```shell
# 安装 vuepress:
pnpm add vue vuepress@next    
# 安装打包器和默认主题:
pnpm add -D @vuepress/bundler-vite@next @vuepress/theme-default@next
# 可能提示需要安装 sass:
pnpm add -D sass-embedded
# 使用 vuepress-theme-hope 主题创建模板:
pnpm create vuepress-theme-hope add [dirname] 
# 安装本地搜索插件和jieba分词:
pnpm install -D @vuepress/plugin-slimsearch@next  
pnpm add nodejs-jieba
```

## 配置

- **package.json:**
  - 可能需要添加 `"type": "module",` 切换为ECMA模式
  - 在 `"script"` 字段设置部署命令, 以docs目录为文档的根目录部署为例:
    ```json
    "scripts": {
        "docs:dev": "vuepress-vite dev docs",
        "docs:build": "vuepress-vite build docs",
        "docs:clean-dev": "vuepress-vite dev docs --clean-cache",
    }
    ```
- **.vuepress/config.js:** 入口配置文件 \
  示例: 
  ```js
  import { viteBundler } from "@vuepress/bundler-vite"
  import { hopeTheme } from "vuepress-theme-hope"
  import { defineUserConfig } from "vuepress/cli"
  import { cut } from "nodejs-jieba"

  export default defineUserConfig({
    bundler: viteBundler(),
    title: "XV6 Notes",
    theme: hopeTheme({
      // 导航栏
      navbar: [

      ],

      // 侧边栏
      sidebar: {

      },

      plugins: {
        // 搜索
        slimsearch: {
          indexcontent: true,
          indexoptions: {
            // 使用 nodejs-jieba 进行分词
            tokenize: (text, fieldname) =>
              fieldname === 'id' ? [text] : cut(text, true),
          },
          searchdelay: 50,
        },

        components: {
          components: [
            // 想使用的主题内置组件
          ],
        },
      },

      footer: "默认页脚",

      hotreload: true,
      darkmode: "toggle",
      logo: "path/to/icon" // 默认 .vuepress/public 为根目录
    }),

  })
  ```
