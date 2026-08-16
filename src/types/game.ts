import type { Card, Enemy, EnemyLeader, Leader } from "./database"

export type CardLocation = "hand" | "deck" | "grave" | "field" | null

export enum EffectType {
  Mine = "mine", // times_count
  LightMine = "light_mine", // times_count
  Rain = "rain", // turns
  Frost = "frost", // times_count
  Spikes = "spikes", // turns
  Veil = "veil", // turns
  Purify = "purify", // turns
  Lock = "lock", // turns
  MiddleMine = "middle_mine", // times_count
  Poison = "poison", // times_count
  // negative effects
  Heal = "heal", //
  IncrDmg = "incr_dmg", //
}

export type EffectObject = {
  type: EffectType
  value?: number
  turns?: number
  times_count?: number
  negative?: boolean
}

export interface GameObj {
  deck: Card[]
  hand: Card[]
  leader: Leader
  grave: Card[]
  field: (Enemy | "")[]
  enemy_leader: EnemyLeader
  enemies: Enemy[]
  enemies_grave: Enemy[]
  effects: (EffectObject | "")[]
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
  DamageOne = "damage-one",
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
  AddInvulnerability = "add-invulnerability",
  AddDamageToLeader = "add-damage-to-leader",
  AddChargesToLeader = "add-charges-to-leader",
  DestroyWithPassive = "destroy-with-passive",
  DestroyAllWithPassive = "destroy-all-with-passive",
  DestroyWithDeathwish = "destroy-with-deathwish",
  DestroyAllWithDeathwish = "destroy-all-with-deathwish",
  DestroyWithStatus = "destroy-with-status",
  ReplaceLeader = "replace-leader",
  TakeEnemyToHand = "take-enemy-to-hand",
  IncrEffects = "incr-effects",
  RemoveEffects = "remove-effects",
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
  MoveEnemyFromDeckToDeck = "move-enemy-from-deck-to-deck",
  CreateEnemyAndPutToDeck = "create-enemy-and-put-to-deck",
  MoveEnemyFromGraveToDeck = "move-enemy-from-grave-to-deck",
  MoveEnemyFromDeckToHand = "move-enemy-from-deck-to-hand",
  // Effects
  SpawnEffect = "spawn-effect",
  SpawnEffectRow = "spawn-effect-row",
  SpawnEffectColumn = "spawn-effect-column",
}

export enum CardPassiveAbility {
  DamageRandomEnemy = "damage-random-enemy",
  IncrDmgTo = "incr-dmg-to",
  HealLeader = "heal-leader",
  IncrSelfDmg = "incr-self-dmg",
  DestroyTwoEnemies = "destroy-2-enemies",
  SetDmgAsRandomEnemyGrave = "set-dmg-as-random-enemy-grave",
  IncrDmgByNEnemiesGrave = "incr-dmg-by-n-enemies-grave",
  IncrDmgByLenDeck = "incr-dmg-by-len-deck",
  SpawnRandomInHand = "spawn-random-in-hand",
  IncrDmgByNGrave = "incr-dmg-by-n-grave",
  PoisonRandom = "poison-random",
  PoisonAll = "poison-all",
  AddArmor = "add-armor",
  SpawnRandomEnemyInHand = "spawn-random-enemy-in-hand",
  PassiveLock = "passive-lock",
  DestroyWithPassive = "destroy-with-passive",
  DestroyWithStatus = "destroy-with-status",
  RemovePassive = "remove-passive",
  SpawnRandomEnemyInDeck = "spawn-random-enemy-in-deck",
  RemoveDeathwish = "remove-deathwish",
  RemoveShield = "remove-shield",
  // effects
  SpawnEffect = "spawn-effect",
  SpawnEffectRandom = "spawn-effect-random",
  IncrEffect = "incr-effect",
  RemoveEffect = "remove-effect",
  // upon beginning, once time
  SetSelfAsDeckLen = "set-self-as-deck-len",
  // upon playing a card
  DamageWheneverLock = "damage-whenever-lock",
  // grave
  IfInGraveSpawnSelfInEnemyGrave = "if-in-grave-spawn-self-in-enemy-grave",
  // leader passives
  AddChargesToLeaderIfPlayDAll = "add-charges-to-leader-if-play-d-all",
  AddChargesToLeaderIfPlaySpecial = "add-charges-to-leader-if-play-special",
  AddChargesToLeaderIfOverkill = "add-charges-to-leader-if-overkill",
  AddChargesToLeaderIfGoldEntersGrave = "add-charges-to-leader-if-gold-enters-grave",
}

export enum EnemyMove {
  Stand = "stand",
  Random = "random",
  Down = "down",
  Right = "right",
  // enemy leader abilities (enemy_leader_ai_move_once)
  DamageOnce = "damage-once",
  DecreaseAllPlayerDamage = "decrease-all-player-damage",
}

export enum EnemyPassive {
  IncrSelfDmg = "incr-self-dmg",
  HealSelf = "heal-self",
  HealLeader = "heal-leader",
  RegainShield = "regain-shield",
  HealAll = "heal-all",
  HealRandom = "heal-random",
  IncrRandomDmg = "incr-random-dmg",
  DecrPlayerDmg = "decr-player-dmg",
  SetHpRandomGrave = "set-hp-random-grave",
  SetDmgAsHighestHand = "set-dmg-as-highest-hand",
  SetDmgRandomGrave = "set-dmg-random-grave",
  HealSelfByHighestHp = "heal-self-by-highest-hp",
  HealRow = "heal-row",
  HealColumn = "heal-column",
  IncrDmgRow = "incr-dmg-row",
  IncrDmgColumn = "incr-dmg-column",
  SpawnSelfInDeck = "spawn-self-in-deck",
  SpawnTokensInDeck = "spawn-tokens-in-deck",
  SpawnToken = "spawn-token",
  SpawnRandomToken = "spawn-random-token",
  GiveShield = "give-shield",
  SpawnFactionUnit = "spawn-faction-unit",
}

export enum EnemyDeathwish {
  SpawnSelf = "spawn-self",
  SpawnTokens = "spawn-tokens",
  IncrDmgToHandByValue = "incr-dmg-to-hand-by-value",
  HealAll = "heal-all",
  SpawnSelfAtDeck = "spawn-self-at-deck",
  DestroyRandomCardInPlayerDeck = "destroy_random_card_in_player_deck",
  SetHp = "set_hp",
  SpawnTokensAtDeck = "spawn-tokens-at-deck",
  SpawnSelfAtGrave = "spawn-self-at-grave",
  GiveShieldsToAll = "give-shields-to-all",
  GiveShieldsToAllDeck = "give-shields-to-all-deck",
  SetWeakestHpAsHighest = "set-weakest-hp-as-highest",
  SpawnFactionUnit = "spawn-faction-unit",
  SpawnFactionUnitAtDeck = "spawn-faction-unit-at-deck",
  SpawnUnit = "spawn-unit",
}
