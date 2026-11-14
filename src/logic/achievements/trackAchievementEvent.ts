import { v4 as uuidv4 } from "uuid"

import store from "@/store"
import type {
  AchievementEvent,
  AchievementEventInput,
  InventoryItem,
  PayResourcesSubtype,
} from "@/types"
import { AchievementEventType } from "@/types"

import { finishAchievementBattle } from "./battle"
import { checkCurrentDecks } from "./currentDecks"
import { checkCurrentResources } from "./currentResources"
import { checkCurrentUpgrades } from "./currentUpgrades"
import { resolveAchievementGameMode } from "./gameMode"
import { buildUpgradeSnapshot } from "./upgradeSnapshot"

// Общая точка входа из игры: сообщаем, что произошло, без перечисления заданий.
// Подсчёт выполняется отдельно, а отправку очереди организует syncAchievementEvents.
// Сначала разбираем составные локальные сигналы, затем записываем готовые события.
// Возвращаем локальные ID созданных событий (их может быть несколько или ни одного).
// Это не список выполненных контрактов и не подтверждение обработки сервером.
export function trackAchievementEvent(input: AchievementEventInput): string[] {
  // Покупка прокачки: один вызов учитывает изменение ресурсов, саму покупку
  // и новые значения для контрактов «накопите»/«прокачайте до ...».
  // Сам UpgradeChanged в очередь не попадает — ниже будут отдельные события.
  if (input.type === AchievementEventType.UpgradeChanged) {
    return trackUpgradeChange(input.data)
  }

  // Некоторые награды возвращают только полный баланс, без суммы начисления.
  // Для них учитываем положительную разницу; уменьшения не считаем расходами.
  // Это особая входная форма ResourceGained. Если уже передан resources,
  // эта ветка не нужна: готовый фактический доход попадёт в общую очередь ниже.
  if (
    input.type === AchievementEventType.ResourceGained &&
    "before" in input.data
  ) {
    const { before, after } = input.data
    const gained: Record<string, number> = {}
    for (const [resource, amount] of Object.entries(after)) {
      const previous = before[resource]
      // Неизвестный старый баланс не считаем нулём — иначе запишем лишний доход.
      if (!Number.isFinite(amount) || !Number.isFinite(previous)) continue
      const received = amount - previous
      if (Number.isFinite(received) && received > 0) gained[resource] = received
    }
    return [
      ...trackResourceChanges({ spent: {}, gained }),
      ...checkCurrentResources(),
    ]
  }

  // Крафт/разбор карты или лидера: расходы/доходы по балансам + факт операции.
  // actor и recipe сохраняются для фильтров по карте, фракции и способу крафта.
  if (input.type === AchievementEventType.ActorTransition) {
    return trackActorTransition(input.data)
  }

  // Покупка/продажа/крафт/разбор ресурса: учитываем quantity, step и рецепт.
  // Получатся расходы/доходы и ResourceTransformed для контрактов самой операции.
  if (input.type === AchievementEventType.ResourceTransition) {
    return trackResourceTransition(input.data)
  }

  // Общее изменение баланса, когда отдельного факта покупки/крафта не требуется.
  // Разделяем словарь на расход и доход; subtype/item сохраняем для фильтров.
  // Затем проверяем текущий баланс: «заработайте за всё время» и «имейте сейчас»
  // — разные контракты, поэтому одного ResourceGained для обоих недостаточно.
  if (input.type === AchievementEventType.ResourcesChanged) {
    const { spent, gained } = getResourceChanges(input.data)
    return [
      ...trackResourceChanges({
        spent,
        gained,
        subtype: input.data.subtype,
        item: input.data.item,
      }),
      ...checkCurrentResources(),
    ]
  }

  // Поражение сбрасывает серии согласно конфигу. Режим берём из игрового стора.
  // Проверки «бой активен» нет: повторный сброс уже нулевой серии безвреден.
  if (input.type === AchievementEventType.GameLost) {
    const event: AchievementEvent = {
      id: uuidv4(),
      type: input.type,
      data: { mode: resolveAchievementGameMode() },
    }
    store.commit("enqueueAchievementEvent", event)
    return [event.id]
  }

  // Отсутствие color отличает лидера от карты. Только его сыгранный заряд
  // увеличивает статистику боя; PassiveTriggered сюда не попадает.
  if (
    input.type === AchievementEventType.ActionPlayed &&
    !("color" in input.actor)
  ) {
    // Факт применения надёжнее остатка зарядов: пассивки могут вернуть заряды.
    store.commit("recordAchievementLeaderUse")
  }

  // Приводим разные входные формы к единому event.data:
  // - игра карты/лидера и пассивка: полный actor + mode, для пассивки ещё location;
  // - победа: колода/лидер/сложность из стора, счётчик применений лидера и кладбище;
  // - убийство/снятие защиты: полный enemy + mode, для брони ещё amount;
  // - готовый data: сохраняем как передан (ресурсы, колоды, инвентарь и т. д.);
  // Делаем независимую копию со всеми вложенными полями: последующие изменения
  // карты, врага или стора не должны менять уже поставленное в очередь событие.
  // undefined, как и при обычной отправке JSON, не сохраняется в полях объекта.
  let eventData: object
  if (input.type === AchievementEventType.ActionPlayed) {
    eventData = {
      actor: input.actor,
      mode: resolveAchievementGameMode(),
    }
  } else if (input.type === AchievementEventType.PassiveTriggered) {
    eventData = {
      actor: input.actor,
      mode: resolveAchievementGameMode(),
      location: input.location,
    }
  } else if (input.type === AchievementEventType.GameWon) {
    eventData = finishAchievementBattle()
  } else if (input.type === AchievementEventType.EnemyArmorRemoved) {
    eventData = {
      enemy: input.enemy,
      mode: resolveAchievementGameMode(),
      amount: input.amount,
    }
  } else if ("enemy" in input) {
    eventData = {
      enemy: input.enemy,
      mode: resolveAchievementGameMode(),
    }
  } else {
    eventData = input.data
  }

  const data: AchievementEvent["data"] = JSON.parse(JSON.stringify(eventData))

  const event: AchievementEvent = { id: uuidv4(), type: input.type, data }

  // Здесь только очередь и локальный предварительный прогресс. HTTP-запросом
  // занимается синхронизация; награду подтверждает и начисляет только бэк.
  store.commit("enqueueAchievementEvent", event)

  if (input.type === AchievementEventType.DeckCreated) {
    // Создание также является сохранением состава, но это разные контракты.
    // DeckCreated считает факт создания, DeckSaved проверяет состав, а
    // checkCurrentDecks — сколько колод теперь хранится у пользователя.
    // Повторный вход конечен: у DeckSaved нет этой ветки с дополнительным событием.
    const savedIds = trackAchievementEvent({
      type: AchievementEventType.DeckSaved,
      data: input.data,
    })
    return [event.id, ...savedIds, ...checkCurrentDecks()]
  }
  if (input.type === AchievementEventType.DeckDeleted) {
    // Удаление уже записано. Дополнительно обновляем current по числу колод,
    // чтобы предварительный прогресс незавершённых контрактов мог уменьшиться.
    return [event.id, ...checkCurrentDecks()]
  }
  return [event.id]
}

// Покупка прокачки создаёт один факт покупки, обычные ресурсы и проверку достигнутых целей.
function trackUpgradeChange(
  data: Extract<
    AchievementEventInput,
    { type: AchievementEventType.UpgradeChanged }
  >["data"]
): string[] {
  const { upgrade_type, upgrade_subtype, upgrades, before, after } = data
  const ids = trackResourceChanges(getResourceChanges({ before, after }))
  const snapshot = buildUpgradeSnapshot(store.getters.upgradesConfig, upgrades)
  const purchased = snapshot.upgrades[upgrade_type]?.[upgrade_subtype]
  // Если параметр не найден в снимке, не придумываем уровень покупки.
  // Изменения ресурсов и проверки текущего состояния всё равно учитываются.
  if (purchased) {
    ids.push(
      ...trackAchievementEvent({
        type: AchievementEventType.UpgradePurchased,
        data: { upgrade_type, upgrade_subtype, ...purchased },
      })
    )
  }
  ids.push(...checkCurrentResources(), ...checkCurrentUpgrades())
  return ids
}

// Один успешный крафт/разбор: ресурсы учитываем один раз, затем записываем саму операцию.
function trackActorTransition(
  data: Extract<
    AchievementEventInput,
    { type: AchievementEventType.ActorTransition }
  >["data"]
): string[] {
  const { action, actor, recipe, before, after } = data
  const changes = getResourceChanges({ before, after })
  const ids = trackResourceChanges(changes)
  ids.push(
    ...trackAchievementEvent({
      type: AchievementEventType.ActorTransformed,
      data: { action, actor, recipe, ...changes },
    })
  )
  ids.push(...checkCurrentResources())
  return ids
}

// Обмен создаёт события расходов, доходов и отдельный факт операции.
function trackResourceTransition(
  data: Extract<
    AchievementEventInput,
    { type: AchievementEventType.ResourceTransition }
  >["data"]
): string[] {
  const { resource, action, quantity, step, recipe, before, after } = data
  // quantity — число операций, step — количество предметов за одну операцию.
  // Например, 10 покупок по 100 scraps дают amount = 1000, а не 10.
  // Некорректные входные данные не должны создавать события с выдуманной суммой.
  if (
    !Number.isFinite(step) ||
    step <= 0 ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  )
    return []
  const increase = action === "buy" || action === "craft"
  // Сам предмет прибавляется при покупке/крафте и убывает при продаже/разборе.
  if (!increase && action !== "sell" && action !== "mill") return []
  const transformedAmount = quantity * step
  if (!Number.isFinite(transformedAmount)) return []

  // Как на бэке: рецепт за одну операцию + изменение самого ресурса,
  // затем всё умножается на quantity. Исходный рецепт не изменяем.
  const perOperation = { ...recipe, [resource]: increase ? step : -step }
  const resources = Object.fromEntries(
    Object.entries(perOperation).map(([name, amount]) => [
      name,
      amount * quantity,
    ])
  )
  const changes = getResourceChanges({ resources, before, after })
  const ids = trackResourceChanges(changes)
  // Отдельный факт успешной покупки/продажи/крафта/разбора.
  // Количество предметов — quantity × step, без повторной проверки лимита.
  ids.push(
    ...trackAchievementEvent({
      type: AchievementEventType.ResourceTransformed,
      data: { action, resource, amount: transformedAmount, ...changes },
    })
  )
  ids.push(...checkCurrentResources())
  return ids
}

// Один расчёт для общих расходов/доходов и для стоимости конкретного обмена.
function getResourceChanges({
  resources,
  before: beforeSnapshot,
  after: afterSnapshot,
}: {
  resources?: Record<string, number>
  before?: Record<string, number>
  after?: Record<string, number>
}): { spent: Record<string, number>; gained: Record<string, number> } {
  const spent: Record<string, number> = {}
  const gained: Record<string, number> = {}
  // Ручки крафта/разбора возвращают баланс, но не отдельную сумму операции.
  // Сравниваем только поля, присутствующие в обоих снимках.
  const changes =
    resources ??
    Object.fromEntries(
      Object.entries(afterSnapshot ?? {})
        .filter(
          ([resource, amount]) =>
            Number.isFinite(amount) &&
            Number.isFinite(beforeSnapshot?.[resource])
        )
        .map(([resource, amount]) => [
          resource,
          amount - beforeSnapshot![resource],
        ])
    )
  for (const [resource, amount] of Object.entries(changes)) {
    // Нули игнорируем. Расход из переданной операции переводим в положительное
    // число; доход ниже дополнительно ограничиваем фактическим изменением баланса.
    if (!Number.isFinite(amount)) continue
    if (amount < 0) spent[resource] = -amount
    else if (amount > 0) {
      const before = beforeSnapshot?.[resource]
      const after = afterSnapshot?.[resource]
      // Без обоих значений нельзя отличить запрошенный доход от реального.
      // Для уже известного фактического дохода есть прямой ResourceGained.
      if (
        typeof before !== "number" ||
        !Number.isFinite(before) ||
        typeof after !== "number" ||
        !Number.isFinite(after)
      )
        continue

      // Бэк уже применил лимиты. 4900 → 5000 при награде 1000 даёт только +100.
      // Разница точна для последовательных операций без посторонних изменений баланса.
      const received = Math.min(amount, Math.max(0, after - before))
      if (received > 0) gained[resource] = received
    }
  }
  return { spent, gained }
}

function trackResourceChanges({
  spent,
  gained,
  subtype,
  item,
}: {
  spent: Record<string, number>
  gained: Record<string, number>
  subtype?: PayResourcesSubtype
  item?: InventoryItem
}): string[] {
  // Вызывающий код передаёт весь словарь. Разделение нужно только здесь.
  // Пустые события не создаём; исходный словарь не изменяем.
  const ids: string[] = []
  // Одно событие содержит сразу все потраченные ресурсы, не по событию на ресурс.
  if (Object.keys(spent).length) {
    ids.push(
      ...trackAchievementEvent({
        type: AchievementEventType.ResourceSpent,
        data: { resources: spent, subtype, item },
      })
    )
  }
  if (Object.keys(gained).length) {
    // Доход идёт отдельным типом, поэтому одно изменение может продвинуть
    // одновременно контракты на расход одного ресурса и получение другого.
    ids.push(
      ...trackAchievementEvent({
        type: AchievementEventType.ResourceGained,
        data: { resources: gained, subtype },
      })
    )
  }
  return ids
}
