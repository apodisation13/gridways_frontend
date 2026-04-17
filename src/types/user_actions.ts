export enum PayResourcesSubtype {
  startSeasonLevel = "start_season_level",
  winSeasonLevel = "win_season_level",
  resourceTransition = "resource_transition",
  openBonusResource = "open_bonus_resource",
  acceptKeyReward = "accept_key_reward",
}

export enum CraftMillCardActionSubtype {
  craftCard = "craft_card",
  craftLeader = "craft_leader",
  millCard = "mill_card",
  millLeader = "mill_leader",
}

export interface CreateDeckRequest {
  deck_name: string
  leader_id: number
  cards: number[]
}

export interface PatchDeckPayload extends CreateDeckRequest {
  deck_id: number
}

export interface ProcessCraftMillPayload {
  subtype: CraftMillCardActionSubtype
  recipe: Record<string, unknown> | null
  cardId: number
}

export interface ResourcesPayload {
  subtype: PayResourcesSubtype
  data: Record<string, unknown>
}
