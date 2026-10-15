<template>
  <div
    class="pass"
    @touchstart="handleTouchStart"
    @pointerdown="startHold"
    @pointerup="cancelHold"
    @pointerleave="cancelHold"
    @pointercancel="cancelHold"
    @contextmenu.prevent
    @dblclick.capture="guardDoubleClick"
  >
    <button
      v-if="$store.state.game.player_turn"
      class="pass-btn"
      :disabled="!$store.state.game.player_turn"
      :style="[
        themedStyle,
        timer > 0
          ? { color: timerColor, fontSize: '30px', fontWeight: '700' }
          : {},
      ]"
    >
      <span class="pass-label">
        {{ timer > 0 ? timer : "ХОД" }}
        <span
          v-if="timer <= 0 || emptyPassesRemaining !== null"
          class="pass-arrows"
        >
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M34 14A15 15 0 0 0 8 8L4 12M4 5V12H11" />
              <path d="M6 26A15 15 0 0 0 32 32L36 28M36 35V28H29" />
            </g>
          </svg>
          <span
            v-if="emptyPassesRemaining !== null"
            class="empty-passes-count"
            :class="{
              'empty-passes-count--exhausted': emptyPassesRemaining <= 0,
            }"
          >
            {{ emptyPassesRemaining }}
          </span>
        </span>
      </span>
    </button>
    <button v-else class="pass-btn" :disabled="!$store.state.game.player_turn">
      <span class="pass-label">
        ХОД
        <span class="pass-arrows">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M34 14A15 15 0 0 0 8 8L4 12M4 5V12H11" />
              <path d="M6 26A15 15 0 0 0 32 32L36 28M36 35V28H29" />
            </g>
          </svg>
        </span>
      </span>
    </button>
    <teleport to="body">
      <yesno-modal
        v-if="showSurrenderConfirm"
        question="Сдаться?"
        @cancel="showSurrenderConfirm = false"
        @confirm="surrender"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import YesnoModal from "@/components/ModalWindows/YesnoModal.vue"
import { styleWrapper } from "@/logic/border_styles"

export default defineComponent({
  name: "PassComp",
  components: { YesnoModal },
  props: {
    emptyPassesRemaining: {
      type: Number as PropType<number | null>,
      default: null,
    },
    timer: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      lastTapTime: 0,
      holdTimer: null as ReturnType<typeof setTimeout> | null,
      holdTriggered: false,
      showSurrenderConfirm: false,
    }
  },
  computed: {
    themedStyle(): Record<string, string> | undefined {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
    timerColor(): string {
      if (this.timer > 15) return "#4ade80"
      if (this.timer > 5) return "#fb923c"
      return "#ef4444"
    },
  },
  beforeUnmount() {
    this.cancelHold()
  },
  methods: {
    surrender(): void {
      this.showSurrenderConfirm = false
      this.$router.push("/lose")
    },
    startHold(e: PointerEvent): void {
      if (!e.isPrimary || e.button !== 0) return
      this.cancelHold()
      this.holdTriggered = false
      this.holdTimer = setTimeout(() => {
        this.holdTimer = null
        this.holdTriggered = true
        this.lastTapTime = 0
        this.showSurrenderConfirm = true
      }, 2000)
    },
    cancelHold(): void {
      if (this.holdTimer !== null) clearTimeout(this.holdTimer)
      this.holdTimer = null
    },
    guardDoubleClick(e: MouseEvent): void {
      if (this.holdTriggered || this.showSurrenderConfirm)
        e.stopImmediatePropagation()
    },
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
          new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
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

.pass {
  user-select: none;
  -webkit-touch-callout: none;
}

.pass-btn:disabled {
  pointer-events: none;
}

.pass-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  white-space: nowrap;
}

.pass-arrows {
  position: relative;
  display: inline-flex;
  width: 1.2em;
  height: 1.2em;
  flex-shrink: 0;
  color: white;
}

.pass-arrows svg {
  width: 100%;
  height: 100%;
}

.empty-passes-count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4ade80;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.empty-passes-count--exhausted {
  color: #ef4444;
}
</style>
