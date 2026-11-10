import { useToast } from "vue-toastification"
import type { ActionContext } from "vuex"

import { callApi, HttpMethod } from "@/lib/api/api"
import { processAchievementEvents } from "@/logic/achievements/processAchievementEvents"
import type { RootState } from "@/store"
import { USER_ACHIEVEMENTS } from "@/store/const/api_urls"
import type {
  AchievementCatalog,
  AchievementEvent,
  AchievementEventsRequest,
  AchievementEventsResponse,
  AchievementGameConfig,
  AchievementPreview,
  GrantedAchievementReward,
  UserAchievementsProgress,
} from "@/types"

export interface AchievementsState {
  // Описания заданий: условия, цели, награды. Permanent приходит из game_const.
  achievementsConfig: AchievementCatalog
  // Только подтверждённый бэком прогресс. Локальные ходы сюда не прибавляем.
  userAchievements: UserAchievementsProgress
  // Новые события, которые ещё ни разу не отправляли.
  pendingEvents: AchievementEvent[]
  // Уже отправленная пачка, для которой ждём ответ. Повторно её не отправляем.
  inFlightEvents: AchievementEvent[]
  // Награды, о выдаче которых сообщил бэк. Сохраняем для будущей модалки.
  grantedRewards: GrantedAchievementReward[]
  // Пока запрос выполняется, второй не запускаем.
  sending: boolean
  // Номер локальной сессии: помогает отбросить ответ, пришедший после выхода.
  session: number
}

const state: AchievementsState = {
  achievementsConfig: {
    permanent: { title: "Постоянные", categories: {} },
    daily: null,
    weekly: null,
  },
  userAchievements: {},
  pendingEvents: [],
  inFlightEvents: [],
  grantedRewards: [],
  sending: false,
  session: 0,
}

const getters = {
  // Заново считаем от данных бэка + событий, ещё не подтверждённых ответом.
  // Поэтому повторный вызов getter не прибавляет один и тот же ход ещё раз.
  achievementPreview: (state: AchievementsState): AchievementPreview =>
    processAchievementEvents(
      state.achievementsConfig.permanent,
      state.userAchievements,
      [...state.inFlightEvents, ...state.pendingEvents]
    ),

  // Именно этот прогресс показывает страница: ход виден сразу, до ответа бэка.
  localUserAchievements: (
    _state: AchievementsState,
    getters: { achievementPreview: AchievementPreview }
  ): UserAchievementsProgress => getters.achievementPreview.progress,

  achievementsConfig: (state: AchievementsState) => state.achievementsConfig,
}

const mutations = {
  setAchievementSending(state: AchievementsState, sending: boolean) {
    state.sending = sending
  },
  startAchievementBatch(state: AchievementsState) {
    // Забираем всю очередь. Следующие ходы будут копиться уже в новой очереди.
    state.inFlightEvents = state.pendingEvents
    state.pendingEvents = []
  },
  finishAchievementBatch(
    state: AchievementsState,
    response: AchievementEventsResponse
  ) {
    // Бэк уже учёл отправленную пачку: заменяем прогресс и убираем её вместе.
    // Новые pendingEvents оставляем — они ещё не входят в этот ответ.
    state.userAchievements = response.user_achievements
    state.inFlightEvents = []
    state.grantedRewards.push(...response.granted_rewards)
  },
  discardAchievementBatch(state: AchievementsState) {
    // При ошибке теряем только отправленную пачку. Новые события остаются.
    // Предварительный прогресс на странице после этого может уменьшиться.
    state.inFlightEvents = []
  },
  resetAchievementSession(state: AchievementsState) {
    // При входе/выходе не переносим прогресс и очередь между пользователями.
    state.session += 1
    state.userAchievements = {}
    state.pendingEvents = []
    state.inFlightEvents = []
    state.grantedRewards = []
    state.achievementsConfig.daily = null
    state.achievementsConfig.weekly = null
    // sending снимет сам выполняющийся запрос в finally, когда завершится.
  },
  enqueueAchievementEvent(state: AchievementsState, event: AchievementEvent) {
    // Это защита от повторного добавления того же ID в локальную очередь.
    if (!state.pendingEvents.some(pending => pending.id === event.id)) {
      state.pendingEvents.push(event)
    }
  },
  setAchievementsConfig(
    state: AchievementsState,
    catalog: AchievementGameConfig
  ) {
    // Daily и weekly позднее загрузим отдельно; game_const присылает permanent.
    state.achievementsConfig.permanent = catalog.permanent
  },
  setUserAchievements(
    state: AchievementsState,
    progress: UserAchievementsProgress
  ) {
    // Вызывается при загрузке общей базы пользователя через getUserDatabase.
    state.userAchievements = progress
  },
}

const REQUEST_TIMEOUT_MS = 15_000
const toast = useToast()

const actions = {
  // true означает «запрос был запущен», а не «бэк успешно сохранил события».
  // По этому результату планировщик понимает, стоит ли проверить новую очередь.
  async sendAchievementEvents({
    state,
    getters,
    commit,
  }: ActionContext<AchievementsState, RootState>): Promise<boolean> {
    if (state.sending || !getters.isLoggedIn || !state.pendingEvents.length)
      return false
    const userId = getters.getUser.user_id
    if (userId == null) return false

    commit("setAchievementSending", true)
    // Запоминаем сессию до await: пока ждём сеть, пользователь может выйти.
    const batchSession = state.session
    commit("startAchievementBatch")
    const request: AchievementEventsRequest = {
      // Локальные ID на бэк не отправляем: согласовали протокол без повторов.
      events: state.inFlightEvents.map(({ type, data }) => ({ type, data })),
    }

    try {
      const { data } = await callApi<AchievementEventsResponse>({
        method: HttpMethod.POST,
        url: USER_ACHIEVEMENTS.replace("{userId}", String(userId)),
        data: { events: request.events },
        // Несмотря на название, true здесь ЗАПРЕЩАЕТ повтор после 401 в callApi.
        _retry: true,
        timeout: REQUEST_TIMEOUT_MS,
      })
      // Ответ от предыдущей сессии не должен менять данные текущего игрока.
      if (state.session !== batchSession) return true
      commit("finishAchievementBatch", data)
      // null — баланс не меняем. Иначе бэк прислал полный актуальный баланс.
      if (data.user_resources !== null)
        commit("set_resource", data.user_resources)
      if (data.granted_rewards.length) {
        toast.success("Награда за достижения начислена!")
      }
    } catch (error) {
      if (state.session !== batchSession) return true
      // Бэк мог обработать запрос, а ответ потеряться. Повтор дал бы лишний прогресс.
      // Поэтому пачку не возвращаем в очередь даже при сетевой ошибке.
      commit("discardAchievementBatch")
      console.warn(
        "Не удалось синхронизировать достижения; пачка не повторяется",
        error
      )
    } finally {
      commit("setAchievementSending", false)
    }
    return true
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
