import { defineConfig } from 'vitepress'
import { menus } from '../src/theme/canvasRender/menus'

export default defineConfig({
  title: "智能 UI 走查工具",
  description: "智能 UI 走查工具 文档",
  srcDir: 'src',
  base: '/documents/docs',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '生态',
        items: [
          {
            component: 'EcosystemNav'
          }
        ],
      },
      {
        text: '快速开始', link: '/guide/quick-start'
      }
    ],
    logo: '/logo.svg',
    sidebar: menus,
    socialLinks: [
      { icon: 'github', link: 'https://git.zuoyebang.cc/common-sdk/aireview' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: '本项目由作业帮前端团队开发',
      copyright: 'Copyright © 2025-present 作业帮'
    }
  }
})
