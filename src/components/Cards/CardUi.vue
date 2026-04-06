<template>
  <div class="card-outer" :class="cardRarityClass">
    <div class="card-body">
      <div
        class="card-item"
        :style="[{ backgroundImage: `url(${card.image})` }, card_margin(card)]"
        :class="{ disable: count === 0 }"
      >
        <!-- анимация со значком меча на карте - по сути ход любой картой -->
        <transition name="damage">
          <div
            v-if="card.damages_enemy"
            class="damage-overlay"
            :style="{ '--flash-duration': flashDuration + 'ms' }"
          >
            <div class="damage-icon-wrap">
              <div class="damage-icon"></div>
              <span class="damage-icon-text">{{ -card.data.damage }}</span>
            </div>
          </div>
        </transition>
        <!-- анимация со значком меча на карте - пассивный урон от карты в руке -->
        <transition name="damage">
          <div
            v-if="card.p_damages_enemy"
            class="damage-overlay"
            :style="{ '--flash-duration': flashDuration + 'ms' }"
          >
            <div class="damage-icon-wrap">
              <div class="damage-icon"></div>
              <span class="damage-icon-text">
                {{ -card.data.passive.value }}
              </span>
            </div>
          </div>
        </transition>
        <!-- анимация со значком сердца на карте - пассивное лечение от карты в руке -->
        <transition name="heal">
          <div
            v-if="card.healing"
            class="heal-overlay"
            :style="{ '--flash-duration': flashDuration + 'ms' }"
          >
            <div class="heal-icon-wrap">
              <span class="heal-icon">💚</span>
              <span class="heal-icon-text">+{{ card.data.passive.value }}</span>
            </div>
          </div>
        </transition>
        <!-- анимация со значком яда на карте - яд от пассивной способности -->
        <transition name="poison">
          <div
            v-if="card.passive_poisoning"
            class="poison-overlay"
            :style="{ '--flash-duration': flashDuration + 'ms' }"
          >
            <div class="poison-icon-wrap">
              <img
                class="poison-icon"
                :src="require(`@/assets/icons/enemy/enemy_status_poison.svg`)"
                alt="poison"
              />
            </div>
          </div>
        </transition>
      </div>
      <!-- увеличение урона при ХОДЕ картой -->
      <div
        v-if="card.dmg_delta"
        class="dmg-anim"
        :style="{ '--flash-duration': flashDuration + 'ms' }"
      >
        <span class="dmg-anim-text">
          {{ card.dmg_delta > 0 ? "+" : "" }}{{ card.dmg_delta }}
        </span>
      </div>
      <!-- увеличение урона при ПАССИВНОЙ СПОСОБНОСТИ карты -->
      <div
        v-if="card.p_dmg_delta"
        class="dmg-anim"
        :style="{ '--flash-duration': flashDuration + 'ms' }"
      >
        <span class="dmg-anim-text">
          {{ card.p_dmg_delta > 0 ? "+" : "" }}{{ card.p_dmg_delta }}
        </span>
      </div>
      <!-- увеличение зарядов -->
      <div
        v-if="card.charges_delta"
        class="charges-anim"
        :style="{ '--flash-duration': flashDuration + 'ms' }"
      >
        <span class="charges-anim-text">
          {{ card.charges_delta > 0 ? "+" : "" }}{{ card.charges_delta }}
        </span>
      </div>
      <div class="card-item-information" v-if="!is_previev">
        <special-type-of-card
          :color="card.color"
          v-if="card.type === 'Special'"
        />
        <card-damage-icon
          v-if="'damage' in card.data"
          :style="background_color(card)"
          :damage="card.data.damage"
        />
        <card-ability-circle :card="card" v-if="card.ability" />
        <card-passive :card="card" v-if="card.passive_ability?.name" />
        <card-charges
          v-if="'charges' in card.data"
          :charge="card.data.charges"
          :bgColor="background_color_charges(card.color)"
        />
        <heart-icon
          v-if="hp_needed"
          :health="card.data.hp"
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
    flashDuration() {
      return this.$store.getters["selectedMoveTimeout"]
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

.heal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(46, 204, 64, 0.25);
  border-radius: inherit;
  --flash-duration: 500ms;
  animation: heal-pulse var(--flash-duration, 500ms) ease-out forwards;
}

.heal-icon-wrap {
  position: relative;
  display: inline-block;
}

.heal-icon {
  font-size: 3.5rem;
  display: block;
  line-height: 1;
  animation: heal-icon-pop var(--flash-duration, 500ms) ease-out forwards;
  filter: drop-shadow(0 0 8px rgba(46, 204, 64, 1));
}

.heal-icon-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

@keyframes heal-pulse {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes heal-icon-pop {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  40% {
    opacity: 1;
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

.poison-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 0, 200, 0.25);
  border-radius: inherit;
  --flash-duration: 500ms;
  animation: poison-pulse var(--flash-duration, 500ms) ease-out forwards;
}

.poison-icon-wrap {
  position: relative;
  display: inline-block;
}

.poison-icon {
  width: 3.5rem;
  height: auto;
  display: block;
  animation: poison-icon-pop var(--flash-duration, 500ms) ease-out forwards;
  filter: drop-shadow(0 0 8px rgba(80, 200, 50, 0.9));
}

@keyframes poison-pulse {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes poison-icon-pop {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  40% {
    opacity: 1;
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

.damage-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.25);
  border-radius: inherit;
  animation: damage-pulse var(--flash-duration, 500ms) ease-out forwards;
}

.damage-icon-wrap {
  position: relative;
  display: inline-block;
}

.damage-icon {
  width: 3.5rem;
  height: 3.5rem;
  background-image: url("~@/assets/icons/card/sword.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: invert(1) sepia(1) saturate(10) hue-rotate(300deg); /* красный цвет */
  animation: damage-icon-pop var(--flash-duration, 500ms) ease-out forwards;
}

.damage-icon-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

@keyframes damage-pulse {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.card-item {
  background-repeat: no-repeat;
  background-position: center;
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

.card-outer:hover {
  box-shadow:
    0 0 calc(var(--glow-intensity, 0px) * 2) var(--glow-color, transparent),
    0 5px 15px rgba(0, 0, 0, 0.5);
}

.dmg-anim {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 35%; /* больше оригинала (был 20%) */
  aspect-ratio: 1 / 1;
  transform: rotate(-45deg);
  background: rgba(220, 80, 0, 0.95);
  border-radius: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 50;
  animation: dmg-delta-pop var(--flash-duration, 500ms) ease-out forwards;
}

.dmg-anim-text {
  transform: rotate(45deg);
  font-weight: 900;
  color: white;
  font-size: 1rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

.charges-anim {
  position: absolute;
  bottom: -5%;
  right: -5%;
  width: 25%;
  aspect-ratio: 1 / 1;
  transform: rotate(-45deg);
  background: rgba(169, 169, 169, 0.95);
  border-radius: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 50;
  animation: dmg-delta-pop var(--flash-duration, 500ms) ease-out forwards;
}

.charges-anim-text {
  transform: rotate(45deg);
  font-weight: 900;
  color: white;
  font-size: 1rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

@keyframes dmg-delta-pop {
  0% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.3);
    box-shadow: none;
  }
  25% {
    opacity: 1;
    transform: rotate(-45deg) scale(1.4);
    box-shadow:
      0 0 16px 6px rgba(255, 100, 0, 0.9),
      0 0 32px 10px rgba(255, 100, 0, 0.5);
  }
  40% {
    transform: rotate(-48deg) scale(1.2); /* лёгкий наклон — эффект тряски */
  }
  55% {
    transform: rotate(-42deg) scale(1.25);
    box-shadow: 0 0 12px 4px rgba(255, 100, 0, 0.8);
  }
  70% {
    transform: rotate(-45deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.9);
    box-shadow: none;
  }
}
</style>
