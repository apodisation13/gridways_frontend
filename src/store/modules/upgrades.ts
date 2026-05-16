import { callApi, HttpMethod } from "@/lib/api/api"
import { UPGRADES } from "@/store/const/api_urls"
import { ActionContext } from "@/types"
import {
  get_value_from_upgrades,
  UpgradesConfig,
  UpgradesResponse,
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
    const userUpgrades: UserUpgrades = getters["userUpgrades"]
    if (Object.keys(userUpgrades).length > 0) return

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
    { commit, getters, dispatch }: ActionContext,
    {
      upgradeType,
      upgradeSubtype,
    }: { upgradeType: UpgradeType; upgradeSubtype: UpgradeSubtype }
  ) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<UpgradesResponse>({
        method: HttpMethod.POST,
        url: UPGRADES.replace("{userId}", userId),
        data: { upgrade_type: upgradeType, upgrade_subtype: upgradeSubtype },
      })
      commit("setUserUpgrades", response.data.upgrades)
      commit("set_resource", response.data.resources)
      dispatch("syncGameUpgrades")
    } catch (err) {
      console.log(err)
      throw err
    }
  },

  syncGameUpgrades({ commit, getters }: ActionContext) {
    const upgradesConfig: UpgradesConfig = getters["upgradesConfig"]
    const userUpgrades: UserUpgrades = getters["userUpgrades"]
    commit("setUpgradesConst", {
      hand_size: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.HAND_SIZE
      ),
      number_of_cards_in_deck: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_CARDS_IN_DECK
      ),
      max_decks: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_DECKS
      ),
      max_hp: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_HP
      ),
      max_armor: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_ARMOR
      ),
    })
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
