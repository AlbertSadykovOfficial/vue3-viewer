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
  setup () {
    const container = ref(null);
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

       // Загрузка панорамной текстуры
       const loader = new THREE.TextureLoader();
       loader.load('/img.jpg', (texture) => {
         const geometry = new THREE.SphereGeometry(500, 60, 40);
         texture.wrapS = THREE.RepeatWrapping;
         texture.wrapT = THREE.RepeatWrapping;
         const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
         const sphere = new THREE.Mesh(geometry, material);
         scene.add(sphere);
       });

       camera.position.set(0, 0, 0.1);

       function animate() {
         requestAnimationFrame(animate);
         controls.update();
         renderer.render(scene, camera);
       }
       animate();
     });
    return {
      container
    }
  }
}
</script>