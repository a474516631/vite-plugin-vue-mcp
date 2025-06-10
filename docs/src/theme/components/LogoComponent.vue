<script setup>
// 组件逻辑可以在这里添加
import { onMounted, ref } from 'vue'

const systemName = 'AIReview'

// 交互状态管理
const isHovered = ref(false)
const isActive = ref(false)
const isPulsing = ref(false)
const scanAnimation = ref(false)

// 元素高亮状态
const highlightGrid = ref(false)
const highlightAI = ref(false)
const highlightCursor = ref(false)
const highlightBox = ref(false)

// 工具提示相关
const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipPosition = ref({ x: 0, y: 0 })

// 颜色设置
const vueGreen = '#42b883'
const vueDarkBlue = '#35495e'
const uiOrange = '#f6b26b'

// 开始动画效果
onMounted(() => {
  // 定时触发脉冲动画
  setInterval(() => {
    isPulsing.value = true
    setTimeout(() => {
      isPulsing.value = false
    }, 2000)
  }, 5000)
  
  // 定时触发扫描动画
  setInterval(() => {
    scanAnimation.value = true
    setTimeout(() => {
      scanAnimation.value = false
    }, 2000)
  }, 6000)
})

// 显示元素提示
function showElementTooltip(element, event) {
  let tooltipMessages = {
    'ui-highlight': 'UI元素高亮功能',
    'ai-label': 'AI辅助编辑功能',
    'box-model': '盒模型检视功能',
    'cursor': '点击选择组件功能'
  }
  
  tooltipText.value = tooltipMessages[element]
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
  showTooltip.value = true
  
  // 高亮相应元素
  if (element === 'ui-highlight') highlightAI.value = true
  if (element === 'ai-label') highlightAI.value = true
  if (element === 'box-model') highlightBox.value = true
  if (element === 'cursor') highlightCursor.value = true
}

// 隐藏元素提示
function hideElementTooltip() {
  showTooltip.value = false
  highlightGrid.value = false
  highlightAI.value = false
  highlightCursor.value = false
  highlightBox.value = false
}

// 激活动画
function activateAnimation() {
  isActive.value = true
  setTimeout(() => {
    isActive.value = false
  }, 3000)
}
</script>

<template>
  <div 
    class="logo-container" 
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
    @click="activateAnimation"
  >
    <!-- SVG 图标 -->
    <svg 
      viewBox="0 0 100 100" 
      width="100%" 
      height="100%" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 背景圆形 -->
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        :fill="vueDarkBlue" 
        :class="{ 'pulse-animation': isPulsing, 'active-circle': isActive }"
      />

      <!-- 外部边框 - 代表盒模型 -->
      <rect 
        x="25" 
        y="25" 
        width="50" 
        height="50" 
        rx="6" 
        ry="6" 
        fill="none" 
        :stroke="vueGreen" 
        stroke-width="3" 
        stroke-dasharray="3,2" 
        :class="{ 'highlight-box': highlightBox || isActive }"
        @mouseenter="showElementTooltip('box-model', $event)"
        @mouseleave="hideElementTooltip"
      />

      <!-- 内部内容区域 - 代表UI元素 -->
      <rect 
        x="30" 
        y="30" 
        width="40" 
        height="40" 
        rx="4" 
        ry="4" 
        :fill="vueGreen" 
        opacity="0.6" 
        :class="{ 'highlight-element': highlightGrid || isHovered }"
        @mouseenter="showElementTooltip('ui-highlight', $event)"
        @mouseleave="hideElementTooltip"
      />

      <!-- 检查/扫描线 - 代表检查工具 -->
      <line 
        x1="20" 
        y1="20" 
        x2="80" 
        y2="80" 
        stroke="#ffffff" 
        stroke-width="2" 
        stroke-dasharray="2,2" 
        :class="{ 'scan-animation': scanAnimation || isActive }"
      />
      <line 
        x1="80" 
        y1="20" 
        x2="20" 
        y2="80" 
        stroke="#ffffff" 
        stroke-width="2" 
        stroke-dasharray="2,2" 
        :class="{ 'scan-animation-reverse': scanAnimation || isActive }"
      />

      <!-- 高亮指示器 - 代表元素高亮功能 -->
      <circle 
        cx="50" 
        cy="50" 
        r="15" 
        :fill="uiOrange" 
        opacity="0.5" 
        :class="{ 'highlight-pulse': isHovered }"
        @mouseenter="showElementTooltip('ui-highlight', $event)"
        @mouseleave="hideElementTooltip"
      />

      <!-- AI符号 - 代表AI辅助 -->
      <text 
        x="50" 
        y="55" 
        font-family="Arial" 
        font-size="14" 
        fill="#ffffff" 
        text-anchor="middle" 
        font-weight="bold" 
        :class="{ 'ai-glow': highlightAI || isActive }"
        @mouseenter="showElementTooltip('ai-label', $event)"
        @mouseleave="hideElementTooltip"
      >AI</text>

      <!-- 光标 - 代表点击选择功能 -->
      <path 
        d="M40,75 L45,65 L50,75 L47,75 L47,80 L43,80 L43,75 Z" 
        fill="#ffffff" 
        :class="{ 'cursor-move': highlightCursor || isHovered }"
        @mouseenter="showElementTooltip('cursor', $event)"
        @mouseleave="hideElementTooltip"
      />
    </svg>

    <!-- 元素提示工具提示 -->
    <div v-if="showTooltip" class="element-tooltip" :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y - 30}px` }">
      {{ tooltipText }}
    </div>
  </div>
</template>

<style>
/* 保留原有的主题颜色变量定义 */
:root {
  /* 亮色主题 */
  --logo-bg-primary: #1a1a2e;
  --logo-bg-secondary: #2a2a3a;
  --logo-bg-tertiary: #3a3a4a;
  --logo-bg-header: #0f0f1a;
  --logo-text-primary: #fff;
  --logo-text-secondary: rgba(255, 255, 255, 0.7);
  --logo-accent-primary: #4361ee;
  --logo-accent-secondary: #4895ef;
  --logo-code-bg: #282c34;
  --logo-code-text: #e0e0e0;
  --logo-code-keyword: #bd93f9;
  --logo-code-string: #50fa7b;
  --logo-shadow: rgba(0, 0, 0, 0.5);
}

/* 暗色主题 */
.dark {
  --logo-bg-primary: #1a1a2e;
  --logo-bg-secondary: #2a2a3a;
  --logo-bg-tertiary: #3a3a4a;
  --logo-bg-header: #0f0f1a;
  --logo-text-primary: #fff;
  --logo-text-secondary: rgba(255, 255, 255, 0.7);
  --logo-accent-primary: #4361ee;
  --logo-accent-secondary: #4895ef;
  --logo-code-bg: #282c34;
  --logo-code-text: #e0e0e0;
  --logo-code-keyword: #bd93f9;
  --logo-code-string: #50fa7b;
  --logo-shadow: rgba(0, 0, 0, 0.5);
}

/* 亮色主题 */
html:not(.dark) {
  --logo-bg-primary: #f0f2f5;
  --logo-bg-secondary: #e4e7ed;
  --logo-bg-tertiary: #dcdfe6;
  --logo-bg-header: #ebeef5;
  --logo-text-primary: #303133;
  --logo-text-secondary: #606266;
  --logo-accent-primary: var(--vp-button-brand-bg);;
  --logo-accent-secondary: var(--vp-button-alt-bg);;
  --logo-code-bg: #f5f7fa;
  --logo-code-text: #303133;
  --logo-code-keyword: #0077aa;
  --logo-code-string: #42b983;
  --logo-shadow: rgba(0, 0, 0, 0.1);
}
</style>

<style scoped>
.logo-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  max-height: 300px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

/* SVG动画相关样式 */
.pulse-animation {
  animation: pulseBg 2s ease-in-out;
}

.active-circle {
  animation: activePulse 3s ease-in-out;
}

@keyframes activePulse {
  0% { opacity: 1; r: 45; }
  50% { opacity: 0.9; r: 47; }
  100% { opacity: 1; r: 45; }
}

@keyframes pulseBg {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.highlight-box {
  stroke-width: 4;
  stroke-dasharray: 4,2;
  animation: rotateDash 3s linear infinite;
}

@keyframes rotateDash {
  to { stroke-dashoffset: 20; }
}

.highlight-element {
  opacity: 0.8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

.highlight-pulse {
  animation: pulseHighlight 2s infinite;
}

@keyframes pulseHighlight {
  0% { opacity: 0.5; r: 15; }
  50% { opacity: 0.7; r: 18; }
  100% { opacity: 0.5; r: 15; }
}

.ai-glow {
  text-shadow: 0 0 8px #ffffff;
  font-size: 16px;
}

.cursor-move {
  animation: moveCursor 1s infinite alternate;
}

@keyframes moveCursor {
  from { transform: translate(0, 0); }
  to { transform: translate(3px, -3px); }
}

.scan-animation {
  animation: scanMove 2s linear;
  stroke: #42b883;
}

.scan-animation-reverse {
  animation: scanMoveReverse 2s linear;
  stroke: #42b883;
}

@keyframes scanMove {
  0% { stroke-dashoffset: 0; stroke-width: 2; }
  50% { stroke-dashoffset: 10; stroke-width: 3; }
  100% { stroke-dashoffset: 0; stroke-width: 2; }
}

@keyframes scanMoveReverse {
  0% { stroke-dashoffset: 0; stroke-width: 2; }
  50% { stroke-dashoffset: -10; stroke-width: 3; }
  100% { stroke-dashoffset: 0; stroke-width: 2; }
}

/* 工具提示样式 */
.element-tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
}

@media (max-width: 768px) {
  .logo-container {
    max-width: 200px;
    max-height: 200px;
  }
}
</style>
