import { callApi, GET, POST } from "@/lib/api/api"
import {
  USER_LEADERBOARD,
  USER_STATS,
  WORLD_LEADERBOARD,
} from "@/store/const/api_urls"
// import { useToast } from "vue-toastification"
//
// const toast = useToast()

const state = {
  userStats: {},
  cardsStats: {},
  leaderStats: {},
  levelsStats: {},
  seasonsStats: {},

  userLeaderboard: [],
  worldLeaderboard: [],
}

const getters = {
  userStats: state => state.userStats,
  cardsStats: state => state.cardsStats,
  leaderStats: state => state.leaderStats,
  levelsStats: state => state.levelsStats,
  seasonsStats: state => state.seasonsStats,

  userLeaderboard: state => state.userLeaderboard,
  worldLeaderboard: state => state.worldLeaderboard,
}

const mutations = {
  setStats(state, payload) {
    state.userStats = payload.stats
    state.cardsStats = payload.cards
    state.leaderStats = payload.leaders
    state.seasonsStats = payload.seasons
    state.levelsStats = payload.levels
  },
  setLeaderboard(state, payload) {
    state.userLeaderboard = payload
  },
  setWorldLeaderboard(state, payload) {
    state.worldLeaderboard = payload
  },
}

const actions = {
  async getUserStatistic({ getters, commit }, for_user) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: GET,
        url: USER_STATS.replace("{userId}", userId),
        params: for_user ? { for_user: for_user } : null,
      })
      commit("setStats", response.data)
    } catch (err) {
      console.log(err)
    }
  },
  async postUserStatistic({ getters }, { user_deck_id, type }) {
    const userId = getters["getUser"].user_id
    try {
      await callApi({
        method: POST,
        url: USER_STATS.replace("{userId}", userId),
        data: { user_deck_id: user_deck_id, type: type },
      })
    } catch (err) {
      console.log(err)
    }
  },
  async getUserLeaderboard({ getters, commit }) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: GET,
        url: USER_LEADERBOARD.replace("{userId}", userId),
      })
      commit("setLeaderboard", response.data)
    } catch (err) {
      console.log(err)
    }
  },
  async getWorldLeaderboard({ getters, commit }) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: GET,
        url: WORLD_LEADERBOARD.replace("{userId}", userId),
      })
      commit("setWorldLeaderboard", response.data)
    } catch (err) {
      console.log(err)
    }
  },
  async postUserLeaderboard({ getters }, { user_deck_id, mode, max_kills }) {
    const userId = getters["getUser"].user_id
    try {
      await callApi({
        method: POST,
        url: USER_LEADERBOARD.replace("{userId}", userId),
        data: {
          user_deck_id: user_deck_id,
          max_kills: max_kills,
          mode: mode,
        },
      })
    } catch (err) {
      console.log(err)
    }
  },
  // async updateUserPreferences({ getters }) {
  //   const userId = getters["getUser"].user_id
  //   const body = {
  //     data: {
  //       sound_on: getters.soundOn,
  //       animation_on: getters.animationOn,
  //       move_timeout: getters.selectedMoveTimeout,
  //       avatar: getters.selectedAvatar,
  //       theme: getters.selectedTheme,
  //     },
  //   }
  //   try {
  //     await callApi({
  //       method: PATCH,
  //       url: USER_PREFERENCES.replace("{userId}", userId),
  //       data: body,
  //     })
  //     toast.success("Успешно записали ваши настройки")
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
