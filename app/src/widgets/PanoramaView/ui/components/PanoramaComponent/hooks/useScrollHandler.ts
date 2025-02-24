import { Vector3 } from '@/shared/lib/three';

export default function useScrollHandler(camera, renderer, callback= ()=>{}) {
  const startScrollListener = () => {
    renderer.domElement.addEventListener('wheel', (event) => {
      camera.fov += event.deltaY * 0.05;
      camera.fov = Math.max(20, Math.min(90, camera.fov));
      camera.updateProjectionMatrix();
      callback()
    });
  }
  return { startScrollListener };
}