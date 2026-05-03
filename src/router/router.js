import { createRouter, createWebHistory } from "vue-router"

import AboutPage from "@/pages/AboutPage"
import BonusPage from "@/pages/BonusPage"
import DeckbuildPage from "@/pages/DeckbuildPage"
import EmblemPage from "@/pages/EmblemPage.vue"
import GamePage from "@/pages/GamePage"
import LeaderboardPage from "@/pages/LeaderboardPage.vue"
import LevelPage from "@/pages/LevelPage"
import LoadingPage from "@/pages/LoadingPage"
import LoginPage from "@/pages/LoginPage"
import LosePage from "@/pages/LosePage"
import MainPage from "@/pages/MainPage"
import RulesPage from "@/pages/RulesPage"
import SettingsPage from "@/pages/SettingsPage"
import StartGame from "@/pages/StartGame"
import StatsPage from "@/pages/StatsPage.vue"
import WinPage from "@/pages/WinPage"
import { images } from "@/router/const/images"
import store from "@/store"

const routes = [
  {
    path: "/",
    component: EmblemPage,
    meta: {
      requireAuth: false,
      notRequireMenu: true,
    },
  },
  {
    path: "/main",
    component: MainPage,
    meta: {
      requireAuth: false,
      image: images.main,
    },
  },
  {
    path: "/loading",
    component: LoadingPage,
    meta: {
      requireAuth: false,
      notRequireMenu: true,
      image: images.loading,
    },
  },
  {
    path: "/login",
    component: LoginPage,
    meta: {
      requireAuth: false,
      image: images.login,
    },
    props: route => ({
      isRegistration: route.query.registration,
    }),
  },
  {
    path: "/start_game",
    component: StartGame,
    meta: {
      requireAuth: true,
      image: images.start_game,
    },
  },
  {
    path: "/game",
    component: GamePage,
    meta: {
      requireAuth: true,
      notRequireMenu: true,
      image: images.field,
    },
  },
  {
    path: "/about",
    component: AboutPage,
    meta: {
      requireAuth: false,
      image: images.work_in_progress,
    },
  },
  {
    path: "/deckbuild",
    component: DeckbuildPage,
    meta: {
      requireAuth: true,
      image: images.deckbuild,
      withGradient: true,
    },
  },
  {
    path: "/levelselect",
    component: LevelPage,
    meta: {
      requireAuth: true,
      image: images.levels,
    },
  },
  {
    path: "/settings",
    component: SettingsPage,
    meta: {
      requireAuth: true,
      image: images.settings,
    },
  },
  {
    path: "/stats",
    component: StatsPage,
    meta: {
      requireAuth: true,
      image: images.settings,
    },
    props: route => ({
      userId: route.query.userId,
    }),
  },
  {
    path: "/leaderboard",
    component: LeaderboardPage,
    meta: {
      requireAuth: true,
      image: images.settings,
    },
  },
  {
    path: "/bonus",
    component: BonusPage,
    meta: {
      requireAuth: true,
      image: images.bonus,
    },
  },
  {
    path: "/rules",
    component: RulesPage,
    meta: {
      requireAuth: false,
      image: images.work_in_progress,
    },
  },
  {
    path: "/win",
    component: WinPage,
    meta: {
      requireAuth: true,
      image: images.win,
    },
  },
  {
    path: "/lose",
    component: LosePage,
    meta: {
      requireAuth: true,
      image: images.lose,
    },
  },
]

const router = createRouter({
  routes,
  mode: "history",
  history: createWebHistory(),
})

router.beforeEach((to, from, next) => {
  // это чтобы стрелкой назад не попасть на страницу загрузки и не зависнуть там
  // ведь мы на неё можем попасть ИЛИ с Эмблемы, ИЛИ с логина
  if (to.path === "/loading" && from.path === "/main") {
    next(false)
    return
  }

  // Если требуется АУФ, и мы залогинены, все ок. Если не залогинены, идем на главную.
  // Если не требуется АУФ - все ок
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (store.getters.isLoggedIn) next()
    else next("/")
  } else next()

  // если мы уже играли и оттуда вышли, переустановим колоду на ту, которой играли
  if (from.path === "/game") store.dispatch("re_set_deck")
})

export default router
