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
  const { getTextureByMergeTiles } = useMergeTiles()

  const load = async (prerender: boolean, tileXLen: number, tileYLen: number, urlTemplate: string, camera: PerspectiveCamera): Promise<{ textures: Array<Texture>, visibleTiles: Array<{ x: number, y: number }> }> => {
    let visibleTiles = getTilesByCondition(
      tileXLen,
      tileYLen,
      (x, y) => {
        // return prerender || isTileVisible(x, y, tileXLen, tileYLen)
        return prerender || isTileVisible(camera, x, y, tileXLen, tileYLen)
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

  const bindAndLoad = async (panorama: TPanorama, camera: PerspectiveCamera) => {
    const textureLevel = getLevelByZoomFov(panorama.LEVELS_BY_ZOOM, camera.fov);
    const prerender = panorama.PRERENDER?.[textureLevel]

    const tileXLen = panorama.XY_TILE_RANGE[textureLevel][X_INDEX]
    const tileYLen = panorama.XY_TILE_RANGE[textureLevel][Y_INDEX]

    const urlTemplate = `${panorama.tilesPath}${panorama.ZOOM_LEVELS[textureLevel]}`
    return { ...await load(prerender, tileXLen, tileYLen, urlTemplate, camera), tileXLen, tileYLen }
  }

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

  return { load, bindAndLoad, loadAndRenderTiles };
}