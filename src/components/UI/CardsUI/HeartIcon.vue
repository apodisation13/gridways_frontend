<template>
  <div class="heart-wrapper" :style="{ '--bgColor': bgColor }">
    <div class="heart" :style="bgImage">
      <div class="health-value">{{ health }}</div>
    </div>

    <div
      v-if="hp_delta"
      class="hp-delta-overlay"
      :class="hp_delta < 0 ? 'damage' : 'heal'"
      :style="{ '--flash-duration': flashDuration + 'ms' }"
    >
      <span class="hp-delta-icon">{{ hp_delta < 0 ? "❤️" : "💚" }}</span>
      <span class="hp-delta-text">
        {{ hp_delta > 0 ? "+" : "" }}{{ hp_delta }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    health: {
      type: [Number, String],
    },
    bgColor: {
      type: String,
    },
    hp_delta: {
      type: Number,
      default: null,
    },
  },
  computed: {
    bgImage(): Record<string, string> {
      if (this.hp_delta < 0)
        return {
          backgroundImage: `url(${require("@/assets/icons/card/heart_red.svg")})`,
        }
      if (this.hp_delta > 0)
        return {
          backgroundImage: `url(${require("@/assets/icons/card/heart_light_green.svg")})`,
        }
      return {
        backgroundImage: `url(${require("@/assets/icons/card/heart_green.svg")})`,
      }
    },
    flashDuration(): number {
      return this.$store.getters["selectedMoveTimeout"]
    },
  },
})
</script>

<style scoped>
.heart-wrapper {
  position: absolute;
  bottom: -1%;
  left: 1%;
  width: 20%;
  aspect-ratio: 1 / 1; /* Квадрат для ровного ромба */
  transform: rotate(-45deg);
  background-color: var(--bgColor);
  border-radius: 10%;
  container-type: size;
  overflow: visible;
}

.heart {
  position: absolute;
  transform: rotate(45deg);
  top: 10%;
  right: 10%;
  bottom: 0;
  left: 0;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.health-value {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10%;
  margin-bottom: 10%;
  font-size: 50cqw; /* Относительно контейнера */
  color: white;
}

/* overlay позиционируем относительно сердечка, counter-rotate чтобы компенсировать -45deg родителя */
.hp-delta-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: rotate(45deg) translate(-50%, -80%);
  transform-origin: left top;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  pointer-events: none;
  animation: hp-delta-pop 1s ease-out forwards;
  z-index: 20;
}

.hp-delta-icon {
  font-size: 2rem;
  line-height: 1;
}

.hp-delta-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
}

@keyframes hp-delta-pop {
  0% {
    opacity: 0;
    transform: rotate(45deg) translate(-50%, -80%) scale(0.4);
  }
  40% {
    opacity: 1;
    transform: rotate(45deg) translate(-50%, -80%) scale(1.2);
  }
  70% {
    transform: rotate(45deg) translate(-50%, -80%) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(45deg) translate(-50%, -80%) scale(1);
  }
}
</style>
