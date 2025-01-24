import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
  "/": [
    {
      text: "RustLearning",
      prefix: "RustLearning/",
      link: false,
      collapsible: true,
      children: "structure",
    },
  ],
  "/Config/": [
    {
      text: "Config",
      prefix: "",
      link: false,
      // collapsible: true,
      children: "structure",
    },
  ]
});