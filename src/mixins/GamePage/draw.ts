import { defineComponent } from "vue"
import { choice_pop } from "@/lib/utils"
import type { Card } from "@/types"

export default defineComponent({
  data() {
    return {
      redraws: 3,
      can_draw: false,
      draw: false,
      initialHandSize: 0,
    }
  },
  methods: {
    calc_can_draw(): boolean {
      return (
        this.gameObj.hand.length < this.$store.state.game.hand_size &&
        this.gameObj.deck.length !== 0
      )
    },

    draw_one_card(): void {
      this.initialHandSize = this.gameObj.hand.length
      if (this.calc_can_draw()) {
        const card1: Card = choice_pop(this.gameObj.deck)
        this.gameObj.hand.push(card1)
      }
      if (this.calc_can_draw()) {
        const card2: Card = choice_pop(this.gameObj.deck)
        this.gameObj.hand.push(card2)
      }
      this.draw = true
      this.isActive.player_cards = false
      this.can_draw = false
    },

    redraw_finished(dict: { hand: Card[]; deck: Card[] }): void {
      this.draw = false
      this.gameObj.hand = dict.hand
      this.gameObj.deck = dict.deck
      this.redraws = 1
    },
  },
})
