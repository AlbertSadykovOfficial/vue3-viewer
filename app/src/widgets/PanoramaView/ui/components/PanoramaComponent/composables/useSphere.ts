import { Mesh, SphereGeometry, MeshBasicMaterial, Texture, Object3DEventMap } from '@/shared/lib/three';

export type TSphere = Mesh<SphereGeometry, MeshBasicMaterial, Object3DEventMap>

export default function useSphere() {
  const geometry = new SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const material = new MeshBasicMaterial({
    map: new Texture()
  });
  const sphere: TSphere = new Mesh(geometry, material);

  return { sphere };
}