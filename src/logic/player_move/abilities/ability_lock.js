function lock_enemy(enemy) {
  enemy.shield = false
  enemy.passive_ability = null
  enemy.has_deathwish = false
  enemy.deathwish = null
  enemy.locked = true
}

export { lock_enemy }
