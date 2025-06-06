import AiReviewVitePlugin from '@aireview/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// import DevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  server: {
    port: 3456,
  },
  plugins: [
    vue(),
    AiReviewVitePlugin({
      appendTo: 'src/main.ts',
      enableClickToComponent: true,
      uiReviewSave: {
        enabled: true,
        directory: '.ui-review',
        autoSaveInterval: 0, // 收到数据时立即保存
      },
    }),
    // DevTools(),
  ],
})
