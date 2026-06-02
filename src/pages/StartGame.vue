<template>
  <div class="start-game__page">
    <div class="content-wrapper">
      <!-- Уровень vs Колода -->
      <div class="battle-section">
        <div class="battle-side">
          <span class="global_text battle-label">Уровень</span>
          <level-preview-comp :level="selectedLevel" />
        </div>

        <div class="battle-vs">
          <span class="vs-icon">⚔</span>
        </div>

        <div class="battle-side">
          <span class="global_text battle-label">Колода</span>
          <deck-preview-comp
            :deck="selectedDeck"
            :deckbuilder="true"
            @dblclick="trigger_decks_list_modal(true)"
          />
        </div>
      </div>

      <!-- Цена и кнопка старта -->
      <div class="start-section">
        <span class="global_text price-label">Стоимость игры</span>
        <div class="play-price">
          <resource-item
            v-if="play_price.crops"
            name="crops"
            :count="play_price.crops"
            style="transform: scale(1.5)"
          />
          <resource-item
            v-if="play_price.wood"
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

        <button
          :disabled="loading || insufficientResources"
          class="btn-start"
          @click="start_game"
        >
          <themed-button title="НАЧАТЬ" />
        </button>
      </div>
    </div>

    <!-- Не трогаем -->
    <button-decks @click="trigger_decks_list_modal(true)" />
    <decks-list-modal
      v-if="show_decks_list_modal"
      :deckbuilder="false"
      @close_decks_list_modal="trigger_decks_list_modal(false)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import DeckPreviewComp from "@/components/DeckPreviewComp.vue"
import LevelPreviewComp from "@/components/LevelPreviewComp.vue"
import DecksListModal from "@/components/ModalWindows/DecksListModal.vue"
import ButtonDecks from "@/components/Pages/DeckbuildPage/Buttons/ButtonDecks.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { GameStatsRecordType, PayResourcesSubtype } from "@/types"

export default defineComponent({
  name: "StartGame",
  components: {
    ResourceItem,
    DeckPreviewComp,
    LevelPreviewComp,
    DecksListModal,
    ThemedButton,
    ButtonDecks,
  },
  data() {
    return {
      loading: false,
      show_decks_list_modal: false,
    }
  },
  computed: {
    // теперь это используется только для отображения, и всё равно мы на бэке всё валидируем
    play_price(): Record<string, number> {
      // первый уровень первого сезона теперь стоит 1 деньги :)
      const levelId: number = this.selectedLevel.level.id
      if (levelId === 1) {
        return { money: 1 }
      }

      const config = this.$store.getters["start_level_prices"]
      const diff = this.$store.state.game.level.difficulty
      const cards = this.selectedDeck.deck.cards

      const result: Record<string, number> = {}

      // 1. Стоимость по сложности уровня
      const diff_costs = config.levels_difficulty_values[diff] || {}
      for (const [resource, cfg] of Object.entries(diff_costs)) {
        result[resource] =
          (result[resource] || 0) + Math.abs((cfg as any).value)
      }

      // 2. Стоимость каждой карты в колоде
      const card_costs = config.player_cards_values
      for (const card of cards) {
        const color = (card as any).card.color.toLowerCase() // "Bronze" → "bronze"
        const color_costs = card_costs[color] || {}
        for (const [resource, value] of Object.entries(color_costs)) {
          result[resource] = (result[resource] || 0) + Math.abs(value as number)
        }
      }

      return result
    },
    selectedLevel(): any {
      return this.$store.state.game.whole_level
    },
    selectedDeck(): any {
      return this.$store.state.game.whole_deck
    },
    insufficientResources(): boolean {
      const userResources = this.$store.getters["resource"]
      return Object.entries(this.play_price).some(
        ([key, cost]) => (userResources[key] ?? 0) < cost
      )
    },
  },
  created() {
    this.$store.dispatch("re_set_deck", 100)
  },
  methods: {
    async start_game(): Promise<void> {
      this.loading = true

      // здесь мы все значения поставили с минусом, мы же списываем ресурс
      const payload = Object.fromEntries(
        Object.entries(this.play_price).map(([k, v]) => [k, -v])
      )

      try {
        await this.$store.dispatch("processResources", {
          subtype: PayResourcesSubtype.startSeasonLevel,
          data: payload,
        })
        await this.$store.dispatch("postUserStatistic", {
          user_deck_id: this.selectedDeck.id,
          type: GameStatsRecordType.play,
        })
        this.$store.commit("set_start_game_redirect", true)
        this.$store.commit("set_armor", 0)
        this.$router.push("/game") // ВОТ ТУТ мы переходим на игру и ТОЛЬКО тут (с флагом, что запрос успешно)
        this.loading = false
      } catch (err) {
        alert("Что-то пошло не так, сыграть невозможно")
        this.loading = false
      }
    },
    trigger_decks_list_modal(value: boolean): void {
      this.show_decks_list_modal = value
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

.content-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

/* --- Секция битвы --- */
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
  /* Учитываем overflow стопки карт (12px вправо и вниз) */
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
  padding-bottom: 22px; /* компенсация label сверху */
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
