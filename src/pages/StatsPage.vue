<template>
  <div class="user-stats">
    <!-- Фракции -->
    <div class="factions-row">
      <div
        v-for="(factionStat, factionName) in userStats"
        :key="factionName"
        class="faction-block"
      >
        <faction-item :faction="{ name: factionName }" />

        <div class="stat-box">
          <span class="stat-label">побед / игр</span>
          <span class="stat-value"
            >{{ factionStat.win }} / {{ factionStat.play }}</span
          >
        </div>

        <div class="stat-box">
          <span class="stat-label">винрейт</span>
          <span class="stat-value">{{ factionStat.winrate }}%</span>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="section-title global_text">Статистика</div>

    <div class="general-stats">
      <div class="stat-row">
        <span class="stat-row-label">Карты</span>
        <span class="stat-row-value"
          >{{ cardsStats.open }} / {{ cardsStats.total }}</span
        >
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Лидеры</span>
        <span class="stat-row-value"
          >{{ leaderStats.open }} / {{ leaderStats.total }}</span
        >
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Уровни</span>
        <span class="stat-row-value"
          >{{ levelsStats.finished }} / {{ levelsStats.total }}</span
        >
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Сезоны</span>
        <span class="stat-row-value"
          >{{ seasonsStats.finished }} / {{ seasonsStats.total }}</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import { mapGetters } from "vuex"

export default {
  name: "StatsPage",
  components: { FactionItem },
  computed: {
    userId() {
      return this.$route.query.userId || this.$store.getters["getUser"].user_id
    },
    ...mapGetters([
      "userStats",
      "cardsStats",
      "leaderStats",
      "levelsStats",
      "seasonsStats",
    ]),
  },
  async created() {
    const for_user = this.$route.query.userId
    if (for_user) await this.$store.dispatch("getUserStatistic", for_user)
    else this.$store.dispatch("getUserStatistic")
  },
}
</script>

<style scoped>
.user-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px; /* 4) отступ сверху */
}

.factions-row {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
}

.faction-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 4px 8px;
  min-width: 55px;
}

.stat-label {
  font-size: 11px; /* 1) покрупнее */
  color: white;
}

.stat-value {
  font-size: 16px; /* 1) покрупнее */
  color: white;
}

.section-title {
  font-size: 16px;
  margin-top: 84px; /* 3) отступ до статистики */
  color: white;
}

.general-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 6px 12px;
}

.stat-row-label {
  font-size: 15px; /* 1) покрупнее */
  background: var(--primary-gold-gradient); /* 2) золотой */
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.7;
}

.stat-row-value {
  font-size: 15px; /* 1) покрупнее */
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
