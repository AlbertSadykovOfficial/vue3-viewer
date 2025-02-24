import { Mesh, SphereGeometry, MeshBasicMaterial, Texture } from '@/shared/lib/three';

export default function useSphere() {
  const geometry = new SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const material = new MeshBasicMaterial({
    map: new Texture()
  });
  const sphere = new Mesh(geometry, material);

  return { sphere };
}