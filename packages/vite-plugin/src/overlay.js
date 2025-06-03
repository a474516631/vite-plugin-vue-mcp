import { devtools, devtoolsRouterInfo, devtoolsState, getInspector, stringify, toggleHighPerfMode } from '@vue/devtools-kit'

import { createRPCClient } from 'vite-dev-rpc'
import { createHotContext } from 'vite-hot-client'

const base = import.meta.env.BASE_URL || '/'
const hot = createHotContext('', base)
const PINIA_INSPECTOR_ID = 'pinia'
const COMPONENTS_INSPECTOR_ID = 'components'

devtools.init()

let highlightComponentTimeout = null

function flattenChildren(node) {
  const result = []

  function traverse(node) {
    if (!node)
      return
    result.push(node)

    if (Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child))
    }
  }

  traverse(node)
  return result
}

// 创建RPC客户端
const rpcClient = createRPCClient(
  'aireview',
  hot,
  {
    // get component tree
    async getInspectorTree(query) {
      const inspectorTree = await devtools.api.getInspectorTree({
        inspectorId: COMPONENTS_INSPECTOR_ID,
        filter: '',
      })
      rpcClient.onInspectorTreeUpdated(query.event, inspectorTree[0])
    },
    // get component state
    async getInspectorState(query) {
      const inspectorTree = await devtools.api.getInspectorTree({
        inspectorId: COMPONENTS_INSPECTOR_ID,
        filter: '',
      })
      const flattenedChildren = flattenChildren(inspectorTree[0])
      const targetNode = flattenedChildren.find(child => child.name === query.componentName)
      const inspectorState = await devtools.api.getInspectorState({
        inspectorId: COMPONENTS_INSPECTOR_ID,
        nodeId: targetNode.id,
      })
      rpcClient.onInspectorStateUpdated(query.event, stringify(inspectorState))
    },

    // edit component state
    async editComponentState(query) {
      const inspectorTree = await devtools.api.getInspectorTree({
        inspectorId: COMPONENTS_INSPECTOR_ID,
        filter: '',
      })
      const flattenedChildren = flattenChildren(inspectorTree[0])
      const targetNode = flattenedChildren.find(child => child.name === query.componentName)
      const payload = {
        inspectorId: COMPONENTS_INSPECTOR_ID,
        nodeId: targetNode.id,
        path: query.path,
        state: {
          new: null,
          remove: false,
          type: query.valueType,
          value: query.value,
        },
        type: undefined,
      }
      await devtools.ctx.api.editInspectorState(payload)
    },

    // highlight component
    async highlightComponent(query) {
      clearTimeout(highlightComponentTimeout)
      const inspectorTree = await devtools.api.getInspectorTree({
        inspectorId: COMPONENTS_INSPECTOR_ID,
        filter: '',
      })
      const flattenedChildren = flattenChildren(inspectorTree[0])
      const targetNode = flattenedChildren.find(child => child.name === query.componentName)
      devtools.ctx.hooks.callHook('componentHighlight', { uid: targetNode.id })
      highlightComponentTimeout = setTimeout(() => {
        devtools.ctx.hooks.callHook('componentUnhighlight')
      }, 5000)
    },
    // get router info
    async getRouterInfo(query) {
      rpcClient.onRouterInfoUpdated(query.event, JSON.stringify(devtoolsRouterInfo, null, 2))
    },
    // get pinia tree
    async getPiniaTree(query) {
      const highPerfModeEnabled = devtoolsState.highPerfModeEnabled
      if (highPerfModeEnabled) {
        toggleHighPerfMode(false)
      }
      const inspectorTree = await devtools.api.getInspectorTree({
        inspectorId: PINIA_INSPECTOR_ID,
        filter: '',
      })
      if (highPerfModeEnabled) {
        toggleHighPerfMode(true)
      }
      rpcClient.onPiniaTreeUpdated(query.event, inspectorTree)
    },
    // get pinia state
    async getPiniaState(query) {
      const highPerfModeEnabled = devtoolsState.highPerfModeEnabled
      if (highPerfModeEnabled) {
        toggleHighPerfMode(false)
      }
      const payload = {
        inspectorId: PINIA_INSPECTOR_ID,
        nodeId: query.storeName,
      }
      const inspector = getInspector(payload.inspectorId)

      if (inspector)
        inspector.selectedNodeId = payload.nodeId

      const res = await devtools.ctx.api.getInspectorState(payload)
      if (highPerfModeEnabled) {
        toggleHighPerfMode(true)
      }
      rpcClient.onPiniaInfoUpdated(query.event, stringify(res))
    },
  },
  {
    timeout: -1,
  },
)

// // 创建并添加"提交修改"按钮
// function createSubmitButton() {
//   const existingButton = document.getElementById('vue-mcp-submit-button')
//   if (existingButton) {
//     return existingButton
//   }

//   const button = document.createElement('button')
//   button.id = 'vue-mcp-submit-button'
//   button.textContent = '提交修改'
//   button.style.position = 'fixed'
//   button.style.bottom = '20px'
//   button.style.right = '20px'
//   button.style.zIndex = '9999'
//   button.style.padding = '10px 15px'
//   button.style.backgroundColor = '#4CAF50'
//   button.style.color = 'white'
//   button.style.border = 'none'
//   button.style.borderRadius = '4px'
//   button.style.cursor = 'pointer'
//   button.style.fontWeight = 'bold'
//   button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'

//   // 添加悬停效果
//   button.addEventListener('mouseover', () => {
//     button.style.backgroundColor = '#45a049'
//   })
//   button.addEventListener('mouseout', () => {
//     button.style.backgroundColor = '#4CAF50'
//   })

//   // 添加点击事件
//   button.addEventListener('click', async () => {
//     try {
//       // 获取当前文件路径
//       const currentFile = await getCurrentFilePath()
//       if (!currentFile) {
//         console.log('无法确定当前文件路径')
//         return
//       }

//       // 弹出对话框，让用户输入修改提示
//       // 创建一个自定义对话框，而不是使用window.prompt
//       const promptResult = await createCustomPrompt('请输入修改提示:', '请修复此文件中的问题')
//       if (!promptResult)
//         return // 用户取消了输入

//       // 发送AI编辑请求
//       const result = await rpcClient.handleAIEdit({
//         filePath: currentFile,
//         prompt: promptResult,
//       })

//       if (result && result.success) {
//         console.log('修改请求已发送到VSCode扩展，正在处理中...')
//         showToast('修改请求已发送，正在处理中...')
//       }
//       else {
//         console.log(`修改请求失败: ${result?.error || '未知错误'}`)
//         showToast(`修改请求失败: ${result?.error || '未知错误'}`)
//       }
//     }
//     catch (error) {
//       console.error('提交修改时出错:', error)
//       showToast(`提交修改时出错: ${error.message || '未知错误'}`)
//     }
//   })

//   document.body.appendChild(button)
//   return button
// }

// // 页面加载完成后创建按钮
// if (document.readyState === 'complete') {
//   createSubmitButton()
// }
// else {
//   window.addEventListener('load', createSubmitButton)
// }

// 导出rpc客户端，以便其他模块可以使用
export { rpcClient }
