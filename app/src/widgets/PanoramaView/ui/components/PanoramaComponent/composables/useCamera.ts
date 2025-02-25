import { PerspectiveCamera } from '@/shared/lib/three';

export default function useCamera(fov: number, ratio: number, near: number, far: number) {
  const camera = new PerspectiveCamera(fov, ratio, near, far);
  camera.position.set(0, 0, 2);

  /**
   * Обновить
   */
  const cameraUpdate = (camera: PerspectiveCamera) => {
    camera.updateProjectionMatrix();
  }

  /**
   * Выставить значение камеры в исходные параметры
   */
  const cameraSetDefault = (camera: PerspectiveCamera) => {
    camera.fov = fov
    camera.position.set(0, 0, 2);
    /*
    * Cбрасываем кватернион к его начальному значению (единичному кватерниону, что соответствует нулевому вращению).
    * (x=0, y=0, z=0, w=1)
    * [При анимации движения к кнопке кватернион изменяется, поэтому сбрасываем его, иначе будет перекос]
    */
    camera.quaternion.identity()
  }

  /**
   * Установить начальные значения и обновить
   */
  const cameraToDefault = (camera: PerspectiveCamera) => {
    cameraSetDefault(camera)
    cameraUpdate(camera)
  }

  return { camera, cameraToDefault };
}