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
            @dblclick="trigger_decks_list_modal(true)"
            :deck="selectedDeck"
            :deckbuilder="true"
          />
        </div>
      </div>

      <!-- Цена и кнопка старта -->
      <div class="start-section">
        <div class="play-price">
          <span class="global_text price-label">Стоимость игры</span>
          <div class="price-row">
            <b class="price-amount">{{ play_price * -1 }}</b>
            <img
              :src="require(`@/assets/icons/resources/wood.svg`)"
              alt=""
              class="wood"
            />
          </div>
        </div>

        <button @click="start_game" :disabled="loading" class="btn-start">
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

<script>
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import { PayResourcesSubtype } from "@/store/const/const"
import ButtonDecks from "@/components/Pages/DeckbuildPage/Buttons/ButtonDecks.vue"
import DecksListModal from "@/components/ModalWindows/DecksListModal.vue"
import LevelPreviewComp from "@/components/LevelPreviewComp.vue"
import DeckPreviewComp from "@/components/DeckPreviewComp.vue"
export default {
  name: "StartGame",
  components: {
    DeckPreviewComp,
    LevelPreviewComp,
    DecksListModal,
    ThemedButton,
    ButtonDecks,
  },
  created() {
    this.$store.dispatch("re_set_deck", 100)
  },
  data() {
    return {
      loading: false,
      show_decks_list_modal: false,
    }
  },
  computed: {
    // теперь это используется только для отображения, и всё равно мы на бэке всё валидируем
    play_price() {
      const diff = this.$store.state.game.level.difficulty
      const price = this.$store.state.user_actions.game_prices
      if (diff === "easy") return price.play_level_easy
      else if (diff === "normal") return price.play_level_normal
      else if (diff === "hard") return price.play_level_hard
      else return "Уровень не выбран!"
    },
    selectedLevel() {
      return this.$store.state.game.whole_level
    },
    selectedDeck() {
      return this.$store.state.game.whole_deck
    },
  },
  methods: {
    async start_game() {
      this.loading = true
      try {
        // вот здесь мы присылаем level.id, на бэке всё вычислим тоже, сколько нужно заплатить
        await this.$store.dispatch("processResources", {
          subtype: PayResourcesSubtype.startSeasonLevel,
          data: { difficulty: this.$store.state.game.level.difficulty },
        })
        this.$store.commit("set_start_game_redirect", true)
        setTimeout(() => {
          this.$router.push("/game") // ВОТ ТУТ мы переходим на игру и ТОЛЬКО тут (с флагом, что запрос успешно)
          this.loading = false
        }, 1000)
      } catch (err) {
        alert("Что-то пошло не так, сыграть невозможно")
        this.loading = false
      }
    },
    trigger_decks_list_modal(value) {
      this.show_decks_list_modal = value
    },
  },
}
</script>

<style scoped>
.start-game__page {
  display: flex;
  flex-direction: column;
  padding-bottom: 57px;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  color: white;
}

.content-wrapper {
  flex: 1;
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

/* --- Секция старта --- */
.start-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.play-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.price-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-amount {
  font-size: 28px;
  font-weight: bold;
}

.wood {
  max-height: 28px;
}

.btn-start {
  width: 200px;
  height: 60px;
}
</style>
