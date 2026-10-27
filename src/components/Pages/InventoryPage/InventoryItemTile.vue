<template>
  <button
    type="button"
    class="item-tile"
    :class="{
      'item-tile--empty': count <= 0,
      'item-tile--unavailable': unavailable,
    }"
    :disabled="busy"
    :aria-disabled="busy || unavailable"
    :aria-label="label"
    @dblclick="activate"
    @contextmenu.prevent="describe"
    @pointerdown="startHold"
    @pointermove="moveHold"
    @pointerup="cancelHold"
    @pointercancel="cancelHold"
    @pointerleave="cancelHold"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <img
      :src="require(`@/assets/icons/resources/${name}.svg`)"
      alt=""
      draggable="false"
    />
    <span class="item-count">{{ count }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    name: { type: String, required: true },
    label: { type: String, required: true },
    count: { type: Number, required: true },
    busy: { type: Boolean, default: false },
    unavailable: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  emits: ["activate", "describe"],
  data() {
    return {
      timer: null as ReturnType<typeof setTimeout> | null,
      start: { x: 0, y: 0 },
      suppressUntil: 0,
    }
  },
  beforeUnmount() {
    this.cancelHold()
  },
  methods: {
    activate(): void {
      if (!this.busy && !this.unavailable && Date.now() >= this.suppressUntil)
        this.$emit("activate")
    },
    describe(): void {
      this.cancelHold()
      if (this.busy || !this.description.trim()) return
      this.suppressUntil = Date.now() + 800
      this.$emit("describe")
    },
    startHold(event: PointerEvent): void {
      this.cancelHold()
      if (
        event.pointerType !== "touch" ||
        !event.isPrimary ||
        !this.description.trim()
      )
        return
      this.start = { x: event.clientX, y: event.clientY }
      this.timer = setTimeout(() => this.describe(), 600)
    },
    moveHold(event: PointerEvent): void {
      if (
        Math.hypot(event.clientX - this.start.x, event.clientY - this.start.y) >
        10
      )
        this.cancelHold()
    },
    cancelHold(): void {
      if (this.timer !== null) clearTimeout(this.timer)
      this.timer = null
    },
  },
})
</script>

<style scoped>
.item-tile {
  box-sizing: border-box;
  width: 100%;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 2px;
  border: 1px solid #b88b51;
  border-radius: 10px;
  background:
    radial-gradient(
      ellipse at 50% 25%,
      rgba(255, 213, 135, 0.25),
      transparent 70%
    ),
    linear-gradient(145deg, #624b35, #35291f);
  box-shadow:
    inset 0 1px 0 rgba(255, 231, 179, 0.18),
    0 3px 8px rgba(0, 0, 0, 0.2);
  color: #ffe3a6;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  cursor: pointer;
  font:
    1.1rem "Philosopher",
    serif;
  touch-action: pan-y;
  user-select: none;
  -webkit-touch-callout: none;
}
.item-tile img {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4));
}
.item-count {
  min-width: 24px;
  padding: 2px 4px;
  border-radius: 12px;
  background: rgba(30, 17, 10, 0.45);
  font-weight: normal;
}
.item-tile--empty {
  border-color: #79685d;
  background: linear-gradient(145deg, #3c3332, #292329);
}
.item-tile--empty img {
  opacity: 0.4;
  filter: grayscale(0.7);
}
.item-tile--empty .item-count {
  color: #c87b7b;
}
.item-tile--unavailable,
.item-tile:disabled {
  opacity: 0.6;
  cursor: default;
}
.item-tile:focus-visible {
  outline: 2px solid #ffe0a0;
  outline-offset: 2px;
}
@media (hover: hover) {
  .item-tile:not(:disabled):hover {
    border-color: #ffe0a0;
    box-shadow:
      inset 0 0 18px rgba(255, 205, 107, 0.16),
      0 0 10px rgba(255, 205, 107, 0.12);
  }
}
</style>
