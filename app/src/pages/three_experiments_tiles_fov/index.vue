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
    // ======================= //
    //        Variables        //
    // ======================= //
    /** Уровни текстур */
    const TEXTURE_LEVEL = Object.freeze({
      LOW:   0,
      MEDIUM:  1,
      HIGH: 2
    });

    /** Хранилище тайлов */
    const container = ref(null);
    let scene, camera, renderer, controls, sphere;
    /**
     * Исходные данные: 2 тайла,
     * Далее каждый последующий уровень бьется на еще 4
     * @example
     * Уровень LOW: 2
     * Уровень MEDIUM: 8
     * Уровень HIGH: 32
     */
    const zoomLevels = [
      '/panorama_tiles/low/{x}_{y}.jpg',
      '/panorama_tiles/medium/{x}_{y}.jpg',
      '/panorama_tiles/high/{x}_{y}.jpg'
    ];

    /** Уровень качества текстур */
    let currentTextureLevel = TEXTURE_LEVEL.LOW;

    /** Хранилище тайлов */
    const tiles = new Map();

    /** Загрузчик текстур */
    let textureLoader = new THREE.TextureLoader();


    // ======================= //
    //        Functions        //
    // ======================= //
    /**
     * Определяет уровень детализации текстур на основе угла обзора камеры (FOV).
     * @param {number} fov - Угол обзора камеры.
     * @returns {number} Индекс уровня детализации.
     */
    const getZoomLevel = (fov) => (fov > 70 ? TEXTURE_LEVEL.LOW : fov > 50 ? TEXTURE_LEVEL.MEDIUM : TEXTURE_LEVEL.HIGH);

    /**
     * Загружает текстуру тайла по его координатам x, y и уровню детализации.
     * @param {number} x - Координата x тайла.
     * @param {number} y - Координата y тайла.
     * @param {number} level - Уровень детализации.
     * @returns {THREE.Texture} Загруженная текстура.
     */
    const loadTile = (x, y, level) => {
      const tileKey = `${x}_${y}_${level}`;
      if (tiles.has(tileKey)) return tiles.get(tileKey);

      const texture = textureLoader.load(zoomLevels[level].replace('{x}', x).replace('{y}', y));
      tiles.set(tileKey, texture);
      return texture;
    };

    /**
     * Обновляет текстуру сферы в зависимости от текущего уровня детализации и видимых тайлов.
     */
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

    /**
     * Возвращает список видимых тайлов для заданного уровня детализации.
     * @param {number} level - Уровень детализации.
     * @returns {Array<{x: number, y: number}>} Массив координат видимых тайлов.
     */
    const getVisibleTiles = (level) => {
      let segments
      const tilesInView = [];
      if (level === TEXTURE_LEVEL.LOW) {
        segments = 2
      } else if (level === TEXTURE_LEVEL.MEDIUM){
        segments = 4
      } else if (TEXTURE_LEVEL.HIGH){
        segments = 8
      }

      for (let y = 0; y < segments / 2; y++) {
        for (let x = 0; x < segments; x++) {
          tilesInView.push({ x, y });
        }
      }

      return tilesInView;
    };

    /**
     * Объединяет видимые тайлы в единую текстуру.
     * @param {Array<{x: number, y: number}>} tiles - Список видимых тайлов.
     * @param {number} level - Уровень детализации.
     * @returns {Promise<THREE.Texture>} Объединённая текстура.
     */
    const mergeTiles = (tiles, level) => {
      return new Promise((resolve) => {
        const canvasSize = [512, 1024, 2048][level];
        const tileSize = 256;

        const canvas = Object.assign(document.createElement('canvas'), {
          width: canvasSize,
          height: canvasSize / 2
        });

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

    // ======================= //
    //     SETUP FUNCTIONS     //
    // ======================= //
    const createMouseWheelListeners = () => {
      renderer.domElement.addEventListener('wheel', (event) => {
        camera.fov += event.deltaY * 0.05;
        camera.fov = Math.max(30, Math.min(90, camera.fov));
        camera.updateProjectionMatrix();
        updateTiles();
      });
    }

    const createAndSetupControls = (camera, renderer) => {
      controls = new OrbitControls(camera, renderer.domElement);
      Object.assign(controls, { enableZoom: true, minDistance: 1, maxDistance: 3 });
      controls.addEventListener('change', updateTiles);
      return controls
    }

    const createAndSetupGeometry = () => {
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      mergeTiles(getVisibleTiles(currentTextureLevel), currentTextureLevel).then((texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
      });
      return geometry
    }

    const createAndSetupRenderer = () => {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.value.appendChild(renderer.domElement);
    }

    const createAndSetupCamera = () => {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 2);
    }

    const createAndSetupScene = () => {
      scene = new THREE.Scene();
      return scene
    }

    const runAnimate = () => {
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    }

    // ======================= //
    //          SETUP          //
    // ======================= //

    onMounted(() => {
      createAndSetupScene()
      createAndSetupCamera()
      createAndSetupRenderer()
      createAndSetupGeometry()
      createAndSetupControls(camera, renderer)
      createMouseWheelListeners()
      runAnimate()
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