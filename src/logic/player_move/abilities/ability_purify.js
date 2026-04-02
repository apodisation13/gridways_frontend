export function purify(enemy) {
  enemy.deathwish = null
  enemy.has_deathwish = false
  enemy.passive_ability = null
  enemy.status = null
  enemy.shield = false
}
