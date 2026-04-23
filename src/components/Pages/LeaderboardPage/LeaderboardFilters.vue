<template>
  <base-modal @close-modal="$emit('close-modal')">
    <div class="lb-filters">
      <button-close-img @click="$emit('close-modal')" />

      <filter-factions
        @set-filter="filterFaction"
        :selected-faction="selectedFaction"
      />

      <div class="lb-filters__section">
        <div class="lb-filters__title global_text">Режим</div>
        <div class="lb-filters__options">
          <button
            v-for="mode in modes"
            :key="mode"
            class="lb-filters__option"
            :class="{ 'lb-filters__option--active': selectedMode === mode }"
            @click="$emit('set-mode', mode)"
          >
            {{ mode }}
          </button>
        </div>
      </div>

      <button class="cancel" @click="$emit('reset-filters')">
        Сброс фильтров
      </button>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"
import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"

export default defineComponent({
  components: { FilterFactions, BaseModal, ButtonCloseImg },
  props: {
    factions: { type: Array as PropType<string[]> },
    selectedFaction: { type: String, default: null },
    selectedMode: { type: String, default: null },
  },
  emits: ["close-modal", "reset-filters", "set-faction", "set-mode"],
  data() {
    return {
      modes: ["arena", "season", "random", "random_n"] as string[],
    }
  },
  methods: {
    filterFaction(prop: string, value: string): void {
      this.$emit("set-faction", prop, value)
    },
  },
})
</script>

<style scoped>
.lb-filters {
  position: relative;
  padding: 55px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.lb-filters__title {
  font-size: 25px;
  margin-bottom: 15px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lb-filters__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lb-filters__option {
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 1px solid #facf5d44;
  border-radius: 6px;
  padding: 6px 14px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.lb-filters__option--active {
  border-color: #facf5d;
  color: #facf5d;
}
.cancel {
  margin: auto;
  width: 98%;
  height: 30px;
}
</style>
