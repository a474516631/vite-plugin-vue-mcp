import type { ViteDevServer } from 'vite'
import type { UIReviewElement, VueMcpContext, VueMcpOptions } from './types'
import { existsSync, mkdirSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { version } from '../package.json'

export function createMcpServerDefault(
  options: VueMcpOptions,
  vite: ViteDevServer,
  ctx: VueMcpContext,
): McpServer {
  const server = new McpServer(
    {
      name: 'vite',
      version,
      ...options.mcpServerInfo,
    },
  )

  // 存储UI评审元素
  let uiReviewElements: UIReviewElement[] = []

  // 保存配置
  const saveConfig = options.uiReviewSave || { enabled: false }
  const saveDir = saveConfig.directory || '.vue-mcp/ui-review'
  const saveInterval = saveConfig.autoSaveInterval || 0
  let _saveTimer: NodeJS.Timeout | null = null

  // 确保保存目录存在
  const ensureSaveDir = () => {
    if (!saveConfig.enabled)
      return

    const fullPath = path.resolve(vite.config.root, saveDir)
    const screenshotsDir = path.join(fullPath, 'screenshots')

    try {
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true })
      }
      if (!existsSync(screenshotsDir)) {
        mkdirSync(screenshotsDir, { recursive: true })
      }
    }
    catch (err) {
      console.error('创建UI评审保存目录失败:', err)
    }
  }

  // 保存UI评审元素到文件
  const saveUIReviewElements = async () => {
    if (!saveConfig.enabled || uiReviewElements.length === 0)
      return

    try {
      ensureSaveDir()
      const fullPath = path.resolve(vite.config.root, saveDir)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

      // 保存元素数据的深拷贝，避免修改原始数据
      const elementsToSave = JSON.parse(JSON.stringify(uiReviewElements))

      // 处理截图数据，将base64数据保存为文件
      for (let i = 0; i < elementsToSave.length; i++) {
        const element = elementsToSave[i]
        if (element.screenshot) {
          // 从base64提取图片数据
          const base64Data = element.screenshot.replace(/^data:image\/png;base64,/, '')
          // 生成文件名
          const filename = `screenshot-${i}-${timestamp}.png`
          const filePath = path.join(fullPath, 'screenshots', filename)

          // 保存图片文件
          await fs.writeFile(filePath, base64Data, 'base64')

          // 更新元素中的截图路径为相对路径
          element.screenshot = `screenshots/${filename}`
        }
      }

      // 保存元素数据为JSON文件
      const jsonPath = path.join(fullPath, 'ui-review.json')
      await fs.writeFile(jsonPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        elements: elementsToSave,
      }, null, 2))

      // 记录保存成功信息
      console.error(`UI评审数据已保存到: ${jsonPath}`)
    }
    catch (err) {
      console.error('保存UI评审数据失败:', err)
    }
  }

  // 加载已保存的UI走查信息
  const loadUIReviewElements = async () => {
    if (!saveConfig.enabled)
      return

    try {
      ensureSaveDir()
      const fullPath = path.resolve(vite.config.root, saveDir)
      const jsonPath = path.join(fullPath, 'ui-review.json')

      // 检查文件是否存在
      if (!existsSync(jsonPath))
        return

      // 读取JSON文件
      const data = await fs.readFile(jsonPath, 'utf-8')
      const savedData = JSON.parse(data)

      if (!savedData.elements || !Array.isArray(savedData.elements)) {
        console.error('无效的UI评审数据格式')
        return
      }

      // 处理截图数据，将相对路径转换为base64数据
      for (const element of savedData.elements) {
        if (element.screenshot && typeof element.screenshot === 'string' && element.screenshot.startsWith('screenshots/')) {
          try {
            const screenshotPath = path.join(fullPath, element.screenshot)
            if (existsSync(screenshotPath)) {
              const screenshotData = await fs.readFile(screenshotPath, 'base64')
              element.screenshot = `data:image/png;base64,${screenshotData}`
            }
          }
          catch (err) {
            console.error(`加载截图失败: ${element.screenshot}`, err)
            element.screenshot = undefined
          }
        }
      }

      // 更新UI评审元素
      uiReviewElements = savedData.elements
      console.error(`已加载UI评审数据: ${jsonPath}`)

      // 触发回显 - 通过钩子系统发送数据
      try {
        const dataToSend = JSON.stringify(uiReviewElements)
        ctx.hooks.callHook('ui-review-elements-loaded', dataToSend)
      }
      catch (error) {
        console.error('触发UI走查数据回显失败:', error)
      }
    }
    catch (err) {
      console.error('加载UI评审数据失败:', err)
    }
  }

  // 设置自动保存定时器
  if (saveConfig.enabled && saveInterval > 0) {
    _saveTimer = setInterval(saveUIReviewElements, saveInterval)
  }
  // 初始化时加载已保存的UI走查数据
  loadUIReviewElements()

  // 监听UI评审元素更新
  ctx.hooks.hook('ui-review-elements-updated', (data) => {
    try {
      uiReviewElements = JSON.parse(data)

      // 如果启用了保存功能且不使用定时器，则立即保存
      if (saveConfig.enabled && saveInterval === 0) {
        saveUIReviewElements().catch((err) => {
          console.error('保存UI评审数据失败:', err)
        })
      }
    }
    catch {
      // 解析错误处理，忽略
    }
  })

  server.tool(
    'get-component-tree',
    'Get the Vue component tree in markdown tree syntax format.',
    {
    },
    async () => {
      return new Promise((resolve) => {
        const eventName = nanoid()
        ctx.hooks.hookOnce(eventName, (res) => {
          resolve({
            content: [{
              type: 'text',
              text: JSON.stringify(res),
            }],
          })
        })
        ctx.rpcServer.getInspectorTree({ event: eventName })
      })
    },
  )

  server.tool(
    'get-component-state',
    'Get the Vue component state in JSON structure format.',
    {
      componentName: z.string(),
    },
    async ({ componentName }) => {
      return new Promise((resolve) => {
        const eventName = nanoid()
        ctx.hooks.hookOnce(eventName, (res) => {
          resolve({
            content: [{
              type: 'text',
              text: JSON.stringify(res),
            }],
          })
        })
        ctx.rpcServer.getInspectorState({ event: eventName, componentName })
      })
    },
  )

  server.tool(
    'edit-component-state',
    'Edit the Vue component state.',
    {
      componentName: z.string(),
      path: z.array(z.string()),
      value: z.string(),
      valueType: z.enum(['string', 'number', 'boolean', 'object', 'array']),
    },
    async ({ componentName, path, value, valueType }) => {
      return new Promise((resolve) => {
        ctx.rpcServer.editComponentState({ componentName, path, value, valueType })
        resolve({
          content: [{
            type: 'text',
            text: 'ok',
          }],
        })
      })
    },
  )

  server.tool(
    'highlight-component',
    'Highlight the Vue component.',
    {
      componentName: z.string(),
    },
    async ({ componentName }) => {
      return new Promise((resolve) => {
        ctx.rpcServer.highlightComponent({ componentName })
        resolve({
          content: [{
            type: 'text',
            text: 'ok',
          }],
        })
      })
    },
  )

  server.tool(
    'get-router-info',
    'Get the Vue router info in JSON structure format.',
    {
    },
    async () => {
      return new Promise((resolve) => {
        const eventName = nanoid()
        ctx.hooks.hookOnce(eventName, (res) => {
          resolve({
            content: [{
              type: 'text',
              text: JSON.stringify(res),
            }],
          })
        })
        ctx.rpcServer.getRouterInfo({ event: eventName })
      })
    },
  )

  server.tool(
    'get-pinia-state',
    'Get the Pinia state in JSON structure format.',
    {
      storeName: z.string(),
    },
    async ({ storeName }) => {
      return new Promise((resolve) => {
        const eventName = nanoid()
        ctx.hooks.hookOnce(eventName, (res) => {
          resolve({
            content: [{
              type: 'text',
              text: JSON.stringify(res),
            }],
          })
        })
        ctx.rpcServer.getPiniaState({ event: eventName, storeName })
      })
    },
  )

  server.tool(
    'get-pinia-tree',
    'Get the Pinia tree in JSON structure format.',
    {
    },
    async () => {
      return new Promise((resolve) => {
        const eventName = nanoid()
        ctx.hooks.hookOnce(eventName, (res) => {
          resolve({
            content: [{
              type: 'text',
              text: JSON.stringify(res),
            }],
          })
        })
        ctx.rpcServer.getPiniaTree({ event: eventName })
      })
    },
  )

  // 添加获取UI评审元素的工具
  server.tool(
    'get-ui-review-elements',
    'Get the UI review elements with comments and screenshots.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(uiReviewElements),
        }],
      }
    },
  )

  return server
}
