import { defineComponent } from "vue"

import { choice_pop } from "@/lib/utils"
import type { Card } from "@/types"

export default defineComponent({
  data() {
    return {
      redraws: 3, // ИЗНАЧАЛЬНОЕ ЗНАЧЕНИЕ 3, А ДАЛЬШЕ БУДЕТ 1!!!
      can_draw: false, // возможность вытянуть карту
      draw: false, // показать ли модальное окно с редро
      initialHandSize: 0, // штука для анимации руки, появление и исчезновение
    }
  },
  methods: {
    // можно ли ДРО - ход игрока, карт меньше чем {карт_в_руке}, дека не пуста
    calc_can_draw(): boolean {
      return (
        // this.player_cards_active &&
        this.gameObj.hand.length < this.$store.getters["handSize"] &&
        this.gameObj.deck.length !== 0
      )
    },

    // тянем одну карту из деки, блокируем карты игрока чтобы ходить было нельзя
    draw_one_card(): void {
      this.initialHandSize = this.gameObj.hand.length // штука для анимации руки
      if (this.calc_can_draw()) {
        const card1: Card = choice_pop(this.gameObj.deck)
        this.gameObj.hand.push(card1)
      }
      if (this.calc_can_draw()) {
        const card2: Card = choice_pop(this.gameObj.deck)
        this.gameObj.hand.push(card2)
      }
      this.draw = true // показать окно редро
      this.isActive.player_cards = false
      this.can_draw = false
    },

    redraw_finished(dict: { hand: Card[]; deck: Card[] }): void {
      this.draw = false // закрыть модальное окно с редро
      this.gameObj.hand = dict.hand
      this.gameObj.deck = dict.deck
      this.redraws = 1 // после первого редро устанавливаем до конца игры значение 1
    },
  },
})
