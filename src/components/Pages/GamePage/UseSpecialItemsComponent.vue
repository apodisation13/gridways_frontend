<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="stats-row">
        <div class="stat">
          <span class="stat-icon">❤️</span>
          <span class="stat-value">{{ health }} / {{ maxHp }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🛡</span>
          <span class="stat-value">{{ armor }} / {{ maxArmor }}</span>
        </div>
      </div>

      <div class="item-row">
        <resource-item
          name="first_aid_kits"
          :count="firstAidCount"
          show_max_count
        />
        <span class="item-gain">+{{ healValue }} HP</span>
        <button class="use-btn" :disabled="!canUseKit" @click="useKit">
          Использовать
        </button>
      </div>

      <div class="item-row">
        <resource-item name="shields" :count="shieldsCount" show_max_count />
        <span class="item-gain">+{{ armorValue }} броня</span>
        <button class="use-btn" :disabled="!canUseShield" @click="useShield">
          Использовать
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ResourceItem from "@/components/UI/ResourceItem.vue"
import { PayResourcesSubtype } from "@/types"
import {
  get_value_from_upgrades,
  UpgradeSubtype,
  UpgradeType,
} from "@/types/upgrades"

export default defineComponent({
  name: "UseSpecialItemsComponent",
  components: { ResourceItem },
  emits: ["close"],
  computed: {
    health(): number {
      return this.$store.state.game.health
    },
    armor(): number {
      return this.$store.state.game.armor
    },
    maxHp(): number {
      return this.$store.getters["maxHp"]
    },
    maxArmor(): number {
      return this.$store.getters["maxArmor"]
    },
    firstAidCount(): number {
      return (this.$store.getters["resource"].first_aid_kits as number) ?? 0
    },
    shieldsCount(): number {
      return (this.$store.getters["resource"].shields as number) ?? 0
    },
    healValue(): number {
      return get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.FIRST_AID_KIT_HEAL
      )
    },
    armorValue(): number {
      return get_value_from_upgrades(
        this.$store.getters["upgradesConfig"],
        this.$store.getters["userUpgrades"],
        UpgradeType.GAME,
        UpgradeSubtype.SHIELD_ARMOR
      )
    },
    canUseKit(): boolean {
      return this.firstAidCount > 0 && this.health < this.maxHp
    },
    canUseShield(): boolean {
      return (
        this.shieldsCount > 0 && this.maxArmor > 0 && this.armor < this.maxArmor
      )
    },
  },
  methods: {
    async useKit(): Promise<void> {
      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.useFirstAidKit,
        data: { first_aid_kits: -1 },
      })
      this.$store.commit("change_health", this.healValue)
    },
    async useShield(): Promise<void> {
      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.useShields,
        data: { shields: -1 },
      })
      this.$store.commit("change_armor", this.armorValue)
      this.$store.commit("set_armor_delta", this.armorValue)
      setTimeout(() => {
        this.$store.commit("set_armor_delta", null)
      }, 500)
    },
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}

.modal {
  background: linear-gradient(180deg, #1e2834 0%, #0a0b0c 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 24px 20px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Philosopher", serif;
  font-size: 1.05rem;
  font-weight: bold;
  color: #fff;
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-gain {
  flex: 1;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
}

.use-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient, #c49000);
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s,
    color 0.2s;
}

.use-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}
</style>
