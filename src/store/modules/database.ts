import { useToast } from "vue-toastification"
import {
  CARDS_DATABASE,
  GAME_CONST,
  USER_DATABASE,
} from "@/store/const/api_urls"
import { callApi, HttpMethod } from "@/lib/api/api"
import {
  Card,
  CardEntry,
  LeaderEntry,
  Leader,
  Enemy,
  EnemyLeader,
  UserSeason,
  UserResources,
  CardsResponse,
  UserProgressResponse,
  GameConst,
  Faction,
  DeckEntry,
  SeasonEntry,
  Deck,
} from "@/types/database"

const toast = useToast()

interface ActionContext {
  getters: Record<string, any>
  commit: Function
  dispatch: Function
}

interface ApiError {
  error?:
    | string
    | {
        error?: { message?: string }
        detail?: string
      }
}

interface DatabaseState {
  factions: Faction[]
  leaders: LeaderEntry[]
  cards: CardEntry[]
  decks: DeckEntry[]
  seasons: SeasonEntry[]
  resource: UserResources | Record<string, never>

  enemies: Enemy[]
  enemy_leaders: EnemyLeader[]

  cardsdb: Map<number, Card>
  leadersdb: Map<number, Leader>
  enemiesdb: Record<number, Enemy>
  enemyleadersdb: Record<number, EnemyLeader>
}

const state: DatabaseState = {
  factions: [
    { name: "Soldiers" },
    { name: "Monsters" },
    { name: "Animals" },
    { name: "Neutral" },
  ],
  leaders: [],
  cards: [],
  decks: [],
  seasons: [],
  resource: {},

  enemies: [],
  enemy_leaders: [],

  cardsdb: new Map<number, Card>(),
  leadersdb: new Map<number, Leader>(),
  enemiesdb: {},
  enemyleadersdb: {},
}

const getters = {
  all_factions: (state: DatabaseState) => state.factions,
  all_leaders: (state: DatabaseState) => state.leaders,
  all_cards: (state: DatabaseState) => state.cards,
  all_decks: (state: DatabaseState) => state.decks,
  all_seasons: (state: DatabaseState) => state.seasons,
  resource: (state: DatabaseState) => state.resource,

  // TODO: has_passive фильтр — баг, типизация query временно any
  filtered_cards: (state: DatabaseState) => (query: any) => {
    const applyFilter = (data: CardEntry[], query: any) =>
      data.filter(obj =>
        Object.entries(query).every(([prop, find]) => {
          if ("count" === prop) {
            return true
          }
          if ("has_passive" === prop && find === null) {
            return true
          }
          if ("has_passive" === prop) {
            return (obj.card as any)[prop] === find
          }
          if ("newly_added" === prop && find === null) {
            return true
          }
          if ("newly_added" === prop) {
            return obj.card[prop] === find
          }
          if ("faction" === prop) {
            return (
              (obj.card[prop] as string).includes(find as string) ||
              obj.card[prop] === "Neutral"
            )
          }
          return (obj.card[prop as keyof Card] as string).includes(
            find as string
          )
        })
      )
    if (query.count === null) {
      return applyFilter(state.cards, query)
    }

    if (query.count === 0) {
      return applyFilter(
        state.cards.filter(card => card.count === 0),
        query
      )
    }

    return applyFilter(
      state.cards.filter(card => card.count >= query.count),
      query
    )
  },
  filtered_leaders: (state: DatabaseState) => (selected_faction: string) => {
    return state.leaders.filter(leader =>
      leader.card.faction.includes(selected_faction)
    )
  },

  all_enemies: (state: DatabaseState) => state.enemies,
  all_enemies_db: (state: DatabaseState) => state.enemiesdb,
  bronze_enemies: (state: DatabaseState) =>
    state.enemies.filter(e => e.color === "Bronze"),
  silver_enemies: (state: DatabaseState) =>
    state.enemies.filter(e => e.color === "Silver"),
  gold_enemies: (state: DatabaseState) =>
    state.enemies.filter(e => e.color === "Gold"),
  all_enemy_leaders: (state: DatabaseState) => state.enemy_leaders,
}

const mutations = {
  set_resource(state: DatabaseState, result: UserResources) {
    state.resource = result
  },

  set_cardsdb(state: DatabaseState, result: CardsResponse) {
    state.cardsdb = new Map(result.cards.map(card => [card.id, card]))
    state.leadersdb = new Map(result.leaders.map(card => [card.id, card]))
    state.enemiesdb = result.enemies
    state.enemies = Object.values(result.enemies)
    state.enemyleadersdb = result.enemy_leaders
    state.enemy_leaders = Object.values(result.enemy_leaders)
  },

  set_cards(
    state: DatabaseState,
    user_cards: Record<number, { count: number; user_card_id: number }>
  ) {
    state.cards = Array.from(state.cardsdb.values()).map(card => {
      const userCard = user_cards[card.id]
      return {
        card,
        count: userCard ? userCard.count : 0,
        id: userCard ? userCard.user_card_id : null,
      }
    })
  },
  set_leaders(
    state: DatabaseState,
    user_leaders: Record<number, { count: number; user_leader_id: number }>
  ) {
    state.leaders = Array.from(state.leadersdb.values()).map(card => {
      const userLeader = user_leaders[card.id]
      return {
        card,
        count: userLeader ? userLeader.count : 0,
        id: userLeader ? userLeader.user_leader_id : null,
      }
    })
  },
  set_decks(
    state: DatabaseState,
    user_decks: Array<{
      user_deck_id: number
      deck: Deck
    }>
  ) {
    state.decks = user_decks.map(userDeck => ({
      id: userDeck.user_deck_id,
      deck: {
        id: userDeck.deck.id,
        name: userDeck.deck.name,
        leader: state.leadersdb.get(userDeck.deck.leader_id),
        cards: userDeck.deck.cards.map(cardId => ({
          card: state.cardsdb.get(cardId),
          count: 1 as const,
        })),
        health: userDeck.deck.health,
      },
    }))
  },
  set_seasons(state: DatabaseState, user_seasons: UserSeason[]) {
    state.seasons = user_seasons.map(userSeason => ({
      id: userSeason.id,
      finished: userSeason.finished,
      season: {
        ...userSeason.season,
        levels: userSeason.season.levels.map(userLevel => ({
          ...userLevel,
          level: {
            ...userLevel.level,
            enemy_leader: state.enemyleadersdb[userLevel.level.enemy_leader],
            enemies: userLevel.level.enemies.map(
              enemyId => state.enemiesdb[enemyId]
            ),
          },
        })),
      },
      stats: userSeason.stats,
    }))
  },
}

const actions = {
  // TODO: написать
  async getUserDatabase({ commit, getters, dispatch }: ActionContext) {
    const userId = getters["getUser"].user_id

    try {
      const cards_response = await callApi<CardsResponse>({
        method: HttpMethod.GET,
        url: CARDS_DATABASE,
      })
      commit("set_cardsdb", cards_response.data)

      const user_database = await callApi<UserProgressResponse>({
        method: HttpMethod.GET,
        url: USER_DATABASE.replace("{userId}", userId),
      })

      const {
        user_cards,
        user_leaders,
        user_decks,
        user_seasons,
        user_resources,
      } = user_database.data

      commit("set_cards", user_cards)
      commit("set_leaders", user_leaders)
      commit("set_decks", user_decks)
      commit("set_seasons", user_seasons)

      commit("set_season", getters["all_seasons"][0].season)

      commit("set_resource", user_resources)

      dispatch("set_deck_in_play", getters["all_decks"][0])
      dispatch("set_level_in_play", getters["all_seasons"][0].season.levels[0]) // устанавливаем для игры первый уровень

      const game_const_response = await callApi<GameConst>({
        method: HttpMethod.GET,
        url: GAME_CONST,
      })
      const game_const = game_const_response.data
      commit("set_game_const", game_const) // рука, карт в колоде, распределение рандомных врагов
      commit("set_resources_transitions", game_const.resources_transitions) // покупка/продажа ресурсов
      commit("set_keys_rewards", game_const.keys_rewards) // награды за открытие ключей
      commit("set_win_level_rewards", game_const.win_level_rewards) // награды за прохождение уровня
      commit("set_start_level_prices", game_const.start_level_prices) // стоимость игры в уровни
      commit("set_cards_resources_prices", game_const.cards_resources_prices) // крафт/милл карт и лидеров

      toast.success("Успешно загрузили всю вашу базу данных")
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Ошибка загрузки базы данных!")
    }
  },

  error_action(_: ActionContext, err: ApiError) {
    let message = "Неизвестная ошибка"

    if (typeof err.error === "string") {
      // Сетевая ошибка или наше кастомное сообщение
      message = err.error
    } else if (err.error?.error?.message) {
      // Структура от бэка: { error: { code, message, details } }
      message = err.error.error.message
    } else if (err.error?.detail) {
      // FastAPI HTTPException стиль
      message = err.error.detail
    }

    toast.error(`Ошибка при загрузке базы данных: ${message}`)
  },

  async render_all_images({ getters, commit }: ActionContext) {
    const cards: CardEntry[] = getters["all_cards"]
    const leaders: LeaderEntry[] = getters["all_leaders"]
    const enemies: Enemy[] = getters["all_enemies"]
    const enemy_leaders: EnemyLeader[] = getters["all_enemy_leaders"]

    const all_cards = (
      cards as Array<CardEntry | Enemy | EnemyLeader | LeaderEntry>
    )
      .concat(leaders)
      .concat(enemies)
      .concat(enemy_leaders)
    if (all_cards.length === 0) {
      commit("set_images_rendered", true)
      return
    }
    const images = all_cards.map(item => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.src = (item as any).card
          ? (item as any).card.image
          : (item as any).image
        img.onload = () => resolve()
        img.onerror = reject
      })
    })

    Promise.all(images) // TODO: await все решает
      .then(() => {
        console.log("Images loaded!")
        toast.success("Успешно отрендерили картинки")
      })
      .catch(error => {
        console.error("Some image(s) failed loading!")
        console.error(error.message)
      })
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
