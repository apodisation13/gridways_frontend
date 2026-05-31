<template>
  <div class="arena-deckbuild-page">
    <!-- Верхняя зона: пик карт / лидеров / панель уровня -->
    <div class="top-zone">
      <!-- Фаза выбора карт -->
      <div v-if="phase === 'picking_cards'" class="pick-zone">
        <div class="pick-label global_text">
          Выберите карту ({{ deck.deck_is_progress.length }}/{{ MAX_CARDS }})
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

      <!-- Фаза готово: панель уровня -->
      <div v-else class="level-panel">
        <div class="level-info global_text">
          Уровень {{ current_level }} - врагов {{ arena_current_enemies }}
        </div>
        <button class="btn-next" @click="go_next">
          <themed-button title="ДАЛЕЕ" />
        </button>
        <div class="extra-buttons">
          <button class="btn-extra" disabled>Card</button>
          <button class="btn-extra" disabled>Redraw</button>
          <button class="btn-extra" disabled>FixDraw</button>
          <button
            class="btn-extra btn-upgrades btn-active"
            @click="showUpgrades = true"
          >
            Upgrades
          </button>
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

import CardItem from "@/components/Cards/CardItem.vue"
import ArenaUpgradesModal from "@/components/Pages/ArenaDeckbuildPage/ArenaUpgradesModal.vue"
import BlockAssemblingTheDeck from "@/components/Pages/DeckbuildPage/BlockAssemblingTheDeck.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import type { CardEntry, DeckCardEntry, Leader, LeaderEntry } from "@/types"

const MAX_CARDS = 12

interface ActiveDeck {
  deck_id: null
  deck_name: string
  deck_is_progress: DeckCardEntry[]
  deck_body: number[]
  leader: Leader | null
  health: number
}

type Phase = "picking_cards" | "picking_leader" | "ready"

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default defineComponent({
  name: "ArenaDeckbuildPage",
  components: {
    CardItem,
    BlockAssemblingTheDeck,
    ThemedButton,
    ArenaUpgradesModal,
  },
  data() {
    return {
      MAX_CARDS,
      showUpgrades: false,
      phase: "picking_cards" as Phase,
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
  },
  created() {
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

      if (this.deck.deck_is_progress.length >= MAX_CARDS) {
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
      this.$store.commit("arena_set_active", true)
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
  border: 1px solid #666;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: not-allowed;
}

.btn-upgrades {
  margin-left: 8px;
}

.btn-active {
  border-color: #c49000;
  color: #c49000;
  cursor: pointer;
}

.btn-active:active {
  background: rgba(196, 144, 0, 0.15);
}
</style>
