import { v4 as uuidv4 } from "uuid"
import { useToast } from "vue-toastification"
import type { ActionContext } from "vuex"

import { callApi, HttpMethod } from "@/lib/api/api"
import {
  checkCurrentResources,
  previewCurrentResources,
} from "@/logic/achievements/currentResources"
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
  AchievementRewardNotification,
  PinnedAchievement,
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
  // Очередь уведомлений: удаляем запись после закрытия соответствующего тоста.
  grantedRewards: AchievementRewardNotification[]
  // Пока запрос выполняется, второй не запускаем.
  sending: boolean
  // Номер локальной сессии: помогает отбросить ответ, пришедший после выхода.
  session: number
  // Только память приложения: после перезагрузки или выхода список пустой.
  pinnedAchievements: PinnedAchievement[]
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
  pinnedAchievements: [],
}

export const MAX_PINNED_ACHIEVEMENTS = 5

function findPinnedDefinition(
  state: AchievementsState,
  pin: PinnedAchievement
) {
  return Object.values(state.achievementsConfig[pin.section].categories)
    .flatMap(category => Object.values(category.achievements))
    .find(definition => definition.id === pin.id)
}

function canKeepPin(state: AchievementsState, pin: PinnedAchievement): boolean {
  const progress = state.userAchievements.permanent?.[pin.id]
  return (
    Boolean(findPinnedDefinition(state, pin)) &&
    !progress?.completed_at &&
    !progress?.reward_granted_at
  )
}

function prunePins(state: AchievementsState) {
  // Только подтверждение бэка снимает закрепление. Локальные 10/10 ещё ждут ответа.
  state.pinnedAchievements = state.pinnedAchievements.filter(pin =>
    canKeepPin(state, pin)
  )
}

const getters = {
  pinnedAchievementEntries: (state: AchievementsState) =>
    state.pinnedAchievements.flatMap(pin => {
      const definition = findPinnedDefinition(state, pin)
      return definition ? [{ ...pin, definition }] : []
    }),
  // Заново считаем от данных бэка + событий, ещё не подтверждённых ответом.
  // Поэтому повторный вызов getter не прибавляет один и тот же ход ещё раз.
  achievementPreview: (
    state: AchievementsState,
    getters: { resource: Record<string, number> }
  ): AchievementPreview => {
    const preview = processAchievementEvents(
      state.achievementsConfig.permanent,
      state.userAchievements,
      [...state.inFlightEvents, ...state.pendingEvents]
    )
    const current = previewCurrentResources(
      state.achievementsConfig.permanent,
      preview.progress,
      getters.resource
    )
    return {
      progress: current.progress,
      reachedAchievementIds: [
        ...new Set([
          ...preview.reachedAchievementIds,
          ...current.reachedAchievementIds,
        ]),
      ],
    }
  },

  // Именно этот прогресс показывает страница: ход виден сразу, до ответа бэка.
  localUserAchievements: (
    _state: AchievementsState,
    getters: { achievementPreview: AchievementPreview }
  ): UserAchievementsProgress => getters.achievementPreview.progress,

  achievementsConfig: (state: AchievementsState) => state.achievementsConfig,
}

const mutations = {
  dismissAchievementReward(state: AchievementsState, notificationId: string) {
    state.grantedRewards = state.grantedRewards.filter(
      reward => reward.notification_id !== notificationId
    )
  },
  toggleAchievementPin(state: AchievementsState, pin: PinnedAchievement) {
    const index = state.pinnedAchievements.findIndex(
      item => item.section === pin.section && item.id === pin.id
    )
    if (index >= 0) {
      state.pinnedAchievements.splice(index, 1)
    } else if (
      canKeepPin(state, pin) &&
      state.pinnedAchievements.length < MAX_PINNED_ACHIEVEMENTS
    ) {
      state.pinnedAchievements.push({ ...pin })
    }
  },
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
    prunePins(state)
    state.inFlightEvents = []
    for (const reward of response.granted_rewards) {
      const section = state.achievementsConfig[reward.period_type]
      const definition = Object.values(section?.categories ?? {})
        .flatMap(category => Object.values(category.achievements))
        .find(item => item.id === reward.achievement_id)
      state.grantedRewards.push({
        ...reward,
        notification_id: uuidv4(),
        title: definition?.title ?? reward.achievement_id,
        rewards: { resources: { ...reward.rewards.resources } },
      })
    }
  },
  discardAchievementBatch(state: AchievementsState) {
    // При ошибке теряем только отправленную пачку. Новые события остаются.
    // Предварительный прогресс на странице после этого может уменьшиться.
    state.inFlightEvents = []
  },
  resetAchievementSession(state: AchievementsState) {
    // При входе/выходе не переносим прогресс и очередь между пользователями.
    state.session += 1
    state.pinnedAchievements = []
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
    prunePins(state)
  },
  setUserAchievements(
    state: AchievementsState,
    progress: UserAchievementsProgress
  ) {
    // Вызывается при загрузке общей базы пользователя через getUserDatabase.
    state.userAchievements = progress
    prunePins(state)
  },
}

const REQUEST_TIMEOUT_MS = 15_000
const toast = useToast()

const actions = {
  togglePinnedAchievement(
    { state, commit }: ActionContext<AchievementsState, RootState>,
    pin: PinnedAchievement
  ) {
    const alreadyPinned = state.pinnedAchievements.some(
      item => item.section === pin.section && item.id === pin.id
    )
    if (!alreadyPinned && !canKeepPin(state, pin)) return
    if (
      !alreadyPinned &&
      state.pinnedAchievements.length >= MAX_PINNED_ACHIEVEMENTS
    ) {
      toast.info(`Можно закрепить не больше ${MAX_PINNED_ACHIEVEMENTS} заданий`)
      return
    }
    commit("toggleAchievementPin", pin)
  },
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
      // Локальные ID на бэк не отправляем. После сетевого сбоя пачку не повторяем.
      events: state.inFlightEvents.map(({ type, data }) => ({ type, data })),
    }

    try {
      const { data } = await callApi<AchievementEventsResponse>({
        method: HttpMethod.POST,
        url: USER_ACHIEVEMENTS.replace("{userId}", String(userId)),
        data: { events: request.events },
        // При 401 callApi сам обновит токен и повторит отклонённый запрос.
        timeout: REQUEST_TIMEOUT_MS,
      })
      // Ответ от предыдущей сессии не должен менять данные текущего игрока.
      if (state.session !== batchSession) return true
      commit("finishAchievementBatch", data)
      // null — баланс не меняем. Иначе бэк прислал полный актуальный баланс.
      if (data.user_resources !== null) {
        commit("set_resource", data.user_resources)
        // Награда тоже может довести баланс до цели другого контракта.
        checkCurrentResources()
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
