<template>
  <div class="leaderboard__table-wrap">
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
</template>

<script>
import CardItem from "@/components/Cards/CardItem.vue"
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"

export default {
  name: "LeaderboardTable",
  components: { FactionItem, CardItem },
  props: {
    isWorld: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    filteredLeaderboard() {
      return this.userLeaderboard.filter(e => {
        if (this.selectedFaction && e.faction_name !== this.selectedFaction)
          return false
        return !(this.selectedMode && e.mode !== this.selectedMode)
      })
    },
  },
  methods: {
    findLeader(leaderId) {
      return this.$store.getters["all_leaders"].find(
        item => item.card.id === leaderId
      )
    },
  },
}
</script>

<style scoped>
.leaderboard__table-wrap {
  overflow-y: auto;
  max-height: calc(
    100vh - 200px
  ); /* 200px — примерная высота шапки + кнопки + отступы */
}

.leaderboard__table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard__table-body {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
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

.leaderboard__card-wrap {
  width: 60px;
  margin: 0 auto;
}
</style>
