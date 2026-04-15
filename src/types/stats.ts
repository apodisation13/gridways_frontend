export enum GameStatsRecordType {
  play = "play",
  win = "win",
}

export enum LeaderboardGameMode {
  arena = "arena",
  random = "random",
  random_n = "random_n",
  season = "season",
}

export interface FactionStats {
  play: number
  win: number
  winrate: number
}

export interface CollectionStats {
  total: number
  open: number
}

export interface ProgressStats {
  total: number
  finished: number
}

export interface UserStatistics {
  stats: Record<string, FactionStats>
  cards: CollectionStats
  leaders: CollectionStats
  seasons: ProgressStats
  levels: ProgressStats
}

export interface LeaderboardEntry {
  user_id: number
  username: string
  user_avatar: string
  faction_name: string
  leader_id: number
  max_kills: number
  mode: LeaderboardGameMode
}
