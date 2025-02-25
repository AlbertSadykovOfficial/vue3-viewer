import { Mesh, CircleGeometry, MeshBasicMaterial, Vector3, PlaneGeometry, TextureLoader } from '@/shared/lib/three';
import type { PerspectiveCamera, Texture } from '@/shared/lib/three'
/**
 * @param {THREE.TextureLoader} textureLoader - Загрузчик текстур
 */
export default function useCreateNavigationButton(
  textureLoader: TextureLoader = new TextureLoader()
) {

  /**
    * Загружаем текстуру
    * И Замыкаем ее для переиспользования
    */
  const arrowMap: Texture = textureLoader.load('arrow.png')

  /**
   * Создать Mesh кнопки навигации по координатам
   * @param {THREE.PerspectiveCamera} camera - Камера
   * @param {{ x: number, y: number, z: number }} - Массив координат
   * @return {THREE.Mesh} Mesh кнопки
   */
  const createNavigationButton = (camera: PerspectiveCamera, { x, y, z }: Vector3) => {
    const buttonMesh = new Mesh(
      new CircleGeometry(1, 32), // buttonGeometry
      new MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.5 }) // buttonMaterial
    );

    buttonMesh.position.copy(new Vector3(x, y, z));
    buttonMesh.lookAt(camera.position);

    const arrowMesh = new Mesh(
      // arrowGeometry
      new PlaneGeometry(1, 1),
      //arrowMaterial
      new MeshBasicMaterial({
        map: arrowMap,
        transparent: true
      })
    );
    arrowMesh.position.set(0, 0, 0.1);

    buttonMesh.add(arrowMesh);

    return buttonMesh;
  };

  return { createNavigationButton };
}