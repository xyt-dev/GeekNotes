import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
  "/": [
    {
      text: "项目安装",
      link: "README.md",
      icon: "lightbulb",
    },
    {
      text: "测试",
      link: "test/",
      prefix: "test/",
      children: ["test.md"],
    },
  ]
});