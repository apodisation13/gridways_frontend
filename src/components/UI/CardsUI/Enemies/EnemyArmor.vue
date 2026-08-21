<template>
  <div class="armor-wrap">
    <div class="armor-bar" :class="animClass">
      <div class="armor-segments">
        <div v-for="n in armor" :key="n" class="armor-segment"></div>
      </div>
      <div class="armor-content">
        <span class="armor-icon">🛡</span>
        <span class="armor-value">{{ armor }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "EnemyArmor",
  props: {
    armor: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      animClass: null as string | null,
      animTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  watch: {
    armor(newVal: number, oldVal: number) {
      if (newVal <= 0) return
      this.triggerAnim(newVal > oldVal ? "armor-gain" : "armor-hit")
    },
  },
  methods: {
    triggerAnim(cls: string) {
      if (this.animTimer !== null) clearTimeout(this.animTimer)
      this.animClass = null
      this.$nextTick(() => {
        this.animClass = cls
        this.animTimer = setTimeout(() => {
          this.animClass = null
        }, 700)
      })
    },
  },
})
</script>

<style scoped>
.armor-wrap {
  position: absolute;
  inset: 0;
  container-type: size;
  pointer-events: none;
}

.armor-bar {
  position: absolute;
  top: 62%;
  left: 50%;
  transform: translateX(-50%);
  width: 65%;
  height: 15cqmin;
  border-radius: 3cqmin;
  overflow: hidden;
  border: 1px solid rgba(80, 180, 255, 0.85);
  box-shadow: 0 0 5cqmin rgba(0, 132, 255, 0.55);
  background: rgba(0, 18, 60, 0.45);
}

.armor-segments {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 1.5%;
  padding: 7% 1.5%;
  box-sizing: border-box;
}

.armor-segment {
  flex: 1;
  height: 100%;
  border-radius: 2cqmin;
  background: linear-gradient(160deg, #5ec8ff 0%, #0a84ff 55%, #0055cc 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  opacity: 0.55;
}

.armor-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4%;
  color: white;
  font-weight: bold;
  font-size: 8cqmin;
  text-shadow:
    0 0 5px rgba(0, 150, 255, 1),
    1px 1px 2px rgba(0, 0, 0, 0.9);
}

.armor-icon {
  font-size: 9cqmin;
  filter: drop-shadow(0 0 2cqmin #0a84ff);
}

.armor-value {
  font-family: "Arial Black", "Arial Bold", sans-serif;
}

/* ── Hit: shake + orange flash ─────────────────────────────── */
.armor-hit {
  animation: armor-enemy-hit 0.65s ease-out forwards;
}

@keyframes armor-enemy-hit {
  0% {
  }
  10% {
    box-shadow:
      0 0 10cqmin rgba(255, 200, 0, 1),
      0 0 20cqmin rgba(255, 100, 0, 0.8);
    background-color: rgba(255, 180, 0, 0.4);
    transform: translateX(calc(-50% - 3px));
    border-color: rgba(255, 200, 0, 1);
  }
  25% {
    transform: translateX(calc(-50% + 3px));
  }
  40% {
    transform: translateX(calc(-50% - 2px));
  }
  60% {
    transform: translateX(-50%);
    box-shadow: 0 0 6cqmin rgba(255, 150, 0, 0.5);
  }
  100% {
    box-shadow: 0 0 5cqmin rgba(0, 132, 255, 0.55);
    background-color: rgba(0, 18, 60, 0.45);
    border-color: rgba(80, 180, 255, 0.85);
    transform: translateX(-50%);
  }
}

/* ── Gain: scale + bright blue glow ───────────────────────── */
.armor-gain {
  animation: armor-enemy-gain 0.65s ease-out forwards;
}

@keyframes armor-enemy-gain {
  0% {
  }
  15% {
    box-shadow:
      0 0 14cqmin rgba(0, 220, 255, 1),
      0 0 24cqmin rgba(0, 160, 255, 0.8);
    background-color: rgba(0, 180, 255, 0.35);
    border-color: rgba(0, 240, 255, 1);
    transform: translateX(-50%) scaleY(1.12);
  }
  50% {
    box-shadow: 0 0 8cqmin rgba(0, 180, 255, 0.7);
    transform: translateX(-50%) scaleY(1.03);
  }
  100% {
    box-shadow: 0 0 5cqmin rgba(0, 132, 255, 0.55);
    background-color: rgba(0, 18, 60, 0.45);
    border-color: rgba(80, 180, 255, 0.85);
    transform: translateX(-50%) scaleY(1);
  }
}
</style>
