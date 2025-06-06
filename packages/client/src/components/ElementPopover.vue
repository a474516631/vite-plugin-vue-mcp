<script setup lang="ts">
import { computed } from 'vue'

// Props
const props = defineProps<{
  element: HTMLElement | null
  commentText: string
  screenshotPreview: string | null
  position: { top: number, left: number }
}>()

// Emits
defineEmits<{
  (e: 'close'): void
  (e: 'update:commentText', value: string): void
  (e: 'removeScreenshot'): void
  (e: 'captureScreenshot'): void
  (e: 'jumpToCode'): void
  (e: 'addElement'): void
}>()

// 计算样式
const popoverStyle = computed(() => {
  // 计算屏幕边界
  const screenWidth = window.innerWidth
  // const screenHeight = window.innerHeight

  // popover 尺寸 (假设的最大宽高，也可以通过 ref 获取实际尺寸)
  const popoverWidth = 320
  const popoverHeight = 200

  // 计算位置
  let top = props.position.top - 10
  let left = props.position.left
  let transform = 'translateX(-50%) translateY(-100%)'
  let transformFrom = 'translateX(-50%) translateY(calc(-100% + 10px))'
  let transformTo = 'translateX(-50%) translateY(-100%)'
  let arrow = 'bottom'

  // 检查是否超出屏幕上方
  if (top - popoverHeight < 10) {
    // 改为显示在元素下方
    top = props.position.top + 30
    transform = 'translateX(-50%)'
    transformFrom = 'translateX(-50%) translateY(-10px)'
    transformTo = 'translateX(-50%)'
    arrow = 'top'
  }

  // 检查是否超出屏幕左侧
  if (left - (popoverWidth / 2) < 10) {
    left = 10 + (popoverWidth / 2)
  }

  // 检查是否超出屏幕右侧
  if (left + (popoverWidth / 2) > screenWidth - 10) {
    left = screenWidth - 10 - (popoverWidth / 2)
  }

  return {
    'position': 'fixed' as const,
    'top': `${top}px`,
    'left': `${left}px`,
    transform,
    '--popover-arrow': `'${arrow}'`,
    '--transform-from': transformFrom,
    '--transform-to': transformTo,
  }
})

// 获取元素名称
function getElementName(el: HTMLElement): string {
  return el.localName || el.tagName.toLowerCase()
}
</script>

<template>
  <div
    v-if="element"
    class="vue-mcp-element-popover"
    :class="{ 'top-arrow': popoverStyle['--popover-arrow'] === '\'top\'' }"
    :style="popoverStyle"
  >
    <div class="vue-mcp-element-popover-content">
      <div class="vue-mcp-element-popover-header">
        <div class="vue-mcp-element-popover-title">
          {{ getElementName(element) }}
        </div>
        <button
          class="vue-mcp-element-popover-close"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>

      <div class="vue-mcp-element-popover-body">
        <!-- 截图预览 -->
        <div
          v-if="screenshotPreview"
          class="vue-mcp-screenshot-preview-popover"
        >
          <img
            :src="screenshotPreview"
            alt="截图预览"
            class="vue-mcp-screenshot-preview-img"
          >
          <button
            class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-danger vue-mcp-screenshot-remove"
            @click="$emit('removeScreenshot')"
          >
            删除截图
          </button>
        </div>

        <!-- 评论输入 -->
        <textarea
          :value="commentText"
          class="vue-mcp-popover-comment-textarea"
          placeholder="添加评论..."
          @input="$emit('update:commentText', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div class="vue-mcp-element-popover-footer">
        <button
          v-if="!screenshotPreview"
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-secondary"
          @click="$emit('captureScreenshot')"
        >
          <span class="vue-mcp-btn-icon-text">📷 添加截图</span>
        </button>
        <button
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-primary"
          title="在编辑器中打开源代码"
          @click="$emit('jumpToCode')"
        >
          <span class="vue-mcp-btn-icon-text">🔍 查看代码</span>
        </button>
        <button
          class="vue-mcp-btn vue-mcp-btn-primary vue-mcp-btn-sm"
          @click="$emit('addElement')"
        >
          添加元素
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 元素Popover样式 */
.vue-mcp-element-popover {
  position: fixed;
  z-index: 100000;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
  animation: popover-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-width: 90vw;
}

.vue-mcp-element-popover-content {
  background: white;
  border-radius: 8px;
  width: 320px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 底部箭头（默认，显示在元素上方） */
.vue-mcp-element-popover-content::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.1));
}

/* 顶部箭头（显示在元素下方） */
.vue-mcp-element-popover.top-arrow .vue-mcp-element-popover-content::after {
  bottom: auto;
  top: -9px;
  border-top: none;
  border-bottom: 10px solid white;
}

.vue-mcp-element-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #f9fafb;
}

.vue-mcp-element-popover-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vue-mcp-element-popover-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.vue-mcp-element-popover-close:hover {
  opacity: 1;
}

.vue-mcp-element-popover-body {
  padding: 16px;
}

.vue-mcp-element-popover-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  background: #f9fafb;
}

.vue-mcp-popover-comment-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
}

.vue-mcp-screenshot-preview-popover {
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
}

.vue-mcp-screenshot-preview-img {
  width: 100%;
  display: block;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

@keyframes popover-appear {
  from {
    opacity: 0;
    transform: var(--transform-from, translateX(-50%) translateY(calc(-100% + 10px)));
  }

  to {
    opacity: 1;
    transform: var(--transform-to, translateX(-50%) translateY(-100%));
  }
}

.vue-mcp-btn {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  margin-right: 4px;
}

.vue-mcp-btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.vue-mcp-btn-danger {
  background: #ef4444;
}

.vue-mcp-btn-primary {
  background: #3b82f6;
}

.vue-mcp-btn-secondary {
  background: none;
  color: #4f46e5;
  cursor: pointer;
}

.vue-mcp-btn-icon-text {
  margin-left: 4px;
}

.vue-mcp-screenshot-remove {
  margin-top: 8px;
}
</style>
