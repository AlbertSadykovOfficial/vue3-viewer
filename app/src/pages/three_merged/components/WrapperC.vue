<template>

</template>
<script>
const panoramas = {
  panorama1: {
    tilesPath: '/merged/panorama1',
    buttons: [{
      position: {
        x: 20,
        y: -8,
        z: 0
      },
      nextPanorama: 'panorama2',
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
  },
  panorama2: {
    tilesPath: '/panorama_tiles/',
    buttons: [{
      position: {
        x: 20,
        y: -5,
        z: -8
      },
      nextPanorama: 'panorama1',
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
</script>