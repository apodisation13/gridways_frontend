<template>
  <div>
    <!--  Кружок абилок карт игрока и лидера игрока-->
    <heal-ability
      v-if="card.ability.name === CardAbility.Heal"
      :heal="card.data.heal"
    />

    <!--Дополнительные способности карт: урон на строку, столбец, всем, распределить, уничтожить, заблочить-->
    <ability-icon
      v-if="card.ability.name === CardAbility.DamageRow"
      :icon="require('@/assets/icons/card/row_attack.svg')"
    />
    <ability-icon
      v-else-if="card.ability.name === CardAbility.DamageColumn"
      :icon="require('@/assets/icons/card/column_attack.svg')"
    />
    <ability-icon
      v-else-if="card.ability.name === CardAbility.DamageAll"
      :icon="require('@/assets/icons/card/all_attack.svg')"
    />
    <ability-icon
      v-else-if="card.ability.name === CardAbility.SpreadDamage"
      :icon="require('@/assets/icons/card/spread_attack.svg')"
    />
    <ability-icon
      v-else-if="card.ability.name === CardAbility.Lock"
      :icon="require('@/assets/icons/card/locked.svg')"
    />
    <ability-icon
      v-else-if="
        card.ability.name === CardAbility.DestroyHighestHp ||
        card.ability.name === CardAbility.DestroyHighestDamage ||
        card.ability.name === CardAbility.DestroyRandom ||
        card.ability.name === CardAbility.DestroyAllSameHp ||
        card.ability.name === CardAbility.DestroyRandomEnemyInDeck
      "
      :icon="require('@/assets/icons/card/destroy.svg')"
    />
    <ability-icon
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
      :icon="require('@/assets/icons/card/additional_card.svg')"
    />
    <ability-icon
      v-else-if="
        card.ability.name === CardAbility.MoveEnemy ||
        card.ability.name === CardAbility.SetEnemyAsToken ||
        card.ability.name === CardAbility.PlaceSelfInField ||
        card.ability.name === CardAbility.SpawnEffectInRow
      "
      :icon="require('@/assets/icons/card/field_interaction.svg')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import HealAbility from "@/components/UI/CardsUI/HealAbility.vue"
import { CardAbility } from "@/types"
import AbilityIcon from "@/components/UI/CardsUI/Cards/Abilities/AbilityIcon.vue"
import type { Card, Leader } from "@/types"
export default defineComponent({
  name: "card-ability-circle",
  computed: {
    CardAbility() {
      return CardAbility
    },
  },
  components: {
    AbilityIcon,
    HealAbility,
  },
  props: {
    card: {
      type: Object as PropType<Card | Leader>,
      required: true,
    },
  },
})
</script>

<style scoped></style>
