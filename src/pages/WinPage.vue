<template>
  <div class="win-section" @click="$router.push('/bonus')">
    <span class="global_text price-label">ВАШ ВЫИГРЫШ</span>
    <Teleport to="body">
      <div
        v-if="levelRewards || seasonRewards"
        class="rewards-overlay"
        @click.stop="closeRewards"
      >
        <section
          class="level-rewards"
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-rewards-title"
          @click.stop
        >
          <div class="rewards-header">
            <button-close @close_self="closeRewards" />
            <h2 id="level-rewards-title" class="global_text price-label">
              Награды за первое прохождение
            </h2>
          </div>
          <div v-if="levelRewards && seasonRewards" class="reward-sources">
            <button
              :class="{ active: !showSeasonRewards }"
              @click="showSeasonRewards = false"
            >
              За уровень
            </button>
            <button
              :class="{ active: showSeasonRewards }"
              @click="showSeasonRewards = true"
            >
              За сезон
            </button>
          </div>
          <h3 v-else class="reward-source-title">
            {{ seasonRewards ? "За сезон" : "За уровень" }}
          </h3>
          <level-season-reward
            v-if="seasonRewards && (showSeasonRewards || !levelRewards)"
            key="season"
            :rewards="seasonRewards"
          />
          <level-season-reward
            v-else-if="levelRewards"
            key="level"
            :rewards="levelRewards"
          />
        </section>
      </div>
    </Teleport>
    <div class="play-price">
      <resource-item
        v-if="pay_data.raw_bronze"
        name="raw_bronze"
        :count="pay_data.raw_bronze"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.raw_silver"
        name="raw_silver"
        :count="pay_data.raw_silver"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.raw_gold"
        name="raw_gold"
        :count="pay_data.raw_gold"
        show_delta
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.scraps"
        name="scraps"
        :count="pay_data.scraps"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.crops"
        name="crops"
        :count="pay_data.crops"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.wood"
        name="wood"
        :count="pay_data.wood"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.silk"
        name="silk"
        :count="pay_data.silk"
        show_delta
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.kegs"
        name="kegs"
        :count="pay_data.kegs"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.big_kegs"
        name="big_kegs"
        :count="pay_data.big_kegs"
        show_delta
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.flowers"
        name="flowers"
        :count="pay_data.flowers"
        show_delta
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        name="keys"
        :count="pay_data.keys"
        show_delta
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.money"
        name="money"
        :count="pay_data.money"
        show_delta
        style="transform: scale(2)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import LevelSeasonReward from "@/components/Pages/LevelPage/LevelSeasonReward.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { getRewardForLevel } from "@/logic/random_rewards"
import {
  GameStatsRecordType,
  LeaderboardGameMode,
  LevelEntry,
  LevelSeasonRewards,
  PayResourcesSubtype,
  SeasonEntry,
} from "@/types"

export default defineComponent({
  name: "WinPage",
  components: { ResourceItem, LevelSeasonReward, ButtonClose },
  data() {
    return {
      pay_data: {} as Record<string, number>,
      levelRewards: null as LevelSeasonRewards | null,
      seasonRewards: null as LevelSeasonRewards | null,
      showSeasonRewards: false,
    }
  },
  async created() {
    if (!this.$store.state.user_actions.win_redirect) return
    this.$store.dispatch("re_set_deck") // и тут переустанавливаем выбранную деку
    await this.pay_resources() // получаем ресурсы за выигрыш
    await this.open_levels() // открываем связанные уровни в дереве
    await this.$store.dispatch("postUserStatistic", {
      user_deck_id: this.$store.state.game.whole_deck.id,
      type: GameStatsRecordType.win,
    })
    const level_name = this.$store.state.game.level.name
    let gameMode: LeaderboardGameMode
    if (level_name === "random") gameMode = LeaderboardGameMode.random
    else if (level_name === "random_n") gameMode = LeaderboardGameMode.random_n
    else gameMode = LeaderboardGameMode.season
    await this.$store.dispatch("postUserLeaderboard", {
      user_deck_id: this.$store.state.game.whole_deck.id,
      mode: gameMode,
      max_kills: this.$store.getters["enemies_grave"].length + 1,
    })
    this.$store.commit("set_win_redirect", false)
  },
  methods: {
    closeRewards(): void {
      this.levelRewards = null
      this.seasonRewards = null
      this.showSeasonRewards = false
    },
    // награда ресурсов за прохождение уровня
    async pay_resources(): Promise<void> {
      const difficulty = this.$store.state.game.level.difficulty
      const win_level_rewards = this.$store.getters["win_level_rewards"]
      this.pay_data = getRewardForLevel(win_level_rewards[difficulty])
      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.winSeasonLevel,
        data: this.pay_data,
      })
    },
    // открытие всех связанных уровней при прохождении уровня
    async open_levels(): Promise<void> {
      const currentLevel = this.$store.getters["currentLevel"]

      // при рандомном уровне сразу выходим отсюда
      if (currentLevel.random) return

      // Берём актуальный прогресс: выбранный сезон может хранить старый объект.
      const seasonId = this.$store.getters["get_season"]?.id
      const season = this.$store.getters["all_seasons"].find(
        (entry: SeasonEntry) => entry.season.id === seasonId
      ) as SeasonEntry | undefined
      if (!season) return
      const wasSeasonFinished = season.finished

      // ищем уровень из списка уровней сезона
      const userLevel = season.season.levels.find(
        (lev: LevelEntry) => lev.level.id === currentLevel.id
      )

      // если уровень УЖЕ пройден, то нет смысла открывать его детей
      if (!userLevel || userLevel.finished) return

      await this.$store.dispatch("openRelatedLevels", userLevel.id)
      const rewards = userLevel.level.data?.rewards
      if (rewards && Object.keys(rewards).length) {
        this.levelRewards = rewards
      }
      const updatedSeason = this.$store.getters["all_seasons"].find(
        (entry: SeasonEntry) => entry.season.id === seasonId
      ) as SeasonEntry | undefined
      if (wasSeasonFinished === false && updatedSeason?.finished === true) {
        const seasonRewards = updatedSeason.season.data?.rewards
        if (seasonRewards && Object.keys(seasonRewards).length) {
          this.seasonRewards = seasonRewards
        }
      }
    },
  },
})
</script>

<style scoped>
.win-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 55px;
}

.play-price {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 4vw, 30px);
  flex-wrap: wrap;
}

.rewards-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
}

.level-rewards {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(100%, 400px);
  height: calc(var(--vh, 1vh) * 70);
  overflow: hidden;
  padding: 20px;
  border: 1px solid #c5a87e;
  border-radius: 16px;
  background: linear-gradient(180deg, #1e2834 0%, #0a0b0c 100%);
}

.rewards-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.rewards-header h2 {
  text-align: center;
  font-size: 18px;
}

.reward-sources {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.reward-sources button {
  flex: 1;
  padding: 8px;
  border: 1px solid #c5a87e;
  border-radius: 6px;
  background: transparent;
  color: #c5a87e;
  cursor: pointer;
}

.reward-sources button.active {
  background: #c5a87e;
  color: #0a0b0c;
}

.reward-source-title {
  margin: 0;
  flex-shrink: 0;
  text-align: center;
  color: #c5a87e;
}

.price-label {
  font-family: "Philosopher", serif;
  font-style: normal;
  font-weight: 700;
  font-size: 23px;
  line-height: 120%;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 2px;
  padding: 2px;
}
</style>
