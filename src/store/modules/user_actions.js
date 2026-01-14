import axios from "axios"
import {
  patch_levels,
  CREATE_USER_DECK,
  ALTER_USER_DECK,
  USER_RESOURCE,
  CARD_ACTION,
} from "@/store/const/api_urls"
import { useToast } from "vue-toastification"
import { callApi, DELETE, PATCH, POST } from "@/lib/api/api"
import { CraftMillCardActionSubtype } from "@/store/const/const"

const toast = useToast()

const state = {
  game_prices: {},

  win_redirect: false,
}

const getters = {
  get_kegs_price: () => {
    return state.game_prices.pay_for_kegs
      ? state.game_prices.pay_for_kegs * -1
      : 0
  },
  get_big_kegs_price: () => {
    return state.game_prices.pay_for_big_kegs
      ? state.game_prices.pay_for_big_kegs * -1
      : 0
  },
  get_chests_price: () => {
    return state.game_prices.pay_for_chests
      ? state.game_prices.pay_for_chests * -1
      : 0
  },
  game_prices: state => state.game_prices,
}

const mutations = {
  // устанавливаем все игровые цены на крафт, милл итп
  set_game_prices(state, payload) {
    state.game_prices = payload
  },

  set_win_redirect(state, payload) {
    state.win_redirect = payload
  },
}

const actions = {
  async createUserDeck({ getters, dispatch, commit }, body) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi({
        method: POST,
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
        method: DELETE,
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
        method: PATCH,
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
    // data: { level_id: level.id } - для оплаты игры на уровне сезона
    // data: { wood: 201, scraps: 185, etc } - для получения ресурсов после прохождения уровня сезона
    // data: { wood: -100 } - для получения и списания ресурсов на странице бонусов
    const userId = getters["getUser"].user_id

    try {
      const response = await callApi({
        method: PATCH,
        url: USER_RESOURCE.replace("{userId}", userId),
        data: body,
      })
      commit("set_resource", response.data)
      return response.data
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при менеджменте ресурсов")
    }
  },

  calculateCraftMillCardValue({ state }, obj) {
    // процесс крафта: по цвету, или если цвета нет, то крафтим лидера значит
    if (obj.process === "craft") {
      if (obj.card.color === "Bronze") return state.game_prices.craft_bronze
      else if (obj.card.color === "Silver")
        return state.game_prices.craft_silver
      else if (obj.card.color === "Gold") return state.game_prices.craft_gold
      else return state.game_prices.craft_leader
    }
    // процесс милла: по цвету, или лидера, но нельзя если count = 0, или стартовый набор
    if (obj.process === "mill") {
      // нельзя: если карт 0, или если карт 1 и при этом она в стартовом наборе (unlocked, то есть)
      if (obj.count === 0 || (obj.count === 1 && obj.card.unlocked)) {
        toast.warning(
          "Нельзя размиллить карту из стартового набора (или карту которой у вас и так нет, ха-ха)"
        )
        return
      }
      if (obj.card.color === "Bronze") return state.game_prices.mill_bronze
      else if (obj.card.color === "Silver") return state.game_prices.mill_silver
      else if (obj.card.color === "Gold") return state.game_prices.mill_gold
      else return state.game_prices.mill_leader
    }
  },

  async processCraftMillCard({ getters, commit, dispatch }, body) {
    let userId = getters["getUser"].user_id
    const subtype = body.subtype
    try {
      const response = await callApi({
        method: POST,
        url: CARD_ACTION.replace("{userId}", userId).replace(
          "{cardId}",
          body.cardId
        ),
        data: { subtype: subtype },
      })
      toast.success("Успешно создали карту")

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
  // возвращает полный список уровней ДАННОГО СЕЗОНА
  async open_new_levels({ dispatch, getters, commit }, data) {
    let header = getters["getHeader"]
    let url = `${patch_levels}${data.finished_user_level_id}/`

    try {
      const response = await axios.patch(
        url,
        {
          finished_level: data.finished_level,
          related_levels: data.related_levels,
          season_id: data.season_id,
        },
        header
      )
      commit("set_updated_season", {
        levels: response.data.levels,
        index: data.seasonIndex,
      })
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
