<template>
  <modal-window class="level-modal">
    <div class="level-header">
      <button-close @close_self="close_self" />
      <div class="level-tabs" role="tablist" aria-label="Просмотр уровня">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="level-tab"
          :class="{ 'level-tab--active': activeTab === tab.key }"
          :title="tab.title"
          :aria-label="tab.title"
          :aria-selected="activeTab === tab.key"
          role="tab"
          @click="selectedTab = tab.key"
        >
          <img
            v-if="tab.key === 'rewards'"
            src="@/assets/icons/rewards.svg"
            width="28"
            height="28"
            alt=""
          />
          <span v-else aria-hidden="true">{{ tab.icon }}</span>
        </button>
      </div>
      <h3 class="tab-title">{{ activeTabTitle }}</h3>
    </div>
    <div
      class="level-content"
      :class="{ 'level-content--rewards': activeTab === 'rewards' }"
    >
      <dl v-if="activeTab === 'info'" class="level-info">
        <div>
          <dt>Название</dt>
          <dd>{{ level.name }}</dd>
        </div>
        <div>
          <dt>Сложность</dt>
          <dd>{{ difficultyLabel }}</dd>
        </div>
        <div>
          <dt>Количество врагов</dt>
          <dd>{{ level.enemies.length }}</dd>
        </div>
      </dl>
      <template v-else-if="activeTab === 'leader'">
        <div v-if="level.enemy_leader" class="enemy_leader">
          <enemy-leader :enemy_leader="level.enemy_leader" />
        </div>
        <p v-else class="empty-text">Лидер врагов не указан.</p>
      </template>
      <template v-else-if="activeTab === 'enemies'">
        <enemy-list
          v-if="filteredEnemies.length"
          class="level-enemies"
          :enemies="filteredEnemies"
        />
        <p v-else class="empty-text">Врагов нет.</p>
      </template>
      <level-season-reward
        v-else-if="activeTab === 'rewards' && level.data?.rewards"
        :key="level.id"
        :rewards="level.data.rewards"
      />
    </div>
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import EnemyLeader from "@/components/Cards/EnemyLeader.vue"
import EnemyList from "@/components/Cards/EnemyList.vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import LevelSeasonReward from "@/components/Pages/LevelPage/LevelSeasonReward.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import type { Enemy, ResolvedLevel } from "@/types"

type LevelTab = "info" | "leader" | "enemies" | "rewards"

export default defineComponent({
  name: "LevelModal",
  components: {
    EnemyList,
    EnemyLeader,
    ButtonClose,
    ModalWindow,
    LevelSeasonReward,
  },
  props: {
    level: {
      type: Object as PropType<ResolvedLevel>,
      required: true,
    },
  },
  emits: ["close_level_modal"],
  data() {
    return { selectedTab: "enemies" as LevelTab }
  },
  computed: {
    tabs(): { key: LevelTab; title: string; icon: string }[] {
      const tabs: { key: LevelTab; title: string; icon: string }[] = [
        { key: "info", title: "Информация", icon: "ℹ️" },
        { key: "leader", title: "Лидер врагов", icon: "👑" },
        { key: "enemies", title: "Враги", icon: "⚔️" },
      ]
      if (
        this.level.data?.rewards &&
        Object.keys(this.level.data.rewards).length
      ) {
        tabs.push({ key: "rewards", title: "Награды", icon: "" })
      }
      return tabs
    },
    activeTab(): LevelTab {
      return this.tabs.some(tab => tab.key === this.selectedTab)
        ? this.selectedTab
        : "info"
    },
    activeTabTitle(): string {
      return this.tabs.find(tab => tab.key === this.activeTab)!.title
    },
    difficultyLabel(): string {
      return {
        easy: "⭐ Лёгкая",
        normal: "⭐⭐ Средняя",
        hard: "⭐⭐⭐ Сложная",
      }[this.level.difficulty]
    },
    filteredEnemies(): Enemy[] {
      return this.level.enemies.filter((e): e is Enemy => e !== undefined)
    },
  },
  watch: {
    "level.id"() {
      this.selectedTab = "info"
    },
  },
  methods: {
    close_self(): void {
      this.$emit("close_level_modal")
    },
  },
})
</script>

<style scoped>
.level-modal > :deep(.modal_content) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.level-header {
  flex-shrink: 0;
  padding: 0 16px;
  color: white;
}

.level-tabs {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.level-tab {
  flex: 1;
  min-height: 44px;
  border: 1px solid #c5a87e;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 24px;
  cursor: pointer;
}

.level-tab--active {
  background: rgba(197, 168, 126, 0.35);
  box-shadow: inset 0 0 0 1px #facf5d;
}

.tab-title {
  margin: 14px 0;
  font-size: 18px;
}

.level-content {
  flex: 1;
  min-height: 0;
  padding: 8px 16px 16px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  color: white;
}

.level-content--rewards {
  display: flex;
  overflow: hidden;
}

.level-info {
  margin: 0;
  text-align: left;
}

.level-info > div {
  padding: 16px;
  border-bottom: 1px solid rgba(197, 168, 126, 0.25);
}

.level-info dt {
  margin-bottom: 8px;
  color: #c5a87e;
  font-size: 13px;
}

.level-info dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.enemy_leader {
  width: 70%;
  max-width: 280px;
  margin: 12px auto;
}

.enemy_leader :deep(.enemy-leader) {
  max-width: none;
}

.level-enemies {
  width: 100%;
  height: auto;
  overflow: visible;
}

.empty-text {
  color: rgba(255, 255, 255, 0.7);
}
</style>
