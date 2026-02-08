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

<script>
export default {
  props: {
    enemy: {
      type: Object,
      required: true,
    },
  },
}
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
