import { createStore } from "vuex"
import login from "@/store/modules/login"
import database from "@/store/modules/database"
import game from "@/store/modules/game"
import user_actions from "@/store/modules/user_actions"
import news from "@/store/modules/news"
import settings from "@/store/modules/settings"
import fullscreen from "@/store/modules/fullscreen"

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
    settings,
    fullscreen,
  },
  state: {},
  getters: {},
  mutations: {},
  actions: {},
})

export default store
