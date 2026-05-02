import { callApi, HttpMethod } from "@/lib/api/api"
import { LIST_NEWS } from "@/store/const/api_urls"
import { ActionContext, NewsItem } from "@/types"

interface NewsState {
  news: NewsItem[] | null
}

const state: NewsState = {
  news: [],
}

const getters = {
  allNews: (state: NewsState) => state.news,
}

const mutations = {
  setNews(state: NewsState, news: NewsItem[]) {
    state.news = news
  },
}

const actions = {
  async fetchNews({ dispatch, commit }: ActionContext) {
    try {
      const response = await callApi<NewsItem[]>({
        method: HttpMethod.GET,
        url: LIST_NEWS,
      })
      commit("setNews", response.data)
    } catch (err) {
      dispatch("error_action", err)
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
