<template>
  <div style="position: fixed; left: 0px; top: 0px">
    <PanoramaComponent
      :panoramas="panoramas"
      @load-started="total_tiles => loadStarted(total_tiles)"
      @tile-loaded="() => onTileLoaded()"
      @load-ended="() => loadingTimeoutClear()"
    />
    <Loader
      v-show="isLoading"
      :progress="loadingProgress"
    />
  </div>
</template>
<script>
import Loader from './components/LoaderC.vue'
import PanoramaComponent from './components/PanoramaComponent.vue'
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    Loader,
    PanoramaComponent
  },
  setup() {
    const panoramas = {
      panorama1: {
        tilesPath: '/merged/panorama3/',
        buttons: [{
          position: {
            x: 20,
            y: -8,
            z: 0
          },
          nextPanoramaKey: 'panorama2',
        }],
        LEVELS: {
          low: 'low',
          medium: 'medium',
          high: 'high'
        },
        PRERENDER: {
          low: true
        },
        XY_TILE_RANGE: {
          low: [2, 1],
          medium: [4, 2],
          high: [8, 4]
        },
        ZOOM_LEVELS: {
          low: '/low/{x}_{y}.jpg',
          medium: '/medium/{x}_{y}.jpg',
          high: '/high/{x}_{y}.jpg'
        },
        getLevelByZoomFov: (fov) => {
          if (fov > 70) return 'low';
          if (fov > 50) return 'medium';
          return 'high';
        }
      },
      panorama2: {
        tilesPath: '/merged/panorama2',
        buttons: [{
          position: {
            x: 20,
            y: -5,
            z: -8
          },
          nextPanoramaKey: 'panorama1',
        }],
        LEVELS: {
          low: 'low',
          medium: 'medium',
          high: 'high'
        },
        PRERENDER: {
          low: true
        },
        XY_TILE_RANGE: {
          low: [4, 2],
          medium: [8, 4],
          high: [16, 8]
        },
        ZOOM_LEVELS: {
          low: '/low/{x}_{y}.png',
          medium: '/medium/{x}_{y}.png',
          high: '/high/{x}_{y}.png'
        },
        getLevelByZoomFov: (fov) => {
          if (fov > 70) return 'low';
          if (fov > 50) return 'medium';
          return 'high';
        }
      }
    };

    // ----------------------- //
    /*
    * Локальные переменные (Замыкания)
    */
    let firstLoad = true
    let totalTiles = 0;
    let loadedTiles = 0;
    let isLoadingTimeout = null;

    const loadingProgress = ref(0);
    const isLoading = ref(true);

    const loadStarted = (totalVisibleTiles) => {
      loadingProgress.value = 0;
      loadedTiles = 0;
      totalTiles = totalVisibleTiles;

      // В рендеринге ничего нет (Первая загрузка)
      if (firstLoad) {
        isLoading.value = true;
        firstLoad = false
      } else {
        if (isLoadingTimeout) {
          clearTimeout(isLoadingTimeout)
        }
        isLoadingTimeout = setTimeout(() => {
          isLoading.value = true;
        }, 500)
      }
    }

    const loadingTimeoutClear = () => {
      if (isLoadingTimeout) {
        clearTimeout(isLoadingTimeout)
        isLoadingTimeout = null
      }
      isLoading.value = false
    }

    const onTileLoaded = () => {
      // Меняем переменную только при индикации загрузки (а она не всегда отображается)
      // Так как loadingProgress используется в шаблоне
      // И ее изменение будет вызывать ререндер
      loadedTiles++
      if (isLoading.value) {
        loadingProgress.value = ((loadedTiles / totalTiles) * 100)
      }
    }

    return { panoramas, isLoading, loadingProgress, loadStarted, loadingTimeoutClear, onTileLoaded };
  }
});
</script>