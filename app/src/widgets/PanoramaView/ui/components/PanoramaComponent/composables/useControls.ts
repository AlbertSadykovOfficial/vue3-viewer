import { OrbitControls } from '@/shared/lib/three/examples'

export default function useControls(camera, renderer, callback: () => {}) {
  const controls = new OrbitControls(camera, renderer.domElement);

  const startControlsChangeListener = () => {
    controls.addEventListener('change', callback);
  }

  return { controls, startControlsChangeListener };
}