import { defineComponent } from "vue"

import { choice_pop } from "@/lib/utils"
import type { Card } from "@/types"
import {
  get_value_from_upgrades,
  UpgradeSubtype,
  UpgradeType,
} from "@/types/upgrades"

export default defineComponent({
  data() {
    return {
      // ИЗНАЧАЛЬНОЕ ЗНАЧЕНИЕ из апгрейдов юзера, И ДАЛЬШЕ БУДЕТ оттуда же!!!
      redraws: get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.REDRAWS_INITIAL
      ),
      // Запас редро полной руки на эту игру; обычный добор его не расходует.
      fullHandRedrawsRemaining: Number(
        this.$store.getters["fullHandRedraw"] ?? 0
      ),
      can_draw: false, // возможность вытянуть карту
      initialRedrawPending: true, // признак чтобы первый раз расчитать - можем ли тянуть карту при полной руке
      draw: false, // показать ли модальное окно с редро
      initialHandSize: 0, // штука для анимации руки, появление и исчезновение
    }
  },
  methods: {
    // Кнопка доступна для добора или редро полной руки; колода нужна в обоих случаях.
    calc_can_draw(): boolean {
      // колода пуста - тянуть не можем
      if (this.gameObj.deck.length === 0) return false

      // рука не полна? тогда логика обычного дро
      const handSize = this.$store.getters["handSize"]
      if (this.gameObj.hand.length < handSize) return true

      // рука полна? проверяем апгрейд и еще апгрейд на количество редро карт
      return (
        this.gameObj.hand.length === handSize &&
        this.fullHandRedrawsRemaining > 0 &&
        get_value_from_upgrades(
          this.$store.getters["upgradesConfig"],
          this.$store.getters["userUpgrades"],
          UpgradeType.GAME,
          UpgradeSubtype.REDRAWS_DRAWN
        ) > 0
      )
    },

    // тянем карты из деки по количеству из апгрейдов, блокируем карты игрока чтобы ходить было нельзя
    draw_one_card(): void {
      if (this.draw) return
      if (this.gameObj.hand.length >= this.$store.getters["handSize"]) {
        if (!this.calc_can_draw() || this.redraws <= 0) return
        this.fullHandRedrawsRemaining -= 1
      }
      this.initialHandSize = this.gameObj.hand.length // штука для анимации руки
      const cardsDrawn = get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.CARDS_DRAWN
      )
      for (let i = 0; i < cardsDrawn; i++) {
        if (
          this.gameObj.hand.length >= this.$store.getters["handSize"] ||
          this.gameObj.deck.length === 0
        )
          break
        this.gameObj.hand.push(choice_pop(this.gameObj.deck) as Card)
      }
      if (this.redraws !== 0) this.draw = true // показать окно редро, если не 0 там
      this.isActive.player_cards = false
      this.can_draw = false
    },

    redraw_finished(dict: { hand: Card[]; deck: Card[] }): void {
      this.draw = false // закрыть модальное окно с редро
      this.gameObj.hand = dict.hand
      this.gameObj.deck = dict.deck
      // после первого редро устанавливаем до конца игры значение апгрейда юзера
      this.redraws = get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.REDRAWS_DRAWN
      )
      if (this.initialRedrawPending) {
        this.initialRedrawPending = false
        this.can_draw = this.calc_can_draw()
      }
    },
  },
})
