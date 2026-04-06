<template>
  <div class="leader-comp">
    <card-item
      :card="leader"
      :user_card="leader"
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

<script>
import CardItem from "@/components/Cards/CardItem.vue"
import { arrowMixin } from "@/mixins/GamePage/arrow_draw"
export default {
  components: {
    CardItem,
  },
  mixins: [arrowMixin],
  props: {
    leader: {
      required: true,
      type: Object,
    },
    field: {
      required: false,
      type: Array,
    },
  },
  mounted() {
    this.initArrowCanvas(9998)
    window.addEventListener("resize", this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize)
    this.removeArrowCanvas()
  },
  methods: {
    handleCardMouseDown(e) {
      e.preventDefault()
      e.stopPropagation()
      if (this.leader.data.charges === 0) return
      const el = document.querySelector(".leader-comp")
      if (!el) return
      this.$emit("exec_leader")
      this.beginArrowDrawing(el, e.clientX, e.clientY, this.leader.faction)
    },
    handleCardTouchStart(e) {
      e.preventDefault()
      e.stopPropagation()
      if (this.leader.data.charges === 0) return
      const el = document.querySelector(".leader-comp")
      if (!el) return
      const touch = e.touches[0]
      this.$emit("exec_leader")
      this.beginArrowDrawing(
        el,
        touch.clientX,
        touch.clientY,
        this.leader.faction
      )
    },
  },

  emits: [
    "exec_leader",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
}
</script>

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
