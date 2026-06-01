<template>
  <div class="arena-deckbuild-page">
    <!-- Верхняя зона: пик карт / лидеров / панель уровня -->
    <div class="top-zone">
      <!-- Фаза выбора карт (начальный набор) -->
      <div v-if="phase === 'picking_cards'" class="pick-zone">
        <div class="pick-label global_text">
          Выберите карту ({{ deck.deck_is_progress.length }}/{{
            maxCardsInDeck
          }})
        </div>
        <div class="pick-row">
          <div
            v-for="card in offered_cards"
            :key="card.card.id"
            class="pick-card"
            @dblclick="pick_card(card)"
          >
            <card-item :card="card.card" :user_card="card" :hp_needed="true" />
          </div>
        </div>
      </div>

      <!-- Фаза выбора лидера -->
      <div v-else-if="phase === 'picking_leader'" class="pick-zone">
        <div class="pick-label global_text">Выберите лидера</div>
        <div class="pick-row">
          <div
            v-for="leader in offered_leaders"
            :key="leader.card.id"
            class="pick-card"
            @click="pick_leader(leader)"
          >
            <card-item
              :card="leader.card"
              :user_card="leader"
              :is_leader="true"
              :hp_needed="true"
            />
          </div>
        </div>
      </div>

      <!-- Фаза pick_one_card: выбрать одну из трёх -->
      <div v-else-if="phase === 'pick_one_card'" class="pick-zone">
        <div class="pick-label global_text">Выберите карту</div>
        <div class="pick-row">
          <div
            v-for="card in offered_cards"
            :key="card.card.id"
            class="pick-card"
            @dblclick="on_pick_one_card(card)"
          >
            <card-item :card="card.card" :user_card="card" :hp_needed="true" />
          </div>
        </div>
      </div>

      <!-- Фаза готово: панель уровня -->
      <div v-else class="level-panel">
        <div class="level-info global_text">
          Уровень {{ current_level }} - врагов {{ arena_current_enemies }}
        </div>
        <button class="btn-next" @click="go_next">
          <themed-button title="ДАЛЕЕ" />
        </button>
        <div class="extra-buttons">
          <button
            class="btn-extra"
            :class="{ 'btn-active': can_use_card_button }"
            @click="can_use_card_button ? click_card_button() : warn_card()"
          >
            Card
          </button>
          <button
            class="btn-extra"
            :class="{ 'btn-active': can_use_redraw }"
            @click="can_use_redraw ? click_redraw() : warn_redraw()"
          >
            Redraw
          </button>
          <button
            class="btn-extra"
            :class="{ 'btn-active': can_use_fixdraw }"
            @click="can_use_fixdraw ? click_fixdraw() : warn_fixdraw()"
          >
            FixDraw
          </button>
          <button
            class="btn-extra btn-upgrades btn-active"
            @click="showUpgrades = true"
          >
            Upgrades
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка выбора карты для сброса (Redraw / FixDraw) -->
    <div
      v-if="phase === 'remove_for_redraw' || phase === 'remove_for_fixdraw'"
      class="adp-modal-overlay"
    >
      <div class="adp-modal-panel">
        <div class="adp-modal-header">
          <h2 class="adp-modal-title">Выберите карту для сброса</h2>
        </div>
        <div class="adp-modal-cards-grid">
          <div
            v-for="(entry, idx) in deck.deck_is_progress"
            :key="`remove-${entry.card?.id ?? ''}-${idx}`"
            class="pick-card"
            @dblclick="remove_card_from_deck(idx)"
          >
            <card-item
              v-if="entry.card"
              :card="entry.card"
              :user_card="entry as any"
              :hp_needed="true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка выбора любой карты (FixDraw) -->
    <div v-if="phase === 'pick_exact_card'" class="adp-modal-overlay">
      <div class="adp-modal-panel adp-modal-panel--tall">
        <div class="adp-modal-header">
          <h2 class="adp-modal-title">Выберите любую карту</h2>
        </div>
        <div class="adp-modal-cards-scroll">
          <card-list-component
            :cards="all_cards_for_exact_pick"
            :hp_needed="true"
            @chose_player_card="on_pick_exact_card"
          />
        </div>
      </div>
    </div>

    <arena-upgrades-modal v-if="showUpgrades" @close="showUpgrades = false" />

    <!-- Нижняя зона: сборка колоды -->
    <div class="bottom-zone">
      <block-assembling-the-deck
        :deck="deck"
        :arena_mode="true"
        :cant_save_deck="false"
        @change_order_deck="change_order_deck"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import CardItem from "@/components/Cards/CardItem.vue"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import ArenaUpgradesModal from "@/components/Pages/ArenaDeckbuildPage/ArenaUpgradesModal.vue"
import BlockAssemblingTheDeck from "@/components/Pages/DeckbuildPage/BlockAssemblingTheDeck.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import type { CardEntry, DeckCardEntry, Leader, LeaderEntry } from "@/types"

interface ActiveDeck {
  deck_id: null
  deck_name: string
  deck_is_progress: DeckCardEntry[]
  deck_body: number[]
  leader: Leader | null
  health: number
}

type Phase =
  | "picking_cards"
  | "picking_leader"
  | "ready"
  | "pick_one_card"
  | "pick_exact_card"
  | "remove_for_redraw"
  | "remove_for_fixdraw"

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default defineComponent({
  name: "ArenaDeckbuildPage",
  components: {
    CardItem,
    CardListComponent,
    BlockAssemblingTheDeck,
    ThemedButton,
    ArenaUpgradesModal,
  },
  setup() {
    return { toast: useToast() }
  },
  data() {
    return {
      showUpgrades: false,
      phase: "picking_cards" as Phase,
      active_special: null as null | "redraw" | "fixdraw",
      deck: {
        deck_id: null,
        deck_name: "",
        deck_is_progress: [],
        deck_body: [],
        leader: null,
        health: 0,
      } as ActiveDeck,
      offered_cards: [] as CardEntry[],
      offered_leaders: [] as LeaderEntry[],
    }
  },
  computed: {
    maxCardsInDeck(): number {
      return this.$store.getters["maxCardsInDeck"]
    },
    current_level(): number {
      return this.$store.getters["arena_current_level"]
    },
    arena_current_enemies(): number {
      return this.$store.getters["arena_current_enemies"]
    },
    all_cards(): CardEntry[] {
      return this.$store.getters["all_cards"]
    },
    all_leaders(): LeaderEntry[] {
      return this.$store.getters["all_leaders"]
    },
    deck_already_built(): boolean {
      return this.$store.getters["arena_deck"].length > 0
    },
    can_use_card_button(): boolean {
      return this.deck.deck_is_progress.length < this.maxCardsInDeck
    },
    can_use_redraw(): boolean {
      return (
        (this.$store.state.arena.user_upgrades["arena_redraw_card"] ?? 0) >= 1
      )
    },
    fix_draw_cooldown_since(): number | null {
      const v = this.$store.state.arena.user_upgrades["fix_draw_cooldown_since"]
      return v !== undefined ? v : null
    },
    fix_draw_cooldown(): number {
      return this.$store.getters["arena_params"]?.cooldown_fix_draw ?? 3
    },
    fix_draw_available_at(): number | null {
      if (this.fix_draw_cooldown_since === null) return null
      return this.fix_draw_cooldown_since + this.fix_draw_cooldown
    },
    is_fix_draw_on_cooldown(): boolean {
      const at = this.fix_draw_available_at
      return at !== null && this.current_level < at
    },
    can_use_fixdraw(): boolean {
      return (
        !this.is_fix_draw_on_cooldown &&
        (this.$store.state.arena.user_upgrades["arena_draw_exact_card"] ?? 0) >=
          1
      )
    },
    all_cards_for_exact_pick(): CardEntry[] {
      return this.all_cards.map(c => ({ ...c, count: 1 }))
    },
  },
  created() {
    this.$store.commit("set_arena_mode", true)
    this.$store.dispatch("sync_arena_game_params")
    if (this.deck_already_built) {
      this.restore_deck_from_store()
      this.phase = "ready"
    } else {
      this.draw_cards()
    }
  },
  methods: {
    draw_cards(): void {
      this.offered_cards = pickRandom(this.all_cards, 3)
    },
    draw_leaders(): void {
      this.offered_leaders = pickRandom(this.all_leaders, 3)
    },
    pick_card(card: CardEntry): void {
      const entry: DeckCardEntry = { card: card.card, count: 1 }
      this.deck.deck_is_progress.push(entry)
      this.deck.deck_body.push(card.card.id)
      this.deck.health += card.card.data.hp

      if (this.deck.deck_is_progress.length >= this.maxCardsInDeck) {
        this.phase = "picking_leader"
        this.draw_leaders()
      } else {
        this.draw_cards()
      }
    },
    pick_leader(leader: LeaderEntry): void {
      this.deck.leader = leader.card
      this.deck.health += leader.card.data.hp
      this.phase = "ready"
    },
    // --- Card button ---
    click_card_button(): void {
      this.active_special = null
      this.draw_cards()
      this.phase = "pick_one_card"
    },
    warn_card(): void {
      this.toast.warning("Колода уже заполнена до максимума")
    },
    // --- Redraw button ---
    click_redraw(): void {
      this.active_special = "redraw"
      this.phase = "remove_for_redraw"
    },
    warn_redraw(): void {
      this.toast.warning(
        "Прокачайте возможность замены карт — внимание: апгрейд работает одноразово"
      )
    },
    // --- FixDraw button ---
    click_fixdraw(): void {
      this.active_special = "fixdraw"
      this.phase = "remove_for_fixdraw"
    },
    warn_fixdraw(): void {
      if (this.is_fix_draw_on_cooldown) {
        this.toast.warning(
          `FixDraw в кулдауне — доступно с уровня ${this.fix_draw_available_at}`
        )
      } else {
        this.toast.warning(
          "Прокачайте возможность взять ЛЮБУЮ КАРТУ — внимание: апгрейд работает одноразово"
        )
      }
    },
    // Removes card at index; transitions based on active_special
    remove_card_from_deck(index: number): void {
      const [removed] = this.deck.deck_is_progress.splice(index, 1)
      this.deck.deck_body.splice(index, 1)
      if (removed.card) this.deck.health -= removed.card.data.hp

      if (this.active_special === "redraw") {
        this.draw_cards()
        this.phase = "pick_one_card"
      } else {
        this.phase = "pick_exact_card"
      }
    },
    // Picks one of three offered cards (Card button or Redraw step 2)
    on_pick_one_card(card: CardEntry): void {
      const entry: DeckCardEntry = { card: card.card, count: 1 }
      this.deck.deck_is_progress.push(entry)
      this.deck.deck_body.push(card.card.id)
      this.deck.health += card.card.data.hp

      if (this.active_special === "redraw") {
        this.$store.commit("arena_use_upgrade", "arena_redraw_card")
      }
      this.active_special = null
      this.phase = "ready"
    },
    // Picks any card from full list (FixDraw step 2)
    on_pick_exact_card(card: CardEntry): void {
      const entry: DeckCardEntry = { card: card.card, count: 1 }
      this.deck.deck_is_progress.push(entry)
      this.deck.deck_body.push(card.card.id)
      this.deck.health += card.card.data.hp

      this.$store.commit("arena_use_upgrade", "arena_draw_exact_card")
      this.$store.commit("arena_set_user_upgrade", {
        key: "fix_draw_cooldown_since",
        value: this.current_level,
      })
      this.active_special = null
      this.phase = "ready"
    },
    restore_deck_from_store(): void {
      const storeDeck: DeckCardEntry[] = this.$store.getters["arena_deck"]
      const storeLeader: Leader | null = this.$store.getters["arena_leader"]
      const storeHealth: number = this.$store.getters["arena_health"]

      this.deck.deck_is_progress = [...storeDeck]
      this.deck.deck_body = storeDeck.map(c => c.card?.id ?? 0)
      this.deck.leader = storeLeader
      this.deck.health = storeHealth
    },
    change_order_deck(index: number): void {
      this.deck.deck_is_progress.push(
        ...this.deck.deck_is_progress.splice(index, 1)
      )
      this.deck.deck_body.push(...this.deck.deck_body.splice(index, 1))
    },
    go_next(): void {
      if (!this.deck.leader) return
      this.$store.commit("arena_set_deck_complete", {
        deck: this.deck.deck_is_progress,
        leader: this.deck.leader,
      })
      this.$router.push("/arena/start_game")
    },
  },
})
</script>

<style scoped>
.arena-deckbuild-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
}

.top-zone {
  flex: 0 0 auto;
  padding: 10px;
}

.bottom-zone {
  flex: 1;
  overflow-y: auto;
  background: #3c4d60;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.7);
  padding: 5px;
}

.pick-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pick-label {
  font-size: 14px;
  color: #fceabc;
}

.pick-row {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.pick-card {
  width: 90px;
  cursor: pointer;
}

.level-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.level-info {
  font-size: 22px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-next {
  width: 160px;
  height: 48px;
}

.extra-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-extra {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #444;
  border-radius: 6px;
  background: transparent;
  color: #444;
  cursor: pointer;
}

.btn-upgrades {
  margin-left: 8px;
}

.btn-active {
  border-color: #c49000;
  color: #c49000;
}

.btn-active:active {
  background: rgba(196, 144, 0, 0.15);
}

/* Modals — prefixed to avoid collision with ArenaUpgradesModal root class */
.adp-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adp-modal-panel {
  background: linear-gradient(
    180deg,
    rgba(20, 25, 40, 0.99) 0%,
    rgba(10, 15, 28, 0.99) 100%
  );
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(196, 144, 0, 0.2);
}

.adp-modal-panel--tall {
  max-height: 90vh;
}

.adp-modal-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(196, 144, 0, 0.2);
  flex-shrink: 0;
}

.adp-modal-title {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: hsl(39, 82%, 62%);
  margin: 0;
}

.adp-modal-cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

.adp-modal-cards-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
</style>
