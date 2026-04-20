<template>
  <div>
    <button
      class="remaining-enemies-btn"
      :class="{ 'trigger-passive': trigger_passive }"
      @click="visible = true"
    >
      <svg
        class="remaining-enemies-svg"
        viewBox="20 20 70 90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stackRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c00" />
            <stop offset="100%" stop-color="#800" />
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

        <!-- Символ колоды: стилизованные слои/стопка -->
        <!-- Нижний слой -->
        <rect
          x="50"
          y="52"
          width="20"
          height="14"
          rx="2"
          fill="none"
          stroke="#ffcccc"
          stroke-width="1.5"
        />
        <!-- Средний слой -->
        <rect
          x="52"
          y="47"
          width="20"
          height="14"
          rx="2"
          fill="none"
          stroke="#ffaaaa"
          stroke-width="1.5"
        />
        <!-- Верхний слой -->
        <rect
          x="54"
          y="42"
          width="20"
          height="14"
          rx="2"
          fill="#ffeaea"
          stroke="#fff"
          stroke-width="2"
        />
        <!-- Стрелка вверх (означает "взять карту") -->
        <path
          d="M64 38 L64 32 M60 35 L64 30 L68 35"
          fill="none"
          stroke="#fff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
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
          {{ enemies_len }}
        </text>
      </svg>
    </button>
    <transition name="modal">
      <modal-window v-if="visible" v-touch:swipe.left="close_self">
        <button-close @close_self="close_self" />
        <enemy-list :enemies="enemies" />
      </modal-window>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import EnemyList from "@/components/Cards/EnemyList.vue"
import type { Enemy, EnemyLeader } from "@/types"

interface FactionColors {
  base: string
  light?: string
}

export default defineComponent({
  name: "remaining-enemies",
  components: { EnemyList, ButtonClose, ModalWindow },
  props: {
    enemies: {
      required: true,
      type: Array as PropType<Enemy[]>,
    },
    enemy_leader: {
      required: true,
      type: Object as PropType<EnemyLeader>,
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    enemies_len(): number {
      return this.enemies.length
    },
    factionConfig(): FactionColors {
      const FACTION_CONFIG: Record<string, FactionColors> = {
        Soldiers: { base: "#2563eb", light: "#60a5fa" },
        Monsters: { base: "#dc2626", light: "#f87171" },
        Animals: { base: "#16a34a", light: "#4ade80" },
        default: { base: "#000000" },
      }
      if (this.enemies_len === 0) return FACTION_CONFIG.default

      return FACTION_CONFIG[this.enemy_leader.faction] || FACTION_CONFIG.default
    },
    background_color(): string {
      return this.factionConfig.base
    },
    light_background_color(): string | undefined {
      return this.factionConfig.light
    },
    trigger_passive(): boolean {
      for (const e of this.enemies) {
        if (e.trigger_deck_passive) return true
      }
      return false
    },
  },
  methods: {
    close_self(): void {
      this.visible = false
    },
  },
})
</script>

<style scoped>
.remaining-enemies-btn {
  height: 98%;
  width: 47px;
  position: relative;
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

.remaining-enemies-svg {
  width: 100%;
  height: 100%;
  max-width: 47px;
  max-height: 66px;
}

.remaining-enemies-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.4);
}

.remaining-enemies-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(139, 0, 0, 0.3);
}

.remaining-enemies-btn.trigger-passive {
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

.modal-enter-active {
  animation: modal-fade-in 0.25s ease-out;
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
</style>
