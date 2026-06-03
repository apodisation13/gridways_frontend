<template>
  <div class="upgrades-page">
    <div class="title">
      <h1>Прокачка</h1>
    </div>

    <div class="tabs">
      <div class="tabs__slider" :style="sliderStyle"></div>
      <button
        v-for="(cat, catIdx) in sortedCategoryEntries"
        :key="cat.key"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': activeTabIdx === catIdx }"
        @click="activeTabIdx = catIdx"
      >
        {{ cat.data.title }}
      </button>
    </div>

    <div class="upgrades-list">
      <div
        v-for="upgrade in sortedActiveUpgrades"
        :key="upgrade.key"
        class="upgrade-item"
        :class="{
          'upgrade-item--dim': userLevel(activeCategoryKey, upgrade.key) === 0,
        }"
        @click="openModal(activeCategoryKey, upgrade.key, upgrade.item)"
      >
        <div class="upgrade-item__header">
          <span class="upgrade-item__title">{{ upgrade.item.title }}</span>
          <span class="upgrade-item__value">{{
            currentValueLabel(activeCategoryKey, upgrade.key, upgrade.item)
          }}</span>
        </div>
        <div class="upgrade-item__bar">
          <span
            v-for="lvl in totalLevels(upgrade.item)"
            :key="lvl"
            class="upgrade-item__segment"
            :class="{
              'upgrade-item__segment--active':
                lvl <= userLevel(activeCategoryKey, upgrade.key),
              'upgrade-item__segment--affordable':
                lvl === userLevel(activeCategoryKey, upgrade.key) + 1 &&
                canAffordUpgrade(activeCategoryKey, upgrade.key, upgrade.item),
            }"
          />
        </div>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal__title">{{ modal.item.title }}</h2>

        <div class="modal__section">
          <div class="modal__label">Текущий уровень</div>
          <div
            class="modal__level-row"
            :class="{
              'modal__level-row--dim':
                userLevel(modal.category, modal.key) === 0,
            }"
          >
            <span class="modal__level-num">{{
              userLevel(modal.category, modal.key) === 0
                ? "Базовый"
                : userLevel(modal.category, modal.key)
            }}</span>
            <span class="modal__level-sep">—</span>
            <span class="modal__level-value">{{
              formatValue(
                modal.item.upgrades[userLevel(modal.category, modal.key)].value
              )
            }}</span>
          </div>
        </div>

        <template v-if="canUpgrade(modal.category, modal.key, modal.item)">
          <div class="modal__section">
            <div class="modal__label">Следующий уровень</div>
            <div class="modal__level-row">
              <span class="modal__level-num">{{
                userLevel(modal.category, modal.key) + 1
              }}</span>
              <span class="modal__level-sep">—</span>
              <span class="modal__level-value">{{
                formatValue(
                  modal.item.upgrades[userLevel(modal.category, modal.key) + 1]
                    .value
                )
              }}</span>
            </div>
          </div>

          <div class="modal__section">
            <div class="modal__label">Стоимость</div>
            <div class="cost-rows">
              <div
                v-for="(cost, name) in upgradeCost(
                  modal.category,
                  modal.key,
                  modal.item
                )"
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

          <button
            class="modal__upgrade-btn"
            :disabled="upgrading || !canAffordModal"
            @click="showConfirm = true"
          >
            Прокачать
          </button>
          <confirm-modal
            v-if="showConfirm"
            @confirm="handleUpgrade(modal)"
            @close="showConfirm = false"
          >
            <div class="confirm-upgrade-text">
              Прокачать «{{ modal.item.title }}»?
            </div>
          </confirm-modal>
        </template>
        <div v-else class="modal__maxed">Максимальный уровень</div>

        <div class="modal__roadmap">
          <button
            class="modal__roadmap-toggle"
            @click="showRoadmap = !showRoadmap"
          >
            {{ showRoadmap ? "Скрыть ↑" : "Все уровни ↓" }}
          </button>
          <div v-if="showRoadmap" class="roadmap">
            <div
              v-for="(lvlData, lvlNum) in modal.item.upgrades"
              :key="lvlNum"
              class="roadmap-row"
              :class="{
                'roadmap-row--done':
                  Number(lvlNum) < userLevel(modal.category, modal.key),
                'roadmap-row--current':
                  Number(lvlNum) === userLevel(modal.category, modal.key),
                'roadmap-row--future':
                  Number(lvlNum) > userLevel(modal.category, modal.key),
              }"
            >
              <div class="roadmap-row__marker">
                <span
                  v-if="Number(lvlNum) < userLevel(modal.category, modal.key)"
                  class="roadmap-row__dot roadmap-row__dot--done"
                  >✓</span
                >
                <span
                  v-else-if="
                    Number(lvlNum) === userLevel(modal.category, modal.key)
                  "
                  class="roadmap-row__dot roadmap-row__dot--current"
                  >●</span
                >
                <span v-else class="roadmap-row__dot roadmap-row__dot--future"
                  >○</span
                >
                <span
                  v-if="Number(lvlNum) < maxLevelNum(modal.item)"
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
                    v-if="
                      Number(lvlNum) === userLevel(modal.category, modal.key)
                    "
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

        <button class="modal__close-btn" @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import ConfirmModal from "@/components/ModalWindows/ConfirmModal.vue"
import ResourceList from "@/components/ResourceList.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import {
  ModalState,
  UpgradeCategory,
  UpgradeItem,
  UpgradesConfig,
  UpgradeSubtype,
  UpgradeType,
  UserUpgrades,
} from "@/types/upgrades"

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
  flowers: 10,
  money: Infinity,
}

export default defineComponent({
  name: "UpgradesPage",
  components: { ResourceList, ConfirmModal, ResourceItem },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      activeTabIdx: 0,
      modal: null as ModalState | null,
      showRoadmap: false,
      showConfirm: false,
      upgrading: false,
    }
  },
  computed: {
    userUpgrades(): UserUpgrades {
      return this.$store.getters["userUpgrades"]
    },
    upgradesConfig(): UpgradesConfig {
      return this.$store.getters["upgradesConfig"]
    },
    sortedCategoryEntries(): Array<{
      key: UpgradeType
      data: UpgradeCategory
    }> {
      return Object.entries(this.upgradesConfig)
        .map(([key, data]) => ({ key: key as UpgradeType, data }))
        .sort((a, b) => a.data.ordering - b.data.ordering)
    },
    categoryKeys(): UpgradeType[] {
      return this.sortedCategoryEntries.map(c => c.key)
    },
    activeCategoryKey(): UpgradeType {
      return this.categoryKeys[this.activeTabIdx]
    },
    activeCategory(): UpgradeCategory {
      return this.upgradesConfig[this.activeCategoryKey]
    },
    sortedActiveUpgrades(): Array<{ key: UpgradeSubtype; item: UpgradeItem }> {
      return Object.entries(this.activeCategory.upgrades)
        .map(([key, item]) => ({ key: key as UpgradeSubtype, item }))
        .sort((a, b) => a.item.ordering - b.item.ordering)
    },
    sliderStyle(): Record<string, string> {
      return {
        transform: `translateX(${this.activeTabIdx * 100}%)`,
        width: `${100 / this.categoryKeys.length}%`,
      }
    },
    resource(): Record<string, number> {
      return this.$store.getters["resource"]
    },
    canAffordModal(): boolean {
      if (!this.modal) return false
      const cost = this.upgradeCost(
        this.modal.category,
        this.modal.key,
        this.modal.item
      )
      return Object.entries(cost).every(
        ([name, amount]) => (this.resource[name] || 0) >= amount
      )
    },
  },
  async created() {
    await this.$store.dispatch("getUserUpgrades")
  },
  methods: {
    userLevel(category: UpgradeType, key: UpgradeSubtype): number {
      return (this.userUpgrades[category]?.[key] as number) ?? 0
    },
    totalLevels(item: UpgradeItem): number {
      // exclude level 0 (base state) — bar shows upgrade steps only
      return Object.keys(item.upgrades).length - 1
    },
    currentValueLabel(
      category: UpgradeType,
      key: UpgradeSubtype,
      item: UpgradeItem
    ): string {
      const level = this.userLevel(category, key)
      return this.formatValue(item.upgrades[level]?.value)
    },
    formatValue(value: number | boolean | undefined): string {
      if (value === undefined) return "—"
      if (value === true) return "Открыто"
      if (value === false) return "Закрыто"
      return String(value)
    },
    canAffordUpgrade(
      category: UpgradeType,
      key: UpgradeSubtype,
      item: UpgradeItem
    ): boolean {
      const cost = this.upgradeCost(category, key, item)
      if (Object.keys(cost).length === 0) return false
      return Object.entries(cost).every(
        ([name, amount]) => (this.resource[name] || 0) >= amount
      )
    },
    canUpgrade(
      category: UpgradeType,
      key: UpgradeSubtype,
      item: UpgradeItem
    ): boolean {
      const level = this.userLevel(category, key)
      const currentEntry = item.upgrades[level]
      return !!(currentEntry?.next !== null && item.upgrades[level + 1])
    },
    upgradeCost(
      category: UpgradeType,
      key: UpgradeSubtype,
      item: UpgradeItem
    ): Record<string, number> {
      const level = this.userLevel(category, key)
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
    openModal(
      category: UpgradeType,
      key: UpgradeSubtype,
      item: UpgradeItem
    ): void {
      this.modal = { category, key, item }
      this.showRoadmap = false
      this.showConfirm = false
    },
    closeModal(): void {
      this.modal = null
      this.showRoadmap = false
      this.showConfirm = false
    },
    async handleUpgrade(modalState: ModalState): Promise<void> {
      this.upgrading = true
      try {
        await this.$store.dispatch("postUserUpgrade", {
          upgradeType: modalState.category,
          upgradeSubtype: modalState.key,
        })
        this.closeModal()
        this.toast.success("Прокачано!")
      } catch {
        this.toast.error("Ошибка при прокачке")
      } finally {
        this.upgrading = false
      }
    },
  },
})
</script>

<style scoped>
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

.confirm-upgrade-text {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: hsl(39, 82%, 62%);
  margin-bottom: 12px;
  text-align: center;
}

.upgrades-page {
  width: 98%;
  margin: 1%;
  height: 75vh;
  overflow-y: auto;
}

div {
  font-family: "Brush Script MT", cursive;
  font-size: 14pt;
  color: white;
}

.title {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 16px;
}

.title h1 {
  font-family: "Philosopher", serif;
  font-size: 2rem;
  line-height: 2rem;
  color: hsl(39, 82%, 62%);
}

/* Tab selector — same style as BonusPage */
.tabs {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  margin: 0 8px 12px;
  padding: 3px;
}

.tabs__slider {
  position: absolute;
  top: 3px;
  left: 3px;
  height: calc(100% - 6px);
  border-radius: 8px;
  background: var(--primary-gold-gradient, #c49000);
  transition: transform 0.25s ease;
  pointer-events: none;
}

.tabs__btn {
  flex: 1;
  z-index: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;
}

.tabs__btn--active {
  color: #1a1208;
  font-weight: bold;
}

/* Upgrade items list */
.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
}

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

/* Segmented progress bar */
.upgrade-item__bar {
  display: flex;
  gap: 5px;
}

.upgrade-item__segment {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
}

.upgrade-item__segment--active {
  background: var(--primary-gold-gradient, #c49000);
}

.upgrade-item__segment--affordable {
  background: repeating-linear-gradient(
    45deg,
    rgba(100, 220, 100, 0.55) 0px,
    rgba(100, 220, 100, 0.55) 2px,
    rgba(100, 220, 100, 0.15) 2px,
    rgba(100, 220, 100, 0.15) 5px
  );
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
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

.modal__title {
  font-family: "Philosopher", serif;
  font-size: 1.3rem;
  color: hsl(39, 82%, 62%);
  text-align: center;
  margin: 0;
}

.modal__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal__label {
  font-family: "Philosopher", serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__level-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: white;
}

.modal__level-row--dim {
  color: rgba(255, 255, 255, 0.4);
}

.modal__level-num {
  font-weight: bold;
  color: hsl(39, 82%, 62%);
}

.modal__level-sep {
  color: rgba(255, 255, 255, 0.3);
}

.modal__level-value {
  color: rgba(255, 255, 255, 0.9);
}

.modal__maxed {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.modal__upgrade-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient, #c49000);
  font-family: "Philosopher", serif;
  font-size: 1rem;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.modal__upgrade-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.modal__close-btn {
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

/* Roadmap toggle */
.modal__roadmap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal__roadmap-toggle {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: color 0.2s;
}

.modal__roadmap-toggle:active {
  color: rgba(255, 255, 255, 0.7);
}

/* Roadmap rows */
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
  flex-shrink: 0;
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
