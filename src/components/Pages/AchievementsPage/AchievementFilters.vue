<template>
  <base-modal @close-modal="$emit('close-modal')">
    <div class="achievement-filters">
      <button-close-img @click="$emit('close-modal')" />
      <div class="filter-title global_text">Фильтры</div>
      <button
        type="button"
        class="filter-option"
        :class="{ 'filter-option--active': completedFilter === false }"
        :aria-pressed="completedFilter === false"
        @click="$emit('set-completed-filter', false)"
      >
        Скрыть выполненные
      </button>
      <button
        type="button"
        class="filter-option"
        :class="{ 'filter-option--active': completedFilter === true }"
        :aria-pressed="completedFilter === true"
        @click="$emit('set-completed-filter', true)"
      >
        Только выполненные
      </button>
      <button type="button" class="cancel" @click="$emit('reset-filters')">
        Сброс фильтров
      </button>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"

export default defineComponent({
  components: { BaseModal, ButtonCloseImg },
  props: {
    completedFilter: {
      type: Boolean as PropType<boolean | null>,
      default: null,
    },
  },
  emits: ["close-modal", "set-completed-filter", "reset-filters"],
})
</script>

<style scoped>
.achievement-filters {
  position: relative;
  padding: 55px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.filter-title {
  font-size: 25px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.filter-option {
  position: relative;
  min-height: 40px;
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 1px solid #facf5d44;
  border-radius: 6px;
  padding: 6px 14px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
}
.filter-option--active {
  border-color: #facf5d;
  color: #facf5d;
  outline: 2px solid #facf5d;
  outline-offset: 2px;
}
.filter-option--active::after {
  content: "✓";
  position: absolute;
  top: -8px;
  right: -5px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #161b22;
  color: #facf5d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}
.cancel {
  margin: auto;
  width: 98%;
  height: 30px;
}
</style>
