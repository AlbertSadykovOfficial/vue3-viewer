import { WebGLRenderer } from '@/shared/lib/three';

export default function useRenderer(width: number, height: number, options={}) {
  const renderer = new WebGLRenderer(options);
  renderer.setSize(width, height);

  const pushRenderer = (HTMLElement: HTMLElement, renderer: WebGLRenderer) => {
    HTMLElement.appendChild(renderer.domElement)
  }

  return { renderer, pushRenderer };
}