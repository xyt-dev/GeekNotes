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
          "BiliBili"
        ],
      },
    },

    footer: "默认页脚",

    hotreload: true,
    darkmode: "toggle",
    logo: "icons/archlinux.svg" // 默认 .vuepress/public 为根目录
  }),

})