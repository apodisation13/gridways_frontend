import type { DeckCardEntry, Leader, MappedUserLevel } from "@/types"
import type { ArenaParams } from "@/types/database"
import type { UpgradeCategory } from "@/types/upgrades"

export interface ArenaState {
  current_level: number
  current_enemies: number
  deck: DeckCardEntry[]
  leader: Leader | null
  health: number
  armor: number
  level: MappedUserLevel | null
  arenaUpgrades: UpgradeCategory | null
  user_upgrades: Record<string, number>
  arena_params: ArenaParams | null
}

const state: ArenaState = {
  current_level: 1,
  current_enemies: 0,
  deck: [],
  leader: null,
  health: 0,
  armor: 0,
  level: null,
  arenaUpgrades: null,
  user_upgrades: {},
  arena_params: null,
}

const getters = {
  arena_current_level: (state: ArenaState) => state.current_level,
  arena_current_enemies: (state: ArenaState) => state.current_enemies,
  arena_deck: (state: ArenaState) => state.deck,
  arena_leader: (state: ArenaState) => state.leader,
  arena_health: (state: ArenaState) => state.health,
  arena_level: (state: ArenaState) => state.level,
  arena_upgrades_config: (state: ArenaState) => state.arenaUpgrades,
  arena_user_upgrades: (state: ArenaState) => state.user_upgrades,
  arena_params: (state: ArenaState) => state.arena_params,
}

const mutations = {
  arena_set_deck_complete(
    state: ArenaState,
    payload: { deck: DeckCardEntry[]; leader: Leader }
  ) {
    state.deck = payload.deck
    state.leader = payload.leader
    state.health =
      payload.deck.reduce((acc, c) => acc + (c.card?.data.hp ?? 0), 0) +
      (payload.leader?.data.hp ?? 0)
  },
  arena_set_level(state: ArenaState, level: MappedUserLevel) {
    state.level = level
  },
  arena_advance_level(state: ArenaState) {
    state.current_level += 1
    state.current_enemies += state.arena_params?.delta_enemies ?? 0
    state.level = null
  },
  arena_increment_upgrade(state: ArenaState, subtype: string) {
    state.user_upgrades[subtype] = (state.user_upgrades[subtype] ?? 0) + 1
  },
  arena_use_upgrade(state: ArenaState, subtype: string) {
    state.user_upgrades[subtype] = Math.max(
      0,
      (state.user_upgrades[subtype] ?? 0) - 1
    )
  },
  arena_set_user_upgrade(
    state: ArenaState,
    payload: { key: string; value: number }
  ) {
    state.user_upgrades[payload.key] = payload.value
  },
  arena_reset(state: ArenaState) {
    state.current_level = 1
    state.current_enemies = state.arena_params?.base_enemies ?? 0
    state.deck = []
    state.leader = null
    state.health = 0
    state.armor = 0
    state.level = null
    state.user_upgrades = {}
  },
  setArenaUpgrades(state: ArenaState, payload: UpgradeCategory) {
    state.arenaUpgrades = payload
  },
  setArenaParams(state: ArenaState, params: ArenaParams) {
    state.arena_params = params
    state.current_enemies = params.base_enemies
  },
}

export default { state, getters, mutations }
