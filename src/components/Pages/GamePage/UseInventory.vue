<template>
  <Teleport to="body">
    <Transition name="inventory-popup" appear>
      <div
        v-if="visible"
        v-show="!showPinned"
        class="modal-overlay"
        @click.self="$emit('close')"
      >
        <section
          class="inventory-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Инвентарь"
        >
          <button-close-img
            class="close-icon"
            role="button"
            tabindex="0"
            aria-label="Закрыть инвентарь"
            @handle_close="$emit('close')"
            @keydown.enter.prevent="$emit('close')"
            @keydown.space.prevent="$emit('close')"
          />
          <button
            type="button"
            class="pinned-button"
            :aria-label="`Закреплённые задания: ${pinnedCount} из ${pinnedLimit}`"
            :title="`Закреплённые задания: ${pinnedCount} / ${pinnedLimit}`"
            @click="showPinned = true"
          >
            <span class="pin-icon" aria-hidden="true" />
          </button>
          <h2 class="modal-title">Инвентарь</h2>
          <dl class="turn-stats">
            <div>
              <dt>Размер руки</dt>
              <dd>{{ handCount }} / {{ $store.getters["handSize"] }}</dd>
            </div>
            <div>
              <dt>Пустой пас</dt>
              <dd>
                {{ emptyPassesRemaining }} /
                {{ $store.getters["maxEmptyPasses"] }}
              </dd>
            </div>
            <div>
              <dt>Редро с полной рукой</dt>
              <dd>
                {{ fullHandRedrawsRemaining }} /
                {{ $store.getters["fullHandRedraw"] }}
              </dd>
            </div>
          </dl>
          <div class="stats-row">
            <span
              >❤️ {{ $store.getters["health"] }} /
              {{ $store.getters["maxHp"] }}</span
            >
            <span
              >🛡 {{ $store.getters["armor"] }} /
              {{ $store.getters["maxArmor"] }}</span
            >
            <span
              >✨ {{ $store.getters["invulnerability"] }} /
              {{ $store.getters["maxImmuneTurns"] }}</span
            >
          </div>
          <div class="slots-grid">
            <div
              v-for="(item, index) in slots"
              :key="index"
              class="inventory-slot"
              :class="{ 'inventory-slot--available': item && canUse(item) }"
            >
              <template v-if="item">
                <inventory-item-tile
                  :name="item"
                  :label="`Использовать ${item}`"
                  :count="count(item)"
                  :description="description(item)"
                  :busy="busy"
                  :unavailable="!canUse(item)"
                  @activate="requestUse(item)"
                  @describe="descriptionItem = item"
                />
                <span v-if="effectLabel(item)" class="effect-value">{{
                  effectLabel(item)
                }}</span>
              </template>
              <div v-else class="empty-slot" aria-label="Пустой слот">—</div>
            </div>
          </div>
          <p v-if="!playerTurn" class="hint">
            Предметы доступны только на своём ходу
          </p>
        </section>
      </div>
    </Transition>
    <pinned-achievements-modal
      v-if="visible && showPinned"
      @close="showPinned = false"
    />
    <resource-description-modal
      v-if="visible && descriptionItem && description(descriptionItem)"
      :name="descriptionItem"
      :count="count(descriptionItem)"
      :description="description(descriptionItem)"
      @close="descriptionItem = null"
    />
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import PinnedAchievementsModal from "@/components/Pages/AchievementsPage/PinnedAchievementsModal.vue"
import ResourceDescriptionModal from "@/components/Pages/BonusPage/ResourceDescriptionModal.vue"
import InventoryItemTile from "@/components/Pages/InventoryPage/InventoryItemTile.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"
import { MAX_PINNED_ACHIEVEMENTS } from "@/store/modules/achievements"
import { InventoryItem, type ResourceActions } from "@/types"

export default defineComponent({
  name: "UseInventory",
  components: {
    ButtonCloseImg,
    InventoryItemTile,
    ResourceDescriptionModal,
    PinnedAchievementsModal,
  },
  props: {
    handCount: { type: Number, required: true },
    emptyPassesRemaining: { type: Number, required: true },
    fullHandRedrawsRemaining: { type: Number, required: true },
    visible: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    itemValues: {
      type: Object as PropType<Partial<Record<InventoryItem, number>>>,
      required: true,
    },
    unavailableItems: {
      type: Array as PropType<InventoryItem[]>,
      default: () => [],
    },
  },
  emits: ["close", "use-item"],
  data() {
    return {
      descriptionItem: null as InventoryItem | null,
      showPinned: false,
      pinnedLimit: MAX_PINNED_ACHIEVEMENTS,
    }
  },
  computed: {
    pinnedCount(): number {
      return this.$store.state.achievements.pinnedAchievements.length
    },
    playerTurn(): boolean {
      return this.$store.state.game.player_turn
    },
    slots(): (InventoryItem | null)[] {
      const inventory = this.$store.getters[
        "activeInventory"
      ] as InventoryItem[]
      const count = Math.max(
        0,
        Math.floor(this.$store.getters["activeInventorySlots"])
      )
      return Array.from(
        { length: count },
        (_, index) => inventory[index] ?? null
      )
    },
  },
  watch: {
    visible(value: boolean) {
      if (!value) {
        this.descriptionItem = null
        this.showPinned = false
      }
    },
  },
  methods: {
    count(item: InventoryItem): number {
      return this.$store.getters["activeInventoryCounts"][item] ?? 0
    },
    description(item: InventoryItem): string {
      const actions = this.$store.getters["resources_transitions"] as Record<
        string,
        ResourceActions
      >
      return actions[item]?.description ?? ""
    },
    canUse(item: InventoryItem): boolean {
      return (
        this.playerTurn &&
        !this.busy &&
        this.count(item) > 0 &&
        !this.unavailableItems.includes(item)
      )
    },
    requestUse(item: InventoryItem): void {
      if (this.canUse(item)) this.$emit("use-item", item)
    },
    effectLabel(item: InventoryItem): string {
      const value = this.itemValues[item] ?? 0
      switch (item) {
        case InventoryItem.FIRST_AID_KITS:
          return `+${value} HP`
        case InventoryItem.SHIELDS:
          return `+${value} брони`
        case InventoryItem.IMMUNE_MAGICS:
          return `Ходов: ${value}`
        case InventoryItem.DRAW_CARDS:
          return `Карт: ${value}`
        case InventoryItem.PURIFIES:
          return `Целей: ${value}`
        case InventoryItem.RANDOM_EFFECTS:
          return `Ходов: ${value}\nСила: ${this.$store.getters["inventoryEffectValues"].random_effects_value ?? 0}`
        default:
          return ""
      }
    },
  },
})
</script>

<style scoped>
/* Тот же меч, который используется для урона на картах. */
.pin-icon {
  display: inline-block;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: url("@/assets/icons/card/sword.svg") center / contain no-repeat;
}

.pinned-button {
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #facf5d;
  cursor: pointer;
}
.pinned-button:focus-visible {
  outline: 2px solid #c5a87e;
}

.modal-overlay {
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}
.inventory-modal {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 393px);
  max-height: calc(var(--vh, 1vh) * 80);
  overflow-y: auto;
  padding: 20px 14px;
  border: 1px solid #c5a87e;
  border-radius: 16px;
  background: linear-gradient(180deg, #1e2834, #0a0b0c);
  color: white;
  font-family: "Philosopher", serif;
}
.close-icon {
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.06);
}
.close-icon:focus-visible {
  outline: 2px solid #c5a87e;
}
.modal-title {
  margin: 0 28px;
  text-align: center;
  font-family: "Philosopher", serif;
  font-size: 20px;
  color: #edc379;
}
.turn-stats {
  margin-top: 18px;
}
.turn-stats > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
}
.turn-stats dt,
.turn-stats dd {
  font-family: "Philosopher", serif;
  font-size: 15px;
}
.turn-stats dd {
  flex-shrink: 0;
  margin: 0;
  color: #edc379;
  font-variant-numeric: tabular-nums;
}
.inventory-slot--available :deep(.item-tile) {
  border-color: #80bd94;
  background:
    radial-gradient(ellipse at top, rgba(131, 238, 195, 0.25), transparent 75%),
    linear-gradient(145deg, #285e4b, #183c34);
}
.inventory-popup-enter-active,
.inventory-popup-leave-active {
  transition: opacity 180ms ease;
}
.inventory-popup-enter-active .inventory-modal,
.inventory-popup-leave-active .inventory-modal {
  transition: transform 180ms ease;
}
.inventory-popup-enter-from,
.inventory-popup-leave-to {
  opacity: 0;
}
.inventory-popup-enter-from .inventory-modal,
.inventory-popup-leave-to .inventory-modal {
  transform: translateY(10px) scale(0.96);
}
@media (prefers-reduced-motion: reduce) {
  .inventory-popup-enter-active,
  .inventory-popup-leave-active,
  .inventory-popup-enter-active .inventory-modal,
  .inventory-popup-leave-active .inventory-modal {
    transition: none;
  }
}
.stats-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin: 16px 0 20px;
  font-size: 15px;
}
.slots-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.inventory-slot {
  min-width: 0;
  text-align: center;
}
.effect-value {
  display: block;
  white-space: pre-line;
  margin-top: 6px;
  font-size: 12px;
  color: #b9ead2;
}
.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  box-sizing: border-box;
  border: 1px dashed #746953;
  border-radius: 10px;
  color: #8c8375;
  background: rgba(255, 215, 0, 0.04);
}
.hint {
  margin: 18px 0 0;
  text-align: center;
  font-size: 13px;
  color: #c5bba9;
}
</style>
