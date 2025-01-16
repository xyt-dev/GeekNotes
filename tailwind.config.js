/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/.vuepress/**/*.{vue,js,ts,jsx,tsx,md}', // 扫描 docs 下 VuePress 相关文件
    './docs/*.md', // 扫描所有 Markdown 文件
    './docs/**/*.md', // 扫描所有 Markdown 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

