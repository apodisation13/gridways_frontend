export function purify(enemy) {
  enemy.deathwish = null
  enemy.has_deathwish = false
  enemy.passive_ability = null
  enemy.has_passive_in_field = false
  enemy.has_passive_in_grave = false
  enemy.has_passive_in_field = false
  enemy.has_passive = false
  enemy.status = null
  enemy.shield = false
}
