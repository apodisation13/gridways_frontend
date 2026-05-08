import { callApi, HttpMethod } from "@/lib/api/api"
import {
  PRODUCTS,
  PURCHASE_PRODUCT,
  PURCHASE_STATUS,
} from "@/store/const/api_urls"
import {
  ActionContext,
  PurchaseProductResponse,
  PurchaseStatusResponse,
  ShopItem,
} from "@/types"

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

  async purchaseProduct(
    { dispatch, getters }: ActionContext,
    productId: number
  ) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<PurchaseProductResponse>({
        method: HttpMethod.POST,
        url: PURCHASE_PRODUCT.replace("{userId}", userId).replace(
          "{productId}",
          productId.toString()
        ),
      })
      return response.data
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Ошибка при загрузке продуктов")
    }
  },

  async checkPurchaseStatus(
    { dispatch, getters }: ActionContext,
    purchaseId: string
  ): Promise<PurchaseStatusResponse> {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<PurchaseStatusResponse>({
        method: HttpMethod.GET,
        url: PURCHASE_STATUS.replace("{userId}", userId).replace(
          "{purchaseId}",
          purchaseId
        ),
      })
      return response.data
    } catch (err) {
      dispatch("error_action", err)
      throw err
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
