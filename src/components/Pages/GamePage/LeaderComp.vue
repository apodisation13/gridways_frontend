<template>
  <div class="leader-comp">
    <card-item
      :card="leader"
      :class="{
        'not-charges':
          leader.data.charges === 0 && !leader.passive_ability?.name,
      }"
      :is_leader="true"
      :is_previev="leader.data.charges === 0 && !leader.passive_ability?.name"
      @mousedown="handleCardMouseDown($event)"
      @touchstart="handleCardTouchStart($event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardItem from "@/components/Cards/CardItem.vue"
import { arrowMixin } from "@/mixins/GamePage/arrow_draw"
import type { Enemy, Leader } from "@/types"

export default defineComponent({
  components: {
    CardItem,
  },
  mixins: [arrowMixin],
  props: {
    leader: {
      required: true,
      type: Object as PropType<Leader>,
    },
    field: {
      required: false,
      type: Array as PropType<(Enemy | "")[]>,
      default: () => [],
    },
  },

  emits: [
    "exec_leader",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
  mounted() {
    ;(this as any).initArrowCanvas(9998)
    window.addEventListener("resize", (this as any).handleResize)
  },
  beforeUnmount() {
    window.removeEventListener("resize", (this as any).handleResize)
    ;(this as any).removeArrowCanvas()
  },
  methods: {
    handleCardMouseDown(e: MouseEvent): void {
      e.preventDefault()
      e.stopPropagation()
      if (this.leader.data.charges === 0) return
      const el = document.querySelector(".leader-comp")
      if (!el) return
      this.$emit("exec_leader")
      ;(this as any).beginArrowDrawing(
        el,
        e.clientX,
        e.clientY,
        this.leader.faction
      )
    },
    handleCardTouchStart(e: TouchEvent): void {
      e.preventDefault()
      e.stopPropagation()
      if (this.leader.data.charges === 0) return
      const el = document.querySelector(".leader-comp")
      if (!el) return
      const touch = e.touches[0]
      this.$emit("exec_leader")
      ;(this as any).beginArrowDrawing(
        el,
        touch.clientX,
        touch.clientY,
        this.leader.faction
      )
    },
  },
})
</script>

<style scoped>
.leader-comp {
  width: 100%;
  max-width: calc(var(--vh, 1vh) * 12);
  margin: 0 auto;
}
</style>

<style>
/* добавляем псевдоэлемент к семантичному селектору card-item-component*/
.not-charges > div.card-item-component::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
