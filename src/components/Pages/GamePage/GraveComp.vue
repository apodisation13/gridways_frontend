<template>
  <div>
    <button
      @click="flag = true"
      class="grave-btn"
      :style="{ backgroundColor: trigger_passive ? 'red' : '' }"
    >
      <svg
        class="grave-svg"
        viewBox="20 20 70 90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="graveyardDark"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stop-color="#3d3d3d" />
            <stop offset="100%" stop-color="#1a1a1a" />
          </linearGradient>
        </defs>

        <!-- Нижняя карта -->
        <rect
          x="22"
          y="32"
          width="50"
          height="70"
          rx="5"
          fill="#151515"
          stroke="#333"
          stroke-width="1"
          transform="rotate(-10, 47, 67)"
        />

        <!-- Средняя карта -->
        <rect
          x="28"
          y="28"
          width="50"
          height="70"
          rx="5"
          fill="#222"
          stroke="#333"
          stroke-width="1"
          transform="rotate(6, 53, 63)"
        />

        <!-- Верхняя карта -->
        <rect
          x="35"
          y="25"
          width="50"
          height="70"
          rx="5"
          fill="url(#graveyardDark)"
          stroke="#444"
          stroke-width="2"
        />

        <!-- Череп (видимый!) -->
        <!-- Основа черепа -->
        <ellipse
          cx="60"
          cy="45"
          rx="14"
          ry="12"
          fill="#d4d4d4"
          stroke="#888"
          stroke-width="1"
        />
        <!-- Челюсть -->
        <ellipse
          cx="60"
          cy="54"
          rx="10"
          ry="7"
          fill="#c0c0c0"
          stroke="#888"
          stroke-width="1"
        />
        <!-- Глазницы -->
        <ellipse cx="55" cy="43" rx="4" ry="5" fill="#1a1a1a" />
        <ellipse cx="65" cy="43" rx="4" ry="5" fill="#1a1a1a" />
        <!-- Нос -->
        <path d="M60 48 L58 52 L62 52 Z" fill="#1a1a1a" />
        <!-- Зубы -->
        <line
          x1="54"
          y1="54"
          x2="54"
          y2="58"
          stroke="#1a1a1a"
          stroke-width="1.5"
        />
        <line
          x1="57"
          y1="54"
          x2="57"
          y2="59"
          stroke="#1a1a1a"
          stroke-width="1.5"
        />
        <line
          x1="60"
          y1="54"
          x2="60"
          y2="59"
          stroke="#1a1a1a"
          stroke-width="1.5"
        />
        <line
          x1="63"
          y1="54"
          x2="63"
          y2="59"
          stroke="#1a1a1a"
          stroke-width="1.5"
        />
        <line
          x1="66"
          y1="54"
          x2="66"
          y2="58"
          stroke="#1a1a1a"
          stroke-width="1.5"
        />

        <!-- Счётчик (сдвинут вниз-вправо) -->
        <circle
          cx="72"
          cy="78"
          r="14"
          :fill="background_color"
          stroke="#fff"
          stroke-width="2"
        />
        <text
          x="72"
          y="84"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="18"
          font-weight="bold"
          fill="#fff"
        >
          {{ grave_len }}
        </text>
      </svg>
    </button>
    <modal-window v-if="flag" v-touch:swipe="close_self">
      <button-close @close_self="close_self" />
      <card-list-component :cards="grave" />
    </modal-window>
  </div>
</template>

<script>
import ModalWindow from "@/components/ModalWindows/ModalWindow"
import ButtonClose from "@/components/UI/Buttons/ButtonClose"
import CardListComponent from "@/components/Cards/CardListComponent"
export default {
  name: "grave-comp",
  components: { CardListComponent, ButtonClose, ModalWindow },
  props: {
    grave: {
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
    grave_len() {
      return this.grave.length
    },
    background_color() {
      if (this.grave_len === 0) return "black"
      if (this.leader.faction === "Soldiers") return "blue"
      else if (this.leader.faction === "Monsters") return "red"
      else if (this.leader.faction === "Animals") return "green"
      return ""
    },
    trigger_passive() {
      for (const card of this.grave) {
        if (card.trigger_grave_passive) return true
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
.grave-btn {
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

.grave-svg {
  width: 100%;
  height: 100%;
  max-width: 47px;
  max-height: 66px;
}

.grave-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.4);
}

.grave-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(139, 0, 0, 0.3);
}

.grave-btn.trigger-passive {
  background: transparent;
  border: none;
  color: #8b0000;
}

.grave-btn.trigger-passive svg {
  animation: pulse-svg 1s infinite;
  filter: drop-shadow(0 0 5px rgba(255, 204, 0, 0.5));
}

@keyframes pulse-svg {
  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.4));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 15px rgba(255, 204, 0, 0.8));
  }
}
</style>
