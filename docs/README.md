---
lang: zh-CN
title: 本项目安装与配置
icon: lightbulb
---

# XY6Notes

> 本项目基于 vuepress v2

## 安装 (pnpm)

```shell:no-line-numbers
# 安装 vuepress:
pnpm add vue vuepress@next    
# 安装打包器和默认主题:
pnpm add -D @vuepress/bundler-vite@next @vuepress/theme-default@next
# 可能提示需要安装 sass:
pnpm add -D sass-embedded
# 安装 vuepress-theme-hope 主题
pnpm add -D vuepress-theme-hope
# 使用 vuepress-theme-hope 主题自动创建模板:
# pnpm create vuepress-theme-hope add [dirname] 
# 安装本地搜索插件和jieba分词:
pnpm add -D @vuepress/plugin-slimsearch@next  
pnpm add nodejs-jieba
# 安装图标支持
pnpm add -D @vuepress/plugin-icon@next

# 安装 Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
```

## 配置

[vuepress-theme-hope配置指南](https://theme-hope.vuejs.press/zh/guide/)

- **package.json:**
  - 可能需要添加 `"type": "module",` 切换为ECMA模式
  - 在 `"script"` 字段设置部署命令, 以docs目录为文档的根目录部署为例:
    ```json:no-line-numbers
    "scripts": {
        "docs:dev": "vuepress-vite dev docs",
        "docs:build": "vuepress-vite build docs",
        "docs:clean-dev": "vuepress-vite dev docs --clean-cache",
    }
    ```
- **.vuepress/config.js:** 入口配置文件 \
  示例: 
  ```js:no-line-numbers
  import { viteBundler } from "@vuepress/bundler-vite"
  import { hopeTheme } from "vuepress-theme-hope"
  import { defineUserConfig } from "vuepress/cli"
  import { cut } from "nodejs-jieba"
  import { sidebarConfig } from "./sidebar"

  export default defineUserConfig({
    bundler: viteBundler(),
    title: "Title Name",
    base: "/", // 部署站点的根目录路径
    head: [['link', { rel: 'icon', href: '/path/to/.svg' }]], // <head> 标签内插入内容

    theme: hopeTheme({
      // 导航栏
      navbar: [

      ],

      // 侧边栏
      sidebar: sidebarConfig,

      plugins: {
        // 搜索
        slimsearch: {
          indexContent: true,
          indexOptions: {
            // 使用 nodejs-jieba 进行分词
            tokenize: (text, fieldname) =>
              fieldname === 'id' ? [text] : cut(text, true),
          },
          searchDelay: 50,
        },

        // 使用图标
        icon: {
          assets: "fontawesome",
        },

        catalog: false, // 禁止默认生成目录页

        components: {
          // 想使用的主题内置组件
          components: [
            "BiliBili",
            "Badge",
            // ...
          ],
        },
      },

      footer: "默认页脚",

      hotReload: true,
      darkmode: "toggle",
      logo: "path/to/icon" // 默认 .vuepress/public 为根目录
    }),

  })
  ```
- **.vuepress/sidebar.js:**
  ```js:no-line-numbers
  import { sidebar } from "vuepress-theme-hope";

  export const sidebarConfig = sidebar({
    "/": [
      {
        text: "测试",
        link: false,
        prefix: "test/",
        children: "structure",
      },
      // ...
      "/",
    ]
  });
  ```

- **.gitignore:**
  ```txt:no-line-numbers
  node_modules
  # VuePress 默认临时文件目录
  **/.vuepress/.temp
  # VuePress 默认缓存目录
  **/.vuepress/.cache
  # VuePress 默认构建生成的静态文件目录
  **/.vuepress/dist
  ```

### Tailwind CSS

在根目录下创建: tailwind.config.js 和 postcss.config.js .
> 也可使用以下命令自动创建 tailwindcss 配置文件:\
> `npx tailwindcss init -p`
- **tailwind.config.js:**
  ```js:no-line-numbers
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      './docs/.vuepress/**/*.{vue,js,ts,jsx,tsx,md}', // 扫描  docs 目录下 VuePress 相关文件
      './docs/*.md', // 扫描 docs 目录下所有 Markdown 文件
      './docs/**/*.md', // 扫描 docs 目录下所有 Markdown 文件
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```
- **postcss.config.js:**
  ```js:no-line-numbers
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  ```

然后在 .vuepress/styles/index.scss 中添加:
```scss
// @tailwind base; // ** 注释避免覆盖 vuepress 的默认样式 **
@tailwind components;
@tailwind utilities;
```

### 自定义组件 (以EngWord<Badge text="原创" type="tip"  class="pb-1 m-[1px] ml-[2px]" />为例)

可在.vuepress下创建components目录, 然后在目录下创建EngWord.vue和EnglishWordList.json.\
EngWord.vue实现如下:
```vue:no-line-numbers title=".vuepress/components/EngWord.vue"
<template>
  <span class="absolute" @click="setVisibility">
    <span class="cursor-pointer text-blue-400" ref="parentRef">
      {{ content }}<slot></slot> <!-- 两种方式接收内容 -->
    </span>
    <div
      v-if="isVisible"
      ref="popupRef"
      class="absolute top-full p-[0.5rem] pl-[0.8rem] rounded-md shadow-md z-10 whitespace-nowrap text-sm"
      :style="style"
    >
      <strong>{{ word }}</strong> <br />
      <span v-for="([wordClass, definitions], index) in Object.entries(EnglisWordList[word])" :key="index">
        <strong>{{ wordClass }}{{ wordClass !== '' ? '. ' : '' }}</strong>
        <span>
          <span
            v-for="(definition, idx) in definitions"
            :key="idx"
            :class="{ 'text-rose-500': idx === highlightIndex && wordClass === highlightWordClass }"
          >
            {{ definition }};&nbsp;
          </span>
        </span>
        <br />
      </span>
    </div>
  </span>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EnglisWordList from "./EnglishWordList.json"

export default {
  props: {
    word: {
      type: String,
      required: true,
    },
    highlight: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    }
  },
  setup(props) {
    const isVisible = ref(false);
    const style = ref({});
    const popupRef = ref(null);
    const parentRef = ref(null);

    const highlightWordClass = computed(() => props.highlight.split(' ')[0]);
    const highlightIndex = computed(() => parseInt(props.highlight.split(' ')[1]));

    const updatePosition = () => {
      if (popupRef.value && parentRef.value) {
        const rect = popupRef.value.getBoundingClientRect();
        const parentRect = parentRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        const elementWidth = rect.width;
        const elementSupposedRight = parentRect.left + elementWidth;

        let newRight = Math.min(viewportWidth - elementSupposedRight, 0);
        if (newRight === 0) style.value = { left: 0 };
        else style.value = { right: 0 };
      }
    };

    const setVisibility = () => {
      isVisible.value = true;
      updatePosition();
    };

    const handleClickOutside = (event) => {
      if (popupRef.value && !popupRef.value.contains(event.target)) {
        isVisible.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
    });

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
    });

    return {
      isVisible,
      style,
      popupRef,
      parentRef,
      highlightWordClass,
      highlightIndex,
      setVisibility,
      EnglisWordList,
    };
  },
};
</script>
```

然后创建 .vuepress/client.js 文件, 用来注册组件, 模板如下:
```js
import { defineClientConfig } from 'vuepress/client'
import EngWord from './components/EngWord.vue'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("EngWord", EngWord)
  },
  setup() {},
  rootComponents: [],
})
```

<div>效果: &nbsp;
<EngWord word="magnificent" highlight="adj 1" content="Magnificent" />
</div>

<div class="h-[3rem]" />
