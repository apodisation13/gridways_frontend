import { callApi, HttpMethod } from "@/lib/api/api"
import { INVENTORY } from "@/store/const/api_urls"
import type { ActionContext, InventoryItem, UserInventory } from "@/types"

export interface InventoryState {
  inventory: InventoryItem[]
}

const state: InventoryState = {
  inventory: [],
}

const getters = {
  inventory: (state: InventoryState) => state.inventory,
}

const mutations = {
  setInventory(state: InventoryState, slots: InventoryItem[]) {
    state.inventory = [...slots]
  },
}

const actions = {
  async getUserInventory({ getters, commit, dispatch }: ActionContext) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<UserInventory>({
        method: HttpMethod.GET,
        url: INVENTORY.replace("{userId}", String(userId)),
      })
      commit("setInventory", response.data.slots)
    } catch (err) {
      dispatch("error_action", err)
      throw err
    }
  },

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
