<template>
  <div class="container" @mousemove="handleMouseMove">
    <UserInfo />
    <Count />
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserInfo from '../components/UserInfo.vue'
import Count from '../components/Count.vue'
import { ref, onMounted, onUnmounted } from 'vue'

// 鼠标位置状态
const mouseX = ref(0)
const mouseY = ref(0)

// 处理鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 为粒子生成样式
const getParticleStyle = (index: number) => {
  const size = Math.floor(Math.random() * 10) + 5
  const speed = Math.random() * 50 + 20
  const randomDelay = Math.random() * 5

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
    animationDuration: `${speed}s`,
    animationDelay: `${randomDelay}s`,
    transform: mouseX.value && mouseY.value ? 
      `translate(${(mouseX.value / window.innerWidth - 0.5) * 20}px, ${(mouseY.value / window.innerHeight - 0.5) * 20}px)` : 
      'none',
    transition: 'transform 0.3s ease-out'
  }
}

// 添加滚动效果
let scrollInterval: number | null = null

onMounted(() => {
  // 每隔一段时间随机改变背景色
  scrollInterval = window.setInterval(() => {
    const container = document.querySelector('.container') as HTMLElement
    if (container) {
      container.style.filter = `hue-rotate(${Math.random() * 360}deg)`
    }
  }, 5000)
})

onUnmounted(() => {
  if (scrollInterval) {
    clearInterval(scrollInterval)
  }
})
</script>

<style scoped>
.container {
  width: 98vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: gradientAnimation 15s ease infinite;
  background-size: 400% 400%;
  position: relative;
  overflow: hidden;
  transition: filter 2s ease;
}

.container:hover {
  filter: brightness(1.1);
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  animation: floatAnimation infinite linear;
}

@keyframes floatAnimation {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  100% {
    transform: translate(100px, -100px) rotate(360deg);
    opacity: 0;
  }
}

/* 确保组件位于粒子上层 */
.container > *:not(.particles) {
  position: relative;
  z-index: 10;
}
</style>
