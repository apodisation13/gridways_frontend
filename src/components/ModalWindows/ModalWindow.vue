<template>
  <div class="modal_window">
    <div>Щёлкните дважды для выбора карты</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "modal-window",
}
</script>

<style scoped>
.modal_window {
  background: linear-gradient(180deg, #1e2834 0%, #0a0b0c 100%);
  text-align: center;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 10000;
  font-size: 12pt;
  overflow: scroll;
  isolation: isolate;

  /* Ключевое изменение для центрирования */
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 425px; /* Укажи ширину игрового контейнера на десктопе */
}
</style>
