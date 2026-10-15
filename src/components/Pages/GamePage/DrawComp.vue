<template>
  <div class="draw-btn" :style="themedStyle">
    <span v-if="isHandFull" class="draw-count">
      {{ fullHandRedrawsRemaining }}
    </span>
    <svg
      class="draw-icon"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Верхняя карта -->
      <rect
        x="15"
        y="5"
        width="70"
        height="90"
        rx="6"
        fill="#0077cc"
        stroke="#222"
        stroke-width="2"
      />

      <!-- Щит -->
      <path
        d="M50 20 L70 28 L70 48 L50 65 L30 48 L30 28 Z"
        fill="#cce5ff"
        stroke="#fff"
        stroke-width="2"
      />

      <!-- Меч -->
      <image
        :href="require('@/assets/icons/card/sword.svg')"
        x="30"
        y="22"
        width="40"
        height="40"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import { styleWrapper } from "@/logic/border_styles"

export default defineComponent({
  name: "DrawComp",
  props: {
    fullHandRedrawsRemaining: {
      type: Number,
      required: true,
    },
    handLength: {
      type: Number,
      required: true,
    },
  },
  computed: {
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
}

.draw-btn:active {
  transform: scale(0.98);
}

.draw-icon {
  width: 85%;
  height: 85%;
}

.draw-count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
  color: #4ade80;
  text-shadow:
    0 1px 3px #000,
    0 0 4px #000;
  font-size: min(26px, calc(var(--vh, 1vh) * 3.5));
  font-weight: 700;
  line-height: 1;
}
</style>
