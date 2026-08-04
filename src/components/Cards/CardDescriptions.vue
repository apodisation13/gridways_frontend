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
        v-if="forEnemy && c.deathwish?.name"
        class="inlines"
        :style="{
          'background-image':
            'url(' + require(`@/assets/icons/enemy/deathwish.svg`) + ')',
        }"
        @click="showDeathwishAbility"
      ></div>
    </div>

    <!--А дальше сами описания!!!-->
    <!--Описание абилки для карты игрока и для лидера врагов у которого она есть вообще-->
    <div v-if="show_ability && !forEnemy && c?.ability?.name" class="text">
      {{ formatCardAbility(c) }} <br />
    </div>
    <div v-if="show_ability && !forEnemy && c.data?.multi" class="text">
      Карта бьет по {{ c.data.multi.value }} целям <br />
    </div>
    <!--Описание абилки для карты врага-->
    <div v-if="show_ability && forEnemy" class="text">
      {{ formatEnemyMove(c) }} <br />
    </div>
    <!--Описание пассивной абилки, разделение для карты или для лидера врагов-->
    <div v-if="show_passive && card.passive_ability?.name" class="text">
      {{ formatCardPassiveAbility(c) }} <br />
      <br />
      <span v-if="c.data.passive?.has_passive_in_field">
        Срабатывает когда карта <b>НА ПОЛЕ</b>
      </span>
      <span v-else-if="c.data.passive?.has_passive_in_hand">
        Срабатывает когда карта <b>В РУКЕ</b>
      </span>
      <span v-else-if="c.data.passive?.has_passive_in_deck">
        Срабатывает когда карта <b>В КОЛОДЕ</b>
      </span>
      <span v-else-if="c.data.passive?.has_passive_in_grave">
        Срабатывает когда карта <b>В СБРОСЕ</b>
      </span>
      <br />
      <span v-if="c.data?.passive?.each_tick">
        <b>Срабатывает каждый ход пока таймер не равен 0</b>
      </span>
      <br />
      <span v-if="c.data?.passive?.reset_timer">
        Восстанавливает таймер. Значение таймера
        {{ c.data.passive.default_timer }}
      </span>
    </div>
    <!--Описание абилки deathwish, только для врага-->
    <div v-if="show_deathwish && forEnemy && c?.deathwish?.name" class="text">
      {{ formatEnemyDeathwish(c) }} <br />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardPassive from "@/components/UI/CardsUI/CardPassive.vue"
import { ability_icon } from "@/logic/border_styles"
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
      show_move: true,
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
  },
  created() {
    const c = this.card as any
    if (!c.ability && !c.move) {
      this.show_ability = false
      this.show_passive = true
    }
  },
  methods: {
    formatCardAbility(card: any): string {
      return card.ability.description
        .replace(
          /{damage}/g,
          card.data?.damage !== undefined
            ? `{{ ${card.data.damage} }}`
            : "{damage}"
        )
        .replace(
          /{armor}/g,
          card.data?.armor !== undefined
            ? `{{ ${card.data.armor} }}`
            : "{armor}"
        )
        .replace(
          /{heal}/g,
          card.data?.heal !== undefined ? `{{ ${card.data.heal} }}` : "{heal}"
        )
        .replace(
          /{damage_once}/g,
          card.data?.value !== undefined
            ? `{{ ${card.data.value} }}`
            : "{damage_once}"
        )
        .replace(
          /{value}/g,
          card.data.passive?.value !== undefined
            ? `{{ ${card.data.passive.value} }}`
            : "{value}"
        )
        .replace(
          /{value}/g,
          card.data.value !== undefined ? `{{ ${card.data.value} }}` : "{value}"
        )
    },
    formatEnemyMove(enemy: any): string {
      return enemy.move.description.replace(
        /{damage}/g,
        enemy.data.damage !== undefined
          ? `{{ ${enemy.data.damage} }}`
          : "{damage}"
      )
    },
    formatCardPassiveAbility(card: any): string {
      return card.passive_ability.description.replace(
        /{value}/g,
        card.data.passive?.value !== undefined
          ? `{{ ${card.data.passive.value} }}`
          : "{value}"
      )
    },
    formatEnemyDeathwish(enemy: any): string {
      return enemy.deathwish.description.replace(
        /{deathwish_value}/g,
        enemy.data.deathwish?.value !== undefined
          ? `{{ ${enemy.data.deathwish.value} }}`
          : "{deathwish_value}"
      )
    },
    showMainAbility(): void {
      this.show_ability = true
      this.show_move = true
      this.show_passive = false
      this.show_deathwish = false
    },
    showPassiveAbility(): void {
      this.show_ability = false
      this.show_move = false
      this.show_passive = true
      this.show_deathwish = false
    },
    showDeathwishAbility(): void {
      this.show_ability = false
      this.show_move = false
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
  margin-bottom: 1%;
  font-size: 12pt;
}
</style>
