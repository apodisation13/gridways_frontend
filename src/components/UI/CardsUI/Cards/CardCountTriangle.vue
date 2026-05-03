<template>
  <div class="triangle" :style="{ '--cardColor': cardColor }">
    <div class="count">
      {{ count }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  name: "CardCountTriangle",
  props: {
    count: {
      required: true,
      type: Number,
    },
    cardColor: {
      type: String,
      required: true,
      default: "",
    },
  },
})
</script>

<style scoped>
.triangle {
  position: absolute;
  bottom: 0;
  right: 50%;
  transform: translate(50%, 0);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 30px solid var(--cardColor);
}
.count {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 18px;
  font-size: 16px;
  color: white;
}
</style>
