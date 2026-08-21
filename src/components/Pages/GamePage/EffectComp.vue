<template>
  <div class="effect-comp">
    <!-- Card-sized traps: mine hidden when enemy present; light_mine and poison always shown -->
    <div
      v-if="showCardSizeTrap"
      v-touch:longtap="() => (showModal = true)"
      class="effect-mine"
      :class="{ 'effect-mine--with-enemy': hasEnemy }"
      @contextmenu.prevent.stop="showModal = true"
    >
      <img
        :src="cardSizeSrc"
        class="effect-mine__icon"
        :alt="effectObject.type"
      />
    </div>

    <!-- Full-cell overlay effects (rain, frost, spikes, veil, purify, lock, heal, incr_dmg, remove_status) -->
    <div
      v-if="fullCellSrc"
      v-touch:longtap="() => (showModal = true)"
      class="effect-fullcell"
      @contextmenu.prevent.stop="showModal = true"
    >
      <img
        :src="fullCellSrc"
        class="effect-fullcell__img"
        :alt="effectObject.type"
      />
    </div>

    <!-- Turns/times_count counter: bottom-center of cell -->
    <div
      v-if="
        effectObject.turns !== undefined ||
        effectObject.times_count !== undefined
      "
      v-touch:longtap="() => (showModal = true)"
      class="effect-turns"
      :class="{
        'effect-turns--negative': effectObject.negative,
        'effect-turns--times': effectObject.times_count !== undefined,
      }"
      @click="showModal = true"
      @contextmenu.prevent.stop="showModal = true"
    >
      {{ effectObject.turns ?? effectObject.times_count }}
    </div>

    <effect-modal
      v-if="showModal"
      :effect-object="effectObject"
      @close="showModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import changMoveSrc from "@/assets/icons/effects/change_move.svg"
import damagePlayerSrc from "@/assets/icons/effects/damage_player.svg"
import decrPlayerRandomDmgSrc from "@/assets/icons/effects/decr_player_random_dmg.svg"
import frostSrc from "@/assets/icons/effects/frost.svg"
import gainShieldSrc from "@/assets/icons/effects/gain_shield.svg"
import gainVeilSrc from "@/assets/icons/effects/gain_veil.svg"
import healSrc from "@/assets/icons/effects/heal.svg"
import healMineSrc from "@/assets/icons/effects/heal_mine.svg"
import incrArmorSrc from "@/assets/icons/effects/incr_armor.svg"
import incrDmgSrc from "@/assets/icons/effects/incr_dmg.svg"
import incrDmgMineSrc from "@/assets/icons/effects/incr_dmg_mine.svg"
import incrPassiveValueSrc from "@/assets/icons/effects/incr_passive_value.svg"
import lightMineSrc from "@/assets/icons/effects/light_mine.svg"
import lockSrc from "@/assets/icons/effects/lock.svg"
import middleMineSrc from "@/assets/icons/effects/middle_mine.svg"
import mineSrc from "@/assets/icons/effects/mine.svg"
import poisonSrc from "@/assets/icons/effects/poison.svg"
import purifySrc from "@/assets/icons/effects/purify.svg"
import rainSrc from "@/assets/icons/effects/rain.svg"
import shieldMineSrc from "@/assets/icons/effects/shield_mine.svg"
import spikesSrc from "@/assets/icons/effects/spikes.svg"
import veilSrc from "@/assets/icons/effects/veil.svg"
import EffectModal from "@/components/ModalWindows/EffectModal.vue"
import type { EffectObject } from "@/types"
import { EffectType } from "@/types"

const CARD_SIZE_SRCS: Partial<Record<EffectType, string>> = {
  [EffectType.Mine]: mineSrc,
  [EffectType.LightMine]: lightMineSrc,
  [EffectType.MiddleMine]: middleMineSrc,
  [EffectType.Poison]: poisonSrc,
  [EffectType.HealMine]: healMineSrc,
  [EffectType.IncrDmgMine]: incrDmgMineSrc,
  [EffectType.ShieldMine]: shieldMineSrc,
  [EffectType.IncrPassiveValue]: incrPassiveValueSrc,
  [EffectType.IncrArmor]: incrArmorSrc,
  [EffectType.ChangeMove]: changMoveSrc,
}

const FULL_CELL_SRCS: Partial<Record<EffectType, string>> = {
  [EffectType.Rain]: rainSrc,
  [EffectType.Frost]: frostSrc,
  [EffectType.Spikes]: spikesSrc,
  [EffectType.Veil]: veilSrc,
  [EffectType.Purify]: purifySrc,
  [EffectType.Lock]: lockSrc,
  [EffectType.Heal]: healSrc,
  [EffectType.IncrDmg]: incrDmgSrc,
  [EffectType.GainShield]: gainShieldSrc,
  [EffectType.GainVeil]: gainVeilSrc,
  [EffectType.DamagePlayer]: damagePlayerSrc,
  [EffectType.DecrPlayerRandomDmg]: decrPlayerRandomDmgSrc,
}

export default defineComponent({
  name: "EffectComp",
  components: { EffectModal },
  props: {
    effectObject: {
      required: true,
      type: Object as PropType<EffectObject>,
    },
    hasEnemy: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      showModal: false,
      EffectType,
    }
  },
  computed: {
    cardSizeSrc(): string | undefined {
      return CARD_SIZE_SRCS[this.effectObject.type]
    },
    showCardSizeTrap(): boolean {
      if (!this.cardSizeSrc) return false
      if (this.effectObject.type === EffectType.Mine) return !this.hasEnemy
      return true
    },
    fullCellSrc(): string | undefined {
      return FULL_CELL_SRCS[this.effectObject.type]
    },
  },
})
</script>

<style scoped>
/* Wrapper covers the full cell; pointer-events: none so enemy clicks pass through */
.effect-comp {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Card-sized traps: mine, light_mine, poison */
.effect-mine {
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 6px), calc(var(--vh, 1vh) * 11.5));
  aspect-ratio: 1 / 1.43;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
}

/* light_mine / poison when enemy is on the same cell: small badge in bottom-left */
.effect-mine--with-enemy {
  width: 26px;
  height: 26px;
  aspect-ratio: 1;
  top: auto;
  bottom: 2px;
  left: 3px;
  transform: none;
}

.effect-mine__icon {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

/* Full-cell overlay effects (rain, spikes, veil, purify, lock, heal, incr_dmg) */
.effect-fullcell {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  pointer-events: auto;
  cursor: pointer;
}

.effect-fullcell__img {
  width: 100%;
  height: 100%;
  display: block;
}

/* Turns badge: bottom-center */
.effect-turns {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
}

.effect-turns--negative {
  background: rgba(180, 30, 20, 0.85);
  border-color: rgba(255, 100, 80, 0.5);
}

/* times_count: star shape */
.effect-turns--times {
  width: 22px;
  height: 22px;
  min-width: 22px;
  padding: 0;
  border-radius: 0;
  border: none;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
</style>
