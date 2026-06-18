<template>
  <div class="health-container" :class="{ 'has-armor': armor > 0 }">
    <!-- Invulnerability bar (ВЫШЕ брони и жизней) -->
    <transition name="immune">
      <div
        v-if="invulnerability > 0"
        class="immune-bar"
        :class="immuneAnimClass"
      >
        <div class="immune-content">
          <span class="immune-icon">✨</span>
          <span class="immune-value">{{ invulnerability }}</span>
        </div>
      </div>
    </transition>

    <!-- Armor bar (СВЕРХУ, отдельным блоком) -->
    <transition name="armor">
      <div v-if="armor > 0" class="armor-bar" :class="armorAnimClass">
        <div class="armor-segments">
          <div v-for="n in armor" :key="n" class="armor-segment"></div>
        </div>
        <div class="armor-content">
          <span class="armor-icon">🛡</span>
          <span class="armor-value">{{ armor }}</span>
        </div>
      </div>
    </transition>

    <!-- Health bar (СНИЗУ) -->
    <div
      class="health-bar"
      :style="[barStyle, { '--flash-duration': flashDuration + 'ms' }]"
      :class="delta ? `bar-flash--${delta.type}` : ''"
    >
      <!-- Health content поверх всего, справа -->
      <div class="health-content" :class="{ 'has-armor': armor > 0 }">
        <span class="heart-icon" :class="{ 'no-pulse': armor > 0 }">❤️</span>
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

<script lang="ts">
import { defineComponent } from "vue"

interface Delta {
  text: string
  type: "heal" | "damage"
}

export default defineComponent({
  name: "HealthComp",
  data() {
    return {
      delta: null as Delta | null,
      deltaTimer: null as ReturnType<typeof setTimeout> | null,
      armorAnimClass: null as string | null,
      armorAnimTimer: null as ReturnType<typeof setTimeout> | null,
      immuneAnimClass: null as string | null,
      immuneAnimTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    health(): number {
      return this.$store.state.game.health
    },
    armor(): number {
      return this.$store.state.game.armor
    },
    armorDelta(): number {
      return this.$store.state.game.armor_delta
    },
    invulnerability(): number {
      return this.$store.state.game.invulnerability
    },
    invulnerabilityHit(): boolean {
      return this.$store.state.game.invulnerability_hit
    },
    flashDuration(): number {
      return this.$store.getters["selectedMoveTimeout"]
    },
    maxHp(): number {
      return this.$store.getters["maxHp"] || 100
    },
    healthPercent(): number {
      return Math.min(Math.max((this.health / this.maxHp) * 100, 0), 100)
    },
    barStyle(): Record<string, string> {
      if (this.healthPercent < 20)
        return { backgroundColor: "rgba(255, 59, 48, 0.2)" }
      if (this.healthPercent < 35)
        return { backgroundColor: "rgba(255, 149, 0, 0.2)" }
      if (this.healthPercent < 50)
        return { backgroundColor: "rgba(255, 204, 0, 0.2)" }
      return { backgroundColor: "rgba(52, 199, 89, 0.2)" }
    },
    fillStyle(): Record<string, string> {
      return { width: `${this.healthPercent}%` }
    },
  },
  watch: {
    health(newVal: number, oldVal: number) {
      const diff = newVal - oldVal
      if (diff === 0) return
      if (this.deltaTimer !== null) clearTimeout(this.deltaTimer)
      this.delta = {
        text: diff > 0 ? `+${diff}` : `${diff}`,
        type: diff > 0 ? "heal" : "damage",
      }
      this.deltaTimer = setTimeout(() => {
        this.delta = null
      }, this.flashDuration)
    },
    armorDelta(newVal: number) {
      if (!newVal || newVal === 0) return
      if (this.armorAnimTimer !== null) clearTimeout(this.armorAnimTimer)
      this.armorAnimClass =
        newVal > 0 ? "armor-flash--gain" : "armor-flash--damage"
      this.armorAnimTimer = setTimeout(() => {
        this.armorAnimClass = null
      }, this.flashDuration * 0.5)
    },
    invulnerabilityHit(newVal: boolean) {
      if (!newVal) return
      if (this.immuneAnimTimer !== null) clearTimeout(this.immuneAnimTimer)
      this.immuneAnimClass = "immune-flash--hit"
      this.immuneAnimTimer = setTimeout(() => {
        this.immuneAnimClass = null
      }, this.flashDuration * 0.5)
    },
  },
})
</script>

<style scoped>
/* ─── Контейнер ─────────────────────────────────────────────── */
.health-container {
  width: 98%;
  margin: 1% 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ─── Полоска жизней ─────────────────────────────────────────── */
.health-bar {
  z-index: 1;
  height: 4vh;
  width: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Сердце НЕ пульсирует когда есть броня */
.heart-icon.no-pulse {
  animation: none;
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

.health-bar[style*="rgba(255, 59, 48, 0.2)"] .heart-icon:not(.no-pulse) {
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
  animation: bar-glow-heal var(--flash-duration, 750ms) ease-out forwards;
}
.bar-flash--damage {
  animation: bar-glow-damage var(--flash-duration, 750ms) ease-out forwards;
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

/* ─── Полоска брони ──────────────────────────────────────────── */
.armor-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 5;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(80, 180, 255, 0.9);
  box-shadow: 0 0 12px rgba(0, 132, 255, 0.6);
  background: rgba(0, 20, 70, 0.25);
}

/* Сегменты через flexbox — чёткие разделители */
.armor-segments {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 3px;
  padding: 3px;
  box-sizing: border-box;
  z-index: 1;
}

.armor-segment {
  flex: 1;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(160deg, #5ec8ff 0%, #0a84ff 55%, #0055cc 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 0 6px rgba(10, 132, 255, 0.6);
  opacity: 0.65;
}

/* Броня — левая сторона */
.armor-content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  padding-left: 8px;
  gap: 5px;
  color: white;
  font-weight: bold;
  font-size: 17px;
  text-shadow:
    0 0 8px rgba(0, 150, 255, 1),
    1px 1px 3px rgba(0, 0, 0, 0.9);
}

.health-content {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 4px rgba(0, 0, 0, 0.5);

  /* По умолчанию — центр */
  left: 0;
  right: 0;
  justify-content: center;
}

/* Когда есть броня — уходит вправо */
.health-content.has-armor {
  left: auto;
  right: 8px;
  justify-content: flex-end;
}

/* Анимации появления брони (0 → 1) */
.armor-enter-active {
  animation: armor-appear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
/* Анимация исчезновения брони (1 → 0) */
.armor-leave-active {
  animation: armor-disappear 0.45s ease-in forwards;
}

@keyframes armor-appear {
  0% {
    transform: scaleX(0);
    transform-origin: left;
    opacity: 0;
    box-shadow: 0 0 0 rgba(0, 220, 255, 0);
  }
  60% {
    box-shadow:
      0 0 30px 10px rgba(0, 200, 255, 0.9),
      0 0 60px 20px rgba(0, 120, 255, 0.5);
    background-color: rgba(0, 180, 255, 0.3);
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
    opacity: 1;
  }
}

@keyframes armor-disappear {
  0% {
    opacity: 1;
    transform: scaleX(1);
    transform-origin: left;
  }
  30% {
    box-shadow: 0 0 25px 8px rgba(255, 180, 0, 0.9);
    background-color: rgba(255, 150, 0, 0.3);
    filter: brightness(1.5);
  }
  100% {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
}

.armor-icon {
  font-size: 18px;
  filter: drop-shadow(0 0 4px #0a84ff);
  animation: shield-glow 2s infinite;
}

.armor-value {
  font-family: "Arial Black", "Arial Bold", sans-serif;
  font-size: 16px;
  color: #ffffff;
  background: rgba(0, 20, 60, 0.7);
  padding: 1px 7px;
  border-radius: 10px;
  border: 1px solid rgba(100, 200, 255, 0.6);
}

@keyframes shield-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 3px #0a84ff);
  }
  50% {
    filter: drop-shadow(0 0 10px #38d0ff);
    transform: scale(1.1);
  }
}

/* ─── Анимации изменения брони ───────────────────────────────── */

/* Броня получила урон */
.armor-flash--damage {
  animation: armor-damage 0.9s ease-out forwards;
}

@keyframes armor-damage {
  0% {
    box-shadow: 0 0 0 rgba(255, 200, 0, 0);
  }
  10% {
    box-shadow:
      0 0 20px 8px rgba(255, 200, 0, 1),
      0 0 50px 16px rgba(255, 100, 0, 0.8);
    background-color: rgba(255, 180, 0, 0.4);
    transform: translateX(-4px);
    border-color: rgba(255, 200, 0, 1);
  }
  20% {
    transform: translateX(4px);
  }
  30% {
    transform: translateX(-3px);
  }
  40% {
    transform: translateX(3px);
  }
  55% {
    transform: translateX(0);
    box-shadow:
      0 0 15px 4px rgba(255, 150, 0, 0.6),
      0 0 30px 8px rgba(255, 80, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 12px rgba(0, 132, 255, 0.6);
    background-color: rgba(0, 30, 80, 0.5);
    border-color: rgba(80, 180, 255, 0.9);
    transform: translateX(0);
  }
}

/* Броня увеличилась */
.armor-flash--gain {
  animation: armor-gain 0.9s ease-out forwards;
}

@keyframes armor-gain {
  0% {
    box-shadow: 0 0 12px rgba(0, 132, 255, 0.6);
  }
  15% {
    box-shadow:
      0 0 25px 10px rgba(0, 220, 255, 1),
      0 0 60px 20px rgba(0, 160, 255, 0.8);
    background-color: rgba(0, 180, 255, 0.35);
    border-color: rgba(0, 240, 255, 1);
    transform: scaleY(1.08);
  }
  50% {
    box-shadow:
      0 0 15px 5px rgba(0, 180, 255, 0.7),
      0 0 35px 10px rgba(0, 120, 255, 0.4);
    transform: scaleY(1.02);
  }
  100% {
    box-shadow: 0 0 12px rgba(0, 132, 255, 0.6);
    background-color: rgba(0, 30, 80, 0.5);
    border-color: rgba(80, 180, 255, 0.9);
    transform: scaleY(1);
  }
}

/* ─── Всплывающий дельта HP ──────────────────────────────────── */
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

/* ─── Полоска неуязвимости ───────────────────────────────────── */
.immune-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 15;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 210, 60, 0.95);
  box-shadow:
    0 0 14px rgba(255, 190, 0, 0.7),
    inset 0 0 20px rgba(255, 200, 50, 0.15);
  background: linear-gradient(
    135deg,
    rgba(60, 40, 0, 0.55) 0%,
    rgba(100, 70, 0, 0.4) 50%,
    rgba(60, 40, 0, 0.55) 100%
  );
}

.immune-content {
  position: absolute;
  inset: 0;
  z-index: 16;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: bold;
  font-size: 17px;
  color: white;
  text-shadow:
    0 0 10px rgba(255, 200, 0, 1),
    1px 1px 3px rgba(0, 0, 0, 0.9);
}

.immune-icon {
  font-size: 18px;
  animation: immune-pulse 1.8s infinite;
}

.immune-value {
  font-family: "Arial Black", "Arial Bold", sans-serif;
  font-size: 16px;
  color: #fff7cc;
  background: rgba(60, 40, 0, 0.75);
  padding: 1px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 210, 60, 0.7);
}

@keyframes immune-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 3px #ffa500);
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 10px #ffe566);
    transform: scale(1.15);
  }
}

/* Анимация удара по неуязвимому — яркая золотая вспышка + тряска */
.immune-flash--hit {
  animation: immune-hit 0.55s ease-out forwards;
}

@keyframes immune-hit {
  0% {
    box-shadow: 0 0 14px rgba(255, 190, 0, 0.7);
  }
  8% {
    box-shadow:
      0 0 35px 14px rgba(255, 230, 0, 1),
      0 0 70px 25px rgba(255, 160, 0, 0.9);
    background: rgba(255, 210, 0, 0.45);
    transform: translateX(-5px);
    border-color: rgba(255, 240, 0, 1);
  }
  18% {
    transform: translateX(5px);
  }
  28% {
    transform: translateX(-4px);
  }
  38% {
    transform: translateX(4px);
  }
  50% {
    transform: translateX(0);
    box-shadow:
      0 0 20px 6px rgba(255, 200, 0, 0.6),
      0 0 40px 10px rgba(255, 130, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 14px rgba(255, 190, 0, 0.7);
    background: linear-gradient(
      135deg,
      rgba(60, 40, 0, 0.55) 0%,
      rgba(100, 70, 0, 0.4) 50%,
      rgba(60, 40, 0, 0.55) 100%
    );
    border-color: rgba(255, 210, 60, 0.95);
    transform: translateX(0);
  }
}

/* Появление / исчезновение полоски неуязвимости */
.immune-enter-active {
  animation: immune-appear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.immune-leave-active {
  animation: immune-disappear 0.45s ease-in forwards;
}

@keyframes immune-appear {
  0% {
    transform: scaleX(0);
    transform-origin: left;
    opacity: 0;
  }
  60% {
    box-shadow:
      0 0 35px 12px rgba(255, 210, 0, 0.9),
      0 0 60px 20px rgba(255, 150, 0, 0.5);
    background-color: rgba(255, 190, 0, 0.3);
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
    opacity: 1;
  }
}

@keyframes immune-disappear {
  0% {
    opacity: 1;
    transform: scaleX(1);
    transform-origin: left;
  }
  30% {
    box-shadow: 0 0 30px 10px rgba(255, 230, 0, 0.9);
    filter: brightness(1.6);
  }
  100% {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
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
