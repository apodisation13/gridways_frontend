import { defineComponent } from "vue"
import { place_enemies } from "@/logic/game_logic/place_enemies"
import { enemy_leader_ai_move_once } from "@/logic/ai_move/ai_move"
import { draw_hand } from "@/logic/game_logic/draw_hand"
import type { Card } from "@/types"

export default defineComponent({
  methods: {
    start_game(): void {
      const deck: Card[] = this.$store.state.game.current_deck.map(
        (c: { card: Card }) => c.card
      )
      this.gameObj.deck = JSON.parse(JSON.stringify(deck))

      this.gameObj.leader = JSON.parse(
        JSON.stringify(this.$store.state.game.leader)
      )
      this.gameObj.enemy_leader = JSON.parse(
        JSON.stringify(this.$store.state.game.enemy_leader)
      )
      this.gameObj.enemies = JSON.parse(
        JSON.stringify(this.$store.state.game.level.enemies)
      )

      place_enemies(this.gameObj.field, this.gameObj.enemies)
      enemy_leader_ai_move_once(this.gameObj)
      draw_hand(this.gameObj.hand, this.gameObj.deck)

      this.draw = true
    },
  },
})
