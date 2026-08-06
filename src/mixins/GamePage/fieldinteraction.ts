import { defineComponent } from "vue"

import { copyObj } from "@/lib/utils"
import { mine_placed, rain_applied } from "@/logic/play_sounds"
import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Card, EffectObject, Leader } from "@/types"
import { EffectType } from "@/types"

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
      this.gameObj.effects[emptyCellIndex] = copyObj(fi)
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
      if (fi.type === EffectType.Mine) {
        mine_placed()
      } else if (fi.type === EffectType.Rain) {
        rain_applied()
      }
      change_card_charges(card, -1, this.$store.getters["selectedMoveTimeout"])
      if (!this.sca && "color" in card) this.isActive.player_cards = false
      this.afterDamage()
    },
  },
})
