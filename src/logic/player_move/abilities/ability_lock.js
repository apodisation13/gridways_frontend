function lock_enemy(enemy) {
  enemy.shield = false
  enemy.passive_ability = null
  enemy.deathwish = null
  enemy.locked = true
}

export { lock_enemy }
