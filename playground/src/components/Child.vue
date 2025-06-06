<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const count = ref(10)
const doubleCount = computed(() => count.value * 2)
const info = reactive({
  name: 'John',
  age: 20,
  address: '123 Main St',
})
</script>

<template>
  <div>
    {{ count }}
    {{ doubleCount }}
    {{ info.name }}
    {{ info.age }}
    {{ info.address }}
  </div>
</template>

<style scoped>

</style>
