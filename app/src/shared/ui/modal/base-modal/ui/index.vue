<template>
  <div
    v-show="visible"
  >
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  visible: boolean;
}>();

const visible = ref(props.visible);
</script>