import { defineComponent } from "vue"

import { ai_move } from "@/logic/ai_move/ai_move"
import { enemy_passive_abilities_end_turn } from "@/logic/ai_move/ai_passive_abilties"
import { appear_new_enemy } from "@/logic/game_logic/place_enemies"
import { player_passive_abilities_end_turn } from "@/logic/player_move/player_passive_abilities"
import store from "@/store"

export default defineComponent({
  methods: {
    // нажал ПАС - переход хода компу
    exec_ai_move(): void {
      this.$store.commit("set_player_turn", false) // кнопка пас сразу пропала и дро тоже

      const timeout: number = store.getters["selectedMoveTimeout"]

      // А ДАЛЬШЕ последовательно выполняются
      // - пассивки карт игрока + пассивка лидера игрока
      // - ход компа
      // - пассивки самих врагов + пассивка лидера врагов
      // - появление нового врага
      // - переход хода снова игроку
      player_passive_abilities_end_turn(this.gameObj, timeout)

      const await_ppa_end_turn = setInterval(() => {
        if (!this.$store.state.game.ppa_end_turn) {
          console.log("закончили ppa_end_turn, начинает ходить комп")
          clearInterval(await_ppa_end_turn)
          ai_move(this.gameObj.field, timeout)

          const await_ai_move = setInterval(() => {
            if (!this.$store.state.game.ai_move) {
              console.log("закончили ходить комп, теперь пассивки врагов")
              clearInterval(await_ai_move)
              enemy_passive_abilities_end_turn(this.gameObj, timeout)

              const await_epa_end_turn = setInterval(() => {
                if (!this.$store.state.game.epa_end_turn) {
                  console.log(
                    "всё закончили, щас появится новый враг и можно ходить снова"
                  )
                  clearInterval(await_epa_end_turn)
                  appear_new_enemy(this.gameObj.field, this.gameObj.enemies)
                  this.isActive.player_cards = true
                  this.can_draw = this.calc_can_draw()
                  this.$store.commit("set_player_turn", true)
                }
              }, timeout * 0.5)
            }
          }, timeout * 0.5)
        }
      }, timeout * 0.5)
    },
  },
})
