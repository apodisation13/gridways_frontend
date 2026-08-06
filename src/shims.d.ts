import { Store } from 'vuex'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { Card, GameObj, IsActive, Leader } from '@/types'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<any>
    $route: RouteLocationNormalizedLoaded
    $router: Router
    // GamePage mixin cross-dependencies (provided by GamePage.vue + its mixins at runtime)
    gameObj: GameObj
    isActive: IsActive
    selected_card: Card | Leader | null
    can_draw: boolean
    draw: boolean
    sca: boolean
    setActive(): void
    calc_can_draw(): boolean
    draw_one_card(): void
    afterDamage(): void
  }
}
