import { TextureLoader} from '@/shared/lib/three'
import type { PerspectiveCamera, Texture } from '@/shared/lib/three'
import type { TPanorama, TPanoramaLevelsByZoom } from '../../../../model/types'

import useLoadTiles from "./useLoadTiles";
import useTilesVisible from "./useTilesVisible";
import useMergeTiles from "./useMergeTiles";

import type { TSphere } from './useSphere'

type TCallbacksFunctions = {
  onStartLoading: (total?: number) => void
  onTileLoaded: () => void
  onFinishLoading: () => void
}

const callbackFunctions: TCallbacksFunctions = {
  onStartLoading: () => {},
  onTileLoaded: () => {},
  onFinishLoading: () => {}
}

/**
 * @param {THREE.TextureLoader} textureLoader - Загрузчик текстур
 * @param {TCallbacksFunctions} callbacks - Функции обратного вызова
 */
export default function useLoadAndRenderTiles(textureLoader = new TextureLoader(), callbacks = callbackFunctions) {
  /** @type {number} Индекс X-размерности в panoramas.panorama.XY_TILE_RANGE */
  const X_INDEX = 0

  /** @type {number} Индекс Y-размерности в panoramas.panorama.XY_TILE_RANGE */
  const Y_INDEX = 1

  const { loadTile } = useLoadTiles(textureLoader)
  const { isTileVisible, getTilesByCondition } = useTilesVisible()
  const { getTextureByMergeTiles, bindBackgroundImage: bindBackgroundImageCanvas  } = useMergeTiles()

  /**
   * Установить самый низкий уровень текстур как задний фон
   * @async
   * @param {TPanorama} panorama - Объект панорамы
   * @param {PerspectiveCamera} camera - Камера [Этот параметр нужен для совместимости, с у нас preload=true камера не требуется]
   */
  const bindBackgroundImage = async (panorama: TPanorama) => {
    const preload = true
    /**
     * Выбираем самое плохое качество для текущей панорамы (для этого имитируем zoom = 100)
     */
    const textureLevel = getLevelByZoomFov(panorama.LEVELS_BY_ZOOM, 100)

    const tileXLen = panorama.XY_TILE_RANGE[textureLevel][X_INDEX]
    const tileYLen = panorama.XY_TILE_RANGE[textureLevel][Y_INDEX]

    const urlTemplate = `${panorama.tilesPath}${panorama.ZOOM_LEVELS[textureLevel]}`

    /**
     * Загружаем все текстуры (preload = true) для выбранного уровня текстур
     */
    const { textures, visibleTiles } = await load(urlTemplate, tileXLen, tileYLen)
    
    /**
     * Сбрасываем предыдущую замкнутую текстуру getTextureByMergeTiles
     */
    bindBackgroundImageCanvas(null)

    /**
     * Создаем единую тектуру из набора текстур
     */
    const background = getTextureByMergeTiles(
      textures,
      visibleTiles,
      tileXLen,
      tileYLen
    )

    /**
     * Отправляем полученную текстуру в замыкание getTextureByMergeTiles
     */
    bindBackgroundImageCanvas(background)
  }

  /**
   * Вычислить тестуры, которые нужны для отрисовки и загрузить их
   * @async
   * @param {string} urlTemplate - Шаблон url с подстановочными параметрами (x, y) по которому будут загружены тайлы
   * @param {number} tileXLen - Общее кол-во тайлов по оси x
   * @param {number} tileYLen - Общее кол-во тайлов по оси y
   * @param {PerspectiveCamera} camera - Камера (необходима для вычисления тайлов в оласти видимости)
   * @param {boolean} prerender - Загрузить тайлы полностью
   */
  const load = async (urlTemplate: string, tileXLen: number, tileYLen: number, camera?: PerspectiveCamera, prerender?: boolean): Promise<{ textures: Array<Texture>, visibleTiles: Array<{ x: number, y: number }> }> => {
    let visibleTiles = getTilesByCondition(
      tileXLen,
      tileYLen,
      (x, y) => {
        return prerender || !camera || isTileVisible(camera, x, y, tileXLen, tileYLen)
      }
    );

    callbacks.onStartLoading(visibleTiles.length)

    const textures = await Promise.all(
      visibleTiles.map(({ x, y }) =>
        loadTile(
          urlTemplate.replace('{x}', String(x)).replace('{y}', String(y)),
          callbacks.onTileLoaded
        )
      )
    );

    callbacks.onFinishLoading()
    return { textures, visibleTiles }
  }

  /**
   * Получить уровень текстур соответствующий зуму
   * @param {TPanoramaLevelsByZoom} levelsByZoom - Уровни в соответствии с зумом
   * @param {number} zoom - Зум (camera.fov)
   */
  const getLevelByZoomFov = (levelsByZoom: TPanoramaLevelsByZoom, zoom: number) => {
    let target_zoom: number | string = 0
    let max_zoom: number | string = target_zoom
    for (const zoomLevel in levelsByZoom) {
      if (Number(zoomLevel) >= Number(target_zoom)) {
        if (Number(zoomLevel) > zoom) {
          return levelsByZoom[target_zoom]
        } else {
          max_zoom = zoomLevel
        }
        target_zoom = zoomLevel
      }
    }
    return levelsByZoom[max_zoom]
  }

  /**
   * Загрузка текстур
   * (bind приписка как сахар, кэш реализует useLoadTiles())
   * @async
   * @param {TPanorama} panorama - Объект панорамы
   * @param {PerspectiveCamera} camera - Камера
   */
  const bindAndLoad = async (panorama: TPanorama, camera: PerspectiveCamera) => {
    const textureLevel = getLevelByZoomFov(panorama.LEVELS_BY_ZOOM, camera.fov);
    const prerender = panorama.PRERENDER?.[textureLevel]

    const tileXLen = panorama.XY_TILE_RANGE[textureLevel][X_INDEX]
    const tileYLen = panorama.XY_TILE_RANGE[textureLevel][Y_INDEX]

    const urlTemplate = `${panorama.tilesPath}${panorama.ZOOM_LEVELS[textureLevel]}`
    return { ...await load(urlTemplate, tileXLen, tileYLen, camera, prerender), tileXLen, tileYLen }
  }

  /**
   * Загрузка текстур и их рендер
   * @async
   * @param {TPanorama} panorama - Объект панорамы
   * @param {PerspectiveCamera} camera - Камера
   * @param {TSphere} sphere - Сфера отрисовки
   */
  const loadAndRenderTiles = async (panorama: TPanorama, camera: PerspectiveCamera, sphere: TSphere) => {
    const { textures, visibleTiles, tileXLen, tileYLen } = await bindAndLoad(panorama, camera)

    if (sphere) {
      sphere.material.map = getTextureByMergeTiles(
        textures,
        visibleTiles,
        tileXLen,
        tileYLen
      );
      sphere.material.needsUpdate = true;
    }
  }

  return { load, bindAndLoad, loadAndRenderTiles, bindBackgroundImage };
}