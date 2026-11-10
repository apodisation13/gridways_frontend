<template>
  <article class="achievement" :class="{ 'achievement--completed': completed }">
    <div class="achievement__heading">
      <h2>{{ definition.title }}</h2>
      <button
        type="button"
        class="pin-button"
        :class="{ 'pin-button--active': pinned }"
        :disabled="completed && !pinned"
        :aria-pressed="pinned"
        :aria-label="pinned ? 'Открепить задание' : 'Закрепить задание'"
        :title="
          completed ? 'Задание выполнено' : pinned ? 'Открепить' : 'Закрепить'
        "
        @click="togglePin"
      >
        <span class="pin-icon" aria-hidden="true" />
      </button>
    </div>
    <div class="achievement__progress-label">
      <span>{{ value }} / {{ definition.target }}</span>
      <span v-if="rewardGranted" class="achievement__status">
        ✓ Награда получена
      </span>
      <span v-else-if="completed" class="achievement__status">
        ✓ Выполнено
      </span>
      <span v-else-if="definition.target > 0 && value >= definition.target">
        Ожидает подтверждения
      </span>
    </div>
    <div
      class="achievement__bar"
      role="progressbar"
      :aria-label="definition.title"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="definition.target"
    >
      <span :style="{ width: `${percent}%` }" />
    </div>
    <div class="achievement__reward">
      <span class="reward-label">Награда</span>
      <resource-list
        class="reward-resources"
        :resources="definition.rewards.resources"
        :highlight_max_count="false"
      />
    </div>
  </article>
</template>
<script lang="ts">
import { defineComponent, type PropType } from "vue"

import ResourceList from "@/components/ResourceList.vue"
import type {
  AchievementDefinition,
  AchievementProgress,
  PinnedAchievement,
} from "@/types"

export default defineComponent({
  components: { ResourceList },
  props: {
    definition: {
      type: Object as PropType<AchievementDefinition>,
      required: true,
    },
    progress: {
      type: Object as PropType<AchievementProgress>,
      default: undefined,
    },
  },
  computed: {
    value(): number {
      return Math.min(
        this.definition.target,
        Math.max(0, this.progress?.value ?? 0)
      )
    },
    percent(): number {
      return this.definition.target > 0
        ? (this.value / this.definition.target) * 100
        : 0
    },
    completed(): boolean {
      return Boolean(
        this.progress?.completed_at || this.progress?.reward_granted_at
      )
    },
    rewardGranted(): boolean {
      return Boolean(this.progress?.reward_granted_at)
    },
    pinned(): boolean {
      return this.$store.state.achievements.pinnedAchievements.some(
        (pin: PinnedAchievement) =>
          pin.section === "permanent" && pin.id === this.definition.id
      )
    },
  },
  methods: {
    togglePin(): void {
      void this.$store.dispatch("togglePinnedAchievement", {
        section: "permanent",
        id: this.definition.id,
      })
    },
  },
})
</script>
<style scoped>
/* Тот же меч, который используется для урона на картах. */
.pin-icon {
  display: inline-block;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: url("@/assets/icons/card/sword.svg") center / contain no-repeat;
}

.pin-icon {
  filter: grayscale(1);
  opacity: 0.65;
}
.pin-button--active .pin-icon {
  filter: none;
  opacity: 1;
}

.achievement {
  padding: 14px;
  border: 1px solid rgba(250, 207, 93, 0.12);
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.08);
}

.achievement--completed {
  border-color: rgba(170, 235, 170, 0.35);
}

h2 {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.achievement__progress-label {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 8px;
  font-size: 0.8rem;
  color: #facf5d;
}

.achievement__status {
  color: #aaebaa;
}

.achievement__bar {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
}

.achievement__bar > span {
  display: block;
  height: 100%;
  background: var(--primary-gold-gradient, #c49000);
}

.achievement__reward {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.reward-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.reward-resources {
  width: auto;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.achievement__heading {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.achievement__heading h2 {
  flex: 1;
  min-width: 0;
}
.pin-button {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #a6a6a6;
  cursor: pointer;
}
.pin-button--active {
  color: #facf5d;
  border-color: #facf5d;
  background: #facf5d18;
}
.pin-button:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
