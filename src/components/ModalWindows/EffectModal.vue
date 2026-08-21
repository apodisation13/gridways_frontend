<template>
  <modal-window v-touch:swipe="close_self" style="pointer-events: auto">
    <button-close @close_self="close_self" />
    <h2>{{ effectsInfo[effectObject.type].title }}</h2>
    <div class="effect-icon-wrap">
      <img
        v-if="iconSrc"
        :src="iconSrc"
        class="effect-icon"
        :alt="effectObject.type"
      />
    </div>
    <div v-if="effectObject.turns !== undefined" class="turns">
      Осталось ходов: {{ effectObject.turns }}
    </div>
    <div v-else-if="effectObject.times_count !== undefined" class="turns">
      Осталось взаимодействий: {{ effectObject.times_count }}
    </div>
    <p v-if="effectsInfo[effectObject.type]" class="description">
      {{ get_description() }}
    </p>
  </modal-window>
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
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import type { EffectObject } from "@/types"
import { EffectType } from "@/types"

const EFFECT_SRCS: Partial<Record<EffectType, string>> = {
  [EffectType.Mine]: mineSrc,
  [EffectType.LightMine]: lightMineSrc,
  [EffectType.Rain]: rainSrc,
  [EffectType.Frost]: frostSrc,
  [EffectType.Spikes]: spikesSrc,
  [EffectType.Veil]: veilSrc,
  [EffectType.Purify]: purifySrc,
  [EffectType.Lock]: lockSrc,
  [EffectType.Heal]: healSrc,
  [EffectType.IncrDmg]: incrDmgSrc,
  [EffectType.MiddleMine]: middleMineSrc,
  [EffectType.Poison]: poisonSrc,
  [EffectType.HealMine]: healMineSrc,
  [EffectType.IncrDmgMine]: incrDmgMineSrc,
  [EffectType.ShieldMine]: shieldMineSrc,
  [EffectType.IncrPassiveValue]: incrPassiveValueSrc,
  [EffectType.IncrArmor]: incrArmorSrc,
  [EffectType.ChangeMove]: changMoveSrc,
  [EffectType.GainShield]: gainShieldSrc,
  [EffectType.GainVeil]: gainVeilSrc,
  [EffectType.DamagePlayer]: damagePlayerSrc,
  [EffectType.DecrPlayerRandomDmg]: decrPlayerRandomDmgSrc,
}

export default defineComponent({
  name: "EffectModal",
  components: { ModalWindow, ButtonClose },
  props: {
    effectObject: {
      type: Object as PropType<EffectObject>,
      required: true,
    },
  },
  emits: ["close"],
  computed: {
    EffectType() {
      return EffectType
    },
    effectsInfo() {
      return this.$store.getters["effectsInfo"]
    },
    iconSrc(): string | undefined {
      return EFFECT_SRCS[this.effectObject.type]
    },
  },
  methods: {
    close_self(): void {
      this.$emit("close")
    },
    get_description(): string {
      return this.effectsInfo[this.effectObject.type].description.replace(
        /{{ value }}/g,
        `{{ ${this.effectObject.value} }}`
      )
    },
  },
})
</script>

<style scoped>
.effect-icon-wrap {
  display: flex;
  justify-content: center;
  margin: 20px auto;
  width: 50%;
  border-radius: 6px;
  overflow: hidden;
}

.effect-icon {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.turns {
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;
}

.description {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  padding: 0 16px;
}
</style>
