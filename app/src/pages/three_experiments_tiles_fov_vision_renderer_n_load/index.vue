<template>
  <div style="position: fixed; left: 0px; top: 0px">
    <div ref="container" class="scene-container"></div>
    <div v-show="isLoading" class="loading-overlay">
      <p>Загрузка: {{ loadingProgress.toFixed(0) }}%</p>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  setup() {
    const SEGMENTS_DEEP = [4, 8, 16]
    const container = ref(null);

    const loadingProgress = ref(0);
    const isLoading = ref(true);
    const isLoadingTimeout = ref(null)
    let totalTiles = 0;
    let loadedTiles = 0;

    let scene, camera, renderer, controls;
    let textureLoader = new THREE.TextureLoader();
    let sphere;
    const zoomLevels = [
      '/quality/panorama1/low/{x}_{y}.png',
      '/quality/panorama1/medium/{x}_{y}.png',
      '/quality/panorama1/high/{x}_{y}.png'
    ];
    let currentTextureLevel = 0;
    const tiles = new Map();

    const getZoomLevel = (fov) => {
      if (fov > 70) return 0;
      if (fov > 50) return 1;
      return 2;
    };

    const isTileVisible = (x, y, level) => {
      const segments = SEGMENTS_DEEP[level];

      const phi = ((y + 0.5) / (segments / 2)) * Math.PI;
      const theta = ((x + 0.5) / segments) * 2 * Math.PI;
      const direction = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      return direction.dot(cameraDirection) > 0.01; // Увеличена область рендера
    };

    const loadTile = (x, y, level) => {
      return new Promise((resolve) => {
        const tileKey = `${x}_${y}_${level}`;
        if (tiles.has(tileKey)) return resolve(tiles.get(tileKey));

        const texture = textureLoader.load(
          zoomLevels[level].replace('{x}', x).replace('{y}', y),
          () => {
            tiles.set(tileKey, texture);
            loadedTiles++;
            loadingProgress.value = (loadedTiles / totalTiles) * 100;
            resolve(texture);
          }
        );
      });
    };

    function loadingTimeoutBind (totalVisibleTiles) {
      // В рендеринге ничего нет (Первая загрузка)
      if (tiles.size === 0) {
        isLoading.value = true;
      } else {
        if (isLoadingTimeout.value) {
          clearTimeout(isLoadingTimeout.value)
        }
        isLoadingTimeout.value = setTimeout(() => {
          isLoading.value = true;
        }, 500)
      }
      loadingProgress.value = 0;
      loadedTiles = 0;
      totalTiles = totalVisibleTiles;
    }
    function loadingTimeoutClear () {
      if (isLoadingTimeout.value) {
        clearTimeout(isLoadingTimeout.value)
        isLoadingTimeout.value = null
      }
      isLoading.value = false
    }

    const updateTiles = async () => {
      const newLevel = getZoomLevel(camera.fov);

      if (newLevel !== currentTextureLevel) {
        currentTextureLevel = newLevel;
      }

      let visibleTiles
      if (currentTextureLevel === 0 && false) {
        visibleTiles = [
          { x: 0, y: 0 },
          { x: 1, y: 0 }
        ];
      } else {
        visibleTiles = getVisibleTiles(currentTextureLevel);
      }

      loadingTimeoutBind(visibleTiles.length)

      const textures = await Promise.all(
        visibleTiles.map(({ x, y }) => loadTile(x, y, currentTextureLevel))
      );

      mergeTiles(textures, visibleTiles, currentTextureLevel);
      loadingTimeoutClear()
    };

    const getVisibleTiles = (level) => {
      const tilesInView = [];
      const segments = SEGMENTS_DEEP[level];
      for (let y = -1; y < segments / 2 + 1; y++) { // Увеличили границы
        for (let x = -1; x < segments + 1; x++) {
          if (x >= 0 && y >= 0 && x < segments && y < segments / 2 && isTileVisible(x, y, level)) {
            tilesInView.push({ x, y });
          }
        }
      }
      return tilesInView;
    };

    const mergeTiles = (textures, tiles, level) => {
      const canvasSize = SEGMENTS_DEEP[level] * 256;
      const tileSize = 256;

      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize / 2;
      const ctx = canvas.getContext('2d');

      textures.forEach((texture, index) => {
        const { x, y } = tiles[index];
        const img = texture.image;
        if (img) {
          ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
        }
      });

      const finalTexture = new THREE.Texture(canvas);
      finalTexture.needsUpdate = true;
      if (sphere) {
        sphere.material.map = finalTexture;
        sphere.material.needsUpdate = true;
      }
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

      const material = new THREE.MeshBasicMaterial({ map: new THREE.Texture() });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      updateTiles();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.minDistance = 1;
      controls.maxDistance = 3;
      controls.addEventListener('change', updateTiles);

      renderer.domElement.addEventListener('wheel', (event) => {
        camera.fov += event.deltaY * 0.05;
        camera.fov = Math.max(30, Math.min(90, camera.fov));
        camera.updateProjectionMatrix();
        updateTiles();
      });

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    });

    return { container, loadingProgress, isLoading };
  },
});

</script>

<style>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
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