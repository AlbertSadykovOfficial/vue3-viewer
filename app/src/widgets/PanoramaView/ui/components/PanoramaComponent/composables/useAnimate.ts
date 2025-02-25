import { Vector3 } from '@/shared/lib/three';
import { Quaternion } from 'three'

export default function useAnimate(duration = 800, endFov = 30) {
  const animateZoomToPoint = (camera, buttonPosition, callback) => {
    let startTime = performance.now();

    /*
     * Для анимации приближения animateMovement
     */
    let startFov = camera.fov;

    /*
     * Для анимации поворота animateRotation
     * Используем lookAt для определения целевого угла поворота
     */
    let targetQuaternion = new Quaternion();
    let tempCamera = camera.clone();

    tempCamera.lookAt(buttonPosition);
    targetQuaternion.copy(tempCamera.quaternion);

    const animateRotation = (time) => {
      let elapsed = time - startTime;
      let progress = Math.min(elapsed / duration, 1); // Прогресс от 0 до 1

      // Плавное вращение камеры
      camera.quaternion.slerp(targetQuaternion, progress);

      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      } else {
        startTime = performance.now(); // Обновляем таймер перед анимацией приближения
        requestAnimationFrame(animateMovement);
      }
    };

    const animateMovement = (time) => {
      let elapsed = time - startTime;
      let progress = Math.min(elapsed / duration, 1); // Прогресс от 0 до 1

      // Интерполяция FOV (зум)
      camera.fov = startFov + (endFov - startFov) * progress;
      camera.updateProjectionMatrix();

      if (progress < 1) {
        requestAnimationFrame(animateMovement);
      } else {
        callback(); // После завершения анимации меняем панораму
      }
    };

    requestAnimationFrame(animateRotation);
  };

  return { animateZoomToPoint };
}