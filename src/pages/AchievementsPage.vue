<template>
  <div class="achievements-page">
    <h1>Достижения</h1>

    <div class="tabs" role="tablist" aria-label="Период достижений">
      <div class="tabs__slider" :style="sliderStyle" />
      <button
        v-for="(tab, index) in tabs"
        :id="`achievement-tab-${tab.key}`"
        :key="tab.key"
        type="button"
        role="tab"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        aria-controls="achievements-panel"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="activeTab = tab.key"
        @keydown="navigateTabs($event, index)"
      >
        {{ tab.title }}
      </button>
    </div>

    <div class="achievements-filter-row">
      <button
        type="button"
        class="filter_btn"
        :class="{ 'set-filter': completedFilter !== null || pinnedOnly }"
        aria-label="Фильтры"
        :aria-expanded="showFilters"
        @click="showFilters = true"
      >
        <button-icon image_name="open_filters.svg" />
      </button>
      <button
        v-if="completedFilter !== null || pinnedOnly"
        type="button"
        class="filter_btn_cancel"
        aria-label="Сбросить фильтры"
        @click="resetFilters"
      >
        <button-icon image_name="add_icon.svg" />
      </button>
    </div>

    <achievement-filters
      v-if="showFilters"
      :completed-filter="completedFilter"
      :pinned-only="pinnedOnly"
      @toggle-pinned="pinnedOnly = !pinnedOnly"
      @close-modal="showFilters = false"
      @set-completed-filter="toggleCompletedFilter"
      @reset-filters="resetFilters"
    />

    <div
      id="achievements-panel"
      class="achievements-list"
      role="tabpanel"
      :aria-labelledby="`achievement-tab-${activeTab}`"
      tabindex="0"
    >
      <template v-if="activeTab === 'permanent' && visibleGroups.length">
        <details
          v-for="group in visibleGroups"
          :key="group.key"
          class="achievement-group"
          open
        >
          <summary>
            <span>{{ group.title }}</span>
            <span class="group-count">
              {{ group.entries.filter(entry => entry.completed).length }} /
              {{ group.entries.length }}
            </span>
          </summary>
          <div class="group-items">
            <achievement-card
              v-for="entry in group.visibleEntries"
              :key="entry.key"
              :definition="entry.definition"
              :progress="progress.permanent?.[entry.key]"
            />
          </div>
        </details>
      </template>
      <p v-else class="empty-state">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import AchievementCard from "@/components/Pages/AchievementsPage/AchievementCard.vue"
import AchievementFilters from "@/components/Pages/AchievementsPage/AchievementFilters.vue"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon.vue"
import type {
  AchievementCatalog,
  AchievementDefinition,
  AchievementPeriod,
  PinnedAchievement,
  UserAchievementsProgress,
} from "@/types"

interface AchievementEntry {
  key: string
  definition: AchievementDefinition
  completed: boolean
  completedAt: number
}

const TABS: Array<{ key: AchievementPeriod; title: string }> = [
  { key: "permanent", title: "Постоянные" },
  { key: "daily", title: "Ежедневные" },
  { key: "weekly", title: "Недельные" },
]

export default defineComponent({
  name: "AchievementsPage",
  components: { AchievementCard, ButtonIcon, AchievementFilters },
  data() {
    return {
      activeTab: "permanent" as AchievementPeriod,
      showFilters: false,
      pinnedOnly: false,
      // null — все, false — невыполненные, true — выполненные.
      completedFilter: null as boolean | null,
    }
  },
  computed: {
    tabs(): Array<{ key: AchievementPeriod; title: string }> {
      return TABS.map(tab => ({
        key: tab.key,
        title: this.catalog[tab.key]?.title ?? tab.title,
      }))
    },
    catalog(): AchievementCatalog {
      return this.$store.getters["achievementsConfig"]
    },
    progress(): UserAchievementsProgress {
      return this.$store.getters["localUserAchievements"]
    },
    sliderStyle(): Record<string, string> {
      return {
        transform: `translateX(${this.tabs.findIndex(tab => tab.key === this.activeTab) * 100}%)`,
      }
    },
    groups(): Array<{
      key: string
      title: string
      entries: AchievementEntry[]
    }> {
      return Object.values(this.catalog.permanent.categories)
        .sort((a, b) => a.ordering - b.ordering || a.id.localeCompare(b.id))
        .map(category => ({
          key: category.id,
          title: category.title,
          entries: Object.values(category.achievements)
            .map(definition => {
              const progress = this.progress.permanent?.[definition.id]
              return {
                key: definition.id,
                definition,
                completed: Boolean(
                  progress?.completed_at || progress?.reward_granted_at
                ),
                completedAt: Date.parse(progress?.completed_at ?? "") || 0,
              }
            })
            .sort((a, b) => {
              // Выполнение подтверждает бэк; локальные 10/10 ещё не считаем выполнением.
              if (a.completed !== b.completed) return a.completed ? 1 : -1
              if (a.completed && a.completedAt !== b.completedAt)
                return b.completedAt - a.completedAt
              return (
                a.definition.ordering - b.definition.ordering ||
                a.key.localeCompare(b.key)
              )
            }),
        }))
        .filter(group => group.entries.length > 0)
    },
    visibleGroups() {
      // Счётчик категории остаётся общим, фильтруем только отображаемые задания.
      return this.groups
        .map(group => ({
          ...group,
          visibleEntries: group.entries.filter(
            entry =>
              (this.completedFilter === null ||
                entry.completed === this.completedFilter) &&
              (!this.pinnedOnly ||
                this.$store.state.achievements.pinnedAchievements.some(
                  (pin: PinnedAchievement) =>
                    pin.section === "permanent" && pin.id === entry.key
                ))
          ),
        }))
        .filter(group => group.visibleEntries.length > 0)
    },
    emptyMessage(): string {
      // The catalog is not the selected daily/weekly set. Do not expose
      // arbitrary catalog entries until the selected-set API is connected.
      if (this.activeTab === "daily")
        return "Ежедневные задания пока недоступны."
      if (this.activeTab === "weekly")
        return "Недельные задания пока недоступны."
      if (this.pinnedOnly)
        return "Нет закреплённых заданий, подходящих под фильтры."
      if (this.completedFilter === false && this.groups.length)
        return "Нет невыполненных достижений."
      if (this.completedFilter === true && this.groups.length)
        return "Нет выполненных достижений."
      return "Постоянных достижений пока нет."
    },
  },
  methods: {
    resetFilters(): void {
      this.completedFilter = null
      this.pinnedOnly = false
    },
    toggleCompletedFilter(completed: boolean): void {
      this.completedFilter =
        this.completedFilter === completed ? null : completed
    },
    navigateTabs(event: KeyboardEvent, index: number): void {
      let next = index
      if (event.key === "ArrowRight") next = (index + 1) % this.tabs.length
      else if (event.key === "ArrowLeft")
        next = (index + this.tabs.length - 1) % this.tabs.length
      else if (event.key === "Home") next = 0
      else if (event.key === "End") next = this.tabs.length - 1
      else return
      event.preventDefault()
      this.activeTab = this.tabs[next].key
      const button = event.currentTarget as HTMLButtonElement
      button.parentElement
        ?.querySelectorAll<HTMLButtonElement>("button")
        [next]?.focus()
    },
  },
})
</script>

<style scoped>
.achievements-page {
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding: 10px 8px calc(86px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: rgba(255, 255, 255, 0.9);
}

h1 {
  flex-shrink: 0;
  text-align: center;
  font-family: "Philosopher", serif;
  font-size: 2rem;
  line-height: 1;
  color: hsl(39, 82%, 62%);
}

.tabs {
  position: relative;
  display: flex;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 3px;
}

.tabs__slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc((100% - 6px) / 3);
  height: calc(100% - 6px);
  border-radius: 8px;
  background: var(--primary-gold-gradient, #c49000);
  transition: transform 0.25s ease;
  pointer-events: none;
}

.tabs__btn {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  z-index: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 2px;
  font-family: "Philosopher", serif;
  font-size: clamp(0.78rem, 3.2vw, 0.95rem);
  color: rgba(255, 255, 255, 0.6);
}

.tabs__btn--active {
  color: #1a1208;
  font-weight: bold;
}

.achievements-filter-row {
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.filter_btn,
.filter_btn_cancel {
  border: 0;
  padding: 10px;
  background: none;
  cursor: pointer;
}

.filter_btn {
  position: relative;
}

.set-filter::before {
  content: "";
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #facf5d;
}

.filter_btn_cancel {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.achievements-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 4px 8px;
}

.achievement-group + .achievement-group {
  margin-top: 16px;
}

summary {
  padding: 10px 4px;
  cursor: pointer;
  color: #facf5d;
  font-family: "Philosopher", serif;
  font-size: 1.15rem;
}

.group-count {
  float: right;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.55);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  padding: 32px 12px;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .tabs__slider {
    transition: none;
  }
}
</style>
