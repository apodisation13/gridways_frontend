import { useToast } from "vue-toastification"

import type {
  ActionContext,
  CardEntry,
  Enemy,
  EnemyLeader,
  LeaderEntry,
} from "@/types"

const toast = useToast()

export interface LoadingState {
  imagesTotal: number
  imagesLoaded: number
  imagesFailed: number
}

const state: LoadingState = {
  imagesTotal: 0,
  imagesLoaded: 0,
  imagesFailed: 0,
}

const getters = {
  imageLoadingProgress: (state: LoadingState) => ({
    total: state.imagesTotal,
    loaded: state.imagesLoaded,
    failed: state.imagesFailed,
    percent:
      state.imagesTotal === 0
        ? 0
        : Math.round(
            ((state.imagesLoaded + state.imagesFailed) / state.imagesTotal) *
              100
          ),
  }),
}

const mutations = {
  startImageLoading(state: LoadingState, total: number) {
    state.imagesTotal = total
    state.imagesLoaded = 0
    state.imagesFailed = 0
  },
  completeImageLoading(state: LoadingState, success: boolean) {
    if (success) state.imagesLoaded += 1
    else state.imagesFailed += 1
  },
}

const actions = {
  async render_all_images({ getters, commit }: ActionContext) {
    const cards: CardEntry[] = getters["all_cards"]
    const leaders: LeaderEntry[] = getters["all_leaders"]
    const enemies: Enemy[] = getters["all_enemies"]
    const enemyLeaders: EnemyLeader[] = getters["all_enemy_leaders"]
    const items: Array<CardEntry | LeaderEntry | Enemy | EnemyLeader> = [
      ...cards,
      ...leaders,
      ...enemies,
      ...enemyLeaders,
    ]

    commit("startImageLoading", items.length)
    if (items.length === 0) return

    await Promise.all(
      items.map(
        item =>
          new Promise<void>(resolve => {
            const image = new Image()
            image.onload = () => {
              commit("completeImageLoading", true)
              resolve()
            }
            image.onerror = () => {
              commit("completeImageLoading", false)
              resolve()
            }
            image.src = (item as any).card
              ? (item as any).card.image
              : (item as any).image
          })
      )
    )

    const { failed } = getters["imageLoadingProgress"]
    if (failed > 0) {
      toast.warning(`Не удалось загрузить изображений: ${failed}`)
    } else {
      toast.success("Успешно отрендерили картинки")
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
