import { OrbitControls } from '@/shared/lib/three/examples'
import type { PerspectiveCamera, WebGLRenderer  } from '@/shared/lib/three';

export default function useControls(camera: PerspectiveCamera, renderer: WebGLRenderer, callback: () => void = () => {}) {
  const controls = new OrbitControls(camera, renderer.domElement);

  const startControlsChangeListener = () => {
    controls.addEventListener('change', callback);
  }

  return { controls, startControlsChangeListener };
}