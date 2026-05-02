import type { Card, Enemy, EnemyLeader, Leader } from "./database"

export interface GameObj {
  deck: Card[]
  hand: Card[]
  leader: Leader
  grave: Card[]
  field: (Enemy | "")[]
  enemy_leader: EnemyLeader
  enemies: Enemy[]
  enemies_grave: Enemy[]
}

export interface IsActive {
  player_cards: boolean
  player_leader: boolean
  enemy_cards: boolean
  enemy_leader: boolean
}

export enum CardType {
  Unit = "Unit",
  Special = "Special",
}

export enum CardColor {
  Bronze = "Bronze",
  Silver = "Silver",
  Gold = "Gold",
}

export enum EnemyStatus {
  Veil = "veil",
  Poison = "poison",
  Doomed = "doomed",
}

export enum CardAbility {
  Heal = "heal",
  DamageAll = "damage-all",
  SpreadDamage = "spread-damage",
  DamageRow = "damage-row",
  DamageColumn = "damage-column",
  DestroyHighestHp = "destroy-highest-hp",
  DestroyHighestDamage = "destroy-highest-damage",
  DestroyRandom = "destroy-random",
  DestroyAllSameHp = "destroy-all-same-hp",
  Lock = "lock",
  MoveEnemy = "move-enemy",
  SetEnemyAsToken = "set-enemy-as-token",
  SpawnSelfAtDeck = "spawn-self-at-deck",
  SpawnSelfAtGrave = "spawn-self-at-grave",
  DestroyRandomEnemyInDeck = "destroy-random-enemy-in-deck",
  PlaceSelfInField = "place-self-in-field",
  SetLowestDmgToAsHighest = "set-lowest-dmg-to-as-highest",
  SpawnTokensAtEnemyDeck = "spawn-tokens-at-enemy-deck",
  IncrDmgToAllHand = "incr-dmg-to-all-hand",
  IncrDmgToAllGrave = "incr-dmg-to-all-grave",
  Poison = "poison",
  PoisonAll = "poison-all",
  Purify = "purify",
  AddArmor = "add-armor",
  GiveChargesToAll = "give-charges-to-all",
  // special case abilities
  Resurrect = "resurrect",
  DrawTwoCards = "draw-two-cards",
  GiveChargesToCardInHand1 = "give-charges-to-card-in-hand-1",
  PlayFromDeck = "play-from-deck",
  PlayFromGrave = "play-from-grave",
  DiscardDraw2 = "discard-draw-2",
  PlayBronzeSilverFromDeck = "play-bronze-silver-from-deck",
  IncrDmgToHandBySelfDmg = "incr-dmg-to-hand-by-self-dmg",
  PlayEnemyFromGrave = "play-enemy-from-grave",
  PlaySpecialFromDeck = "play-special-from-deck",
  PlaySpecialFromGrave = "play-special-from-grave",
  MoveEnemyFromDeckToGrave = "move-enemy-from-deck-to-grave",
  DecrDmgToHandIncrToRandomHand = "decr-dmg-to-hand-incr-to-random-hand",
  IncrDmgByNCharges = "incr-dmg-by-n-charges",
  CreateSpecial = "create-special",
  CreateAnyUnit = "create-any-unit",
  CreateAndPutToDeck = "create-and-put-to-deck",
  DrawExact = "draw-exact",
  // пока нету
  SpawnEffectInRow = "spawn-effect-in-row",
}
