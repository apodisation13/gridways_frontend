<template>
  <div class="game-page">
    <div class="game-block">
      <field-comp
        :field="gameObj.field"
        :in_cross_enemy_index="inCrossEnemyIndex"
        :multi_locked_indices="multiLockedIndices"
        @exec_damage_ai_card="exec_damage_enemy_card"
      />

      <div class="right-panel">
        <enemy-leader
          :enemy_leader="gameObj.enemy_leader"
          :in_cross="inCrossEnemyLeader"
          @exec_enemy_leader="exec_damage_enemy_leader"
        />

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

        <div class="draw">
          <draw-comp
            v-show="can_draw && $store.state.game.player_turn"
            @click="draw_one_card"
          />
        </div>

        <pass-comp @dblclick="exec_ai_move" />

        <div class="div-two-buttons">
          <deck-comp :deck="gameObj.deck" :leader="gameObj.leader" />
          <grave-comp :grave="gameObj.grave" :leader="gameObj.leader" />
        </div>

        <leader-comp
          :leader="gameObj.leader"
          :field="gameObj.field"
          :enemy_leader="gameObj.enemy_leader"
          @exec_leader="chose_leader"
          @target_enemy="exec_damage_enemy_card"
          @target_enemy_leader="exec_damage_enemy_leader"
          @enemy_leader_in_cross="switch_enemy_leader_in_cross"
          @enemy_in_cross="switch_enemy_in_cross"
          @enemy_in_cross_locked="switch_enemy_in_cross_locked"
          @target_enemy_multi="exec_damage_enemy_card_multi"
        />

        <health-comp
          style="cursor: pointer"
          @click="show_special_items = true"
        />
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
      @enemy_in_cross_locked="switch_enemy_in_cross_locked"
      @target_enemy_multi="exec_damage_enemy_card_multi"
    />

    <special-case-abilities
      :show_pick_a_card_selection="show_pick_a_card_selection"
      :cards_pool="cards_pool"
      :show_picked_card="show_picked_card"
      :enemyView="enemyView"
      :card_ability="selectedCardAbilityDescription"
      :field="gameObj.field"
      :enemy_leader="gameObj.enemy_leader"
      @confirm_selection="confirm_selection"
      @target_enemy="exec_damage_enemy_card"
      @target_enemy_leader="exec_damage_enemy_leader"
      @enemy_leader_in_cross="switch_enemy_leader_in_cross"
      @enemy_in_cross="switch_enemy_in_cross"
      @enemy_in_cross_locked="switch_enemy_in_cross_locked"
      @target_enemy_multi="exec_damage_enemy_card_multi"
    />

    <transition name="modal" appear>
      <redraw-comp
        v-if="draw"
        :game-obj="gameObj"
        :redraw-number="redraws"
        @redraw_finished="redraw_finished"
      />
    </transition>

    <use-special-items-component
      v-if="show_special_items"
      @close="show_special_items = false"
    />

    <!-- Ожидание инициализации (гость ждёт GAME_INIT от хоста) -->
    <div v-if="!gameInitialized" class="init-overlay">
      <div class="init-card">
        <div class="spinner" />
        <div class="init-text">Ожидание данных от хоста...</div>
      </div>
    </div>

    <!-- Противник отключился -->
    <div v-if="disconnectCountdown !== null" class="disconnect-overlay">
      <div class="disconnect-card">
        <div class="disconnect-icon">⚠</div>
        <div class="disconnect-title">Противник отключился</div>
        <div class="disconnect-sub">Возврат на выбор уровня через</div>
        <div class="disconnect-timer">{{ disconnectCountdown }}</div>
      </div>
    </div>
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
import UseSpecialItemsComponent from "@/components/Pages/GamePage/UseSpecialItemsComponent.vue"
import { enemy_leader_ai_move_once } from "@/logic/ai_move/ai_move"
import { draw_hand } from "@/logic/game_logic/draw_hand"
import { place_enemies } from "@/logic/game_logic/place_enemies"
import {
  damage_ai_card,
  damage_ai_card_multi,
} from "@/logic/player_move/player_move"
import { remove_dead_card } from "@/logic/player_move/service/service_for_player_move"
import { random_level_generator_by_number } from "@/logic/random_level"
import draw from "@/mixins/GamePage/draw"
import execaimove from "@/mixins/GamePage/execaimove"
import specialcaseabilities from "@/mixins/GamePage/specialcaseabilities"
import type {
  Card,
  Enemy,
  EnemyLeader as EnemyLeaderType,
  GameObj,
  IsActive,
  Leader,
} from "@/types"

const MULTI_ENEMIES_COUNT = 30

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
    UseSpecialItemsComponent,
  },
  mixins: [draw, specialcaseabilities, execaimove],

  data() {
    return {
      gameObj: {
        deck: [] as Card[],
        hand: [] as Card[],
        leader: null as Leader | null,
        grave: [] as Card[],
        field: ["", "", "", "", "", "", "", "", "", "", "", ""] as (
          | Enemy
          | ""
        )[],
        enemy_leader: null as EnemyLeaderType | null,
        enemies: [] as Enemy[],
        enemies_grave: [] as Enemy[],
      } as GameObj,
      isActive: {
        player_cards: true,
        player_leader: false,
        enemy_cards: false,
        enemy_leader: false,
      } as IsActive,
      selected_card: null as Card | Leader | null,
      selected_enemy: null as Enemy | null,
      inCrossEnemyLeader: false,
      inCrossEnemyIndex: null as number | null,
      multiLockedIndices: [] as number[],
      show_special_items: false,
      gameInitialized: false,
      disconnectCountdown: null as number | null,
      disconnectTimer: null as ReturnType<typeof setInterval> | null,
    }
  },

  computed: {
    targetEnemyByCard(): boolean {
      return !!(
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_cards &&
          this.selected_enemy) ||
        this.sca
      )
    },
    targetEnemyByLeader(): boolean {
      return !!(
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_cards &&
        this.selected_enemy
      )
    },
    targetEnemyLeaderByCard(): boolean {
      return (
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_leader &&
          this.gameObj.enemy_leader.data.hp > 0) ||
        this.sca
      )
    },
    targetEnemyLeaderByLeader(): boolean {
      return (
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_leader &&
        this.gameObj.enemy_leader.data.hp > 0
      )
    },
  },

  created(): void {
    this.attachWsHandlers()

    if (this.$store.state.multi.role === "host") {
      this.initAsHost()
    }
    // guest ждёт GAME_INIT через WS
  },

  beforeUnmount() {
    this.clearDisconnectTimer()
    // WS остаётся в multi store — не закрываем здесь
  },

  methods: {
    // ── WS ──────────────────────────────────────────────────────────────────

    attachWsHandlers(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws) return
      ws.onmessage = (event: MessageEvent) => this.handleWsMessage(event)
      ws.onclose = () => {
        if (this.disconnectCountdown === null && this.gameInitialized) {
          this.startDisconnectCountdown()
        }
      }
      ws.onerror = () => {
        if (this.disconnectCountdown === null && this.gameInitialized) {
          this.startDisconnectCountdown()
        }
      }
    },

    handleWsMessage(event: MessageEvent): void {
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      if (msg.event === "GAME_INIT" && !this.gameInitialized) {
        this.$store.commit("multi_set_initial_state", {
          enemies: msg.enemies,
          field: msg.field,
          enemy_leader: msg.enemy_leader,
        })
        this.initFromStore()
      } else if (msg.event === "OPPONENT_DISCONNECTED") {
        this.startDisconnectCountdown()
      }
    },

    // ── Инициализация игры ───────────────────────────────────────────────────

    initAsHost(): void {
      const generated = random_level_generator_by_number(MULTI_ENEMIES_COUNT)
      const enemies: Enemy[] = JSON.parse(
        JSON.stringify(generated.level.enemies)
      )
      const enemy_leader: EnemyLeaderType = JSON.parse(
        JSON.stringify(generated.level.enemy_leader)
      )

      this.gameObj.deck = JSON.parse(
        JSON.stringify(
          this.$store.state.game.current_deck.map(
            (c: { card: Card }) => c.card
          )
        )
      )
      this.gameObj.leader = JSON.parse(
        JSON.stringify(this.$store.state.game.leader)
      )
      this.gameObj.enemy_leader = enemy_leader
      this.gameObj.enemies = enemies

      place_enemies(this.gameObj.field, this.gameObj.enemies)
      enemy_leader_ai_move_once(this.gameObj)

      draw_hand(this.gameObj.hand, this.gameObj.deck)
      this.can_draw = this.calc_can_draw()

      // Сохраняем для переподключения и сразу отправляем гостю
      this.$store.commit("multi_set_initial_state", {
        enemies: JSON.parse(JSON.stringify(this.gameObj.enemies)),
        field: JSON.parse(JSON.stringify(this.gameObj.field)),
        enemy_leader: JSON.parse(JSON.stringify(this.gameObj.enemy_leader)),
      })
      this.sendGameInit()

      this.gameInitialized = true
    },

    sendGameInit(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            event: "GAME_INIT",
            enemies: this.gameObj.enemies,
            field: this.gameObj.field,
            enemy_leader: this.gameObj.enemy_leader,
          })
        )
      }
    },

    initFromStore(): void {
      this.gameObj.deck = JSON.parse(
        JSON.stringify(
          this.$store.state.game.current_deck.map(
            (c: { card: Card }) => c.card
          )
        )
      )
      this.gameObj.leader = JSON.parse(
        JSON.stringify(this.$store.state.game.leader)
      )
      this.gameObj.enemy_leader = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_enemy_leader)
      )
      this.gameObj.enemies = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_enemies)
      )
      this.gameObj.field = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_field)
      )

      draw_hand(this.gameObj.hand, this.gameObj.deck)
      this.can_draw = this.calc_can_draw()
      this.gameInitialized = true
    },

    // ── Отключение противника ────────────────────────────────────────────────

    startDisconnectCountdown(): void {
      this.disconnectCountdown = 10
      this.disconnectTimer = setInterval(() => {
        if (this.disconnectCountdown === null) return
        this.disconnectCountdown -= 1
        if (this.disconnectCountdown <= 0) {
          this.clearDisconnectTimer()
          this.$store.commit("multi_reset")
          this.$router.push("/levelselect")
        }
      }, 1000)
    },

    clearDisconnectTimer(): void {
      if (this.disconnectTimer !== null) {
        clearInterval(this.disconnectTimer)
        this.disconnectTimer = null
      }
    },

    // ── Всё ниже — идентично GamePage.vue ────────────────────────────────────

    chose_player_card(card: Card): void {
      this.sca = false
      if (!this.isActive.player_cards) return
      this.selected_card = card
      this.isActive.player_leader = false
      this.setActive()
    },

    chose_leader(): void {
      this.sca = false
      if (this.gameObj.leader.data.charges <= 0) return
      this.selected_card = this.gameObj.leader
      this.isActive.player_leader = true
      this.setActive()
    },

    setActive(): void {
      this.isActive.enemy_cards = true
      this.isActive.enemy_leader = true
    },

    setNotActive(): void {
      this.isActive.enemy_cards = false
      this.isActive.enemy_leader = false
    },

    afterDamage(): void {
      this.special_case_abilities()
      if (!this.show_pick_a_card_selection) {
        remove_dead_card(
          this.selected_card!,
          this.gameObj.grave,
          this.gameObj.hand,
          this.gameObj.deck
        )
      }
      this.selected_card = null
      this.show_picked_card = false
      this.setNotActive()
    },

    exec_damage_enemy_card(enemy: Enemy | ""): void {
      if (!enemy) return
      this.selected_enemy = enemy as Enemy
      this.can_draw = false
      this.damageEnemyByCard()
      this.damageEnemyByLeader()
    },

    damageEnemyByCard(): void {
      if (!this.targetEnemyByCard) return
      damage_ai_card(this.selected_card!, this.selected_enemy!, this.gameObj)
      if (!this.sca) this.isActive.player_cards = false
      this.afterDamage()
    },

    damageEnemyByLeader(): void {
      if (!this.targetEnemyByLeader) return
      damage_ai_card(this.gameObj.leader!, this.selected_enemy!, this.gameObj)
      this.afterDamage()
      this.isActive.player_leader = false
    },

    exec_damage_enemy_leader(): void {
      this.can_draw = false
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

    damageEnemyLeaderByLeader(): void {
      if (!this.targetEnemyLeaderByLeader) return
      damage_ai_card(
        this.gameObj.leader!,
        this.gameObj.enemy_leader!,
        this.gameObj
      )
      this.afterDamage()
      this.isActive.player_leader = false
    },

    switch_enemy_leader_in_cross(in_cross: boolean): void {
      this.inCrossEnemyIndex = null
      this.inCrossEnemyLeader = in_cross
    },

    switch_enemy_in_cross(index: number | null): void {
      this.inCrossEnemyLeader = false
      this.inCrossEnemyIndex = index
    },

    switch_enemy_in_cross_locked(indexOrNull: number | "leader" | null): void {
      if (indexOrNull === null) {
        this.multiLockedIndices = []
      } else if (typeof indexOrNull === "number") {
        if (!this.multiLockedIndices.includes(indexOrNull)) {
          this.multiLockedIndices.push(indexOrNull)
        }
      }
    },

    exec_damage_enemy_card_multi(
      targets: Array<{ isLeader: boolean; fieldValue: Enemy | null }>
    ): void {
      this.can_draw = false
      this.multiLockedIndices = []
      damage_ai_card_multi(this.selected_card!, this.gameObj, targets)
      if (this.isActive.player_leader) {
        this.afterDamage()
        this.isActive.player_leader = false
      } else {
        if (!this.sca) this.isActive.player_cards = false
        this.afterDamage()
      }
    },
  },
})
</script>

<style scoped>
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

.right-panel {
  width: 24.5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* ── Оверлеи ── */

.init-overlay,
.disconnect-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.init-card,
.disconnect-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 48px;
  background: rgba(20, 10, 0, 0.92);
  border-radius: 16px;
  text-align: center;
}

.init-card {
  border: 1px solid rgba(255, 200, 50, 0.25);
}

.disconnect-card {
  border: 1px solid rgba(255, 80, 80, 0.35);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 200, 50, 0.2);
  border-top-color: rgba(255, 200, 50, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.init-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.disconnect-icon {
  font-size: 40px;
  color: #ff6b6b;
}

.disconnect-title {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b6b;
}

.disconnect-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.disconnect-timer {
  font-size: 56px;
  font-weight: 700;
  color: white;
  line-height: 1;
  min-width: 60px;
}
</style>
