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

export default {
  components: { BonusPageResource, RewardComp },
  data() {
    return {
      show_reward_page: false,
      reward_name: "",
      random_cards: [],
      random_reward_choice: null,
      subtype: PayResourcesSubtype.bonusReward,
    }
  },
  computed: {
    resource() {
      return this.$store.getters["resource"]
    },
    resources_config() {
      // Подставь свой геттер из стора
      // Структура: { wood: { buy: { money: 1000, scraps: 10000 }, sell: {...}, ... }, ... }
      // return this.$store.getters['resources_config']
      return {
        scraps: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          step: 100,
        },
        bronze_ingots: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          craft: [{ raw_bronze: 50, money: 1000 }],
          mill: [{ raw_bronze: 25, money: -1000 }],
          step: 1,
        },
        silver_ingots: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          craft: [{ raw_silver: 50, money: 1000 }],
          mill: [{ raw_silver: 25, money: -1000 }],
          step: 1,
        },
        gold_ingots: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          craft: [{ raw_gold: 50, money: 1000 }],
          mill: [{ raw_gold: 1, money: -1000 }],
          step: 1,
        },
        crops: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          step: 100,
        },
        wood: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          step: 100,
        },
        kegs: {
          buy: [{ money: 10000 }],
          sell: [{ money: 1000 }],
          craft: [
            { wood: 100, crops: 100, money: 1000 },
            { bronze_ingots: 10, crops: 100, money: 1000 },
            { raw_bronze: 60, crops: 100, money: 1000 },
          ],
          mill: [{ big_kegs: 1, money: -1000 }],
          step: 1,
        },
        big_kegs: {
          buy: [{ money: 20000 }],
          sell: [{ money: 2000 }],
          craft: [
            { wood: 200, crops: 200, money: 2000 },
            { silver_ingots: 10, crops: 200, money: 2000 },
            { raw_silver: 160, crops: 200, money: 2000 },
          ],
          step: 1,
          // mill: [{ big_kegs: 1 }],
        },
      }
    },
  },
  methods: {
    async pay_resource(data) {
      await this.$store.dispatch("processResources", {
        subtype: this.subtype,
        data,
      })
    },

    async handleAction({ resource_name, action, recipe, quantity, step }) {
      const actual = quantity * step // сколько реально получаем/тратим единиц ресурса
      let payload = {}
      if (action === "buy" || action === "craft") {
        for (const [res, amount] of Object.entries(recipe)) {
          payload[res] = -(amount * quantity) // цена уже за 1 шаг
        }
        payload[resource_name] = actual
      } else {
        payload[resource_name] = -actual
        for (const [res, amount] of Object.entries(recipe)) {
          payload[res] = amount * quantity
        }
      }
      console.log(139, resource_name, action, quantity, recipe)
      // await this.pay_resource(payload)
    },

    clear_reward() {
      this.random_cards = []
      this.random_reward_choice = null
      this.show_reward_page = false
    },

    async accept_random_reward(res) {
      const { resource, value } = res
      await this.pay_resource({ [resource]: value })
      this.clear_reward()
    },
  },
}
</script>

<style scoped>
.bonus-page {
  width: 98%;
  margin: 1%;
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
