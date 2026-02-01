<template>
  <div>
    <v-stage :config="configKonva" v-if="!showSeasonLevelsTree">
      <v-layer>
        <!--для каждого сезона из списка всех сезонов-->
        <div v-for="season in seasonTree" :key="season.season.id">
          <!--Прямоугольник сезона, пройден\открыт\закрыт-->
          <v-rect
            :config="squareConfig(season)"
            @dblclick="setSeason(season)"
            @dbltap="setSeason(season)"
            @pointerup="end(season)"
            @pointerdown="start(season)"
          ></v-rect>
          <!--Текст внутри прямоугольника, или id или значок замка (закрыт)-->
          <v-text
            :config="textConfig(season)"
            @dblclick="setSeason(season)"
            @dbltap="setSeason(season)"
            @pointerup="end(season)"
            @pointerdown="start(season)"
          ></v-text>
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
        :style="labelStyle(season)"
        @dblclick="setSeason(season)"
        @pointerup="end(season)"
        @pointerdown="start(season)"
      >
        <!-- Теперь можешь добавлять любой HTML! -->
        <div class="season-content">
          <span class="season-id">{{ season.season.id }}</span>
          <span class="season-name">{{ season.season.name }}</span>
          <div class="season-icon" v-if="isLocked(season)">🔒</div>
          <div class="season-stars" v-if="isPassed(season)">⭐⭐⭐</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification"
import LevelTree from "@/components/Pages/LevelPage/LevelTree.vue"

export default {
  name: "SeasonTree",
  components: {
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
    // this.$emit("level_selected", this.showSeasonLevelsTree)
    this.init()
    this.showSeasonLevelsTree = this.seasonLevelsTreeOpened
  },
  data() {
    return {
      w: 120,
      configKonva: { width: 1000, height: 1000 },
      seasonTree: [],
      timer: 0,
      seasonLevels: [],
      showSeasonLevelsTree: false,
      userSeasonUnlocked: false,
    }
  },
  methods: {
    init() {
      console.log("DRAW SEASON TREE")
      this.seasonTree = [...this.seasons]
      this.seasonTree.forEach(season => {
        season.season.lines = [] // добавляем такой ключ, чтобы потом положить туда линии
        season.season.children.forEach(ch => {
          this.calc_line(ch, season)
        })
      })
    },
    // Стиль для HTML блока поверх прямоугольника
    labelStyle(item) {
      return {
        position: "absolute",
        left: item.season.x + "px",
        top: item.season.y + "px",
        width: this.w + "px",
        height: this.w + "px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto", // чтобы кликать можно было
      }
    },
    isLocked(season) {
      // твоя логика
      return season.status === 'locked'
    },
    squareConfig(item) {
      return {
        x: item.season.x,
        y: item.season.y,
        width: this.w,
        height: this.w,
        fill: this.seasonColor(item),
        stroke: this.seasonBorder(item),
        shadowBlur: 7,
      }
    },
    seasonColor(item) {
      // здесь item - это весь объект списка user_seasons: {id, finished, season}
      // если id есть - значит он есть в user_seasons (и он открыт!)
      if (!item.id) return "grey"
      if (item.finished) return "rgba(124, 2, 5, 1)"
      return "rgba(255, 231, 183, 1)"
    },
    seasonBorder(item) {
      if (!item.id) return "grey"
      if (item.finished) return ""
      return "rgba(0, 0, 0, 0.13)"
    },
    textConfig(item) {
      return {
        text: item.season.id,
        fontSize: 16,
        x:
          item.season.id >= 10
            ? item.season.x + this.w / 4
            : item.season.x + this.w / 4 + 2,
        y:
          item.season.id >= 10
            ? item.season.y + this.w / 4
            : item.season.y + this.w / 4 + 2,
      }
    },
    imageConfig(item) {
      const image = new Image()
      image.src = require("@/assets/icons/locked_level.png")
      return {
        x: item.season.x + this.w / 4,
        y: item.season.y + this.w / 4,
        width: this.w / 2,
        height: this.w / 2,
        image: image,
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
    start(level) {
      this.timer = setTimeout(() => {
        if (this.timer > 0) this.longTap(level)
      }, 1000)
    },
    end() {
      clearTimeout(this.timer)
      this.timer = 0
    },
    longTap(level) {
      this.level = level
      this.show_level_modal = true
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
  pointer-events: none; /* пропускаем клики на canvas */
}

.season-label {
  pointer-events: auto; /* но сами лейблы кликабельны */
  cursor: pointer;
}

.season-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.season-id {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.season-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.season-icon {
  font-size: 20px;
}

.season-stars {
  font-size: 14px;
}
</style>
