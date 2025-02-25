import { TextureLoader, Texture } from '@/shared/lib/three';

/**
 * @param {THREE.TextureLoader} textureLoader - Загрузчик текстур
 */
export default function useLoadTiles(textureLoader = new TextureLoader()) {
  /** @type {Map} Хранилище тайлов (Кэш для оптимизации) */
  const tiles = new Map();

  /**
   * Получение тайла из хранилища
   * Если хранилище пустое, то загрузка
   * @param {string} url - Ссылка на тайл
   * @param {Function} callback - Функция обратного вызоыва
   * @return {Promise<THREE.Texture>} Текстура тайла
   */
  const loadTile = (url: string, callback: () => void = () => {}): Promise<Texture> => {
    return new Promise((resolve) => {
      if (tiles.has(url)) {
        return resolve(tiles.get(url));
      }
      const texture = textureLoader.load(
        url,
        () => {
          tiles.set(url, texture);
          resolve(texture);
          callback();
        }
      );
    });
  };

  return { tiles, loadTile };
}