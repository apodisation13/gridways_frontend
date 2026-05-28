<template>
  <div class="resource-item">
    <div class="wrapper__resource-image">
      <img
        :src="require(`@/assets/icons/resources/${name}.svg`)"
        :alt="name"
        class="resource-image"
      />
      <span
        v-if="delta !== null && show_delta"
        class="resource-delta"
        :class="
          delta > 0 ? 'resource-delta--positive' : 'resource-delta--negative'
        "
        >{{ delta > 0 ? "+" : "" }}{{ delta }}</span
      >
    </div>
    <!--Подсвечиваем что достигли предела/нуля и не показываем max value-->
    <div
      v-if="!show_max_count && highlight_max_count"
      class="resource-count"
      :class="{
        'resource-count--empty': count === 0,
        'resource-count--max': count >= maxResourcesValue[name] && count !== 0,
      }"
    >
      {{ count }}
    </div>
    <!--Подсвечиваем что достигли предела/нуля и показываем max value, в бонусах когда ключ открыли-->
    <div
      v-else-if="show_max_count && highlight_max_count"
      class="resource-count"
      :class="{
        'resource-count--empty': count === 0,
        'resource-count--max': count >= maxResourcesValue[name] && count !== 0,
      }"
    >
      {{ count }} / {{ maxResourcesValue[name] }}
    </div>
    <!--Не подсвечиваем что достигли предела/нуля и не показываем max value, в прокачках где просто ресурсы-->
    <div v-else class="resource-count">
      {{ count }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ResourceItem",
  props: {
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    show_max_count: {
      type: Boolean,
      default: false,
    },
    highlight_max_count: {
      type: Boolean,
      default: true,
    },
    show_delta: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      delta: null as number | null,
      deltaTimeout: null as ReturnType<typeof setTimeout> | null,
      lastShownTs: 0,
    }
  },
  computed: {
    maxResourcesValue() {
      return this.$store.getters["maxResourcesValue"]
    },
    resourceDeltas() {
      return this.$store.getters["resourceDeltas"]
    },
  },
  watch: {
    resourceDeltas: {
      handler(deltas: Record<string, { amount: number; ts: number }>) {
        const entry = deltas[this.name]
        if (!entry || entry.ts <= this.lastShownTs) return
        this.lastShownTs = entry.ts
        this.delta = entry.amount
        if (this.deltaTimeout !== null) clearTimeout(this.deltaTimeout)
        this.deltaTimeout = setTimeout(() => {
          this.delta = null
          this.deltaTimeout = null
        }, 5000)
      },
      deep: true,
    },
  },
  mounted() {
    const entry = this.resourceDeltas[this.name]
    if (!entry) return
    const age = Date.now() - entry.ts
    if (age >= 5000) {
      this.lastShownTs = entry.ts
      return
    }
    this.lastShownTs = entry.ts
    this.delta = entry.amount
    this.deltaTimeout = setTimeout(() => {
      this.delta = null
      this.deltaTimeout = null
    }, 5000 - age)
  },
  beforeUnmount() {
    if (this.deltaTimeout !== null) clearTimeout(this.deltaTimeout)
  },
})
</script>
<style scoped>
.resource-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wrapper__resource-image {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.resource-delta {
  position: absolute;
  top: 50%;
  left: 50%;
  font-family: "Philosopher", serif;
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  animation: deltaPulse 5s ease-out forwards;
}

.resource-delta--positive {
  color: #6dff72;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 8px rgba(109, 255, 114, 0.9);
}

.resource-delta--negative {
  color: #ff5252;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 8px rgba(255, 82, 82, 0.9);
}

@keyframes deltaPulse {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-50%) scale(0.5);
  }
  8% {
    opacity: 1;
    transform: translateX(-50%) translateY(-50%) scale(1.4);
  }
  16% {
    opacity: 1;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  28% {
    opacity: 0.2;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  40% {
    opacity: 1;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  55% {
    opacity: 0.2;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  70% {
    opacity: 1;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
}

.resource-image {
  display: block;
  width: 35px;
  max-height: 30px;
}

.resource-count {
  font-family: "Philosopher", serif;
  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 120%;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.resource-count--empty {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.resource-count--max {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 640px) {
  .resource-image {
    max-height: 25px;
  }
}
</style>
