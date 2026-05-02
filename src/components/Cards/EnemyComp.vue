<template>
  <div>
    <div
      :id="make_id(enemy, index)"
      :ref="setEnemyRef"
      v-touch:longtap="show_modal"
      class="card-enemy-component"
      :style="border(enemy)"
      @contextmenu.prevent
      @click.right="show_modal"
    >
      <enemy-ui :enemy="enemy" />
    </div>
    <card-modal
      v-if="show_enemy_modal"
      :card="enemy"
      :for-enemy="true"
      @close_card_modal="show_enemy_modal = false"
    />
  </div>
</template>

<script lang="ts">
import {
  type ComponentPublicInstance,
  defineComponent,
  type PropType,
} from "vue"

import EnemyUi from "@/components/Cards/EnemyUi.vue"
import CardModal from "@/components/ModalWindows/CardModal.vue"
import { border_for_card } from "@/logic/border_styles"
import type { Enemy } from "@/types"

export default defineComponent({
  name: "EnemyComp",
  components: {
    CardModal,
    EnemyUi,
  },
  props: {
    enemy: {
      type: Object as PropType<Enemy>,
      required: true,
    },
    index: {
      type: Number,
      default: undefined,
    },
    in_cross: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      show_enemy_modal: false,
      animationId: null as number | null,
      animationStartTime: null as number | null,
      isAnimating: false,
      enemyElement: null as HTMLElement | null,
    }
  },
  watch: {
    in_cross: {
      immediate: true,
      handler(newVal: boolean) {
        if (newVal && !this.isAnimating && this.enemy.data.hp > 0) {
          console.log(`[${this.index}] → startAnimation`)
          this.startAnimation()
        } else if (!newVal && this.isAnimating) {
          console.log(`[${this.index}] → stopAnimation`)
          this.stopAnimation()
        }
      },
    },
  },
  beforeUnmount() {
    this.stopAnimation()
  },
  methods: {
    border(e: Enemy): Record<string, string> {
      return border_for_card(e)
    },
    show_modal(): void {
      this.show_enemy_modal = true
    },
    make_id(enemy: Enemy, index: number | undefined): string {
      return `${enemy.name}_${index}`
    },
    setEnemyRef(el: Element | ComponentPublicInstance | null): void {
      this.enemyElement = el as HTMLElement | null
    },
    startAnimation(): void {
      if (this.isAnimating) return

      this.isAnimating = true
      this.animationStartTime = performance.now()
      this.animate()
    },
    stopAnimation(): void {
      this.isAnimating = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }

      const el = this.enemyElement
      if (el) {
        el.style.transform = ""
        el.style.boxShadow = ""
        el.style.zIndex = ""
      }
    },
    animate(): void {
      if (!this.isAnimating) return

      const el = this.enemyElement
      if (!el) return

      const elapsed = performance.now() - (this.animationStartTime as number)
      const duration = 1200
      const progress = (elapsed % duration) / duration

      // Дрожание
      const shakeX =
        Math.sin(progress * Math.PI * 10) * 4 * (1 - progress * 0.5)
      const shakeRotate =
        Math.sin(progress * Math.PI * 8) * 0.5 * (1 - progress * 0.5)

      // Мерцание цвета (переключение между голубым и розовым)
      const glowPhase = Math.sin(progress * Math.PI * 6)
      const isBlue = glowPhase > 0

      const blueGlow = `0 0 0 3px rgba(79, 195, 240, 0.8), 0 0 30px rgba(79, 195, 240, 0.6)`
      const pinkGlow = `0 0 0 3px rgba(247, 37, 133, 0.9), 0 0 40px rgba(247, 37, 133, 0.8)`
      const baseGlow = `-4px 0 4px rgb(0 0 0 / 50%)`

      el.style.transform = `translateX(${shakeX}px) rotate(${shakeRotate}deg)`
      el.style.boxShadow = `${isBlue ? blueGlow : pinkGlow}, ${baseGlow}`
      el.style.zIndex = "10"

      this.animationId = requestAnimationFrame(() => this.animate())
    },
  },
})
</script>

<style scoped>
.card-enemy-component {
  position: relative;
  width: 100%;
  box-shadow: -4px 0 4px rgb(0 0 0 / 50%);
}

.card-enemy-component::before {
  content: "";
  display: block;
  padding-top: 143%;
}
</style>
