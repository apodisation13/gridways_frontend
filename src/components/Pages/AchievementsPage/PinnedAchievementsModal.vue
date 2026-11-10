<template>
  <Teleport to="body">
    <div class="pinned-overlay" @click.self="$emit('close')">
      <section
        ref="dialog"
        class="pinned-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pinned-title"
        tabindex="-1"
        @keydown.esc.stop.prevent="$emit('close')"
        @keydown.tab="trapFocus"
      >
        <header>
          <h2 id="pinned-title">Закреплённые задания</h2>
          <button
            type="button"
            class="close-button"
            aria-label="Вернуться к инвентарю"
            @click="$emit('close')"
          >
            ×
          </button>
        </header>
        <p class="pinned-count">{{ entries.length }} / {{ limit }}</p>
        <div v-if="entries.length" class="pinned-list">
          <achievement-card
            v-for="entry in entries"
            :key="`${entry.section}:${entry.id}`"
            :definition="entry.definition"
            :progress="progress.permanent?.[entry.id]"
          />
        </div>
        <p v-else class="empty-state">
          Здесь появятся задания, которые вы закрепите кнопкой с мечом на
          странице достижений.
        </p>
      </section>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import AchievementCard from "@/components/Pages/AchievementsPage/AchievementCard.vue"
import { MAX_PINNED_ACHIEVEMENTS } from "@/store/modules/achievements"
import type {
  AchievementDefinition,
  PinnedAchievement,
  UserAchievementsProgress,
} from "@/types"

export default defineComponent({
  components: { AchievementCard },
  emits: ["close"],
  data() {
    return {
      limit: MAX_PINNED_ACHIEVEMENTS,
      previousFocus: null as HTMLElement | null,
    }
  },
  computed: {
    entries(): (PinnedAchievement & { definition: AchievementDefinition })[] {
      return this.$store.getters["pinnedAchievementEntries"]
    },
    progress(): UserAchievementsProgress {
      return this.$store.getters["localUserAchievements"]
    },
  },
  mounted() {
    this.previousFocus = document.activeElement as HTMLElement | null
    ;(this.$refs.dialog as HTMLElement).focus()
  },
  unmounted() {
    this.previousFocus?.focus()
  },
  methods: {
    trapFocus(event: KeyboardEvent): void {
      const dialog = this.$refs.dialog as HTMLElement
      const buttons = Array.from(
        dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
      )
      const first = buttons[0],
        last = buttons[buttons.length - 1]
      if (!first) {
        event.preventDefault()
        dialog.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog)
      ) {
        event.preventDefault()
        first.focus()
      }
    },
  },
})
</script>

<style scoped>
.pinned-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.6);
}
.pinned-modal {
  box-sizing: border-box;
  width: min(100%, 425px);
  max-height: calc(var(--vh, 1vh) * 85);
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #c5a87e;
  border-radius: 16px;
  background: linear-gradient(180deg, #1e2834, #0a0b0c);
  color: rgba(255, 255, 255, 0.9);
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
}
h2 {
  flex: 1;
  font-family: "Philosopher", serif;
  font-size: 1.2rem;
  color: #facf5d;
}
.close-button {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: none;
  border: 0;
  color: #facf5d;
  font-size: 28px;
  cursor: pointer;
}
.pinned-count {
  margin: 8px 0 14px;
  color: #facf5d;
}
.pinned-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.empty-state {
  padding: 20px 0;
  line-height: 1.5;
  text-align: center;
}
</style>
