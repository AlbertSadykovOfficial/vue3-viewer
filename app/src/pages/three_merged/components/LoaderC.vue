<template>
  <div class="loading-overlay">
    <p>Загрузка: {{ progress_formatted }}%</p>
  </div>
</template>
<script>
export default {
  props: {
    progress: {
      type: Number,
      default: false
    }
  },

  computed: {
    progress_formatted() {
      return this.progress.toFixed(0)
    }
  }
}
</script>
<style>
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