<template>
  <div style="position: fixed; left: 0px; top: 0px">
    <div ref="sceneContainer" class="scene-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  setup() {
    const sceneContainer = ref(null);
    let scene, camera, renderer, controls;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 0.1);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      sceneContainer.value.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;

      loadTiledTextures();
      animate();
    };

    const loadTiledTextures = async () => {
      const tileCountX = 4;
      const tileCountY = 2;
      const tileSize = 512; // Предполагаемый размер каждого тайла
      const loader = new THREE.TextureLoader();

      // Создаем canvas для объединения тайлов
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = tileCountX * tileSize;
      canvas.height = tileCountY * tileSize;

      // Загружаем тайлы и рисуем их на canvas
      for (let y = 0; y < tileCountY; y++) {
        for (let x = 0; x < tileCountX; x++) {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = `tiles/tile_${x}_${y}.jpg`;
            img.onload = () => {
              ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
              resolve();
            };
          });
        }
      }

      // Преобразуем canvas в текстуру
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;

      // Создаем сферу
      const radius = 500;
      const geometry = new THREE.SphereGeometry(radius, 64, 32);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    onMounted(() => {
      init();
      window.addEventListener('resize', onResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
    });

    return { sceneContainer };
  }
};
</script>

<style>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
