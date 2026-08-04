import { choice_element } from "@/lib/utils"
import store from "@/store"
import { GameObj, type LeaderEntry } from "@/types"

export function replace_leader(gameObj: GameObj): void {
  const all_leaders: LeaderEntry[] = store.getters["all_leaders"]
  const random_leader = choice_element(all_leaders)
  gameObj.leader = random_leader.card
}
