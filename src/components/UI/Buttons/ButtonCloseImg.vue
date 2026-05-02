<template>
  <div class="btn_close_img" @click="close"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  emits: ["handle_close"],
  methods: {
    close(): void {
      this.$emit("handle_close")
    },
  },
})
</script>

<style scoped>
.btn_close_img {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 20px;
  height: 20px;
  background-image: url("~@/assets/icons/buttons/close_modal.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
</style>
