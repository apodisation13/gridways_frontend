<template>
  <div
    v-touch:longtap="open_deck_view"
    class="deck-stack"
    :class="{ 'deck-selected': isSelected }"
    @click.right="open_deck_view"
    @contextmenu.prevent
  >
    <!-- Нижние карты стопки (видна только грань) -->
    <div class="card card-4" :style="cardBorder"></div>
    <div class="card card-3" :style="cardBorder"></div>
    <div class="card card-2" :style="cardBorder"></div>

    <!-- Верхняя карта с контентом -->
    <div class="card card-top" :style="cardBorder">
      <div class="leader-image" :style="leaderBg"></div>
      <div class="card-inner">
        <div class="deck-name global_text">{{ deck.deck.name }}</div>

        <div class="deck-hp">
          <div class="heart-icon"></div>
          <span>{{ deck.deck.health }}</span>
        </div>

        <div class="card-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    <deck-modal
      v-if="show_deck"
      :deck="deck.deck.cards"
      :leader="deck.deck.leader"
      @close_deck_modal="show_deck = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import DeckModal from "@/components/ModalWindows/DeckModal.vue"
import { background_color_deck } from "@/logic/border_styles"
import type { DeckEntry } from "@/types"

export default defineComponent({
  name: "DeckPreviewComp",
  components: { DeckModal },
  props: {
    deck: {
      type: Object as PropType<DeckEntry>,
      required: true,
    },
    deckbuilder: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      show_deck: false as boolean,
    }
  },
  computed: {
    cardBorder(): Record<string, string> {
      const bg = background_color_deck(this.deck.deck)
      const color = bg?.backgroundColor || "#888"
      return {
        borderColor: color,
        boxShadow: `0 0 10px ${color}44`,
      }
    },
    leaderBg(): Record<string, string> {
      return {
        backgroundImage: `url(${this.deck.deck.leader?.image})`,
      }
    },
    isSelected(): boolean {
      if (this.deckbuilder) return false
      const current_deck_id = this.$store.state.game.current_deck_id
      return current_deck_id === this.deck.id // это user_decks.id
    },
  },
  methods: {
    open_deck_view(): void {
      this.show_deck = true
    },
  },
})
</script>

<style scoped>
.deck-stack {
  position: relative;
  width: 120px;
  height: 160px;
  cursor: pointer;
}

.deck-stack:hover .card-top {
  transform: translate(-2px, -2px);
}

.deck-stack:hover .card-2 {
  transform: translate(4px, 4px);
}

.deck-stack:hover .card-3 {
  transform: translate(8px, 8px);
}

.deck-stack:hover .card-4 {
  transform: translate(12px, 12px);
}

.deck-selected .card-top {
  transform: translate(-2px, -2px);
  box-shadow:
    0 0 20px gold,
    0 0 40px gold;
}

.deck-selected::after {
  content: "✓";
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1a1a2e;
  font-weight: bold;
  z-index: 10;
}

/* Базовая карта */
.card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 3px solid;
  background: linear-gradient(145deg, #1a1a2e, #0f0f18);
  transition: transform 0.25s ease;
}

/* Смещение карт в стопке */
.card-4 {
  top: 12px;
  left: 12px;
  opacity: 0.4;
}

.card-3 {
  top: 8px;
  left: 8px;
  opacity: 0.6;
}

.card-2 {
  top: 4px;
  left: 4px;
  opacity: 0.8;
}

.card-top {
  top: 0;
  left: 0;
  overflow: hidden;
}

.leader-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 2px;
  overflow: hidden;
  background-size: 100% 100%;
  z-index: 0;
  filter: brightness(1.5) contrast(1.2);
}

.card-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  box-sizing: border-box;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(15, 15, 25, 0.9) 50%
  );
}

.deck-name {
  font-size: 14px;
  text-align: center;
  background: var(--primary-gold-gradient);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  margin-bottom: 10px;
  word-break: break-word;
}

.deck-hp {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 15px;
}

.heart-icon {
  width: 18px;
  height: 18px;
  background-image: url("~@/assets/icons/card/heart_green.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.card-actions {
  display: flex;
  gap: 15px;
}
</style>
