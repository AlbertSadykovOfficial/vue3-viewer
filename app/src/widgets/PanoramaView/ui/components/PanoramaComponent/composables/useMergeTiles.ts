import { Texture } from '@/shared/lib/three';

export default function useMergeTiles() {
  let background: Texture | null = null

  /**
   * Замкнуть текстуру заднего фона
   * @param {THREE.Texture} texture - Текстура
   */
  const bindBackgroundImage = (texture: Texture | null) => {
    background = texture
  }

  /**
   * Создать текстуру из тайлов
   * @param {Array<THREE.Texture>} textures - Массив текстур
   * @param {Array<{ x: number, y: number }>} tiles - Массив Значений для подгрузки тайлов
   * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
   * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
   */
  const getTextureByMergeTiles = (textures: Array<Texture>, tiles: Array<{ x: number, y: number}>, tileXLen: number, tileYLen: number): Texture => {
    const tileSize = 256;

    const canvas = document.createElement('canvas');
    canvas.width = tileXLen * 256;
    canvas.height = tileYLen * 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      /**
       * Отрисовка текстуры заднего фона при ее наличии
       */
      if (background && background?.isTexture) {
        ctx.drawImage(background.image, 0, 0, canvas.width, canvas.height);
      }

      textures.forEach((texture: Texture, index: number): void => {
        const { x, y } = tiles[index];
        const img = texture.image;
        ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
      });
    }

    const finalTexture = new Texture(canvas);
    finalTexture.needsUpdate = true;
    return finalTexture
  };

  return { getTextureByMergeTiles, bindBackgroundImage };
}