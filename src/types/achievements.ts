import type {
  Card,
  Enemy,
  EnemyLeader,
  Leader,
  LevelDifficulty,
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
  // любая сыгранная карта или лидер в любом режиме
  ActionPlayed = "action.played",
  PassiveTriggered = "passive.triggered",
  EnemyKilled = "enemy.killed",
  EnemyShieldRemoved = "enemy.shield_removed",
  EnemyArmorRemoved = "enemy.armor_removed",
  GameStarted = "game.started",
  GameWon = "game.won",
  GameLost = "game.lost",
  ActorTransition = "actor.transition", // Локальный сигнал с балансами до/после.
  ActorTransformed = "actor.transformed",
  UpgradeChanged = "upgrade.changed", // Локальный сигнал после покупки.
  UpgradePurchased = "upgrade.purchased",
  UpgradesChecked = "upgrades.checked",

  // общий ивент об изменении ресурсов - потом он преобразуется в один из двух ниже
  ResourcesChanged = "resources.changed",
  // Обмен превращается в расходы, доходы и факт операции с ресурсом.
  ResourceTransition = "resource.transition",
  // --------------- настоящие которые отправляются ---------------
  ResourceSpent = "resource.spent",
  ResourceGained = "resource.gained",
  ResourceTransformed = "resource.transformed",

  // любое открытие ключа, бочек или коробки
  ResourceOpened = "resource.opened",
  // Фактический результат применения предмета, отдельно от его списания.
  InventoryUsed = "inventory.used",
  InventoryRestored = "inventory.restored",
  ArenaUpgradePurchased = "arena.upgrade.purchased",
  ArenaLevelReached = "arena.level.reached",
  DeckCreated = "deck.created",
  DeckSaved = "deck.saved",
  DeckDeleted = "deck.deleted",
  DecksChecked = "decks.checked",

  // проверка ресурсов на накопление типа накопите 40000 денег
  ResourcesChecked = "resources.checked",
}

// Изменение со знаками — только входной сигнал. В очередь идут отдельные факты.
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

// Только текущий бой; не часть сохраняемого пользовательского прогресса.
export interface AchievementBattle {
  mode: AchievementGameMode
  difficulty?: LevelDifficulty
  starting_deck: Record<string, AchievementEventValue>
  leader_uses: number
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
  | {
      type:
        | AchievementEventType.GameStarted
        | AchievementEventType.GameWon
        | AchievementEventType.GameLost
      mode?: AchievementGameMode
    }
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
