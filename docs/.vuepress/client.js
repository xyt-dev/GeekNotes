import { defineClientConfig } from 'vuepress/client'
import EngWord from './components/EngWord.vue'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("EngWord", EngWord)
  },
  setup() {},
  rootComponents: [],
})