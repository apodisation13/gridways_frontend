<template>
  <div class="shield">
    <span class="shield-icon">&#128737;</span>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.shield {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
}

.shield-icon {
  font-size: 30cqmin; /* % от меньшей стороны контейнера */
  color: white;
}
</style>
