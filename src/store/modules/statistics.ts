import { callApi, HttpMethod } from "@/lib/api/api"
import {
  USER_LEADERBOARD,
  USER_STATS,
  WORLD_LEADERBOARD,
} from "@/store/const/api_urls"
import {
  ActionContext,
  CollectionStats,
  FactionStats,
  GameStatsRecordType,
  LeaderboardEntry,
  LeaderboardGameMode,
  ProgressStats,
  UserStatistics,
} from "@/types"

interface StatisticsState {
  userStats: Record<string, FactionStats>
  cardsStats: CollectionStats
  leaderStats: CollectionStats
  levelsStats: ProgressStats
  seasonsStats: ProgressStats
  userLeaderboard: LeaderboardEntry[]
  worldLeaderboard: LeaderboardEntry[]
}

const state: StatisticsState = {
  userStats: {},
  cardsStats: { total: 0, open: 0 },
  leaderStats: { total: 0, open: 0 },
  levelsStats: { total: 0, finished: 0 },
  seasonsStats: { total: 0, finished: 0 },
  userLeaderboard: [],
  worldLeaderboard: [],
}

const getters = {
  userStats: (state: StatisticsState) => state.userStats,
  cardsStats: (state: StatisticsState) => state.cardsStats,
  leaderStats: (state: StatisticsState) => state.leaderStats,
  levelsStats: (state: StatisticsState) => state.levelsStats,
  seasonsStats: (state: StatisticsState) => state.seasonsStats,
  userLeaderboard: (state: StatisticsState) => state.userLeaderboard,
  worldLeaderboard: (state: StatisticsState) => state.worldLeaderboard,
}

const mutations = {
  setStats(state: StatisticsState, payload: UserStatistics) {
    state.userStats = payload.stats
    state.cardsStats = payload.cards
    state.leaderStats = payload.leaders
    state.seasonsStats = payload.seasons
    state.levelsStats = payload.levels
  },
  setLeaderboard(state: StatisticsState, payload: LeaderboardEntry[]) {
    state.userLeaderboard = payload
  },
  setWorldLeaderboard(state: StatisticsState, payload: LeaderboardEntry[]) {
    state.worldLeaderboard = payload
  },
}

const actions = {
  async getUserStatistic(
    { getters, commit }: ActionContext,
    for_user?: number
  ) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<UserStatistics>({
        method: HttpMethod.GET,
        url: USER_STATS.replace("{userId}", userId),
        params: for_user ? { for_user } : null,
      })
      commit("setStats", response.data)
    } catch (err) {
      console.log(err)
    }
  },

  async postUserStatistic(
    { getters }: ActionContext,
    { user_deck_id, type }: { user_deck_id: number; type: GameStatsRecordType }
  ) {
    const userId = getters["getUser"].user_id
    try {
      await callApi({
        method: HttpMethod.POST,
        url: USER_STATS.replace("{userId}", userId),
        data: { user_deck_id, type },
      })
    } catch (err) {
      console.log(err)
    }
  },

  async getUserLeaderboard({ getters, commit }: ActionContext) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<LeaderboardEntry[]>({
        method: HttpMethod.GET,
        url: USER_LEADERBOARD.replace("{userId}", userId),
      })
      commit("setLeaderboard", response.data)
    } catch (err) {
      console.log(err)
    }
  },

  async getWorldLeaderboard({ getters, commit }: ActionContext) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<LeaderboardEntry[]>({
        method: HttpMethod.GET,
        url: WORLD_LEADERBOARD.replace("{userId}", userId),
      })
      commit("setWorldLeaderboard", response.data)
    } catch (err) {
      console.log(err)
    }
  },

  async postUserLeaderboard(
    { getters }: ActionContext,
    {
      user_deck_id,
      mode,
      max_kills,
    }: { user_deck_id: number; mode: LeaderboardGameMode; max_kills: number }
  ) {
    const userId = getters["getUser"].user_id
    try {
      await callApi({
        method: HttpMethod.POST,
        url: USER_LEADERBOARD.replace("{userId}", userId),
        data: { user_deck_id, max_kills, mode },
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
