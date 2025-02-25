/**
 * Модель методов модального окна
 * @typedef TPanorama
 * @property {Function} open - Функция открытия
 * @property {Function} close - Функция Закрытия
 */
export type TPanorama = {
  tilesPath: string
  buttons: Array<{
    position: {
      x: number,
      y: number,
      z: number
    },
    nextPanoramaKey: string
  }>,
  LEVELS: {
    [name: string]: string
  },
  PRERENDER: {
    [name: string]: boolean
  },
  XY_TILE_RANGE: {
    [name: string]: [number, number]
  },
  ZOOM_LEVELS: {
    [name: string]: string
  },
  LEVELS_BY_ZOOM: {
    [name: string | number]: string
  }
}

export type TPanoramaButton = TPanorama["buttons"][0]

/**
 * Модель объекта модальных окон
 * @typedef TModal
 */
export type TPanoramaDict = {
  [name: string]: TPanorama
}