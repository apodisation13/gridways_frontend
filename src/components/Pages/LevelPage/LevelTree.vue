<template>
  <div>
    <div>{{ seasonName }}</div>
    <v-stage :config="configKonva">
      <v-layer>
        <!--для каждого уровня из списка уровней текущего сезона-->
        <div v-for="(level, index) in levs" :key="level.id">
          <!--рисуем звезды сложности, 1,2 или 3-->
          <v-star :config="starConfig(level, 0)"></v-star>
          <v-star
            :config="starConfig(level, w / 2)"
            v-if="
              level.level.difficulty === 'normal' ||
              level.level.difficulty === 'hard'
            "
          ></v-star>
          <v-star
            :config="starConfig(level, w)"
            v-if="level.level.difficulty === 'hard'"
          ></v-star>
          <!--Прямоугольник уровня, пройден\открыт\закрыт, свечение по фракции-->
          <v-rect
            :config="squareConfig(level)"
            @dblclick="setLevel(level)"
            @dbltap="setLevel(level)"
            @pointerup="end"
            @pointerdown="start(level)"
          ></v-rect>
          <!--Текст внутри прямоугольника, или id или значок замка (закрыт)-->
          <v-text
            v-if="level.unlocked || !userSeasonUnlocked"
            :config="textConfig(level)"
            @dblclick="setLevel(level)"
            @dbltap="setLevel(level)"
            @pointerup="end"
            @pointerdown="start(level)"
          ></v-text>
          <!--Значок замка-->
          <v-image
            v-else
            :config="imageConfig(level)"
            @dblclick="setLevel(index)"
            @dbltap="setLevel(index)"
            @pointerup="end"
            @pointerdown="start(level)"
          ></v-image>
          <!--Линии связей-->
          <!--Для каждой линии из линии связей-->
          <v-line
            v-for="line in level.level.lines"
            :key="line"
            :config="lineConfig(line)"
          ></v-line>
        </div>
      </v-layer>
    </v-stage>
    <level-modal
      v-if="show_level_modal"
      :level="level.level"
      @close_level_modal="show_level_modal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import { useToast } from "vue-toastification"
import LevelModal from "@/components/ModalWindows/LevelModal.vue"
import type { MappedUserLevel, LevelRelatedLevel } from "@/types"

export default defineComponent({
  name: "LevelTree",
  components: { LevelModal },
  props: {
    seasonName: { type: String, required: true },
    levels: { type: Array as PropType<MappedUserLevel[]>, required: true },
    userSeasonUnlocked: { type: Boolean, required: true },
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  watch: {
    levels(oldVal, newVal) {
      if (oldVal !== newVal) this.init()
    },
  },
  created() {
    this.init()
  },
  data() {
    return {
      w: 28,
      configKonva: { width: 1000, height: 1000 },
      levs: [] as any[],
      timer: 0 as ReturnType<typeof setTimeout> | 0,
      level: null as MappedUserLevel | null,
      show_level_modal: false,
    }
  },
  methods: {
    init(): void {
      this.levs = [...this.levels]
      this.levs.forEach((level: any) => {
        level.level.lines = [] // добавляем такой ключ, чтобы потом положить туда линии
        level.level.children.forEach((ch: LevelRelatedLevel) => {
          this.calc_line(ch, level)
        })
      })
    },
    squareConfig(item: any): Record<string, unknown> {
      const unlocked = this.userSeasonUnlocked
      return {
        x: item.level.x,
        y: item.level.y,
        width: this.w,
        height: this.w,
        cornerRadius: 8,
        fill: this.levelColor(item),
        stroke: this.levelBorder(item),
        strokeWidth: item.finished ? 0 : 1.5,
        shadowColor: this.levelFaction(item),
        shadowBlur: !unlocked ? 0 : item.finished ? 14 : 9,
        shadowOpacity: unlocked ? 0.6 : 0,
      }
    },
    levelColor(item: any): string {
      if (!this.userSeasonUnlocked) return "grey"
      if (item.finished) return "rgba(255, 231, 183, 1)"
      if (item.unlocked) return "rgba(237, 177, 62, 1)"
      return "silver"
    },
    levelBorder(item: any): string {
      if (!this.userSeasonUnlocked) return "grey"
      if (item.finished) return ""
      return "rgba(0, 0, 0, 0.13)"
    },
    levelFaction(item: any): string {
      if (!this.userSeasonUnlocked) return "grey"
      if (item.level.enemy_leader.faction === "Soldiers") return "blue"
      if (item.level.enemy_leader.faction === "Monsters") return "red"
      if (item.level.enemy_leader.faction === "Animals") return "green"
      return "grey"
    },
    textConfig(item: any): Record<string, unknown> {
      return {
        text: item.level.id,
        fontSize: 16,
        x:
          item.level.id >= 10
            ? item.level.x + this.w / 4
            : item.level.x + this.w / 4 + 2,
        y:
          item.level.id >= 10
            ? item.level.y + this.w / 4
            : item.level.y + this.w / 4 + 2,
      }
    },
    imageConfig(item: any): Record<string, unknown> {
      const image = new Image()
      image.src = require("@/assets/icons/locked_level.png")
      return {
        x: item.level.x + this.w / 4,
        y: item.level.y + this.w / 4,
        width: this.w / 2,
        height: this.w / 2,
        image: image,
      }
    },
    lineConfig(arrow: any): Record<string, unknown> {
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
    starConfig(item: any, position: number): Record<string, unknown> {
      return {
        x: item.level.x + position,
        y: item.level.y - 7,
        numPoints: 5,
        innerRadius: 4,
        outerRadius: 7,
        fill: "gold",
        strokeWidth: 2,
      }
    },
    calc_line(ch: LevelRelatedLevel, item: any): void {
      const { level } = item
      const connections = ch.connection?.split("-")
      if (!connections || !ch.line) return
      let x1: number | undefined
      let y1: number | undefined
      let x2: number | undefined
      let y2: number | undefined
      const levIndex = this.levels.findIndex(
        lev => lev.level.id === ch.related_level_id
      )

      if (ch.line === "right") {
        x1 = this.levs[levIndex].level.x - level.x - this.w
        y1 = this.levs[levIndex].level.y - level.y
        x2 = level.x + this.w
        y2 = level.y + this.w / 2
      } else if (ch.line === "down") {
        x1 = this.levs[levIndex].level.x - level.x
        y1 = this.levs[levIndex].level.y - level.y - this.w
        x2 = level.x + this.w / 2
        y2 = level.y + this.w
      } else if (ch.line === "left") {
        x1 = this.levs[levIndex].level.x - level.x + this.w
        y1 = this.levs[levIndex].level.y - level.y
        x2 = level.x
        y2 = level.y + this.w / 2
      } else if (ch.line === "top") {
        x1 = this.levs[levIndex].level.x - level.x
        y1 = this.levs[levIndex].level.y - level.y + this.w
        x2 = level.x + this.w / 2
        y2 = level.y
      }
      this.push_line(connections, level, x1, y1, x2, y2)
    },
    push_line(
      connections: string[],
      level: any,
      x1: number | undefined,
      y1: number | undefined,
      x2: number | undefined,
      y2: number | undefined
    ): void {
      for (const l of connections) {
        if (!this.userSeasonUnlocked) {
          level.lines.push({
            x: x2,
            y: y2,
            fill: "grey",
            points: [0, 0, x1, y1],
          })
          return
        }
        const levIndex = this.levels.findIndex(
          lev => lev.level.id === parseInt(l)
        )
        if (this.levs[levIndex].finished) {
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
    setLevel(level: any): void {
      if (!this.userSeasonUnlocked) {
        // весь сезон закрыт, нельзя поиграть в него вообще
        this.toast.warning("Весь этот сезон закрыт!")
        return
      }
      if (!level.id) {
        // этот id - user_levels.id - если уровень закрыт, его нет (null)
        this.toast.warning("Уровень закрыт!")
        return
      }
      this.toast.success(`Выбран уровень ${level.level.id}! `, {
        timeout: 1000,
      })
      this.$store.commit("set_level", level)
      this.$store.commit("set_enemy_leader", level.level.enemy_leader)
    },
    start(level: any): void {
      this.timer = setTimeout(() => {
        if (this.timer) this.longTap(level)
      }, 1000)
    },
    end(): void {
      clearTimeout(this.timer as ReturnType<typeof setTimeout>)
      this.timer = 0
    },
    longTap(level: MappedUserLevel): void {
      this.level = level
      this.show_level_modal = true
    },
  },
})
</script>
