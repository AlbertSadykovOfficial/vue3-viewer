import { Raycaster, Vector2 } from '@/shared/lib/three';
import useCreateNavigationButton from './useCreateNavigationButton'

export default function useNavigationButtons(scene, camera, renderer, textureLoader, callback: () => {}) {
  /** @type {{ three_mesh: THREE.Mesh, nextPanoramaKey: string }} Кнопки навигации */
  const navigationButtons = {}
  const { createNavigationButton } = useCreateNavigationButton(textureLoader)

  /**
   * Создать кнопки навигации панорамы и добавить их на рендер
   */
  const createNavigationButtons = (buttons, camera) => {
    for (const i in buttons) {
      const button = createNavigationButton(camera, buttons[i].position)
      navigationButtons[button.uuid] = {
        three_mesh: button,
        nextPanoramaKey: buttons[i].nextPanoramaKey,
        position: buttons[i].position,
      }
      scene.add(navigationButtons[button.uuid].three_mesh);
    }
  }

  /**
   * Удалить все кнопки навигации с рендера и объекта хранения
   */
  const deleteAllButtons = (buttons = navigationButtons) => {
    for (const key in buttons) {
      scene.remove(buttons[key].three_mesh)
      delete buttons[key]
    }
  }

  const startButtonClickListener = () => {
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
          callback(navigationButtons[key])
          return;
        }
      }
    }

    /**
     * Обработать событие нажатия на рендер
     * @param {MouseEvent} event - Событие нажатия
     */
    const onRenderClick = (event) => {
      const raycaster = new Raycaster();
      const mouse = new Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      processButtonIntersection(raycaster)
    };

    renderer.domElement.addEventListener('click', onRenderClick);
  }

  return { startButtonClickListener, createNavigationButtons, deleteAllButtons };
}