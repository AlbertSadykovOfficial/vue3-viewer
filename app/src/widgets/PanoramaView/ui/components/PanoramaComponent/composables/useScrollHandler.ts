import type { PerspectiveCamera, WebGLRenderer } from '@/shared/lib/three'

export default function useScrollHandler(camera: PerspectiveCamera, renderer: WebGLRenderer, callback: () => void = ()=>{}) {
  const startScrollListener = () => {
    renderer.domElement.addEventListener('wheel', (event: WheelEvent) => {
      camera.fov += event.deltaY * 0.05;
      camera.fov = Math.max(20, Math.min(90, camera.fov));
      camera.updateProjectionMatrix();
      callback()
    });
  }
  return { startScrollListener };
}