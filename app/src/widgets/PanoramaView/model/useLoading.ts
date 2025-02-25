import { ref } from 'vue';

export function useLoading() {
  const isLoading = ref(false);
  const loadingProgress = ref(0);

  let firstLoading = true;
  let totalTiles = 0;
  let loadedTiles = 0;
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null

  function loadStarted(total: number) {
    totalTiles = total;
    loadedTiles = 0;
    if (firstLoading) {
      firstLoading = false
      isLoading.value = true;
    } else {
      if (typeof loadingTimeout === 'number') {
        clearTimeout(loadingTimeout)
      }
      loadingTimeout = setTimeout(() => {
        isLoading.value = true;
        loadingTimeout = null;
      }, 1000)
    }
    loadingProgress.value = 0
  }

  function onTileLoaded() {
    loadedTiles++;
    loadingProgress.value = totalTiles > 0 ? (loadedTiles / totalTiles) * 100 : 0
  }

  function loadingEnded() {
    isLoading.value = false;
    if (typeof loadingTimeout === 'number') {
      window.clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
  }

  return { isLoading, loadingProgress, loadStarted, onTileLoaded, loadingEnded };
}