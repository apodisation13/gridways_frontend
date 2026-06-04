<template>
  <div class="user-stats">
    <button
      v-if="$route.query.userId"
      class="back-btn"
      @click="$router.push({ path: '/leaderboard', query: { world: 'true' } })"
    >
      ← Назад
    </button>
    <!-- Шапка: профиль + фракции -->
    <div class="header-section">
      <!-- Левая часть: аватарка + никнейм -->
      <div class="user-profile">
        <img
          v-if="selectedAvatar"
          :src="
            selectedAvatar.includes('/')
              ? require(`@/assets/${selectedAvatar}.svg`)
              : require(`@/assets/icons/resources/${selectedAvatar}.svg`)
          "
        />
        <div v-else class="avatar-placeholder" />
        <span class="username">{{ username }}</span>
      </div>

      <!-- Правая часть: фракции вертикально -->
      <div class="factions-column">
        <div
          v-for="(factionStat, factionName) in userStats"
          :key="factionName"
          class="faction-row"
        >
          <faction-item :faction="{ name: factionName }" />

          <div class="stat-box">
            <span class="stat-label">побед / игр</span>
            <span class="stat-value">
              {{ factionStat.win }} / {{ factionStat.play }}
            </span>
          </div>

          <div class="stat-box">
            <span class="stat-label">винрейт</span>
            <span class="stat-value">{{ factionStat.winrate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="section-title global_text">Статистика</div>

    <div class="general-stats">
      <div class="stat-row">
        <span class="stat-row-label">Карты</span>
        <span class="stat-row-value">
          {{ cardsStats.open }} / {{ cardsStats.total }}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Лидеры</span>
        <span class="stat-row-value">
          {{ leaderStats.open }} / {{ leaderStats.total }}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Уровни</span>
        <span class="stat-row-value">
          {{ levelsStats.finished }} / {{ levelsStats.total }}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Сезоны</span>
        <span class="stat-row-value">
          {{ seasonsStats.finished }} / {{ seasonsStats.total }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import type { CollectionStats, FactionStats, ProgressStats } from "@/types"

export default defineComponent({
  name: "StatsPage",
  components: { FactionItem },
  computed: {
    userId(): string | number {
      return this.$route.query.userId || this.$store.getters["getUser"].user_id
    },
    username(): string {
      return this.$route.query.username || this.$store.state.login.user.username
    },
    selectedAvatar(): string | undefined {
      return (
        this.$route.query.userProfileAvatar ||
        this.$store.getters["selectedAvatar"]
      )
    },
    userStats(): Record<string, FactionStats> {
      return this.$store.getters["userStats"]
    },
    cardsStats(): CollectionStats {
      return this.$store.getters["cardsStats"]
    },
    leaderStats(): CollectionStats {
      return this.$store.getters["leaderStats"]
    },
    levelsStats(): ProgressStats {
      return this.$store.getters["levelsStats"]
    },
    seasonsStats(): ProgressStats {
      return this.$store.getters["seasonsStats"]
    },
  },
  async created() {
    const for_user = this.$route.query.userId
    if (for_user) await this.$store.dispatch("getUserStatistic", for_user)
    else this.$store.dispatch("getUserStatistic")
  },
})
</script>

<style scoped>
.user-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
}

.back-btn {
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 2px solid #facf5d;
  border-radius: 6px;
  display: inline-block;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  outline: none;
  color: #facf5d;
  margin-bottom: 16px;
}

/* Шапка */
.header-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 20%;
  object-fit: contain;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-placeholder {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.username {
  font-size: 14px;
  color: white;
  text-align: center;
  word-break: break-all;
}

/* Фракции */
.factions-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: auto;
  margin-right: 30px;
}

.faction-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
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
  font-size: 11px;
  color: white;
}

.stat-value {
  font-size: 16px;
  color: white;
}

/* Статистика */
.section-title {
  font-size: 16px;
  margin-top: 84px;
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
  font-size: 15px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.7;
}

.stat-row-value {
  font-size: 15px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
