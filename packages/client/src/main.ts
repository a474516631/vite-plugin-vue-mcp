import { createApp } from 'vue'
import FloatingPanel from './components/FloatingPanel.vue'
import { initClickToComponent } from './utils/clickToComponent'
import { setupRpcClient } from './utils/rpcClient'

// 初始化点击跳转组件功能
initClickToComponent()

// 初始化RPC客户端
setupRpcClient()

// 创建并挂载悬浮窗组件
function createFloatingPanel() {
  const app = createApp(FloatingPanel)

  // 创建挂载点
  const mountEl = document.createElement('div')
  mountEl.id = 'vue-mcp-floating-panel-container'
  document.body.appendChild(mountEl)

  // 挂载应用
  app.mount(mountEl)

  return app
}

// 在页面加载完成后初始化悬浮窗
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingPanel)
}
else {
  createFloatingPanel()
}

// 导出公共 API
export { initClickToComponent }
