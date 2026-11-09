import { callApi, HttpMethod } from "@/lib/api/api"
import type { RootState } from "@/store"
import { INVENTORY } from "@/store/const/api_urls"
import type {
  ActionContext,
  InventoryEffectValues,
  InventoryItem,
  UserInventory,
} from "@/types"

export interface InventoryState {
  inventory: InventoryItem[]
}

const state: InventoryState = {
  inventory: [],
}

const getters = {
  activeInventory: (
    state: InventoryState,
    _getters: unknown,
    rootState: RootState
  ): InventoryItem[] =>
    rootState.game.arena_mode ? rootState.arena.inventory : state.inventory,

  activeInventorySlots: (
    _state: InventoryState,
    _getters: unknown,
    rootState: RootState,
    rootGetters: { arena_inventory_slots: number }
  ): number =>
    rootState.game.arena_mode
      ? rootGetters.arena_inventory_slots
      : rootState.game.inventory_slots,

  activeInventoryCounts: (
    _state: InventoryState,
    getters: Record<string, any>,
    rootState: RootState
  ): Partial<Record<InventoryItem, number>> =>
    rootState.game.arena_mode
      ? rootState.arena.inventoryCounts
      : getters["resource"],

  inventoryEffectValues: (
    _state: InventoryState,
    _getters: unknown,
    rootState: RootState
  ): Partial<InventoryEffectValues> => {
    if (rootState.game.arena_mode)
      return rootState.arena.arena_params?.inventory_items_values ?? {}
    const game = rootState.game
    return {
      first_aid_kit_heal: game.first_aid_kit_heal,
      shield_armor: game.shield_armor,
      immune_magics_turns: game.immune_magics_turns,
      inventory_cards_drawn: game.inventory_cards_drawn,
      purifies_targets: game.purifies_targets,
      random_effects_turns: game.random_effects_turns,
      random_effects_value: game.random_effects_value,
    }
  },

  inventory: (state: InventoryState) => state.inventory,
}

const mutations = {
  setInventory(state: InventoryState, slots: InventoryItem[]) {
    state.inventory = [...slots]
  },
}

const actions = {
  async updateUserInventory(
    { getters, commit, dispatch }: ActionContext,
    slots: InventoryItem[]
  ) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi<UserInventory>({
        method: HttpMethod.PATCH,
        url: INVENTORY.replace("{userId}", String(userId)),
        data: { slots: [...slots] },
      })
      commit("setInventory", response.data.slots)
    } catch (err) {
      dispatch("error_action", err)
      throw err
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
