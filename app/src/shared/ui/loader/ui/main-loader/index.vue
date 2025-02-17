<template>
  <teleport to="body">
    <div class="loader-component">
      Loading...
    </div>
  </teleport>
</template>
<script setup lang="ts">
</script>
<style>
.loader-component {
  min-width: 100vw;
  min-height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
</style>
