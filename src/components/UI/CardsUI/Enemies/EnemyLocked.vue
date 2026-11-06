<template>
  <div class="enemy_locked"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "EnemyLocked",
})
</script>

<style scoped>
.enemy_locked {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("~@/assets/icons/card/locked.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 30% auto;
}
</style>
