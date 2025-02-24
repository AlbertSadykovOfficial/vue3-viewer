<template>
  <div style="position: fixed; left: 0; top: 0">
    <div ref="pano" class="pano-viewer"></div>
  </div>
</template>
<script>
import { createApp, onMounted, ref } from 'vue';
import Marzipano from 'marzipano';

export default {
  setup() {
    const pano = ref(null);

    onMounted(() => {
      const viewer = new Marzipano.Viewer(pano.value);

      const levels = [
        { tileSize: 512, size: 512 },
        { tileSize: 512, size: 1024 }
      ];

      const geometry = new Marzipano.CubeGeometry(levels);

      /*
      const tileSource = new Marzipano.ImageUrlSource((tile, done) => {
        const url = `output_tiles_2/${tile.z}/${tile.f}/${tile.y}/${tile.x}.jpg`;
        Marzipano.ImageUrlSource.loadAsset(url, (err, img) => {
          if (err) {
            console.error("Error loading tile:", url, err);
            return done(err);
          }
          done(null, img);
        });
      });
      const tileSource = Marzipano.ImageUrlSource.fromTileUrl(
        (tile) => `output_tiles/${tile.z}/${tile.f}/${tile.y}/${tile.x}.jpg`
      );

      const tileSource = new Marzipano.CubeTileSource({
        basePath: "output_tiles_2",
        getTileUrl: (level, face, x, y) => `output_tiles_2/${level}/${face}/${y}/${x}.jpg`,
        tileSize: 512,
        maxLevel: 4,
      });

      const tileSource = Marzipano.ImageUrlSource.fromUrl(
        (tile) => `output_tiles/${tile.z}/${tile.f}/${tile.y}/${tile.x}.jpg`
      );

      const tileSource = new Marzipano.ImageUrlSource(
        function(tile) {
          return `output_tiles_2/${tile.z}/${tile.f}/${tile.y}_${tile.x}.jpg`;
        }
      );
      */

      const tileSource = Marzipano.ImageUrlSource.fromString(
        'http://localhost:8000/1/{z}/{f}/{y}_{x}.jpg'
        // { cubeMapPreviewUrl: "output_tiles/preview.jpg" }
      );


      // const limiter = Marzipano.RectilinearView.limit.traditional(8192, 100 * Math.PI / 180);
      const limiter = Marzipano.RectilinearView.limit.traditional(8192, Math.PI);
      const view = new Marzipano.RectilinearView({ yaw: 0, pitch: 0, fov: Math.PI / 2 }, limiter);


      const scene = viewer.createScene({ source: tileSource, geometry, view });
      scene.switchTo({
        transitionDuration: 1000
      });
    });

    return { pano };
  }
}
</script>
<style>
.pano-viewer {
  width: 100vw;
  height: 100vh;
}
</style>