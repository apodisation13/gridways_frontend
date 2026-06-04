<template>
  <div class="leaderboard__table-wrap">
    <table class="leaderboard__table">
      <thead>
        <tr>
          <th>#</th>
          <th v-if="is_world">Игрок</th>
          <th v-if="!is_world">Фракция</th>
          <th>Лидер</th>
          <th>Режим</th>
          <th>Рекорд</th>
        </tr>
      </thead>
      <tbody class="leaderboard__table-body">
        <tr
          v-for="(entry, index) in filteredLeaderboard"
          :key="entry.leader_id + entry.mode"
          :class="{
            'leaderboard__row--mine': is_world && entry.username === username,
          }"
        >
          <td>{{ index + 1 }}</td>
          <td v-if="is_world">
            <div class="leaderboard__user" @click="goToStats(entry)">
              <img
                v-if="entry.user_avatar"
                :src="
                  entry.user_avatar.includes('/')
                    ? require(`@/assets/${entry.user_avatar}.svg`)
                    : require(
                        `@/assets/icons/resources/${entry.user_avatar}.svg`
                      )
                "
                alt=""
                class="avatar"
              />
              <div v-else class="avatar avatar--placeholder" />
              <span>{{ entry.username }}</span>
            </div>
          </td>
          <td v-if="!is_world">
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

<script lang="ts">
import { defineComponent, PropType } from "vue"

import CardItem from "@/components/Cards/CardItem.vue"
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import type { LeaderboardEntry } from "@/types"

export default defineComponent({
  name: "LeaderboardTable",
  components: { FactionItem, CardItem },
  props: {
    is_world: {
      type: Boolean,
      default: false,
    },
    selectedFaction: {
      type: [String, null] as unknown as PropType<string | null>,
      default: null,
    },
    selectedMode: {
      type: [String, null] as unknown as PropType<string | null>,
      default: null,
    },
  },
  computed: {
    username(): string {
      return this.$store.state.login.user.username
    },
    userLeaderboard(): LeaderboardEntry[] {
      return this.$store.getters["userLeaderboard"]
    },
    worldLeaderboard(): LeaderboardEntry[] {
      return this.$store.getters["worldLeaderboard"]
    },
    userLeaderboardData(): LeaderboardEntry[] {
      return this.is_world ? this.worldLeaderboard : this.userLeaderboard
    },
    filteredLeaderboard(): LeaderboardEntry[] {
      return this.userLeaderboardData.filter(e => {
        if (this.selectedFaction && e.faction_name !== this.selectedFaction)
          return false
        return !(this.selectedMode && e.mode !== this.selectedMode)
      })
    },
  },
  async created() {
    if (this.is_world) await this.$store.dispatch("getWorldLeaderboard")
    else await this.$store.dispatch("getUserLeaderboard")
  },
  methods: {
    findLeader(leaderId: number) {
      return this.$store.getters["all_leaders"].find(
        (item: any) => item.card.id === leaderId
      )
    },
    goToStats(entry: LeaderboardEntry) {
      this.$router.push({
        path: "/stats",
        query: {
          userId: String(entry.user_id),
          username: entry.username,
          userProfileAvatar: entry.user_avatar,
        },
      })
    },
  },
})
</script>

<style scoped>
.leaderboard__table-wrap {
  overflow-y: auto;
  max-height: calc(
    100vh - 400px
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

.leaderboard__row--mine {
  background-color: rgba(255, 215, 0, 0.15); /* или любой цвет */
}

.leaderboard__user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
}

.avatar--placeholder {
  background: #444;
  border-radius: 50%;
}
</style>
