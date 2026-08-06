<template>
  <div class="effect-comp">
    <!-- Mine: card-sized, only when no enemy on cell -->
    <div
      v-if="effectObject.type === EffectType.Mine && !hasEnemy"
      v-touch:longtap="() => (showModal = true)"
      class="effect-mine"
      @contextmenu.prevent.stop="showModal = true"
    >
      <img
        src="@/assets/icons/effects/mine.svg"
        class="effect-mine__icon"
        alt="mine"
      />
    </div>

    <!-- Full-cell overlay effects (rain, spikes, veil, purify, lock, heal, incr_dmg) -->
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
      :class="{ 'effect-turns--negative': effectObject.negative }"
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

import healSrc from "@/assets/icons/effects/heal.svg"
import incrDmgSrc from "@/assets/icons/effects/incr_dmg.svg"
import lockSrc from "@/assets/icons/effects/lock.svg"
import purifySrc from "@/assets/icons/effects/purify.svg"
import rainSrc from "@/assets/icons/effects/rain.svg"
import spikesSrc from "@/assets/icons/effects/spikes.svg"
import veilSrc from "@/assets/icons/effects/veil.svg"
import EffectModal from "@/components/ModalWindows/EffectModal.vue"
import type { EffectObject } from "@/types"
import { EffectType } from "@/types"

const FULL_CELL_SRCS: Partial<Record<EffectType, string>> = {
  [EffectType.Rain]: rainSrc,
  [EffectType.Spikes]: spikesSrc,
  [EffectType.Veil]: veilSrc,
  [EffectType.Purify]: purifySrc,
  [EffectType.Lock]: lockSrc,
  [EffectType.Heal]: healSrc,
  [EffectType.IncrDmg]: incrDmgSrc,
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

/* Mine: card-sized, centered */
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
</style>
