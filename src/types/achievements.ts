import type { Card, Leader, UserResources } from "./database"
import type { PayResourcesSubtype } from "./user_actions"

export enum AchievementEventType {
  // любая сыгранная карта или лидер в любом режиме
  ActionPlayed = "action.played",

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

  // проверка ресурсов на накопление типа накопите 40000 денег
  ResourcesChecked = "resources.checked",
}

// Изменение со знаками — только входной сигнал. В очередь идут отдельные факты.
export type AchievementRecordedEventType = Exclude<
  AchievementEventType,
  | AchievementEventType.ResourcesChanged
  | AchievementEventType.ResourceTransition
>

export type AchievementPeriod = "permanent" | "daily" | "weekly"

// Only implemented counting mechanisms belong here.
export enum AchievementCounterType {
  Count = "count",
  Sum = "sum",
  Current = "current",
}

export type AchievementCounter =
  | { type: AchievementCounterType.Count }
  | { type: AchievementCounterType.Sum; field: string }
  | { type: AchievementCounterType.Current; field: string }

export interface AchievementRewards {
  resources: Record<string, number>
}

export interface AchievementDefinition {
  id: string
  ordering: number
  title: string
  event: AchievementRecordedEventType
  filters: Record<string, AchievementFilter>
  counter: AchievementCounter
  target: number
  rewards: AchievementRewards
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
  // Причина операции позволяет отличить использование предмета от продажи.
  subtype?: PayResourcesSubtype
  // Один факт траты может включать несколько ресурсов. Количества положительные.
  resources: Record<string, number>
}

export type AchievementEventInput =
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
      data: { resources: Record<string, number>; subtype?: PayResourcesSubtype }
    }
  | {
      type: AchievementEventType.ResourcesChanged
      // Минус — потрачено, плюс — запрошенное начисление. Для дохода нужны оба снимка.
      data: {
        resources: Record<string, number>
        subtype?: PayResourcesSubtype
      } & (
        | {
            before: Record<string, number>
            after: Record<string, number>
          }
        | { before?: never; after?: never }
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
