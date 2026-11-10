import type {
  AchievementCatalog,
  AchievementGameConfig,
  UserAchievementsProgress,
} from "@/types"

export interface AchievementsState {
  achievementsConfig: AchievementCatalog
  userAchievements: UserAchievementsProgress
}

const state: AchievementsState = {
  achievementsConfig: {
    permanent: { title: "Постоянные", categories: {} },
    daily: null,
    weekly: null,
  },
  userAchievements: {},
}

const getters = {
  achievementsConfig: (state: AchievementsState) => state.achievementsConfig,
  userAchievements: (state: AchievementsState) => state.userAchievements,
}

const mutations = {
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

export default {
  state,
  getters,
  mutations,
}
