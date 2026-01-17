export function getEnv() {
  return process.env.VUE_APP_CUSTOM_ENV
}

export const PayResourcesSubtype = {
  startSeasonLevel: "start_season_level",
  winSeasonLevel: "win_season_level",
  bonusReward: "bonus_reward",
}

export const CraftMillCardActionSubtype = {
  craftCard: "craft_card",
  craftLeader: "craft_leader",
  millCard: "mill_card",
  millLeader: "mill_leader",
}
