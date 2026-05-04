<template>
  <div class="pass" @touchstart="handleTouchStart">
    <button
      v-if="$store.state.game.player_turn"
      class="pass-btn"
      :disabled="!$store.state.game.player_turn"
      :style="themedStyle"
    >
      ХОД 🔄
    </button>
    <button v-else class="pass-btn" :disabled="!$store.state.game.player_turn">
      ХОД 🔄
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import { styleWrapper } from "@/logic/border_styles"

export default defineComponent({
  name: "PassComp",
  data() {
    return {
      lastTapTime: 0,
    }
  },
  computed: {
    themedStyle(): Record<string, string> | undefined {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
  },
  methods: {
    handleTouchStart(e: TouchEvent): void {
      const isIOS =
        /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      if (!isIOS) return
      e.preventDefault()
      const now = Date.now()
      const elapsed = now - this.lastTapTime
      if (elapsed > 50 && elapsed < 300) {
        ;(e.currentTarget as Element).dispatchEvent(
          new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window })
        )
        this.lastTapTime = 0
      } else {
        this.lastTapTime = now
      }
    },
  },
})
</script>

<style scoped>
.pass {
  height: 10vh;
  width: 98%;
  /*border: solid 1px blue;*/
  margin-bottom: 1%;
  margin-top: 1%;
  position: relative;
}

.pass-btn {
  width: 11vh;
  height: 11vh;
  border-radius: 50%;
  border: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: relative;
  font-size: 25px;
  color: white;
  touch-action: manipulation;
}
</style>
