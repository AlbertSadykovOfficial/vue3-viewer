import { WebGLRenderer } from '@/shared/lib/three';

export default function useRenderer(width, height, options={}) {
  const renderer = new WebGLRenderer(options);
  renderer.setSize(width, height);

  const pushRenderer = (HTMLElement, renderer=renderer) => {
    HTMLElement.appendChild(renderer.domElement)
  }

  return { renderer, pushRenderer };
}