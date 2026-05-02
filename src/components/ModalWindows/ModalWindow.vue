<template>
  <div class="modal_window">
    <div class="modal_content">
      <slot></slot>
    </div>
    <div class="modal_footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  name: "ModalWindow",
})
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
  isolation: isolate;

  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 425px;

  /* Flexbox для разделения контента и футера */
  display: flex;
  flex-direction: column;
}

.modal_content {
  flex: 1;
  overflow-y: auto; /* Скролл только для контента */
  padding-top: 30px;
  padding-bottom: 20px;
  min-height: 0; /* Важно для корректного скролла во flex */
}

.modal_footer {
  flex-shrink: 0; /* Футер не сжимается */
}
</style>
