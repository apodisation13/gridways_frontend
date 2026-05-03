<template>
  <div class="background_layout_modal" @click.stop="hideModal">
    <div class="wrapper_modal">
      <div class="modal" @click.stop>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  emits: ["close-modal"],
  methods: {
    hideModal(): void {
      this.$emit("close-modal")
    },
  },
})
</script>

<style scoped>
.background_layout_modal {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  background: rgb(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.wrapper_modal {
  padding: 1px;
  background-image: linear-gradient(
    180deg,
    #4a4237 0%,
    #c5a87e 50%,
    #4a4237 100%
  );
  border-radius: 20px;
  max-width: 340px;
  width: 100%;
  margin: 10px;
  height: fit-content; /* или height: auto, но важно: */
  display: flex; /* добавляем flex для растягивания дочернего элемента */
}

.modal {
  background: linear-gradient(180deg, #1e2834 0%, #0a0b0c 100%);
  border-radius: 20px;
  width: 100%;
  height: 100%; /* теперь будет работать */
}
</style>
