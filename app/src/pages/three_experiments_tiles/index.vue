<template>
  <div style="position: fixed; left: 0px; top: 0px">
    <div ref="container" class="scene-container"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  setup() {
    const container = ref(null);
    let scene, camera, renderer, controls;
    let textureLoader = new THREE.TextureLoader();
    let sphere;
    const zoomLevels = [
      '/panorama_tiles/low/{x}_{y}.jpg',
      '/panorama_tiles/medium/{x}_{y}.jpg',
      '/panorama_tiles/high/{x}_{y}.jpg'
    ];
    let currentTextureLevel = 0;
    const tiles = new Map();

    const getZoomLevel = (distance) => {
      if (distance > 2) return 0;
      if (distance > 1.5) return 1;
      return 2;
    };

    const loadTile = (x, y, level) => {
      const tileKey = `${x}_${y}_${level}`;
      if (tiles.has(tileKey)) return tiles.get(tileKey);

      const texture = textureLoader.load(zoomLevels[level].replace('{x}', x).replace('{y}', y));
      tiles.set(tileKey, texture);
      return texture;
    };

    const updateTiles = async () => {
      const distance = camera.position.length();
      const newLevel = getZoomLevel(distance);
      if (newLevel !== currentTextureLevel) {
        currentTextureLevel = newLevel;
      }

      const visibleTiles = getVisibleTiles(currentTextureLevel);
      const texture = await mergeTiles(visibleTiles, currentTextureLevel);
      sphere.material.map = texture;
      sphere.material.needsUpdate = true;
    };

    const getVisibleTiles = (level) => {
      const tilesInView = [];
      const segments = level === 0 ? 2 : level === 1 ? 4 : 8;
      for (let y = 0; y < segments / 2; y++) {
        for (let x = 0; x < segments; x++) {
          tilesInView.push({ x, y });
        }
      }
      return tilesInView;
    };

    const mergeTiles = (tiles, level) => {
      return new Promise((resolve) => {
        const canvasSize = level === 0 ? 512 : level === 1 ? 1024 : 2048;
        const tileSize = 256;
        const tilesPerRow = canvasSize / tileSize;

        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize / 2;
        const ctx = canvas.getContext('2d');

        let loadedCount = 0;
        const totalTiles = tiles.length;

        tiles.forEach(({ x, y }) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = zoomLevels[level].replace('{x}', x).replace('{y}', y);

          img.onload = () => {
            ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
            loadedCount++;
            if (loadedCount === totalTiles) {
              const texture = new THREE.Texture(canvas);
              texture.needsUpdate = true;
              resolve(texture);
            }
          };

          img.onerror = () => {
            console.error(`Ошибка загрузки тайла: ${img.src}`);
            loadedCount++;
            if (loadedCount === totalTiles) {
              const texture = new THREE.Texture(canvas);
              texture.needsUpdate = true;
              resolve(texture);
            }
          };
        });
      });
    };

    onMounted(() => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 2);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.value.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      mergeTiles(getVisibleTiles(currentTextureLevel), currentTextureLevel).then((texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
      });

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.minDistance = 1;
      controls.maxDistance = 3;
      controls.addEventListener('change', updateTiles);

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    });

    return { container };
  },
});

</script>

<style>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>