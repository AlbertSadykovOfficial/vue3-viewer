<template>
  <PanoramaView
    :panoramas="panoramas"
  />
</template>
<script>
import PanoramaView from '@/widgets/PanoramaView'

export default {
  components: {
    PanoramaView
  },
  setup () {
    const panoramas = {
      panorama1: {
        tilesPath: '/merged/panorama1/',
        buttons: [{
          position: {
            x: 20,
            y: -8,
            z: 0
          },
          nextPanoramaKey: 'panorama2',
        },
          {
            position: {
              x: 10,
              y: -8,
              z: 0
            },
            nextPanoramaKey: 'panorama3',
          }
        ],
        LEVELS: {
          low: 'low',
          medium: 'medium',
          high: 'high'
        },
        PRERENDER: {
          low: true
        },
        XY_TILE_RANGE: {
          low: [4, 2],
          medium: [8, 4],
          high: [16, 8]
        },
        ZOOM_LEVELS: {
          low: '/low/{x}_{y}.png',
          medium: '/medium/{x}_{y}.png',
          high: '/high/{x}_{y}.png'
        },
        LEVELS_BY_ZOOM: {
          75: 'low',
          50: 'medium',
          0: 'high'
        }
      },
      panorama2: {
        tilesPath: '/merged/panorama2',
        buttons: [{
          position: {
            x: 20,
            y: -5,
            z: -8
          },
          nextPanoramaKey: 'panorama3',
        }],
        LEVELS: {
          low: 'low',
          medium: 'medium',
          high: 'high'
        },
        PRERENDER: {
          low: true
        },
        XY_TILE_RANGE: {
          low: [4, 2],
          medium: [8, 4],
          high: [16, 8]
        },
        ZOOM_LEVELS: {
          low: '/low/{x}_{y}.png',
          medium: '/medium/{x}_{y}.png',
          high: '/high/{x}_{y}.png'
        },
        LEVELS_BY_ZOOM: {
          75: 'low',
          50: 'medium',
          0: 'high'
        }
      },
      panorama3: {
        tilesPath: '/merged/panorama3',
        buttons: [{
          position: {
            x: 20,
            y: -5,
            z: -8
          },
          nextPanoramaKey: 'panorama1',
        }],
        LEVELS: {
          'low': 'low',
          'low-medium': 'low-medium',
          'medium': 'medium',
          'medium-high': 'medium-high',
          'high': 'high'
        },
        PRERENDER: {
          low: true,
          'low-medium': true
        },
        XY_TILE_RANGE: {
          'low': [2, 1],
          'low-medium': [4, 2],
          'medium': [8, 4],
          'medium-high': [16, 8],
          'high': [32, 16]
        },
        ZOOM_LEVELS: {
          'low': '/6/{x}_{y}.png',
          'low-medium': '/12/{x}_{y}.png',
          'medium': '/25/{x}_{y}.png',
          'medium-high': '/50/{x}_{y}.png',
          'high': '/100/{x}_{y}.png'
        },
        LEVELS_BY_ZOOM: {
          75: 'low',
          60: 'low-medium',
          50: 'medium',
          30: 'medium-high',
          0: 'high'
        }
      }
    };

    return { panoramas }
  }
}
</script>