import { Vector3 } from '@/shared/lib/three';

export default function useTileVisible() {
  /**
   * Проверка видимости тайла
   * @param {THREE.camera} camera - Камера
   * @param {number} x - Координата X тайла
   * @param {number} y - Координата Y тайла
   * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
   * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
   * @return {boolean} Отображать ли тайл
   */
  const isTileVisible = (camera, x, y, tileXLen, tileYLen) => {
    const k = 1 // Увеличивая коэффициент, область видимости расширяется
    const phi = ((y + k) / tileYLen) * Math.PI;
    const theta = ((x + k) / tileXLen) * 2 * Math.PI;
    const direction = new Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    return direction.dot(cameraDirection) >= 0
  };

  /**
   * Получить массив тайлов по условию
   * @param {number} tileXLen - Кол-во тайлов при заданном качестве по X
   * @param {number} tileYLen - Кол-во тайлов при заданном качестве по Y
   * @param {Function} conditionF - Условие для записи в список
   * @return {Array<{ x: number, y: number }>} Массив Значений для подгрузк тайлов
   */
  const getTilesByCondition = (tileXLen, tileYLen, conditionF) => {
    const tilesInView = [];
    for (let y = 0; y < tileYLen; y++) {
      for (let x = 0; x < tileXLen; x++) {
        if (conditionF(x, y)) {
          tilesInView.push({ x, y });
        }
      }
    }
    return tilesInView;
  };

  return { isTileVisible, getTilesByCondition };
}