<template>
  <div class="deathwish"></div>
</template>

<script>
export default {
  name: "DeathwishAbility",
}
</script>

<style scoped>
.deathwish {
  position: absolute;
  top: 30%;
  background-image: url("~@/assets/icons/enemy/deathwish.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  right: 1%;
  width: 18%;
  aspect-ratio: 1 / 1;
  container-type: size;
}
</style>
