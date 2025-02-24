<template>
  <div style="position: fixed; left: 0; top: 0">
    <div ref="container"></div>
  </div>
</template>
<script>
import { createApp, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  setup() {
    const container = ref(null);
    const navigationPoints = [
      { position: new THREE.Vector3(0, 0, 0.1), texture: ['tile1.jpg', 'tile2.jpg', 'tile3.jpg', 'tile4.jpg', 'tile5.jpg', 'tile6.jpg'] },
      { position: new THREE.Vector3(10, 0, 0.1), texture: ['tile7.jpg', 'tile8.jpg', 'tile9.jpg', 'tile10.jpg', 'tile11.jpg', 'tile12.jpg'] }
    ];
    let currentPointIndex = 0;

    onMounted(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.value.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;

      const geometry = new THREE.SphereGeometry(500, 60, 40);
      let materials = [];
      const loader = new THREE.TextureLoader();
      let sphere;

      function loadPanorama(index) {
        materials = [];
        navigationPoints[index].texture.forEach((tile, i) => {
          loader.load(tile, (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            materials[i] = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

            if (materials.length === navigationPoints[index].texture.length) {
              if (sphere) {
                scene.remove(sphere);
              }
              sphere = new THREE.Mesh(geometry, materials);
              scene.add(sphere);
            }
          });
        });
      }

      function moveToNextPoint() {
        currentPointIndex = (currentPointIndex + 1) % navigationPoints.length;
        camera.position.copy(navigationPoints[currentPointIndex].position);
        loadPanorama(currentPointIndex);
      }

      loadPanorama(currentPointIndex);
      camera.position.copy(navigationPoints[currentPointIndex].position);

      document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
          moveToNextPoint();
        }
      });

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    });

    return { container };
  }
};
</script>