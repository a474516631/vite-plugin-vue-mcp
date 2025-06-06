<template>
  <div 
    class="vue-mcp-floating-panel" 
    :class="{ 'minimized': isMinimized }"
    ref="panelRef"
  >
    <!-- 悬浮窗头部 -->
    <div 
      class="vue-mcp-floating-panel-header"
      @mousedown="startDrag"
    >
      <div class="vue-mcp-floating-panel-title"> UI 走查工具</div>
      <button 
        class="vue-mcp-floating-panel-toggle"
        :aria-label="isMinimized ? '展开' : '最小化'"
        @click="toggleMinimize"
      >
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>
    
    <!-- 悬浮窗内容 -->
    <div class="vue-mcp-floating-panel-content">
      <form id="vue-mcp-element-form">
        <!-- 高亮说明 -->
        <HelpTip />
        
        <!-- 已选择的元素列表 -->
        <ElementList 
          :elements="selectedElements"
          @remove="removeElement"
          @view="showElementBoxModel"
          @comment="commentElement"
          @screenshot="screenshotElement"
          @toggle-submit="toggleElementSubmitted"
          @toggle-fixed="toggleElementFixed"
        />
        
        <!-- 保存状态提示 -->
        <div v-if="saveStatus" class="vue-mcp-save-status" :class="saveStatus.type">
          <span class="vue-mcp-save-status-icon">
            {{ saveStatus.type === 'success' ? '✓' : saveStatus.type === 'info' ? 'ℹ' : '⚠' }}
          </span>
          <span class="vue-mcp-save-status-text">{{ saveStatus.message }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <ActionButtons
          @submit="submitCurrentElement"
          @refresh="refreshUIReviewElements"
          @clear="clearElements"
          :disabled-submit="allElementsSubmitted"
        />
      </form>
    </div>

    <!-- 通知提示 -->
    <NotificationTip
      :visible="showKeyboardShortcutTip"
      message="已添加元素"
      type="success"
      @close="dismissKeyboardShortcutTip"
    />

    <!-- 元素 Popover -->
    <ElementPopover
      :element="lastHighlightedElement"
      :comment-text="popoverCommentText"
      :screenshot-preview="screenshotPreviewPopover"
      :position="popoverPosition"
      v-if="lastHighlightedElement && showElementPopover"
      @update:comment-text="popoverCommentText = $event"
      @remove-screenshot="removePopoverScreenshot"
      @capture-screenshot="capturePopoverScreenshot"
      @jump-to-code="jumpToCode"
      @add-element="addElementFromPopover"
      @close="hideElementPopover"
    />

    <!-- 评论对话框 -->
    <CommentDialog 
      :visible="commentDialogVisible"
      :comment-text="commentText"
      :screenshot-preview="screenshotPreview"
      @update:comment-text="commentText = $event"
      @remove-screenshot="removeScreenshot"
      @capture-screenshot="captureScreenshot"
      @cancel="cancelComment"
      @save="saveComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { showBoxModel, openEditor } from '../utils/clickToComponent'
// 导入旧的截图函数
import { captureElementScreenshot } from '../utils/screenshot'
// 导入新的稳定标识符相关函数
import { findElementByPath, findElementByStableId, generateStableId, updateElementsWithStableId } from '../utils/stableElementId'
import { ElementInfo, SaveStatus, Position } from '../types'

// 组件导入
// import ElementItem from './ElementItem.vue'
import ElementList from './ElementList.vue'
import ElementPopover from './ElementPopover.vue'
import CommentDialog from './CommentDialog.vue'
import NotificationTip from './NotificationTip.vue'
import HelpTip from './HelpTip.vue'
import ActionButtons from './ActionButtons.vue'
// @ts-ignore
import domToImage from 'dom-to-image-more'

// 状态
const isMinimized = ref(false)
const selectedElements = ref<ElementInfo[]>([])
const unifiedElements = computed(() => {
  return selectedElements.value.filter((el) => {
    return !el.isFixed
  })
})
// 计算属性：检查是否所有未修复的元素都已提交
const allElementsSubmitted = computed(() => {
  // 如果没有元素，则返回 true（禁用提交按钮）
  if (unifiedElements.value.length === 0) {
    return true
  }
  // 检查是否所有未修复的元素都已提交
  return unifiedElements.value.every(el => el.isSubmitted === true)
})
const panelRef = ref<HTMLElement | null>(null)
const lastHighlightedElement = ref<HTMLElement | null>(null) // 记录最后一个高亮的元素
const saveStatus = ref<SaveStatus | null>(null)
const showKeyboardShortcutTip = ref(false)
const keyboardShortcutTipTimeout = ref<number | null>(null)

// 评论相关
const commentDialogVisible = ref(false)
const commentText = ref('')
const currentCommentPath = ref('')
const screenshotPreview = ref<string | null>(null)

// Popover相关
const showElementPopover = ref(false)
const popoverPosition = ref<Position>({ top: 0, left: 0 })
const popoverCommentText = ref('')
const screenshotPreviewPopover = ref<string | null>(null)

// 拖拽相关
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 获取元素名称
const getElementName = (el: HTMLElement): string => {
  return el.localName || el.tagName.toLowerCase()
}

// 方法
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

// 显示快捷键提示
const showKeyboardShortcutNotification = () => {
  showKeyboardShortcutTip.value = true
  
  // 清除之前的超时
  if (keyboardShortcutTipTimeout.value) {
    clearTimeout(keyboardShortcutTipTimeout.value)
  }
  
  // 设置3秒后自动消失
  keyboardShortcutTipTimeout.value = window.setTimeout(() => {
    showKeyboardShortcutTip.value = false
  }, 3000)
}

// 关闭快捷键提示
const dismissKeyboardShortcutTip = () => {
  showKeyboardShortcutTip.value = false
  if (keyboardShortcutTipTimeout.value) {
    clearTimeout(keyboardShortcutTipTimeout.value)
  }
}

// 拖拽相关方法
const startDrag = (e: MouseEvent) => {
  if (!panelRef.value) return
  
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - panelRef.value.getBoundingClientRect().left,
    y: e.clientY - panelRef.value.getBoundingClientRect().top
  }
  
  if (panelRef.value) {
    panelRef.value.style.transition = 'none'
  }
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !panelRef.value) return
  
  panelRef.value.style.right = 'auto'
  panelRef.value.style.bottom = 'auto'
  panelRef.value.style.left = `${e.clientX - dragOffset.value.x}px`
  panelRef.value.style.top = `${e.clientY - dragOffset.value.y}px`
}

const stopDrag = () => {
  if (isDragging.value && panelRef.value) {
    isDragging.value = false
    panelRef.value.style.transition = 'transform 0.3s ease'
  }
}

// 元素操作方法
const submitCurrentElement = () => {
  // 将所有未提交的元素标记为已提交
  unifiedElements.value.forEach(element => {
    if (!element.isSubmitted) {
      element.isSubmitted = true
    }
  })
  
  // 显示成功提示
  saveStatus.value = {
    type: 'success',
    message: '所有元素已标记为已提交',
    timestamp: Date.now()
  }
  
  // 保存更新后的元素
  sendDataToMcpService()
  
  // 发送 AI 编辑请求
  fetchSubmit()
}

const addElement = (element: ElementInfo) => {
  // 检查是否已存在
  if (!selectedElements.value.some(el => el.path === element.path)) {
    selectedElements.value.push(element)
  }
}

const removeElement = (path: string) => {
  const index = selectedElements.value.findIndex(el => el.path === path)
  if (index !== -1) {
    selectedElements.value.splice(index, 1)
  }
}

// 显示元素的盒模型
const showElementBoxModel = (path: string) => {
  // 先尝试通过源代码位置找
  let element = findElementByPath(path)

  // 查找对应的元素信息
  const elementInfo = selectedElements.value.find(el => el.path === path)
  
  // 如果有稳定ID，尝试使用稳定ID查找
  if (!element && elementInfo && elementInfo.stableId) {
    element = findElementByStableId(elementInfo.stableId)
  }
  
  if (element) {
    showBoxModel(element)
  } else {
    console.log('未找到对应元素，无法显示盒模型')
  }
}

// 添加评论
const commentElement = (path: string) => {
  const elementIndex = selectedElements.value.findIndex(el => el.path === path)
  if (elementIndex !== -1) {
    // 显示评论对话框
    commentDialogVisible.value = true
    currentCommentPath.value = path
    commentText.value = selectedElements.value[elementIndex].comment || ''
    screenshotPreview.value = selectedElements.value[elementIndex].screenshot || null
  }
}

// 发送数据到MCP服务
const sendDataToMcpService = () => {
  try {
    // 检查是否存在window.__VUE_MCP_RPC__对象
    // 显示保存中状态
    saveStatus.value = {
      type: 'success',
      message: '正在保存...',
      timestamp: Date.now()
    }
    const mcpRpc = (window as any).__VUE_MCP_RPC__
    if (mcpRpc && typeof mcpRpc.sendUIReviewElements === 'function') {
      // 发送已选择的元素数据
      mcpRpc.sendUIReviewElements(selectedElements.value)
      saveStatus.value = null
    } else {
      console.warn('MCP RPC 服务不可用，无法发送数据')
      
      // 显示错误状态
      saveStatus.value = {
        type: 'error',
        message: 'MCP服务不可用，无法保存',
        timestamp: Date.now()
      }
    }
  } catch (error) {
    console.error('发送数据到MCP服务失败:', error)
    
    // 显示错误状态
    saveStatus.value = {
      type: 'error',
      message: `保存失败: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    }
  }
}

// 更新监听已选择元素的变化，自动发送数据，同时更新稳定ID
watch(()=>{
  return JSON.stringify(selectedElements.value)
}, () => {
  // 为没有稳定ID的元素添加稳定ID
  updateElementsWithStableId(selectedElements.value)
  
  // 发送数据到MCP服务
  sendDataToMcpService()
}, { deep: true })

// 在保存评论时也发送数据
const saveComment = () => {
  const elementIndex = selectedElements.value.findIndex(el => el.path === currentCommentPath.value)
  if (elementIndex !== -1) {
    // 更新评论
    selectedElements.value[elementIndex] = {
      ...selectedElements.value[elementIndex],
      comment: commentText.value.trim(),
      screenshot: screenshotPreview.value || undefined
    }
    
    // 发送更新后的数据
    sendDataToMcpService()
  }
  // 关闭对话框
  cancelComment()
}

const cancelComment = () => {
  commentDialogVisible.value = false
  commentText.value = ''
  currentCommentPath.value = ''
  screenshotPreview.value = null
}

// 移除截图
const removeScreenshot = () => {
  screenshotPreview.value = null
}

// 截图功能
const captureScreenshot = () => {
  try {
    // 临时隐藏评论对话框和悬浮面板
    commentDialogVisible.value = false
    if (panelRef.value) {
      panelRef.value.style.display = 'none'
    }

    // 延迟一点点，确保UI更新
    setTimeout(() => {
      // 先尝试通过源代码位置找
      let targetElement = findElementByPath(currentCommentPath.value)

      // 查找对应的元素信息
      const elementInfo = selectedElements.value.find(el => el.path === currentCommentPath.value)
      
      // 如果有稳定ID，尝试使用稳定ID查找
      if (!targetElement && elementInfo && elementInfo.stableId) {
        targetElement = findElementByStableId(elementInfo.stableId)
      }
      
      if (!targetElement) {
        console.error('未找到要截图的元素')
        // 恢复评论对话框和悬浮面板
        commentDialogVisible.value = true
        if (panelRef.value) {
          panelRef.value.style.display = 'block'
        }
        return
      }
      
      // 使用截图工具
      captureElementScreenshot(
        targetElement,
        (dataUrl) => {
          // 恢复评论对话框和悬浮面板
          commentDialogVisible.value = true
          if (panelRef.value) {
            panelRef.value.style.display = 'block'
          }
          // 保存截图预览
          screenshotPreview.value = dataUrl
        },
        (error) => {
          console.error('截图失败:', error)
          // 恢复评论对话框和悬浮面板
          commentDialogVisible.value = true
          if (panelRef.value) {
            panelRef.value.style.display = 'block'
          }
        }
      )
    }, 100)
  } catch (error) {
    console.error('截图操作失败:', error)
    // 恢复评论对话框和悬浮面板
    commentDialogVisible.value = true
    if (panelRef.value) {
      panelRef.value.style.display = 'block'
    }
  }
}

// 截图元素（从列表中选择元素进行截图）
const screenshotElement = (path: string) => {
  // 找到元素
  const elementIndex = selectedElements.value.findIndex(el => el.path === path)
  if (elementIndex !== -1) {
    // 显示评论对话框
    commentDialogVisible.value = true
    currentCommentPath.value = path
    commentText.value = selectedElements.value[elementIndex].comment || ''
    screenshotPreview.value = selectedElements.value[elementIndex].screenshot || null
    
    // 自动触发截图
    captureScreenshot()
  }
}

// Popover相关方法
const showPopoverForElement = (element: HTMLElement) => {
  if (!element || !element.dataset.__sourceCodeLocation) return
  
  // 计算popover位置
  const rect = element.getBoundingClientRect()
  
  // 设置popover位置
  popoverPosition.value = {
    top: Math.max(rect.top - 10, 10), // 确保不会超出屏幕顶部
    left: rect.left + (rect.width / 2),
  }
  
  // 清空之前的评论和截图
  popoverCommentText.value = ''
  screenshotPreviewPopover.value = null
  
  // 显示popover
  showElementPopover.value = true
}

// 隐藏元素Popover
const hideElementPopover = () => {
  showElementPopover.value = false
  popoverCommentText.value = ''
  screenshotPreviewPopover.value = null
}

// 跳转到代码
const jumpToCode = () => {
  if (!lastHighlightedElement.value) return
  
  const sourceCodeLocation = lastHighlightedElement.value.dataset.__sourceCodeLocation
  
  if (sourceCodeLocation) {
    // 隐藏popover
    hideElementPopover()
    // 跳转到代码
    openEditor(sourceCodeLocation, (window as any).__EDITOR__ || 'cursor')
  }
}

// 从Popover添加元素
const addElementFromPopover = () => {
  if (!lastHighlightedElement.value) return
  
  const sourceCodeLocation = lastHighlightedElement.value.dataset.__sourceCodeLocation
  
  if (sourceCodeLocation) {
    // 生成稳定ID
    const stableId = generateStableId(lastHighlightedElement.value)
    
    // 添加元素
    addElement({
      name: getElementName(lastHighlightedElement.value),
      path: sourceCodeLocation,
      comment: popoverCommentText.value.trim() || undefined,
      screenshot: screenshotPreviewPopover.value || undefined,
      stableId: stableId
    })
    
    // 显示添加成功提示
    showKeyboardShortcutNotification()
    
    // 隐藏popover
    hideElementPopover()
  }
}

// 移除Popover截图
const removePopoverScreenshot = () => {
  screenshotPreviewPopover.value = null
}

// 为Popover捕获截图
const capturePopoverScreenshot = () => {
  try {
    // 临时隐藏popover
    showElementPopover.value = false
    
    // 也隐藏悬浮面板
    if (panelRef.value) {
      panelRef.value.style.display = 'none'
    }

    // 延迟一点点，确保UI更新
    setTimeout(() => {
      // 使用截图工具
      captureElementScreenshot(
        lastHighlightedElement.value,
        (dataUrl) => {
          // 恢复popover和悬浮面板
          showElementPopover.value = true
          if (panelRef.value) {
            panelRef.value.style.display = 'block'
          }
          // 保存截图预览
          screenshotPreviewPopover.value = dataUrl
        },
        (error) => {
          console.error('截图失败:', error)
          // 恢复popover和悬浮面板
          showElementPopover.value = true
          if (panelRef.value) {
            panelRef.value.style.display = 'block'
          }
        }
      )
    }, 100)
  } catch (error) {
    console.error('截图操作失败:', error)
    // 恢复popover和悬浮面板
    showElementPopover.value = true
    if (panelRef.value) {
      panelRef.value.style.display = 'block'
    }
  }
}

// 清空所有元素
const clearElements = () => {
  selectedElements.value = []
}

// 主动获取UI走查数据
const fetchUIReviewElements = async () => {
  const response = await fetch('/__mcp/api/ui-review-elements', {
    method: 'GET',
  })
  const data = await response.json()
  return data
}

const fetchSubmit = async () => {
  const response = await fetch('/__mcp/api/ai-edit', {
    method: 'POST',
    body: JSON.stringify({
      filePath: '',
      prompt: '',
    }),
  })
  const data = await response.json()
  return data
}

// 添加按钮用于主动请求刷新UI走查数据
const refreshUIReviewElements = async () => {
  try {
    // 显示加载状态
    saveStatus.value = {
      type: 'success',
      message: '正在获取UI走查数据...',
      timestamp: Date.now()
    }
    
    // 调用API获取数据
    const res = await fetchUIReviewElements()
    selectedElements.value = res.elements || []
    
    // 清除状态提示
    if (saveStatus.value) {
      saveStatus.value = null
    }
  } catch (error) {
    console.error('刷新UI走查数据失败:', error)
    
    // 显示错误状态
    saveStatus.value = {
      type: 'error',
      message: `刷新失败: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    }
  }
}

// 切换元素的提交状态
const toggleElementSubmitted = (path: string) => {
  const index = selectedElements.value.findIndex(el => el.path === path)
  if (index !== -1) {
    const element = selectedElements.value[index]
    // 切换状态
    element.isSubmitted = !element.isSubmitted
    
    // 如果标记为已提交，但之前未提交过，则显示提示
    if (element.isSubmitted) {
      saveStatus.value = {
        type: 'success',
        message: '已标记为已提交',
        timestamp: Date.now()
      }
    } else {
      saveStatus.value = {
        type: 'info',
        message: '已取消提交标记',
        timestamp: Date.now()
      }
    }
    
    // 保存更新后的元素
    sendDataToMcpService()
  }
}

// 切换元素的修复状态
const toggleElementFixed = (path: string) => {
  const index = selectedElements.value.findIndex(el => el.path === path)
  if (index !== -1) {
    const element = selectedElements.value[index]
    // 切换状态
    element.isFixed = !element.isFixed
    
    // 如果标记为已修复，但之前未修复过，则显示提示
    if (element.isFixed) {
      saveStatus.value = {
        type: 'success',
        message: '已标记为已修复',
        timestamp: Date.now()
      }
    } else {
      saveStatus.value = {
        type: 'info',
        message: '已取消修复标记',
        timestamp: Date.now()
      }
    }
    
    // 保存更新后的元素
    sendDataToMcpService()
  }
}

// 事件监听
onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  // 添加鼠标移动事件监听器，用于记录最后一个高亮元素
  const mouseMoveHandler = (e: MouseEvent) => {
    if (e.altKey) {
      const element = e.target as HTMLElement
      const highlightedElement = findHighlightableElement(element)
      if (highlightedElement) {
        lastHighlightedElement.value = highlightedElement
      }
    }
  }
  
  document.addEventListener('mousemove', mouseMoveHandler, true)
  
  // 添加点击事件监听，用于显示/隐藏popover
  const clickHandler = (e: MouseEvent) => {
    // 如果点击的是popover内部或者激活区域内部，不处理
    if (e.target && (
      (document.querySelector('.vue-mcp-element-popover') && 
       (e.target as HTMLElement).closest('.vue-mcp-element-popover')) ||
      (document.querySelector('.vue-mcp-floating-panel') && 
       (e.target as HTMLElement).closest('.vue-mcp-floating-panel'))
    )) {
      return
    }
    
    // 如果按住Alt键点击
    if (e.altKey) {
      const element = e.target as HTMLElement
      const highlightedElement = findHighlightableElement(element)
      
      if (highlightedElement) {
        // 显示popover
        e.preventDefault()
        e.stopPropagation()
        lastHighlightedElement.value = highlightedElement
        showPopoverForElement(highlightedElement)
      } else {
        // 隐藏popover
        hideElementPopover()
      }
    } else {
      // 点击其他区域时隐藏popover
      hideElementPopover()
    }
  }
  
  document.addEventListener('click', clickHandler, true)
  
  // 开始监听高亮元素变化
  const observer = observeHighlightedElements()
  
  // 保存 observer 到外部变量，以便在 onUnmounted 中使用
  highlightObserver.value = observer
  
  // 保存事件处理函数引用
  mouseEventHandler.value = mouseMoveHandler
  clickEventHandler.value = clickHandler
  
  // 加载初始数据
  refreshUIReviewElements()
})

// 保存 MutationObserver 实例和事件处理函数
const highlightObserver = ref<MutationObserver | null>(null)
const mouseEventHandler = ref<((e: MouseEvent) => void) | null>(null)
const clickEventHandler = ref<((e: MouseEvent) => void) | null>(null)

// 查找可高亮的元素（带有源代码位置信息的元素）
const findHighlightableElement = (el: HTMLElement | null): HTMLElement | null => {
  if (!el) return null
  
  try {
    let currentEl = el
    while (currentEl && !currentEl.dataset.__sourceCodeLocation) {
      if (!currentEl.parentElement) break
      currentEl = currentEl.parentElement
    }
    
    return currentEl && currentEl.dataset.__sourceCodeLocation ? currentEl : null
  } catch {
    return null
  }
}

// 监听高亮元素的变化
const observeHighlightedElements = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'vue-click-to-component-target') {
        const element = mutation.target as HTMLElement
        if (element.hasAttribute('vue-click-to-component-target')) {
          // 当有新的高亮元素时，记录它
          lastHighlightedElement.value = element
        }
      }
    }
  })
  
  // 监听整个文档的属性变化
  observer.observe(document.body, { 
    attributes: true, 
    attributeFilter: ['vue-click-to-component-target'],
    subtree: true 
  })
  
  return observer
}

// 卸载时停止监听
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  if (mouseEventHandler.value) {
    document.removeEventListener('mousemove', mouseEventHandler.value, true)
  }
  
  if (clickEventHandler.value) {
    document.removeEventListener('click', clickEventHandler.value, true)
  }
  
  if (highlightObserver.value) {
    highlightObserver.value.disconnect()
  }
  
  if (keyboardShortcutTipTimeout.value) {
    clearTimeout(keyboardShortcutTipTimeout.value)
  }
})
</script>

<style scoped>
.vue-mcp-floating-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: transform 0.3s ease;
}

.vue-mcp-floating-panel.minimized {
  transform: translateY(calc(100% - 40px));
}

.vue-mcp-floating-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.vue-mcp-floating-panel-title {
  font-weight: 600;
  font-size: 14px;
}

.vue-mcp-floating-panel-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.vue-mcp-floating-panel-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.vue-mcp-form-group {
  margin-bottom: 12px;
}

.vue-mcp-save-status {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.vue-mcp-save-status.success {
  background-color: #ecfdf5;
  border: 1px solid #d1fae5;
}

.vue-mcp-save-status.error {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
}

.vue-mcp-save-status.info {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
}

.vue-mcp-save-status-icon {
  margin-right: 6px;
  font-weight: bold;
}

.vue-mcp-save-status-text {
  font-size: 14px;
  font-weight: 500;
}
</style> 