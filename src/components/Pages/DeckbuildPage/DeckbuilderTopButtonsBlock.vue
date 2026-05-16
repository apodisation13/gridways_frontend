<template>
  <div>
    <div class="button-filters">
      <button-icon
        class="filter_btn"
        :class="{ 'is-cancel': isCansel }"
        :image_name="'add_icon.svg'"
        @click="clickAddButton"
      />
      <button-toggle-card-list
        :isActive="showingList === 'leaders'"
        @click="showList('leaders')"
        >Лидеры</button-toggle-card-list
      >
      <button-toggle-card-list
        :isActive="showingList === 'pool'"
        @click="showList('pool')"
        >Основные</button-toggle-card-list
      >
      <button-icon
        class="filter_btn"
        :image_name="'open_filters.svg'"
        :class="[empty_filters ? '' : 'set-filter']"
        @click="$emit('open-filters')"
      />
      <button-icon
        v-if="!empty_filters"
        class="filter_btn_cancel"
        :image_name="'add_icon.svg'"
        @click="cancelFilters"
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
import { useToast } from "vue-toastification"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon.vue"
import ButtonToggleCardList from "@/components/Pages/DeckbuildPage/Buttons/ButtonToggleCardList.vue"
import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"
import { DeckEntry } from "@/types"

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
      default: "",
    },
  },
  emits: [
    "open-filters",
    "select_faction",
    "trigger_show_list",
    "reset",
    "reset-filters",
  ],
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      disable_start_animation: true as boolean, // флаг выключения первичной анимации
      showNewDeckFactionSelect: false as boolean,
      showFilters: false as boolean,
    }
  },
  computed: {
    isCansel(): boolean {
      return this.showNewDeckFactionSelect || this.deckBuilding
    },
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
      // проверка - можно ли создать колоду, теперь управляется через апгрейды
      const currentDecks: DeckEntry[] = this.$store.getters["all_decks"]
      const upgradeMaxDecksCount: number = this.$store.getters["maxDecks"]
      if (currentDecks.length >= upgradeMaxDecksCount) {
        this.toast.warning(
          "Нельзя создать больше колод, прокачайте свой уровень в разделе Прокачка"
        )
        return
      }

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
