<template>
  <div
    class="level-stack"
    @click.right="open_level_modal"
    v-touch:longtap="open_level_modal"
    @contextmenu.prevent
  >
    <div class="card card-4" :style="cardBorder"></div>
    <div class="card card-3" :style="cardBorder"></div>
    <div class="card card-2" :style="cardBorder"></div>

    <div class="card card-top" :style="cardBorder">
      <div class="leader-image" :style="leaderBg"></div>
      <div class="card-inner">
        <div class="level-name global_text">{{ level.level.name }}</div>

        <div class="level-enemies">
          <span class="enemy-icon">⚔</span>
          <span>{{ level.level.enemies.length }}</span>
        </div>

        <div class="level-difficulty">
          <span v-if="level.level.difficulty === 'easy'">⭐</span>
          <span v-if="level.level.difficulty === 'normal'">⭐⭐</span>
          <span v-if="level.level.difficulty === 'hard'">⭐⭐⭐</span>
        </div>
      </div>
    </div>

    <level-modal
      v-if="show_level_modal"
      :level="level.level"
      @close_level_modal="show_level_modal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import LevelModal from "@/components/ModalWindows/LevelModal.vue"
import { background_color_leader } from "@/logic/border_styles"
import type { MappedUserLevel } from "@/types"

export default defineComponent({
  name: "level-preview-comp",
  components: { LevelModal },
  props: {
    level: {
      required: true,
      type: Object as PropType<MappedUserLevel>,
    },
  },
  data() {
    return {
      show_level_modal: false,
    }
  },
  computed: {
    cardBorder(): Record<string, string> {
      const bg = background_color_leader(this.level.level.enemy_leader?.faction)
      const color = bg || "#888"
      return {
        borderColor: color,
        boxShadow: `0 0 10px ${color}44`,
      }
    },
    leaderBg(): Record<string, string> {
      return {
        backgroundImage: `url(${this.level.level.enemy_leader?.image})`,
      }
    },
  },
  methods: {
    open_level_modal(): void {
      this.show_level_modal = true
    },
  },
})
</script>

<style scoped>
.level-stack {
  position: relative;
  width: 120px;
  height: 160px;
  cursor: pointer;
}

.level-stack:hover .card-top {
  transform: translate(-2px, -2px);
}
.level-stack:hover .card-2 {
  transform: translate(4px, 4px);
}
.level-stack:hover .card-3 {
  transform: translate(8px, 8px);
}
.level-stack:hover .card-4 {
  transform: translate(12px, 12px);
}

.card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 3px solid;
  background: linear-gradient(145deg, #1a1a2e, #0f0f18);
  transition: transform 0.25s ease;
}

.card-4 {
  top: 12px;
  left: 12px;
  opacity: 0.4;
}
.card-3 {
  top: 8px;
  left: 8px;
  opacity: 0.6;
}
.card-2 {
  top: 4px;
  left: 4px;
  opacity: 0.8;
}
.card-top {
  top: 0;
  left: 0;
  overflow: hidden;
}

.leader-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 2px;
  overflow: hidden;
  background-size: 100% 100%;
  filter: brightness(1.5) contrast(1.2);
}

.card-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  box-sizing: border-box;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(15, 15, 25, 0.9) 50%
  );
}

.level-name {
  font-size: 13px;
  text-align: center;
  background: var(--primary-gold-gradient);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  margin-bottom: 8px;
  word-break: break-word;
}

.level-enemies {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
}

.enemy-icon {
  font-size: 14px;
}

.level-difficulty {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
