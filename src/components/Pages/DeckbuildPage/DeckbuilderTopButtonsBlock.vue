<template>
  <div>
    <div class="button-filters">
      <button-icon
        class="filter_btn"
        :class="{ 'is-cancel': isCansel }"
        @click="clickAddButton"
        :image_name="'add_icon.svg'"
      />
      <button-toggle-card-list
        @click="showList('leaders')"
        :isActive="showingList === 'leaders'"
        >Лидеры</button-toggle-card-list
      >
      <button-toggle-card-list
        @click="showList('pool')"
        :isActive="showingList === 'pool'"
        >Основные</button-toggle-card-list
      >
      <button-icon
        class="filter_btn"
        @click="$emit('open-filters')"
        :image_name="'open_filters.svg'"
        :class="[empty_filters ? '' : 'set-filter']"
      />
      <button-icon
        v-if="!empty_filters"
        class="filter_btn_cancel"
        @click="cancelFilters"
        :image_name="'add_icon.svg'"
      />
    </div>
    <base-modal
      v-if="showNewDeckFactionSelect"
      @close-modal="showNewDeckFactionSelect = false"
    >
      <filter-factions title="Выберите фракцию" @set-filter="setFilter" />
    </base-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon.vue"
import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import ButtonToggleCardList from "@/components/Pages/DeckbuildPage/Buttons/ButtonToggleCardList.vue"

export default defineComponent({
  components: {
    FilterFactions,
    ButtonIcon,
    BaseModal,
    ButtonToggleCardList,
  },
  props: {
    deckBuilding: {
      type: Boolean,
      default: false,
    },
    empty_filters: {
      type: Boolean,
    },
    showingList: {
      type: String,
    },
  },
  data() {
    return {
      disable_start_animation: true as boolean, // флаг выключения первичной анимации
      showNewDeckFactionSelect: false as boolean,
      showFilters: false as boolean,
    }
  },
  methods: {
    setFilter(prop: string, value: unknown): void {
      // если мы нажали кнопку фильтра фракций при сборе колоде, ещё ставим флаг сбора колоды и закрываем окно
      this.showNewDeckFactionSelect = false
      this.$emit("select_faction", prop, value)
    },
    showList(value: string): void {
      this.$emit("trigger_show_list", value)
    },
    clickAddButton(): void {
      if (!this.showNewDeckFactionSelect && !this.deckBuilding) {
        this.showNewDeckFactionSelect = true
        return
      }
      this.showNewDeckFactionSelect = false
      this.$emit("reset")
    },
    cancelFilters(): void {
      this.$emit("reset-filters")
    },
  },
  computed: {
    isCansel(): boolean {
      return this.showNewDeckFactionSelect || this.deckBuilding
    },
  },
  emits: [
    "open-filters",
    "select_faction",
    "trigger_show_list",
    "reset",
    "reset-filters",
  ],
})
</script>

<style scoped>
.button-filters {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.filter_btn {
  position: relative;
  margin: 10px;
  transition: transform 0.2s;
}

.set-filter::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #facf5d;
}

.is-cancel {
  transform: rotate(45deg);
}

.filter_btn_cancel {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
</style>
