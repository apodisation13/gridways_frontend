<template>
  <div class="stage-container">
    <v-stage :config="configKonva" v-if="!showSeasonLevelsTree">
      <v-layer>
        <!--для каждого сезона из списка всех сезонов-->
        <div v-for="season in seasonTree" :key="season.season.id">
          <!--Прямоугольник сезона, пройден\открыт\закрыт-->
          <v-rect
            :config="squareConfig(season)"
            @dblclick="setSeason(season)"
            @dbltap="setSeason(season)"
          ></v-rect>
          <v-line
            v-for="line in season.season.lines"
            :key="line"
            :config="lineConfig(line, season)"
          ></v-line>
        </div>
      </v-layer>
    </v-stage>
    <LevelTree
      :levels="seasonLevels"
      :userSeasonUnlocked="userSeasonUnlocked"
      v-if="showSeasonLevelsTree && seasonLevels"
    />
    <!-- HTML слой поверх canvas -->
    <div class="html-overlay" v-if="!showSeasonLevelsTree">
      <div
        v-for="season in seasonTree"
        :key="'label-' + season.season.id"
        class="season-label"
        :class="{
          'is-locked': isLocked(season),
          'is-finished': season.finished,
          'is-open': !isLocked(season) && !season.finished,
        }"
        :style="labelStyle(season)"
        @dblclick="setSeason(season)"
        @touchend="handleDoubleTap($event, season)"
      >
        <div class="season-content">
          <div class="lock-icon" v-if="isLocked(season)">🔒</div>
          <span class="season-name">{{ season.season.name }}</span>

          <div
            class="season-progress"
            v-if="!isLocked(season) && season.stats?.total_levels"
          >
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent(season) + '%' }"
              />
            </div>
            <span class="progress-text">
              {{ season.stats.finished_levels }} /
              {{ season.stats.total_levels }}
            </span>
          </div>

          <div class="season-actions">
            <button
              class="action-btn"
              @click.stop="openDescription(season)"
              title="Описание"
            >
              ℹ️
            </button>
            <button
              class="action-btn"
              @click.stop="openStats(season)"
              title="Статистика"
            >
              📊
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Попап с описанием -->
    <Teleport to="body">
      <div
        v-if="activeDescription"
        class="popup-overlay"
        @click="closeDescription"
        @touchend="closeDescription"
      >
        <div class="popup-content" @click.stop @touchend.stop>
          <div class="popup-header" :style="styleWrapper">
            <h3>{{ activeDescription.season.name }}</h3>
            <ThemedButton
              class="close-btn"
              title="✕"
              @click="closeDescription"
            />
          </div>
          <div class="popup-body">
            <p>{{ activeDescription.season.description }}</p>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Попап со статистикой уровня -->
    <Teleport to="body">
      <div
        v-if="activeStats"
        class="popup-overlay"
        @click="closeStats"
        @touchend="closeStats"
      >
        <div class="popup-content" @click.stop @touchend.stop>
          <div class="popup-header" :style="styleWrapper">
            <h3>{{ activeStats.season.name }}</h3>
            <ThemedButton class="close-btn" title="✕" @click="closeStats" />
          </div>
          <div class="popup-body">
            <!-- Статистика сезона -->
            <div class="stats-list">
              <!-- 1. Всего уровней -->
              <div class="stat-row">
                <span class="stat-icon">📊</span>
                <span class="stat-label">Уровней:</span>
                <span class="stat-value">{{
                  activeStats.stats.total_levels
                }}</span>
              </div>

              <!-- 2. Пройдено -->
              <div class="stat-row">
                <span class="stat-icon">✅</span>
                <span class="stat-label">Пройдено:</span>
                <span class="stat-value">
                  {{ activeStats.stats.finished_levels }}/{{
                    activeStats.stats.total_levels
                  }}
                </span>
              </div>

              <!-- 3. Открыто (доступно) -->
              <div class="stat-row">
                <span class="stat-icon">✔️</span>
                <span class="stat-label">Доступно:</span>
                <span class="stat-value">
                  {{ activeStats.stats.unlocked_levels }}/{{
                    activeStats.stats.total_levels
                  }}
                </span>
              </div>

              <div class="stats-divider"></div>

              <!-- 4. Лёгкие уровни -->
              <div class="stat-row">
                <span class="stat-icon stars">⭐</span>
                <span class="stat-label">Лёгкие:</span>
                <span class="stat-value">
                  {{ activeStats.stats.easy_levels }}
                </span>
              </div>

              <!-- 5. Средние уровни -->
              <div class="stat-row">
                <span class="stat-icon stars">⭐⭐</span>
                <span class="stat-label">Средние:</span>
                <span class="stat-value">
                  {{ activeStats.stats.normal_levels }}
                </span>
              </div>

              <!-- 6. Сложные уровни -->
              <div class="stat-row">
                <span class="stat-icon stars">⭐⭐⭐</span>
                <span class="stat-label">Сложные:</span>
                <span class="stat-value">
                  {{ activeStats.stats.hard_levels }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { useToast } from "vue-toastification"
import LevelTree from "@/components/Pages/LevelPage/LevelTree.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import { styleWrapper } from "@/logic/border_styles"

export default {
  name: "SeasonTree",
  components: {
    ThemedButton,
    LevelTree,
  },
  props: {
    seasons: {
      type: Array,
      required: true,
    },
    seasonLevelsTreeOpened: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  watch: {
    seasons(oldVal, newVal) {
      if (oldVal !== newVal) this.init()
    },
    seasonLevelsTreeOpened(oldVal, newVal) {
      if (oldVal !== newVal) {
        this.showSeasonLevelsTree = this.seasonLevelsTreeOpened
      }
    },
  },
  created() {
    this.init()
    this.showSeasonLevelsTree = this.seasonLevelsTreeOpened
  },
  computed: {
    styleWrapper() {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
  },
  data() {
    return {
      w: 100,
      configKonva: { width: 1000, height: 1000 },
      seasonTree: [],
      seasonLevels: [],
      showSeasonLevelsTree: false,
      userSeasonUnlocked: false,
      lastTap: 0,
      lastTappedId: null,
      activeDescription: null, // хранит сезон с открытым описанием
      activeStats: null, // хранит статистику сезона для попапа
    }
  },
  methods: {
    init() {
      this.seasonTree = [...this.seasons]
      this.seasonTree.forEach(season => {
        season.season.lines = [] // добавляем такой ключ, чтобы потом положить туда линии
        season.season.children.forEach(ch => {
          this.calc_line(ch, season)
        })
      })
    },
    // Только для touch устройств
    handleDoubleTap(event, season) {
      const now = Date.now()
      const DOUBLE_TAP_DELAY = 300

      if (
        this.lastTappedId === season.season.id &&
        now - this.lastTap < DOUBLE_TAP_DELAY
      ) {
        // Двойной тап!
        event.preventDefault()
        this.setSeason(season)
      }

      this.lastTap = now
      this.lastTappedId = season.season.id
    },
    // Стиль для HTML блока поверх прямоугольника
    labelStyle(item) {
      return {
        left: item.season.x + "px",
        top: item.season.y + "px",
        width: this.w + "px",
        height: this.w + "px",
      }
    },
    isLocked(season) {
      return season.id === null
    },
    progressPercent(season) {
      const { finished_levels, total_levels } = season.stats ?? {}
      if (!total_levels) return 0
      return Math.round((finished_levels / total_levels) * 100)
    },
    squareConfig(item) {
      const isLocked = !item.id
      const isFinished = item.finished

      const gradients = {
        locked: [0, "#9e9e9e", 1, "#616161"],
        finished: [0, "#e53935", 1, "#7c0205"],
        open: [0, "#ffe082", 1, "#ffb300"],
      }
      const key = isLocked ? "locked" : isFinished ? "finished" : "open"

      return {
        x: item.season.x,
        y: item.season.y,
        width: this.w,
        height: this.w,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: this.w, y: this.w },
        fillLinearGradientColorStops: gradients[key],
        cornerRadius: 20,
        shadowColor: isLocked
          ? "rgba(0,0,0,0.3)"
          : isFinished
            ? "rgba(180,0,0,0.5)"
            : "rgba(255,160,0,0.5)",
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 5,
        stroke: isLocked ? "transparent" : "rgba(255,220,100,0.7)",
        strokeWidth: isLocked ? 0 : 2,
      }
    },
    lineConfig(arrow) {
      return {
        x: arrow.x,
        y: arrow.y,
        points: [
          arrow.points[0],
          arrow.points[1],
          arrow.points[2],
          arrow.points[3],
        ],
        fill: arrow.fill,
        stroke: arrow.fill,
        strokeWidth: 2,
      }
    },
    calc_line(ch, item) {
      const { season } = item
      const connections = ch.connection?.split("-")
      if (!connections || !ch.line) return
      let x1 = undefined
      let y1 = undefined
      let x2 = undefined
      let y2 = undefined

      const seasonIndex = this.seasons.findIndex(
        seas => seas.season.id === ch.related_season_id
      )

      if (ch.line === "right") {
        x1 = this.seasonTree[seasonIndex].season.x - season.x - this.w
        y1 = this.seasonTree[seasonIndex].season.y - season.y
        x2 = season.x + this.w
        y2 = season.y + this.w / 2
      } else if (ch.line === "down") {
        x1 = this.seasonTree[seasonIndex].season.x - season.x
        y1 = this.seasonTree[seasonIndex].season.y - season.y - this.w
        x2 = season.x + this.w / 2
        y2 = season.y + this.w
      } else if (ch.line === "left") {
        x1 = this.seasonTree[seasonIndex].season.x - season.x + this.w
        y1 = this.seasonTree[seasonIndex].season.y - season.y
        x2 = season.x
        y2 = season.y + this.w / 2
      } else if (ch.line === "top") {
        x1 = this.seasonTree[seasonIndex].season.x - season.x
        y1 = this.seasonTree[seasonIndex].season.y - season.y + this.w
        x2 = season.x + this.w / 2
        y2 = season.y
      }
      this.push_line(connections, season, x1, y1, x2, y2)
    },
    push_line(connections, level, x1, y1, x2, y2) {
      for (const l of connections) {
        if (this.seasonTree[parseInt(l) - 1].finished) {
          level.lines.push({
            x: x2,
            y: y2,
            fill: "rgba(255, 246, 193, 1)",
            points: [0, 0, x1, y1],
          })
          return
        }
      }
      level.lines.push({
        x: x2,
        y: y2,
        fill: "rgba(74, 66, 55, 1)",
        points: [0, 0, x1, y1],
      })
    },
    setSeason(season) {
      if (season.id) this.$store.commit("set_season", season.season)
      this.seasonLevels = season.season.levels
      this.showSeasonLevelsTree = true
      this.userSeasonUnlocked = season.id !== null
      this.$emit("level_selected", this.showSeasonLevelsTree)
    },
    openDescription(season) {
      this.activeDescription = season
    },
    closeDescription() {
      this.activeDescription = null
    },
    openStats(season) {
      this.activeStats = season
    },
    closeStats() {
      this.activeStats = null
    },
  },
  emits: ["level_selected"],
}
</script>
<style scoped>
.stage-container {
  position: relative;
}

.html-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.season-label {
  position: absolute;
  border-radius: 20px;
  pointer-events: all;
  cursor: pointer;
  transition: transform 0.18s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.season-label:hover:not(.is-locked) {
  transform: scale(1.06);
}

.season-label.is-locked {
  cursor: default;
}

.season-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  gap: 4px;
  position: relative;
  box-sizing: border-box;
}

/* Иконка замка в правом верхнем углу */
.lock-icon {
  position: absolute;
  top: 6px;
  right: 7px;
  font-size: 13px;
  line-height: 1;
}

.season-name {
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  line-height: 1.25;
  color: rgba(30, 20, 0, 0.85);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.is-finished .season-name {
  color: rgba(255, 240, 210, 0.95);
}

.is-locked .season-name {
  color: rgba(255, 255, 255, 0.65);
}

/* Попап оверлей */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Контент попапа */
.popup-content {
  background-image: linear-gradient(
    180deg,
    rgba(102, 112, 128, 0.95) 0%,
    rgba(21, 45, 81, 0.95) 100%
  );
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;

  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.popup-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-body p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

/* Скроллбар для длинных описаний */
.popup-body::-webkit-scrollbar {
  width: 6px;
}

.popup-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.popup-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.popup-body::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* Список статистики */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.stat-row:hover {
  background: #f0f1f3;
}

.stat-icon {
  font-size: 18px;
  width: 50px;
  text-align: center;
  flex-shrink: 0;
}

.stat-icon.stars {
  font-size: 14px;
  letter-spacing: -2px;
}

.stat-label {
  flex: 1;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  min-width: 50px;
  text-align: right;
}

/* Разделитель между группами */
.stats-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
  margin: 4px 0;
}

.season-progress {
  width: 88%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress-bar {
  height: 5px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 10px;
  transition: width 0.6s ease;
}

.is-finished .progress-fill {
  background: rgba(255, 210, 130, 0.85);
}

.progress-text {
  font-size: 9px;
  text-align: center;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
}

.is-finished .progress-text {
  color: rgba(255, 230, 180, 0.85);
}

.season-actions {
  display: flex;
  gap: 5px;
  margin-top: 2px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 8px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.4;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.55);
  transform: scale(1.12);
}
</style>
