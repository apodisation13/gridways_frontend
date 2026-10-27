import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import { InventoryItem, PayResourcesSubtype } from "@/types"

export default defineComponent({
  data() {
    return { inventoryBusy: false }
  },
  computed: {
    inventoryItemValues(): Partial<Record<InventoryItem, number>> {
      const game = this.$store.state.game
      return {
        [InventoryItem.FIRST_AID_KITS]: game.first_aid_kit_heal,
        [InventoryItem.SHIELDS]: game.shield_armor,
        [InventoryItem.IMMUNE_MAGICS]: game.immune_magics_turns,
        [InventoryItem.DRAW_CARDS]: this.$store.getters["inventoryCardsDrawn"],
        [InventoryItem.PURIFIES]: this.$store.getters["purifiesTargets"],
        [InventoryItem.RANDOM_EFFECTS]:
          this.$store.getters["randomEffectsTurns"],
      }
    },
    unavailableInventoryItems(): InventoryItem[] {
      const game = this.$store.state.game
      const getters = this.$store.getters
      const items: InventoryItem[] = []
      if (game.health >= getters["maxHp"] || game.first_aid_kit_heal <= 0)
        items.push(InventoryItem.FIRST_AID_KITS)
      if (game.armor >= getters["maxArmor"] || game.shield_armor <= 0)
        items.push(InventoryItem.SHIELDS)
      if (
        game.invulnerability >= getters["maxImmuneTurns"] ||
        game.immune_magics_turns <= 0
      )
        items.push(InventoryItem.IMMUNE_MAGICS)
      return items
    },
  },
  methods: {
    async useInventoryItem(item: InventoryItem): Promise<void> {
      const getters = this.$store.getters
      const slots = (getters["inventory"] as InventoryItem[]).slice(
        0,
        getters["inventorySlots"]
      )
      if (
        this.inventoryBusy ||
        !this.$store.state.game.player_turn ||
        !slots.includes(item) ||
        !(getters["resource"][item] > 0) ||
        this.unavailableInventoryItems.includes(item)
      )
        return
      const subtypes: Partial<Record<InventoryItem, PayResourcesSubtype>> = {
        [InventoryItem.FIRST_AID_KITS]: PayResourcesSubtype.useFirstAidKit,
        [InventoryItem.SHIELDS]: PayResourcesSubtype.useShields,
        [InventoryItem.IMMUNE_MAGICS]: PayResourcesSubtype.useImmuneMagics,
      }
      const subtype = subtypes[item]
      if (!subtype) {
        useToast().info("Применение этого предмета пока не добавлено.")
        return
      }
      const value = this.inventoryItemValues[item] ?? 0
      this.inventoryBusy = true
      try {
        await this.$store.dispatch("processResources", {
          subtype,
          data: { [item]: -1 },
        })
        if (item === InventoryItem.FIRST_AID_KITS)
          this.$store.commit("change_health", value)
        else if (item === InventoryItem.SHIELDS) {
          this.$store.commit("change_armor", value)
          this.$store.commit("set_armor_delta", value)
          setTimeout(() => this.$store.commit("set_armor_delta", null), 500)
        } else if (item === InventoryItem.IMMUNE_MAGICS) {
          this.$store.commit(
            "set_invulnerability",
            this.$store.state.game.invulnerability + value
          )
        }
      } catch {
        // processResources уже показывает ошибку; эффект не применяем.
      } finally {
        this.inventoryBusy = false
      }
    },
  },
})
