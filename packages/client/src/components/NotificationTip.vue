<template>
  <div v-if="visible" class="vue-mcp-notification-tip" :class="type">
    <div class="vue-mcp-notification-tip-content">
      <span class="vue-mcp-notification-tip-text">{{ message }}</span>
      <button class="vue-mcp-notification-tip-close" @click="$emit('close')">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  visible: boolean
  message: string
  type: 'success' | 'error' | 'info'
}>()

// Emits
defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.vue-mcp-notification-tip {
  position: fixed;
  top: 16px;
  right: 16px;
  color: white;
  border-radius: 4px;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100001;
  animation: fade-in-out 3s ease forwards;
}

.vue-mcp-notification-tip.success {
  background: #10b981;
}

.vue-mcp-notification-tip.error {
  background: #ef4444;
}

.vue-mcp-notification-tip.info {
  background: #3b82f6;
}

.vue-mcp-notification-tip-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.vue-mcp-notification-tip-text {
  margin-right: 16px;
  font-weight: 500;
}

.vue-mcp-notification-tip-close {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
}

.vue-mcp-notification-tip-close:hover {
  opacity: 1;
}

@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
</style> 