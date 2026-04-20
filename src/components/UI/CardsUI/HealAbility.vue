<template>
  <div class="ability-heal">
    <div class="ability-heal-value">+{{ heal }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    heal: {
      type: Number,
      require: true,
    },
  },
})
</script>

<style scoped>
.ability-heal {
  position: absolute;
  top: 30%;
  background-image: url("~@/assets/icons/card/emerald.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 1%;
  width: 18%;
  aspect-ratio: 1 / 1;
  container-type: size;
}

.ability-heal-value {
  font-family: "Inter", serif;
  font-weight: 500;
  color: #ffffff;
  font-size: 40cqw;
}
</style>
