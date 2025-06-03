<script setup lang="ts">
import { ref, watch } from 'vue'

const count = ref(0)
const animating = ref(false)

function increase() {
  count.value++
  triggerAnimation()
}

function decrease() {
  count.value--
  triggerAnimation()
}

function triggerAnimation() {
  animating.value = true
  setTimeout(() => {
    animating.value = false
  }, 500) // 动画持续时间调整为500ms，与CSS中的动画时间一致
}
</script>

<template>
  <div class="count-card">
    <h2 class="title">
      Count Component
    </h2>
    <div class="count-display" :class="{ 'animate-count': animating }">
      {{ count }}
    </div>
    <div class="button-group">
      <button class="btn" @click="decrease">
        -
      </button>
      <button class="btn" @click="increase">
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.count-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  width: 300px;
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.count-card:hover {
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
}

.title {
  color: #ff3333;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.count-display {
  font-size: 24px;
  font-weight: bold;
  color: #42b883;
  margin: 20px 0;
  transition: transform 0.3s ease;
  display: inline-block;
}

.animate-count {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #3aa876;
}

.btn:active {
  transform: scale(0.98);
}
</style>
