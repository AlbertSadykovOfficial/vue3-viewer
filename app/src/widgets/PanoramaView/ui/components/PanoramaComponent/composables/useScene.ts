import { Scene } from '@/shared/lib/three';

export default function useScene() {
  const scene = new Scene();

  return { scene };
}