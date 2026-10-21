<template>
  <div class="season-reward">
    <div
      v-if="tabs.length"
      class="reward-tabs"
      role="tablist"
      aria-label="Награды"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="reward-tab"
        :class="{ 'reward-tab--active': activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="selectedTab = tab.key"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="reward-content">
      <template v-if="activeTab === 'resources'">
        <resource-list
          v-if="Object.keys(rewards.resources ?? {}).length"
          class="reward-resources"
          :resources="rewards.resources ?? {}"
          :highlight_max_count="false"
        />
        <p v-else class="reward-empty">Нет ресурсов в награде.</p>
      </template>
      <template v-else-if="activeTab === 'cards' || activeTab === 'leaders'">
        <card-list-component
          v-if="entries.length"
          :key="activeTab"
          class="reward-cards"
          :cards="entries"
          :is_leader="activeTab === 'leaders'"
          hp_needed
          bonus
        />
        <p v-else class="reward-empty">Нет доступных наград для отображения.</p>
      </template>
      <p v-else class="reward-empty">Награды пока не указаны.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardListComponent from "@/components/Cards/CardListComponent.vue"
import ResourceList from "@/components/ResourceList.vue"
import type {
  Card,
  CardEntry,
  Leader,
  LeaderEntry,
  LevelSeasonRewards,
} from "@/types"

type RewardTab = keyof LevelSeasonRewards

export default defineComponent({
  name: "LevelSeasonReward",
  components: { CardListComponent, ResourceList },
  props: {
    rewards: { type: Object as PropType<LevelSeasonRewards>, required: true },
  },
  data() {
    return { selectedTab: null as RewardTab | null }
  },
  computed: {
    tabs(): { key: RewardTab; title: string }[] {
      const tabs: { key: RewardTab; title: string }[] = [
        { key: "resources", title: "Ресурсы" },
        { key: "cards", title: "Карты" },
        { key: "leaders", title: "Лидеры" },
      ]
      return tabs.filter(tab => this.rewards[tab.key] != null)
    },
    activeTab(): RewardTab | null {
      return this.tabs.some(tab => tab.key === this.selectedTab)
        ? this.selectedTab
        : (this.tabs[0]?.key ?? null)
    },
    entries(): (CardEntry | LeaderEntry)[] {
      if (this.activeTab !== "cards" && this.activeTab !== "leaders") return []
      const catalog: Map<number, Card | Leader> =
        this.activeTab === "cards"
          ? this.$store.state.database.cardsdb
          : this.$store.state.database.leadersdb
      const counts = new Map<number, number>()
      for (const id of this.rewards[this.activeTab] ?? []) {
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
      return Array.from(counts).flatMap(([id, count]) => {
        const card = catalog.get(id)
        return card ? [{ card, count, id: null }] : []
      })
    },
  },
})
</script>

<style scoped>
.season-reward {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.reward-tabs {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin-bottom: 20px;
}

.reward-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.reward-tab {
  flex: 1;
  padding: 9px 4px;
  border: 1px solid #c5a87e;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  color: #f5e3bd;
  cursor: pointer;
}

.reward-tab--active {
  background: #c5a87e;
  color: #21180e;
}

.reward-resources {
  flex-wrap: wrap;
  gap: 16px;
}

.reward-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.reward-empty {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}
</style>
