<template>
  <div class="health-container">
    <div class="health-bar" :style="barStyle">
      <div class="health-content">
        <span class="heart-icon">❤️</span>
        <span class="health-value">{{ health }}</span>
      </div>
      <div class="health-fill" :style="fillStyle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "health-comp",
  computed: {
    health() {
      return this.$store.state.game.health
    },

    barStyle() {
      // Цвет фона в зависимости от здоровья
      let bgColor
      if (isNaN(this.health) && this.health.includes("-")) {
        bgColor = "rgba(255, 59, 48, 0.2)" // красный для урона
      } else if (isNaN(this.health) && this.health.includes("+")) {
        bgColor = "rgba(52, 199, 89, 0.2)" // зеленый для лечения
      } else if (this.health < 20) {
        bgColor = "rgba(255, 59, 48, 0.2)" // оранжевый для низкого HP
      } else if (this.health < 35) {
        bgColor = "rgba(255, 149, 0, 0.2)" // оранжевый для низкого HP
      } else if (this.health < 50) {
        bgColor = "rgba(255, 204, 0, 0.2)" // желтый для среднего HP
      } else {
        bgColor = "rgba(52, 199, 89, 0.2)" // зеленый для высокого HP
      }

      return { backgroundColor: bgColor }
    },

    fillStyle() {
      // Процент заполнения (если здоровье числовое)
      if (!isNaN(this.health)) {
        const percent = Math.min(Math.max(this.health, 0), 100)
        return { width: `${percent}%` }
      }
      return { width: "100%" }
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
</style>
