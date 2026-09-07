<template>
  <!-- Корневой контейнер: занимает весь экран, flex-колонка (поле сверху, рука снизу) -->
  <div class="game-page">
    <!-- Весь игровой UI показывается только после инициализации.
         Хост: gameInitialized = true сразу в initAsHost().
         Гость: gameInitialized = true после получения GAME_INIT по WS. -->
    <template v-if="gameInitialized">
      <!-- Основной блок: поле (слева/центр) + правая панель -->
      <div class="game-block">
        <!-- ── Полоска руки напарника ──────────────────────────────────────
             Накладывается поверх поля (position: absolute), видна по кнопке-тогглу.
             Данные приходят от напарника через PLAYER_STATE по WS. -->
        <div v-if="showOpponentHand" class="opponent-hand-strip">
          <!-- Рубашки карт напарника: цвет фона = фракция карты.
               Реальные карты не передаём — только faction для цветовой индикации. -->
          <div class="opponent-strip-cards">
            <div
              v-for="(card, i) in opponentHand"
              :key="i"
              class="opponent-card-back"
              :style="{ background: factionCardGradient(card.faction) }"
            />
            <!-- Если рука пустая — прочерк -->
            <span v-if="opponentHand.length === 0" class="opponent-hand-empty">
              —
            </span>
          </div>

          <!-- HP, броня и неуязвимость напарника (из PLAYER_STATE) -->
          <div class="opponent-strip-stats">
            <span class="opp-stat opp-hp"
              >❤ {{ opponentHealth }}/{{ opponentMaxHp }}</span
            >
            <span class="opp-stat opp-armor"
              >🛡 {{ opponentArmor }}/{{ opponentMaxArmor }}</span
            >
            <span v-if="opponentMaxImmuneTurns > 0" class="opp-stat opp-immune"
              >✨ {{ opponentInvulnerability }}/{{
                opponentMaxImmuneTurns
              }}</span
            >
          </div>
        </div>

        <!-- ── Поле (12 клеток с врагами) ──────────────────────────────────
             field         — массив из 12 элементов: Enemy | "".
             in_cross_enemy_index — индекс врага под прицелом (для анимации).
             multi_locked_indices — индексы, уже зафиксированные при мульти-атаке.
             @exec_damage_ai_card — когда игрок кликает по врагу на поле. -->
        <field-comp
          :field="gameObj.field"
          :effects="gameObj.effects"
          :in_cross_enemy_index="inCrossEnemyIndex"
          :multi_locked_indices="multiLockedIndices"
          :in_cross_cell_index="inCrossCellIndex"
          :multi_locked_cell_indices="multiLockedCellIndices"
          @exec_damage_ai_card="exec_damage_enemy_card"
        />

        <!-- ── Правая панель ─────────────────────────────────────────────── -->
        <div class="right-panel">
          <!-- Кнопка-тогглер полоски напарника.
               Цвет рамки/текста = цвет фракции лидера напарника (из opponentLeaderFaction).
               Показывает количество карт в руке напарника. -->
          <button
            class="opponent-hand-toggle"
            :class="{ 'opponent-hand-toggle--flash': opponentActivityFlash }"
            :style="{
              borderColor: factionColor(opponentLeaderFaction),
              color: factionColor(opponentLeaderFaction),
            }"
            @click="showOpponentHand = !showOpponentHand"
          >
            {{ showOpponentHand ? "▲" : "▼" }} {{ opponentHand.length }}
          </button>

          <!-- Лидер врагов.
               in_cross — подсвечен ли он как цель (для анимации прицела).
               @exec_enemy_leader — клик по лидеру = атаковать его. -->
          <enemy-leader
            :enemy_leader="gameObj.enemy_leader"
            :in_cross="inCrossEnemyLeader"
            @exec_enemy_leader="exec_damage_enemy_leader"
          />

          <!-- Счётчики врагов: оставшиеся в очереди и уже убитые (в могиле).
               Обновляются синхронно с полем — хост рассылает через GAME_STATE. -->
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

          <!-- Кнопка "добрать карту".
               Видна только когда can_draw=true И сейчас ход игрока (player_turn из стора).
               В мультиплеере player_turn=false когда ход напарника → кнопка скрыта. -->
          <div class="draw">
            <draw-comp
              v-show="can_draw && $store.state.game.player_turn"
              @click="draw_one_card"
            />
          </div>

          <!-- ── Слот кнопки Пас / индикатор хода ────────────────────────
               Три состояния в зависимости от ситуации:

               1. myTurn=true → кнопка Пас (двойной клик = завершить ход, запустить exec_ai_move).

               2. myTurn=false + опонент показывает SCA-карту (SpecialCaseAbility) →
                  показываем ту самую карту/врага, которую он держит в руке перед выбором цели.
                  Приходит через WS: SCA_SHOW / SCA_HIDE.
                  Различаем карту и врага по наличию поля 'move' (Enemy имеет move, Card — нет).

               3. myTurn=false, SCA нет → надпись "Ход напарника..." -->
          <pass-comp
            v-if="myTurn"
            :timer="turnTimeLeft"
            @dblclick="exec_ai_move"
          />
          <div v-else-if="opponentSCACard" class="opponent-sca-slot">
            <card-item
              v-if="!('move' in opponentSCACard)"
              :card="opponentSCACard"
            />
            <enemy-comp v-else :enemy="opponentSCACard" />
          </div>
          <div v-else class="opponent-turn-indicator">Ход напарника...</div>

          <!-- Колода и сброс игрока (нижняя пара кнопок правой панели) -->
          <div class="div-two-buttons">
            <deck-comp :deck="gameObj.deck" :leader="gameObj.leader" />
            <grave-comp :grave="gameObj.grave" :leader="gameObj.leader" />
          </div>

          <!-- Лидер игрока.
               Передаём поле и лидера врагов, чтобы компонент мог обрабатывать
               все виды атаки: по обычному врагу, по лидеру врагов, мульти-атаку.
               @exec_leader    — игрок активирует лидера.
               @target_enemy / @target_enemy_leader / @target_enemy_multi — цели атаки.
               @enemy_*_in_cross / @enemy_*_in_cross_locked — управление прицелом. -->
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
            @target_empty_cell="target_empty_cell"
            @target_empty_cell_multi="target_empty_cell_multi"
            @cell_in_cross="switch_cell_in_cross"
            @cell_in_cross_locked="switch_cell_in_cross_locked"
          />

          <!-- HP и броня своего игрока.
               Клик открывает панель использования предметов (флаконы и т.п.). -->
          <health-comp
            style="cursor: pointer"
            @click="show_special_items = true"
          />
        </div>
      </div>

      <!-- ── Рука игрока (карты внизу экрана) ──────────────────────────────
           player_cards_active — разрешено ли играть карты (false = не наш ход).
           drawing             — открыто ли окно замены карт (редро).
           @chose_player_card  — игрок выбрал карту для атаки.
           Остальные события — выбор цели, как у лидера выше. -->
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
        @target_empty_cell="target_empty_cell"
        @target_empty_cell_multi="target_empty_cell_multi"
        @cell_in_cross="switch_cell_in_cross"
        @cell_in_cross_locked="switch_cell_in_cross_locked"
      />

      <!-- ── SpecialCaseAbilities — оверлей особых способностей карт ────────
           Появляется когда сыгранная карта требует дополнительного выбора:
           выбрать карту из пула (show_pick_a_card_selection) или выбрать цель (show_picked_card).
           После выбора (confirm_selection) логика продолжается в afterDamage(). -->
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
        @target_empty_cell="target_empty_cell"
        @target_empty_cell_multi="target_empty_cell_multi"
        @cell_in_cross="switch_cell_in_cross"
        @cell_in_cross_locked="switch_cell_in_cross_locked"
      />

      <!-- ── Редро — замена карт в начале игры ─────────────────────────────
           Появляется сразу (draw=true) после инициализации.
           Скрывается когда игрок подтверждает замену (@redraw_finished).
           Анимация fade-in/fade-out через transition "modal". -->
      <transition name="modal" appear>
        <redraw-comp
          v-if="draw"
          :game-obj="gameObj"
          :redraw-number="redraws"
          @redraw_finished="redraw_finished"
        />
      </transition>

      <!-- Оверлей инвентаря предметов (открывается кликом по health-comp) -->
      <use-special-items-component
        v-if="show_special_items"
        @close="show_special_items = false"
      />
    </template>

    <!-- ── Оверлей ожидания инициализации ────────────────────────────────────
         Гость видит этот спиннер пока хост не пришлёт GAME_INIT.
         Рендерится поверх пустого gameInitialized=false контента (не v-else,
         т.к. при gameInitialized=true может понадобиться наложить другой оверлей). -->
    <div v-if="!gameInitialized" class="init-overlay">
      <div class="init-card">
        <div class="spinner" />
        <div class="init-text">Ожидание данных от хоста...</div>
      </div>
    </div>

    <!-- ── Оверлей ожидания редро напарника ─────────────────────────────────
         Виден когда мы уже закончили замену карт, а напарник ещё нет.
         waitingForOpponentRedraw = myRedrawDone && !opponentRedrawDone. -->
    <div v-if="waitingForOpponentRedraw" class="init-overlay">
      <div class="init-card">
        <div class="spinner" />
        <div class="init-text">Ожидание замены карт напарника...</div>
      </div>
    </div>

    <!-- ── Оверлей отключения напарника ─────────────────────────────────────
         Появляется при onclose/onerror WS или при получении OPPONENT_DISCONNECTED.
         Обратный отсчёт 10 секунд → автоматический переход на /levelselect. -->
    <div v-if="disconnectCountdown !== null" class="disconnect-overlay">
      <div class="disconnect-card">
        <div class="disconnect-icon">⚠</div>
        <div class="disconnect-title">Напарник отключился</div>
        <div class="disconnect-sub">Возврат на выбор уровня через</div>
        <div class="disconnect-timer">{{ disconnectCountdown }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import CardItem from "@/components/Cards/CardItem.vue"
import EnemyComp from "@/components/Cards/EnemyComp.vue"
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
import { randInt } from "@/lib/utils"
import { enemy_leader_ai_move_once } from "@/logic/ai_move/ai_leader_move_once"
import { ai_move } from "@/logic/ai_move/ai_move"
import { enemy_passive_abilities_end_turn } from "@/logic/ai_move/ai_passive_abilties"
import { draw_hand } from "@/logic/game_logic/draw_hand"
import {
  appear_new_enemy,
  place_enemies,
} from "@/logic/game_logic/place_enemies"
import {
  damage_ai_card,
  damage_ai_card_multi,
} from "@/logic/player_move/player_move"
import { player_passive_abilities_end_turn } from "@/logic/player_move/player_passive_abilities"
import { remove_dead_card } from "@/logic/player_move/service/service_for_player_move"
import { random_level_generator_by_number } from "@/logic/random_level"
import draw from "@/mixins/GamePage/draw"
import execaimove from "@/mixins/GamePage/execaimove"
import fieldinteraction from "@/mixins/GamePage/fieldinteraction"
import specialcaseabilities from "@/mixins/GamePage/specialcaseabilities"
import type {
  Card,
  Enemy,
  EnemyLeader as EnemyLeaderType,
  GameObj,
  IsActive,
  Leader,
} from "@/types"
import {
  get_value_from_upgrades,
  UpgradeSubtype,
  UpgradeType,
} from "@/types/upgrades"

export default defineComponent({
  components: {
    CardItem,
    EnemyComp,
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
  mixins: [draw, specialcaseabilities, execaimove, fieldinteraction],

  // ── Перехват навигации при завершении игры ───────────────────────────────
  // Срабатывает когда check_lose() или check_win() делают router.push("/lose") / router.push("/win").
  // Задача: перед уходом уведомить напарника через GAME_END, затем разрешить переход.
  beforeRouteLeave(to: { path: string }) {
    // Если игра ещё не началась или конец уже был обработан — пропускаем
    if (!this.gameInitialized || this.gameOver) return true

    if (to.path === "/win" || to.path === "/lose") {
      this.sendGameEnd(to.path === "/win" ? "win" : "lose")
      this.gameOver = true
    }
    return true
  },

  data() {
    return {
      // ── Состояние игры ─────────────────────────────────────────────────
      // Единый объект с полем, колодой, рукой, лидерами, врагами.
      // Хост владеет им полностью; гость получает поле/врагов через GAME_STATE по WS.
      gameObj: {
        deck: [] as Card[],
        hand: [] as Card[],
        leader: null as Leader | null,
        grave: [] as Card[], // сброс карт игрока
        field: ["", "", "", "", "", "", "", "", "", "", "", ""] as (
          | Enemy
          | ""
        )[],
        effects: ["", "", "", "", "", "", "", "", "", "", "", ""],
        enemy_leader: null as EnemyLeaderType | null,
        enemies: [] as Enemy[], // очередь врагов (ещё не вышли на поле)
        enemies_grave: [] as Enemy[], // убитые враги
      } as GameObj,

      // Флаги активности: кто сейчас может быть выбран/атакован
      isActive: {
        player_cards: true, // можно играть карты из руки
        player_leader: false, // можно активировать лидера
        enemy_cards: false, // враги на поле доступны как цель
        enemy_leader: false, // лидер врагов доступен как цель
      } as IsActive,

      selected_card: null as Card | Leader | null, // карта/лидер, выбранная для атаки
      selected_enemy: null as Enemy | null, // враг, выбранный как цель

      // Прицел — для подсветки врага/лидера при наведении
      inCrossEnemyLeader: false,
      inCrossEnemyIndex: null as number | null,

      // Индексы клеток, зафиксированных при мульти-атаке (для карт с AOE)
      multiLockedIndices: [] as number[],

      show_special_items: false, // открыт ли оверлей инвентаря предметов

      // ── Мультиплеерные флаги ───────────────────────────────────────────
      gameInitialized: false, // true когда оба игрока готовы (данные получены)
      myRedrawDone: false, // мы завершили замену карт
      opponentRedrawDone: false, // напарник завершил замену карт

      // Данные напарника — обновляются через PLAYER_STATE по WS
      opponentHand: [] as Array<{ faction: string }>, // только фракции (не реальные карты)
      opponentLeaderFaction: "",
      opponentHealth: 0,
      opponentMaxHp: 0,
      opponentArmor: 0,
      opponentMaxArmor: 0,
      opponentInvulnerability: 0,
      opponentMaxImmuneTurns: 0,
      showOpponentHand: false, // показывать ли полоску карт напарника

      // Отключение: countdown от 10 до 0, null = напарник подключён
      disconnectCountdown: null as number | null,
      disconnectTimer: null as ReturnType<typeof setInterval> | null,

      // ── Управление ходами ──────────────────────────────────────────────
      // myTurn=true: наш ход (активны карты, доступна кнопка Пас).
      // myTurn=false: ход напарника (UI заблокирован, показывается индикатор).
      myTurn: false,

      // Базовые значения HP/брони на момент последней отправки GAME_STATE.
      // Используются для вычисления delta: отправляем только урон (Math.min(0, delta)),
      // лечение каждый игрок считает независимо и напарнику не передаёт.
      lastSentHealth: 0,
      lastSentArmor: 0,

      // SCA-карта напарника: какую карту он держит в руке перед атакой через SCA.
      // Приходит через SCA_SHOW, сбрасывается через SCA_HIDE.
      // Отображается в слоте кнопки Пас пока ход напарника.
      opponentSCACard: null as Card | Enemy | null,

      // Мигание кнопки-тогглера при любом событии от напарника
      opponentActivityFlash: false,
      opponentFlashTimer: null as ReturnType<typeof setTimeout> | null,

      // Таймер хода: 30 секунд на ход, при 0 — авто-пас
      turnTimeLeft: 0,
      turnTimer: null as ReturnType<typeof setInterval> | null,

      // Флаг конца игры: предотвращает двойную обработку win/lose
      // (например, если health watcher и GAME_END придут одновременно).
      gameOver: false,
    }
  },

  computed: {
    // Можно ли атаковать врага на поле картой из руки (или через SCA)
    targetEnemyByCard(): boolean {
      return !!(
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_cards &&
          this.selected_enemy) ||
        this.sca // sca из миксина specialcaseabilities
      )
    },
    // Можно ли атаковать врага на поле лидером
    targetEnemyByLeader(): boolean {
      return !!(
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_cards &&
        this.selected_enemy
      )
    },
    // Можно ли атаковать лидера врагов картой из руки (или через SCA)
    targetEnemyLeaderByCard(): boolean {
      return (
        (this.isActive.player_cards &&
          !this.isActive.player_leader &&
          this.isActive.enemy_leader &&
          this.gameObj.enemy_leader.data.hp > 0) ||
        this.sca
      )
    },
    // Можно ли атаковать лидера врагов своим лидером
    targetEnemyLeaderByLeader(): boolean {
      return (
        this.isActive.player_leader &&
        this.gameObj.leader.data.charges > 0 &&
        this.isActive.enemy_leader &&
        this.gameObj.enemy_leader.data.hp > 0
      )
    },
    // true пока мы закончили редро, но напарник ещё нет → показываем спиннер
    waitingForOpponentRedraw(): boolean {
      return this.myRedrawDone && !this.opponentRedrawDone
    },
    health(): number {
      return this.$store.getters["health"]
    },
    armor(): number {
      return this.$store.state.game.armor
    },
    invulnerability(): number {
      return this.$store.state.game.invulnerability
    },
  },

  watch: {
    // чтобы у напарника обновилась полоска нашей руки и возможно лидер
    "gameObj.hand": {
      handler() {
        if (this.gameInitialized) this.sendPlayerState()
      },
      deep: true,
    },
    "gameObj.leader"() {
      if (this.gameInitialized) this.sendPlayerState()
    },

    // HP может меняться и вне gameObj (стор game.health).
    // Два случая:
    // 1. Шлём обновлённый PLAYER_STATE напарнику.
    // 2. Если это пассивный игрок (не наш ход) и HP упало в 0 —
    //    check_lose() у нас не вызывается (он запускается только внутри ai_move активного игрока),
    //    поэтому сами идём на /lose.
    health(val: number) {
      if (this.gameInitialized) this.sendPlayerState()
      if (val <= 0 && !this.myTurn && this.gameInitialized && !this.gameOver) {
        this.gameOver = true
        this.$router.push("/lose")
      }
    },

    // Броня тоже может меняться вне gameObj
    armor() {
      if (this.gameInitialized) this.sendPlayerState()
    },

    // Неуязвимость тоже меняется вне gameObj (предмет или декремент хода)
    invulnerability() {
      if (this.gameInitialized) this.sendPlayerState()
    },

    // Окно выбора карты SCA закрылось (show_pick_a_card_selection: true → false).
    // В момент закрытия карта уже сыграна и урон нанесён, но враг удаляется
    // через setTimeout(timeout). Ждём timeout+100 мс и только потом шлём GAME_STATE,
    // чтобы напарника не увидел врага с отрицательными HP.
    // includeHealth=false: лечение от SCA не передаём напарнику.
    show_pick_a_card_selection(val: boolean, oldVal: boolean) {
      if (oldVal && !val && this.myTurn && this.gameInitialized) {
        const t = this.$store.getters["selectedMoveTimeout"]
        setTimeout(() => this.sendGameState(false), t + 100)
      }
    },

    // Флаг "карта поднята в SCA для выбора цели" (show_picked_card из миксина).
    // Когда поднимаем — шлём SCA_SHOW с данными карты, чтобы напарник видел
    // что именно мы держим. Когда опускаем — шлём SCA_HIDE.
    show_picked_card(val: boolean) {
      if (!this.myTurn || !this.gameInitialized) return
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      if (val && this.selected_card) {
        ws.send(
          JSON.stringify({
            event: "SCA_SHOW",
            card: JSON.parse(JSON.stringify(this.selected_card)),
          })
        )
      } else if (!val) {
        ws.send(JSON.stringify({ event: "SCA_HIDE" }))
      }
    },
  },

  created(): void {
    // Навешиваем обработчики на WS (уже лежит в store.multi.ws после матчмейкинга)
    this.attachWsHandlers()

    // Хост сразу генерирует врагов и отправляет их гостю через GAME_INIT.
    // Гость ничего не делает — ждёт GAME_INIT от хоста через WS.
    if (this.$store.state.multi.role === "host") {
      this.initAsHost()
    }
  },

  beforeUnmount() {
    // Снимаем WS-обработчики ДО multi_reset — иначе onclose сработает уже после
    // размонтирования компонента (замыкание держит this) и запустит startDisconnectCountdown.
    const ws: WebSocket | null = this.$store.state.multi.ws
    if (ws) {
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
    }
    this.clearDisconnectTimer()
    this.stopTurnTimer()
    // Возвращаем игровые флаги в исходное состояние — стор общий,
    // и обычная игра не ожидает что player_turn или ai_move будут грязными.
    this.$store.commit("set_player_turn", true)
    this.$store.commit("set_ai_move", false)
    this.$store.commit("set_ppa_end_turn", false)
    this.$store.commit("set_epa_end_turn", false)
    // Восстанавливаем колоду до исходного состояния (HP, состав) — с задержкой,
    // чтобы WinPage/LosePage успели прочитать текущий стейт до перезаписи.
    this.$store.dispatch("re_set_deck")
    // Закрываем WS и сбрасываем multi-состояние стора при уходе со страницы
    this.$store.commit("multi_reset")
  },

  methods: {
    // ── WS — подключение и роутинг сообщений ────────────────────────────────

    // Вешаем обработчики на WS из стора.
    // WS создаётся в MultiplayerWaitingPage и передаётся сюда через multi store.
    attachWsHandlers(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws) return
      ws.onmessage = (event: MessageEvent) => this.handleWsMessage(event)
      // onclose/onerror: если соединение упало во время игры — запускаем таймер отключения
      ws.onclose = () => {
        if (
          this.disconnectCountdown === null &&
          this.gameInitialized &&
          !this.gameOver
        ) {
          this.startDisconnectCountdown()
        }
      }
      ws.onerror = () => {
        if (
          this.disconnectCountdown === null &&
          this.gameInitialized &&
          !this.gameOver
        ) {
          this.startDisconnectCountdown()
        }
      }
    },

    // Главный роутер входящих WS-сообщений.
    // Все события приходят в формате { event: "...", ...payload }.
    handleWsMessage(event: MessageEvent): void {
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      if (msg.event === "GAME_INIT" && !this.gameInitialized) {
        // Гость получил начальное состояние от хоста: сохраняем в стор и инициализируемся
        this.$store.commit("multi_set_initial_state", {
          enemies: msg.enemies,
          field: msg.field,
          enemy_leader: msg.enemy_leader,
          effects: msg.effects,
        })
        this.initFromStore()
      } else if (msg.event === "REDRAW_DONE") {
        // Напарник закончил замену карт.
        // Если мы тоже закончили — запускаем первый ход (startGameTurn).
        this.opponentRedrawDone = true
        if (this.myRedrawDone) this.startGameTurn()
        this.flashOpponent()
      } else if (msg.event === "GAME_STATE") {
        // Активный игрок прислал текущее состояние поля и урон.
        // Обновляем поле/врагов/могилу, затем применяем HP-изменения.
        this.gameObj.field = JSON.parse(JSON.stringify(msg.field))
        this.gameObj.enemies = JSON.parse(JSON.stringify(msg.enemies))
        this.gameObj.enemy_leader = JSON.parse(JSON.stringify(msg.enemy_leader))
        this.gameObj.enemies_grave = JSON.parse(
          JSON.stringify(msg.enemies_grave)
        )
        this.gameObj.effects = JSON.parse(
          JSON.stringify(msg.effects ?? Array(12).fill(""))
        )
        const attackLog = (msg.attack_log as number[]) ?? []
        if (attackLog.length > 0) {
          if (this.$store.state.game.invulnerability > 0) {
            // Пассивный игрок неуязвим — все атаки этой волны заблокированы.
            this.$store.commit("set_invulnerability_hit", true)
            setTimeout(
              () => this.$store.commit("set_invulnerability_hit", false),
              500
            )
          } else {
            // Прогоняем каждую атаку напарника через нашу собственную броню —
            // так же, как это делает damage_player() на стороне активного игрока.
            // 1 единица брони поглощает 1 атаку целиком, независимо от damage.
            for (const damage of attackLog) {
              if (this.$store.state.game.armor > 0) {
                this.$store.commit("change_armor", -1)
              } else {
                this.$store.commit("change_health", -damage)
              }
            }
          }
        } else {
          // Нет атак — применяем дельты для пассивных HP-изменений (не урон от врагов).
          // Дельты приходят только отрицательными; лечение не передаётся.
          const healthDelta = Number(msg.health_delta ?? 0)
          const armorDelta = Number(msg.armor_delta ?? 0)
          if (healthDelta !== 0)
            this.$store.commit("change_health", healthDelta)
          if (armorDelta !== 0) this.$store.commit("change_armor", armorDelta)
        }
        this.flashOpponent()
      } else if (msg.event === "TURN_END") {
        // Напарник закончил свой ход → теперь наш ход.
        // Разблокируем карты и обновляем флаг can_draw.
        // ИИ уже отходил на стороне напарника — декрементируем свою неуязвимость
        // симметрично тому, как активный игрок делает это в exec_ai_move().
        const invulnerability = this.$store.state.game.invulnerability
        if (invulnerability > 0) {
          this.$store.commit("set_invulnerability", invulnerability - 1)
        }
        this.myTurn = true
        this.isActive.player_cards = true
        this.$store.commit("set_player_turn", true)
        this.can_draw = this.calc_can_draw()
        this.flashOpponent()
        this.startTurnTimer()
      } else if (msg.event === "PLAYER_STATE") {
        // Напарник прислал свой стейт для отображения у нас в полоске сверху
        this.opponentHand = (msg.hand as Array<{ faction: string }>) ?? []
        this.opponentLeaderFaction = String(msg.leader_faction ?? "")
        this.opponentHealth = Number(msg.health ?? 0)
        this.opponentMaxHp = Number(msg.max_hp ?? 0)
        this.opponentArmor = Number(msg.armor ?? 0)
        this.opponentMaxArmor = Number(msg.max_armor ?? 0)
        this.opponentInvulnerability = Number(msg.invulnerability ?? 0)
        this.opponentMaxImmuneTurns = Number(msg.max_immune_turns ?? 0)
        this.flashOpponent()
      } else if (msg.event === "SCA_SHOW") {
        // Напарник поднял карту в SCA-режим для выбора цели → показываем у нас
        this.opponentSCACard = (msg.card as Card | Enemy) ?? null
        this.flashOpponent()
      } else if (msg.event === "SCA_HIDE") {
        // Напарник закончил SCA-взаимодействие (атаковал или отменил)
        this.opponentSCACard = null
      } else if (msg.event === "GAME_END") {
        // Активный игрок уведомил нас что игра закончена (перехвачено в beforeRouteLeave).
        // Применяем результат и переходим на соответствующую страницу.
        if (this.gameOver) return // защита от двойного срабатывания
        this.gameOver = true
        if (msg.result === "win") {
          // Устанавливаем флаг win_redirect чтобы WinPage начислила ресурсы
          this.$store.commit("set_win_redirect", true)
          // enemies_grave нужен WinPage для leaderboard (кол-во убитых)
          this.$store.commit("set_enemies_grave", msg.enemies_grave)
          this.$store.commit("multi_reset")
          this.$router.push("/win")
        } else {
          this.$store.commit("multi_reset")
          this.$router.push("/lose")
        }
      } else if (msg.event === "OPPONENT_DISCONNECTED") {
        // Бэкенд уведомил что второй игрок вышел из комнаты.
        // Игнорируем если игра уже завершена (GAME_END был обработан) —
        // сервер шлёт это событие когда проигравший закрывает WS в beforeUnmount.
        if (!this.gameOver) this.startDisconnectCountdown()
      }
    },

    // ── Инициализация игры ───────────────────────────────────────────────────

    // Только хост: генерирует врагов, расставляет на поле, раздаёт свою руку,
    // сохраняет начальный стейт в стор и отправляет его гостю через GAME_INIT.
    initAsHost(): void {
      this.$store.commit("set_invulnerability", 0)
      this.$store.commit("set_armor", 0)
      const generated = random_level_generator_by_number(
        randInt(
          this.$store.getters["maxEnemies"].min,
          this.$store.getters["maxEnemies"].max
        )
      )
      const enemies: Enemy[] = JSON.parse(
        JSON.stringify(generated.level.enemies)
      )
      const enemy_leader: EnemyLeaderType = JSON.parse(
        JSON.stringify(generated.level.enemy_leader)
      )

      // Берём колоду и лидера из стора (выбраны игроком на экране старта игры)
      this.gameObj.deck = JSON.parse(
        JSON.stringify(
          this.$store.state.game.current_deck.map((c: { card: Card }) => c.card)
        )
      )
      this.gameObj.leader = JSON.parse(
        JSON.stringify(this.$store.state.game.leader)
      )
      this.gameObj.enemy_leader = enemy_leader
      this.gameObj.enemies = enemies

      // Расставляем первую волну врагов на поле и применяем способность лидера
      enemy_leader_ai_move_once(this.gameObj)
      place_enemies(this.gameObj.field, this.gameObj.enemies)

      draw_hand(this.gameObj.hand, this.gameObj.deck)
      this.can_draw = this.calc_can_draw()

      // Сохраняем начальный стейт в стор (пригодится если понадобится переинициализация)
      // и сразу отправляем гостю
      this.$store.commit("multi_set_initial_state", {
        enemies: JSON.parse(JSON.stringify(this.gameObj.enemies)),
        field: JSON.parse(JSON.stringify(this.gameObj.field)),
        enemy_leader: JSON.parse(JSON.stringify(this.gameObj.enemy_leader)),
      })
      this.sendGameInit()

      this.draw = true // открываем окно редро
      this.gameInitialized = true
      this.myTurn = true // хост ходит первым
      this.lastSentHealth = this.$store.getters["health"]
      this.lastSentArmor = this.$store.state.game.armor
      this.sendPlayerState() // сразу отправляем наш стейт гостю
    },

    // Отправляем гостю начальное состояние поля (GAME_INIT).
    // Вызывается один раз при инициализации хоста.
    sendGameInit(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            event: "GAME_INIT",
            enemies: this.gameObj.enemies,
            field: this.gameObj.field,
            enemy_leader: this.gameObj.enemy_leader,
            effects: this.gameObj.effects,
          })
        )
      }
    },

    // Только гость: берёт начальный стейт из стора (куда он попал из GAME_INIT),
    // инициализирует свою колоду/лидера независимо (своя рука, не хостовая).
    initFromStore(): void {
      this.gameObj.deck = JSON.parse(
        JSON.stringify(
          this.$store.state.game.current_deck.map((c: { card: Card }) => c.card)
        )
      )
      this.gameObj.leader = JSON.parse(
        JSON.stringify(this.$store.state.game.leader)
      )
      // Поле, враги, лидер врагов — копия того, что прислал хост
      this.gameObj.enemy_leader = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_enemy_leader)
      )
      this.gameObj.enemies = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_enemies)
      )
      this.gameObj.field = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_field)
      )
      this.gameObj.effects = JSON.parse(
        JSON.stringify(this.$store.state.multi.initial_effects)
      )

      draw_hand(this.gameObj.hand, this.gameObj.deck)
      this.can_draw = this.calc_can_draw()
      this.draw = true
      this.gameInitialized = true
      this.myTurn = false // гость ждёт TURN_END от хоста
      this.lastSentHealth = this.$store.getters["health"]
      this.lastSentArmor = this.$store.state.game.armor
      this.sendPlayerState()
    },

    // ── Отключение напарника ────────────────────────────────────────────────

    // Запускаем таймер 10 секунд → потом уходим на /levelselect
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

    // ── Редро ────────────────────────────────────────────────────────────────

    // Переопределяем метод из миксина draw: добавляем WS-синхронизацию.
    // После того как игрок подтвердил замену карт — шлём REDRAW_DONE напарнику.
    // Если напарник уже прислал своё REDRAW_DONE — сразу стартуем ход.
    redraw_finished(dict: { hand: Card[]; deck: Card[] }): void {
      this.draw = false
      this.gameObj.hand = dict.hand
      this.gameObj.deck = dict.deck
      // Сбрасываем счётчик редро из апгрейдов
      this.redraws = get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.REDRAWS_DRAWN
      )

      this.myRedrawDone = true
      this.sendRedrawDone()
      if (this.opponentRedrawDone) this.startGameTurn()
    },

    sendRedrawDone(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "REDRAW_DONE" }))
      }
    },

    // Запускает первый (и каждый последующий) ход после того как оба закончили редро.
    // Если myTurn=true → наши карты активны; если false → заблокированы.
    // Также ставит player_turn в стор (от него зависит видимость кнопки "добрать карту").
    startGameTurn(): void {
      this.isActive.player_cards = this.myTurn
      this.$store.commit("set_player_turn", this.myTurn)
      if (this.myTurn) this.startTurnTimer()
    },

    // ── Синхронизация стейта ─────────────────────────────────────────────────

    // Отправляем напарнику текущее состояние поля + дельты HP/брони.
    //
    // includeHealth=true (по умолчанию): вычисляем дельту HP и брони относительно
    //   lastSentHealth/lastSentArmor. Передаём только отрицательную дельту (урон).
    //   Лечение (положительная дельта) игнорируем через Math.min(0, delta),
    //   т.к. у каждого игрока своё лечение от пассивок.
    //
    // includeHealth=false: шлём delta=0 (после сыгранной карты игрока — её лечение
    //   тоже не должно уходить напарнику).
    //
    // lastSentHealth/Armor всегда обновляем до текущего значения — следующая
    // дельта будет вычислена от актуальной базы.
    sendGameState(includeHealth = true): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      const currentHealth = this.$store.getters["health"]
      const currentArmor = this.$store.state.game.armor

      // Забираем накопленный лог атак и сразу очищаем его в сторе.
      // attack_log содержит значение damage каждого вызова damage_player за этот
      // интервал — напарник прогонит их через свою броню независимо.
      const attackLog: number[] = [...this.$store.state.game.attack_log]
      this.$store.commit("clear_attack_log")

      const hasAttacks = includeHealth && attackLog.length > 0

      ws.send(
        JSON.stringify({
          event: "GAME_STATE",
          field: JSON.parse(JSON.stringify(this.gameObj.field)),
          enemies: JSON.parse(JSON.stringify(this.gameObj.enemies)),
          enemy_leader: JSON.parse(JSON.stringify(this.gameObj.enemy_leader)),
          enemies_grave: JSON.parse(JSON.stringify(this.gameObj.enemies_grave)),
          effects: JSON.parse(JSON.stringify(this.gameObj.effects)),
          // Если есть атаки — передаём их список; дельты не нужны (напарник сам всё посчитает).
          // Если атак нет — можем передать дельту для пассивных HP-изменений (не урон от врагов).
          attack_log: hasAttacks ? attackLog : [],
          health_delta: hasAttacks
            ? 0
            : includeHealth
              ? Math.min(0, currentHealth - this.lastSentHealth)
              : 0,
          armor_delta: hasAttacks
            ? 0
            : includeHealth
              ? Math.min(0, currentArmor - this.lastSentArmor)
              : 0,
        })
      )
      this.lastSentHealth = currentHealth
      this.lastSentArmor = currentArmor
    },

    // Сигнал конца игры напарнику (перехвачен в beforeRouteLeave).
    // Передаём enemies_grave для начисления ресурсов на WinPage у обоих игроков.
    sendGameEnd(result: "win" | "lose"): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(
        JSON.stringify({
          event: "GAME_END",
          result,
          enemies_grave: JSON.parse(JSON.stringify(this.gameObj.enemies_grave)),
        })
      )
    },

    // Сигнал что наш ход закончен → напарник получает управление (myTurn=true у него)
    sendTurnEnd(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "TURN_END" }))
      }
    },

    // ── Конец хода (переопределение миксина execaimove) ──────────────────────
    // Вызывается двойным кликом по кнопке Пас.
    // Запускает полный цикл AI-обработки с пошаговой WS-синхронизацией.
    //
    // Порядок шагов и когда шлём GAME_STATE:
    //   1. player_passive_abilities_end_turn — пассивки игрока срабатывают в конце хода
    //      (ждём ppa_end_turn=false) → GAME_STATE
    //   2. ai_move — ход врагов: атаки, перемещения, смерти
    //      (ждём ai_move=false) → GAME_STATE
    //   3. enemy_passive_abilities_end_turn — пассивки врагов
    //      (ждём epa_end_turn=false)
    //   4. appear_new_enemy — выходит следующий враг из очереди
    //   5. setTimeout(timeout+100) → финальный GAME_STATE + TURN_END
    //
    // Почему setTimeout(timeout+100)?
    //   enemy_takes_damage() удаляет мёртвого врага через setTimeout(timeout).
    //   Если отправить GAME_STATE до этого — напарник увидит врага с отрицательными HP.
    //   +100 мс — небольшой буфер поверх анимационного таймаута.
    exec_ai_move(): void {
      if (!this.myTurn) return
      this.stopTurnTimer()
      this.$store.commit("set_player_turn", false)
      const timeout: number = 500

      // Шаг 1: пассивки игрока конца хода
      player_passive_abilities_end_turn(this.gameObj, timeout)

      const await_ppa = setInterval(() => {
        if (!this.$store.state.game.ppa_end_turn) {
          clearInterval(await_ppa)
          // Сразу — чтобы игрок 2 увидел урон от пассивок (враг ещё может стоять).
          // Потом через timeout+100 — чистое состояние с уже удалёнными трупами.
          this.sendGameState()
          setTimeout(() => this.sendGameState(), timeout + 100)

          // Шаг 2: ход врагов (AI)
          ai_move(this.gameObj, timeout)

          const await_ai = setInterval(() => {
            if (!this.$store.state.game.ai_move) {
              clearInterval(await_ai)
              this.sendGameState()
              setTimeout(() => this.sendGameState(), timeout + 100)

              // Шаг 3: пассивки врагов конца хода
              enemy_passive_abilities_end_turn(this.gameObj, timeout)

              const await_epa = setInterval(() => {
                if (!this.$store.state.game.epa_end_turn) {
                  clearInterval(await_epa)
                  this.sendGameState()

                  // Шаг 4: выходит новый враг из очереди (если есть)
                  appear_new_enemy(this.gameObj, timeout)
                  appear_new_enemy(this.gameObj, timeout)

                  // Шаг 5: ждём пока все таймеры удаления мёртвых врагов сработают,
                  // затем шлём финальный стейт и передаём ход напарник
                  setTimeout(() => {
                    this.sendGameState() // финальный GAME_STATE
                    this.isActive.player_cards = false
                    this.myTurn = false
                    this.sendTurnEnd() // TURN_END — ход переходит к напарнику
                  }, timeout + 100)

                  const invulnerability: number =
                    this.$store.state.game.invulnerability
                  if (invulnerability > 0) {
                    let new_value = invulnerability - 1
                    if (new_value < 0) new_value = 0
                    this.$store.commit("set_invulnerability", new_value)
                  }
                }
              }, timeout * 0.5)
            }
          }, timeout * 0.5)
        }
      }, timeout * 0.5)
    },

    // Отправляем напарнику наш PLAYER_STATE: рука (только фракции), лидер-фракция, HP, броня.
    // Вызывается при любом изменении gameObj, HP и брони.
    sendPlayerState(): void {
      const ws: WebSocket | null = this.$store.state.multi.ws
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(
        JSON.stringify({
          event: "PLAYER_STATE",
          hand: this.gameObj.hand.map((c: any) => ({
            faction: c.faction ?? "",
          })),
          leader_faction: (this.gameObj.leader as any)?.faction ?? "",
          health: this.$store.getters["health"],
          max_hp: this.$store.getters["maxHp"],
          armor: this.$store.state.game.armor,
          max_armor: this.$store.getters["maxArmor"],
          invulnerability: this.$store.state.game.invulnerability,
          max_immune_turns: this.$store.getters["maxImmuneTurns"],
        })
      )
    },

    // ── Утилиты цветов фракций ───────────────────────────────────────────────

    // Цвет рамки/текста для кнопки-тогглера руки напарника
    factionColor(faction: string): string {
      switch (faction) {
        case "Soldiers":
          return "#366ab8"
        case "Animals":
          return "#047824"
        case "Monsters":
          return "#ea1c1c"
        default:
          return "#6a6a6a"
      }
    },

    // Градиент фона для рубашки карты напарника (по фракции)
    factionCardGradient(faction: string): string {
      switch (faction) {
        case "Soldiers":
          return "linear-gradient(145deg, #0e1f3d 0%, #1e3d6e 50%, #0e1f3d 100%)"
        case "Animals":
          return "linear-gradient(145deg, #02280c 0%, #085c1c 50%, #02280c 100%)"
        case "Monsters":
          return "linear-gradient(145deg, #3d0505 0%, #7a1010 50%, #3d0505 100%)"
        default:
          return "linear-gradient(145deg, #1e1e1e 0%, #3a3a3a 50%, #1e1e1e 100%)"
      }
    },

    // ── Игровые действия (идентичны GamePage.vue, плюс guard !myTurn) ────────

    // Игрок выбрал карту из руки для атаки.
    // Guard !myTurn: блокируем если сейчас ход напарника.
    chose_player_card(card: Card): void {
      this.sca = false
      if (!this.myTurn || !this.isActive.player_cards) return
      this.selected_card = card
      this.isActive.player_leader = false
      this.setActive() // разрешаем выбор цели (враги на поле и лидер становятся кликабельны)
    },

    // Игрок активировал своего лидера.
    // Guard !myTurn: блокируем если не наш ход.
    chose_leader(): void {
      this.sca = false
      if (!this.myTurn || this.gameObj.leader.data.charges <= 0) return
      this.selected_card = this.gameObj.leader
      this.isActive.player_leader = true
      this.setActive()
    },

    // Разрешаем выбор цели: враги и лидер врагов становятся кликабельны
    setActive(): void {
      this.isActive.enemy_cards = true
      this.isActive.enemy_leader = true
    },

    // Запрещаем выбор цели после завершения атаки
    setNotActive(): void {
      this.isActive.enemy_cards = false
      this.isActive.enemy_leader = false
    },

    // После нанесения урона (любым способом):
    // 1. Проверяем нет ли SCA (особой способности) — если есть, уходим в её флоу.
    // 2. Если SCA нет — удаляем сыгранную карту из руки (в могилу или обратно в колоду).
    // 3. Шлём GAME_STATE с небольшой задержкой (чтоб enemy removal timeout уже сработал).
    //    includeHealth=false: урон от карты игрока НЕ передаём напарнику (это урон врагам, а не нам).
    afterDamage(): void {
      this.special_case_abilities() // из миксина specialcaseabilities
      if (!this.show_pick_a_card_selection) {
        remove_dead_card(
          this.selected_card!,
          this.gameObj.grave,
          this.gameObj.hand,
          this.gameObj.deck
        )
        if (this.gameInitialized && this.myTurn) {
          const t = this.$store.getters["selectedMoveTimeout"]
          setTimeout(() => this.sendGameState(false), t + 100)
        }
      }
      this.selected_card = null
      this.show_picked_card = false
      this.setNotActive()
    },

    // Атака по обычному врагу на поле: пробуем атаковать картой и лидером
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
      if (!this.sca) this.isActive.player_cards = false // одна карта = один ход
      this.afterDamage()
    },

    damageEnemyByLeader(): void {
      if (!this.targetEnemyByLeader) return
      damage_ai_card(this.gameObj.leader!, this.selected_enemy!, this.gameObj)
      this.afterDamage()
      this.isActive.player_leader = false
    },

    // Атака по лидеру врагов: пробуем картой и лидером
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

    // ── Управление прицелом ──────────────────────────────────────────────────

    // Лидер врагов под прицелом (переключает подсветку в enemy-leader)
    switch_enemy_leader_in_cross(in_cross: boolean): void {
      this.inCrossEnemyIndex = null
      this.inCrossEnemyLeader = in_cross
    },

    // Враг по индексу под прицелом (передаётся в field-comp)
    switch_enemy_in_cross(index: number | null): void {
      this.inCrossEnemyLeader = false
      this.inCrossEnemyIndex = index
    },

    // Для мульти-атаки: фиксируем уже выбранные цели чтобы не выбрать одну дважды
    switch_enemy_in_cross_locked(indexOrNull: number | "leader" | null): void {
      if (indexOrNull === null) {
        this.multiLockedIndices = []
      } else if (typeof indexOrNull === "number") {
        if (!this.multiLockedIndices.includes(indexOrNull)) {
          this.multiLockedIndices.push(indexOrNull)
        }
      }
    },

    switch_cell_in_cross(index: number | null): void {
      this.inCrossCellIndex = index
    },
    switch_cell_in_cross_locked(indexOrNull: number | null): void {
      if (indexOrNull === null) {
        this.multiLockedCellIndices = []
      } else if (!this.multiLockedCellIndices.includes(indexOrNull)) {
        this.multiLockedCellIndices.push(indexOrNull)
      }
    },

    startTurnTimer(): void {
      this.stopTurnTimer()
      this.turnTimeLeft = 30
      this.turnTimer = setInterval(() => {
        this.turnTimeLeft -= 1
        if (this.turnTimeLeft <= 0) {
          this.stopTurnTimer()
          this.exec_ai_move()
        }
      }, 1000)
    },

    stopTurnTimer(): void {
      if (this.turnTimer !== null) {
        clearInterval(this.turnTimer)
        this.turnTimer = null
      }
      this.turnTimeLeft = 0
    },

    // Одноразовое мигание кнопки-тогглера при любом входящем событии от напарника.
    // nextTick-trick: снимаем класс → ждём перерисовку → вешаем обратно,
    // чтобы анимация перезапускалась даже если предыдущая ещё не закончилась.
    flashOpponent(): void {
      clearTimeout(this.opponentFlashTimer ?? undefined)
      this.opponentActivityFlash = false
      this.$nextTick(() => {
        this.opponentActivityFlash = true
        this.opponentFlashTimer = setTimeout(() => {
          this.opponentActivityFlash = false
        }, 500)
      })
    },

    // Мульти-атака: карта/лидер бьёт сразу по нескольким целям (AOE-способности).
    // targets — массив { isLeader, fieldValue } — всё что выбрал игрок.
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
/* Корневой контейнер: flex-колонка на весь экран без скролла */
.game-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
}

/* Основной блок: поле + правая панель рядом */
.game-block {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  position: relative; /* нужно для absolute-позиционирования полоски руки напарника */
}

/* Кнопка показа/скрытия руки напарника */
.opponent-hand-toggle {
  width: 98%;
  padding: 3px 6px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 200, 50, 0.8);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 200, 50, 0.25);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  letter-spacing: 0.03em;
}

.opponent-hand-toggle:active {
  background: rgba(255, 200, 50, 0.1);
}

@keyframes opponent-flash {
  0% {
    background: rgba(255, 200, 50, 0.35);
    box-shadow: 0 0 8px rgba(255, 200, 50, 0.5);
  }
  100% {
    background: rgba(0, 0, 0, 0.35);
    box-shadow: none;
  }
}

.opponent-hand-toggle--flash {
  animation: opponent-flash 0.5s ease-out;
}

/* Слот для SCA-карты напарника — занимает то же место что кнопка Пас */
.opponent-sca-slot {
  height: 10vh;
  width: 98%;
  margin-bottom: 1%;
  margin-top: 1%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Индикатор "Ход напарника..." — на месте кнопки Пас когда не наш ход */
.opponent-turn-indicator {
  height: 10vh;
  width: 98%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 200, 50, 0.55);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1%;
  margin-top: 1%;
}

/* Полоска руки напарника: накладывается поверх поля сверху */
.opponent-hand-strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 24.5%; /* не заезжает на правую панель */
  z-index: 10;
  height: 7.5vh;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 200, 50, 0.15);
  pointer-events: none; /* не перехватываем клики по полю */
}

.opponent-strip-cards {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  overflow: hidden;
}

.opponent-strip-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
}

.opp-stat {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.opp-hp {
  color: #ff7070;
}
.opp-armor {
  color: #7ab8ff;
}
.opp-immune {
  color: #ffe566;
}

/* Рубашка карты напарника: маленький прямоугольник с цветом фракции */
.opponent-card-back {
  width: 2.6vh;
  height: 3.6vh;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
}

.opponent-hand-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
}

/* Правая панель: 24.5% ширины, вертикальный flex */
.right-panel {
  width: 24.5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: min(6px, calc(var(--vh, 1vh) * 1));
}

/* Пара кнопок в ряд (оставшиеся враги + могила; колода + сброс) */
.div-two-buttons {
  height: 7.5vh;
  width: 98%;
  display: flex;
  flex-direction: row;
  gap: 1px;
}

/* Обёртка кнопки "добрать карту" */
.draw {
  height: 6.3vh;
  width: 98%;
}

/* Анимация появления/скрытия оверлея редро */
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

/* ── Оверлеи (инициализация, редро напарника, отключение) ── */

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
  to {
    transform: rotate(360deg);
  }
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
