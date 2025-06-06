<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const message = 'hello world'
const age = ref(20)
</script>

<template>
  <div>
    <Child />
    {{ age }}
    {{ message }}
  </div>
</template>

<style scoped>

</style>
