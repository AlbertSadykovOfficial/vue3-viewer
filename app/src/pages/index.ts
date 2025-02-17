import Routing from "./index.vue";

export const routes = [
    { path: "/", component: () => import("./home/"), name: "Home", }
];

export { Routing };
