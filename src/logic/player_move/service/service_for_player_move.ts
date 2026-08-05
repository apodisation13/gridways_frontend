import { Card, CardAbility, Enemy, EnemyLeader, Leader } from "@/types"

// сбрасываем карту из руки или из колоды в сброс, если у нее 0 зарядов
// если лидер - не сбрасываем его никуда (у него нет card.color)
export function remove_dead_card(
  card: Card | Leader,
  grave: Card[],
  hand: Card[],
  deck: Card[]
): void {
  if (card.data.charges > 0) return // если у карты зарядов не 0, ничего делать не нужно
  if ((card as Card).color === undefined) return // случай лидера, его не надо сбрасывать никуда

  grave.push(card as Card) // поместили карту в кладбище

  // если такая карта есть в руке, удаляем её из руки, если есть в колоде - удаляем из колоды
  if (hand.indexOf(card as Card) !== -1) {
    hand.splice(hand.indexOf(card as Card), 1)
    // alert('удалили карту из руки')
  } else if (deck.indexOf(card as Card) !== -1) {
    deck.splice(deck.indexOf(card as Card), 1)
    // alert('удалили карту из колоды')
  }
}

// собирает всех врагов на поле в один список + лидера врагов
export function get_all_enemies(
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null | undefined
): (Enemy | EnemyLeader)[] {
  let enemy_list: (Enemy | EnemyLeader)[] = []
  field.forEach(enemy => {
    if (enemy) {
      enemy_list.push(enemy)
    }
  })
  if (enemy_leader && enemy_leader.data.hp > 0) enemy_list.push(enemy_leader)
  return enemy_list
}

// взять рандомного врага из всех врагов
export function get_random_enemy(
  field: (Enemy | "")[],
  enemy_leader: EnemyLeader | null | undefined
): Enemy | EnemyLeader {
  let enemies_list = get_all_enemies(field, enemy_leader)
  let random = Math.floor(Math.random() * enemies_list.length)
  return enemies_list[random]
}

// собирает пустые клетки на поле (для deathwish появления, например)
export function get_empty_field_indexes(field: (Enemy | "")[]): number[] {
  let emptyIndexesArray: number[] = []
  for (let i = 0; i < field.length; i++) {
    if (!field[i] || (field[i] as Enemy).data.hp <= 0) emptyIndexesArray.push(i)
  }
  return emptyIndexesArray
}

export function change_card_charges(
  card: Card | Leader,
  value: number,
  timeout = 1000
): void {
  card.data.charges += value
  // а это для анимации изменения зарядов
  card.charges_delta = value
  setTimeout(() => {
    card.charges_delta = null
  }, timeout * 0.5)
}

export function enemy_as_card(enemy: Enemy, charges: number): Card {
  return {
    id: enemy.id,
    name: enemy.name,
    unlocked: true,
    faction: enemy.faction,
    color: enemy.color,
    type: "Unit",
    ability: {
      name: CardAbility.DamageOne,
      description: "Нанести {damage} урона одному врагу",
    },
    passive_ability: {
      name: null,
      description: null,
    },
    data: {
      damage: enemy.data.damage,
      charges,
      hp: enemy.data.hp,
      base: {
        base_damage: enemy.data.base.base_damage ?? enemy.data.damage,
        base_charges: charges,
        base_hp: enemy.data.base.base_hp,
      },
      passive: {},
      value: enemy.data.value,
      field_interaction: null,
    },
    image: enemy.image,
    newly_added: false,
  }
}
