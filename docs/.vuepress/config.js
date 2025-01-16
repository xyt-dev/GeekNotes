import { viteBundler } from "@vuepress/bundler-vite"
import { hopeTheme } from "vuepress-theme-hope"
import { defineUserConfig } from "vuepress/cli"
import { cut } from "nodejs-jieba"

export default defineUserConfig({
  bundler: viteBundler(),
  theme: hopeTheme({

    navbar: [

    ],

    plugins: {
      slimsearch: {
        indexContent: true,
        indexOptions: {
          // 使用 nodejs-jieba 进行分词
          tokenize: (text, fieldName) =>
            fieldName === 'id' ? [text] : cut(text, true),
        },
        searchDelay: 50,
      },
      components: {
        // 你想使用的组件
        components: [
          "ArtPlayer",
          "Badge",
          "BiliBili",
          "CodePen",
          "PDF",
          "Share",
          "SiteInfo",
          "StackBlitz",
          "VPBanner",
          "VPCard",
          "VidStack",
          "XiGua",
        ],
      },
    },

    footer: "默认页脚",

    sidebar: {

    },

    hotReload: true,
    // breadcrumb: false,


  }),
  title: 'My VuePress Site',
})