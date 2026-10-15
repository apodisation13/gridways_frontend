import { run_passive } from "@/logic/player_move/passive_abilities/passives_dispatcher"
import store from "@/store"
import type { Card, GameObj } from "@/types"

function hasActivePassive(card: Card, place: "hand" | "deck" | "grave") {
  const p = card.data?.passive
  if (!p) return false

  const flag =
    place === "hand"
      ? p.has_passive_in_hand
      : place === "deck"
        ? p.has_passive_in_deck
        : p.has_passive_in_grave

  if (!flag) return false

  const hasTimer = p.timer !== undefined || p.default_timer !== undefined
  if (!hasTimer) return true

  if (p.timer !== undefined && p.default_timer === undefined) return false
  return !(p.timer === 0 && !p.reset_timer)
}

export function player_passive_abilities_end_turn(
  gameObj: GameObj,
  timeOut = 1000
): void {
  store.commit("set_ppa_end_turn", true) // установили флаг начала пассивок

  const { hand, deck, grave, leader } = gameObj

  // здесь мы создаем пул карт, для которых нужны пассивки!
  let pool: any[] = hand.filter(c => hasActivePassive(c, "hand")) // собрали пассивные карты из руки
  if (leader.passive_ability?.name) pool.push(leader) // добавили туда ещё и лидера если у него есть пассивка
  pool = pool.concat(deck.filter(c => hasActivePassive(c, "deck"))) // собрали пассивные карты из колоды
  pool = pool.concat(grave.filter(c => hasActivePassive(c, "grave"))) // собрали пассивные карты из сброса

  let i = 0
  // вот именно в такой последовательности они и будут работать: рука, лидер, колода, сброс
  let passive_time = setInterval(() => {
    if (i === pool.length) {
      // если мы дошли до конца, сбрасываем интервал и выходим
      clearInterval(passive_time)
      store.commit("set_ppa_end_turn", false)
    } else {
      // МЕНЕДЖЕР пассивных абилок карт: рука, лидер, колода, сброс
      console.log("Выполняем пассивку номер", i)
      if (pool[i].data.passive?.has_passive_in_hand || !pool[i].color)
        run_passive(pool[i], gameObj, "hand", timeOut)
      else if (pool[i].data.passive?.has_passive_in_deck)
        run_passive(pool[i], gameObj, "deck", timeOut)
      else if (pool[i].data.passive?.has_passive_in_grave)
        run_passive(pool[i], gameObj, "grave", timeOut)
      i += 1
    }
  }, timeOut)
}
