<template>
  <button class="base-b">
    <span class="base-b-text">
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({})
</script>

<style scoped>
.base-b {
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 2px solid #facf5d;
  border-radius: 6px;
  display: block;
  width: 100%;
  padding: 13px;
  text-align: center;
  cursor: pointer;
  outline: none;
}

.base-b-text {
  font-size: 16px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
