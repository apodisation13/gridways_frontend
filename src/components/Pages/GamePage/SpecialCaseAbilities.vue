<template>
  <div>
    <!--отркывается по любой абилке где нужно окно, там отфильтрованные карты cards_pool-->
    <transition name="modal" appear>
      <modal-window v-if="show_pick_a_card_selection">
        <h4 class="special-ability-header">{{ card_ability }}</h4>
        <card-list-component
          v-if="!enemyView"
          :cards="cardPoolEntries"
          @chose_player_card="confirm_card_selection"
        />
        <enemy-list
          v-else
          :enemies="cards_pool"
          @chose-enemy="confirm_enemy_selection"
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
      <card-item v-if="!enemyView && pickedCard" :card="pickedCard" />
      <enemy-comp v-else-if="enemyView && pickedEnemy" :enemy="pickedEnemy" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import CardItem from "@/components/Cards/CardItem.vue"
import EnemyList from "@/components/Cards/EnemyList.vue"
import EnemyComp from "@/components/Cards/EnemyComp.vue"
import { arrowMixin } from "@/mixins/GamePage/arrow_draw"
import type { Card, CardEntry, Enemy } from "@/types"

export default defineComponent({
  name: "special-case-abilities",
  mixins: [arrowMixin],
  mounted() {
    ;(this as any).initArrowCanvas(999)
  },
  beforeUnmount() {
    ;(this as any).removeArrowCanvas()
  },
  components: {
    EnemyList,
    CardItem,
    EnemyComp,
    CardListComponent,
    ModalWindow,
  },
  props: {
    cards_pool: {
      required: true,
      type: Array as PropType<(Card | Enemy)[]>,
    },
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
      required: true,
      type: Boolean,
    },
    card_ability: {
      type: String,
      required: true,
    },
    field: {
      required: true,
      type: Array as PropType<(Enemy | "")[]>,
    },
  },

  data() {
    return {
      pickedCard: null as Card | null,
      pickedEnemy: null as Enemy | null,
    }
  },
  computed: {
    cardPoolEntries(): CardEntry[] {
      return (this.cards_pool as Card[]).map(card => ({
        card,
        count: 1,
        id: null,
      }))
    },
  },

  methods: {
    handleCardMouseDown(e: MouseEvent): void {
      e.preventDefault()
      e.stopPropagation()
      const faction = (this.pickedCard ?? this.pickedEnemy)?.faction
      ;(this as any).beginArrowDrawing(
        e.currentTarget,
        e.clientX,
        e.clientY,
        faction
      )
    },
    handleCardTouchStart(e: TouchEvent): void {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      const faction = (this.pickedCard ?? this.pickedEnemy)?.faction
      ;(this as any).beginArrowDrawing(
        e.currentTarget,
        touch.clientX,
        touch.clientY,
        faction
      )
    },

    confirm_card_selection(entry: CardEntry): void {
      this.$emit("confirm_selection", entry.card)
      this.pickedCard = entry.card
      this.pickedEnemy = null
    },
    confirm_enemy_selection(enemy: Enemy): void {
      this.forEnemy(enemy)
      this.$emit("confirm_selection", enemy)
      this.pickedEnemy = enemy
      this.pickedCard = null
    },
    forEnemy(enemy: Enemy): void {
      ;(enemy as any)["ability"] = {
        name: "damage-one",
        description: "Нанести {damage} урона одному врагу",
      }
      ;(enemy as any)["data"]["charges"] = 1
    },
  },
  emits: [
    "confirm_selection",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
})
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
