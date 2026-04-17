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
  data: Record<string, unknown>
  image: string
  newly_added: boolean
}

export interface Leader {
  id: number
  name: string
  unlocked: boolean
  faction: string
  ability: Ability
  passive_ability: PassiveAbility
  data: Record<string, unknown>
  image: string
  newly_added: boolean
}

export interface Enemy {
  id: number
  name: string
  faction: string
  color: string
  move: Move
  passive_ability: EnemyPassiveAbility
  deathwish: Deathwish
  data: Record<string, unknown>
  image: string
}

export interface EnemyLeader {
  id: number
  name: string
  faction: string
  ability: EnemyLeaderAbility
  passive_ability: EnemyPassiveAbility
  data: Record<string, unknown>
  image: string
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

export interface GameConst {
  hand_size: number
  number_of_cards_in_deck: number
  random_level_enemies_count: Record<string, unknown>
  max_random_n_enemies: number
  resources_transitions: Record<string, unknown>
  keys_rewards: Record<string, unknown>
  win_level_rewards: Record<string, unknown>
  start_level_prices: Record<string, unknown>
  cards_resources_prices: Record<string, unknown>
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
