<template>
  <div class="reward-comp" @click="clear_reward">
    <div class="reward-image__container">
      <img
        class="reward-image__image"
        :src="require(`@/assets/icons/resources/${name}_open.svg`)"
        alt=""
      />
    </div>

    <div class="reward-text">
      <span>{{ get_message(name) }}</span>
    </div>

    <div class="reward-content">
      <!-- Если не ключ, то отображается этот компонент -->
      <card-list-component
        class="reward-card-list"
        v-if="!show_key_content"
        :cards="reward"
        :deckbuilder="true"
        :bonus="true"
        hp_needed
        @chose_player_card="accept_reward"
      />
      <!-- Иначе. для ключа отображается этот компонент -->
      <div v-if="show_key_content" class="reward-resources">
        <div
          class="reward-resources__wrapper"
          @dblclick="accept_random_reward(resource)"
          v-for="(resource, index) in key_reward"
          :key="index"
        >
          <img
            :src="require(`@/assets/icons/resources/${resource.resource}.svg`)"
            alt=""
            class="reward-resources__item"
          />
          <span class="resource-count">{{ resources[resource.resource] }}</span>
          <resource-count-rombus>
            {{ resource.value }}
          </resource-count-rombus>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from "vue"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import ResourceCountRombus from "@/components/UI/ResourceCountRombus.vue"
import type { CardEntry, KeyRewardResult } from "@/types"

export default defineComponent({
  components: { CardListComponent, ResourceCountRombus },
  name: "reward-comp",
  props: {
    name: { type: String, required: true },
    reward: { type: Array as PropType<CardEntry[]>, required: false },
    key_reward: {
      type: Array as PropType<KeyRewardResult[]>,
      required: false,
      default: null,
    },
  },
  created() {
    this.accept_chest_reward()
  },
  data() {
    return {
      show_key_content: !!this.key_reward, //Если не передается награда за ключ, значит это либо бочки, либо сундук
      isLoading: false,
    }
  },
  computed: {
    resources(): Record<string, number> {
      return this.$store.getters["resource"]
    },
    res(): Record<string, number> {
      const RESOURCE_ORDER: Record<string, number> = {
        scraps: 0,
        raw_bronze: 1,
        bronze_ingots: 1,
        raw_silver: 2,
        silver_ingots: 2,
        raw_gold: 3,
        gold_ingots: 3,
        crops: 4,
        wood: 5,
        silk: 6,
        money: Infinity,
      }
      const sorted = [...(this.key_reward || [])].sort(
        (a, b) =>
          (RESOURCE_ORDER[a.resource] ?? 99) -
          (RESOURCE_ORDER[b.resource] ?? 99)
      )
      return Object.fromEntries(
        sorted.map(item => [item.resource, this.resources[item.resource] || 0])
      )
    },
  },
  methods: {
    get_message(name: string): string {
      if (name === "kegs" || name === "big_kegs") return "Выбрать можно 1 карту"
      if (name === "chests") return "Все карты ваши"
      return "Выбрать можно 1 награду"
    },
    //Функция принятия наград с картами
    async accept_reward(card: CardEntry): Promise<void> {
      // Если мы открыли сундук, то в маунтеде мы уже сделали запросы на 3 карты.
      // Если же мы ещё ткнули на карту, то приходим сюда и просто закрываем окно
      if (this.isLoading) return
      this.isLoading = true
      await this.$store.dispatch("processCraftBonusCard", [card.card.id])
      this.$emit("clear_reward")
      this.isLoading = false
    },
    async accept_random_reward(res: KeyRewardResult): Promise<void> {
      this.$emit("accept_key_reward", res)
    },
    async accept_chest_reward(): Promise<void> {
      if (this.name !== "chests") return
      const cardIds = (this.reward || []).map(elem => elem.card.id)
      await this.$store.dispatch("processCraftBonusCard", cardIds)
      setTimeout(() => this.$emit("clear_reward"), 10000)
    },
    clear_reward(): void {
      if (this.name === "chests") this.$emit("clear_reward")
    },
  },
  emits: ["clear_reward", "accept_key_reward"],
})
</script>
<style scoped>
.reward-comp {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  gap: 20px;
}

.reward-text span {
  font-family: "Philosopher", serif;
  font-style: normal;
  font-weight: 700;
  font-size: 26px;
  line-height: 100%;
  color: hsl(44, 94%, 67%);
}

.reward-content {
  width: 100%;
}

.reward-content .reward-card-list {
  padding: 8px 0;
  display: grid;
  row-gap: 10px;
  justify-content: center;
  grid-template-columns: repeat(3, 25%);
  column-gap: 25px;
}

.reward-resources__wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.resource-count {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: #ffd700;
  text-align: center;
  margin-top: 2px;
}

.reward-resources {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
  margin-top: 10%;
}

.reward-resources__item {
  width: 100px;
  height: 80px;
  object-fit: contain;
}
</style>
