import { App, defineAsyncComponent } from "vue";

export function registerComponents(app: App) {
    app
        .component("LazyModal", defineAsyncComponent({
            loader: () => import('../../shared/ui/modal/base-modal/ui/index.vue'),
        }))
}