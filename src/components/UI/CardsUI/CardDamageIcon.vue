<template>
  <div class="damage-icon-wrapper">
    <div class="damage-count">
      {{ damage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    damage: {
      type: Number,
      required: true,
      default: 0,
    },
  },
})
</script>

<style scoped>
.damage-icon-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  aspect-ratio: 1 / 1; /* Принудительно квадрат! */
  transform: rotate(-45deg);
  container-type: size;
}

.damage-count {
  position: absolute;
  transform: rotate(45deg);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  color: whitesmoke;
  font-size: 50cqw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.damage-count::before {
  content: "";
  display: block;
  width: 40%;
  height: 80%;
  background-image: url("~@/assets/icons/card/sword.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
</style>
