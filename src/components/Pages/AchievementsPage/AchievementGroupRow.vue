<template>
  <div v-if="activeEntry" class="achievement-row">
    <button
      v-if="entries.length > 1"
      type="button"
      class="group-arrow"
      :disabled="activeIndex === 0"
      aria-label="Предыдущее задание группы"
      @click="select(-1)"
    >
      ‹
    </button>
    <achievement-card
      :key="activeEntry.key"
      class="row-card"
      :definition="activeEntry.definition"
      :progress="progress[activeEntry.key]"
    />
    <button
      v-if="entries.length > 1"
      type="button"
      class="group-arrow"
      :disabled="activeIndex === entries.length - 1"
      aria-label="Следующее задание группы"
      @click="select(1)"
    >
      ›
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import AchievementCard from "@/components/Pages/AchievementsPage/AchievementCard.vue"
import type { AchievementDisplayEntry, AchievementProgress } from "@/types"

export default defineComponent({
  components: { AchievementCard },
  props: {
    entries: {
      type: Array as PropType<AchievementDisplayEntry[]>,
      required: true,
    },
    progress: {
      type: Object as PropType<Record<string, AchievementProgress>>,
      required: true,
    },
  },
  data() {
    return { selectedId: null as string | null }
  },
  computed: {
    activeIndex(): number {
      return Math.max(
        0,
        this.entries.findIndex(entry => entry.key === this.selectedId)
      )
    },
    activeEntry(): AchievementDisplayEntry | undefined {
      return this.entries[this.activeIndex]
    },
  },
  watch: {
    entries(entries: AchievementDisplayEntry[]) {
      // Подтверждённая цель ушла из группы — показываем ближайшую оставшуюся.
      if (!entries.some(entry => entry.key === this.selectedId))
        this.selectedId = null
    },
  },
  methods: {
    select(direction: number): void {
      const entry = this.entries[this.activeIndex + direction]
      if (entry) this.selectedId = entry.key
    },
  },
})
</script>

<style scoped>
.achievement-row {
  min-width: 0;
  /* Одинаковые боковые места под стрелки, даже у одиночного задания. */
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 28px;
  gap: 4px;
  align-items: center;
}
.row-card {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}
.group-arrow {
  width: 28px;
  min-height: 44px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 215, 0, 0.08);
  color: #facf5d;
  font-size: 1.8rem;
  cursor: pointer;
}
.group-arrow:disabled {
  opacity: 0.25;
  cursor: default;
}
.group-arrow:focus-visible {
  outline: 2px solid #facf5d;
  outline-offset: 2px;
}
</style>
