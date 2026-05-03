import axios from "axios"
import { useToast } from "vue-toastification"

import { callApi, HttpMethod } from "@/lib/api/api"
import {
  ALTER_USER_DECK,
  CARD_ACTION,
  CRAFT_BONUS_CARD,
  CREATE_USER_DECK,
  OPEN_RELATED_LEVELS,
  patch_levels,
  USER_RESOURCE,
} from "@/store/const/api_urls"
import type {
  ActionContext,
  CardCraftBonusResponse,
  CardCraftMillResponse,
  CreateDeckRequest,
  ListDecksResponse,
  OpenRelatedLevelsResponse,
  PatchDeckPayload,
  ProcessCraftMillPayload,
  ResourcesPayload,
  UserResources,
} from "@/types"
import { CraftMillCardActionSubtype } from "@/types"

const toast = useToast()

interface UserActionsState {
  cards_resources_prices: Record<string, unknown>
  resources_transitions: Record<string, unknown>
  keys_rewards: Record<string, unknown>
  win_level_rewards: Record<string, unknown>
  start_level_prices: Record<string, unknown>

  win_redirect: boolean
}

const state: UserActionsState = {
  cards_resources_prices: {},
  resources_transitions: {},
  keys_rewards: {},
  win_level_rewards: {},
  start_level_prices: {},

  win_redirect: false,
}

const getters = {
  cards_resources_prices: (state: UserActionsState) =>
    state.cards_resources_prices,
  resources_transitions: (state: UserActionsState) =>
    state.resources_transitions,
  keys_rewards: (state: UserActionsState) => state.keys_rewards,
  win_level_rewards: (state: UserActionsState) => state.win_level_rewards,
  start_level_prices: (state: UserActionsState) => state.start_level_prices,
}

const mutations = {
  set_win_redirect(state: UserActionsState, payload: boolean) {
    state.win_redirect = payload
  },

  set_cards_resources_prices(
    state: UserActionsState,
    cards_resources_prices: Record<string, unknown>
  ) {
    state.cards_resources_prices = cards_resources_prices
  },
  set_resources_transitions(
    state: UserActionsState,
    resources_transitions: Record<string, unknown>
  ) {
    state.resources_transitions = resources_transitions
  },
  set_keys_rewards(
    state: UserActionsState,
    keys_rewards: Record<string, unknown>
  ) {
    state.keys_rewards = keys_rewards
  },
  set_win_level_rewards(
    state: UserActionsState,
    win_level_rewards: Record<string, unknown>
  ) {
    state.win_level_rewards = win_level_rewards
  },
  set_start_level_prices(
    state: UserActionsState,
    start_level_prices: Record<string, unknown>
  ) {
    state.start_level_prices = start_level_prices
  },
}

const actions = {
  async createUserDeck(
    { getters, dispatch, commit }: ActionContext,
    body: CreateDeckRequest
  ) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi<ListDecksResponse>({
        method: HttpMethod.POST,
        url: CREATE_USER_DECK.replace("{userId}", userId),
        data: body as unknown as Record<string, unknown>,
      })
      toast.success("Успешно добавили колоду")
      commit("set_decks", response.data.decks)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при добавлении деки")
    }
  },

  async deleteUserDeck(
    { getters, dispatch, commit }: ActionContext,
    deckId: number
  ) {
    try {
      const userId = getters["getUser"].user_id
      const response = await callApi<ListDecksResponse>({
        method: HttpMethod.DELETE,
        url: ALTER_USER_DECK.replace("{userId}", userId).replace(
          "{deckId}",
          String(deckId)
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

  async patchUserDeck(
    { getters, dispatch, commit }: ActionContext,
    deck: PatchDeckPayload
  ) {
    try {
      const userId = getters["getUser"].user_id
      const { deck_id, ...deck_body } = deck
      const response = await callApi<ListDecksResponse>({
        method: HttpMethod.PATCH,
        url: ALTER_USER_DECK.replace("{userId}", userId).replace(
          "{deckId}",
          String(deck_id)
        ),
        data: deck_body as unknown as Record<string, unknown>,
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

  async processResources(
    { commit, getters, dispatch }: ActionContext,
    body: ResourcesPayload
  ) {
    // в body придет обязательно subtype, data
    // data: { wood: 201, crops: 210 } - для оплаты игры на уровне сезона
    // data: { wood: 201, scraps: 185, etc } - для получения ресурсов после прохождения уровня сезона
    // data: { action:buy/sell/crart/mill, resource: kegs, quantity: int, recipe: {money: -1000, etc} }
    // - для получения и списания ресурсов на странице бонусов
    const userId = getters["getUser"].user_id

    try {
      const response = await callApi<UserResources>({
        method: HttpMethod.PATCH,
        url: USER_RESOURCE.replace("{userId}", userId),
        data: body as unknown as Record<string, unknown>,
      })
      commit("set_resource", response.data)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Какая-то ошибка при менеджменте ресурсов")
    }
  },

  async processCraftMillCard(
    { getters, commit, dispatch }: ActionContext,
    body: ProcessCraftMillPayload
  ) {
    const userId = getters["getUser"].user_id
    const subtype = body.subtype
    try {
      const response = await callApi<CardCraftMillResponse>({
        method: HttpMethod.POST,
        url: CARD_ACTION.replace("{userId}", userId).replace(
          "{cardId}",
          String(body.cardId)
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

  async processCraftBonusCard(
    { getters, commit, dispatch }: ActionContext,
    cardsIds: number[]
  ) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<CardCraftBonusResponse>({
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

  // тестовый экшен, сбрасывает все уровни юзера кроме первого
  async reset_levels({ dispatch, getters }: ActionContext) {
    const header = getters["getHeader"]
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
  async openRelatedLevels(
    { dispatch, getters, commit }: ActionContext,
    userLevelId: number
  ) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<OpenRelatedLevelsResponse>({
        method: HttpMethod.PATCH,
        url: OPEN_RELATED_LEVELS.replace("{userId}", userId).replace(
          "{userLevelId}",
          String(userLevelId)
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
