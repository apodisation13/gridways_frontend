import { defineComponent } from "vue"

import { copyObj } from "@/lib/utils"
import { effectsSounds } from "@/logic/game_logic/effects"
import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import { Card, CardAbility, EffectObject, Leader } from "@/types"

export default defineComponent({
  data() {
    return {
      inCrossCellIndex: null as number | null,
      multiLockedCellIndices: [] as number[],
    }
  },
  methods: {
    // выстрел по пустым клеткам картами с field_interaction в card.data
    target_empty_cell(emptyCellIndex: number): void {
      const card: Card | Leader = this.selected_card!
      this.inCrossCellIndex = null

      const fi = card.data.field_interaction
      if (!fi) return

      if (card.ability.name === CardAbility.SpawnEffect) {
        this.gameObj.effects[emptyCellIndex] = copyObj(fi)
      } else if (card.ability.name === CardAbility.SpawnEffectRow) {
        const min = Math.floor(emptyCellIndex / 3) * 3
        const max = min + 3
        for (let i = min; i < max; i++) {
          this.gameObj.effects[i] = copyObj(fi)
        }
      } else if (card.ability.name === CardAbility.SpawnEffectColumn) {
        const index = emptyCellIndex % 3
        const indexes = [index, index + 3, index + 6, index + 9]
        indexes.forEach(i => {
          this.gameObj.effects[i] = copyObj(fi)
        })
      }
      this.after_cells_interaction(fi)
    },
    target_empty_cell_multi(indexes: number[]): void {
      const card: Card | Leader = this.selected_card!
      this.inCrossCellIndex = null
      this.multiLockedCellIndices = []
      const fi = card.data.field_interaction
      if (!fi) return
      for (const idx of indexes) {
        this.gameObj.effects[idx] = copyObj(fi)
      }
      this.after_cells_interaction(fi)
    },
    after_cells_interaction(fi: EffectObject): void {
      const card: Card | Leader = this.selected_card!
      effectsSounds(fi)
      change_card_charges(card, -1, this.$store.getters["selectedMoveTimeout"])
      if (!this.sca && "color" in card) this.isActive.player_cards = false
      this.afterDamage()
    },
  },
})
