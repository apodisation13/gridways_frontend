<template>
  <div class="card-outer" :class="cardRarityClass">
    <div class="card-body">
      <div
        class="card-enemy"
        :class="{ 'not-charges': enemy.hp <= 0 }"
        :style="[
          { backgroundImage: `url(${enemy.image})` },
          card_margin(enemy),
        ]"
      ></div>
      <div class="card-enemy-information">
        <!--Иконка хода для всех врагов, а лидеру врагов не надо, отсюда и условие-->
        <ability-circle-enemy :enemy="enemy" v-if="enemy.move" />
        <!--Иконка урона, для всех врагов или если у лидера врага есть урон-->
        <card-damage-icon
          v-if="enemy.damage"
          :style="background_color(enemy)"
          :damage="enemy.damage"
        />
        <card-passive v-if="enemy.has_passive" :card="enemy" />
        <enemy-shield v-if="enemy.shield" />
        <enemy-locked v-if="enemy.locked" />
        <deathwish-ability v-if="enemy.has_deathwish" />
        <heart-icon
          :health="enemy.hp"
          :bgColor="background_color_hp(enemy.color)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  background_color,
  background_color_hp,
  card_margin,
} from "@/logic/border_styles"
import DeathwishAbility from "@/components/UI/CardsUI/Enemies/DeathwishAbility"
import HeartIcon from "@/components/UI/CardsUI/HeartIcon"
import CardDamageIcon from "@/components/UI/CardsUI/CardDamageIcon"
import EnemyLocked from "@/components/UI/CardsUI/Enemies/EnemyLocked"
import AbilityCircleEnemy from "@/components/UI/CardsUI/Enemies/AbilityCircleEnemy"
import EnemyShield from "@/components/UI/CardsUI/Enemies/EnemyShield"
import CardPassive from "@/components/UI/CardsUI/CardPassive"

export default {
  name: "EnemyUi",
  components: {
    DeathwishAbility,
    HeartIcon,
    CardDamageIcon,
    EnemyLocked,
    AbilityCircleEnemy,
    EnemyShield,
    CardPassive,
  },
  props: {
    enemy: {
      required: true,
    },
  },
  computed: {
    cardRarityClass() {
      if (!this.enemy.color) return ""
      const color = this.enemy.color.toLowerCase()
      if (["gold", "silver", "bronze"].includes(color)) {
        return color
      }
      return ""
    },
  },
  methods: {
    card_margin(card) {
      return card_margin(card)
    },
    background_color(e) {
      return background_color(e)
    },
    background_color_hp(color) {
      return background_color_hp(color)
    },
  },
}
</script>

<style scoped>
.card-outer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  /* Рамка СНАРУЖИ через outline — не влияет на размеры! */
  outline: var(--border-width, 0px) solid var(--border-mid, #8b4513);
  outline-offset: 0;
  border-radius: 4px;

  /* Свечение */
  box-shadow:
    0 0 var(--glow-intensity, 0px) var(--glow-color, transparent),
    0 3px 8px rgba(0, 0, 0, 0.4);
}

/* Внутренняя линия рамки */
.card-outer::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: var(--inner-border, 0px) solid var(--border-dark, transparent);
  border-radius: 6px;
  pointer-events: none;
}

/* Внешняя линия рамки */
.card-outer::after {
  content: "";
  position: absolute;
  top: calc(-1 * var(--border-width, 0px) - 1px);
  left: calc(-1 * var(--border-width, 0px) - 1px);
  right: calc(-1 * var(--border-width, 0px) - 1px);
  bottom: calc(-1 * var(--border-width, 0px) - 1px);
  border: 1px solid var(--border-light, transparent);
  border-radius: 8px;
  pointer-events: none;

  /* Градиент заливки между рамками */
  background: linear-gradient(
    180deg,
    var(--border-light, transparent) 0%,
    var(--border-dark, transparent) 30%,
    var(--border-dark, transparent) 70%,
    var(--border-light, transparent) 100%
  );

  /* Маска — вырезаем центр, оставляем только рамку */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;

  padding: var(--border-width, 0px);
}

/* Золотая карта */
.card-outer.gold {
  --border-dark: #8b6914;
  --border-mid: #b8860b;
  --border-light: #f5ca5a;
  --border-width: 0.8%;

  --glow-color: rgba(245, 202, 90, 0.5);
  --glow-intensity: 15px;
}

/* Серебряная карта */
.card-outer.silver {
  --border-dark: #5a5a6e;
  --border-mid: #888898;
  --border-light: #c0c0d0;
  --border-width: 0.4%;
  --glow-color: rgba(192, 192, 208, 0.5);
  --glow-intensity: 10px;
}

/* Бронзовая карта — минимальная рамка */
.card-outer.bronze {
  --border-dark: #6b3510;
  --border-mid: #8b4513;
  --glow-color: rgba(160, 103, 63, 0.25);
  --glow-intensity: 3px;
}

/* КОНТЕНТ — без изменений, полный размер! */
.card-body {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
}

.card-enemy,
.card-enemy-information {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.card-enemy {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 2px;
  overflow: hidden;
}

.card-enemy-information {
  z-index: 2;
}

/* добавляем псевдоэлемент к семантичному селектору card-item-component*/
.not-charges::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
}

.card-outer {
  transition: box-shadow 0.3s ease;
}

.card-outer:hover .card-border {
  box-shadow:
    0 0 calc(var(--glow-intensity) * 1.5) var(--glow-color),
    0 5px 12px rgba(0, 0, 0, 0.5),
    inset 1px 1px 3px rgba(255, 255, 255, 0.3),
    inset -1px -1px 3px rgba(0, 0, 0, 0.3);
}
</style>
