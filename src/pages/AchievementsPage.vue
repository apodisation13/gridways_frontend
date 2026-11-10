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
        :class="{ 'set-filter': completedFilter !== null }"
        aria-label="Фильтры"
        :aria-expanded="showFilters"
        @click="showFilters = true"
      >
        <button-icon image_name="open_filters.svg" />
      </button>
      <button
        v-if="completedFilter !== null"
        type="button"
        class="filter_btn_cancel"
        aria-label="Сбросить фильтры"
        @click="completedFilter = null"
      >
        <button-icon image_name="add_icon.svg" />
      </button>
    </div>

    <achievement-filters
      v-if="showFilters"
      :completed-filter="completedFilter"
      @close-modal="showFilters = false"
      @set-completed-filter="toggleCompletedFilter"
      @reset-filters="completedFilter = null"
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
            <article
              v-for="entry in group.visibleEntries"
              :key="entry.key"
              class="achievement"
              :class="{ 'achievement--completed': entry.completed }"
            >
              <h2>{{ entry.definition.title }}</h2>
              <div class="achievement__progress-label">
                <span>{{ entry.value }} / {{ entry.definition.target }}</span>
                <span v-if="entry.rewardGranted" class="achievement__status">
                  ✓ Награда получена
                </span>
                <span v-else-if="entry.completed" class="achievement__status">
                  ✓ Выполнено
                </span>
                <span
                  v-else-if="
                    entry.definition.target > 0 &&
                    entry.value >= entry.definition.target
                  "
                >
                  Ожидает подтверждения
                </span>
              </div>
              <div
                class="achievement__bar"
                role="progressbar"
                :aria-label="entry.definition.title"
                :aria-valuenow="entry.value"
                :aria-valuemin="0"
                :aria-valuemax="entry.definition.target"
              >
                <span :style="{ width: `${entry.percent}%` }" />
              </div>
              <div class="achievement__reward">
                <span class="reward-label">Награда</span>
                <resource-list
                  class="reward-resources"
                  :resources="entry.definition.rewards.resources"
                  :highlight_max_count="false"
                />
              </div>
            </article>
          </div>
        </details>
      </template>
      <p v-else class="empty-state">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import AchievementFilters from "@/components/Pages/AchievementsPage/AchievementFilters.vue"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon.vue"
import ResourceList from "@/components/ResourceList.vue"
import type {
  AchievementCatalog,
  AchievementDefinition,
  AchievementPeriod,
  UserAchievementsProgress,
} from "@/types"

interface AchievementEntry {
  key: string
  definition: AchievementDefinition
  value: number
  percent: number
  completed: boolean
  completedAt: number
  rewardGranted: boolean
}

const TABS: Array<{ key: AchievementPeriod; title: string }> = [
  { key: "permanent", title: "Постоянные" },
  { key: "daily", title: "Ежедневные" },
  { key: "weekly", title: "Недельные" },
]

export default defineComponent({
  name: "AchievementsPage",
  components: { ResourceList, ButtonIcon, AchievementFilters },
  data() {
    return {
      activeTab: "permanent" as AchievementPeriod,
      showFilters: false,
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
              const value = Math.min(
                definition.target,
                Math.max(0, progress?.value ?? 0)
              )
              return {
                key: definition.id,
                definition,
                value,
                percent:
                  definition.target > 0 ? (value / definition.target) * 100 : 0,
                completed: Boolean(progress?.completed_at),
                completedAt: Date.parse(progress?.completed_at ?? "") || 0,
                rewardGranted: Boolean(progress?.reward_granted_at),
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
              this.completedFilter === null ||
              entry.completed === this.completedFilter
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
      if (this.completedFilter === false && this.groups.length)
        return "Нет невыполненных достижений."
      if (this.completedFilter === true && this.groups.length)
        return "Нет выполненных достижений."
      return "Постоянных достижений пока нет."
    },
  },
  methods: {
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

.achievement {
  padding: 14px;
  border: 1px solid rgba(250, 207, 93, 0.12);
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.08);
}

.achievement--completed {
  border-color: rgba(170, 235, 170, 0.35);
}

h2 {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.achievement__progress-label {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 8px;
  font-size: 0.8rem;
  color: #facf5d;
}

.achievement__status {
  color: #aaebaa;
}

.achievement__bar {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
}

.achievement__bar > span {
  display: block;
  height: 100%;
  background: var(--primary-gold-gradient, #c49000);
}

.achievement__reward {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.reward-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.reward-resources {
  width: auto;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
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
