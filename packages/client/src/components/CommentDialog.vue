<script setup lang="ts">
// Props
defineProps<{
  visible: boolean
  commentText: string
  screenshotPreview: string | null
}>()

// Emits
defineEmits<{
  (e: 'update:commentText', value: string): void
  (e: 'removeScreenshot'): void
  (e: 'captureScreenshot'): void
  (e: 'cancel'): void
  (e: 'save'): void
}>()
</script>

<template>
  <div
    v-if="visible"
    class="vue-mcp-comment-dialog"
  >
    <div class="vue-mcp-comment-dialog-header">
      <h3 class="vue-mcp-comment-dialog-title">
        添加评论
      </h3>
      <button
        class="vue-mcp-comment-dialog-close"
        @click="$emit('cancel')"
      >
        ×
      </button>
    </div>
    <div class="vue-mcp-comment-dialog-body">
      <textarea
        :value="commentText"
        class="vue-mcp-comment-textarea"
        placeholder="请输入评论内容..."
        @input="$emit('update:commentText', ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- 截图预览 -->
      <div
        v-if="screenshotPreview"
        class="vue-mcp-screenshot-preview"
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

      <!-- 截图按钮 -->
      <div
        v-if="!screenshotPreview"
        class="vue-mcp-screenshot-actions"
      >
        <button
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-secondary"
          @click="$emit('captureScreenshot')"
        >
          <span class="vue-mcp-btn-icon-text">📷 添加截图</span>
        </button>
      </div>
    </div>
    <div class="vue-mcp-comment-dialog-footer">
      <button
        class="vue-mcp-btn vue-mcp-btn-sm"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        class="vue-mcp-btn vue-mcp-btn-primary vue-mcp-btn-sm"
        @click="$emit('save')"
      >
        保存
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 评论对话框样式 */
.vue-mcp-comment-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  width: 320px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 100000;
}

.vue-mcp-comment-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}

.vue-mcp-comment-dialog-title {
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.vue-mcp-comment-dialog-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.vue-mcp-comment-dialog-body {
  padding: 16px;
}

.vue-mcp-comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.vue-mcp-comment-dialog-footer {
  padding: 10px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.vue-mcp-screenshot-preview {
  margin-bottom: 12px;
}

.vue-mcp-screenshot-preview-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 8px;
  object-fit: cover;
  object-position: center;
}

.vue-mcp-screenshot-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.vue-mcp-screenshot-actions {
  margin-top: 12px;
  text-align: right;
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
</style>
