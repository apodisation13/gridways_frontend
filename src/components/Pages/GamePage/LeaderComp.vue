<template>
  <div class="leader-comp">
    <card-item
      :card="leader"
      :user_card="leader"
      :class="{
        'not-charges': leader.charges === 0 && !leader.has_passive,
      }"
      :is_leader="true"
      :is_previev="leader.charges === 0 && !leader.has_passive"
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
  data() {
    return {
      isDrawingArrow: false,
      arrowStartX: 0,
      arrowStartY: 0,
      arrowCurrentX: 0,
      arrowCurrentY: 0,
      selectedCardIndex: -1,
      canvas: null,
      ctx: null,
    }
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
      if (this.leader.charges === 0) return
      const el = document.querySelector(".leader-comp")
      if (!el) return
      this.$emit("exec_leader")
      this.beginArrowDrawing(el, e.clientX, e.clientY, this.leader.faction)
    },
    handleCardTouchStart(e) {
      e.preventDefault()
      e.stopPropagation()
      if (this.leader.charges === 0) return
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

    get_target(elems, fire) {
      let elem = null
      elems.forEach(el => {
        if (
          el.className === "card-enemy-component" ||
          el.className === "enemy-leader"
        ) {
          console.log(el.className)
          elem = el
        }
      })
      return this.target_emit(elem, fire)
    },

    target_emit(elem, fire) {
      const id = elem?.id

      if (!id) {
        console.log("Цель не определена")
        this.$emit("enemy_leader_in_cross", false)
        this.$emit("enemy_in_cross", null)
        return false
      }

      if (id.includes("enemy_leader")) {
        console.log("ЭТО ЛИДЕР ВРАГА")
        if (fire) {
          this.$emit("enemy_leader_in_cross", false)
          this.$emit("target_enemy_leader")
          return false
        } else {
          if (this.$store.getters["animationOn"]) {
            this.$emit("enemy_leader_in_cross", true)
            return true
          }
        }
      }

      const index = parseInt(id.slice(id.indexOf("_") + 1)) // card.name_index - вот поэтому ищем _ +1, чтоб индекс поля
      console.log("ИНДЕКС КЛЕТКИ ПОЛЯ ВРАГА", index)
      if (fire) {
        this.$emit("enemy_in_cross", null)
        this.$emit("target_enemy", this.field[index])
        return false
      } else {
        if (this.$store.getters["animationOn"]) {
          this.$emit("enemy_in_cross", index)
          return true
        }
      }
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
