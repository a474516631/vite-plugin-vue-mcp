import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { RpcFunctions, VueMcpContext, VueMcpOptions } from './types'
import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import c from 'ansis'
import htmlTags from 'html-tags'
// 导入fetch API，确保在Node.js环境中可用
import nodeFetch from 'node-fetch'
import { join } from 'pathe'
import { normalizePath, searchForWorkspaceRoot } from 'vite'
import { createRPCServer } from 'vite-dev-rpc'
import { setupRoutes } from './connect'
import { createVueMcpContext } from './context'
import { getSourceWithSourceCodeLocation } from './getSourceWithSourceCodeLocation'

import { createServerRpc } from './rpc'

function getVueMcpPath(): string {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  console.log('pluginPath', pluginPath)
  return pluginPath
}
const vueMcpResourceSymbol = '?__vue-mcp-resource'
const vueClickToComponentClientId = 'virtual:vue-click-to-component/client'
const resolvedVueClickToComponentClientId = `\0${vueClickToComponentClientId}`

// 使用适当的fetch实现（浏览器原生fetch或node-fetch）
const fetchImpl = typeof fetch !== 'undefined' ? fetch : nodeFetch

export default function AiReiewVitePlugin(options: VueMcpOptions = {}): Plugin {
  const {
    mcpPath = '/__mcp',
    updateCursorMcpJson = true,
    printUrl = true,
    enableClickToComponent = true,
    editor = 'cursor',
    mcpServer = (vite: ViteDevServer, ctx: VueMcpContext) => import('./server').then(m => m.createMcpServerDefault(options, vite, ctx)),
  } = options

  const cursorMcpOptions = typeof updateCursorMcpJson == 'boolean'
    ? { enabled: updateCursorMcpJson }
    : updateCursorMcpJson

  let config: ResolvedConfig
  const vueMcpPath = getVueMcpPath()
  const vueMcpOptionsImportee = 'virtual:vue-mcp-options'
  const resolvedVueMcpOptions = `\0${vueMcpOptionsImportee}`

  const ctx = createVueMcpContext()

  return {
    name: 'vite-plugin-mcp',
    enforce: 'pre',
    apply: 'serve',
    async configureServer(vite) {
      const rpc = createServerRpc(ctx)

      const rpcServer = createRPCServer<RpcFunctions, any>(
        'aireview',
        vite.ws,
        rpc,
        {
          timeout: -1,
        },
      )
      ctx.rpcServer = rpcServer
      ctx.rpc = rpc

      let mcp = await mcpServer(vite, ctx)
      mcp = await options.mcpServerSetup?.(mcp, vite) || mcp
      await setupRoutes(mcpPath, mcp, vite)

      // 添加UI评审元素API路由
      vite.middlewares.use(`${mcpPath}/api/ui-review-elements`, async (req, res) => {
        // 处理GET请求 - 获取当前的UI走查数据
        if (req.method === 'GET') {
          try {
            if (!options.uiReviewSave?.enabled) {
              res.statusCode = 200
              res.end(JSON.stringify([]))
              return
            }
            // 发送请求获取当前数据
            let fileResult: any = {
              elements: [],
              timestamp: 0,
            }
            const elementViewPath = join(options.uiReviewSave?.directory || '.ui-review', 'ui-review.json')
            // 这里根据 vite 插件的配置，直接读取文件返回
            if (existsSync(elementViewPath)) {
              const uiReviewElements = await fs.readFile(elementViewPath, 'utf-8')
              fileResult = JSON.parse(uiReviewElements)
            }
            // 这里需要处理截图，转换为 base64 字符串
            for (const element of fileResult.elements) {
              if (element.screenshot) {
                const screenshotPath = join(options.uiReviewSave?.directory || '.ui-review', element.screenshot)
                const screenshot = await fs.readFile(screenshotPath, 'base64')
                element.screenshot = `data:image/png;base64,${screenshot}`
              }
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(fileResult))
          }
          catch (error) {
            console.error('获取UI走查数据失败:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            }))
          }
          return
        }

        // 处理POST请求 - 保存UI走查数据
        if (req.method === 'POST') {
          try {
            // 读取请求体数据
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(Buffer.from(chunk))
            }
            const data = Buffer.concat(chunks).toString('utf-8')
            const elements = JSON.parse(data)

            // 调用RPC函数处理UI评审元素
            if (typeof ctx.rpc.sendUIReviewElements === 'function') {
              ctx.rpc.sendUIReviewElements(elements)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          }
          catch (error) {
            console.error('处理UI评审元素请求失败:', error)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            }))
          }
          return
        }

        // 其他HTTP方法不允许
        res.statusCode = 405
        res.end('Method Not Allowed')
      })

      // 添加AI编辑API路由
      vite.middlewares.use(`${mcpPath}/api/ai-edit`, async (req, res) => {
        // 处理POST请求 - 接收AI编辑请求
        if (req.method === 'POST') {
          try {
            // 读取请求体数据
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(Buffer.from(chunk))
            }
            const data = Buffer.concat(chunks).toString('utf-8')
            const requestData = JSON.parse(data)

            // 验证请求数据
            // if (!requestData.prompt) {
            //   res.statusCode = 400
            //   res.setHeader('Content-Type', 'application/json')
            //   res.end(JSON.stringify({
            //     success: false,
            //     error: '缺少必要参数: prompt',
            //   }))
            //   return
            // }

            // 调用RPC函数处理AI编辑请求
            // const result = await ctx.rpc.handleAIEdit({
            //   filePath: requestData.filePath || '',
            //   prompt: requestData.prompt,
            // })

            // 同时向VSCode插件发送HTTP请求
            try {
              // 默认VSCode插件服务器地址
              const vscodeServerUrl = 'http://localhost:5011/ai-edit'
              const aiReviewJsonDirectory = options.uiReviewSave?.directory || '.ui-review'
              const fullPath = path.resolve(vite.config.root, aiReviewJsonDirectory, 'ui-review.json')

              // 发送HTTP请求到VSCode插件
              const response = await fetchImpl(vscodeServerUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  aiReviewJsonPath: fullPath,
                  prompt: requestData.prompt || '',
                }),
              })

              const responseData = await response.json()
              console.log('VSCode插件响应:', responseData)
            }
            catch (error) {
              console.error('向VSCode插件发送请求失败:', error)
              // 失败不影响正常流程，因为可能VSCode插件未启动
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          }
          catch (error) {
            console.error('处理AI编辑请求失败:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            }))
          }
          return
        }

        // 其他HTTP方法不允许
        res.statusCode = 405
        res.end('Method Not Allowed')
      })

      const port = vite.config.server.port || 5173
      const root = searchForWorkspaceRoot(vite.config.root)

      const sseUrl = `http://${options.host || 'localhost'}:${port}${mcpPath}/sse`

      if (cursorMcpOptions.enabled) {
        if (existsSync(join(root, '.cursor'))) {
          const mcp = existsSync(join(root, '.cursor/mcp.json'))
            ? JSON.parse(await fs.readFile(join(root, '.cursor/mcp.json'), 'utf-8') || '{}')
            : {}
          mcp.mcpServers ||= {}
          mcp.mcpServers[cursorMcpOptions.serverName || 'vue-mcp'] = { url: sseUrl }
          await fs.writeFile(join(root, '.cursor/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
        }
      }

      if (printUrl) {
        setTimeout(() => {
          console.log(`${c.yellow.bold`  ➜  MCP:     `}Server is running at ${sseUrl}`)
        }, 300)
      }

      // 设置全局编辑器配置
      if (enableClickToComponent) {
        console.log(`${c.green.bold`  ➜  Click:   `}Component click-to-source enabled (editor: ${editor})`)
      }
    },
    async resolveId(importee: string) {
      if (importee === vueMcpOptionsImportee) {
        return resolvedVueMcpOptions
      }
      else if (importee.startsWith('virtual:vue-mcp-path:')) {
        const resolved = importee.replace('virtual:vue-mcp-path:', `${vueMcpPath}/`)
        return `${resolved}${vueMcpResourceSymbol}`
      }
      else if (importee === vueClickToComponentClientId) {
        return resolvedVueClickToComponentClientId
      }
      else if (importee === `${vueClickToComponentClientId}.css`) {
        return `${resolvedVueClickToComponentClientId}.css`
      }
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async load(id) {
      if (id === resolvedVueClickToComponentClientId) {
        // 使用新的客户端包
        try {
          const clientPath = path.resolve(fileURLToPath(import.meta.url), '../../../client/dist/ai-review-client.js')

          if (existsSync(clientPath)) {
            return await fs.readFile(clientPath, 'utf-8')
          }
          // 如果客户端文件不存在，返回错误
          console.error('Client file not found:', clientPath)
          return null
        }
        catch (error) {
          console.error('Failed to load client:', error)
          return null
        }
      }
      // css
      if (id === `${resolvedVueClickToComponentClientId}.css`) {
        const clientPath = path.resolve(fileURLToPath(import.meta.url), '../../../client/dist/ai-review-client.css')
        if (existsSync(clientPath)) {
          return await fs.readFile(clientPath, 'utf-8')
        }
      }
      return null
    },
    transform(code, id, _options) {
      if (_options?.ssr)
        return

      const appendTo = options.appendTo
      const [filename] = id.split('?', 2)

      if (appendTo
        && (
          (typeof appendTo === 'string' && filename.endsWith(appendTo))
          || (appendTo instanceof RegExp && appendTo.test(filename)))) {
        if (enableClickToComponent) {
          code = `import 'virtual:vue-mcp-path:overlay.js';\nimport '${vueClickToComponentClientId}';\nimport '${vueClickToComponentClientId}.css';\n${code}`
        }
        else {
          code = `import 'virtual:vue-mcp-path:overlay.js';\n${code}`
        }
      }

      // 处理 Vue 文件，添加源代码位置信息
      if (enableClickToComponent && filename.endsWith('.vue')) {
        try {
          return getSourceWithSourceCodeLocation({
            source: code,
            filePath: filename,
            htmlTags,
          })
        }
        catch (error) {
          console.error('[vue-click-to-component] error', {
            file: filename,
            error: error && (error as Error).message,
          })
        }
      }

      return code
    },
    // transformIndexHtml(html) {
    //   if (options.appendTo)
    //     return

    //   const tags = [
    //     {
    //       tag: 'script',
    //       injectTo: 'head-prepend' as const,
    //       attrs: {
    //         type: 'module',
    //         src: `${config.base || '/'}@id/virtual:vue-mcp-path:overlay.js`,
    //       },
    //     },
    //   ]

    //   // 如果启用了点击跳转组件功能，添加客户端脚本
    //   if (enableClickToComponent) {
    //     // 添加客户端 JS
    //     tags.push({
    //       tag: 'script',
    //       injectTo: 'head-prepend' as const,
    //       attrs: {
    //         type: 'module',
    //         src: `${config.base || '/'}@id/${vueClickToComponentClientId}`,
    //       },
    //     })

    //     // 添加客户端 CSS
    //     tags.push({
    //       tag: 'link',
    //       injectTo: 'head-prepend' as const,
    //       attrs: {
    //         rel: 'stylesheet',
    //         href: `${config.base || '/'}@id/${vueClickToComponentClientId}.css`,
    //       } as any,
    //     })

    //     // 添加编辑器配置脚本
    //     tags.push({
    //       tag: 'script',
    //       injectTo: 'head-prepend' as const,
    //       attrs: {
    //         type: 'text/javascript',
    //         src: `data:text/javascript;charset=utf-8,${encodeURIComponent(`window.__EDITOR__ = "${editor}";`)}`,
    //       },
    //     })
    //   }

    //   return {
    //     html,
    //     tags,
    //   }
    // },
  }
}
