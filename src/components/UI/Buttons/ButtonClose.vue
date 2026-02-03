<template>
  <div>
    <themed-button class="close-btn" title="Закрыть" @click="close" />
  </div>
</template>

<script>
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"

export default {
  name: "button-close",
  components: { ThemedButton },
  methods: {
    close() {
      this.$emit("close_self")
    },
  },
  emits: ["close_self"],
}
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
