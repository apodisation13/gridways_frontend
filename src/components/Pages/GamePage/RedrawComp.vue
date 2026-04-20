<template>
  <modal-window class="redraw-modal-window" v-if="visible">
    <button-close @close_self="close_self" />

    <h3 class="text">Это ваша рука</h3>
    <card-list-component :cards="hand" @chose_player_card="chose_player_card" />

    <div>
      <h1 class="text">Изменить карту можно ещё {{ redraws }} раз</h1>
    </div>
    <h2 class="text">В колоде осталось ещё {{ deck.length }} карт</h2>
    <card-list-component :cards="deck" />
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import { choice } from "@/lib/utils"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import type { Card, GameObj } from "@/types"

export default defineComponent({
  name: "redraw-comp",
  components: { CardListComponent, ButtonClose, ModalWindow },
  props: {
    gameObj: {
      required: true,
      type: Object as PropType<GameObj>,
    },
    redrawNumber: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      visible: true,
      redraws: this.redrawNumber,
      hand: this.gameObj.hand.slice() as Card[],
      deck: this.gameObj.deck.slice() as Card[],
      redraw_array: [] as Card[],
    }
  },
  created() {
    if (!this.gameObj.deck.length) this.close_self()
  },
  methods: {
    close_self(): void {
      this.visible = false

      this.redraw_array.forEach(element => {
        this.deck.push(element)
      })

      this.$emit("redraw_finished", {
        deck: this.deck,
        hand: this.hand,
      })
    },

    chose_player_card(card: Card): void {
      this.redraws -= 1
      this.redraw_array.push(card)
      const random = choice(this.deck)
      this.hand.splice(this.hand.indexOf(card), 1, this.deck[random])
      this.deck.splice(random, 1)
      if (this.redraws === 0 || !this.deck.length) this.close_self()
    },
  },
})
</script>

<style scoped>
.redraw-modal-window {
  overflow-y: scroll;
}
.text {
  color: white;
  margin-top: 1vh;
}
</style>
