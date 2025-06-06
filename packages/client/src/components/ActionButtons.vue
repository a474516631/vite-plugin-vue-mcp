<template>
  <div class="vue-mcp-actions">

    <button 
      type="button" 
      class="vue-mcp-btn vue-mcp-btn-secondary"
      @click="$emit('refresh')"
    >
      刷新
    </button>
    <button 
      type="button" 
      class="vue-mcp-btn vue-mcp-btn-danger"
      @click="$emit('clear')"
    >
      清空
    </button>
    <button 
      type="button" 
      class="vue-mcp-btn vue-mcp-btn-primary"
      :class="{ 'vue-mcp-btn-disabled': disabledSubmit }"
      :disabled="disabledSubmit"
      @click="$emit('submit')"
    >
      {{ disabledSubmit ? '全部已提交' : '提交给 AI 自动修复' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { disabledSubmit = false } = defineProps<{
  disabledSubmit?: boolean
}>()
// Emits
defineEmits<{
  (e: 'submit'): void
  (e: 'refresh'): void
  (e: 'clear'): void
}>()
</script>

<style scoped>
.vue-mcp-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
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

.vue-mcp-btn-danger {
  background: #ef4444;
}

.vue-mcp-btn-secondary {
  background: none;
  color: #4f46e5;
  cursor: pointer;
}

.vue-mcp-btn-disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}
</style> 