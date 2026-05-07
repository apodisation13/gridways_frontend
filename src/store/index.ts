import { createStore } from "vuex"

import database from "@/store/modules/database"
import fullscreen from "@/store/modules/fullscreen"
import type { GameState } from "@/store/modules/game"
import game from "@/store/modules/game"
import login from "@/store/modules/login"
import news from "@/store/modules/news"
import purchases from "@/store/modules/purchases"
import type { SettingsState } from "@/store/modules/settings"
import settings from "@/store/modules/settings"
import statistics from "@/store/modules/statistics"
import user_actions from "@/store/modules/user_actions"

export interface RootState {
  game: GameState
  settings: SettingsState
}

// ИНСТРУКЦИЯ:
// в шаблонах $store. state, getters['name'], commit('name', чё) для мутаций
// в .vue - this.$store. и то же самое
// в .js - ИМПОРТ store отсюда, и тогда store.  а дальше то же

const store = createStore({
  modules: {
    login,
    database,
    game,
    user_actions,
    news,
    purchases,
    settings,
    fullscreen,
    statistics,
  },
  state: {},
  getters: {},
  mutations: {},
  actions: {},
})

export default store as typeof store & { state: RootState }
