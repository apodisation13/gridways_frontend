import type {
  Card,
  Enemy,
  EnemyLeader,
  Leader,
  UserResources,
} from "./database"
import type { InventoryItem } from "./inventory"
import type { UpgradeSubtype, UpgradeType, UserUpgrades } from "./upgrades"
import type { PayResourcesSubtype } from "./user_actions"

// Обычный режим — сезоны. Значения используются в фильтре mode.
export enum AchievementGameMode {
  Normal = "normal",
  Random = "random",
  RandomN = "random_n",
  Multiplayer = "multiplayer",
  Arena = "arena",
}

export enum AchievementEventType {
  // Бой. События содержат mode; нужные режимы выбирает фильтр контракта.
  // При победе: исходная колода, сложность, применения лидера и состав кладбища врагов.
  GameWon = "game.won",
  // При фактическом поражении. Выход из игры сам по себе не считается поражением.
  GameLost = "game.lost",

  // Карты и лидеры в бою. actor — полный снимок владельца действия/пассивки.
  // Один применённый заряд, независимо от количества целей способности.
  ActionPlayed = "action.played",
  // Активация пассивки с указанием зоны. run_passive учитывает разрешённый вызов
  // обработчика; реакции на игру карты и начало боя — только подтверждённый эффект.
  PassiveTriggered = "passive.triggered",

  // Враги. Снимок enemy берём до очистки статусов и восстановления параметров.
  // Убийство/уничтожение врага или лидера, включая уничтожение в колоде.
  EnemyKilled = "enemy.killed",
  // Снятие существующего щита любым подключённым способом, не только ударом.
  EnemyShieldRemoved = "enemy.shield_removed",
  // Снятие брони у одного врага: count считает факт, sum по amount — единицы брони.
  EnemyArmorRemoved = "enemy.armor_removed",

  // Ресурсы. В расходах и доходах количества всегда положительные.
  // Фактическое списание: ресурсы уже потрачены, событие повторно их не списывает.
  ResourceSpent = "resource.spent",
  // Фактически полученные ресурсы с учётом лимитов, а не обещанная награда.
  ResourceGained = "resource.gained",
  // Успешный buy/sell/craft/mill ресурса: предмет, количество, расход и доход операции.
  ResourceTransformed = "resource.transformed",
  // Успешное открытие keys/kegs/big_kegs/chests; отдельно от списания и выдачи награды.
  ResourceOpened = "resource.opened",

  // Инвентарь в бою, включая арену.
  // Применение предмета и его результат (например, реально взятые карты).
  InventoryUsed = "inventory.used",
  // Восстановление предмета кнопкой в арене, не покупка прокачки восстановления.
  InventoryRestored = "inventory.restored",

  // Создание/разбор карт и лидеров, а не ресурсов из BonusPage.
  // Успешный craft/mill: снимок actor, рецепт и фактические расходы/доходы.
  ActorTransformed = "actor.transformed",

  // Прокачки пользователя и отдельные события арены.
  // Успешная покупка обычной прокачки: тип, подтип и достигнутая ступень/значение.
  UpgradePurchased = "upgrade.purchased",
  // Успешная покупка прокачки внутри арены.
  ArenaUpgradePurchased = "arena.upgrade.purchased",
  // Переход на следующий уровень арены после победы: передаём достигнутый номер.
  ArenaLevelReached = "arena.level.reached",

  // Пользовательские колоды. События создаются после успешной операции.
  // Новая колода; трекер также создаёт DeckSaved для проверки её состава.
  DeckCreated = "deck.created",
  // Состав колоды после создания или редактирования, но не при обычной загрузке.
  DeckSaved = "deck.saved",
  // Удаление колоды; передаём снимок удалённой колоды.
  DeckDeleted = "deck.deleted",

  // Проверки текущего состояния (counter.current), а не факты заработка/покупки.
  // Вызываются при загрузке данных и после соответствующих изменений.
  // На бэк уходят с пустым data: сервер сам читает актуальные значения из БД.
  // Текущий баланс: например, «накопите 40000 денег».
  ResourcesChecked = "resources.checked",
  // Текущие уровни/значения прокачек и сводки «всё на максимум».
  UpgradesChecked = "upgrades.checked",
  // Число хранящихся колод, включая базовую.
  DecksChecked = "decks.checked",

  // Только локальные входы мастер-функции. Их нельзя указывать в event контракта:
  // трекер преобразует их в события выше; эти четыре типа в API не отправляются.
  // Изменение ресурсов со знаками и/или балансами до/после → расход, доход, current.
  ResourcesChanged = "resources.changed",
  // Обмен ресурса с рецептом, quantity и step → расходы/доходы + ResourceTransformed.
  ResourceTransition = "resource.transition",
  // Крафт/разбор карты или лидера с балансами до/после → ресурсы + ActorTransformed.
  ActorTransition = "actor.transition",
  // Покупка прокачки с ответом сервера → ресурсы + UpgradePurchased + current.
  UpgradeChanged = "upgrade.changed",
}

// Типы для очереди, API и event в конфиге: без четырёх локальных входов выше.
export type AchievementRecordedEventType = Exclude<
  AchievementEventType,
  | AchievementEventType.ResourcesChanged
  | AchievementEventType.ResourceTransition
  | AchievementEventType.ActorTransition
  | AchievementEventType.UpgradeChanged
>

export type AchievementPeriod = "permanent" | "daily" | "weekly"

// Only implemented counting mechanisms belong here.
export enum AchievementCounterType {
  Count = "count",
  Sum = "sum",
  Current = "current",
  Unique = "unique",
  Streak = "streak",
}

export interface AchievementStreakReset {
  event: AchievementRecordedEventType
  filters: Record<string, AchievementFilter>
}

export type AchievementCounter =
  | {
      type: AchievementCounterType.Streak
      length: number
      reset: [AchievementStreakReset, ...AchievementStreakReset[]]
    }
  | { type: AchievementCounterType.Count }
  | { type: AchievementCounterType.Sum; field: string }
  | { type: AchievementCounterType.Current; field: string }
  | { type: AchievementCounterType.Unique; field: string }

export interface AchievementRewards {
  resources: Record<string, number>
}

export interface AchievementDefinition {
  id: string
  group?: string // Только группировка отображения, не влияет на подсчёт.
  ordering: number
  title: string
  event: AchievementRecordedEventType
  filters: Record<string, AchievementFilter>
  counter: AchievementCounter
  target: number
  rewards: AchievementRewards
}

export interface AchievementDisplayEntry {
  key: string
  definition: AchievementDefinition
  completed: boolean
  completedAt: number
}

export interface AchievementDisplayRow {
  key: string
  entries: AchievementDisplayEntry[]
  ordering: number
}

export interface AchievementCategory {
  id: string
  title: string
  ordering: number
  achievements: Record<string, AchievementDefinition>
}

export interface AchievementSection {
  title: string
  categories: Record<string, AchievementCategory>
}

// GAME_DATA includes only permanent achievements. Selected recurring sets
// will be loaded separately and must not be erased by catalog refreshes.
export interface AchievementGameConfig {
  permanent: AchievementSection
}

export interface AchievementCatalog extends AchievementGameConfig {
  daily: AchievementSection | null
  weekly: AchievementSection | null
}

export interface AchievementProgress {
  value: number
  seen?: Array<string | number>
  streak?: number // Текущая серия скрыта в UI; value — число полных серий.
  completed_at: string | null
  reward_granted_at: string | null
}

export interface PeriodAchievementProgress {
  period: string
  tasks: Record<string, AchievementProgress>
}

export interface UserAchievementsProgress {
  permanent?: Record<string, AchievementProgress>
  daily?: PeriodAchievementProgress
  weekly?: PeriodAchievementProgress
}

export type AchievementScalar = string | number | boolean | null
export type AchievementEventValue =
  | AchievementScalar
  | AchievementEventValue[]
  | { [key: string]: AchievementEventValue }

export enum AchievementFilterOperator {
  Eq = "eq",
  Ne = "ne",
  Gt = "gt",
  Gte = "gte",
  Lt = "lt",
  Lte = "lte",
  In = "in",
  Exists = "exists",
}

export type AchievementFilter =
  | AchievementScalar
  | {
      type: AchievementFilterOperator.Eq | AchievementFilterOperator.Ne
      value: AchievementScalar
    }
  | {
      type:
        | AchievementFilterOperator.Gt
        | AchievementFilterOperator.Gte
        | AchievementFilterOperator.Lt
        | AchievementFilterOperator.Lte
      value: number
    }
  | { type: AchievementFilterOperator.In; value: AchievementScalar[] }
  | { type: AchievementFilterOperator.Exists; value: boolean }

export interface AchievementResourceSpentData {
  // Название использованного предмета для unique-контрактов.
  item?: InventoryItem
  // Причина операции позволяет отличить использование предмета от продажи.
  subtype?: PayResourcesSubtype
  // Один факт траты может включать несколько ресурсов. Количества положительные.
  resources: Record<string, number>
}

export interface AchievementActorOperation {
  action: "craft" | "mill"
  actor: Card | Leader
  recipe: Record<string, number>
}

export interface AchievementUpgradeState {
  level: number
  value: number | boolean
  maxed: boolean
}

export interface AchievementUpgradeSummary {
  total_count: number
  maxed_count: number
  // Число 0/1 позволяет использовать обычный current с target: 1.
  all_maxed: number
}

export interface AchievementUpgradeSnapshot {
  upgrades: Record<string, Record<string, AchievementUpgradeState>>
  summary: Record<string, AchievementUpgradeSummary>
}

export type AchievementPassiveLocation =
  | "hand"
  | "deck"
  | "grave"
  | "passive_once"

export type AchievementEventInput =
  | {
      type:
        | AchievementEventType.EnemyKilled
        | AchievementEventType.EnemyShieldRemoved
      enemy: Enemy | EnemyLeader
    }
  | {
      type: AchievementEventType.EnemyArmorRemoved
      enemy: Enemy | EnemyLeader
      amount: number
    }
  | {
      type: AchievementEventType.PassiveTriggered
      actor: Card | Leader
      location: AchievementPassiveLocation
    }
  | {
      type: AchievementEventType.ArenaUpgradePurchased
      data: { upgrade_subtype: UpgradeSubtype; level: number }
    }
  | { type: AchievementEventType.ArenaLevelReached; data: { level: number } }
  | {
      type: AchievementEventType.InventoryRestored
      data: { item: InventoryItem; mode: AchievementGameMode }
    }
  | { type: AchievementEventType.GameWon; mode?: AchievementGameMode }
  | { type: AchievementEventType.GameLost; mode?: AchievementGameMode }
  | { type: AchievementEventType.DecksChecked; data: Record<string, never> }
  | {
      type:
        | AchievementEventType.DeckCreated
        | AchievementEventType.DeckDeleted
        | AchievementEventType.DeckSaved
      data: { deck: Record<string, AchievementEventValue> }
    }
  | {
      type: AchievementEventType.UpgradeChanged
      data: {
        upgrade_type: UpgradeType
        upgrade_subtype: UpgradeSubtype
        upgrades: UserUpgrades
        before: Record<string, number>
        after: Record<string, number>
      }
    }
  | {
      type: AchievementEventType.UpgradePurchased
      data: AchievementUpgradeState & {
        upgrade_type: UpgradeType
        upgrade_subtype: UpgradeSubtype
      }
    }
  | { type: AchievementEventType.UpgradesChecked; data: Record<string, never> }
  | {
      type: AchievementEventType.ActorTransition
      data: AchievementActorOperation & {
        before: Record<string, number>
        after: Record<string, number>
      }
    }
  | {
      type: AchievementEventType.ActorTransformed
      data: AchievementActorOperation & {
        spent: Record<string, number>
        gained: Record<string, number>
      }
    }
  | { type: AchievementEventType.ResourcesChecked; data: Record<string, never> }
  | {
      type: AchievementEventType.ResourceTransformed
      data: {
        action: "buy" | "sell" | "craft" | "mill"
        resource: string
        amount: number
        // Стоимость и фактический доход именно этого обмена. Нули не включаем.
        spent: Record<string, number>
        gained: Record<string, number>
      }
    }
  | { type: AchievementEventType.ResourceOpened; data: { resource: string } }
  | {
      type: AchievementEventType.InventoryUsed
      data: {
        item: InventoryItem
        mode: AchievementGameMode
        result: { cards_drawn?: number }
      }
    }
  | {
      type: AchievementEventType.ResourceTransition
      data: {
        resource: string
        action: "buy" | "sell" | "craft" | "mill"
        quantity: number
        step: number
        recipe: Record<string, number>
        before: Record<string, number>
        after: Record<string, number>
      }
    }
  | { type: AchievementEventType.ActionPlayed; actor: Card | Leader }
  | {
      type: AchievementEventType.ResourceSpent
      data: AchievementResourceSpentData
    }
  | {
      type: AchievementEventType.ResourceGained
      data:
        | { resources: Record<string, number>; subtype?: PayResourcesSubtype }
        // Если ручка вернула только баланс, фактический доход вычислит трекер.
        | { before: Record<string, number>; after: Record<string, number> }
    }
  | {
      type: AchievementEventType.ResourcesChanged
      // С суммами: минус — расход, плюс — запрошенный доход.
      // Без сумм нужны оба баланса: трекер сам разделит фактическую разницу.
      data: { subtype?: PayResourcesSubtype; item?: InventoryItem } & (
        | {
            resources: Record<string, number>
            before?: never
            after?: never
          }
        | {
            resources?: Record<string, number>
            before: Record<string, number>
            after: Record<string, number>
          }
      )
    }

export interface AchievementEvent {
  id: string
  type: AchievementRecordedEventType
  data: Record<string, AchievementEventValue>
}

export type AchievementEventPayload = Omit<AchievementEvent, "id">

export interface AchievementEventsRequest {
  events: AchievementEventPayload[]
}

export interface GrantedAchievementReward {
  achievement_id: string
  period_type: AchievementPeriod
  period: string | null
  rewards: AchievementRewards
}

// Снимок для уведомления: название и фактически начисленные ресурсы на момент ответа.
export interface AchievementRewardNotification extends GrantedAchievementReward {
  notification_id: string
  title: string
}

export interface AchievementEventsResponse {
  user_achievements: UserAchievementsProgress
  granted_rewards: GrantedAchievementReward[]
  user_resources: UserResources | null
}

export interface AchievementPreview {
  progress: UserAchievementsProgress
  // Locally reached permanent goals, not confirmed completions or rewards.
  reachedAchievementIds: string[]
}

// Сейчас закрепляем постоянные задания; для daily/weekly добавим ещё период набора.
export interface PinnedAchievement {
  section: "permanent"
  id: string
}
