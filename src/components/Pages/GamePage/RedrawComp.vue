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

<script>
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import { choice } from "@/lib/utils"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
export default {
  name: "redraw-comp",
  components: { CardListComponent, ButtonClose, ModalWindow },
  data() {
    return {
      visible: true,
      redraws: this.redrawNumber,
      hand: this.gameObj.hand.slice(),
      deck: this.gameObj.deck.slice(),
      redraw_array: [],
    }
  },
  props: {
    gameObj: {
      required: true,
      type: Object,
    },
    redrawNumber: {
      type: Number,
      required: true,
    },
  },
  created() {
    if (!this.gameObj.deck.length) this.close_self()
  },
  methods: {
    close_self() {
      this.visible = false

      this.redraw_array.forEach(element => {
        this.deck.push(element) // вернуть в деку карты
      })

      this.$emit("redraw_finished", {
        deck: this.deck,
        hand: this.hand,
      })
    },

    chose_player_card(card) {
      this.redraws -= 1
      this.redraw_array.push(card) // добавили карту в темп-список
      let random = choice(this.deck)
      // заменяем ту карту, на которую ткнули, на новую случайную карту из колоды
      this.hand.splice(this.hand.indexOf(card), 1, this.deck[random])
      this.deck.splice(random, 1) // удалить этот i-й элемент
      if (this.redraws === 0 || !this.deck.length) this.close_self()
    },
  },
}
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
