<template>
  <li :class="['vue-mcp-element-item', { 'vue-mcp-suggestion': isSuggestion }]">
    <div class="vue-mcp-element-content">
      <div class="vue-mcp-element-name">{{ element.name }}</div>
      <div class="vue-mcp-element-path">{{ element.path }}</div>
      <div v-if="element.comment" class="vue-mcp-element-comment">
        <span class="vue-mcp-comment-icon">💬</span>
        <span class="vue-mcp-comment-text">{{ element.comment }}</span>
      </div>
      <div v-if="element.screenshot" class="vue-mcp-element-screenshot" @click="viewScreenshot(element.screenshot)">
        <img :src="element.screenshot" alt="元素截图" class="vue-mcp-screenshot-thumb" />
        <span class="vue-mcp-screenshot-hint">点击查看大图</span>
      </div>
    </div>
    <div class="vue-mcp-element-actions">
      <template v-if="!isSuggestion">
        <button 
          type="button"
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-icon"
          title="显示盒模型"
          @click="$emit('view', element.path)"
        >
          📏
        </button>
        <button 
          type="button"
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-icon"
          title="添加评论"
          @click="$emit('comment', element.path)"
        >
          💬
        </button>
        <button 
          type="button"
          class="vue-mcp-btn vue-mcp-btn-sm vue-mcp-btn-icon vue-mcp-btn-danger"
          title="删除"
          @click="$emit('remove', element.path)"
        >
          ❌
        </button>
      </template>
      <template v-else>
        <button 
          type="button"
          class="vue-mcp-btn vue-mcp-btn-sm"
          @click="$emit('add', element)"
        >
          添加
        </button>
      </template>
    </div>
  </li>
</template>

<script setup lang="ts">
// 定义属性
interface ElementInfo {
  name: string;
  path: string;
  type?: string;
  comment?: string;
  screenshot?: string;
}

interface Props {
  element: ElementInfo;
  isSuggestion?: boolean;
}

defineProps<Props>();

// 定义事件
defineEmits<{
  (e: 'view', path: string): void;
  (e: 'remove', path: string): void;
  (e: 'add', element: ElementInfo): void;
  (e: 'comment', path: string): void;
}>();

// 查看截图
function viewScreenshot(screenshot: string) {
  const newWindow = window.open('', '_blank', 'width=800,height=600');
  if (newWindow) {
    const html = '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<title>元素截图</title>' +
      '<style>' +
      'body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; background: #f8fafc; }' +
      '.image-container { max-width: 100%; text-align: center; margin-bottom: 20px; }' +
      'img { max-width: 100%; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }' +
      '.download-btn { background: #4f46e5; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-size: 14px; cursor: pointer; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div class="image-container"><img src="' + screenshot + '" alt="元素截图"></div>' +
      '<button class="download-btn" onclick="downloadImage()">下载图片</button>' +
      '<script>' +
      'function downloadImage() { const link = document.createElement("a"); link.href = "' + screenshot + '"; link.download = "element-screenshot-" + Date.now() + ".png"; document.body.appendChild(link); link.click(); document.body.removeChild(link); }' +
      '<\/script>' +
      '</body>' +
      '</html>';
    
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
  }
}
</script>

<style scoped>
.vue-mcp-element-item {
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: #f5f5f5;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.vue-mcp-element-item.vue-mcp-suggestion {
  background: #eef2ff;
  border-left: 3px solid #4f46e5;
}

.vue-mcp-element-content {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.vue-mcp-element-name {
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vue-mcp-element-path {
  font-size: 11px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vue-mcp-element-comment {
  margin-top: 4px;
  padding: 4px 6px;
  background-color: #f0f9ff;
  border-left: 2px solid #0ea5e9;
  border-radius: 2px;
  font-size: 12px;
}

.vue-mcp-element-screenshot {
  margin-top: 6px;
  cursor: pointer;
  position: relative;
}

.vue-mcp-screenshot-thumb {
  max-width: 100%;
  max-height: 120px;
  border: 1px solid #e2e8f0;
  border-radius: 2px;
  display: block;
}

.vue-mcp-screenshot-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.vue-mcp-element-screenshot:hover .vue-mcp-screenshot-hint {
  opacity: 1;
}

.vue-mcp-comment-icon {
  margin-right: 4px;
}

.vue-mcp-comment-text {
  word-break: break-word;
  white-space: pre-wrap;
}

.vue-mcp-element-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 4px;
}

.vue-mcp-btn-sm {
  padding: 3px 6px;
  font-size: 11px;
}

.vue-mcp-btn-icon {
  line-height: 1;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style> 