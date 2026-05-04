<template>
  <div class="game-page">
    <div class="game-block">
      <!-- поле с врагами -->
      <field-comp
        :field="gameObj.field"
        :in_cross_enemy_index="inCrossEnemyIndex"
        @exec_damage_ai_card="exec_damage_enemy_card"
      />

      <!-- правая часть экрана -->
      <div class="right-panel">
        <!-- лидер врага -->
        <enemy-leader
          :enemy_leader="gameObj.enemy_leader"
          :in_cross="inCrossEnemyLeader"
          @exec_enemy_leader="exec_damage_enemy_leader"
        />

        <!-- колода оставшихся врагов и кладбище врагов -->
        <div class="div-two-buttons">
          <remaining-enemies
            :enemies="gameObj.enemies"
            :enemy_leader="gameObj.enemy_leader"
          />
          <enemies-grave
            :enemies_grave="gameObj.enemies_grave"
            :enemy_leader="gameObj.enemy_leader"
          />
        </div>

        <!-- возможность вытянуть карту, дро -->
        <div class="draw">
          <draw-comp
            v-show="can_draw && $store.state.game.player_turn"
            @click="draw_one_card"
          />
        </div>

        <!-- чисто кнопка пас -->
        <pass-comp @dblclick="exec_ai_move" />

        <!-- кнопки кладбища и колоды -->
        <div class="div-two-buttons">
          <deck-comp :deck="gameObj.deck" :leader="gameObj.leader" />
          <grave-comp :grave="gameObj.grave" :leader="gameObj.leader" />
        </div>

        <!-- лидер игрока -->
        <leader-comp
          :leader="gameObj.leader"
          :field="gameObj.field"
          :enemy_leader="gameObj.enemy_leader"
          @exec_leader="chose_leader"
          @target_enemy="exec_damage_enemy_card"
          @target_enemy_leader="exec_damage_enemy_leader"
          @enemy_leader_in_cross="switch_enemy_leader_in_cross"
          @enemy_in_cross="switch_enemy_in_cross"
        />

        <!-- Просто полоска с жизнями (пока что) -->
        <health-comp />
      </div>
    </div>

    <hand-comp
      :hand="gameObj.hand"
      :field="gameObj.field"
      :enemy_leader="gameObj.enemy_leader"
      :player_cards_active="isActive.player_cards"
      :drawing="draw"
      :initial-hand-size="initialHandSize"
      @chose_player_card="chose_player_card"
      @target_enemy="exec_damage_enemy_card"
      @target_enemy_leader="exec_damage_enemy_leader"
      @enemy_leader_in_cross="switch_enemy_leader_in_cross"
      @enemy_in_cross="switch_enemy_in_cross"
    />

    <special-case-abilities
      :show_pick_a_card_selection="show_pick_a_card_selection"
      :cards_pool="cards_pool"
      :show_picked_card="show_picked_card"
      :enemyView="enemyView"
      :card_ability="selectedCardAbilityDescription"
      :field="gameObj.field"
      @confirm_selection="confirm_selection"
      @target_enemy="exec_damage_enemy_card"
      @target_enemy_leader="exec_damage_enemy_leader"
      @enemy_leader_in_cross="switch_enemy_leader_in_cross"
      @enemy_in_cross="switch_enemy_in_cross"
    />

    <transition name="modal" appear>
      <redraw-comp
        v-if="draw"
        :game-obj="gameObj"
        :redraw-number="redraws"
        @redraw_finished="redraw_finished"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import EnemyLeader from "@/components/Cards/EnemyLeader.vue"
import DeckComp from "@/components/Pages/GamePage/DeckComp.vue"
import DrawComp from "@/components/Pages/GamePage/DrawComp.vue"
import EnemiesGrave from "@/components/Pages/GamePage/EnemiesGrave.vue"
import RemainingEnemies from "@/components/Pages/GamePage/EnemiesRemaining.vue"
import FieldComp from "@/components/Pages/GamePage/FieldComp.vue"
import GraveComp from "@/components/Pages/GamePage/GraveComp.vue"
import HandComp from "@/components/Pages/GamePage/HandComp.vue"
import HealthComp from "@/components/Pages/GamePage/HealthComp.vue"
import LeaderComp from "@/components/Pages/GamePage/LeaderComp.vue"
import PassComp from "@/components/Pages/GamePage/PassComp.vue"
import RedrawComp from "@/components/Pages/GamePage/RedrawComp.vue"
import SpecialCaseAbilities from "@/components/Pages/GamePage/SpecialCaseAbilities.vue"
import { damage_ai_card } from "@/logic/player_move/player_move"
import { remove_dead_card } from "@/logic/player_move/service/service_for_player_move"
import draw from "@/mixins/GamePage/draw"
import execaimove from "@/mixins/GamePage/execaimove"
import specialcaseabilities from "@/mixins/GamePage/specialcaseabilities"
import startgame from "@/mixins/GamePage/startgame"
import type {
  Card,
  Enemy,
  EnemyLeader as EnemyLeaderType,
  GameObj,
  IsActive,
  Leader,
} from "@/types"

export default defineComponent({
  components: {
    RedrawComp,
    FieldComp,
    EnemyLeader,
    RemainingEnemies,
    EnemiesGrave,
    DrawComp,
    PassComp,
    DeckComp,
    GraveComp,
    LeaderComp,
    HealthComp,
    HandComp,
    SpecialCaseAbilities,
  },
  mixins: [draw, specialcaseabilities, execaimove, startgame],

  data() {
    return {
      // объект со всеми параметрами игры
      gameObj: {
        deck: [] as Card[], // остаток сколько карт осталось в колоде
        hand: [] as Card[],
        leader: null as Leader | null,
        grave: [] as Card[], // кладбище карт у которых 0 зарядов
        field: ["", "", "", "", "", "", "", "", "", "", "", ""] as (
          | Enemy
          | ""
        )[],
        enemy_leader: null as EnemyLeaderType | null,
        enemies: [] as Enemy[], // колода врагов, приходит из start_game
        enemies_grave: [] as Enemy[], // кладбище врагов
      } as GameObj,
      // объект активны ли разные карты, то есть можно ли на них тыкать
      isActive: {
        player_cards: true, // карты в руке всегда активны в начале хода, но после хода не активны до след хода
        player_leader: false,
        enemy_cards: false,
        enemy_leader: false,
      } as IsActive,
      selected_card: null as Card | Leader | null, // объект выбранной карты путём дважды ЛКМ на карте в руке
      selected_enemy: null as Enemy | null, // объект выбранного врага, по которому ткнули дважды ЛКМ, из field-comp

      // если лидер врагов или враг под прицелом, у него будет анимация свечения
      inCrossEnemyLeader: false,
      inCrossEnemyIndex: null as number | null,
    }
  },
  computed: {
    // можем ли мы сыграть КАРТОЙ в ПОЛЕ: карты активны, лидер неактивен ИЛИ мы играем карту из sca
    targetEnemyByCard(): boolean {
      return !!(
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_cards &&
          this.selected_enemy) ||
        this.sca
      )
    },
    // можем ли мы сыграть ЛИДЕРОМ в ПОЛЕ: лидер активен, у него больше нуля зарядов
    targetEnemyByLeader(): boolean {
      return !!(
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_cards &&
        this.selected_enemy
      )
    },
    // можем ли мы сыграть КАРТОЙ в ЛИДЕРА ВРАГОВ: карты активны, лидер неактивен ИЛИ мы играем карту из sca
    targetEnemyLeaderByCard(): boolean {
      return (
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_leader &&
          this.gameObj.enemy_leader.data.hp > 0) ||
        this.sca
      )
    },
    // можем ли мы сыграть ЛИДЕРОМ в ЛИДЕРА ВРАГОВ: лидеры активны, у них больше нуля зарядов и нуля жизней
    targetEnemyLeaderByLeader(): boolean {
      return (
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_leader &&
        this.gameObj.enemy_leader.data.hp > 0
      )
    },
  },

  async created(): Promise<void> {
    // если мы перешли на эту страницу НЕ со страницы начала игры, где стоит этот флаг, нас отсюда перекинет
    if (!this.$store.state.game.start_game_redirect) {
      this.$router.push("/start_game")
    }
    this.$store.commit("set_start_game_redirect", false)
    this.start_game() // в МИКСИНЕ теперь
  },

  methods: {
    // по нажатию на карту игрока, из hand-comp, card - вся карта целиком
    chose_player_card(card: Card): void {
      this.sca = false // как только потянули за карту из руки сразу скинули этот признак игры доп карты
      if (!this.isActive.player_cards) return
      this.selected_card = card // ВОТ ЗДЕСЬ МЫ ЗАПОМНИЛИ КАРТУ ИЗ РУКИ НА КОТОРУЮ ТКНУЛИ
      this.isActive.player_leader = false // лидер игрока теперь неактивен
      this.setActive()
    },

    // по нажатию на лидера игрока
    chose_leader(): void {
      this.sca = false // или если потянули за лидера сразу скинули этот признак игры доп карты
      if (this.gameObj.leader.data.charges <= 0) return
      this.selected_card = this.gameObj.leader // ВОТ ЗДЕСЬ МЫ ЗАПОМНИЛИ ЛИДЕРА ДЛЯ special_case
      this.isActive.player_leader = true
      this.setActive()
    },

    // поле и лидер врагов - теперь активны, КАЖДЫЙ РАЗ при выборе карты или лидера
    setActive(): void {
      this.isActive.enemy_cards = true // только теперь можно тыкать на карты противника!!!
      this.isActive.enemy_leader = true // и лидер врагов активен тоже
    },
    setNotActive(): void {
      this.isActive.enemy_cards = false
      this.isActive.enemy_leader = false
    },

    // после хода картой или лидером, открываем sp-case-abilities, обнуляем карту которой изначально играли
    afterDamage(): void {
      // особые абилки, которые требуют открытия окон
      this.special_case_abilities()
      // если не надо играть особые абилки, сбрасываем карту в сброс СРАЗУ тут же
      // а если надо, то сбросим ПОСЛЕ того как закроем окно с выбором карты, чтобы анимации увидеть тут
      if (!this.show_pick_a_card_selection) {
        remove_dead_card(
          this.selected_card!,
          this.gameObj.grave,
          this.gameObj.hand,
          this.gameObj.deck
        )
      }
      this.selected_card = null // обнуляем карту, за которую изначально тянули
      this.show_picked_card = false // из specialcaseabilities.js!!!
      this.setNotActive()
    },

    // если ткнули ранее на карту игрока или лидера, а потом на поле, ходим // enemy - объект врага (field[i])
    exec_damage_enemy_card(enemy: Enemy | ""): void {
      if (!enemy) return
      this.selected_enemy = enemy as Enemy
      this.can_draw = false // если хотя бы раз сюда попали, то дро нельзя
      // далее выполним ИЛИ одну функцию, ИЛИ другую! то есть или картой выстрелим, или лидером
      this.damageEnemyByCard()
      this.damageEnemyByLeader()
    },

    // если ранее ткнули на карту игрока, а потом на поле
    damageEnemyByCard(): void {
      if (!this.targetEnemyByCard) return

      damage_ai_card(this.selected_card!, this.selected_enemy!, this.gameObj)

      // снимаем флаг активности карт игрока, ОДНА КАРТА ЗА ХОД! станет ТРУ только после окончания хода компа!
      // если мы играли первый раз картой из руки, то всё равно заблокируем руку, так как sca ЕЩЁ не было на тот момент
      // если мы играем доп картой из лидера, то sca будет ТРУ на момент игры доп карты, и рука не будет заблокирована
      if (!this.sca) this.isActive.player_cards = false
      this.afterDamage()
    },
    // если ранее ткнули на лидера, а потом на поле
    damageEnemyByLeader(): void {
      if (!this.targetEnemyByLeader) return

      damage_ai_card(this.gameObj.leader!, this.selected_enemy!, this.gameObj)
      this.afterDamage()
      this.isActive.player_leader = false // лидер снова неактивен, чтобы ходить им снова - надо опять на него тыкать
    },

    // если ранее ткнули на карту игрока или лидера игрока, а потом на лидера врагов!
    exec_damage_enemy_leader(): void {
      this.can_draw = false
      // аналогично, выполняем только одну из этих функций, бьем лидера врагов или картой, или своим лидером
      this.damageEnemyLeaderByCard()
      this.damageEnemyLeaderByLeader()
    },

    damageEnemyLeaderByCard(): void {
      if (!this.targetEnemyLeaderByCard) return

      damage_ai_card(
        this.selected_card!,
        this.gameObj.enemy_leader!,
        this.gameObj
      )
      if (!this.sca) this.isActive.player_cards = false
      this.afterDamage()
    },
    // ткнули на лидера игрока, а потом на лидера врагов
    damageEnemyLeaderByLeader(): void {
      if (!this.targetEnemyLeaderByLeader) return

      damage_ai_card(
        this.gameObj.leader!,
        this.gameObj.enemy_leader!,
        this.gameObj
      )
      this.afterDamage()
      this.isActive.player_leader = false // лидер снова неактивен, чтобы ходить им снова - надо опять на него тыкать
    },
    // переключить анимацию, что лидер врагов под целью мышки
    switch_enemy_leader_in_cross(in_cross: boolean): void {
      this.inCrossEnemyIndex = null
      this.inCrossEnemyLeader = in_cross
    },
    switch_enemy_in_cross(index: number | null): void {
      // index - это или null если мы ушли мышкой с клетки поля, или индекс поля врага
      this.inCrossEnemyLeader = false
      this.inCrossEnemyIndex = index
    },
  },
})
</script>

<style scoped>
/* стилизация всей страницы */
.game-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
}

.game-block {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
}

/* Панель справа - лидер врага, кнопки, пас, лидер игрока */
.right-panel {
  width: 24.5%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* или flex-start */
  gap: min(8px, calc(var(--vh, 1vh) * 1));
}

.div-two-buttons {
  height: 7.5vh;
  width: 98%;
  display: flex;
  flex-direction: row;
  gap: 1px;
}

.draw {
  height: 6.3vh;
  width: 98%;
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
