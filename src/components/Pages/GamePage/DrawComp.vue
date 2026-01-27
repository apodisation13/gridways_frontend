<template>
  <button class="draw-btn" :style="themedStyle">
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
  </button>
</template>

<script>
import { styleWrapper } from "@/logic/border_styles"

export default {
  name: "draw-comp",
  computed: {
    themedStyle() {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
  },
}
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
</style>
