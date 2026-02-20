<template>
  <div class="card-outer" :class="cardRarityClass">
    <div class="card-body">
      <div
        class="card-item"
        :style="[{ backgroundImage: `url(${card.image})` }, card_margin(card)]"
        :class="{ disable: count === 0 }"
      ></div>

      <div class="card-item-information" v-if="!is_previev">
        <special-type-of-card
          :color="card.color"
          v-if="card.type === 'Special'"
        />
        <card-damage-icon
          v-if="'damage' in card"
          :style="background_color(card)"
          :damage="card.damage"
        />
        <card-ability-circle :card="card" v-if="card.ability" />
        <card-passive :card="card" v-if="card.has_passive" />
        <card-charges
          v-if="'charges' in card"
          :charge="card.charges"
          :bgColor="background_color_charges(card.color)"
        />
        <heart-icon
          v-if="hp_needed"
          :health="card.hp"
          :bgColor="background_color_hp(card.color)"
        />
        <card-count-triangle
          v-if="deckbuilder || bonus"
          :count="count"
          :card-color="background_color_hp(card.color)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CardCountTriangle from "@/components/UI/CardsUI/Cards/CardCountTriangle"
import CardCharges from "@/components/UI/CardsUI/Cards/CardCharges"
import CardPassive from "@/components/UI/CardsUI/CardPassive"
import CardAbilityCircle from "@/components/UI/CardsUI/Cards/AbilityCircleCard"
import CardDamageIcon from "@/components/UI/CardsUI/CardDamageIcon"
import HeartIcon from "@/components/UI/CardsUI/HeartIcon"
import SpecialTypeOfCard from "@/components/UI/CardsUI/Cards/SpecialTypeOfCard"
import {
  background_color,
  background_color_charges,
  background_color_leader,
  background_color_hp,
  card_margin,
} from "@/logic/border_styles"

export default {
  name: "CardUi",
  components: {
    CardCountTriangle,
    CardCharges,
    CardPassive,
    CardAbilityCircle,
    CardDamageIcon,
    HeartIcon,
    SpecialTypeOfCard,
  },
  props: {
    // собственно сама карта
    card: {
      type: Object,
      required: true,
    },
    // брать ли границу карты как для карт (по цвету), ДЕФОЛТНОЕ, или как для лидеров (по фракции)
    is_leader: {
      type: Boolean,
      default: false,
    },
    // показывать или не показывать hp (в игре не нужны жизни, везде нужны)
    hp_needed: {
      type: Boolean,
      default: false,
    },
    // показывать или не показывать зону кнопок милл\крафт, только для декбилдера
    deckbuilder: {
      type: Boolean,
      default: false,
    },
    // на странице бонусов мы показываем count, но не показываем mill/craft
    bonus: {
      type: Boolean,
      default: false,
      required: false,
    },
    // сколько у юзера этой карты
    count: {
      type: Number,
    },
    // FIXME: че это
    is_previev: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    cardRarityClass() {
      if (!this.is_leader) {
        const color = this.card.color.toLowerCase()
        if (["gold", "silver", "bronze"].includes(color)) {
          return color
        }
        return ""
      }
      const faction = this.card.faction.toLowerCase()
      if (["soldiers", "monsters", "animals"].includes(faction)) {
        return faction
      }
      return ""
    },
  },
  methods: {
    background_color_hp(color) {
      return this.is_leader
        ? background_color_leader(this.card.faction)
        : background_color_hp(color)
    },
    background_color_charges(color) {
      return this.is_leader
        ? background_color_leader(this.card.faction)
        : background_color_charges(color)
    },
    background_color(card) {
      return background_color(card)
    },
    card_margin(card) {
      return card_margin(card)
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

/* Карта лидеров по фракциям */
.card-outer.soldiers {
  --border-dark: #0b3669;
  --border-mid: #1e4f8a;
  --border-light: #5a9cff;
  --border-width: 1.5%;
  --glow-color: rgba(90, 156, 255, 0.5);
  --glow-intensity: 15px;
}

/* Красная карта */
.card-outer.monsters {
  --border-dark: #b22222;
  --border-mid: #dc143c;
  --border-light: #ff4500;
  --border-width: 1.5%;
  --glow-color: rgba(255, 69, 0, 0.5);
  --glow-intensity: 15px;
}

/* Зеленая карта */
.card-outer.animals {
  --border-dark: #1e4d1e;
  --border-mid: #2e7d32;
  --border-light: #81c784;
  --border-width: 1.5%;
  --glow-color: rgba(76, 175, 80, 0.5);
  --glow-intensity: 15px;
}

/* КОНТЕНТ — без изменений, полный размер! */
.card-body {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
}

.card-item,
.card-item-information {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.card-item {
  background-repeat: no-repeat;
  background-position: center;
  /*background-size: cover;*/
  border-radius: 2px;
  overflow: hidden;
  background-size: 100% 100%;
}

.disable::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgb(0, 0, 0, 0.8);
  z-index: 1;
}

.card-item-information {
  z-index: 2;
}

/* Hover */
.card-outer:hover {
  box-shadow:
    0 0 calc(var(--glow-intensity, 0px) * 2) var(--glow-color, transparent),
    0 5px 15px rgba(0, 0, 0, 0.5);
}
</style>
