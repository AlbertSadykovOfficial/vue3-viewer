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
      '/levels/low.jpg',
      '/levels/medium.jpg',
      '/levels/high.jpg'
    ];

    let currentTextureLevel = 1;

    const getZoomLevel = (distance) => {
      if (distance > 2.5) return 0;
      if (distance > 1.5) return 1;
      return 2;
    };

    const loadTexture = (url) => {
      return textureLoader.load(url);
    };

    const updateTexture = () => {
      const distance = camera.position.length();
      const newLevel = getZoomLevel(distance);
      if (newLevel !== currentTextureLevel) {
        currentTextureLevel = newLevel;
        const texture = loadTexture(zoomLevels[currentTextureLevel]);
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;
      }
    };

    const updateCameraPosition = () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.normalize();
      const distance = camera.position.length();
      const zoomFactor = (distance - 1.5) * 0.05;
      camera.position.addScaledVector(direction, zoomFactor);
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
      const material = new THREE.MeshBasicMaterial({
        map: loadTexture(zoomLevels[currentTextureLevel]),
      });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.minDistance = 1;
      controls.maxDistance = 3;
      controls.addEventListener('change', () => {
        updateTexture();
        updateCameraPosition();
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