import { defineComponent } from "vue"

import { choice_pop } from "@/lib/utils"
import { sound_destroy_enemy } from "@/logic/play_sounds"
import { remove_effects } from "@/logic/player_move/abilities/ability_effects"
import { purify } from "@/logic/player_move/abilities/ability_purify"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { spawn_random_positive_effects_everywhere } from "@/logic/player_move/passive_abilities/passives_card/effects"
import { spawn_random_in_hand } from "@/logic/player_move/passive_abilities/passives_card/spawn_random_in_hand"
import { check_win } from "@/logic/player_move/service/check_win"
import {
  get_all_enemies,
  get_negative_effects_indexes,
} from "@/logic/player_move/service/service_for_player_move"
import {
  type CardEntry,
  type EffectInfo,
  type Enemy,
  type EnemyLeader,
  InventoryItem,
  PayResourcesSubtype,
} from "@/types"

export default defineComponent({
  data() {
    return { inventoryBusy: false }
  },
  computed: {
    inventoryEnemyTargets(): (Enemy | EnemyLeader)[] {
      return get_all_enemies(
        this.gameObj.field,
        this.gameObj.enemy_leader
      ).filter(enemy => enemy.data.hp > 0)
    },
    inventoryPurifyTargets(): (Enemy | EnemyLeader)[] {
      return this.inventoryEnemyTargets.filter(
        enemy =>
          enemy.data.shield ||
          enemy.data.status ||
          enemy.passive_ability?.name ||
          enemy.deathwish?.name
      )
    },
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
      if (
        !this.gameObj.leader ||
        this.gameObj.hand.length >= getters["handSize"] ||
        getters["inventoryCardsDrawn"] <= 0 ||
        !(getters["all_cards"] as CardEntry[]).some(
          entry => entry.card.faction === this.gameObj.leader.faction
        )
      )
        items.push(InventoryItem.DRAW_CARDS)
      if (!this.inventoryEnemyTargets.length)
        items.push(InventoryItem.MEGA_BOMBS, InventoryItem.RANDOM_BOMBS)
      if (!get_negative_effects_indexes(this.gameObj.effects).length)
        items.push(InventoryItem.CLEARS)
      if (
        getters["purifiesTargets"] <= 0 ||
        !this.inventoryPurifyTargets.length
      )
        items.push(InventoryItem.PURIFIES)
      if (
        getters["randomEffectsTurns"] <= 0 ||
        !this.gameObj.field.length ||
        !Object.values(
          getters["effectsInfo"] as Record<string, EffectInfo>
        ).some(info => !info.negative)
      )
        items.push(InventoryItem.RANDOM_EFFECTS)
      return items
    },
  },
  methods: {
    // Мультиплеер переопределяет этот хук для отправки состояния напарнику.
    afterInventoryItemApplied(): void {},
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
      const value = this.inventoryItemValues[item] ?? 0
      const randomEffectsValue = getters["randomEffectsValue"]
      this.inventoryBusy = true
      try {
        await this.$store.dispatch("processResources", {
          subtype: PayResourcesSubtype.useInventoryItem,
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
        } else if (item === InventoryItem.DRAW_CARDS) {
          const count = Math.min(
            value,
            getters["handSize"] - this.gameObj.hand.length
          )
          for (let i = 0; i < count; i++)
            spawn_random_in_hand(null, this.gameObj)
        } else if (
          item === InventoryItem.MEGA_BOMBS ||
          item === InventoryItem.RANDOM_BOMBS
        ) {
          const enemies = [...this.inventoryEnemyTargets]
          const targets =
            item === InventoryItem.MEGA_BOMBS
              ? enemies
              : enemies.length
                ? [choice_pop(enemies)]
                : []
          const timeout = Number(getters["selectedMoveTimeout"]) || 500
          if (targets.length) sound_destroy_enemy()
          targets.forEach(enemy =>
            enemy_takes_damage(
              enemy,
              { data: { damage: enemy.data.hp } },
              this.gameObj,
              timeout
            )
          )
          // Дожидаемся удаления погибших и завещаний до передачи хода/синхронизации.
          await new Promise(resolve => setTimeout(resolve, timeout + 100))
          check_win(
            this.gameObj.field,
            this.gameObj.enemies,
            this.gameObj.enemy_leader,
            this.gameObj.enemies_grave
          )
        } else if (item === InventoryItem.CLEARS) {
          remove_effects(this.gameObj)
        } else if (item === InventoryItem.PURIFIES) {
          const targets = [...this.inventoryPurifyTargets]
          const count = Math.min(value, targets.length)
          for (let i = 0; i < count; i++) purify(choice_pop(targets))
        } else if (item === InventoryItem.RANDOM_EFFECTS) {
          spawn_random_positive_effects_everywhere(
            this.gameObj,
            value,
            randomEffectsValue
          )
        }
        this.can_draw = this.calc_can_draw()
        this.afterInventoryItemApplied()
      } catch {
        // processResources уже показывает ошибку; эффект не применяем.
      } finally {
        this.inventoryBusy = false
      }
    },
  },
})
