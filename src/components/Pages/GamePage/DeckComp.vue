<template>
  <div>
    <button
      @click="flag = true"
      class="deck-btn"
      :style="{ backgroundColor: trigger_passive ? 'yellow' : '' }"
    >
      <svg
        class="deck-svg"
        viewBox="20 20 70 90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stackBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0077cc" />
            <stop offset="100%" stop-color="#004488" />
          </linearGradient>
        </defs>

        <!-- Нижняя карта -->
        <rect
          x="25"
          y="35"
          width="50"
          height="70"
          rx="5"
          :fill="light_background_color"
          stroke="#222"
          stroke-width="1"
        />
        <!-- Средняя карта -->
        <rect
          x="30"
          y="30"
          width="50"
          height="70"
          rx="5"
          :fill="light_background_color"
          stroke="#222"
          stroke-width="1"
        />
        <!-- Верхняя карта -->
        <rect
          x="35"
          y="25"
          width="50"
          height="70"
          rx="5"
          :fill="light_background_color"
          stroke="#222"
          stroke-width="2"
        />

        <!-- Символ игрока: щит с мечом -->
        <!-- Щит -->
        <path
          d="M60 35 L72 40 L72 52 L60 62 L48 52 L48 40 Z"
          fill="#cce5ff"
          stroke="#fff"
          stroke-width="2"
        />
        <image
          :href="require('@/assets/icons/card/sword.svg')"
          x="48"
          y="35"
          width="25"
          height="25"
        />

        <!-- Счётчик (справа внизу) -->
        <circle
          cx="72"
          cy="79"
          r="14"
          :fill="background_color"
          stroke="#fff"
          stroke-width="2"
        />
        <text
          x="72"
          y="85"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="18"
          font-weight="bold"
          fill="#fff"
        >
          {{ deck_len }}
        </text>
      </svg>
    </button>
    <modal-window v-if="flag" v-touch:swipe="close_self">
      <button-close @close_self="close_self" />
      <card-list-component :cards="deck" />
    </modal-window>
  </div>
</template>

<script>
import ModalWindow from "@/components/ModalWindows/ModalWindow"
import ButtonClose from "@/components/UI/Buttons/ButtonClose"
import CardListComponent from "@/components/Cards/CardListComponent"
export default {
  name: "deck-comp",
  components: { CardListComponent, ButtonClose, ModalWindow },
  props: {
    deck: {
      required: true,
      type: Array,
    },
    leader: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      flag: false,
    }
  },
  computed: {
    deck_len() {
      return this.deck.length
    },
    factionConfig() {
      const FACTION_CONFIG = {
        Soldiers: {
          base: "#2563eb",
          light: "#60a5fa",
        },
        Monsters: {
          base: "#dc2626",
          light: "#f87171",
        },
        Animals: {
          base: "#16a34a",
          light: "#4ade80",
        },
        default: {
          base: "#000000",
        },
      }
      if (this.deck_len === 0) return FACTION_CONFIG.default

      const config = FACTION_CONFIG[this.leader.faction]
      return config || FACTION_CONFIG.default
    },
    background_color() {
      return this.factionConfig.base
    },
    light_background_color() {
      return this.factionConfig.light
    },
    trigger_passive() {
      for (const card of this.deck) {
        if (card.trigger_deck_passive) return true
      }
      return false
    },
  },
  methods: {
    close_self() {
      this.flag = false
    },
  },
}
</script>

<style scoped>
.deck-btn {
  height: 98%;
  width: 47px;
  position: relative;
  border-radius: 10px;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.deck-svg {
  width: 100%;
  height: 100%;
  max-width: 47px;
  max-height: 66px;
}

.deck-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.4);
}

.deck-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(139, 0, 0, 0.3);
}

.deck-btn.trigger-passive {
  background: transparent;
  border: none;
  color: #8b0000;
  animation: pulse-gold 2s infinite;
}

@keyframes pulse-gold {
  0%,
  100% {
    box-shadow: 0 4px 8px rgba(255, 204, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 15px rgba(255, 204, 0, 0.6);
  }
}
</style>
