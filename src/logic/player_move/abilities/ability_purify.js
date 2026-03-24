export function purify(enemy) {
  enemy.deathwish = null
  enemy.has_deathwish = false
  enemy.passive_ability = null
  enemy.has_passive = null
  enemy.status = null
  enemy.shield = null
}
