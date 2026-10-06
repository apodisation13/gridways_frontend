import type { App } from "vue"

import { tryRefreshToken } from "@/lib/api/api"
import router from "@/router/router"
import store from "@/store"
import { getEnv } from "@/store/const/const"

import { installCollector } from "./collector"
import { getCardContext, readContextFields } from "./context"

export function installFrontendLogs(app: App) {
  const collector = installCollector(app, {
    endpoint: process.env.VUE_APP_DOMAIN_FRONTEND_LOGS ?? "",
    environment: getEnv(),
    getAuth: () => store.getters.getUser,
    refreshToken: async () => {
      const userBeforeRefresh = store.getters.getUser
      const token = await tryRefreshToken()
      // Logout/login replaces the user object; do not save a late token.
      if (store.getters.getUser !== userBeforeRefresh)
        throw new Error("User changed during token refresh")
      if (!token) throw new Error("No access token in refresh response")
      store.commit("updateAccessToken", token)
      return token
    },
    getContext: () => {
      return {
        ...readContextFields({
          route: () => router.currentRoute.value.path,
          mode: () =>
            store.state.multi.room_id
              ? "multiplayer"
              : store.state.game.arena_mode
                ? "arena"
                : "normal",
          level_id: () => store.state.game.level?.id,
          deck_id: () => store.state.game.current_deck_id,
          health: () => store.state.game.health,
          armor: () => store.state.game.armor,
          player_turn: () => store.state.game.player_turn,
          ai_move: () => store.state.game.ai_move,
          ppa_end_turn: () => store.state.game.ppa_end_turn,
          epa_end_turn: () => store.state.game.epa_end_turn,
        }),
        ...getCardContext(),
      }
    },
  })
  store.subscribe(mutation => {
    if (mutation.type === "logOut" || mutation.type === "logIn")
      collector.reset()
  })
}
