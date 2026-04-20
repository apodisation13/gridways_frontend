<template>
  <div class="ability-icon" :style="{ backgroundImage: `url(${icon})` }"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
})
</script>

<style scoped>
.ability-icon {
  position: absolute;
  top: 30%;
  right: 1%;
  width: 18%;
  aspect-ratio: 1 / 1;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  container-type: size;
}
</style>
