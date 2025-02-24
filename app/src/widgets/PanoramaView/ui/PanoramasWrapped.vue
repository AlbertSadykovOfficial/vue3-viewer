<script setup>
import styles from "./styles.module.css";
import { useLoading } from '../model/useLoading';
import PanoramaComponent from './components/PanoramaComponent/';
import PanoramaLoader from './components/PanoramaLoader/';

defineProps({
  panoramas: {
    type: Object,
    required: true
  }
})

const { isLoading, loadingProgress, loadStarted, onTileLoaded, loadingEnded } = useLoading();

</script>

<template>
  <div :class="styles.container">
    <PanoramaComponent
      :panoramas="panoramas"
      @load-started="total_tiles => loadStarted(total_tiles)"
      @tile-loaded="onTileLoaded"
      @load-ended="loadingEnded"
    />
    <PanoramaLoader v-show="isLoading" :progress="loadingProgress" />
  </div>
</template>