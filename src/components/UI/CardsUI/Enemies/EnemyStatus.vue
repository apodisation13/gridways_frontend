<template>
  <div
    class="enemy-status"
    :style="{
      'background-image':
        'url(' +
        require(`@/assets/icons/enemy/enemy_status_${enemy.status}.svg`) +
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
</style>
