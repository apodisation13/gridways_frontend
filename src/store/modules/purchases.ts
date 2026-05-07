import { callApi, HttpMethod } from "@/lib/api/api"
import { PRODUCTS } from "@/store/const/api_urls"
import { ActionContext, ShopItem } from "@/types"

interface ShopState {
  products: ShopItem[] | null
}

const state: ShopState = {
  products: [],
}

const getters = {
  allProducts: (state: ShopState) => state.products,
}

const mutations = {
  setProducts(state: ShopState, products: ShopItem[]) {
    state.products = products
  },
}

const actions = {
  async fetchProducts({ dispatch, commit, getters }: ActionContext) {
    const allProducts = getters.allProducts
    if (!allProducts) return
    try {
      const response = await callApi<ShopItem[]>({
        method: HttpMethod.GET,
        url: PRODUCTS,
      })
      commit("setProducts", response.data)
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Ошибка при загрузке продуктов")
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
