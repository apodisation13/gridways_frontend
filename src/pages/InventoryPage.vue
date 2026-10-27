<template>
  <main class="inventory-page">
    <h1>Инвентарь</h1>
    <div class="slots-grid">
      <div
        v-for="index in maxSlots"
        :key="index"
        class="slot"
        :class="{ 'slot--locked': index > unlockedSlots }"
      >
        <template v-if="index > unlockedSlots">
          <span aria-hidden="true">🔒</span>
          <span class="slot-caption">Закрыт</span>
        </template>
        <inventory-item-tile
          v-else-if="draftSlots[index - 1]"
          :name="draftSlots[index - 1]"
          :label="`Убрать ${draftSlots[index - 1]} из слота ${index}`"
          :count="count(draftSlots[index - 1])"
          :description="description(draftSlots[index - 1])"
          :busy="saving"
          @activate="removeItem(index - 1)"
          @describe="descriptionItem = draftSlots[index - 1]"
        />
        <template v-else>
          <span class="empty-slot-mark" aria-hidden="true">＋</span>
          <span class="slot-caption">Свободный слот</span>
        </template>
      </div>
    </div>
    <h2>Предметы</h2>
    <div class="items-grid">
      <inventory-item-tile
        v-for="item in availableItems"
        :key="item"
        :name="item"
        :label="`Добавить ${item} в инвентарь`"
        :count="count(item)"
        :description="description(item)"
        :busy="saving"
        @activate="addItem(item)"
        @describe="descriptionItem = item"
      />
    </div>
    <button
      class="save-btn"
      :disabled="saving || !hasChanges"
      @click="saveInventory"
    >
      {{ saving ? "Сохраняем…" : "Сохранить слоты" }}
    </button>
    <resource-description-modal
      v-if="descriptionItem && description(descriptionItem)"
      :name="descriptionItem"
      :count="count(descriptionItem)"
      :description="description(descriptionItem)"
      @close="descriptionItem = null"
    />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import ResourceDescriptionModal from "@/components/Pages/BonusPage/ResourceDescriptionModal.vue"
import InventoryItemTile from "@/components/Pages/InventoryPage/InventoryItemTile.vue"
import { InventoryItem, type ResourceActions } from "@/types"
import {
  type UpgradesConfig,
  UpgradeSubtype,
  UpgradeType,
} from "@/types/upgrades"

export default defineComponent({
  components: { InventoryItemTile, ResourceDescriptionModal },
  data() {
    return {
      draftSlots: [] as InventoryItem[],
      savedSlots: [] as InventoryItem[],
      descriptionItem: null as InventoryItem | null,
      saving: false,
    }
  },
  computed: {
    unlockedSlots(): number {
      return Math.max(
        0,
        Math.floor(Number(this.$store.getters["inventorySlots"]) || 0)
      )
    },
    maxSlots(): number {
      const config = this.$store.getters["upgradesConfig"] as UpgradesConfig
      const levels =
        config[UpgradeType.INVENTORY]?.upgrades[UpgradeSubtype.INVENTORY_SLOTS]
          ?.upgrades ?? {}
      return Math.max(
        this.unlockedSlots,
        ...Object.values(levels).map(level =>
          Math.max(0, Math.floor(level.value))
        )
      )
    },
    availableItems(): InventoryItem[] {
      return Object.values(InventoryItem)
        .filter(item => !this.draftSlots.includes(item))
        .sort((a, b) => this.count(b) - this.count(a))
    },
    hasChanges(): boolean {
      return JSON.stringify(this.draftSlots) !== JSON.stringify(this.savedSlots)
    },
  },
  created() {
    this.acceptInventory()
  },
  methods: {
    count(item: InventoryItem): number {
      return this.$store.getters["resource"][item] ?? 0
    },
    description(item: InventoryItem): string {
      const actions = this.$store.getters["resources_transitions"] as Record<
        string,
        ResourceActions
      >
      return actions[item]?.description ?? ""
    },
    acceptInventory(): void {
      this.savedSlots = [...this.$store.getters["inventory"]]
      this.draftSlots = [...this.savedSlots]
    },
    addItem(item: InventoryItem): void {
      if (
        this.saving ||
        this.count(item) <= 0 ||
        this.draftSlots.includes(item)
      )
        return
      if (this.draftSlots.length >= this.unlockedSlots) {
        useToast().info("Все открытые слоты заняты.")
        return
      }
      this.draftSlots.push(item)
    },
    removeItem(index: number): void {
      if (!this.saving) this.draftSlots.splice(index, 1)
    },
    async saveInventory(): Promise<void> {
      if (this.saving || !this.hasChanges) return
      this.saving = true
      try {
        await this.$store.dispatch("updateUserInventory", [...this.draftSlots])
        this.acceptInventory()
        useToast().success("Слоты инвентаря сохранены")
      } catch {
        // Действие стора показывает ошибку; оставляем выбор для повторного сохранения.
      } finally {
        this.saving = false
      }
    },
  },
})
</script>

<style scoped>
.inventory-page {
  box-sizing: border-box;
  width: min(100%, 600px);
  height: 75vh;
  margin: 0 auto;
  padding: 14px 16px 24px;
  overflow-y: auto;
  color: white;
  font-family: "Brush Script MT", cursive;
  font-size: 14pt;
}
h1,
h2 {
  font-family: "Philosopher", serif;
  text-align: center;
  color: hsl(39, 82%, 62%);
}
h1 {
  font-size: 2rem;
  line-height: 2rem;
  margin: 0 0 16px;
}
h2 {
  font-size: 22px;
  margin: 24px 0 12px;
}
.slots-grid,
.items-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 72px));
  justify-content: center;
  gap: 6px;
}
.slot {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px solid #edc16d;
  border-radius: 12px;
  background:
    radial-gradient(ellipse at top, rgba(255, 218, 130, 0.3), transparent 75%),
    linear-gradient(145deg, #795124, #493019);
  box-shadow:
    inset 0 0 16px rgba(255, 204, 108, 0.12),
    0 3px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.slot :deep(.item-tile) {
  flex: 1;
  border: none;
  border-radius: 0;
  background:
    radial-gradient(ellipse at top, rgba(131, 238, 195, 0.25), transparent 75%),
    linear-gradient(145deg, #285e4b, #183c34);
  box-shadow: none;
}
.slot--locked {
  color: #939393;
  border: 2px dashed #555555;
  background:
    repeating-linear-gradient(
      135deg,
      transparent 0 8px,
      rgba(180, 180, 180, 0.03) 8px 10px
    ),
    linear-gradient(145deg, #303030, #202020);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35);
}
.slot--locked > span:first-child {
  font-size: 28px;
  filter: grayscale(1);
  opacity: 0.55;
}
.slot-caption {
  font-family: "Philosopher", serif;
  box-sizing: border-box;
  width: 100%;
  padding: 0 4px;
  text-align: center;
  line-height: 1.2;
  font-size: 10px;
  color: inherit;
}
.empty-slot-mark {
  font-size: 28px;
  color: #ffe4a5;
  text-shadow: 0 0 12px rgba(255, 205, 107, 0.5);
}
.save-btn {
  display: block;
  width: 100%;
  margin-top: 22px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient);
  color: #1a1208;
  font:
    bold 18px "Philosopher",
    serif;
  cursor: pointer;
}
.save-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
