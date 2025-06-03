import http from 'node:http'
import cors from 'cors'
import express from 'express'
import { window } from 'vscode'
import { processAIEditRequest } from '../ai-editor'
import { callCursorAgent } from '../utils/call-cursor-agent'
import { logger } from '../utils/log'

// 默认端口
const DEFAULT_PORT = 5011

// 存储服务器实例
let server: http.Server | null = null

/**
 * 启动HTTP服务器
 * @param port 服务器端口
 * @returns 服务器实例
 */
export async function startServer(port: number = DEFAULT_PORT): Promise<http.Server> {
  if (server) {
    logger.info(`Server is already running on port ${port}`)
    return server
  }

  try {
    const app = express()

    // 配置中间件
    app.use(express.json())
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    }))

    // 健康检查路由
    app.get('/ping', (_req, res) => {
      res.send('pong')
    })

    // AI编辑路由
    app.post('/ai-edit', async (req, res) => {
      try {
        // 获取请求数据
        const { aiReviewJsonPath, prompt, filePath } = req.body

        if (!aiReviewJsonPath && !prompt) {
          res.status(400).json({
            success: false,
            error: '缺少必要参数: prompt 或 aiReviewJsonPath',
          })
          return
        }

        // 记录请求信息
        logger.info(`收到AI编辑请求: ${JSON.stringify({ aiReviewJsonPath, prompt, filePath })}`)

        // 显示通知
        window.showInformationMessage(`收到AI编辑请求: ${prompt || aiReviewJsonPath}`)

        // 处理请求
        if (aiReviewJsonPath) {
          console.log('aiReviewJsonPath', aiReviewJsonPath)
          // 使用AI评审JSON文件
          callCursorAgent({
            prompt: `请根据 ${aiReviewJsonPath} 文件中的内容，进行修复 UI 问题，每一条修复后请修改 ${aiReviewJsonPath} 文件中数据的 isFixed 字段为 true`,
            aiReviewJsonPath,
          })

          res.json({
            success: true,
            message: '已接收AI编辑请求，正在使用AI评审文件处理',
          })
        }
        else if (filePath) {
          // 使用指定文件路径和提示词
          const result = await processAIEditRequest({
            filePath,
            prompt,
          })

          res.json(result)
        }
        else {
          // 仅使用提示词
          callCursorAgent({
            prompt,
          })

          res.json({
            success: true,
            message: '已接收AI编辑请求，正在处理',
          })
        }
      }
      catch (error) {
        logger.error('处理AI编辑请求失败:', error)
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })

    // 创建HTTP服务器
    server = http.createServer(app)

    // 启动服务器
    return new Promise((resolve) => {
      server!.listen(port, () => {
        logger.info(`AIReview server is running on port ${port}`)
        window.showInformationMessage(`AIReview server started on port ${port}`)
        resolve(server!)
      })
    })
  }
  catch (error) {
    logger.error('Failed to start server:', error)
    window.showErrorMessage(`Failed to start AIReview server: ${error}`)
    throw error
  }
}

/**
 * 停止HTTP服务器
 */
export async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      logger.info('Server is not running')
      resolve()
      return
    }

    // 关闭HTTP服务器
    server.close((err) => {
      if (err) {
        logger.error('Error stopping server:', err)
        reject(err)
      }
      else {
        logger.info('Server stopped')
        window.showInformationMessage('AIReview server stopped')
        server = null
        resolve()
      }
    })
  })
}

/**
 * 处理AI编辑请求
 * @param fileInfo 文件信息
 * @returns 处理结果
 */
export async function handleAIEditRequest(fileInfo: { filePath: string, prompt: string }) {
  return await processAIEditRequest(fileInfo)
}
