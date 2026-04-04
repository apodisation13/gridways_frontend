<template>
  <div>
    <div
      class="card-enemy-component"
      :ref="setEnemyRef"
      @contextmenu.prevent
      @click.right="show_modal"
      v-touch:longtap="show_modal"
      :id="make_id(enemy, index)"
      :style="border(enemy)"
    >
      <enemy-ui :enemy="enemy" />
    </div>
    <card-modal
      :card="enemy"
      :for-enemy="true"
      v-if="show_enemy_modal"
      @close_card_modal="show_enemy_modal = false"
    />
  </div>
</template>

<script>
import { border_for_card } from "@/logic/border_styles"
import EnemyUi from "@/components/Cards/EnemyUi"
import CardModal from "@/components/ModalWindows/CardModal"
export default {
  name: "enemy-comp",
  components: {
    CardModal,
    EnemyUi,
  },
  props: {
    enemy: {
      required: true,
    },
    // индекс карты в руке, по нему считается id карты, чтобы потом понять на какую карту ткнули!
    // ПРИХОДИТ ИЗ FIELD COMP!
    index: {
      type: Number,
    },
    in_cross: {
      required: false,
      default: false,
    },
  },
  data() {
    return {
      show_enemy_modal: false,
      animationId: null,
      animationStartTime: null,
      isAnimating: false,
      enemyElement: null, // Храним ссылку на элемент здесь
    }
  },
  watch: {
    in_cross: {
      immediate: true,
      handler(newVal) {
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
    border(e) {
      return border_for_card(e)
    },
    show_modal() {
      this.show_enemy_modal = true
    },
    make_id(enemy, index) {
      return `${enemy.name}_${index}`
    },
    setEnemyRef(el) {
      this.enemyElement = el
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

      const el = this.enemyElement
      if (el) {
        el.style.transform = ""
        el.style.boxShadow = ""
        el.style.zIndex = ""
      }
    },

    animate() {
      if (!this.isAnimating) return

      const el = this.enemyElement
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
}
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
