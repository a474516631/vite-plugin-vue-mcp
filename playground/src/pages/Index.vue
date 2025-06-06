<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NumberCount from '../components/NumberCount.vue'
import UserInfo from '../components/UserInfo.vue'

// 鼠标位置状态
const mouseX = ref(0)
const mouseY = ref(0)

// 处理鼠标移动事件
function handleMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 为粒子生成样式
function getParticleStyle(_index: number) {
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
    transform: mouseX.value && mouseY.value
      ? `translate(${(mouseX.value / window.innerWidth - 0.5) * 20}px, ${(mouseY.value / window.innerHeight - 0.5) * 20}px)`
      : 'none',
    transition: 'transform 0.3s ease-out',
  }
}

// 添加滚动效果
onMounted(() => {
  // 每隔一段时间随机改变背景色

})
</script>

<template>
  <div
    class="container"
    @mousemove="handleMouseMove"
  >
    <UserInfo />
    <NumberCount />
    <div class="particles">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 98vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  position: relative;
  overflow: hidden;
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
  background-color: white;
}

.particle {
  display: none;
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
