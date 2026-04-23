<template>
  <div
    class="ability-circle-enemy"
    v-if="!!enemy.move.name"
    :style="{
      'background-image':
        'url(' +
        require(`@/assets/icons/enemy/enemy_move_${enemy.move.name}.svg`) +
        ')',
    }"
  ></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import type { Enemy } from "@/types"

export default defineComponent({
  props: {
    enemy: {
      type: Object as PropType<Enemy>,
      required: true,
    },
  },
})
</script>

<style scoped>
.ability-circle-enemy {
  position: absolute;
  top: -1%;
  left: -1%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  width: 22%;
  aspect-ratio: 1 / 1;
  container-type: size;
}
</style>
