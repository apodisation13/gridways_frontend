export interface UserPreferences {
  theme: number
  avatar: string
  field?: string
  sound_on: boolean
  animation_on: boolean
  move_timeout: number
}

export interface UserPreferencesResponse {
  data: UserPreferences
}
