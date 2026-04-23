<template>
  <div>
    <div class="bonus-page" v-if="!show_reward_page">
      <div class="title">
        <h1>Страница бонусов</h1>
      </div>
      <!-- Переключатель вкладок -->
      <div class="tabs">
        <div class="tabs__slider" :style="sliderStyle"></div>
        <button
          v-for="(tab, idx) in tabs"
          :key="idx"
          class="tabs__btn"
          :class="{ 'tabs__btn--active': active_tab === idx }"
          @click="active_tab = idx"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="resources-grid">
        <bonus-page-resource
          v-for="(config, name) in filtered_resources"
          :key="name"
          :resource_name="name"
          :resource_count="resource[name] || 0"
          :actions="config"
          :step="config.step"
          @action="handleAction"
          @open-resource-confirm="openResource"
        />
      </div>
    </div>
    <reward-comp
      v-else
      :visible="show_reward_page"
      :name="reward_name"
      :reward="random_cards"
      :key_reward="random_reward_choice"
      @clear_reward="clear_reward"
      @accept_key_reward="accept_random_reward"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BonusPageResource from "@/components/Pages/BonusPage/BonusPageResource.vue"
import RewardComp from "@/components/Pages/BonusPage/RewardComp.vue"
import { PayResourcesSubtype } from "@/types"
import type { CardEntry, KeyRewardResult, ResourceActions } from "@/types"
import { choice } from "@/lib/utils"
import { getRandomReward } from "@/logic/random_rewards"

export default defineComponent({
  components: { BonusPageResource, RewardComp },
  created() {
    this.init()
  },
  watch: {
    cards() {
      this.init()
    },
  },
  data() {
    return {
      pool: [] as CardEntry[],
      show_reward_page: false,
      reward_name: "",
      random_cards: [] as CardEntry[],
      random_reward_choice: null as KeyRewardResult[] | null,
      active_tab: 0,
      tabs: [
        { label: "Награды", keys: ["kegs", "big_kegs", "chests", "keys"] },
        {
          label: "Для карт",
          keys: ["scraps", "bronze_ingots", "silver_ingots", "gold_ingots"],
        },
        { label: "Для уровней", keys: ["crops", "wood", "silk"] },
      ] as { label: string; keys: string[] }[],
      keg_len: 0,
    }
  },
  computed: {
    cards(): CardEntry[] {
      return this.$store.getters["all_cards"]
    },
    resource(): Record<string, number> {
      return this.$store.getters["resource"]
    },
    filtered_resources(): Record<string, ResourceActions> {
      const keys = this.tabs[this.active_tab].keys
      return Object.fromEntries(
        Object.entries(this.resources_config).filter(([name]) =>
          keys.includes(name)
        )
      )
    },
    sliderStyle(): Record<string, string> {
      return {
        transform: `translateX(${this.active_tab * 100}%)`,
        width: `${100 / this.tabs.length}%`,
      }
    },
    resources_config(): Record<string, ResourceActions> {
      const transitions = this.$store.getters["resources_transitions"]

      return Object.keys(transitions)
        .sort((a, b) => transitions[a].index - transitions[b].index)
        .reduce(
          (acc: Record<string, ResourceActions>, key: string) => {
            acc[key] = transitions[key]
            return acc
          },
          {} as Record<string, ResourceActions>
        )
    },
  },
  methods: {
    init(): void {
      this.pool = []
      this.cards.forEach((card: CardEntry) => {
        if (card.card.color === "Bronze") {
          for (let i = 0; i < 30; i++) {
            this.pool.push(card)
          }
        } else if (card.card.color === "Silver") {
          this.pool.push(card)
          this.pool.push(card)
        } else if (card.card.color === "Gold") {
          this.pool.push(card)
        }
      })
    },

    async pay_resource(
      data: Record<string, unknown>,
      subtype: PayResourcesSubtype
    ): Promise<void> {
      await this.$store.dispatch("processResources", {
        subtype: subtype,
        data,
      })
    },

    async handleAction({
      resource_name,
      action,
      recipe,
      quantity,
    }: {
      resource_name: string
      action: string
      recipe: Record<string, number>
      quantity: number
    }): Promise<void> {
      await this.pay_resource(
        {
          resource: resource_name,
          action,
          quantity,
          recipe,
        },
        PayResourcesSubtype.resourceTransition
      )
    },

    async openResource(resource_name: string): Promise<void> {
      console.log(resource_name)
      if (resource_name === "kegs") await this.open_keg()
      else if (resource_name === "big_kegs") await this.open_big_keg()
      else if (resource_name === "chests") await this.open_chest()
      else if (resource_name === "keys") await this.open_key()
    },

    async open_keg(): Promise<void> {
      if (this.resource.kegs <= 0) return
      await this.pay_resource(
        { kegs: -1 },
        PayResourcesSubtype.openBonusResource
      )
      this.keg_len = 3
      this.random_cards = []
      this.reward_name = "kegs"
      for (let i = 0; i < this.keg_len; i++) {
        this.random_cards.push(this.pool[choice(this.pool)])
      }
      this.show_reward_page = true
    },
    async open_big_keg(): Promise<void> {
      if (this.resource.big_kegs <= 0) return
      await this.pay_resource(
        { big_kegs: -1 },
        PayResourcesSubtype.openBonusResource
      )
      this.keg_len = 5
      this.random_cards = []
      this.reward_name = "big_kegs"
      for (let i = 0; i < this.keg_len; i++) {
        this.random_cards.push(this.pool[choice(this.pool)])
      }
      this.show_reward_page = true
    },
    async open_chest(): Promise<void> {
      if (this.resource.chests <= 0) return
      await this.pay_resource(
        { chests: -1 },
        PayResourcesSubtype.openBonusResource
      )
      this.keg_len = 3
      this.random_cards = []
      this.reward_name = "chests"
      for (let i = 0; i < this.keg_len; i++) {
        this.random_cards.push(this.pool[choice(this.pool)])
      }
      this.show_reward_page = true
    },

    async open_key(): Promise<void> {
      await this.pay_resource(
        { keys: -1 },
        PayResourcesSubtype.openBonusResource
      )
      const key_reward: KeyRewardResult[] = []
      for (let i = 0; i < 3; i++) {
        key_reward.push(getRandomReward(this.$store.getters["keys_rewards"]))
      }
      this.reward_name = "keys"
      this.random_reward_choice = key_reward
      this.show_reward_page = true
    },

    async accept_random_reward(res: KeyRewardResult): Promise<void> {
      const { resource, value } = res
      await this.pay_resource(
        { [resource]: value },
        PayResourcesSubtype.acceptKeyReward
      )
      this.clear_reward()
    },

    clear_reward(): void {
      this.random_cards = []
      this.random_reward_choice = null
      this.show_reward_page = false
    },
  },
})
</script>

<style scoped>
.bonus-page {
  width: 98%;
  margin: 1%;
  height: 75vh;
  overflow-y: auto;
}

div {
  font-family: "Brush Script MT", cursive;
  font-size: 14pt;
  color: white;
}

.tabs {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  margin: 0 8px 12px;
  padding: 3px;
}

.tabs__slider {
  position: absolute;
  top: 3px;
  left: 3px;
  height: calc(100% - 6px);
  border-radius: 8px;
  background: var(--primary-gold-gradient, #c49000);
  transition: transform 0.25s ease;
  pointer-events: none;
}

.tabs__btn {
  flex: 1;
  z-index: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;
}

.tabs__btn--active {
  color: #1a1208;
  font-weight: bold;
}

.title {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 16px;
}

.title h1 {
  font-family: "Philosopher", serif;
  font-size: 2rem;
  line-height: 2rem;
  color: hsl(39, 82%, 62%);
}

.resources-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 8px;
}
</style>
