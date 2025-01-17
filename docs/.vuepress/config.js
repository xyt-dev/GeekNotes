import { viteBundler } from "@vuepress/bundler-vite"
import { hopeTheme } from "vuepress-theme-hope"
import { defineUserConfig } from "vuepress/cli"
import { cut } from "nodejs-jieba"
import { sidebarConfig } from "./sidebar"

export default defineUserConfig({
  bundler: viteBundler(),
  title: "GeekNotes",
  base: "/", // 部署站点的根目录路径
  head: [['link', { rel: 'icon', href: '/icons/archlinux.svg' }]], // <head> 标签内插入内容

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

      catalog: false, // 禁止默认生成目录页

      icon: {
        assets: "fontawesome",
      },

      components: {
        // 想使用的主题内置组件
        components: [
          "BiliBili",
          "Badge",
        ],
      },
    },

    footer: "默认页脚",

    darkmode: "toggle",
    logo: "icons/archlinux.svg" // 默认 .vuepress/public 为根目录
  }),

})