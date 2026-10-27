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
      draws_initial: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.REDRAWS_INITIAL
      ),
      draws_after_redraw: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.REDRAWS_DRAWN
      ),
      cards_drawn: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.CARDS_DRAWN
      ),
      max_immune_turns: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_IMMUNE_TURNS
      ),
      max_empty_passes: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.MAX_EMPTY_PASSES
      ),
      full_hand_redraw: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.GAME,
        UpgradeSubtype.FULL_HAND_REDRAW
      ),
      // inventory upgrades
      inventory_slots: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.INVENTORY_SLOTS
      ),
      first_aid_kit_heal: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.FIRST_AID_KIT_HEAL
      ),
      shield_armor: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.SHIELD_ARMOR
      ),
      immune_magics_turns: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.IMMUNE_MAGICS_TURNS
      ),
      inventory_cards_drawn: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.INVENTORY_CARDS_DRAWN
      ),
      purifies_targets: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.PURIFIES_TARGETS
      ),
      random_effects_turns: get_value_from_upgrades(
        upgradesConfig,
        userUpgrades,
        UpgradeType.INVENTORY,
        UpgradeSubtype.RANDOM_EFFECTS_TURNS
      ),
    })

    // Создаем новый объект с теми же ключами
    const upgrades = {} as Record<string, any>

    upgrades["money"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.MONEY
    )
    upgrades["scraps"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.SCRAPS
    )
    upgrades["silk"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.SILK
    )
    upgrades["rare_gem"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.RARE_GEMS
    )
    upgrades["kegs"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.KEGS
    )
    upgrades["big_kegs"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.KEGS
    )
    upgrades["chests"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.KEGS
    )
    upgrades["wood"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.WOOD
    )
    upgrades["crops"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.WOOD
    )
    upgrades["bronze_ingots"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.INGOTS
    )
    upgrades["silver_ingots"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.INGOTS
    )
    upgrades["gold_ingots"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.INGOTS
    )
    upgrades["raw_bronze"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.RAW
    )
    upgrades["raw_silver"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.RAW
    )
    upgrades["raw_gold"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.RAW
    )
    upgrades["flowers"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.RESOURCES,
      UpgradeSubtype.FLOWERS
    )
    // inventory items
    upgrades["first_aid_kits"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.FIRST_AID_KITS
    )
    upgrades["shields"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.SHIELDS
    )
    upgrades["immune_magics"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.IMMUNE_MAGICS
    )
    upgrades["draw_cards"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.DRAW_CARDS
    )
    upgrades["mega_bombs"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.MEGA_BOMBS
    )
    upgrades["random_bombs"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.RANDOM_BOMBS
    )
    upgrades["clears"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.CLEARS
    )
    upgrades["purifies"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.PURIFIES
    )
    upgrades["random_effects"] = get_value_from_upgrades(
      upgradesConfig,
      userUpgrades,
      UpgradeType.INVENTORY,
      UpgradeSubtype.RANDOM_EFFECTS
    )
    commit("setMaxResourcesValues", upgrades)
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
