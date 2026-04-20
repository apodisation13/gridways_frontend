<template>
  <div class="hand">
    <transition-group name="card-hand" tag="div" class="hand-list">
      <div
        v-for="(card, index) in displayedHand"
        :key="card.id || index"
        class="card_wrap"
        :style="cardStyle(index)"
        @mousedown="handleCardMouseDown($event, index)"
        @touchstart="handleCardTouchStart($event, index)"
      >
        <card-item :card="card" :index="index" class="card_in_hand" />
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import CardItem from "@/components/Cards/CardItem.vue"
import { arrowMixin } from "@/mixins/GamePage/arrow_draw"
import type { Card, Enemy, EnemyLeader } from "@/types"

export default defineComponent({
  name: "hand-comp",
  components: { CardItem },
  mixins: [arrowMixin],
  props: {
    hand: {
      required: true,
      type: Array as PropType<Card[]>,
    },
    field: {
      required: true,
      type: Array as PropType<(Enemy | "")[]>,
    },
    enemy_leader: {
      required: true,
      type: Object as PropType<EnemyLeader>,
    },
    player_cards_active: {
      required: true,
      type: Boolean,
    },
    drawing: {
      type: Boolean,
      default: false,
    },
    initialHandSize: {
      type: Number,
      default: Infinity,
    },
  },
  data() {
    return {
      effectiveInitialSize: 0,
    }
  },
  computed: {
    displayedHand(): Card[] {
      if (this.drawing) {
        return this.hand.slice(0, this.initialHandSize)
      }
      return this.hand
    },
  },
  mounted() {
    ;(this as any).initArrowCanvas()
    window.addEventListener("resize", (this as any).handleResize)
  },
  beforeUnmount() {
    window.removeEventListener("resize", (this as any).handleResize)
    ;(this as any).removeArrowCanvas()
  },
  methods: {
    cardStyle(index: number): Record<string, string | number> {
      const mid = (this.displayedHand.length - 1) / 2
      const offset = index - mid
      return {
        "--z": 10 - index,
        "--rot": `${offset}deg`,
        "--arc": `${-Math.abs(offset) * 3}px`,
      }
    },

    handleCardMouseDown(e: MouseEvent, index: number): void {
      e.preventDefault()
      e.stopPropagation()
      if (!this.player_cards_active) return
      const el = document.querySelectorAll(".card_in_hand")[index]
      if (!el) return
      this.$emit("chose_player_card", this.hand[index])
      ;(this as any).beginArrowDrawing(
        el,
        e.clientX,
        e.clientY,
        this.hand[index].faction
      )
    },
    handleCardTouchStart(e: TouchEvent, index: number): void {
      e.preventDefault()
      e.stopPropagation()
      if (!this.player_cards_active) return
      const el = document.querySelectorAll(".card_in_hand")[index]
      if (!el) return
      const touch = e.touches[0]
      this.$emit("chose_player_card", this.hand[index])
      ;(this as any).beginArrowDrawing(
        el,
        touch.clientX,
        touch.clientY,
        this.hand[index].faction
      )
    },
  },
  emits: [
    "chose_player_card",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
})
</script>

<style scoped>
.hand {
  width: 99%;
  margin-top: 2%;
}

.hand-list {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  flex-shrink: 1;
  margin: 0 10px;
  position: relative;
}

.card_wrap {
  z-index: var(--z);
  width: 26%;
  margin-left: -10%;
  margin-right: -10%;
  transform: rotate(var(--rot)) translateY(var(--arc));
  transform-origin: bottom center;
  transition: transform 0.2s ease;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.card_wrap:first-child {
  margin-left: -5%;
}
.card_wrap:last-child {
  margin-right: -5%;
}

.card_wrap:hover {
  transform: rotate(var(--rot)) translateY(calc(var(--arc) - 18px)) scale(1.12);
  z-index: 999;
}

.card_in_hand {
  width: 100%;
  border-radius: 2px;
}

.hand.modal-open .card_wrap:hover {
  transform: rotate(var(--rot)) translateY(var(--arc));
  z-index: var(--z);
}

/* Анимации */
.card-hand-enter-active {
  animation: card-deal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition: none;
}
.card-hand-leave-active {
  animation: card-play 0.45s ease-in both;
  position: absolute;
  pointer-events: none;
  z-index: 999;
  transition: none;
}
.card-hand-move {
  transition: transform 0.4s ease;
}

@keyframes card-deal {
  0% {
    opacity: 0;
    transform: translateY(90px) scale(0.55);
  }
  65% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(calc(var(--arc) - 18px))
      scale(1.07);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(var(--arc)) scale(1);
  }
}

@keyframes card-play {
  0% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(var(--arc)) scale(1);
  }
  30% {
    opacity: 1;
    transform: rotate(calc(var(--rot) * 0.3))
      translateY(calc(var(--arc) - 60px)) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: rotate(-5deg) translateY(-220px) scale(0.6);
  }
}
</style>
