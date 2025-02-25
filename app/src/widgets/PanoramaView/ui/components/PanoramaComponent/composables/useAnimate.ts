export default function useAnimate(duration = 800, endFov = 30) {
  const animateZoomToPoint = (camera, targetPosition, callback) => {
    let startTime = performance.now();
    let startFov = camera.fov;
    let startPosition = camera.position.clone();

    const animate = (time) => {
      let elapsed = time - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Интерполяция FOV (зум)
      camera.fov = startFov + (endFov - startFov) * progress;
      camera.updateProjectionMatrix();

      // Интерполяция позиции (движение к кнопке)
      camera.position.lerpVectors(startPosition, targetPosition, progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback(); // После завершения зума вызываем callback
      }
    };

    requestAnimationFrame(animate);
  };

  return { animateZoomToPoint };
}