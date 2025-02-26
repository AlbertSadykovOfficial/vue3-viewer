<template>
  <div ref="container" class="scene-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TextureLoader, Vector3 } from '@/shared/lib/three';

import useScene from "./composables/useScene"
import useCamera from "./composables/useCamera"
import useRenderer from "./composables/useRenderer"
import useSphere from "./composables/useSphere";
import useControls from "./composables/useControls"

import useLoadAndRenderTiles from "./composables/useLoadAndRenderTiles"
import useAnimate from "./composables/useAnimate";
import useNavigationButtons from './composables/useNavigationButtons'
import useScrollHandler from "./composables/useScrollHandler"

// ======================= //
//    Types Declaration    //
// ======================= //
import type { TPanoramaDict } from "../../../model/types";


// ======================= //
//           Page          //
// ======================= //
defineOptions({
  name: 'PanoramaComponent',
})

const emit = defineEmits<{
  'load-started': [value: number]
  'tile-loaded': [],
  'load-ended': []
}>()

// ======================= //
//          Props          //
// ======================= //
const { panoramas } = defineProps<{
  /** @type {TPanoramaDict} Объект с панорамами */
  panoramas: TPanoramaDict
}>()


// ======================= //
//      Template Refs      //
// ======================= //
/** @type {{value: HTMLElement}} Контейнер для canvas */
const container = ref<HTMLDivElement>();


// ======================= //
//        Functions        //
// ======================= //

const setup = () => {
  // ======================= //
  //        Variables        //
  // ======================= //
  /** @type {string} currentPanorama - Ключ Выбранной панормы */
  let currentPanorama = Object.keys(panoramas)[0];

  // ======================= //
  //        Constants        //
  // ======================= //
  const DEFAULT_FOV = 75
  const [width, height] = [window.innerWidth, window.innerHeight]
  const ratio = width / height

  /** @type {THREE.TextureLoader} Загрузчик текстур */
  const textureLoader = new TextureLoader();

  const { scene } = useScene();
  const { camera, cameraToDefault } = useCamera(DEFAULT_FOV, ratio, 0.1, 1000);
  const { renderer, pushRenderer } = useRenderer(width, height, { antialias: true });
  const { sphere } = useSphere()

  const { startControlsChangeListener } = useControls(camera, renderer,() => {
    loadAndRenderTiles(panoramas[currentPanorama], camera, sphere)
  })

  const { bindAndLoad, loadAndRenderTiles, bindBackgroundImage } = useLoadAndRenderTiles(textureLoader, {
    onStartLoading:  (total) => typeof total === 'number' && emit('load-started', total),
    onTileLoaded: () => emit('tile-loaded'),
    onFinishLoading: () => emit('load-ended')
  })

  const { animateZoomToPoint } = useAnimate(800, 30)

  const { startButtonClickListener, createNavigationButtons, deleteAllButtons } = useNavigationButtons(scene, camera, renderer, textureLoader, (button) => {
    /**
     * Чтоб не ждать завершения анимации
     * Подгружаем [в кэш]! тайлы панорамы на которую переходим
     * (Но не рендерим)
     */
    bindAndLoad(panoramas[button.nextPanoramaKey], camera)
    /**
     * Также подгружаем задний фон для следующей панорамы
     */
    bindBackgroundImage(panoramas[button.nextPanoramaKey])

    /**
     * Производим анимацию зума к точке
     * После чего меняем текущую панораму
     * Затем ререндерим
     */
    const { x, y, z } = button.position
    const nextPanoramaKey = button.nextPanoramaKey
    deleteAllButtons();
    animateZoomToPoint(camera, new Vector3(x, y, z), () => {
      renderer.domElement.style.transition = "opacity 0.3s";
      renderer.domElement.style.opacity = "0";

      /**
       * Откладываем смену панорамы на время анимации (transition opacity),
       * чтобы не было мерцания
       * Затем ререндерим
       */
      setTimeout(async () => {
        currentPanorama = nextPanoramaKey;
        await refreshScene();
        // Показываем панораму после обновления рендера
        renderer.domElement.style.opacity = "1";
      }, 300);
    });
  })

  const { startScrollListener } = useScrollHandler(camera, renderer, () => {
    loadAndRenderTiles(panoramas[currentPanorama], camera, sphere)
  })

  /**
   * Обновление рендера
   * Удаляем все кнопки панорамы
   * Устанавливаем дефолтные значения камеры
   * Подгружаем и рендерим тайлы в области видимости
   * Создаем кнопки для этой панорамы
   */
  const refreshScene = async () => {
    deleteAllButtons();
    cameraToDefault(camera);
    await loadAndRenderTiles(panoramas[currentPanorama], camera, sphere);
    createNavigationButtons(panoramas[currentPanorama].buttons, camera);
  }

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  if (container.value instanceof HTMLDivElement) {
    // Поместить рендер в контейнер шаблона
    pushRenderer(container.value, renderer)
  }

  // Добавить на сцену сферическое представление
  scene.add(sphere);

  // Начинаем отслеживать действия с элементом управления
  startControlsChangeListener()

  // Начинаем отслеживать нажатие на кнопку
  startButtonClickListener()

  // Начинаем отслеживать скролл
  startScrollListener()

  // Устанавливаем задний фон 
  bindBackgroundImage(panoramas[currentPanorama])

  // Обновляем состояние сцены
  refreshScene();

  // Начинаем отрисовку
  animate();
}


// ======================= //
//         Events          //
// ======================= //

onMounted(() => {
  if (container.value instanceof HTMLDivElement) {
    setup()
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
