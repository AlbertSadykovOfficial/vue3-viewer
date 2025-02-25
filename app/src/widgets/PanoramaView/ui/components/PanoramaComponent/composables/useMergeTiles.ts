import { Texture } from '@/shared/lib/three';

export default function useMergeTiles() {
  /**
   * Создать текстуру из тайлов
   * @param {Array<THREE.Texture>} textures - Массив текстур
   * @param {Array<{ x: number, y: number }>} tiles - Массив Значений для подгрузки тайлов
   * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
   * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
   */
  const getTextureByMergeTiles = (textures, tiles, tileXLen, tileYLen) => {
    const tileSize = 256;

    const canvas = document.createElement('canvas');
    canvas.width = tileXLen * 256;
    canvas.height = tileYLen * 256;
    const ctx = canvas.getContext('2d');

    textures.forEach((texture, index) => {
      const { x, y } = tiles[index];
      const img = texture.image;
      ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
    });

    const finalTexture = new Texture(canvas);
    finalTexture.needsUpdate = true;
    return finalTexture
  };

  return { getTextureByMergeTiles };
}