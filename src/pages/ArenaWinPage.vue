<template>
  <div class="win-page">
    <div class="resources-bar">
      <resource-list :resources="arena_resources" highlight_max_count />
    </div>
    <div class="win-section">
      <span class="global_text price-label">ВАШ ВЫИГРЫШ</span>
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

      <button class="btn-forward" @click="go_forward">
        <themed-button title="ВПЕРЕД" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ResourceList from "@/components/ResourceList.vue"
import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { getRewardForLevel } from "@/logic/random_rewards"
import { PayResourcesSubtype } from "@/types"

const ARENA_RESOURCE_KEYS = [
  "scraps",
  "raw_bronze",
  "raw_silver",
  "raw_gold",
  "crops",
  "wood",
  "silk",
  "money",
]

export default defineComponent({
  name: "ArenaWinPage",
  components: { ResourceItem, ResourceList, ThemedButton },
  data() {
    return {
      pay_data: {} as Record<string, number>,
    }
  },
  computed: {
    arena_resources(): Record<string, number> {
      const all = this.$store.getters["resource"]
      return Object.fromEntries(
        ARENA_RESOURCE_KEYS.filter(k => (all[k] ?? 0) > 0).map(k => [k, all[k]])
      )
    },
  },
  created() {
    if (!this.$store.state.user_actions.win_redirect) return
    this.$store.commit("set_win_redirect", false)
    this.$store.commit("arena_advance_level")
    this.compute_rewards()
  },
  methods: {
    async compute_rewards(): Promise<void> {
      const difficulty = this.$store.state.game.level?.difficulty ?? "easy"
      const win_level_rewards = this.$store.getters["win_level_rewards"]
      const base_rewards = getRewardForLevel(win_level_rewards[difficulty])

      const arena_params = this.$store.getters["arena_params"]
      const base_multiply: number = arena_params?.base_reward_multiply ?? 2
      const base_delta: number = arena_params?.base_reward_delta ?? 0.2
      // arena_advance_level already ran, so current_level is the NEXT level
      const completed_level: number =
        (this.$store.getters["arena_current_level"] as number) - 1
      const coefficient = base_multiply + (completed_level - 1) * base_delta

      const MULTIPLY_KEYS = new Set([
        "scraps",
        "raw_bronze",
        "raw_silver",
        "raw_gold",
        "crops",
        "wood",
        "silk",
      ])
      this.pay_data = Object.fromEntries(
        Object.entries(base_rewards).map(([k, v]) => [
          k,
          MULTIPLY_KEYS.has(k) ? Math.ceil(v * coefficient) : v,
        ])
      )

      await this.$store.dispatch("processResources", {
        subtype: PayResourcesSubtype.winArenaLevel,
        data: this.pay_data,
      })
    },
    go_forward(): void {
      this.$router.push("/arena/deckbuild")
    },
  },
})
</script>

<style scoped>
.win-page {
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.resources-bar {
  flex-shrink: 0;
  padding: 8px 12px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.win-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
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

.btn-forward {
  width: 180px;
  height: 54px;
  margin-top: 10px;
}
</style>
