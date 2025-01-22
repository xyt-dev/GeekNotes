import { sidebar } from "vuepress-theme-hope";

export const sidebarConfig = sidebar({
  "/": [
    {
      text: "Rust",
      prefix: "Rust/",
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