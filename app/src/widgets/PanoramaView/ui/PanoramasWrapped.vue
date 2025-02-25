<script setup lang="ts">
import styles from "./styles.module.css";
import { useLoading } from '../model/useLoading';
import type { TPanoramaDict } from "../model/types";

import PanoramaComponent from './components/PanoramaComponent/';
import PanoramaLoader from './components/PanoramaLoader/';

defineProps<{ panoramas: TPanoramaDict }>()

const { isLoading, loadingProgress, loadStarted, onTileLoaded, loadingEnded } = useLoading();

</script>

<template>
  <div :class="styles.container">
    <PanoramaComponent
      :panoramas="panoramas"
      @load-started="loadStarted"
      @tile-loaded="onTileLoaded"
      @load-ended="loadingEnded"
    />
    <PanoramaLoader v-show="isLoading" :progress="loadingProgress" />
  </div>
</template>