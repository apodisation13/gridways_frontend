<template>
  <div class="draw-btn" :style="themedStyle" :aria-label="drawLabel">
    <div
      v-if="!isHandFull"
      class="draw-cards"
      :class="`draw-cards--${cardsDrawn}`"
      aria-hidden="true"
    >
      <img
        v-for="index in cardsDrawn"
        :key="index"
        class="draw-icon"
        :style="{ left: `${(index - 1) * (cardsDrawn === 2 ? 28 : 22)}%` }"
        src="@/assets/icons/card/draw_card.svg"
        alt=""
        draggable="false"
      />
    </div>
    <span v-else class="redraw-arrows" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M34 14A15 15 0 0 0 8 8L4 12M4 5V12H11" />
          <path d="M6 26A15 15 0 0 0 32 32L36 28M36 35V28H29" />
        </g>
      </svg>
      <span
        class="draw-count"
        :class="{ 'draw-count--empty': fullHandRedrawsRemaining <= 0 }"
        >{{ fullHandRedrawsRemaining }}</span
      >
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import { styleWrapper } from "@/logic/border_styles"
import {
  get_value_from_upgrades,
  UpgradeSubtype,
  UpgradeType,
} from "@/types/upgrades"

export default defineComponent({
  name: "DrawComp",
  props: {
    fullHandRedrawsRemaining: {
      type: Number,
      required: true,
    },
    deckLength: { type: Number, required: true },
    handLength: {
      type: Number,
      required: true,
    },
  },
  computed: {
    cardsDrawn(): number {
      const upgradedDrawCount = get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.CARDS_DRAWN
      )
      return Math.max(
        0,
        Math.min(
          upgradedDrawCount,
          this.$store.getters["handSize"] - this.handLength,
          this.deckLength
        )
      )
    },
    drawLabel(): string {
      return this.isHandFull
        ? `Редро с полной рукой: осталось ${this.fullHandRedrawsRemaining}`
        : `Добор карт: ${this.cardsDrawn}`
    },
    isHandFull(): boolean {
      return this.handLength >= this.$store.getters["handSize"]
    },
    themedStyle(): Record<string, string> | undefined {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
  },
})
</script>

<style scoped>
.draw-btn {
  height: 70%;
  width: 98%;
  margin-bottom: 1%;
  margin-top: 1%;
  position: relative;
  border-radius: 50%;
  background: linear-gradient(145deg, #2a5a3a, #1a3a2a);

  cursor: pointer;
  transition: all 0.2s ease;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0 5%;
}

.draw-btn:active {
  transform: scale(0.98);
}

.draw-cards {
  position: relative;
  width: 65%;
  min-width: 0;
  height: 85%;
  pointer-events: none;
}
.draw-icon {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(-1px 0 1px rgba(0, 0, 0, 0.45));
}
.draw-cards--2 .draw-icon {
  width: 72%;
}
.draw-cards--3 .draw-icon {
  width: 56%;
}
.redraw-arrows {
  position: relative;
  height: 85%;
  aspect-ratio: 1;
  color: white;
  pointer-events: none;
}
.redraw-arrows svg {
  display: block;
  width: 100%;
  height: 100%;
}
.draw-count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4ade80;
  font-size: min(14px, calc(var(--vh, 1vh) * 1.8));
  font-weight: 700;
  line-height: 1;
}
.draw-count--empty {
  color: #ef4444;
}
</style>
