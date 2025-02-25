import { PerspectiveCamera } from '@/shared/lib/three';

export default function useCamera(fov, ratio, a, b) {
  const camera = new PerspectiveCamera(fov, ratio, a, b);
  camera.position.set(0, 0, 2);

  /**
   * Выставить значение fov в исходные параметры
   */
  const cameraToDefault = (camera) => {
    camera.fov = fov
    camera.updateProjectionMatrix();
  }

  return { camera, cameraToDefault };
}