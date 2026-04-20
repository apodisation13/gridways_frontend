<template>
  <div>
    <div
      class="enemy-leader"
      ref="leaderRef"
      :style="border(enemy_leader)"
      @contextmenu.prevent
      @click.right="open_card_modal"
      v-touch:longtap="open_card_modal"
      @dblclick="exec_enemy_leader"
      :id="`enemy_leader_${enemy_leader.name}`"
    >
      <enemy-ui :enemy="enemy_leader" />
    </div>
    <card-modal
      :card="enemy_leader"
      :for-enemy-leader="true"
      hp_needed
      :is_leader="true"
      v-if="show_enemy_leader_modal"
      @close_card_modal="show_enemy_leader_modal = false"
    />
  </div>
</template>

<script>
import { border_leader } from "@/logic/border_styles"
import CardModal from "@/components/ModalWindows/CardModal.vue"
import EnemyUi from "@/components/Cards/EnemyUi.vue"

export default {
  name: "enemy-leader",
  components: {
    EnemyUi,
    CardModal,
  },
  props: {
    enemy_leader: {
      required: true,
      type: Object,
    },
    in_cross: {
      required: false,
      default: false,
    },
  },
  watch: {
    in_cross: {
      immediate: true,
      handler(newVal) {
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
  data() {
    return {
      show_enemy_leader_modal: false,
      animationId: null,
      animationStartTime: null,
      isAnimating: false,
    }
  },
  methods: {
    open_card_modal() {
      this.show_enemy_leader_modal = true
    },
    border(leader) {
      return border_leader(leader)
    },
    exec_enemy_leader() {
      this.$emit("exec_enemy_leader")
    },
    startAnimation() {
      if (this.isAnimating) return // Уже запущена — не трогаем!

      this.isAnimating = true
      this.animationStartTime = performance.now()
      this.animate()
    },

    stopAnimation() {
      this.isAnimating = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }

      // Возвращаем в исходное состояние
      const el = this.$refs.leaderRef
      if (el) {
        el.style.transform = ""
        el.style.boxShadow = "-4px 0 4px rgb(0 0 0 / 50%)"
      }
    },

    animate() {
      if (!this.isAnimating) return

      const el = this.$refs.leaderRef
      if (!el) return

      const elapsed = performance.now() - this.animationStartTime
      const duration = 1200 // 0.8 секунды на цикл
      const progress = (elapsed % duration) / duration // 0 to 1

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
  emits: ["exec_enemy_leader"],
}
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
