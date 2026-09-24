export interface UserPreferences {
  theme: number
  avatar: string
  field?: string
  sound_on: boolean
  animation_on: boolean
  help_on: boolean
  help_game_on?: boolean
  move_timeout: number
}

export interface UserPreferencesResponse {
  data: UserPreferences
}
