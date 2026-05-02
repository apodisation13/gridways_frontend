<template>
  <transition name="status" appear>
    <div
      class="enemy-status"
      :style="{
        'background-image':
          'url(' +
          require(
            `@/assets/icons/enemy/enemy_status_${enemy.data.status}.svg`
          ) +
          ')',
      }"
    ></div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import type { Enemy, EnemyLeader } from "@/types"

export default defineComponent({
  props: {
    enemy: {
      type: Object as PropType<Enemy | EnemyLeader>,
      required: true,
    },
  },
})
</script>

<style scoped>
.enemy-status {
  position: absolute;
  bottom: 1%;
  right: -2%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  width: 27%;
  aspect-ratio: 1 / 1;
  container-type: size;
}

.status-enter-active {
  animation: status-pop 0.4s ease-out;
}
.status-leave-active {
  animation: status-pop 0.2s ease-in reverse;
}

@keyframes status-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-5deg);
  }
  85% {
    transform: scale(1.05) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
