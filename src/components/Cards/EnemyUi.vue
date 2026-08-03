<template>
  <div class="card-outer" :class="cardRarityClass">
    <div class="card-body">
      <div
        class="card-enemy"
        :class="{ 'not-charges': enemy.data.hp <= 0 }"
        :style="[
          { backgroundImage: `url(${enemy.image})` },
          card_margin(enemy),
        ]"
      >
        <transition name="damage">
          <div
            v-if="e.damages_player"
            class="damage-overlay"
            :style="{ '--flash-duration': flashDuration + 'ms' }"
          >
            <div class="damage-icon-wrap">
              <div class="damage-icon"></div>
              <span class="damage-icon-text">{{ -e.data.damage }}</span>
            </div>
          </div>
        </transition>
      </div>
      <div class="card-enemy-information">
        <!--Иконка хода для всех врагов, а лидеру врагов не надо, отсюда и условие-->
        <ability-circle-enemy v-if="e.move" :enemy="enemy as Enemy" />
        <!--Иконка урона, для всех врагов или если у лидера врага есть урон-->
        <card-damage-icon
          v-if="e.data.damage"
          :style="background_color(enemy)"
          :damage="e.data.damage"
        />
        <!-- отдельный анимированный ромб, damage-comp не трогаем -->
        <div
          v-if="e.dmg_delta"
          class="dmg-anim"
          :style="{ '--flash-duration': flashDuration + 'ms' }"
        >
          <span class="dmg-anim-text">
            {{ e.dmg_delta > 0 ? "+" : "" }}{{ e.dmg_delta }}
          </span>
        </div>

        <card-passive
          v-if="enemy.passive_ability?.name"
          :card="e"
          :location="location"
        />
        <enemy-shield v-if="enemy.data.shield" />
        <enemy-locked v-if="enemy.locked" />
        <deathwish-ability v-if="enemy.deathwish?.name" />
        <enemy-status v-if="enemy.data.status" :enemy="enemy" />
        <heart-icon
          :health="enemy.data.hp"
          :hp_delta="enemy.hp_delta ?? undefined"
          :bgColor="background_color_hp(enemyColor)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardDamageIcon from "@/components/UI/CardsUI/CardDamageIcon.vue"
import CardPassive from "@/components/UI/CardsUI/CardPassive.vue"
import AbilityCircleEnemy from "@/components/UI/CardsUI/Enemies/AbilityCircleEnemy.vue"
import DeathwishAbility from "@/components/UI/CardsUI/Enemies/DeathwishAbility.vue"
import EnemyLocked from "@/components/UI/CardsUI/Enemies/EnemyLocked.vue"
import EnemyShield from "@/components/UI/CardsUI/Enemies/EnemyShield.vue"
import EnemyStatus from "@/components/UI/CardsUI/Enemies/EnemyStatus.vue"
import HeartIcon from "@/components/UI/CardsUI/HeartIcon.vue"
import {
  background_color,
  background_color_hp,
  card_margin,
} from "@/logic/border_styles"
import type { CardLocation, Enemy, EnemyLeader } from "@/types"

export default defineComponent({
  name: "EnemyUi",
  components: {
    EnemyStatus,
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
      type: Object as PropType<Enemy | EnemyLeader>,
      required: true,
    },
    location: {
      type: String as PropType<CardLocation>,
      default: null,
    },
  },
  computed: {
    e(): Enemy {
      return this.enemy as Enemy
    },
    cardRarityClass(): string {
      const color = (this.enemy as Enemy).color
      if (color) {
        if (["gold", "silver", "bronze"].includes(color.toLowerCase())) {
          return color.toLowerCase()
        }
      }
      const faction = this.enemy.faction.toLowerCase()
      if (["soldiers", "monsters", "animals"].includes(faction)) {
        return faction
      }
      return ""
    },
    flashDuration(): number {
      return this.$store.getters["selectedMoveTimeout"]
    },
    enemyColor(): string {
      return "color" in this.enemy ? (this.enemy as Enemy).color : ""
    },
  },
  methods: {
    card_margin(card: Enemy | EnemyLeader): Record<string, string> {
      return card_margin(card as Enemy)
    },
    background_color(e: Enemy | EnemyLeader): Record<string, string> {
      return background_color(e as Enemy)
    },
    background_color_hp(color: string): string {
      return background_color_hp(color)
    },
  },
})
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
  border-radius: 2px;
  overflow: hidden;
  background-size: 100% 100%;
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

.damage-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.25);
  border-radius: inherit;
  animation: damage-pulse var(--flash-duration, 500ms) ease-out forwards;
  z-index: 1;
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

@keyframes damage-icon-pop {
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
  z-index: 2;
  animation: dmg-delta-pop var(--flash-duration, 500ms) ease-out forwards;
}

.dmg-anim-text {
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
