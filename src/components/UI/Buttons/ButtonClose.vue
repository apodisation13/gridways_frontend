<template>
  <div>
    <themed-button class="close-btn" title="Закрыть" @click="close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"

export default defineComponent({
  name: "ButtonClose",
  components: { ThemedButton },
  emits: ["close_self"],
  methods: {
    close(): void {
      this.$emit("close_self")
    },
  },
})
</script>

<style scoped>
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 120px;
  height: 5vh;
  cursor: pointer;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  display: block;
  margin: 0 auto 1vh;
}
</style>
