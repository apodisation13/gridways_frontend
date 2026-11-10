import { useToast } from "vue-toastification"
import type { ActionContext } from "vuex"

import { callApi, HttpMethod } from "@/lib/api/api"
import { processAchievementEvents } from "@/logic/achievements/processAchievementEvents"
import type { RootState } from "@/store"
import { USER_ACHIEVEMENTS } from "@/store/const/api_urls"
import type {
  AchievementCatalog,
  AchievementEvent,
  AchievementEventsRequest,
  AchievementEventsResponse,
  AchievementGameConfig,
  AchievementPreview,
  GrantedAchievementReward,
  UserAchievementsProgress,
} from "@/types"

export interface AchievementsState {
  achievementsConfig: AchievementCatalog
  userAchievements: UserAchievementsProgress
  pendingEvents: AchievementEvent[]
  inFlightEvents: AchievementEvent[]
  grantedRewards: GrantedAchievementReward[]
  sending: boolean
  session: number
}

const state: AchievementsState = {
  achievementsConfig: {
    permanent: { title: "Постоянные", categories: {} },
    daily: null,
    weekly: null,
  },
  userAchievements: {},
  pendingEvents: [],
  inFlightEvents: [],
  grantedRewards: [],
  sending: false,
  session: 0,
}

const getters = {
  achievementPreview: (state: AchievementsState): AchievementPreview =>
    processAchievementEvents(
      state.achievementsConfig.permanent,
      state.userAchievements,
      [...state.inFlightEvents, ...state.pendingEvents]
    ),
  localUserAchievements: (
    _state: AchievementsState,
    getters: { achievementPreview: AchievementPreview }
  ): UserAchievementsProgress => getters.achievementPreview.progress,
  achievementsConfig: (state: AchievementsState) => state.achievementsConfig,
}

const mutations = {
  setAchievementSending(state: AchievementsState, sending: boolean) {
    state.sending = sending
  },
  startAchievementBatch(state: AchievementsState) {
    state.inFlightEvents = state.pendingEvents
    state.pendingEvents = []
  },
  finishAchievementBatch(
    state: AchievementsState,
    response: AchievementEventsResponse
  ) {
    state.userAchievements = response.user_achievements
    state.inFlightEvents = []
    state.grantedRewards.push(...response.granted_rewards)
  },
  discardAchievementBatch(state: AchievementsState) {
    state.inFlightEvents = []
  },
  resetAchievementSession(state: AchievementsState) {
    state.session += 1
    state.userAchievements = {}
    state.pendingEvents = []
    state.inFlightEvents = []
    state.grantedRewards = []
    state.achievementsConfig.daily = null
    state.achievementsConfig.weekly = null
  },
  enqueueAchievementEvent(state: AchievementsState, event: AchievementEvent) {
    if (!state.pendingEvents.some(pending => pending.id === event.id)) {
      state.pendingEvents.push(event)
    }
  },
  setAchievementsConfig(
    state: AchievementsState,
    catalog: AchievementGameConfig
  ) {
    state.achievementsConfig.permanent = catalog.permanent
  },
  setUserAchievements(
    state: AchievementsState,
    progress: UserAchievementsProgress
  ) {
    state.userAchievements = progress
  },
}

const REQUEST_TIMEOUT_MS = 15_000
const toast = useToast()

const actions = {
  async sendAchievementEvents({
    state,
    getters,
    commit,
  }: ActionContext<AchievementsState, RootState>): Promise<boolean> {
    if (state.sending || !getters.isLoggedIn || !state.pendingEvents.length)
      return false
    const userId = getters.getUser.user_id
    if (userId == null) return false

    commit("setAchievementSending", true)
    const batchSession = state.session
    commit("startAchievementBatch")
    const request: AchievementEventsRequest = {
      events: state.inFlightEvents.map(({ type, data }) => ({ type, data })),
    }

    try {
      const { data } = await callApi<AchievementEventsResponse>({
        method: HttpMethod.POST,
        url: USER_ACHIEVEMENTS.replace("{userId}", String(userId)),
        data: { events: request.events },
        // Do not replay this batch, including after token refresh.
        _retry: true,
        timeout: REQUEST_TIMEOUT_MS,
      })
      if (state.session !== batchSession) return true
      commit("finishAchievementBatch", data)
      if (data.user_resources !== null)
        commit("set_resource", data.user_resources)
      if (data.granted_rewards.length) {
        toast.success("Награда за достижения начислена!")
      }
    } catch (error) {
      if (state.session !== batchSession) return true
      // The server may already have processed it; never requeue this batch.
      commit("discardAchievementBatch")
      console.warn(
        "Не удалось синхронизировать достижения; пачка не повторяется",
        error
      )
    } finally {
      commit("setAchievementSending", false)
    }
    return true
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
