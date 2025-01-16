import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
  "/": [
    {
      text: "测试",
      link: false,
      prefix: "test/",
      children: "structure",
    },
    "/",
  ]
});