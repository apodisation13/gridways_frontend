<template>
  <div>
    <div class="bonus-page" v-if="!show_reward_page">
      <div class="title">
        <h1>Страница бонусов</h1>
      </div>
      <div class="resources-grid">
        <bonus-page-resource
          v-for="(config, name) in resources_config"
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

<script>
import BonusPageResource from "@/components/UI/BonusPageResource"
import RewardComp from "@/components/Pages/BonusPage/RewardComp.vue"
import { PayResourcesSubtype } from "@/store/const/const"
import { choice } from "@/lib/utils"
import { getRandomReward } from "@/logic/random_rewards"

export default {
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
      pool: [],
      show_reward_page: false,
      reward_name: "",
      random_cards: [],
      random_reward_choice: null,
    }
  },
  computed: {
    cards() {
      return this.$store.getters["all_cards"]
    },
    resource() {
      return this.$store.getters["resource"]
    },
    resources_config() {
      const transitions = this.$store.getters["resources_transitions"]

      return Object.keys(transitions)
        .sort((a, b) => transitions[a].index - transitions[b].index)
        .reduce((acc, key) => {
          acc[key] = transitions[key]
          return acc
        }, {})
    },
  },
  methods: {
    init() {
      this.pool = []
      this.cards.forEach(card => {
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

    async pay_resource(data, subtype) {
      await this.$store.dispatch("processResources", {
        subtype: subtype,
        data,
      })
    },

    async handleAction({ resource_name, action, recipe, quantity }) {
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

    async openResource(resource_name) {
      console.log(resource_name)
      if (resource_name === "kegs") await this.open_keg()
      else if (resource_name === "big_kegs") await this.open_big_keg()
      else if (resource_name === "chests") await this.open_chest()
      else if (resource_name === "keys") await this.open_key()
    },

    async open_keg() {
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
    async open_big_keg() {
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
    async open_chest() {
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

    async open_key() {
      await this.pay_resource(
        { keys: -1 },
        PayResourcesSubtype.openBonusResource
      )
      const key_reward = []
      for (let i = 0; i < 3; i++) {
        key_reward.push(getRandomReward(this.$store.getters["keys_rewards"]))
      }
      this.reward_name = "keys"
      this.random_reward_choice = key_reward
      this.show_reward_page = true
    },

    async accept_random_reward(res) {
      const { resource, value } = res
      await this.pay_resource(
        { [resource]: value },
        PayResourcesSubtype.acceptKeyReward
      )
      this.clear_reward()
    },

    clear_reward() {
      this.random_cards = []
      this.random_reward_choice = null
      this.show_reward_page = false
    },
  },
}
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
