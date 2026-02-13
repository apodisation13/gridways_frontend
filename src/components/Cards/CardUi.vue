<template>
  <div class="card-outer" :class="cardRarityClass">
    <div class="card-border">
      <div class="card-body">
        <div
          class="card-item"
          :style="[
            { backgroundImage: `url(${card.image})` },
            card_margin(card),
          ]"
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
      if (!this.card.color) return ""
      const color = this.card.color.toLowerCase()
      if (["gold", "silver", "bronze"].includes(color)) {
        return color
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
}

/* Золотая карта */
.card-outer.gold {
  --border-dark: #8b6914;
  --border-light: #f5ca5a;
  --glow-color: rgba(245, 202, 90, 0.5);
  --border-width: 1.5%;
  --glow-intensity: 158px;
}

/* Серебряная карта */
.card-outer.silver {
  --border-dark: #5a5a6e;
  --border-light: #c0c0d0;
  --glow-color: rgba(192, 192, 208, 0.5);
  --border-width: 1%;
  --glow-intensity: 20px;
}

/* Бронзовая карта */
.card-outer.bronze {
  --border-dark: #6b3510; /* Темнее, чтобы отличалась от золота */
  --glow-color: rgba(160, 103, 63, 0.25);
  --glow-intensity: 1px;
}

.card-border {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: var(--border-width);
  /* Металлический градиент */
  background:
    linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 60%
    ),
    linear-gradient(
      180deg,
      var(--border-light) 0%,
      var(--border-dark) 30%,
      var(--border-dark) 70%,
      var(--border-light) 100%
    ),
    linear-gradient(
      90deg,
      var(--border-dark) 0%,
      var(--border-light) 50%,
      var(--border-dark) 100%
    );

  background-blend-mode: overlay, normal, normal;
  border-radius: 6px;
  border: 1px solid var(--border-light);

  box-shadow:
    0 0 var(--glow-intensity) var(--glow-color),
    0 3px 8px rgba(0, 0, 0, 0.4),
    inset 1px 1px 3px rgba(255, 255, 255, 0.2),
    inset -1px -1px 3px rgba(0, 0, 0, 0.3);
}

/* Внутренняя линия рамки */
.card-border::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  pointer-events: none;
  z-index: 0;
}

/* Контейнер для контента карты */
.card-body {
  position: relative; /*ВОТ ЭТО влияет на 2ю рамку!*/
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
  background-size: cover;
  border-radius: 2px;
  overflow: hidden;
}

.disable::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgb(0, 0, 0, 0.7);
  z-index: 1;
}

.card-item-information {
  z-index: 2;
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
