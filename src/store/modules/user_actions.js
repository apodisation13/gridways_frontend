import axios from "axios"
import {
  patch_levels,
  CREATE_USER_DECK,
  ALTER_USER_DECK,
  USER_RESOURCE,
  CARD_ACTION,
  OPEN_RELATED_LEVELS,
  CRAFT_BONUS_CARD,
} from "@/store/const/api_urls"
import { useToast } from "vue-toastification"
import { callApi, HttpMethod } from "@/lib/api/api"
import { CraftMillCardActionSubtype } from "@/store/const/const"

const toast = useToast()

const state = {
  cards_resources_prices: {},
  resources_transitions: {},
  keys_rewards: {},
  win_level_rewards: {},
  start_level_prices: {},

  win_redirect: false,
}

const getters = {
  cards_resources_prices: state => state.cards_resources_prices,
  resources_transitions: state => state.resources_transitions,
  keys_rewards: state => state.keys_rewards,
  win_level_rewards: state => state.win_level_rewards,
  start_level_prices: state => state.start_level_prices,
}

const mutations = {
  set_win_redirect(state, payload) {
    state.win_redirect = payload
  },

  set_cards_resources_prices(state, cards_resources_prices) {
    state.cards_resources_prices = cards_resources_prices
  },
  set_resources_transitions(state, resources_transitions) {
    state.resources_transitions = resources_transitions
  },
  set_keys_rewards(state, keys_rewards) {
    state.keys_rewards = keys_rewards
  },
  set_win_level_rewards(state, win_level_rewards) {
    state.win_level_rewards = win_level_rewards
  },
  set_start_level_prices(state, start_level_prices) {
    state.start_level_prices = start_level_prices
  },
}

const actions = {
  async createUserDeck({ getters, dispatch, commit }, body) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi({
        method: HttpMethod.POST,
        url: CREATE_USER_DECK.replace("{userId}", userId),
        data: body,
      })
      toast.success("Успешно добавили колоду")
      commit("set_decks", response.data.decks)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при добавлении деки")
    }
  },

  async deleteUserDeck({ getters, dispatch, commit }, deckId) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi({
        method: HttpMethod.DELETE,
        url: ALTER_USER_DECK.replace("{userId}", userId).replace(
          "{deckId}",
          deckId
        ),
        data: {},
      })
      toast.success("Успешно удалили колоду")
      commit("set_decks", response.data.decks)
      // после удаления колоды, устанавливаем базовую деку для игры (вдруг мы удалили ту которая была)
      dispatch("set_deck_in_play")
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при удалении деки")
    }
  },

  async patchUserDeck({ getters, dispatch, commit }, deck) {
    try {
      const userId = getters["getUser"].user_id
      const { deck_id, ...deck_body } = deck
      const response = await callApi({
        method: HttpMethod.PATCH,
        url: ALTER_USER_DECK.replace("{userId}", userId).replace(
          "{deckId}",
          deck_id
        ),
        data: deck_body,
      })
      toast.success("Успешно изменили колоду")
      commit("set_decks", response.data.decks)
      // после изменения колоды тоже, устанавливаем базовую деку для игры (вдруг мы изменили ту, которая уже была)
      dispatch("set_deck_in_play")
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при изменении деки")
    }
  },

  async processResources({ commit, getters, dispatch }, body) {
    // в body придет обязательно subtype, data
    // data: { wood: 201, crops: 210 } - для оплаты игры на уровне сезона
    // data: { wood: 201, scraps: 185, etc } - для получения ресурсов после прохождения уровня сезона
    // data: { action:buy/sell/crart/mill, resource: kegs, quantity: int, recipe: {money: -1000, etc} }
    // - для получения и списания ресурсов на странице бонусов
    const userId = getters["getUser"].user_id

    try {
      const response = await callApi({
        method: HttpMethod.PATCH,
        url: USER_RESOURCE.replace("{userId}", userId),
        data: body,
      })
      commit("set_resource", response.data)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при менеджменте ресурсов")
    }
  },

  async processCraftMillCard({ getters, commit, dispatch }, body) {
    let userId = getters["getUser"].user_id
    const subtype = body.subtype
    try {
      const response = await callApi({
        method: HttpMethod.POST,
        url: CARD_ACTION.replace("{userId}", userId).replace(
          "{cardId}",
          body.cardId
        ),
        data: { subtype: subtype, recipe: body.recipe },
      })
      const msg =
        subtype === CraftMillCardActionSubtype.craftCard ||
        subtype === CraftMillCardActionSubtype.craftLeader
          ? "Успешно создали карту"
          : "Успешно уничтожили карту"
      toast.success(msg)

      commit("set_resource", response.data.resources)
      if (
        subtype === CraftMillCardActionSubtype.craftCard ||
        subtype === CraftMillCardActionSubtype.millCard
      ) {
        commit("set_cards", response.data.cards)
      } else if (
        subtype === CraftMillCardActionSubtype.craftLeader ||
        subtype === CraftMillCardActionSubtype.millLeader
      ) {
        commit("set_leaders", response.data.cards)
      }
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при создании карты")
    }
  },

  async processCraftBonusCard({ getters, commit, dispatch }, cardsIds) {
    let userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: HttpMethod.POST,
        url: CRAFT_BONUS_CARD.replace("{userId}", userId),
        data: { cards_ids: cardsIds },
      })
      toast.success("Успешно добавили карту")
      commit("set_cards", response.data.cards)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при создании карты")
    }
  },

  // тестоввый экшен, сбрасывает все уровни юзера кроме первого
  async reset_levels({ dispatch, getters }) {
    let header = getters["getHeader"]
    // нужно присылать id записи UserLevel (то есть первого уровня), у которой поставить finished=False
    // const user_level_id = getters["all_levels"][0].id
    let url = `${patch_levels}1/`

    try {
      const response = await axios.patch(url, null, header)
      return response.data
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при сбрасывании уровней")
    }
  },

  // открывает related_levels для текущего, а текущему ставит finished,
  // возвращает полный список всех сезонов
  async openRelatedLevels({ dispatch, getters, commit }, userLevelId) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: HttpMethod.PATCH,
        url: OPEN_RELATED_LEVELS.replace("{userId}", userId).replace(
          "{userLevelId}",
          userLevelId
        ),
        data: {},
      })
      const seasons = response.data.seasons
      commit("set_seasons", seasons)
      commit("set_season", getters["all_seasons"][0].season)
      dispatch("set_level_in_play", getters["all_seasons"][0].season.levels[0])
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при открытии уровней")
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
