<template>
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
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ThemedButton from "@/components/UI/Buttons/ThemedButton.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import { getRewardForLevel } from "@/logic/random_rewards"

export default defineComponent({
  name: "ArenaWinPage",
  components: { ResourceItem, ThemedButton },
  data() {
    return {
      pay_data: {} as Record<string, number>,
    }
  },
  created() {
    if (!this.$store.state.user_actions.win_redirect) return
    this.$store.commit("set_win_redirect", false)
    this.$store.commit("arena_advance_level")
    this.compute_rewards()
  },
  methods: {
    compute_rewards(): void {
      const difficulty = this.$store.state.game.level?.difficulty ?? "easy"
      const win_level_rewards = this.$store.getters["win_level_rewards"]
      this.pay_data = getRewardForLevel(win_level_rewards[difficulty])
    },
    go_forward(): void {
      this.$router.push("/arena/deckbuild")
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
