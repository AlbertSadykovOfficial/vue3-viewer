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
    let currentTextureLevel = 1;
    const tiles = new Map();

    const getZoomLevel = (fov) => {
      if (fov > 70) return 0;
      if (fov > 50) return 1;
      return 2;
    };

    const isTileVisible = (x, y, level) => {
      const segments = level === 0 ? 2 : level === 1 ? 4 : 8;
      const phi = ((y + 0.5) / (segments / 2)) * Math.PI;
      const theta = ((x + 0.5) / segments) * 2 * Math.PI;
      const direction = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      return direction.dot(cameraDirection) > 0.2;
    };

    const loadTile = (x, y, level) => {
      const tileKey = `${x}_${y}_${level}`;
      if (tiles.has(tileKey)) return tiles.get(tileKey);

      const texture = textureLoader.load(zoomLevels[level].replace('{x}', x).replace('{y}', y));
      tiles.set(tileKey, texture);
      return texture;
    };

    const updateTiles = async () => {
      const newLevel = getZoomLevel(camera.fov);
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
      for (let y = -1; y <= segments / 2; y++) {
        for (let x = -1; x <= segments; x++) {
          if (isTileVisible(x, y, level)) {
            tilesInView.push({ x: Math.max(0, x), y: Math.max(0, y) });
          }
        }
      }
      return tilesInView;
    };

    const mergeTiles = (tiles, level) => {
      return new Promise((resolve) => {
        const canvasSize = level === 0 ? 512 : level === 1 ? 1024 : 2048;
        const tileSize = 256;

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