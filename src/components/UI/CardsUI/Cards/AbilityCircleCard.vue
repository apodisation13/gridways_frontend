<template>
  <div>
    <!--  Кружок абилок карт игрока и лидера игрока-->
    <heal-ability
      v-if="card.ability.name === CardAbility.Heal"
      :heal="card.heal"
    />

    <!--Дополнительные способности карт: урон на строку, столбец, всем, распределить, уничтожить, заблочить-->
    <row-attack-ability v-if="card.ability.name === CardAbility.DamageRow" />
    <column-attack-ability
      v-else-if="card.ability.name === CardAbility.DamageColumn"
    />
    <all-attack-ability
      v-else-if="card.ability.name === CardAbility.DamageAll"
    />
    <spread-attack-ability
      v-else-if="card.ability.name === CardAbility.SpreadDamage"
    />
    <lock-ability v-else-if="card.ability.name === CardAbility.Lock" />
    <destroy-ability
      v-else-if="
        card.ability.name === CardAbility.DestroyHighestHp ||
        card.ability.name === CardAbility.DestroyHighestDamage ||
        card.ability.name === CardAbility.DestroyRandom ||
        card.ability.name === CardAbility.DestroyAllSameHp ||
        card.ability.name === CardAbility.DestroyRandomEnemyInDeck
      "
    />
    <card-interaction-ability
      v-else-if="
        card.ability.name === CardAbility.Resurrect ||
        card.ability.name === CardAbility.DrawTwoCards ||
        card.ability.name === CardAbility.GiveChargesToCardInHand1 ||
        card.ability.name === CardAbility.PlayFromDeck ||
        card.ability.name === CardAbility.DiscardDraw2 ||
        card.ability.name === CardAbility.PlayFromDeck ||
        card.ability.name === CardAbility.IncrDmgToHandBySelfDmg ||
        card.ability.name === CardAbility.PlayEnemyFromGrave ||
        card.ability.name === CardAbility.PlaySpecialFromDeck ||
        card.ability.name === CardAbility.PlaySpecialFromGrave ||
        card.ability.name === CardAbility.DecrDmgToHandIncrToRandomHand ||
        card.ability.name === CardAbility.IncrDmgByNCharges ||
        card.ability.name === CardAbility.CreateSpecial ||
        card.ability.name === CardAbility.CreateAnyUnit ||
        card.ability.name === CardAbility.CreateAndPutToDeck ||
        card.ability.name === CardAbility.DrawExact
      "
    />
    <field-interaction-ability
      v-else-if="
        card.ability.name === CardAbility.MoveEnemy ||
        card.ability.name === CardAbility.SetEnemyAsToken ||
        card.ability.name === CardAbility.PlaceSelfInField ||
        card.ability.name === CardAbility.SpawnEffectInRow
      "
    />
  </div>
</template>

<script>
import HealAbility from "@/components/UI/CardsUI/HealAbility"
import RowAttackAbility from "@/components/UI/CardsUI/Cards/Abilities/RowAttackAbility"
import ColumnAttackAbility from "@/components/UI/CardsUI/Cards/Abilities/ColumnAttackAbility"
import AllAttackAbility from "@/components/UI/CardsUI/Cards/Abilities/AllAttackAbility"
import SpreadAttackAbility from "@/components/UI/CardsUI/Cards/Abilities/SpreadAttackAbility"
import LockAbility from "@/components/UI/CardsUI/Cards/Abilities/LockAbility"
import DestroyAbility from "@/components/UI/CardsUI/Cards/Abilities/DestroyAbility"
import CardInteractionAbility from "@/components/UI/CardsUI/Cards/Abilities/CardInteractionAbility"
import FieldInteractionAbility from "@/components/UI/CardsUI/Cards/Abilities/FieldInteractionAbility.vue"
import { CardAbility } from "@/logic/models"
export default {
  name: "card-ability-circle",
  computed: {
    CardAbility() {
      return CardAbility
    },
  },
  components: {
    FieldInteractionAbility,
    CardInteractionAbility,
    DestroyAbility,
    LockAbility,
    HealAbility,
    RowAttackAbility,
    ColumnAttackAbility,
    AllAttackAbility,
    SpreadAttackAbility,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped></style>
