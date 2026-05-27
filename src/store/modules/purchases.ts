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
  pendingPurchaseId: number | null
}

const state: ShopState = {
  products: [],
  pendingPurchaseId: null,
}

const getters = {
  allProducts: (state: ShopState) => state.products,
  pendingPurchaseId: (state: ShopState) => state.pendingPurchaseId,
}

const mutations = {
  setProducts(state: ShopState, products: ShopItem[]) {
    state.products = products
  },
  setPendingPurchaseId(state: ShopState, id: number | null) {
    state.pendingPurchaseId = id
  },
}

const actions = {
  async fetchProducts({ dispatch, commit, getters }: ActionContext) {
    const allProducts = getters.allProducts
    if (allProducts.length > 0) return

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

  async purchaseProduct({ dispatch }: ActionContext, productId: number) {
    try {
      const response = await callApi<PurchaseProductResponse>({
        method: HttpMethod.POST,
        url: PURCHASE_PRODUCT.replace("{productId}", productId.toString()),
      })
      return response.data
    } catch (err) {
      dispatch("error_action", err)
      throw new Error("Ошибка при загрузке продуктов")
    }
  },

  async checkPurchaseStatus(
    { dispatch }: ActionContext,
    purchaseId: string
  ): Promise<PurchaseStatusResponse> {
    try {
      const response = await callApi<PurchaseStatusResponse>({
        method: HttpMethod.GET,
        url: PURCHASE_STATUS.replace("{purchaseId}", purchaseId),
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
