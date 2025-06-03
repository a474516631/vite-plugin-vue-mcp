import { defineConfigs } from 'reactive-vscode'

export const { message, port } = defineConfigs('@aireview/vscode-server', {
  message: String,
  port: Number,
})
