<template>
  <div>
    <!--отркывается по любой абилке где нужно окно, там отфильтрованные карты cards_pool-->
    <transition name="modal" appear>
      <modal-window v-if="show_pick_a_card_selection">
        <h4 class="special-ability-header">{{ card_ability }}</h4>
        <card-list-component
          v-if="!enemyView"
          :cards="cards_pool"
          @chose_player_card="confirm_selection"
        />
        <enemy-list
          v-else
          :enemies="cards_pool"
          @chose-enemy="confirm_selection"
        />
      </modal-window>
    </transition>

    <!--а тут только 1 выбранная карта, при абилках играть play_from-->
    <div
      class="chosen_card_from_deck"
      v-if="show_picked_card"
      @mousedown="handleCardMouseDown($event)"
      @touchstart="handleCardTouchStart($event)"
    >
      <card-item :card="picked_card" />
    </div>
  </div>
</template>

<script>
import ModalWindow from "@/components/ModalWindows/ModalWindow"
import CardListComponent from "@/components/Cards/CardListComponent"
import CardItem from "@/components/Cards/CardItem"
import EnemyList from "@/components/Cards/EnemyList.vue"
import { arrowMixin } from "@/mixins/GamePage/arrow_draw"
export default {
  name: "special-case-abilities",
  mixins: [arrowMixin],
  mounted() {
    this.initArrowCanvas(999)
  },
  beforeUnmount() {
    this.removeArrowCanvas()
  },
  components: { EnemyList, CardItem, CardListComponent, ModalWindow },
  props: {
    cards_pool: {
      required: true,
      type: Array,
    },
    // если мы играем как-то врагов, то пришлем этот флаг
    enemyView: {
      required: false,
      default: false,
      type: Boolean,
    },
    show_pick_a_card_selection: {
      required: true,
      type: Boolean,
    },
    show_picked_card: {
      // флаг, показывать ли саму выбранную карту из колоды
      required: true,
      type: Boolean,
    },
    // это описание абилки той карты, которую мы изначально играли
    card_ability: {
      type: String,
      required: true,
    },
    // это для рисования стрелки
    field: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      picked_card: null,
    }
  },

  methods: {
    handleCardMouseDown(e) {
      e.preventDefault()
      e.stopPropagation()
      this.beginArrowDrawing(
        e.currentTarget,
        e.clientX,
        e.clientY,
        this.picked_card.faction
      )
    },
    handleCardTouchStart(e) {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      this.beginArrowDrawing(
        e.currentTarget,
        touch.clientX,
        touch.clientY,
        this.picked_card.faction
      )
    },

    confirm_selection(card) {
      // добавим врагу костыль, если мы его играем!
      if (this.enemyView) this.forEnemy(card)
      this.$emit("confirm_selection", card)
      this.picked_card = card
    },
    // если мы играем ВРАГА, у него нет абилки никакой, эта функция добавит ему базовую абилку на урон одному
    forEnemy(card) {
      card["ability"] = {
        name: "damage-one",
        description: "Нанести {damage} урона одному врагу",
      }
      card["charges"] = 1
    },
  },
  emits: [
    "confirm_selection",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
}
</script>

<style scoped>
.chosen_card_from_deck {
  width: 24%;
  position: absolute;
  top: 34%;
  height: 20vh;
  right: 1%;
  z-index: 999999;
}
.special-ability-header {
  color: white;
}
.modal-enter-active {
  animation: modal-fade-in 0.5s ease-out;
}
.modal-leave-active {
  animation: modal-fade-out 0.25s ease-in;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
