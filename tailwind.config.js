/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/.vuepress/**/*.{vue,js,ts,jsx,tsx}', // 扫描 docs 下 VuePress 相关文件
    // 不要扫描 Markdown 文件，会导致 reload
    // './docs/*.md', // 扫描所有 Markdown 文件
    // './docs/**/*.md', // 扫描所有 Markdown 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

