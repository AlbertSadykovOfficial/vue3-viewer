<template>
  <div ref="container" class="scene-container"></div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { TextureLoader, Vector3 } from '@/shared/lib/three';

import useNavigationButtons from './hooks/useNavigationButtons'
import useScrollHandler from "./hooks/useScrollHandler"
import useControls from "./hooks/useControls"
import useSphere from "./hooks/useSphere";
import useScene from "./hooks/useScene"
import useCamera from "./hooks/useCamera"
import useRenderer from "./hooks/useRenderer"
import useLoadAndRenderTiles from "./hooks/useLoadAndRenderTiles"
import useAnimate from "./hooks/useAnimate";

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
    /** @type {Object} Объект с панорамами */
    const { panoramas } = props

    // ======================= //
    //        Constants        //
    // ======================= //

    /** @type {{value: HTMLElement}} Контейнер для canvas */
    const container = ref(null);

    // ======================= //
    //          SETUP          //
    // ======================= //
    /**
     * Метод инициализации панорамы
     */
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

      const { bindAndLoad, loadAndRenderTiles } = useLoadAndRenderTiles(emit, textureLoader)
      const { animateZoomToPoint } = useAnimate(800, 30)

      const { startButtonClickListener, createNavigationButtons, deleteAllButtons } = useNavigationButtons(scene, camera, renderer, textureLoader,(button) => {
        /**
         * Чтоб не ждать завершения анимации
         * Подгружаем в кэш тайлы панорамы на которую переходим
         * (Но не рендерим)
         */
        bindAndLoad(panoramas[button.nextPanoramaKey], camera)

        /**
         * Производим анимацию зума к точке
         * После чего меняем текущую панораму
         * Затем ререндерим
         */
        const { x, y, z } = button.position
        animateZoomToPoint(camera, new Vector3(x, y, z), () => {
          currentPanorama = button.nextPanoramaKey;
          refreshScene();
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
      const refreshScene = () => {
        deleteAllButtons();
        cameraToDefault(camera);
        loadAndRenderTiles(panoramas[currentPanorama], camera, sphere);
        createNavigationButtons(panoramas[currentPanorama].buttons, camera);
      }

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      // Поместить рендер в контейнер шаблона
      pushRenderer(container.value, renderer)

      // Добавить на сцену сферическое представление
      scene.add(sphere);

      // Начинаем отслеживать действия с элементом управления
      startControlsChangeListener()

      // Начинаем отслеживать нажатие на кнопку
      startButtonClickListener()

      // Начинаем отслеживать скролл
      startScrollListener()


      // Обновляем состояние сцены
      refreshScene();

      // Начинаем отрисовку
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
