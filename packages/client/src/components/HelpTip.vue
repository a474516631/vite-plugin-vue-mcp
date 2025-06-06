<template>
  <div class="vue-mcp-help-tip">
    <div class="vue-mcp-help-tip-icon">
      💡
    </div>
    <div class="vue-mcp-help-tip-text">
      <strong>使用方法：</strong> 按住 <kbd>Alt</kbd> 键并移动鼠标到元素上方进行高亮。
      按下 <kbd>Alt+点击</kbd> 可在元素上方显示操作面板，支持查看代码、添加评论和截图。
    </div>
  </div>
</template>

<style scoped>
.vue-mcp-help-tip {
  display: flex;
  padding: 12px 14px;
  border-radius: 6px;
  background: #f0f9ff;
  border-left: 3px solid #0ea5e9;
  margin-bottom: 16px;
  font-size: 13px;
  align-items: flex-start;
  gap: 10px;
}

.vue-mcp-help-tip-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #0ea5e9;
}

.vue-mcp-help-tip-text {
  flex: 1;
  line-height: 1.5;
}

kbd {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  color: #334155;
  display: inline-block;
  font-family: monospace;
  font-size: 11px;
  line-height: 1;
  padding: 2px 4px;
  margin: 0 2px;
}
</style>
