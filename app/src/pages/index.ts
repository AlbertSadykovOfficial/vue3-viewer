import Routing from "./index.vue";

export const routes = [
    { path: "/", component: () => import("./home/"), name: "Home", },
    { path: "/three-finally", component: () => import("./three_finally/"), name: "ThreeFinally", }
];

export { Routing };
