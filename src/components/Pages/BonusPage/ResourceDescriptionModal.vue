<template>
  <Teleport to="body">
    <div class="description-overlay" @click.self="$emit('close')">
      <section
        class="description-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Описание ресурса"
        @click.stop
      >
        <button-close-img
          class="close-icon"
          role="button"
          tabindex="0"
          aria-label="Закрыть описание"
          @handle_close="$emit('close')"
          @keydown.enter.prevent="$emit('close')"
          @keydown.space.prevent="$emit('close')"
        />
        <resource-item
          class="description-resource"
          :name="name"
          :count="count"
          :highlight_max_count="false"
        />
        <p>{{ formattedDescription }}</p>
      </section>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { describeInventoryItem } from "@/logic/inventory_description"

export default defineComponent({
  components: { ButtonCloseImg, ResourceItem },
  props: {
    name: { type: String, required: true },
    count: { type: Number, required: true },
    description: { type: String, required: true },
  },
  emits: ["close"],
  computed: {
    formattedDescription(): string {
      return describeInventoryItem(
        this.name,
        this.description,
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"]
      )
    },
  },
})
</script>

<style scoped>
.description-overlay {
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
}

.description-modal {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 360px);
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 20px 20px;
  border: 1px solid #c5a87e;
  border-radius: 16px;
  background: linear-gradient(180deg, #1e2834 0%, #0a0b0c 100%);
  color: white;
  font-family: "Philosopher", serif;
}

.close-icon {
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background-size: 18px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.06);
  cursor: pointer;
}
.close-icon:focus-visible {
  outline: 2px solid #c5a87e;
}
.description-modal p {
  margin: 0;
  width: 100%;
  font-size: 16px;
  font-family: "Philosopher", serif;
  text-align: center;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.description-resource {
  align-self: center;
  gap: 8px;
}
.description-resource :deep(.resource-image) {
  width: 72px;
  height: 72px;
  max-height: none;
  object-fit: contain;
}
.description-resource :deep(.resource-count) {
  width: 100%;
  text-align: center;
  font-size: 20px;
}
</style>
