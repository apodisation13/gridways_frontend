<template>
  <base-modal @close-modal="closeModal">
    <div class="deck_builder_filters">
      <button-close-img @click="closeModal" />
      <filter-factions
        v-if="!deckBuilding"
        :selected-faction="query.faction"
        @set-filter="setFilter"
      />
      <filter-types
        v-if="!forLeaders"
        :selected="query.type"
        @set-filter="setFilter"
      />
      <filter-colors
        v-if="!forLeaders"
        :selected="query.color"
        @set-filter="setFilter"
      />
      <filter-unlocked :selected="query.count" @set-filter="setFilter" />
      <filter-newlyadded
        :selected="query.newly_added"
        @set-filter="setFilter"
      />
      <filter-search :value="query.search" @set-filter="setFilter" />
      <button class="cancel" @click="resetFilters">Сброс фильтров</button>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import FilterColors from "@/components/Pages/DeckbuildPage/FilterColors.vue"
import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"
import FilterNewlyadded from "@/components/Pages/DeckbuildPage/FilterNewlyAdded.vue"
import FilterSearch from "@/components/Pages/DeckbuildPage/FilterSearch.vue"
import FilterTypes from "@/components/Pages/DeckbuildPage/FilterTypes.vue"
import FilterUnlocked from "@/components/Pages/DeckbuildPage/FilterUnlocked.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"
import type { CardFilterQuery } from "@/types"

export default defineComponent({
  components: {
    FilterNewlyadded,
    FilterSearch,
    FilterFactions,
    FilterTypes,
    FilterColors,
    FilterUnlocked,
    BaseModal,
    ButtonCloseImg,
  },
  props: {
    query: {
      type: Object as PropType<CardFilterQuery>,
      required: true,
    },
    forLeaders: {
      type: Boolean,
      default: false,
    },
    deckBuilding: {
      type: Boolean,
    },
  },
  emits: ["close-modal", "reset-filters", "set-filter"],
  methods: {
    closeModal(): void {
      this.$emit("close-modal")
    },
    resetFilters(): void {
      this.$emit("reset-filters")
    },
    setFilter(prop: string, value: unknown): void {
      if (
        (prop === "faction" || prop === "type" || prop === "color") &&
        this.query[prop] === value
      ) {
        value = ""
      } else if (prop === "count" && this.query.count === value) {
        value = null
      }
      this.$emit("set-filter", prop, value)
    },
  },
})
</script>

<style scoped>
.deck_builder_filters {
  position: relative;
  padding: 55px 40px 40px;
  max-height: calc(100dvh - 20px);
  overflow-y: auto;
  box-sizing: border-box;
}
.cancel {
  margin: 20px auto auto;
  width: 98%;
  height: 30px;
}
:deep(.filter-option) {
  position: relative;
  min-height: 36px;
}
:deep(.filter-option--selected) {
  outline: 2px solid #facf5d;
  outline-offset: 2px;
}
:deep(.filter-option--selected::after) {
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
</style>
