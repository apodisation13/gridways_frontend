<template>
  <div class="resource-card">
    <!-- Иконка + ромб с количеством -->
    <div class="resource-icon-wrap" @dblclick="openResource">
      <img
        :src="require(`@/assets/icons/resources/${resource_name}.svg`)"
        :alt="resource_name"
        class="resource-icon"
      />
      <span class="resource-count">{{ resource_count }}</span>

      <resource-count-rombus
        v-if="actions.open"
        :isZero="false"
        class="open-rombus-small"
      >
        <span class="open-arrow">▼</span>
      </resource-count-rombus>
    </div>
    <!-- 4 кнопки действий сеткой 2x2 -->
    <div class="action-grid">
      <button
        v-if="actions.buy"
        class="action-btn btn--buy"
        title="Купить"
        @click="openModal('buy')"
      >
        +
      </button>
      <button
        v-if="actions.sell"
        class="action-btn btn--sell"
        title="Продать"
        @click="openModal('sell')"
      >
        ↩
      </button>
      <button
        v-if="actions.craft"
        class="action-btn btn--craft"
        :class="{ 'btn--craft-first': onlyCraftAndSell }"
        title="Создать"
        @click="openModal('craft')"
      >
        ⚒
      </button>
      <button
        v-if="actions.mill"
        class="action-btn btn--mill"
        title="Переработать"
        @click="openModal('mill')"
      >
        ✕
      </button>
    </div>

    <!-- Модальное окно действия -->
    <resources-action-modal
      v-if="active_action"
      :resource_name="resource_name"
      :action="active_action"
      :options="actions[active_action] ?? []"
      :step="step"
      @confirm="handleConfirm"
      @cancel="active_action = null"
    />

    <yesno-modal
      v-if="open_item_visible && resource_count > 0"
      bonus
      :name="resource_name"
      @confirm="open_item_confirm"
      @cancel="open_item_decline"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import YesnoModal from "@/components/ModalWindows/YesnoModal.vue"
import ResourcesActionModal from "@/components/Pages/BonusPage/ResourcesActionModal.vue"
import ResourceCountRombus from "@/components/UI/ResourceCountRombus.vue"
import type { ResourceActions } from "@/types"

export default defineComponent({
  name: "BonusPageResource",
  components: { YesnoModal, ResourceCountRombus, ResourcesActionModal },
  props: {
    resource_name: { type: String, required: true },
    resource_count: { type: Number, default: 0 },
    actions: { type: Object as PropType<ResourceActions>, default: () => ({}) },
    step: { type: Number, default: 1 },
  },
  emits: ["action", "open-resource-confirm"],
  data() {
    return {
      active_action: null as "buy" | "sell" | "craft" | "mill" | null,
      open_item_visible: false,
    }
  },
  computed: {
    onlyCraftAndSell(): boolean {
      return (
        !this.actions.buy &&
        !!this.actions.sell &&
        !!this.actions.craft &&
        !this.actions.mill
      )
    },
  },
  methods: {
    openModal(action: "buy" | "sell" | "craft" | "mill"): void {
      this.active_action = action
    },
    handleConfirm(payload: Record<string, unknown>): void {
      const action = this.active_action
      this.active_action = null
      this.$emit("action", {
        resource_name: this.resource_name,
        action,
        ...payload,
      })
    },
    async openResource(): Promise<void> {
      if (this.resource_count <= 0) return
      // ресурсы, которые можно открыть, в конфиге имеют флаг open: true
      if (this.actions.open) this.open_item_visible = true
    },
    open_item_confirm(): void {
      this.open_item_visible = true
      this.$emit("open-resource-confirm", this.resource_name)
    },
    open_item_decline(): void {
      this.open_item_visible = false
    },
  },
})
</script>

<style scoped>
.resource-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 6px;
  background: rgba(255, 215, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.35);
  border-radius: 10px;
}

.resource-icon-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.resource-icon {
  width: 60px;
  height: 60px;
}

.open-rombus-small {
  width: 24px !important;
  height: 24px !important;
  top: -10px !important;
}

.open-rombus-small .resource-count__value {
  font-size: 13px !important;
}

.open-arrow {
  color: #4caf50;
  -webkit-text-fill-color: #4caf50;
  font-size: 0.9rem;
  line-height: 1;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Philosopher", serif;
  transition:
    opacity 0.15s,
    transform 0.1s;
}

.action-btn:active {
  transform: translate(1px, 1px);
  opacity: 0.8;
}

.resource-count {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: #ffd700;
  text-align: center;
  margin-top: 2px;
}

.btn--buy {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
}
.btn--sell {
  background: linear-gradient(135deg, #2196f3, #1565c0);
  color: white;
}
.btn--craft {
  background: linear-gradient(135deg, #ff9800, #e65100);
  color: white;
}
.btn--mill {
  background: linear-gradient(135deg, #f44336, #b71c1c);
  color: white;
  font-size: 0.85rem;
}
.btn--craft-first {
  order: -1;
}
</style>
