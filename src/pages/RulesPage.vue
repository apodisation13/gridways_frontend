<template>
  <div class="rules-page">
    <div class="rules-page__title">
      <h1 class="global_text rules-page__heading">Правила</h1>
    </div>

    <div
      ref="catScroll"
      class="chips-row"
      :class="{ 'chips-row--dragging': dragState?.ref === 'catScroll' }"
      @wheel.prevent="onWheel($event, 'catScroll')"
      @mousedown="onMouseDown($event, 'catScroll')"
    >
      <button
        v-for="cat in RULES"
        :key="cat.id"
        class="chip"
        :class="{ 'chip--active': activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>

    <div
      ref="subScroll"
      class="chips-row chips-row--sub"
      :class="{ 'chips-row--dragging': dragState?.ref === 'subScroll' }"
      @wheel.prevent="onWheel($event, 'subScroll')"
      @mousedown="onMouseDown($event, 'subScroll')"
    >
      <button
        v-for="sub in currentSubs"
        :key="sub.id"
        class="chip chip--sm"
        :class="{ 'chip--active': activeSub === sub.id }"
        @click="activeSub = sub.id"
      >
        {{ sub.label }}
      </button>
    </div>

    <div class="rules-content">
      <component :is="currentComponent" v-if="currentComponent" />
      <p v-else class="rules-content__text global_text">{{ currentContent }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import type { Component } from "vue"
import { defineComponent } from "vue"

import BasicsGeneral from "@/components/Pages/RulesPage/BasicsGeneral.vue"
import BasicsRoadmap from "@/components/Pages/RulesPage/BasicsRoadmap.vue"
import CardsEnemyCards from "@/components/Pages/RulesPage/CardsEnemyCards.vue"
import CardsPlayerCards from "@/components/Pages/RulesPage/CardsPlayerCards.vue"
import ModesGeneral from "@/components/Pages/RulesPage/ModesGeneral.vue"
import ModesRandom from "@/components/Pages/RulesPage/ModesRandom.vue"
import ModesSeasons from "@/components/Pages/RulesPage/ModesSeasons.vue"
import ModesStartGame from "@/components/Pages/RulesPage/ModesStartGame.vue"
import StorageDeck from "@/components/Pages/RulesPage/StorageDeck.vue"
import StorageDeckEdit from "@/components/Pages/RulesPage/StorageDeckEdit.vue"
import StorageFactions from "@/components/Pages/RulesPage/StorageFactions.vue"
import StorageFiltersTypes from "@/components/Pages/RulesPage/StorageFiltersTypes.vue"
import StorageGeneral from "@/components/Pages/RulesPage/StorageGeneral.vue"
import StorageStorage from "@/components/Pages/RulesPage/StorageStorage.vue"

interface SubCategory {
  id: string
  label: string
  content?: string
  component?: Component
}

interface RulesCategory {
  id: string
  label: string
  subs: SubCategory[]
}

const RULES: RulesCategory[] = [
  {
    id: "basics",
    label: "Основы",
    subs: [
      { id: "basics-general", label: "Общее", component: BasicsGeneral },
      {
        id: "basics-roadmap",
        label: "Roadmap",
        component: BasicsRoadmap,
      },
    ],
  },
  {
    id: "storage",
    label: "Склад",
    subs: [
      { id: "storage-general", label: "Общее", component: StorageGeneral },
      {
        id: "storage-storage",
        label: "Склад",
        component: StorageStorage,
      },
      {
        id: "storage-factions",
        label: "Фракции",
        component: StorageFactions,
      },
      {
        id: "storage-deck",
        label: "Сбор колоды",
        component: StorageDeck,
      },
      {
        id: "storage-deck_edit",
        label: "Изменение колод",
        component: StorageDeckEdit,
      },
      {
        id: "storage-filters",
        label: "Фильтры (типы карт)",
        component: StorageFiltersTypes,
      },
    ],
  },
  {
    id: "cards",
    label: "Карты",
    subs: [
      {
        id: "cards-player-cards",
        label: "Параметры карт игрока",
        component: CardsPlayerCards,
      },
      {
        id: "cards-enemy-cards",
        label: "Параметры карт врагов",
        component: CardsEnemyCards,
      },
    ],
  },
  {
    id: "modes",
    label: "Режимы/Начало игры",
    subs: [
      {
        id: "modes-general",
        label: "Общее",
        component: ModesGeneral,
      },
      {
        id: "modes-seasons",
        label: "Сезоны",
        component: ModesSeasons,
      },
      {
        id: "modes-random",
        label: "Рандом",
        component: ModesRandom,
      },
      {
        id: "modes-random-n",
        label: "Рандом по количеству",
        content:
          "А тут просто выберете число от 5 до 200 и нажмите генерировать, а потом подвердите выбор уровня двойным кликом по нему",
      },
      {
        id: "modes-arena",
        label: "Арена",
        content: "Арена пока не реализована, обновим правила позже",
      },
      {
        id: "modes-start-game",
        label: "Начало игры",
        component: ModesStartGame,
      },
    ],
  },
  {
    id: "game",
    label: "Игра",
    subs: [
      { id: "game-general", label: "Общее", content: "Раздел в разработке." },
      {
        id: "game-mode",
        label: "Выбор режима",
        content: "Раздел в разработке.",
      },
      { id: "game-seasons", label: "Сезоны", content: "Раздел в разработке." },
      { id: "game-field", label: "Поле", content: "Раздел в разработке." },
      { id: "game-hand", label: "Рука", content: "Раздел в разработке." },
      { id: "game-deck", label: "Колода", content: "Раздел в разработке." },
      { id: "game-discard", label: "Сброс", content: "Раздел в разработке." },
      { id: "game-turn", label: "Ход", content: "Раздел в разработке." },
    ],
  },
  {
    id: "resources",
    label: "Ресурсы",
    subs: [
      { id: "res-general", label: "Общее", content: "Раздел в разработке." },
      { id: "res-stones", label: "Камни", content: "Раздел в разработке." },
      { id: "res-ingots", label: "Слитки", content: "Раздел в разработке." },
      { id: "res-rags", label: "Тряпки", content: "Раздел в разработке." },
      { id: "res-straw", label: "Солома", content: "Раздел в разработке." },
      { id: "res-wood", label: "Дерево", content: "Раздел в разработке." },
      { id: "res-silk", label: "Шелк", content: "Раздел в разработке." },
      { id: "res-kegs", label: "Бочки", content: "Раздел в разработке." },
      { id: "res-chests", label: "Коробки", content: "Раздел в разработке." },
      {
        id: "res-gem",
        label: "Редкий камень",
        content: "Раздел в разработке.",
      },
      { id: "res-money", label: "Деньги", content: "Раздел в разработке." },
    ],
  },
  {
    id: "upgrades",
    label: "Прокачка",
    subs: [
      { id: "upg-general", label: "Общее", content: "Раздел в разработке." },
      {
        id: "upg-resources",
        label: "Ресурсы",
        content: "Раздел в разработке.",
      },
      { id: "upg-game", label: "Игровые", content: "Раздел в разработке." },
      {
        id: "upg-settings",
        label: "Настройки",
        content: "Раздел в разработке.",
      },
    ],
  },
  {
    id: "shop",
    label: "Магазин",
    subs: [
      { id: "shop-general", label: "Общее", content: "Раздел в разработке." },
      {
        id: "shop-process",
        label: "Процесс покупки",
        content: "Раздел в разработке.",
      },
    ],
  },
  {
    id: "misc",
    label: "Разное",
    subs: [
      {
        id: "misc-settings",
        label: "Настройки",
        content: "Раздел в разработке.",
      },
    ],
  },
]

export default defineComponent({
  name: "RulesPage",

  data() {
    return {
      RULES,
      activeCategory: RULES[0].id,
      activeSub: RULES[0].subs[0].id,
      dragState: null as {
        ref: "catScroll" | "subScroll"
        startX: number
        scrollLeft: number
      } | null,
    }
  },

  computed: {
    currentSubs(): SubCategory[] {
      return RULES.find(c => c.id === this.activeCategory)?.subs ?? []
    },
    currentComponent(): Component | null {
      return (
        this.currentSubs.find(s => s.id === this.activeSub)?.component ?? null
      )
    },
    currentContent(): string {
      return this.currentSubs.find(s => s.id === this.activeSub)?.content ?? ""
    },
  },

  beforeUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
  },

  methods: {
    selectCategory(id: string): void {
      this.activeCategory = id
      const subs = RULES.find(c => c.id === id)?.subs ?? []
      this.activeSub = subs[0]?.id ?? ""
      this.$nextTick(() => {
        const el = this.$refs.subScroll as HTMLElement | undefined
        if (el) el.scrollLeft = 0
      })
    },

    onWheel(e: WheelEvent, ref: "catScroll" | "subScroll"): void {
      const el = this.$refs[ref] as HTMLElement | undefined
      if (el) el.scrollLeft += e.deltaY
    },

    onMouseDown(e: MouseEvent, ref: "catScroll" | "subScroll"): void {
      e.preventDefault()
      const el = this.$refs[ref] as HTMLElement
      this.dragState = { ref, startX: e.clientX, scrollLeft: el.scrollLeft }
      document.addEventListener("mousemove", this.onMouseMove)
      document.addEventListener("mouseup", this.onMouseUp)
    },

    onMouseMove(e: MouseEvent): void {
      if (!this.dragState) return
      const el = this.$refs[this.dragState.ref] as HTMLElement
      el.scrollLeft =
        this.dragState.scrollLeft - (e.clientX - this.dragState.startX)
    },

    onMouseUp(): void {
      this.dragState = null
      document.removeEventListener("mousemove", this.onMouseMove)
      document.removeEventListener("mouseup", this.onMouseUp)
    },
  },
})
</script>

<style scoped>
.rules-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
}

.rules-page__title {
  text-align: center;
  padding: 16px 0 10px;
  flex-shrink: 0;
}

.rules-page__heading {
  font-size: 1.8rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chips-row {
  display: flex;
  flex-shrink: 0;
  cursor: grab;
  gap: 8px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background: linear-gradient(
    180deg,
    #465361 0%,
    rgba(37, 44, 50, 0.35) 50.52%,
    #1d252d 99.48%
  );
  border-bottom: 2px solid;
  border-image-source: var(--secondary-gold-gradient);
  border-image-slice: 1;
}

.chips-row::-webkit-scrollbar {
  display: none;
}

.chips-row--dragging {
  cursor: grabbing;
  user-select: none;
}

.chips-row--sub {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(196, 155, 0, 0.2);
  border-image: none;
}

.chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.65);
  font-family: "Philosopher", serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.chip--sm {
  padding: 5px 12px;
  font-size: 13px;
}

.chip--active {
  background: rgba(196, 155, 0, 0.18);
  border-color: rgba(196, 155, 0, 0.65);
  color: #facf5d;
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.rules-content::-webkit-scrollbar {
  width: 4px;
}

.rules-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.rules-content__text {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
}
</style>
