<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-panel">
      <div class="modal-panel__header">
        <h1 class="modal-panel__title">{{ config.title }}</h1>
        <button class="modal-panel__close" @click="$emit('close')">✕</button>
      </div>

      <!-- Список апгрейдов -->
      <div class="upgrades-list">
        <div
          v-for="upgrade in sortedUpgrades"
          :key="upgrade.key"
          class="upgrade-item"
          :class="{ 'upgrade-item--dim': userLevel(upgrade.key) === 0 }"
          @click="openDetail(upgrade.key, upgrade.item)"
        >
          <div class="upgrade-item__header">
            <span class="upgrade-item__title">{{ upgrade.item.title }}</span>
            <span class="upgrade-item__value">{{
              formatValue(upgrade.item.upgrades[userLevel(upgrade.key)]?.value)
            }}</span>
          </div>
          <div class="upgrade-item__bar">
            <span
              v-for="lvl in totalLevels(upgrade.item)"
              :key="lvl"
              class="upgrade-item__segment"
              :class="{
                'upgrade-item__segment--active': lvl <= userLevel(upgrade.key),
              }"
            />
          </div>
        </div>
      </div>

      <!-- Детальная модалка апгрейда -->
      <div v-if="detail" class="detail-overlay" @click.self="closeDetail">
        <div class="detail">
          <h2 class="detail__title">{{ detail.item.title }}</h2>

          <div class="detail__section">
            <div class="detail__label">Текущий уровень</div>
            <div
              class="detail__level-row"
              :class="{ 'detail__level-row--dim': userLevel(detail.key) === 0 }"
            >
              <span class="detail__level-num">{{
                userLevel(detail.key) === 0 ? "Базовый" : userLevel(detail.key)
              }}</span>
              <span class="detail__sep">—</span>
              <span class="detail__level-value">{{
                formatValue(detail.item.upgrades[userLevel(detail.key)]?.value)
              }}</span>
            </div>
          </div>

          <template v-if="canUpgrade(detail.key, detail.item)">
            <div class="detail__section">
              <div class="detail__label">Следующий уровень</div>
              <div class="detail__level-row">
                <span class="detail__level-num">{{
                  userLevel(detail.key) + 1
                }}</span>
                <span class="detail__sep">—</span>
                <span class="detail__level-value">{{
                  formatValue(
                    detail.item.upgrades[userLevel(detail.key) + 1]?.value
                  )
                }}</span>
              </div>
            </div>

            <div class="detail__section">
              <div class="detail__label">Стоимость</div>
              <div class="cost-rows">
                <div
                  v-for="(cost, name) in upgradeCost(detail.key, detail.item)"
                  :key="name"
                  class="cost-row"
                  :class="{
                    'cost-row--insufficient':
                      (resource[String(name)] || 0) < cost,
                  }"
                >
                  <resource-item
                    :name="String(name)"
                    :count="resource[String(name)] || 0"
                    :highlight_max_count="false"
                  />
                  <span class="cost-row__arrow">→</span>
                  <div class="cost-row__need">
                    <resource-item
                      :name="String(name)"
                      :count="cost"
                      :highlight_max_count="false"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Прокачка пока не подключена — будет добавлено вместе с userUpgrades -->
            <button class="detail__upgrade-btn" disabled>Прокачать</button>
          </template>
          <div v-else class="detail__maxed">Максимальный уровень</div>

          <!-- Роадмап -->
          <div class="detail__roadmap">
            <button
              class="detail__roadmap-toggle"
              @click="showRoadmap = !showRoadmap"
            >
              {{ showRoadmap ? "Скрыть ↑" : "Все уровни ↓" }}
            </button>
            <div v-if="showRoadmap" class="roadmap">
              <div
                v-for="(lvlData, lvlNum) in detail.item.upgrades"
                :key="lvlNum"
                class="roadmap-row"
                :class="{
                  'roadmap-row--done': Number(lvlNum) < userLevel(detail.key),
                  'roadmap-row--current':
                    Number(lvlNum) === userLevel(detail.key),
                  'roadmap-row--future': Number(lvlNum) > userLevel(detail.key),
                }"
              >
                <div class="roadmap-row__marker">
                  <span
                    v-if="Number(lvlNum) < userLevel(detail.key)"
                    class="roadmap-row__dot roadmap-row__dot--done"
                    >✓</span
                  >
                  <span
                    v-else-if="Number(lvlNum) === userLevel(detail.key)"
                    class="roadmap-row__dot roadmap-row__dot--current"
                    >●</span
                  >
                  <span v-else class="roadmap-row__dot roadmap-row__dot--future"
                    >○</span
                  >
                  <span
                    v-if="Number(lvlNum) < maxLevelNum(detail.item)"
                    class="roadmap-row__line"
                  />
                </div>
                <div class="roadmap-row__content">
                  <div class="roadmap-row__header">
                    <span class="roadmap-row__level-label">{{
                      Number(lvlNum) === 0 ? "Базовый" : "Ур. " + lvlNum
                    }}</span>
                    <span class="roadmap-row__value">{{
                      formatValue(lvlData.value)
                    }}</span>
                    <span
                      v-if="Number(lvlNum) === userLevel(detail.key)"
                      class="roadmap-row__badge"
                      >← вы здесь</span
                    >
                  </div>
                  <div v-if="lvlData.next" class="roadmap-row__cost">
                    <resource-list
                      :resources="positiveCost(lvlData.next)"
                      :highlight_max_count="false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="detail__close-btn" @click="closeDetail">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ResourceList from "@/components/ResourceList.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { UpgradeCategory, UpgradeItem } from "@/types/upgrades"

const RESOURCE_ORDER: Record<string, number> = {
  scraps: 0,
  raw_bronze: 1,
  raw_silver: 2,
  raw_gold: 3,
  crops: 4,
  wood: 5,
  silk: 6,
  bronze_ingots: 7,
  silver_ingots: 8,
  gold_ingots: 9,
  money: Infinity,
}

interface DetailState {
  key: string
  item: UpgradeItem
}

export default defineComponent({
  name: "ArenaUpgradesModal",
  components: { ResourceItem, ResourceList },
  emits: ["close"],
  data() {
    return {
      detail: null as DetailState | null,
      showRoadmap: false,
    }
  },
  computed: {
    config(): UpgradeCategory {
      return (
        this.$store.getters["arena_upgrades_config"] ?? {
          title: "",
          upgrades: {},
        }
      )
    },
    sortedUpgrades(): Array<{ key: string; item: UpgradeItem }> {
      return Object.entries(this.config.upgrades)
        .map(([key, item]) => ({ key, item }))
        .sort((a, b) => a.item.ordering - b.item.ordering)
    },
    resource(): Record<string, number> {
      return this.$store.getters["resource"]
    },
  },
  methods: {
    // TODO: подключить userUpgrades["arena"] когда будет готово API
    userLevel(_key: string): number {
      console.log(_key)
      return 0
    },
    totalLevels(item: UpgradeItem): number {
      return Object.keys(item.upgrades).length - 1
    },
    formatValue(value: number | boolean | undefined): string {
      if (value === undefined) return "—"
      if (value === true) return "Открыто"
      if (value === false) return "Закрыто"
      return String(value)
    },
    canUpgrade(key: string, item: UpgradeItem): boolean {
      const level = this.userLevel(key)
      const currentEntry = item.upgrades[level]
      return !!(currentEntry?.next !== null && item.upgrades[level + 1])
    },
    upgradeCost(key: string, item: UpgradeItem): Record<string, number> {
      const level = this.userLevel(key)
      const raw = item.upgrades[level]?.next ?? null
      if (!raw) return {}
      const entries = Object.entries(raw).map(
        ([k, v]) => [k, Math.abs(v)] as [string, number]
      )
      entries.sort(
        (a, b) => (RESOURCE_ORDER[a[0]] ?? 99) - (RESOURCE_ORDER[b[0]] ?? 99)
      )
      return Object.fromEntries(entries)
    },
    positiveCost(next: Record<string, number>): Record<string, number> {
      const entries = Object.entries(next).map(
        ([k, v]) => [k, Math.abs(v)] as [string, number]
      )
      entries.sort(
        (a, b) => (RESOURCE_ORDER[a[0]] ?? 99) - (RESOURCE_ORDER[b[0]] ?? 99)
      )
      return Object.fromEntries(entries)
    },
    maxLevelNum(item: UpgradeItem): number {
      return Math.max(...Object.keys(item.upgrades).map(Number))
    },
    openDetail(key: string, item: UpgradeItem): void {
      this.detail = { key, item }
      this.showRoadmap = false
    },
    closeDetail(): void {
      this.detail = null
      this.showRoadmap = false
    },
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 100;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.modal-panel {
  background: linear-gradient(
    180deg,
    rgba(20, 25, 40, 0.99) 0%,
    rgba(10, 15, 28, 0.99) 100%
  );
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
  border-bottom: 1px solid rgba(196, 144, 0, 0.2);
  flex-shrink: 0;
}

.modal-panel__title {
  font-family: "Philosopher", serif;
  font-size: 1.4rem;
  color: hsl(39, 82%, 62%);
  margin: 0;
}

.modal-panel__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
}

.upgrades-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

/* -- upgrade item (same as UpgradesPage) -- */
.upgrade-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upgrade-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.upgrade-item--dim {
  background: rgba(255, 255, 255, 0.02);
}

.upgrade-item--dim .upgrade-item__title {
  color: rgba(255, 255, 255, 0.4);
}

.upgrade-item--dim .upgrade-item__value {
  color: rgba(255, 255, 255, 0.3);
}

.upgrade-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.upgrade-item__title {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.upgrade-item__value {
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: hsl(39, 82%, 62%);
}

.upgrade-item__bar {
  display: flex;
  gap: 5px;
}

.upgrade-item__segment {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
}

.upgrade-item__segment--active {
  background: var(--primary-gold-gradient, #c49000);
}

/* -- detail modal -- */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail {
  background: linear-gradient(
    180deg,
    rgba(30, 35, 50, 0.98) 0%,
    rgba(15, 20, 35, 0.98) 100%
  );
  border-radius: 16px;
  padding: 24px 20px 20px;
  width: min(340px, 90vw);
  max-height: 82vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(196, 144, 0, 0.3);
}

.detail__title {
  font-family: "Philosopher", serif;
  font-size: 1.3rem;
  color: hsl(39, 82%, 62%);
  text-align: center;
  margin: 0;
}

.detail__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail__label {
  font-family: "Philosopher", serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail__level-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: white;
}

.detail__level-row--dim {
  color: rgba(255, 255, 255, 0.4);
}

.detail__level-num {
  font-weight: bold;
  color: hsl(39, 82%, 62%);
}

.detail__sep {
  color: rgba(255, 255, 255, 0.3);
}

.detail__level-value {
  color: rgba(255, 255, 255, 0.9);
}

.detail__maxed {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.detail__upgrade-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  font-family: "Philosopher", serif;
  font-size: 1rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.detail__close-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: none;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

/* cost rows */
.cost-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cost-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cost-row__arrow {
  font-family: "Philosopher", serif;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.cost-row__need {
  border: 1px solid rgba(196, 144, 0, 0.4);
  border-radius: 8px;
  padding: 4px 8px;
}

.cost-row--insufficient .cost-row__need {
  border-color: rgba(255, 80, 80, 0.5);
}

.cost-row--insufficient .cost-row__need :deep(.resource-count) {
  background: none;
  -webkit-text-fill-color: #ff5555;
  background-clip: unset;
}

/* roadmap */
.detail__roadmap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail__roadmap-toggle {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}

.roadmap {
  display: flex;
  flex-direction: column;
}

.roadmap-row {
  display: flex;
  gap: 10px;
}

.roadmap-row__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.roadmap-row__dot {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.roadmap-row__dot--done {
  color: hsl(39, 60%, 50%);
}

.roadmap-row__dot--current {
  color: hsl(39, 82%, 62%);
  font-size: 1rem;
}

.roadmap-row__dot--future {
  color: rgba(255, 255, 255, 0.2);
}

.roadmap-row__line {
  flex: 1;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 2px 0;
  min-height: 8px;
}

.roadmap-row__content {
  flex: 1;
  padding-bottom: 10px;
}

.roadmap-row__header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.roadmap-row__level-label {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
  font-weight: bold;
}

.roadmap-row--done .roadmap-row__level-label {
  color: rgba(255, 255, 255, 0.45);
}

.roadmap-row--current .roadmap-row__level-label {
  color: hsl(39, 82%, 62%);
}

.roadmap-row--future .roadmap-row__level-label {
  color: rgba(255, 255, 255, 0.6);
}

.roadmap-row__value {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
}

.roadmap-row--done .roadmap-row__value {
  color: rgba(255, 255, 255, 0.35);
}

.roadmap-row--current .roadmap-row__value {
  color: rgba(255, 255, 255, 0.9);
}

.roadmap-row--future .roadmap-row__value {
  color: rgba(255, 255, 255, 0.5);
}

.roadmap-row__badge {
  font-family: "Philosopher", serif;
  font-size: 0.75rem;
  color: hsl(39, 82%, 62%);
  opacity: 0.7;
}

.roadmap-row__cost {
  transform: scale(0.8);
  transform-origin: left center;
  opacity: 0.7;
  margin-top: 2px;
}

.roadmap-row--done .roadmap-row__cost {
  opacity: 0.3;
}
</style>
