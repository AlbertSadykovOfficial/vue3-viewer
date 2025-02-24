<template>
  <div ref="container" class="scene-container"></div>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from 'vue';
/* {
  TextureLoader,
  Vector3,
  Texture
  Mesh,
  CircleGeometry,
  MeshBasicMaterial,
  PlaneGeometry,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry
 }
*/
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  props: {
    panoramas: {
      type: Object,
      required: true,
    }
  },

  setup(props, { emit }) {
    // ======================= //
    //          Props          //
    // ======================= //
    /** @type {Array<Object>} Массив Панорам */
    const { panoramas } = props

    // ======================= //
    //        Constants        //
    // ======================= //
    /** @type {number} Индекс X-размерности в panoramas.panorama.XY_TILE_RANGE */
    const X_INDEX = 0

    /** @type {number} Индекс Y-размерности в panoramas.panorama.XY_TILE_RANGE */
    const Y_INDEX = 1

    /** @type {THREE.TextureLoader} Загрузчик текстур */
    const textureLoader = new THREE.TextureLoader();

    /** @type {{value: HTMLElement}} Контейнер для canvas */
    const container = ref(null);

    // ======================= //
    //        Variables        //
    // ======================= //
    /** @type {string} currentPanorama - Ключ Выбранной панормы */
    /** @type {string} Выбранный уровень детализации */
    let currentPanorama, currentTextureLevel;

    let scene, camera, renderer, controls, sphere;

    /** @type {{ three_mesh: THREE.Mesh, nextPanoramaKey: string }} Кнопки навигации */
    const navigationButtons = {}

    /** @type {Map} Хранилище тайлов */
    const tiles = new Map();

    // ======================= //
    //        Functions        //
    // ======================= //
    /**
     * Получение тайла из хранилища
     * Если хранилище пустое, то загрузка
     * @param {Map} tiles - Тайлы
     * @param {string} url - Ссылка на тайл
     * @return {Promise<THREE.Texture>} Текстура тайла
     */
    const loadTile = (tiles, url) => {
      return new Promise((resolve) => {
        if (tiles.has(url)) {
          return resolve(tiles.get(url));
        }
        const texture = textureLoader.load(
          url,
          () => {
            tiles.set(url, texture);
            emit('tile-loaded')
            resolve(texture);
          }
        );
      });
    };

    /**
     * Проверка видимости тайла
     * @param {number} x - Координата X тайла
     * @param {number} y - Координата Y тайла
     * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
     * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
     * @return {boolean} Отображать ли тайл
     */
    const isTileVisible = (x, y, tileXLen, tileYLen) => {
      const k = 1 // Увеличивая коэффициент, область видимости расширяется
      const phi = ((y + k) / tileYLen) * Math.PI;
      const theta = ((x + k) / tileXLen) * 2 * Math.PI;
      const direction = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      return direction.dot(cameraDirection) >= 0
    };

    /**
     * Получить массив тайлов по условию
     * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
     * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
     * @param {Function} conditionF - Условие для записи в список
     * @return {Array<{ x: number, y: number }>} Массив Значений для подгрузк тайлов
     */
    const getTilesByCondition = (tileXLen, tileYLen, conditionF) => {
      const tilesInView = [];
      for (let y = 0; y < tileYLen; y++) {
        for (let x = 0; x < tileXLen; x++) {
          if (conditionF(x, y)) {
            tilesInView.push({ x, y });
          }
        }
      }
      return tilesInView;
    };

    /**
     * Обновить тайлы в области видимости
     * @async
     */
    const updateTiles = async () => {
      const panorama = panoramas[currentPanorama]
      const newLevel = panorama.getLevelByZoomFov(camera.fov);
      const prerender = panorama.PRERENDER?.[newLevel]

      if (newLevel !== currentTextureLevel) {
        currentTextureLevel = newLevel;
      }

      const tileXLen = panorama.XY_TILE_RANGE[currentTextureLevel][X_INDEX]
      const tileYLen = panorama.XY_TILE_RANGE[currentTextureLevel][Y_INDEX]

      let visibleTiles = getTilesByCondition(
        tileXLen,
        tileYLen,
        (x, y) => {
          return prerender || isTileVisible(x, y, tileXLen, tileYLen)
        }
      );

      emit('load-started', visibleTiles.length)

      const textures = await Promise.all(
        visibleTiles.map(({ x, y }) =>
          loadTile(
            tiles,
            `${panorama.tilesPath}${panorama.ZOOM_LEVELS[currentTextureLevel].replace('{x}', x).replace('{y}', y)}`
          )
        )
      );

      mergeTiles(
        textures,
        visibleTiles,
        tileXLen,
        tileYLen
      );

      emit('load-ended')
    };

    /**
     * Создать текстуру из тайлов и обновить рендер
     * @param {Array<THREE.Texture>} textures - Массив текстур
     * @param {Array<{ x: number, y: number }>} tiles - Массив Значений для подгрузк тайлов
     * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
     * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
     */
    const mergeTiles = (textures, tiles, tileXLen, tileYLen) => {
      const tileSize = 256;

      const canvas = document.createElement('canvas');
      canvas.width = tileXLen * 256;
      canvas.height = tileYLen * 256;
      const ctx = canvas.getContext('2d');

      textures.forEach((texture, index) => {
        const { x, y } = tiles[index];
        const img = texture.image;
        ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
      });

      const finalTexture = new THREE.Texture(canvas);
      finalTexture.needsUpdate = true;
      if (sphere) {
        sphere.material.map = finalTexture;
        sphere.material.needsUpdate = true;
      }
    };

    // --- Buttons --- //

    /**
     * Создать Mesh кнопки навигации по координатам
     * @param {{ x: number, y: number, z: number }} - Массив координат
     * @return {THREE.Mesh} Mesh кнопки
     */
    const createNavigationButton = ({ x, y, z }) => {
      const buttonMesh = new THREE.Mesh(
        new THREE.CircleGeometry(1, 32), // buttonGeometry
        new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.5 }) // buttonMaterial
      );
      buttonMesh.position.copy(new THREE.Vector3(x, y, z));
      buttonMesh.lookAt(camera.position);


      const arrowMesh = new THREE.Mesh(
        // arrowGeometry
        new THREE.PlaneGeometry(1, 1),
        //arrowMaterial
        new THREE.MeshBasicMaterial({
          map: textureLoader.load('arrow.png'),
          transparent: true
        })
      );
      arrowMesh.position.set(0, 0, 0.1);
      buttonMesh.add(arrowMesh);
      return buttonMesh;
    };

    /**
     * Создать кнопки навигации панорамы и добавить их на рендер
     */
    const createNavigationButtons = () => {
      for (const i in panoramas[currentPanorama].buttons) {
        navigationButtons[currentPanorama + i] = {
          three_mesh: createNavigationButton(panoramas[currentPanorama].buttons[i].position),
          nextPanoramaKey: panoramas[currentPanorama].buttons[i].nextPanoramaKey
        }
        scene.add(navigationButtons[currentPanorama + i].three_mesh);
      }
    }

    /**
     * Удалить все кнопки навигации с рендера и объекта хранения
     */
    const deleteAllButtons = () => {
      for (const key in navigationButtons) {
        scene.remove(navigationButtons[key].three_mesh)
        delete navigationButtons[key]
      }
    }

    // --- Buttons --- //

    /**
     * Выставить значение fov в исходные параметры
     */
    function cameraToDefault () {
      camera.fov = 75
      camera.updateProjectionMatrix();
    }

    /**
     * Обновить рендер
     */
    const refreshScene = () => {
      deleteAllButtons();
      cameraToDefault();
      updateTiles();
      createNavigationButtons();
    }

    /**
     * Обработать событие нажатия
     * Если нажатие было произведено на кнопку,
     * то перейти на панораму, привязанную к этой кнопке
     * @param {THREE.Raycaster} raycaster
     */
    const processButtonIntersection = (raycaster) => {
      for (const key in navigationButtons) {
        const intersects = raycaster.intersectObject(navigationButtons[key].three_mesh)
        if (intersects.length > 0) {
          currentPanorama = navigationButtons[key].nextPanoramaKey;
          refreshScene()
          return;
        }
      }
    }

    /**
     * Обработать событие нажатия на рендер
     * @param {MouseEvent} event - Событие нажатия
     */
    const onRenderClick = (event) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      processButtonIntersection(raycaster)
    };

    // ======================= //
    //          SETUP          //
    // ======================= //
    /**
     * Метод инициализации панорамы
     */
    const setup = () => {
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

      controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener('change', updateTiles);
      renderer.domElement.addEventListener('click', onRenderClick);

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

      currentPanorama = Object.keys(panoramas)[0]
      currentTextureLevel = panoramas[currentPanorama].getLevelByZoomFov(camera.fov)

      refreshScene();
      animate();
    }

    onMounted(() => {
      setup()
    });

    return { container };
  }
});

</script>

<style>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>