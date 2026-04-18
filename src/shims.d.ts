import { Store } from 'vuex'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<any>
    $route: RouteLocationNormalizedLoaded
    $router: Router
  }
}
