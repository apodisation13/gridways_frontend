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

    <div v-if="activeTab === 'me'">
      <LeaderboardTable
        :selected-mode="selectedMode"
        :selected-faction="selectedFaction"
      />
    </div>
    <div v-else>
      <LeaderboardTable
        :selected-mode="selectedMode"
        :selected-faction="selectedFaction"
        is_world
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ButtonIcon from "@/components/Pages/DeckbuildPage/Buttons/ButtonIcon"
import LeaderboardFilters from "@/components/Pages/LeaderboardPage/LeaderboardFilters.vue"
import LeaderboardTable from "@/components/Pages/LeaderboardPage/LeaderboardTable.vue"

export default {
  components: { LeaderboardTable, ButtonIcon, LeaderboardFilters },

  data() {
    return {
      activeTab: this.$route.query.world ? "all" : "me",
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
  },
  methods: {
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
