<template>
  <div class="health-container">
    <div
      class="health-bar"
      :style="[barStyle, { '--flash-duration': flashDuration + 'ms' }]"
      :class="delta ? `bar-flash--${delta.type}` : ''"
    >
      <div class="health-content">
        <span class="heart-icon">❤️</span>
        <span class="health-value">{{ health }}</span>
      </div>
      <div class="health-fill" :style="fillStyle"></div>
    </div>
    <div v-if="delta" :class="['health-delta', delta.type]">
      <span class="delta-heart">{{ delta.type === "heal" ? "💚" : "❤️" }}</span>
      <span class="delta-text">{{ delta.text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "health-comp",
  data() {
    return {
      delta: null,
      deltaTimer: null,
    }
  },
  computed: {
    health() {
      return this.$store.state.game.health
    },
    flashDuration() {
      return this.$store.getters["selectedMoveTimeout"]
    },
    barStyle() {
      if (this.health < 20) return { backgroundColor: "rgba(255, 59, 48, 0.2)" }
      if (this.health < 35) return { backgroundColor: "rgba(255, 149, 0, 0.2)" }
      if (this.health < 50) return { backgroundColor: "rgba(255, 204, 0, 0.2)" }
      return { backgroundColor: "rgba(52, 199, 89, 0.2)" }
    },
    fillStyle() {
      const percent = Math.min(Math.max(this.health, 0), 100)
      return { width: `${percent}%` }
    },
  },
  watch: {
    health(newVal, oldVal) {
      const diff = newVal - oldVal
      if (diff === 0) return

      clearTimeout(this.deltaTimer)
      this.delta = {
        text: diff > 0 ? `+${diff}` : `${diff}`,
        type: diff > 0 ? "heal" : "damage",
      }
      this.deltaTimer = setTimeout(() => {
        this.delta = null
      }, this.flashDuration)
    },
  },
}
</script>
<style scoped>
.health-container {
  height: 4vh;
  width: 98%;
  margin: 1% 0;
  position: relative;
}

.health-bar {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);

  /* Градиентный фон */
  background: linear-gradient(
    145deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(255, 255, 255, 0.05) 100%
  ) !important;
}

.health-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* Цвет заполнения в зависимости от здоровья */
.health-bar[style*="rgba(255, 59, 48, 0.2)"] .health-fill {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6258 50%, #ff3b30 100%);
}

.health-bar[style*="rgba(52, 199, 89, 0.2)"] .health-fill {
  background: linear-gradient(90deg, #34c759 0%, #5cd67d 50%, #34c759 100%);
}

.health-bar[style*="rgba(255, 149, 0, 0.2)"] .health-fill {
  background: linear-gradient(90deg, #ff9500 0%, #ffaa33 50%, #ff9500 100%);
}

.health-bar[style*="rgba(255, 204, 0, 0.2)"] .health-fill {
  background: linear-gradient(90deg, #ffcc00 0%, #ffdb4d 50%, #ffcc00 100%);
}

.health-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 4px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 1px;
}

.heart-icon {
  font-size: 18px;
  filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
  animation: heartbeat 1s infinite;
}

.health-value {
  font-family: "Arial Black", "Arial Bold", sans-serif;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Эффект пульсации при низком здоровье */
.health-bar[style*="rgba(255, 59, 48, 0.2)"] .heart-icon {
  animation: heartbeat-fast 0.8s infinite;
}

@keyframes heartbeat-fast {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Вспышка полоски при изменении HP */
.bar-flash--heal {
  animation: bar-glow-heal var(--flash-duration, 0.75s) ease-out forwards;
}
.bar-flash--damage {
  animation: bar-glow-damage var(--flash-duration, 0.75s) ease-out forwards;
}

@keyframes bar-glow-heal {
  0%,
  40% {
    box-shadow:
      0 0 8px 3px rgba(52, 199, 89, 1),
      0 0 24px 8px rgba(52, 199, 89, 0.7);
    background-color: rgba(52, 199, 89, 0.45);
  }
  100% {
    box-shadow: none;
    background-color: transparent;
  }
}

@keyframes bar-glow-damage {
  0%,
  40% {
    box-shadow:
      0 0 8px 3px rgba(255, 59, 48, 1),
      0 0 24px 8px rgba(255, 59, 48, 0.7);
    background-color: rgba(255, 59, 48, 0.45);
  }
  100% {
    box-shadow: none;
    background-color: transparent;
  }
}

/* Всплывающее число */
.health-delta {
  position: absolute;
  top: -28px;
  left: 50%;
  pointer-events: none;
  animation: delta-float 0.9s ease-out forwards;
}

.delta-heart {
  position: relative;
  font-size: 3.5rem;
  display: block;
  line-height: 1;
}

.delta-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.health-delta.heal {
  color: #2ecc40;
}
.health-delta.damage {
  color: #ff3b30;
}

@keyframes delta-float {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(0);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-12px);
  }
}
</style>
