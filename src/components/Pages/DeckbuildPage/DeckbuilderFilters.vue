<template>
  <base-modal @close-modal="closeModal">
    <div class="deck_builder_filters">
      <button-close-img @click="closeModal" />
      <filter-factions v-if="!deckBuilding" @set-filter="setFilter" />
      <filter-types @set-filter="setFilter" />
      <filter-colors @set-filter="setFilter" />
      <filter-passives @set-filter="setFilter" />
      <filter-unlocked @set-filter="setFilter" />
      <filter-newlyadded @set-filter="setFilter" />
      <button class="cancel" @click="resetFilters">Сброс фильтров</button>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import FilterColors from "@/components/Pages/DeckbuildPage/FilterColors.vue"
import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"
import FilterNewlyadded from "@/components/Pages/DeckbuildPage/FilterNewlyAdded.vue"
import FilterPassives from "@/components/Pages/DeckbuildPage/FilterPassives.vue"
import FilterTypes from "@/components/Pages/DeckbuildPage/FilterTypes.vue"
import FilterUnlocked from "@/components/Pages/DeckbuildPage/FilterUnlocked.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"

export default defineComponent({
  components: {
    FilterNewlyadded,
    FilterFactions,
    FilterTypes,
    FilterColors,
    FilterPassives,
    FilterUnlocked,
    BaseModal,
    ButtonCloseImg,
  },
  props: {
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
      this.$emit("set-filter", prop, value)
    },
  },
})
</script>

<style scoped>
.deck_builder_filters {
  position: relative;
  padding: 55px 40px 40px;
}
.cancel {
  margin: 20px auto auto;
  width: 98%;
  height: 30px;
}
</style>
