import useLoadTiles from "./useLoadTiles";
import useTilesVisible from "./useTilesVisible";
import useMergeTiles from "./useMergeTiles";

/**
 * @param {Function} emit - Эмиттер vue
 * @param {THREE.TextureLoader} textureLoader - Загрузчик текстур
 */
export default function useLoadAndRenderTiles(emit, textureLoader = new TextureLoader()) {
  /** @type {number} Индекс X-размерности в panoramas.panorama.XY_TILE_RANGE */
  const X_INDEX = 0

  /** @type {number} Индекс Y-размерности в panoramas.panorama.XY_TILE_RANGE */
  const Y_INDEX = 1

  const { loadTile } = useLoadTiles(textureLoader)
  const { isTileVisible, getTilesByCondition } = useTilesVisible()
  const { getTextureByMergeTiles } = useMergeTiles()

  const load = async (prerender, tileXLen, tileYLen, urlTemplate, camera) => {
    let visibleTiles = getTilesByCondition(
      tileXLen,
      tileYLen,
      (x, y) => {
        // return prerender || isTileVisible(x, y, tileXLen, tileYLen)
        return prerender || isTileVisible(camera, x, y, tileXLen, tileYLen)
      }
    );

    emit('load-started', visibleTiles.length)

    const textures = await Promise.all(
      visibleTiles.map(({ x, y }) =>
        loadTile(
          urlTemplate.replace('{x}', x).replace('{y}', y),
          () => { emit('tile-loaded') }
        )
      )
    );

    emit('load-ended')
    return [textures, visibleTiles]
  }

  const bindAndLoad = async (panorama, camera) => {
    const textureLevel = panorama.getLevelByZoomFov(camera.fov);
    const prerender = panorama.PRERENDER?.[textureLevel]

    const tileXLen = panorama.XY_TILE_RANGE[textureLevel][X_INDEX]
    const tileYLen = panorama.XY_TILE_RANGE[textureLevel][Y_INDEX]

    const urlTemplate = `${panorama.tilesPath}${panorama.ZOOM_LEVELS[textureLevel]}`

    return [...await load(prerender, tileXLen, tileYLen, urlTemplate, camera), tileXLen, tileYLen]
  }

  const loadAndRenderTiles = async (panorama, camera, sphere) => {
    const [textures, visibleTiles, tileXLen, tileYLen] = await bindAndLoad(panorama, camera)

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