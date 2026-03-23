<template>
  <div class="filter_factions">
    <base-title-text>{{ title }}</base-title-text>
    <div class="factions">
      <div
        v-for="faction in factions"
        :key="faction.name"
        class="faction-wrap"
        :class="{ 'faction-wrap--active': selectedFaction === faction.name }"
        @click="filtering(faction)"
      >
        <faction-item :faction="faction" />
      </div>
    </div>
  </div>
</template>

<script>
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem"
import BaseTitleText from "@/components/UI/BaseTitleText"

export default {
  components: {
    FactionItem,
    BaseTitleText,
  },
  name: "filter-factions",
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
  },
  computed: {
    factions() {
      return this.$store.getters["all_factions"]
    },
  },
  methods: {
    filtering(faction) {
      // выбранная фракция и флаг что выбрано ТРУ
      this.$emit("set-filter", "faction", faction.name)
      // this.$emit("filter-factions", [[faction.name, "Neutral"], true])
    },
  },
  emits: ["set-filter"],
}
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
