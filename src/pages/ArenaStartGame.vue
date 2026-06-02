<template>
  <div class="start-game__page">
    <div class="arena-top-bar">
      <button class="arena-exit-btn" @click="showExitConfirm = true">
        ВЫХОД
      </button>
    </div>
    <yesno-modal
      v-if="showExitConfirm"
      @confirm="exit_arena"
      @cancel="showExitConfirm = false"
    />

    <div class="resources-bar">
      <resource-list :resources="arena_resources" highlight_max_count />
    </div>

    <div class="content-wrapper">
      <!-- Уровень vs Колода -->
      <div class="battle-section">
        <div class="battle-side">
          <span class="global_text battle-label">Уровень</span>
          <level-preview-comp v-if="arena_level" :level="arena_level" />
        </div>

        <div class="battle-vs">
          <span class="vs-icon">⚔</span>
        </div>

        <div class="battle-side">
          <span class="global_text battle-label">Колода</span>
          <deck-preview-comp :deck="synthetic_deck" :deckbuilder="false" />
        </div>
      </div>

      <!-- Цена и кнопка старта -->
      <div class="start-section">
        <span class="global_text price-label">Стоимость игры</span>
        <div class="play-price">
          <resource-item
            name="crops"
            :count="play_price.crops"
            style="transform: scale(1.5)"
          />
          <resource-item
            name="wood"
            :count="play_price.wood"
            style="transform: scale(1.5)"
          />
          <resource-item
            v-if="play_price.silk"
            name="silk"
            :count="play_price.silk"
            style="transform: scale(1.5)"
          />
          <resource-item
            name="money"
            :count="play_price.money"
            style="transform: scale(1.5)"
          />
        </div>

        <button class="btn-start" :disabled="loading" @click="start_game">
          <themed-button title="НАЧАТЬ" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import DeckPreviewComp from "@/components/DeckPreviewComp.vue"
import LevelPreviewComp from "@/components/LevelPreviewComp.vue"
import YesnoModal from "@/components/ModalWindows/YesnoModal.vue"
import ResourceList from "@/components/ResourceList.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"

const ARENA_RESOURCE_KEYS = [
  "scraps",
  "raw_bronze",
  "raw_silver",
  "raw_gold",
  "crops",
  "wood",
  "silk",
  "money",
]
import { random_level_generator_by_number } from "@/logic/random_level"
import {
  DeckCardEntry,
  DeckEntry,
  Leader,
  MappedUserLevel,
  PayResourcesSubtype,
} from "@/types"

export default defineComponent({
  name: "ArenaStartGame",
  components: {
    ResourceItem,
    ResourceList,
    DeckPreviewComp,
    LevelPreviewComp,
    ThemedButton,
    YesnoModal,
  },
  data() {
    return {
      loading: false,
      showExitConfirm: false,
    }
  },
  computed: {
    arena_resources(): Record<string, number> {
      const all = this.$store.getters["resource"]
      return Object.fromEntries(
        ARENA_RESOURCE_KEYS.filter(k => (all[k] ?? 0) > 0).map(k => [k, all[k]])
      )
    },
    arena_level(): MappedUserLevel | null {
      return this.$store.getters["arena_level"]
    },
    arena_deck(): DeckCardEntry[] {
      return this.$store.getters["arena_deck"]
    },
    arena_leader(): Leader | null {
      return this.$store.getters["arena_leader"]
    },
    arena_health(): number {
      return this.$store.getters["arena_health"]
    },
    synthetic_deck(): DeckEntry {
      return {
        id: -1,
        deck: {
          id: -1,
          name: "Арена",
          leader: this.arena_leader ?? undefined,
          cards: this.arena_deck,
          health: this.arena_health,
        },
      }
    },
    play_price(): Record<string, number> {
      if (!this.arena_level) return {}
      const config = this.$store.getters["start_level_prices"]
      const diff = this.arena_level.level.difficulty
      const cards = this.arena_deck

      const result: Record<string, number> = {}

      const diff_costs = config.levels_difficulty_values?.[diff] || {}
      for (const [resource, cfg] of Object.entries(diff_costs)) {
        result[resource] =
          (result[resource] || 0) + Math.abs((cfg as any).value)
      }

      const card_costs = config.player_cards_values
      for (const card of cards) {
        const color = (card as any).card?.color?.toLowerCase() ?? "bronze"
        const color_costs = card_costs?.[color] || {}
        for (const [resource, value] of Object.entries(color_costs)) {
          result[resource] = (result[resource] || 0) + Math.abs(value as number)
        }
      }

      return result
    },
  },
  created() {
    if (!this.arena_level) {
      const enemies = this.$store.state.arena.current_enemies
      const level = random_level_generator_by_number(enemies)
      ;(level.level as any).random = true
      this.$store.commit("arena_set_level", level)
    }
  },
  methods: {
    exit_arena(): void {
      this.$store.commit("set_arena_mode", false)
      this.$store.commit("arena_reset")
      this.$store.dispatch("syncGameUpgrades")
      this.$router.push("/main")
    },
    async start_game(): Promise<void> {
      this.loading = true

      const level = this.arena_level!

      // здесь мы все значения поставили с минусом, мы же списываем ресурс
      const payload = Object.fromEntries(
        Object.entries(this.play_price).map(([k, v]) => [k, -v])
      )
      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.startArenaLevel,
        data: payload,
      })

      this.$store.commit("set_level", level)
      this.$store.commit("set_enemy_leader", level.level.enemy_leader)

      this.$store.commit("set_whole_deck", this.synthetic_deck)
      this.$store.commit("set_current_deck", this.arena_deck)
      this.$store.commit("set_health", this.arena_health)
      this.$store.commit("set_leader", this.arena_leader)
      this.$store.commit("set_armor", 0)
      this.$store.commit("set_start_game_redirect", true)

      this.$router.push("/game")
    },
  },
})
</script>

<style scoped>
.start-game__page {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
  height: calc(var(--vh, 1vh) * 100 - 100px);
  color: white;
}

.arena-top-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 6px 10px 0;
}

.arena-exit-btn {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(255, 80, 80, 0.5);
  border-radius: 6px;
  background: rgba(180, 40, 40, 0.18);
  color: rgba(255, 100, 100, 0.85);
  cursor: pointer;
  letter-spacing: 0.05em;
}

.arena-exit-btn:active {
  background: rgba(180, 40, 40, 0.35);
}

.resources-bar {
  flex-shrink: 0;
  padding: 6px 12px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-top: 30px;
}

.content-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.battle-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.battle-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 12px 12px 0;
}

.battle-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.battle-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 22px;
}

.vs-icon {
  font-size: 36px;
  filter: drop-shadow(0 0 8px rgba(255, 200, 50, 0.7));
  animation: vs-pulse 2s ease-in-out infinite;
}

@keyframes vs-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 6px rgba(255, 200, 50, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 18px rgba(255, 200, 50, 1));
  }
}

.start-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.play-price {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
}

.price-label {
  font-size: 23px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 18px;
}

.btn-start {
  width: 200px;
  height: 60px;
  margin: 18px;
}

.btn-start:disabled {
  filter: grayscale(1) brightness(0.55);
  cursor: not-allowed;
}
</style>
