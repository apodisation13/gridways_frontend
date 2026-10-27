<template>
  <button
    type="button"
    class="inventory-link"
    title="Посмотреть инвентарь"
    aria-label="Посмотреть инвентарь"
    @dblclick="open"
    @contextmenu.prevent="open"
    @pointerdown="startPress"
    @pointermove="movePress"
    @pointerup="endPress"
    @pointercancel="cancelPress"
    @pointerleave="cancelPress"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <img src="@/assets/icons/inventory.svg" alt="" draggable="false" />
  </button>
  <Teleport to="body">
    <div v-if="visible" class="preview-overlay" @click.self="visible = false">
      <section
        class="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Слоты инвентаря"
      >
        <button
          type="button"
          class="close-button"
          aria-label="Закрыть"
          @click="visible = false"
        >
          <img src="@/assets/icons/buttons/close_modal.svg" alt="" />
        </button>
        <div class="preview-slots">
          <button
            v-for="(item, index) in slots"
            :key="index"
            type="button"
            class="preview-slot"
            :class="{
              'preview-slot--empty': !item,
              'preview-slot--depleted':
                item && !($store.getters['resource'][item] > 0),
            }"
            aria-label="Открыть страницу инвентаря"
            @click="goToInventory"
          >
            <resource-item
              v-if="item"
              :name="item"
              :count="$store.getters['resource'][item] ?? 0"
              :highlight_max_count="false"
            />
            <span v-else aria-hidden="true">＋</span>
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { InventoryItem } from "@/types"

export default defineComponent({
  components: { ResourceItem },
  data() {
    return {
      visible: false,
      holdTimer: null as ReturnType<typeof setTimeout> | null,
      pressStart: null as { x: number; y: number; time: number } | null,
      lastTap: 0,
    }
  },
  computed: {
    slots(): (InventoryItem | null)[] {
      const inventory = this.$store.getters["inventory"] as InventoryItem[]
      return Array.from(
        { length: this.$store.getters["inventorySlots"] },
        (_, index) => inventory[index] ?? null
      )
    },
  },
  beforeUnmount() {
    this.cancelPress()
  },
  methods: {
    open(): void {
      this.cancelPress()
      this.lastTap = 0
      this.visible = true
    },
    startPress(event: PointerEvent): void {
      this.cancelPress()
      if (event.pointerType !== "touch" || !event.isPrimary) return
      this.pressStart = { x: event.clientX, y: event.clientY, time: Date.now() }
      this.holdTimer = setTimeout(() => this.open(), 600)
    },
    movePress(event: PointerEvent): void {
      if (
        this.pressStart &&
        Math.hypot(
          event.clientX - this.pressStart.x,
          event.clientY - this.pressStart.y
        ) > 10
      ) {
        this.cancelPress()
        this.lastTap = 0
      }
    },
    endPress(): void {
      const start = this.pressStart
      this.cancelPress()
      if (!start || Date.now() - start.time > 500) return
      const now = Date.now()
      if (this.lastTap && now - this.lastTap < 350) this.open()
      else this.lastTap = now
    },
    cancelPress(): void {
      if (this.holdTimer !== null) clearTimeout(this.holdTimer)
      this.holdTimer = null
      this.pressStart = null
    },
    goToInventory(): void {
      this.visible = false
      this.$router.push("/inventory")
    },
  },
})
</script>

<style scoped>
.inventory-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 2px;
  border: 1px solid rgba(197, 168, 126, 0.5);
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.08);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-touch-callout: none;
}
.inventory-link img {
  width: 100%;
  height: 100%;
}
.inventory-link:focus-visible,
.preview-slot:focus-visible,
.close-button:focus-visible {
  outline: 2px solid #edc379;
  outline-offset: 2px;
}
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.6);
}
.preview-modal {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 393px);
  max-height: 80vh;
  overflow-y: auto;
  padding: 52px 16px 20px;
  border: 1px solid #c5a87e;
  border-radius: 16px;
  background: linear-gradient(180deg, #1e2834, #0a0b0c);
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.close-button img {
  width: 18px;
  height: 18px;
}
.preview-slots {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}
.preview-slot {
  min-width: 0;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 2px;
  border: 1px solid #c5a87e;
  border-radius: 10px;
  background: linear-gradient(145deg, #285e4b, #183c34);
  cursor: pointer;
}
.preview-slot--empty {
  background: rgba(255, 215, 0, 0.06);
  color: #c5a87e;
  font-size: 24px;
}
.preview-slot--depleted {
  border-color: #656565;
  background: linear-gradient(145deg, #383838, #242424);
}
.preview-slot--depleted :deep(.resource-image) {
  filter: grayscale(1);
  opacity: 0.45;
}
.preview-slot--depleted :deep(.resource-count) {
  background: none;
  color: #999;
  -webkit-text-fill-color: #999;
}
.preview-slot :deep(.resource-image) {
  width: 36px;
  height: 36px;
  max-height: none;
  object-fit: contain;
}
.preview-slot :deep(.resource-count) {
  font-size: 14px;
  margin-top: 4px;
}
</style>
