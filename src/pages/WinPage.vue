<template>
  <div class="win-section">
    <span class="global_text price-label">ВАШ ВЫИГРЫШ</span>
    <div class="play-price">
      <resource-item
        v-if="pay_data.raw_bronze"
        name="raw_bronze"
        :count="pay_data.raw_bronze"
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.raw_silver"
        name="raw_silver"
        :count="pay_data.raw_silver"
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.raw_gold"
        name="raw_gold"
        :count="pay_data.raw_gold"
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.scraps"
        name="scraps"
        :count="pay_data.scraps"
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.crops"
        name="crops"
        :count="pay_data.crops"
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.wood"
        name="wood"
        :count="pay_data.wood"
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.kegs"
        name="kegs"
        :count="pay_data.kegs"
        style="transform: scale(2)"
      />
      <resource-item
        v-if="pay_data.big_kegs"
        name="big_kegs"
        :count="pay_data.big_kegs"
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        name="keys"
        :count="pay_data.keys"
        style="transform: scale(2)"
      />
    </div>
    <div class="play-price">
      <resource-item
        v-if="pay_data.money"
        name="money"
        :count="pay_data.money"
        style="transform: scale(2)"
      />
    </div>
  </div>
</template>

<script>
import { getRewardForLevel } from "@/logic/random_rewards"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { PayResourcesSubtype } from "@/store/const/const"
import { GameStatsRecordType, LeaderboardGameMode } from "@/types"
export default {
  name: "win-page",
  components: { ResourceItem },
  data() {
    return {
      pay_data: {},
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
    let gameMode
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
    // награда ресурсов за прохождение уровня
    async pay_resources() {
      const difficulty = this.$store.state.game.level.difficulty
      const win_level_rewards = this.$store.getters["win_level_rewards"]
      this.pay_data = getRewardForLevel(win_level_rewards[difficulty])
      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.winSeasonLevel,
        data: this.pay_data,
      })
    },
    // открытие всех связанных уровней при прохождении уровня
    async open_levels() {
      const currentLevel = this.$store.getters["currentLevel"]

      // при рандомном уровне сразу выходим отсюда
      if (currentLevel.random) return

      // выбранный сезон из стора, выбирается по открытию дерева
      const season = this.$store.getters["get_season"]

      // ищем уровень из списка уровней сезона
      const userLevel = season.levels.find(
        lev => lev.level.id === currentLevel.id
      )

      // если уровень УЖЕ пройден, то нет смысла открывать его детей
      if (!userLevel || userLevel.finished) return

      await this.$store.dispatch("openRelatedLevels", userLevel.id)
    },
  },
}
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
