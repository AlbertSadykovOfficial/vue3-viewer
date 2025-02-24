import Routing from "./index.vue";

export const routes = [
    { path: "/", component: () => import("./home/"), name: "Home", },
    { path: "/three", component: () => import("./three/"), name: "Three", },
    { path: "/three-experiments", component: () => import("./three_experiments/"), name: "ThreeExperiments", },
    { path: "/three-experiments-tiles", component: () => import("./three_experiments_tiles/"), name: "ThreeExperimentsTiles", },
    { path: "/three-experiments-tiles-fov", component: () => import("./three_experiments_tiles_fov/"), name: "ThreeExperimentalTilesFov", },
    { path: "/three-experiments-tiles-fov-vision", component: () => import("./three_experiments_tiles_fov_vision_render/"), name: "ThreeExperimentalTilesFovVisible", },
    { path: "/three-experiments-tiles-fov-vision-load", component: () => import("./three_experiments_tiles_fov_vision_renderer_n_load/"), name: "ThreeExperimentalTilesFovVisibleLoad", },
    { path: "/three-multipanorama", component: () => import("./three_multipanorama/"), name: "ThreeMultiPanorama", },
    { path: "/three-merged", component: () => import("./three_merged/"), name: "ThreeMerged", },
    { path: "/three-finally", component: () => import("./three_finally/"), name: "ThreeFinally", },
    { path: "/viewer", component: () => import("./viewer/"), name: "Viewer", },
    { path: "/viewer-experimental", component: () => import("./viewer_experimental/"), name: "ViewerExperimental", }
];

export { Routing };
