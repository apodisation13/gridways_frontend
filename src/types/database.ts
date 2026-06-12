import Upgrades from "@/store/modules/upgrades"

export interface CardData {
  damage: number
  charges: number
  hp: number
  base: {
    base_damage: number
    base_charges: number
    base_hp: number
  }
  heal?: number
  armor?: number
  value?: number
  tokens_number?: number
  passive: {
    value?: number
    has_passive_in_hand?: boolean
    has_passive_in_deck?: boolean
    has_passive_in_grave?: boolean
    timer?: number
    default_timer?: number
    reset_timer?: boolean
    each_tick?: boolean
  }
  multi?: {
    value: number
  }
}

export interface LeaderData {
  damage: number
  charges: number
  hp: number
  base: {
    base_damage: number
    base_charges: number
    base_hp: number
  }
  heal?: number
  armor?: number
  passive?: {
    value?: number
    timer?: number
    default_timer?: number
    reset_timer?: boolean
    each_tick?: boolean
  }
  multi?: {
    value: number
  }
}

export interface EnemyData {
  hp: number
  damage: number
  base: {
    base_hp: number
    base_damage?: number
  }
  shield?: boolean | string
  status?: string | null
  passive: {
    value?: number
    has_passive_in_field?: boolean
    has_passive_in_deck?: boolean
    has_passive_in_grave?: boolean
    timer?: number
    default_timer?: number
    reset_timer?: boolean
    each_tick?: boolean
  }
  deathwish?: { value?: number }
  value?: number
}

export interface EnemyLeaderData {
  hp: number
  status?: string | null
  value?: number
  passive?: {
    timer?: number
    default_timer?: number
    reset_timer?: boolean
  }
  shield?: boolean | string
}

export interface Ability {
  name: string
  description: string
}

export interface PassiveAbility {
  name: string | null
  description: string | null
}

export interface EnemyLeaderAbility {
  name: string | null
  description: string | null
}

export interface EnemyPassiveAbility {
  name: string | null
  description: string | null
}

export interface Move {
  name: string
  description: string
}

export interface Deathwish {
  name: string | null
  description: string | null
}

export interface Card {
  id: number
  name: string
  unlocked: boolean
  faction: string
  color: string
  type: string
  ability: Ability
  passive_ability: PassiveAbility
  data: CardData
  image: string
  newly_added: boolean
  // animation fields
  dmg_delta?: number | null
  charges_delta?: number | null
  incr_dmg?: boolean | null
  damages_enemy?: boolean | null
  healing?: boolean | null
  p_dmg_delta?: number | null
  passive_poisoning?: boolean | null
  spawning?: boolean | null
  p_damages_enemy?: boolean | null
  trigger_deck_passive?: boolean | null
  trigger_grave_passive?: boolean | null
}

export interface Leader {
  id: number
  name: string
  unlocked: boolean
  faction: string
  ability: Ability
  passive_ability: PassiveAbility
  data: LeaderData
  image: string
  newly_added: boolean
  // animation fields
  charges_delta?: number | null
  damages_enemy?: boolean | null
  p_damages_enemy?: boolean | null
  passive_poisoning?: boolean | null
}

export interface Enemy {
  id: number
  name: string
  faction: string
  color: string
  move: Move
  passive_ability: EnemyPassiveAbility | null
  deathwish: Deathwish | null
  data: EnemyData
  image: string
  token?: boolean
  // animation fields
  hp_delta?: number | null
  already_jumped?: boolean
  locked?: boolean
  dmg_delta?: number | null
  p_dmg_delta?: number | null
  damages_player?: boolean | null
  spawning?: boolean | null
  incr_dmg?: boolean | null
  healing?: boolean | null
  trigger_deck_passive?: boolean
  trigger_grave_passive?: boolean
}

export interface EnemyLeader {
  id: number
  name: string
  faction: string
  ability: EnemyLeaderAbility
  passive_ability: EnemyPassiveAbility
  data: EnemyLeaderData
  image: string
  deathwish?: Deathwish | null
  locked?: boolean
  // animation fields
  hp_delta?: number | null
}

export interface Deck {
  id: number
  name: string
  leader_id: number
  cards: number[]
  health: number
}

export interface UserDeck {
  user_deck_id: number
  deck: Deck
}

export interface UserCard {
  user_card_id: number
  count: number
}

export interface UserLeader {
  user_leader_id: number
  count: number
}

export type LevelDifficulty = "easy" | "normal" | "hard"

export interface LevelRelatedLevel {
  related_level_id: number | null
  line: string | null
  connection: string | null
}

export interface Level {
  id: number
  name: string
  starting_enemies_number: number
  difficulty: LevelDifficulty
  x: number
  y: number
  enemy_leader: number
  enemies: number[]
  children: LevelRelatedLevel[]
}

export interface UserLevel {
  id: number | null
  unlocked: boolean
  finished: boolean | null
  level: Level
}

export interface SeasonRelatedSeason {
  related_season_id: number | null
  line: string | null
  connection: string | null
}

export interface Season {
  id: number
  name: string
  description: string
  x: number
  y: number
  levels: UserLevel[]
  children: SeasonRelatedSeason[]
}

export interface Stats {
  total_levels: number
  finished_levels: number
  unlocked_levels: number
  easy_levels: number
  normal_levels: number
  hard_levels: number
}

export interface UserSeason {
  id: number | null
  finished: boolean | null
  season: Season
  stats: Stats
}

export interface UserResources {
  scraps: number
  raw_bronze: number
  raw_silver: number
  raw_gold: number
  bronze_ingots: number
  silver_ingots: number
  gold_ingots: number
  crops: number
  wood: number
  silk: number
  kegs: number
  big_kegs: number
  chests: number
  keys: number
  rare_gem: number
  money: number
  flowers: number
  first_aid_kits: number
  shields: number
}

export interface CardsResponse {
  cards: Card[]
  leaders: Leader[]
  enemies: Record<number, Enemy>
  enemy_leaders: Record<number, EnemyLeader>
}

export interface UserProgressResponse {
  user_resources: UserResources
  user_cards: Record<number, UserCard>
  user_leaders: Record<number, UserLeader>
  user_decks: UserDeck[]
  user_seasons: UserSeason[]
}

export interface ListDecksResponse {
  decks: UserDeck[]
}

export interface CardCraftMillResponse {
  cards: Record<number, UserCard> | Record<number, UserLeader>
  resources: UserResources
}

export interface CardCraftBonusResponse {
  cards: Record<number, UserCard>
}

export interface OpenRelatedLevelsResponse {
  seasons: UserSeason[]
}

export interface ArenaRewardMultiply {
  base: number
  delta: number
}

export interface ArenaParams {
  enter_price: UserResources
  base_enemies: number
  delta_enemies: number
  cooldown_fix_draw: number
  win_multiply: Partial<Record<keyof UserResources, ArenaRewardMultiply>>
}

interface Multiplayer {
  max_enemies: Record<string, number>
}

export interface GameConst {
  max_random_n_enemies: number
  random_level_enemies_count: Record<string, unknown>
  resources_transitions: Record<string, unknown>
  keys_rewards: Record<string, unknown>
  win_level_rewards: Record<string, unknown>
  start_level_prices: Record<string, unknown>
  cards_resources_prices: Record<string, unknown>
  upgrades: typeof Upgrades
  arena_upgrades: Record<string, unknown>
  arena_params: ArenaParams
  multiplayer: Multiplayer
}

export interface Faction {
  name: string
}

export interface CardEntry {
  card: Card
  count: number
  id: number | null
}

export interface LeaderEntry {
  card: Leader
  count: number
  id: number | null
}

export interface DeckCardEntry {
  card: Card | undefined
  count: 1
}

export interface MappedDeck {
  id: number
  name: string
  leader: Leader | undefined
  cards: DeckCardEntry[]
  health: number
}

export interface DeckEntry {
  id: number
  deck: MappedDeck
}

export interface MappedLevel extends Omit<Level, "enemy_leader" | "enemies"> {
  enemy_leader: EnemyLeader | undefined
  enemies: (Enemy | undefined)[]
}

export interface MappedUserLevel extends Omit<UserLevel, "level"> {
  level: MappedLevel
}

export interface MappedSeason extends Omit<Season, "levels"> {
  levels: MappedUserLevel[]
}

export interface SeasonEntry {
  id: number | null
  finished: boolean | null
  season: MappedSeason
  stats: Stats
}
