import { v4 as uuidv4 } from "uuid"
import type { ActionContext } from "vuex"

import { callApi, HttpMethod } from "@/lib/api/api"
import { previewCurrentDecks } from "@/logic/achievements/currentDecks"
import {
  checkCurrentResources,
  previewCurrentResources,
} from "@/logic/achievements/currentResources"
import { previewCurrentUpgrades } from "@/logic/achievements/currentUpgrades"
import { processAchievementEvents } from "@/logic/achievements/processAchievementEvents"
import { trackAchievementRewards } from "@/logic/achievements/trackAchievementRewards"
import type { RootState } from "@/store"
import { USER_ACHIEVEMENTS } from "@/store/const/api_urls"
import type {
  AchievementCatalog,
  AchievementEvent,
  AchievementEventsRequest,
  AchievementEventsResponse,
  AchievementGameConfig,
  AchievementRewardNotification,
  PinnedAchievement,
  UserAchievementsProgress,
} from "@/types"
import type { UpgradesConfig, UserUpgrades } from "@/types/upgrades"

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
  // Применения лидера в текущем бою; обнуляем при запуске следующего.
  leader_uses: number
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
  leader_uses: 0,
}

// Общий лимит для кнопки закрепления и отображения счётчика в игровом инвентаре.
export const MAX_PINNED_ACHIEVEMENTS = 5

// В закреплении хранятся только section и id. Описание находим в категориях конфига.
// Один поиск используется и для показа карточки, и для удаления исчезнувших заданий.
function findPinnedDefinition(
  state: AchievementsState,
  pin: PinnedAchievement
) {
  return Object.values(state.achievementsConfig[pin.section].categories)
    .flatMap(category => Object.values(category.achievements))
    .find(definition => definition.id === pin.id)
}

function prunePins(state: AchievementsState) {
  // Только подтверждение бэка снимает закрепление. Локальные 10/10 ещё ждут ответа.
  // Исчезнувшие из конфига задания тоже убираем, даже если карточка не открыта.
  state.pinnedAchievements = state.pinnedAchievements.filter(pin => {
    const progress = state.userAchievements.permanent?.[pin.id]
    return (
      Boolean(findPinnedDefinition(state, pin)) &&
      !progress?.completed_at &&
      !progress?.reward_granted_at
    )
  })
}

const getters = {
  // Подготавливаем карточки для модалки в игре: к каждому закреплению добавляем
  // актуальное описание. Если задания уже нет в конфиге, карточку не показываем.
  pinnedAchievementEntries: (state: AchievementsState) =>
    state.pinnedAchievements.flatMap(pin => {
      const definition = findPinnedDefinition(state, pin)
      return definition ? [{ ...pin, definition }] : []
    }),

  // Заново считаем от данных бэка + событий, ещё не подтверждённых ответом.
  // Поэтому повторный вызов getter не прибавляет один и тот же ход ещё раз.
  // Этот прогресс используют страница достижений и модалка закреплённых.
  localUserAchievements: (
    state: AchievementsState,
    getters: {
      resource: Record<string, number>
      upgradesConfig: UpgradesConfig
      userUpgrades: UserUpgrades
      all_decks: unknown[]
    }
  ): UserAchievementsProgress => {
    // Сначала применяем события в порядке возникновения: отправленные раньше новых.
    // Пока ответ не пришёл, inFlightEvents тоже нужны для отображения прогресса.
    const preview = processAchievementEvents(
      state.achievementsConfig.permanent,
      state.userAchievements,
      [...state.inFlightEvents, ...state.pendingEvents]
    )
    // Затем уточняем контракты «имейте сейчас» по живому состоянию стора.
    // Передаём результат дальше по цепочке, чтобы сохранить расчёт остальных заданий.
    // Эти функции не отправляют запросы, не начисляют награды и не меняют userAchievements.
    const current = previewCurrentResources(
      state.achievementsConfig.permanent,
      preview.progress,
      getters.resource
    )
    const upgrades = previewCurrentUpgrades(
      state.achievementsConfig.permanent,
      current.progress,
      getters.upgradesConfig,
      getters.userUpgrades
    )
    const decks = previewCurrentDecks(
      state.achievementsConfig.permanent,
      upgrades.progress,
      getters.all_decks.length
    )
    return decks.progress
  },

  // Каталог для страницы: названия, категории, условия и награды, без прогресса игрока.
  achievementsConfig: (state: AchievementsState) => state.achievementsConfig,
}

const mutations = {
  // Новый бой: начинаем считать применения лидера с нуля. Событие старта не создаём.
  startAchievementBattle(state: AchievementsState) {
    state.leader_uses = 0
  },
  // Один сыгранный заряд лидера. Нужно для условия победы «не используйте лидера».
  // Пассивки и восстановление зарядов этот счётчик не меняют.
  recordAchievementLeaderUse(state: AchievementsState) {
    state.leader_uses += 1
  },
  // Тост закрыт: удаляем только уведомление, не награду и не прогресс контракта.
  dismissAchievementReward(state: AchievementsState, notificationId: string) {
    state.grantedRewards = state.grantedRewards.filter(
      reward => reward.notification_id !== notificationId
    )
  },
  // Переключаем закрепление. Лимит и выполнение уже проверила кнопка в карточке.
  // Здесь только список: существующую запись удаляем, отсутствующую добавляем.
  toggleAchievementPin(state: AchievementsState, pin: PinnedAchievement) {
    const index = state.pinnedAchievements.findIndex(
      item => item.section === pin.section && item.id === pin.id
    )
    if (index >= 0) {
      state.pinnedAchievements.splice(index, 1)
    } else {
      state.pinnedAchievements.push({ ...pin })
    }
  },
  // Занимаем/освобождаем отправку: одновременно выполняется только один запрос.
  setAchievementSending(state: AchievementsState, sending: boolean) {
    state.sending = sending
  },
  // Отделяем выбранную пачку от событий, которые придут во время ожидания ответа.
  startAchievementBatch(state: AchievementsState) {
    // Забираем всю очередь. Следующие ходы будут копиться уже в новой очереди.
    state.inFlightEvents = state.pendingEvents
    state.pendingEvents = []
  },
  // Успешный ответ: применяем подтверждённый прогресс и готовим уведомления о наградах.
  // Баланс ресурсов обновляется отдельно в экшене, после этой мутации.
  finishAchievementBatch(
    state: AchievementsState,
    response: AchievementEventsResponse
  ) {
    // Бэк уже учёл отправленную пачку: заменяем прогресс и убираем её вместе.
    // Новые pendingEvents оставляем — они ещё не входят в этот ответ.
    state.userAchievements = response.user_achievements
    prunePins(state)
    state.inFlightEvents = []
    // Название берём из конфига, а суммы — из ответа: лимиты могли уменьшить награду.
    // У каждого тоста свой ID, чтобы закрытие одного не удаляло другие уведомления.
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
  // Запрос закончился ошибкой: забываем его пачку согласно принятому правилу без повтора.
  discardAchievementBatch(state: AchievementsState) {
    // При ошибке теряем только отправленную пачку. Новые события остаются.
    // Предварительный прогресс на странице после этого может уменьшиться.
    state.inFlightEvents = []
  },
  // Смена пользователя/выход: очищаем его временные данные и меняем номер сессии.
  // Сам запрос это не отменяет; экшен по номеру сессии отбрасывает его поздний ответ.
  resetAchievementSession(state: AchievementsState) {
    // При входе/выходе не переносим прогресс и очередь между пользователями.
    state.session += 1
    state.leader_uses = 0
    state.pinnedAchievements = []
    state.userAchievements = {}
    state.pendingEvents = []
    state.inFlightEvents = []
    state.grantedRewards = []
    // Permanent — общий каталог игры, его сохраняем. Выбранные daily/weekly
    // пока не реализованы; место под их данные очищаем вместе с сессией.
    state.achievementsConfig.daily = null
    state.achievementsConfig.weekly = null
    // sending снимет сам выполняющийся запрос в finally, когда завершится.
  },
  // Добавляем подготовленное трекером событие. Подписка syncAchievementEvents
  // решит, отправить сразу или дождаться таймера; сама мутация запрос не делает.
  enqueueAchievementEvent(state: AchievementsState, event: AchievementEvent) {
    // Трекер создаёт новое событие с новым UUID перед каждым добавлением.
    state.pendingEvents.push(event)
  },
  // Пришёл каталог из game_const: заменяем описания и чистим устаревшие закрепления.
  setAchievementsConfig(
    state: AchievementsState,
    catalog: AchievementGameConfig
  ) {
    // Daily и weekly позднее загрузим отдельно; game_const присылает permanent.
    state.achievementsConfig.permanent = catalog.permanent
    prunePins(state)
  },
  // Начальная загрузка подтверждённого прогресса; здесь не прибавляем локальные события.
  // Для их отображения есть localUserAchievements, который считает поверх этих данных.
  setUserAchievements(
    state: AchievementsState,
    progress: UserAchievementsProgress
  ) {
    // Вызывается при загрузке общей базы пользователя через getUserDatabase.
    state.userAchievements = progress
    prunePins(state)
  },
}

// Ограничение ожидания HTTP-ответа, не интервал отправки очереди (он в syncAchievementEvents).
const REQUEST_TIMEOUT_MS = 15_000

const actions = {
  // Отправляем одну накопленную пачку. Когда вызывать этот экшен, решает планировщик.
  // true означает «запрос был запущен», а не «бэк успешно сохранил события».
  // По этому результату планировщик понимает, стоит ли проверить новую очередь.
  async sendAchievementEvents({
    state,
    getters,
    commit,
  }: ActionContext<AchievementsState, RootState>): Promise<boolean> {
    // Таймер может вызвать экшен с пустой очередью или во время другого запроса.
    // В этих случаях ничего не переносим в inFlightEvents и сразу выходим.
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
        // Сначала подтверждаем выполненные контракты, потом учитываем их доход.
        // Поэтому награда не сможет повторно продвинуть выдавший её контракт.
        trackAchievementRewards(data.granted_rewards)
        // Награда тоже может довести баланс до цели другого контракта.
        checkCurrentResources()
      }
    } catch (error) {
      // Ошибка старого запроса тоже не должна очистить события новой сессии.
      if (state.session !== batchSession) return true
      // Бэк мог обработать запрос, а ответ потеряться. Повтор дал бы лишний прогресс.
      // Поэтому пачку не возвращаем в очередь даже при сетевой ошибке.
      commit("discardAchievementBatch")
      console.warn(
        "Не удалось синхронизировать достижения; пачка не повторяется",
        error
      )
    } finally {
      // Освобождаем отправку при любом исходе, включая выход из аккаунта во время await.
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
