import { LIST_NEWS } from "@/store/const/api_urls"
import { callApi, GET } from "@/lib/api/api"

const state = {
  news: null,
}

const getters = {
  allNews: state => state.news,
}

const mutations = {
  /**
   * Обновляет список новостей в хранилище Vuex
   * @param {Object} state - Состояние Vuex хранилища модуля новостей
   * @param {Array} news - Массив объектов новостей
   * @property {number} news[].id - id новости
   * @property {string} news[].title - Заголовок новости
   * @property {string} news[].text - Текст новости
   * @property {string} news[].updated_at - Дата обновления ("2026-01-04T09:17:19.146495Z")
   */
  setNews(state, news) {
    state.news = news
  },
}

const actions = {
  async fetchNews({ commit }) {
    try {
      const response = await callApi({
        method: GET,
        url: LIST_NEWS,
      })
      commit("setNews", response.data)
    } catch (err) {
      console.error("Ошибка при загрузке новостей:", err)
      throw new Error("Ошибка при загрузке новостей")
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
