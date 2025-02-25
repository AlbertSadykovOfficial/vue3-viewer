<template>
  <div class="loading-overlay">
    <p>Загрузка: {{ progressFormatted }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

// ======================= //
//          Props          //
// ======================= //
const props = withDefaults(defineProps<{ progress: number }>(), {
  progress: 0,
})

// ======================= //
//        Variables        //
// ======================= //
const progressFormatted = computed(() => `${Math.round(props.progress)}%`);
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
}
</style>