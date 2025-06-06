<script setup lang="ts">
import ElementItem from './ElementItem.vue'

// 元素类型定义
export interface ElementInfo {
  name: string
  path: string
  type?: string
  comment?: string
  screenshot?: string
  isSubmitted?: boolean
  isFixed?: boolean
}

// Props
defineProps<{
  elements: ElementInfo[]
}>()

// Emits
defineEmits<{
  (e: 'remove', path: string): void
  (e: 'view', path: string): void
  (e: 'comment', path: string): void
  (e: 'screenshot', path: string): void
  (e: 'toggleSubmit', path: string): void
  (e: 'toggleFixed', path: string): void
}>()
</script>

<template>
  <div class="vue-mcp-element-list-container">
    <div class="vue-mcp-form-label">
      已选择的元素
    </div>
    <ul class="vue-mcp-element-list">
      <ElementItem
        v-for="item in elements"
        :key="item.path"
        :element="item"
        @remove="$emit('remove', item.path)"
        @view="$emit('view', item.path)"
        @comment="$emit('comment', item.path)"
        @screenshot="$emit('screenshot', item.path)"
        @toggle-submit="$emit('toggleSubmit', item.path)"
        @toggle-fixed="$emit('toggleFixed', item.path)"
      />
      <li
        v-if="elements.length === 0"
        class="vue-mcp-element-item vue-mcp-empty-item"
      >
        暂无选择的元素
      </li>
    </ul>
  </div>
</template>

<style scoped>
.vue-mcp-element-list-container {
  margin-bottom: 12px;
}

.vue-mcp-form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
}

.vue-mcp-element-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vue-mcp-empty-item {
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: #f5f5f5;
  font-size: 13px;
  color: #666;
  text-align: center;
}
</style>
