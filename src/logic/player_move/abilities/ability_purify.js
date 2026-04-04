export function purify(enemy) {
  enemy.deathwish = null
  enemy.passive_ability = null
  enemy.data.status = null
  enemy.data.shield = false
}
