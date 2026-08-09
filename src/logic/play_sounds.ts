import store from "@/store"

function sound(src: string): void {
  if (store.state.settings.soundOn) new Audio(src).play()
}

export function sound_hit_shield(): void {
  sound("./../../audio/sounds/hit_shield.wav")
}

export function sound_hit_armor(): void {
  sound("./../../audio/sounds/hit_armor.mp3")
}

export function sound_immune_hit(): void {
  sound("./../../audio/sounds/immune_hit.mp3")
}

export function sound_damage_all(): void {
  sound("./../../audio/sounds/damage_all.wav")
}

export function sound_damage_one(): void {
  sound("./../../audio/sounds/damage_one.wav")
}

export function sound_spread_damage(): void {
  sound("./../../audio/sounds/spread_damage.wav")
}

export function sound_damage_row(): void {
  sound("./../../audio/sounds/damage_row.wav")
}

export function sound_damage_column(): void {
  sound("./../../audio/sounds/damage_column.wav")
}

export function sound_heal(): void {
  sound("./../../audio/sounds/heal.wav")
}

export function sound_enemy_heal(): void {
  sound("./../../audio/sounds/heal_enemy.mp3")
}

export function sound_destroy_enemy(): void {
  sound("./../../audio/sounds/destroy_enemy.wav")
}

export function sound_passive_increase_damage(): void {
  sound("./../../audio/sounds/passive_increase_damage.wav")
}

export function sound_enemy_damage_player(): void {
  sound("./../../audio/sounds/enemy_damage_player.wav")
}

export function sound_enemy_move_down(): void {
  sound("./../../audio/sounds/enemy_move_down.wav")
}

export function sound_enemy_regain_shield(): void {
  sound("./../../audio/sounds/regain_shield.wav")
}

export function sound_enemy_decrease_player_damage(): void {
  sound("./../../audio/sounds/enemy_decrease_player_damage.wav")
}

export function sound_appear_new_enemy(): void {
  sound("./../../audio/sounds/appear_new_enemy.wav")
}

export function sound_lose_game(): void {
  sound("./../../audio/sounds/lose_game.wav")
}

export function sound_deathwish(): void {
  sound("./../../audio/sounds/deathwish.wav")
}

export function sound_timer_down(): void {
  sound("./../../audio/sounds/timer_count_down.wav")
}

export function lock_sound(): void {
  sound("./../../audio/sounds/lock_enemy.mp3")
}

export function mine_placed(): void {
  sound("./../../audio/sounds/mine_placed.mp3")
}

export function mine_triggerred(): void {
  sound("./../../audio/sounds/mine_triggerred.mp3")
}

export function rain_applied(): void {
  sound("./../../audio/sounds/rain_applied.mp3")
}

export function rain_triggerred(): void {
  sound("./../../audio/sounds/rain_triggerred.mp3")
}

export function lock_placed(): void {
  sound("./../../audio/sounds/lock_placed.mp3")
}

export function veil_placed(): void {
  sound("./../../audio/sounds/veil_placed.mp3")
}

export function veil_triggerred(): void {
  sound("./../../audio/sounds/veil_triggerred.mp3")
}
