<template>
  <div class="leaderboard__table-wrap">
    <table class="leaderboard__table">
      <colgroup>
        <col class="leaderboard__col-rank" />
        <col class="leaderboard__col-identity" />
        <col class="leaderboard__col-leader" />
        <col class="leaderboard__col-mode" />
        <col class="leaderboard__col-kills" />
        <col class="leaderboard__col-arena" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">№</th>
          <th v-if="is_world" scope="col">Игрок</th>
          <th v-if="!is_world" scope="col">Фракция</th>
          <th scope="col">Лидер</th>
          <th scope="col">Режим</th>
          <th scope="col" title="Убито врагов" aria-label="Убито врагов">
            <span class="leaderboard__skull" aria-hidden="true">☠</span>
          </th>
          <th scope="col" aria-label="Уровень Арены">
            Арена<br /><span class="leaderboard__subheading">ур.</span>
          </th>
        </tr>
      </thead>
      <tbody class="leaderboard__table-body">
        <tr
          v-for="(entry, index) in filteredLeaderboard"
          :key="`${entry.user_id}:${entry.leader_id}:${entry.mode}`"
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
              <span class="leaderboard__username">{{ entry.username }}</span>
            </div>
          </td>
          <td v-if="!is_world" class="leaderboard__faction">
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
          <td class="leaderboard__mode">{{ modeLabel(entry.mode) }}</td>
          <td class="leaderboard__number">{{ entry.max_kills }}</td>
          <td
            class="leaderboard__number"
            :class="{ leaderboard__muted: entry.mode !== 'arena' }"
          >
            {{ entry.mode === "arena" ? (entry.max_arena_level ?? "—") : "—" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

import CardItem from "@/components/Cards/CardItem.vue"
import FactionItem from "@/components/Pages/DeckbuildPage/FactionItem.vue"
import type { LeaderboardEntry, LeaderboardGameMode } from "@/types"

const MODE_LABELS: Record<LeaderboardGameMode, string> = {
  season: "Сезон",
  random: "Рандом",
  random_n: "Рандом N",
  arena: "Арена",
  multiplayer: "Кооп",
}

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
    modeLabel(mode: LeaderboardGameMode): string {
      return MODE_LABELS[mode] ?? mode
    },
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
  width: 100%;
  min-width: 0;
  overflow: auto;
  max-height: calc(100vh - 400px);
  border-radius: 10px;
  border: 1px solid rgba(250, 207, 93, 0.14);
  box-sizing: border-box;
}

.leaderboard__table {
  width: 100%;
  min-width: 320px;
  border-collapse: collapse;
  table-layout: fixed;
  color: rgba(255, 255, 255, 0.9);
}

.leaderboard__col-rank {
  width: 32px;
}
.leaderboard__col-leader {
  width: 76px;
}
.leaderboard__col-mode {
  width: 82px;
}
.leaderboard__col-kills {
  width: 48px;
}
.leaderboard__col-arena {
  width: 56px;
}

.leaderboard__table th,
.leaderboard__table td {
  padding: 10px 5px;
  text-align: center;
  vertical-align: middle;
}

.leaderboard__table th {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #facf5d;
  background: rgba(20, 25, 35, 0.92);
  border-bottom: 1px solid rgba(250, 207, 93, 0.28);
}

.leaderboard__subheading {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.7;
}

.leaderboard__skull {
  font-size: 23px;
  line-height: 1;
}

.leaderboard__table tbody tr {
  border-bottom: 1px solid rgba(250, 207, 93, 0.1);
  transition: background 0.15s;
}

.leaderboard__table tbody tr:last-child {
  border-bottom: none;
}
.leaderboard__table tbody tr:hover {
  background: rgba(250, 207, 93, 0.05);
}
.leaderboard__row--mine {
  background: rgba(255, 215, 0, 0.09);
}

.leaderboard__table td:first-child {
  color: rgba(250, 207, 93, 0.55);
  font-size: 12px;
}

.leaderboard__number {
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.leaderboard__muted {
  color: rgba(255, 255, 255, 0.3);
}
.leaderboard__mode {
  font-size: 12px;
  white-space: nowrap;
}

.leaderboard__card-wrap {
  width: 60px;
  max-width: 100%;
  margin: 0 auto;
}

.leaderboard__faction :deep(.faction) {
  margin: 0 auto;
  max-width: 100%;
}

.leaderboard__user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.leaderboard__username {
  max-width: 100%;
  font-size: 12px;
  overflow-wrap: break-word;
}

.avatar {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.avatar--placeholder {
  background: #444;
  border-radius: 50%;
}

@media (max-width: 480px) {
  .leaderboard__col-rank {
    width: 26px;
  }
  .leaderboard__col-leader {
    width: 62px;
  }
  .leaderboard__col-mode {
    width: 64px;
  }
  .leaderboard__col-kills {
    width: 38px;
  }
  .leaderboard__col-arena {
    width: 48px;
  }

  .leaderboard__table th,
  .leaderboard__table td {
    padding: 8px 3px;
  }
  .leaderboard__table th {
    font-size: 11px;
  }
  .leaderboard__mode {
    font-size: 11px;
  }
  .leaderboard__card-wrap {
    width: 54px;
  }
}

.leaderboard__table-wrap {
  container: leaderboard-table / inline-size;
}

@container leaderboard-table (min-width: 600px) {
  .leaderboard__col-rank {
    width: 7%;
  }
  .leaderboard__col-identity {
    width: 25%;
  }
  .leaderboard__col-leader {
    width: 19%;
  }
  .leaderboard__col-mode {
    width: 21%;
  }
  .leaderboard__col-kills {
    width: 13%;
  }
  .leaderboard__col-arena {
    width: 15%;
  }
}
</style>
