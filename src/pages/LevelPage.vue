<template>
  <div class="container">
    <div class="gradient"></div>
    <div class="levels">
      <div v-if="!gameMod">
        <div
          v-for="mode in game_types"
          :key="mode.name"
          class="game_modes"
          @click="selectGameMode(mode)"
        >
          <div class="global_text mode">{{ mode.name_ru }}</div>
        </div>
      </div>

      <div v-else>
        <div class="header">
          <div class="backBtn" @click="cancelGameMod">
            <img
              class="backBtn__img"
              src="@/assets/icons/buttons/back_icon.svg"
              alt=""
            />
          </div>
          <div class="header__chosen">
            Выбранный режим:
            <span class="global_text header__chosen-gameMod">
              {{ gameMod.name_ru }}
            </span>
          </div>
        </div>
        <div v-if="gameMod.name === 'seasons'">
          <SeasonTree
            :seasons="seasons"
            :seasonLevelsTreeOpened="seasonLevelsTreeOpened"
            @level_selected="configureBackButton"
          />
        </div>
        <div v-if="gameMod.name === 'random'">
          <div class="levels-row">
            <div
              v-for="(level, index) in random_levels_easy"
              :key="level.level.id"
              class="level"
              :class="{ 'level-selected': level === selectedRandomLevel }"
              @dblclick="set_random_level(index, 'easy')"
            >
              <level-preview-comp :level="level" />
            </div>
          </div>
          <div class="levels-row">
            <div
              v-for="(level, index) in random_levels_normal"
              :key="level.level.id"
              class="level"
              :class="{ 'level-selected': level === selectedRandomLevel }"
              @dblclick="set_random_level(index, 'normal')"
            >
              <level-preview-comp :level="level" />
            </div>
          </div>
          <div class="levels-row">
            <div
              v-for="(level, index) in random_levels_hard"
              :key="level.level.id"
              class="level"
              :class="{ 'level-selected': level === selectedRandomLevel }"
              @dblclick="set_random_level(index, 'hard')"
            >
              <level-preview-comp :level="level" />
            </div>
          </div>
        </div>
        <div v-if="gameMod.name === 'arena'" class="arena-entry">
          <div class="global_text arena-entry__title">Стоимость входа</div>
          <div class="arena-entry__costs">
            <resource-item
              name="money"
              :count="1000"
              style="transform: scale(1.4)"
            />
            <resource-item
              name="crops"
              :count="1000"
              style="transform: scale(1.4)"
            />
            <resource-item
              name="wood"
              :count="1000"
              style="transform: scale(1.4)"
            />
          </div>
          <button class="arena-entry__btn" @click="enter_arena">
            <themed-button title="НАЧАТЬ" />
          </button>
        </div>
        <div v-if="gameMod.name === 'random_select'">
          <div class="form-wrapper">
            <!-- Поле ввода числа -->
            <div class="input-group">
              <label for="numberInput">Введите число (минимум 5):</label>
              <input
                id="numberInput"
                v-model.number="inputNumberEnemiesRandomLevel"
                type="number"
                min="5"
                placeholder="5"
                class="number-input"
                @keyup.enter="generateRandomLevel"
              />
              <span v-if="errorMessage" class="error">
                {{ errorMessage }}
              </span>
            </div>

            <!-- Кнопка генерации -->
            <button
              class="generate-btn"
              :disabled="!isValid"
              @click="generateRandomLevel"
            >
              Генерировать
            </button>
            <div
              v-if="randomLevelByNumber"
              :style="difficultyBorder(randomLevelByNumber)"
              @dblclick="setRandomLevelByNumber"
            >
              <level-preview-comp :level="randomLevelByNumber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import LevelPreviewComp from "@/components/LevelPreviewComp.vue"
import SeasonTree from "@/components/Pages/LevelPage/SeasonTree.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import {
  random_level_generator,
  random_level_generator_by_number,
} from "@/logic/random_level"
import type { MappedUserLevel, SeasonEntry } from "@/types"

interface GameType {
  name: string
  name_ru: string
}

export default defineComponent({
  components: {
    LevelPreviewComp,
    SeasonTree,
    ThemedButton,
    ResourceItem,
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      selectedLevel: undefined as MappedUserLevel | undefined, // для подсветки выбранного уровня
      selectedRandomLevel: undefined as MappedUserLevel | undefined,
      random_levels: [] as MappedUserLevel[],
      game_types: [
        {
          name: "seasons",
          name_ru: "Сезоны",
        },
        {
          name: "random",
          name_ru: "Рандом",
        },
        {
          name: "random_select",
          name_ru: "Рандом по количеству",
        },
        {
          name: "arena",
          name_ru: "Арена",
        },
      ] as GameType[],
      gameMod: null as GameType | null,
      seasonLevelsTreeOpened: false,
      randomLevelByNumber: null as MappedUserLevel | null,
      inputNumberEnemiesRandomLevel: 5 as number | null | "",
    }
  },
  computed: {
    seasons(): SeasonEntry[] {
      return this.$store.getters["all_seasons"]
    },
    random_levels_easy(): MappedUserLevel[] {
      return this.random_levels.filter(l => l.level.difficulty === "easy")
    },
    random_levels_normal(): MappedUserLevel[] {
      return this.random_levels.filter(l => l.level.difficulty === "normal")
    },
    random_levels_hard(): MappedUserLevel[] {
      return this.random_levels.filter(l => l.level.difficulty === "hard")
    },
    isValid(): boolean {
      const val = this.inputNumberEnemiesRandomLevel
      return (
        val !== null &&
        val !== "" &&
        val >= 5 &&
        val <= this.max_random_n_enemies
      )
    },
    max_random_n_enemies(): number {
      return this.$store.state.game.max_random_n_enemies
    },
    errorMessage(): string {
      const val = this.inputNumberEnemiesRandomLevel
      if (val === null || val === "") {
        return "Введите число"
      }
      if (val < 5) {
        return "Минимальное значение: 5"
      }
      if (val > this.max_random_n_enemies) {
        return `Максимальное значение: ${this.max_random_n_enemies}`
      }
      return ""
    },
  },
  async created() {
    this.random_levels = random_level_generator()
  },
  methods: {
    selectGameMode(mode: GameType): void {
      this.gameMod = mode
    },
    configureBackButton(): void {
      this.seasonLevelsTreeOpened = true
    },
    /*
    Тут какая логика:
    1) Если был открыто дерево сезонов, а потом дерево уровней, то вот тогда
    по кнопке назад из дерева уровней мы вернемся на дерево сезонов
    2) А если все остальное - то мы сбросим выбор и будем на экране выбора
    режима игры
    */
    cancelGameMod(): void {
      if (!this.seasonLevelsTreeOpened) {
        this.gameMod = null
        return
      }
      this.gameMod = this.game_types[0]
      this.seasonLevelsTreeOpened = false
    },
    set_random_level(index: number, difficulty: string): void {
      this.toast.success(
        `Выбран рандомный уровень: ${index + 1} - ${difficulty}`,
        {
          timeout: 1000,
        }
      )

      let levelsToChoseFrom: MappedUserLevel[] = []
      if (difficulty === "easy") levelsToChoseFrom = this.random_levels_easy
      else if (difficulty === "normal")
        levelsToChoseFrom = this.random_levels_normal
      else if (difficulty === "hard")
        levelsToChoseFrom = this.random_levels_hard
      ;(levelsToChoseFrom[index].level as any).random = true // ставим флаг, что уровень рандомный, чтобы потом не открывать его детей
      this.$store.commit("set_level", levelsToChoseFrom[index])
      this.$store.commit(
        "set_enemy_leader",
        levelsToChoseFrom[index].level.enemy_leader
      )
      this.selectedRandomLevel = levelsToChoseFrom[index]
      this.selectedLevel = undefined
    },
    difficultyBorder(
      level: MappedUserLevel
    ): Record<string, string> | undefined {
      if (level.level.difficulty === "easy")
        return { border: "1px solid lightgreen" }
      else if (level.level.difficulty === "normal")
        return { border: "1px solid orange" }
      else if (level.level.difficulty === "hard")
        return { border: "2px solid black" }
    },
    generateRandomLevel(): void {
      this.randomLevelByNumber = random_level_generator_by_number(
        this.inputNumberEnemiesRandomLevel as number
      )
    },
    enter_arena(): void {
      this.$store.commit("arena_reset")
      this.$router.push("/arena/deckbuild")
    },
    setRandomLevelByNumber(): void {
      this.toast.warning(
        "Выбран режим рандомных врагов по количеству на выбор!",
        {
          timeout: 1000,
        }
      )
      ;(this.randomLevelByNumber!.level as any).random = true // ставим флаг, что уровень рандомный, чтобы потом не открывать его детей
      this.$store.commit("set_level", this.randomLevelByNumber)
      this.$store.commit(
        "set_enemy_leader",
        this.randomLevelByNumber!.level.enemy_leader
      )
    },
  },
})
</script>

<style scoped>
.container {
  position: relative;
}
.gradient {
  position: absolute;
  width: 100%;
  top: -16px;
  height: 120px;
  background: linear-gradient(
    180deg,
    #301f0c 12.16%,
    rgba(40, 45, 51, 0) 103.19%
  );
  z-index: -1;
}
div {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin-bottom: 1%;
}
.header {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}
.header__chosen {
  display: flex;
  flex-direction: column;
  font-family: "Inter", serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: -0.02em;
  font-feature-settings: "calt" off;
  color: #fceabc;
}
.header__chosen-gameMod {
  text-transform: uppercase;
  font-size: 25px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.backBtn {
  display: block;
  left: 5%;
  align-self: center;
  position: absolute;
}
.backBtn__img {
  width: 25px;
}
.levels {
  width: 100%;
  height: 78vh;
  overflow: scroll;
}
.levels-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.level {
  margin: 1%;
  font-size: 6pt;
  display: inline-block;
  position: relative;
  width: 28%;
}
.level-selected {
  box-shadow:
    0 0 20px gold,
    0 0 40px rgba(255, 215, 0, 0.27);
}
.level-selected::after {
  content: "✓";
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 20;
  width: 22px;
  height: 22px;
  background: gold;
  border-radius: 50%;
  font-size: 13px;
  font-weight: bold;
  color: #1a1a2e;
  line-height: 22px;
  text-align: center;
}

.game_modes {
  position: relative;
  width: 100%;
  height: 100px;
  margin-bottom: 15px;
  background: var(--five-gold-gradient);
  box-shadow:
    inset -4px -4px 10px rgba(0, 0, 0, 0.25),
    inset 4px 4px 10px rgba(0, 0, 0, 0.25);
}
.game_modes:nth-child(1) {
  margin-top: 30px;
}
.mode {
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  margin: 0;
  font-size: 25px;
  color: #5f4209;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: white;
}

.number-input {
  width: 200px;
  padding: 12px 16px;
  font-size: 18px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.number-input:focus {
  border-color: #4a90d9;
}

.number-input:invalid {
  border-color: #e74c3c;
}

.error {
  color: #e74c3c;
  font-size: 12px;
}

.generate-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: #4a90d9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #357abd;
}

.generate-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.generate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.arena-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 20px;
}

.arena-entry__title {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.arena-entry__costs {
  display: flex;
  flex-direction: row;
  gap: 36px;
  align-items: center;
  justify-content: center;
}

.arena-entry__btn {
  width: 200px;
  height: 60px;
  margin-top: 10px;
}
</style>
