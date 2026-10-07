<template>
  <div>
    <div class="inlines-wrapper">
      <!--Описание абилки - для карты игрока и лидера врагов тоже-->
      <div
        v-if="!forEnemy && c.ability"
        class="inlines"
        :style="{ 'background-image': icon }"
        @click="showMainAbility"
      ></div>

      <!--Описание абилки хода - для карт врагов-->
      <div
        v-if="forEnemy"
        class="inlines"
        :style="{
          'background-image':
            'url(' +
            require(`@/assets/icons/enemy/enemy_move_${c.move.name}.svg`) +
            ')',
        }"
        @click="showMainAbility"
      ></div>

      <!--Описание пассивной абилки-->
      <card-passive
        v-if="card.passive_ability?.name"
        :card="c"
        inline
        @click="showPassiveAbility"
      />

      <!--Описание абилки deathwish - для карт врагов-->
      <div
        v-if="c.deathwish?.name"
        class="inlines"
        :style="{
          'background-image':
            'url(' + require(`@/assets/icons/enemy/deathwish.svg`) + ')',
        }"
        @click="showDeathwishAbility"
      ></div>
    </div>

    <div v-if="show_ability" class="text">{{ abilityDescription }}</div>
    <div v-if="show_passive" class="text">{{ passiveDescription }}</div>
    <div v-if="show_deathwish" class="text">{{ deathwishDescription }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardPassive from "@/components/UI/CardsUI/CardPassive.vue"
import { ability_icon } from "@/logic/border_styles"
import {
  describeCardAbility,
  describeCardPassiveAbility,
  describeEnemyDeathwish,
  describeEnemyMove,
} from "@/logic/card_descriptions"
import type { Card, Enemy, EnemyLeader, Leader } from "@/types"

export default defineComponent({
  name: "CardDescriptions",
  components: { CardPassive },
  props: {
    card: {
      type: Object as PropType<Card | Leader | Enemy | EnemyLeader>,
      required: true,
    },
    // отображать описание для врага или нет
    forEnemy: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      show_ability: true,
      show_passive: false,
      show_deathwish: false,
    }
  },
  computed: {
    c(): any {
      return this.card
    },
    icon(): string {
      return ability_icon((this.card as any)?.ability?.name)
    },
    abilityDescription(): string {
      return this.forEnemy
        ? describeEnemyMove(this.card)
        : describeCardAbility(this.card, this.effectsInfo)
    },
    passiveDescription(): string {
      return describeCardPassiveAbility(this.card, this.effectsInfo)
    },
    deathwishDescription(): string {
      return describeEnemyDeathwish(this.card, this.effectsInfo)
    },
    effectsInfo() {
      return this.$store.getters["effectsInfo"]
    },
  },
  created() {
    const c = this.card as any
    if (!c.ability && !c.move) {
      this.show_ability = false
      this.show_passive = true
    }
  },
  methods: {
    showMainAbility(): void {
      this.show_ability = true
      this.show_passive = false
      this.show_deathwish = false
    },
    showPassiveAbility(): void {
      this.show_ability = false
      this.show_passive = true
      this.show_deathwish = false
    },
    showDeathwishAbility(): void {
      this.show_ability = false
      this.show_passive = false
      this.show_deathwish = true
    },
  },
})
</script>

<style scoped>
.inlines-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.inlines {
  display: inline-block;
  margin: 1%;
  font-weight: bolder;
  border: solid 2px white;
  width: 50px;
  height: 5vh;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.text {
  white-space: pre-line;
  margin-bottom: 1%;
  font-size: 12pt;
}
</style>
