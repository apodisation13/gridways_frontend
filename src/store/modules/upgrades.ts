import { callApi, HttpMethod } from "@/lib/api/api"
import { UPGRADES } from "@/store/const/api_urls"
import { ActionContext } from "@/types"
import {
  UpgradesConfig,
  UpgradeSubtype,
  UpgradeType,
  UserUpgrades,
} from "@/types/upgrades"

interface UpgradesState {
  upgrades: UpgradesConfig
  userUpgrades: UserUpgrades
}

const state: UpgradesState = {
  upgrades: {},
  userUpgrades: {},
}

const getters = {
  upgradesConfig: (state: UpgradesState) => state.upgrades,
  userUpgrades: (state: UpgradesState) => state.userUpgrades,
}

const mutations = {
  setUpgrades(state: UpgradesState, payload: UpgradesConfig) {
    state.upgrades = payload
  },
  setUserUpgrades(state: UpgradesState, payload: UserUpgrades) {
    state.userUpgrades = payload
  },
}

const actions = {
  async getUserUpgrades({ commit, getters }: ActionContext) {
    const userId = getters["getUser"].user_id
    try {
      const upgrades = await callApi<UserUpgrades>({
        method: HttpMethod.GET,
        url: UPGRADES.replace("{userId}", userId),
      })
      commit("setUserUpgrades", upgrades)
    } catch (err) {
      console.log(err)
    }
  },

  async postUserUpgrade(
    { getters }: ActionContext,
    {
      upgradeType,
      upgradeSubtype,
    }: { upgradeType: UpgradeType; upgradeSubtype: UpgradeSubtype }
  ) {
    const userId = getters["getUser"].user_id
    try {
      await callApi({
        method: HttpMethod.POST,
        url: UPGRADES.replace("{userId}", userId),
        data: { upgradeType, upgradeSubtype },
      })
    } catch (err) {
      console.log(err)
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
