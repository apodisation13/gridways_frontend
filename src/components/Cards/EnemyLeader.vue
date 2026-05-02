<template>
  <div>
    <div
      :id="`enemy_leader_${enemy_leader.name}`"
      ref="leaderRef"
      v-touch:longtap="open_card_modal"
      class="enemy-leader"
      :style="border(enemy_leader)"
      @contextmenu.prevent
      @click.right="open_card_modal"
      @dblclick="exec_enemy_leader"
    >
      <enemy-ui :enemy="enemy_leader" />
    </div>
    <card-modal
      v-if="show_enemy_leader_modal"
      :card="enemy_leader"
      :for-enemy-leader="true"
      hp_needed
      :is_leader="true"
      @close_card_modal="show_enemy_leader_modal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import EnemyUi from "@/components/Cards/EnemyUi.vue"
import CardModal from "@/components/ModalWindows/CardModal.vue"
import { border_leader } from "@/logic/border_styles"
import type { EnemyLeader as EnemyLeaderType } from "@/types"

export default defineComponent({
  name: "EnemyLeader",
  components: {
    EnemyUi,
    CardModal,
  },
  props: {
    enemy_leader: {
      required: true,
      type: Object as PropType<EnemyLeaderType>,
    },
    in_cross: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
  emits: ["exec_enemy_leader"],
  data() {
    return {
      show_enemy_leader_modal: false,
      animationId: null as number | null,
      animationStartTime: null as number | null,
      isAnimating: false,
    }
  },
  watch: {
    in_cross: {
      immediate: true,
      handler(newVal: boolean) {
        if (newVal && !this.isAnimating && this.enemy_leader.data.hp > 0) {
          this.startAnimation()
        } else if (!newVal && this.isAnimating) {
          this.stopAnimation()
        }
      },
    },
  },
  beforeUnmount() {
    this.stopAnimation()
  },
  methods: {
    open_card_modal(): void {
      this.show_enemy_leader_modal = true
    },
    border(leader: EnemyLeaderType): Record<string, string> {
      return border_leader(leader)
    },
    exec_enemy_leader(): void {
      this.$emit("exec_enemy_leader")
    },
    startAnimation(): void {
      if (this.isAnimating) return

      this.isAnimating = true
      this.animationStartTime = performance.now()
      this.animate()
    },

    stopAnimation(): void {
      this.isAnimating = false
      if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }

      const el = this.$refs.leaderRef as HTMLElement | undefined
      if (el) {
        el.style.transform = ""
        el.style.boxShadow = "-4px 0 4px rgb(0 0 0 / 50%)"
      }
    },

    animate(): void {
      if (!this.isAnimating) return

      const el = this.$refs.leaderRef as HTMLElement | undefined
      if (!el) return

      const elapsed = performance.now() - (this.animationStartTime as number)
      const duration = 1200
      const progress = (elapsed % duration) / duration

      const shakeX =
        Math.sin(progress * Math.PI * 10) * 4 * (1 - progress * 0.5)
      const shakeRotate =
        Math.sin(progress * Math.PI * 8) * 0.5 * (1 - progress * 0.5)

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
.enemy-leader {
  position: relative;
  margin-top: 21px;
  width: 100%;
  box-shadow: -4px 0 4px rgb(0 0 0 / 50%);
}

.enemy-leader::before {
  content: "";
  display: block;
  padding-top: 138%;
}
</style>
