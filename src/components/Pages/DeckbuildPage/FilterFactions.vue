<template>
  <div class="filter_factions">
    <base-title-text>{{ title }}</base-title-text>
    <div class="factions">
      <div
        v-for="faction in factions"
        :key="faction.name"
        class="faction-wrap filter-option"
        :class="{
          'faction-wrap--active': selectedFaction === faction.name,
          'filter-option--selected': selectedFaction === faction.name,
        }"
        @click="filtering(faction)"
      >
        <faction-item :faction="faction" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import BaseTitleText from "@/components/UI/BaseTitleText.vue"
import type { Faction } from "@/types"

export default defineComponent({
  name: "FilterFactions",
  components: {
    FactionItem,
    BaseTitleText,
  },
  props: {
    // покажем или Фракции, или "Выберите фракцию" для новой колоды
    title: {
      required: false,
      type: String,
      default: "Фракции",
    },
    selectedFaction: {
      type: String,
      default: null,
    },
    excludeNeutral: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["set-filter"],
  computed: {
    factions(): Faction[] {
      const factions: Faction[] = this.$store.getters["all_factions"]
      return this.excludeNeutral
        ? factions.filter(faction => faction.name !== "Neutral")
        : factions
    },
  },
  methods: {
    filtering(faction: Faction): void {
      // выбранная фракция и флаг что выбрано ТРУ
      this.$emit("set-filter", "faction", faction.name)
      // this.$emit("filter-factions", [[faction.name, "Neutral"], true])
    },
  },
})
</script>

<style scoped>
.filter_factions {
  margin-bottom: 20px;
}

.factions {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.faction-wrap {
  border-radius: 6px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  cursor: pointer;
}

.faction-wrap--active {
  border-color: #facf5d;
}
</style>
