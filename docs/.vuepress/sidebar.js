import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
  "/": [
    "/",
    {
      title: "Test",
      prefix: "Test/",
      link: false,
      collapsible: true,
      children: "structure",
    },
  ],
});