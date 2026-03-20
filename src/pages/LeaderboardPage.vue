<template>
  <div class="leaderboard">
    <div class="leaderboard__tabs">
      <button
        class="base-b"
        :class="{ 'base-b--active': activeTab === 'me' }"
        @click="activeTab = 'me'"
      >
        <span class="base-b-text">Вы</span>
      </button>
      <button
        class="base-b"
        :class="{ 'base-b--active': activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <span class="base-b-text">Все</span>
      </button>
    </div>

    <!-- строка фильтров -->
    <div class="leaderboard__filter-row">
      <button-icon
        class="filter_btn"
        :image_name="'open_filters.svg'"
        :class="{ 'set-filter': !emptyFilters }"
        @click="showFilters = true"
      />
      <button-icon
        v-if="!emptyFilters"
        class="filter_btn_cancel"
        :image_name="'add_icon.svg'"
        @click="resetFilters"
      />
    </div>

    <!-- модалка фильтров -->
    <leaderboard-filters
      v-if="showFilters"
      :factions="availableFactions"
      :selected-faction="selectedFaction"
      :selected-mode="selectedMode"
      @close-modal="showFilters = false"
      @reset-filters="resetFilters"
      @set-faction="setFaction"
      @set-mode="val => (selectedMode = selectedMode === val ? null : val)"
    />

    <div v-if="activeTab === 'me'" class="leaderboard__table-wrap">
      <table class="leaderboard__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Фракция</th>
            <th>Лидер</th>
            <th>Режим</th>
            <th>Рекорд</th>
          </tr>
        </thead>
        <tbody class="leaderboard__table-body">
          <tr
            v-for="(entry, index) in filteredLeaderboard"
            :key="entry.leader_id + entry.mode"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <faction-item :faction="{ name: entry.faction_name }" />
            </td>
            <td>
              <div
                v-if="findLeader(entry.leader_id)"
                class="leaderboard__card-wrap"
              >
                <card-item
                  :card="findLeader(entry.leader_id).card"
                  :is_leader="true"
                  :hp_needed="true"
                  :bonus="false"
                />
              </div>
            </td>
            <td>{{ entry.mode }}</td>
            <td>{{ entry.max_kills }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="leaderboard__empty" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import CardItem from "@/components/Cards/CardItem.vue"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon"
import LeaderboardFilters from "@/components/Pages/LeaderboardPage/LeaderboardFilters.vue"

export default {
  components: { CardItem, FactionItem, ButtonIcon, LeaderboardFilters },

  data() {
    return {
      activeTab: "me",
      showFilters: false,
      selectedFaction: null,
      selectedMode: null,
    }
  },

  computed: {
    ...mapGetters(["userLeaderboard"]),
    emptyFilters() {
      return !this.selectedFaction && !this.selectedMode
    },
    availableFactions() {
      return [...new Set(this.userLeaderboard.map(e => e.faction_name))]
    },
    filteredLeaderboard() {
      return this.userLeaderboard.filter(e => {
        if (this.selectedFaction && e.faction_name !== this.selectedFaction)
          return false
        return !(this.selectedMode && e.mode !== this.selectedMode)
      })
    },
  },

  created() {
    this.getUserLeaderboard()
  },

  methods: {
    ...mapActions(["getUserLeaderboard"]),
    findLeader(leaderId) {
      return this.$store.getters["all_leaders"].find(
        item => item.card.id === leaderId
      )
    },
    resetFilters() {
      this.selectedFaction = null
      this.selectedMode = null
    },
    setFaction(prop, value) {
      console.log(prop, value)
      this.selectedFaction = value
    },
  },
}
</script>

<style scoped>
/* ── Кнопки ── */
.leaderboard__tabs {
  display: flex;
  gap: 12px;
  width: 360px;
}

.base-b {
  flex: 1;
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 2px solid #facf5d;
  border-radius: 6px;
  padding: 13px;
  text-align: center;
  cursor: pointer;
  outline: none;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.base-b--active {
  opacity: 1;
}

.base-b-text {
  font-size: 16px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.leaderboard {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
}

.leaderboard__tabs {
  display: flex;
  gap: 12px;
  width: 360px;
  margin: 0 auto;
}

.leaderboard__card-wrap {
  width: 60px;
  margin: 0 auto;
}

.leaderboard__table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard__table-wrap {
  overflow-y: auto;
  max-height: calc(
    100vh - 200px
  ); /* 200px — примерная высота шапки + кнопки + отступы */
}

.leaderboard__table th,
.leaderboard__table td {
  padding: 10px 16px;
  text-align: center;
  border: 1px solid #facf5d33;
  font-size: 16px;
}

.leaderboard__table thead tr {
  border-bottom: 2px solid #facf5d66;
}

.leaderboard__table th {
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #facf5d;
}

.leaderboard__table tbody tr {
  transition: background 0.15s;
}

.leaderboard__table tbody tr:hover {
  background: rgba(250, 207, 93, 0.05);
}

.leaderboard__table td:first-child {
  color: #facf5d99;
  font-size: 13px;
  width: 32px;
}

.leaderboard__table-body {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.leaderboard__filter-row {
  position: relative;
  display: flex;
  justify-content: center;
}

.filter_btn {
  position: relative;
  margin: 10px;
  transition: transform 0.2s;
}

.set-filter::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #facf5d;
}

.filter_btn_cancel {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
</style>
