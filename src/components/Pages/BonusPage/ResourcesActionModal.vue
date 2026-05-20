<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-window">
      <div class="modal-header">
        <span class="action-label">{{ actionLabel }}</span>
        <resource-item
          :name="resource_name"
          :count="resources[resource_name]"
        />
      </div>

      <resource-list :resources="res" />

      <!-- Количество -->
      <div class="qty-row">
        <button
          class="qty-btn"
          @mousedown="startHold(decrease)"
          @mouseup="stopHold"
          @mouseleave="stopHold"
          @touchstart.prevent="startHold(decrease)"
          @touchend="stopHold"
        >
          −
        </button>
        <span
          class="qty-val"
          :class="{
            insufficient:
              selected !== null && !is_affordable(options[selected]),
          }"
          >{{ quantity * step }}
        </span>
        <button
          class="qty-btn"
          @mousedown="startHold(increase)"
          @mouseup="stopHold"
          @mouseleave="stopHold"
          @touchstart.prevent="startHold(increase)"
          @touchend="stopHold"
        >
          +
        </button>
      </div>
      <!-- Варианты -->
      <div class="options-label">{{ optionsLabel }}:</div>
      <div class="options-grid">
        <div
          v-for="(recipe, idx) in options"
          :key="idx"
          class="option-card"
          :class="{ 'option-card--active': selected === idx }"
          @click="selected = idx"
        >
          <template v-if="action === 'mill'">
            <div class="mill-label">Получить:</div>
            <template
              v-for="(amount, resource_key) in recipe"
              :key="'g-' + resource_key"
            >
              <div v-if="amount > 0" class="recipe-row">
                <img :src="getIcon(resource_key)" class="option-icon" alt="" />
                <span class="option-total">{{ amount * quantity }}</span>
              </div>
            </template>

            <div class="mill-label">Заплатить:</div>
            <template
              v-for="(amount, resource_key) in recipe"
              :key="'p-' + resource_key"
            >
              <div v-if="amount < 0" class="recipe-row">
                <img :src="getIcon(resource_key)" class="option-icon" alt="" />
                <span
                  class="option-total"
                  :class="{ insufficient: is_short(recipe, resource_key) }"
                >
                  {{ Math.abs(amount) * quantity }}
                </span>
              </div>
            </template>
          </template>

          <template v-else>
            <div
              v-for="[resource_key, amount] in sortedRecipe(recipe)"
              :key="resource_key"
              class="recipe-row"
            >
              <img :src="getIcon(resource_key)" class="option-icon" alt="" />
              <span
                class="option-total"
                :class="{ insufficient: is_short(recipe, resource_key) }"
              >
                {{ Math.abs(amount) * quantity }}
              </span>
            </div>
          </template>
        </div>
      </div>
      <div class="modal-btns">
        <button
          class="btn-ok"
          :disabled="selected === null || !is_affordable(options[selected])"
          @click="confirm"
        >
          Подтвердить
        </button>
        <button class="btn-no" @click="$emit('cancel')">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import ResourceList from "@/components/ResourceList.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { Recipe } from "@/types"

const ACTION_LABELS: Record<string, string> = {
  buy: "Купить",
  sell: "Продать",
  craft: "Создать",
  mill: "Переработать",
}

export default defineComponent({
  name: "ResourceActionModal",
  components: { ResourceItem, ResourceList },
  props: {
    resource_name: { type: String, required: true },
    action: {
      type: String as PropType<"buy" | "sell" | "craft" | "mill">,
      required: true,
    },
    options: { type: Array as PropType<Recipe[]>, required: true },
    step: { type: Number, default: 1 },
  },
  emits: ["confirm", "cancel"],
  data() {
    return {
      selected: 0,
      quantity: 1,
    }
  },
  computed: {
    actionLabel(): string {
      return ACTION_LABELS[this.action] ?? this.action
    },
    isSpending(): boolean {
      return this.action === "sell" || this.action === "mill"
    },
    optionsLabel(): string {
      return this.isSpending ? "Получить" : "Заплатить"
    },
    resources(): Record<string, number> {
      return this.$store.getters["resource"]
    },
    maxResourcesValue(): Record<string, number> {
      return this.$store.getters["maxResourcesValue"]
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
      const keys = [
        ...new Set(Object.values(this.options).flatMap(Object.keys)),
      ]
      const sorted = keys.sort(
        (a, b) => (RESOURCE_ORDER[a] ?? 99) - (RESOURCE_ORDER[b] ?? 99)
      )
      return Object.fromEntries(
        sorted.map(key => [key, this.resources[key] || 0])
      )
    },
  },
  methods: {
    increase(): void {
      if (this.action === "buy" || this.action === "craft") {
        const max = this.maxResourcesValue[this.resource_name]
        if (max !== undefined) {
          const current = this.resources[this.resource_name] || 0
          const maxQuantity = Math.floor((max - current) / this.step)
          if (this.quantity >= maxQuantity) return
        }
      }
      if (
        (this.action === "sell" || this.action === "mill") &&
        this.selected !== null
      ) {
        const recipe = this.options[this.selected]
        const wouldExceed = Object.entries(recipe).some(([res, amount]) => {
          if (amount <= 0) return false
          const max = this.maxResourcesValue[res]
          return (
            max !== undefined &&
            (this.resources[res] || 0) + amount * (this.quantity + 1) > max
          )
        })
        if (wouldExceed) return
      }
      this.quantity++
    },
    decrease(): void {
      if (this.quantity > 1) this.quantity--
    },
    startHold(fn: () => void): void {
      fn() // сразу одно срабатывание по нажатию
      ;(this as any)._holdTimer = setTimeout(() => {
        ;(this as any)._holdInterval = setInterval(fn, 80) // потом быстро
      }, 400) // задержка перед началом автоповтора
    },
    stopHold(): void {
      clearTimeout((this as any)._holdTimer)
      clearInterval((this as any)._holdInterval)
    },
    getIcon(name: string): string {
      try {
        return require(`@/assets/icons/resources/${name}.svg`)
      } catch {
        return ""
      }
    },
    confirm(): void {
      if (this.selected === null) return
      this.$emit("confirm", {
        recipe: this.options[this.selected],
        quantity: this.quantity,
        step: this.step,
      })
    },
    is_affordable(recipe: Recipe): boolean {
      if (this.action === "buy" || this.action === "craft") {
        const canAffordCost = Object.entries(recipe).every(
          ([res, amount]) =>
            (this.resources[res] || 0) >= Math.abs(amount) * this.quantity
        )
        const max = this.maxResourcesValue[this.resource_name]
        const wouldExceedCap =
          max !== undefined &&
          (this.resources[this.resource_name] || 0) +
            this.quantity * this.step >
            max
        return canAffordCost && !wouldExceedCap
      } else if (this.action === "sell") {
        const canSell =
          (this.resources[this.resource_name] || 0) >= this.quantity * this.step
        const noCapExceeded = Object.entries(recipe).every(([res, amount]) => {
          if (amount <= 0) return true
          const max = this.maxResourcesValue[res]
          return (
            max === undefined ||
            (this.resources[res] || 0) + amount * this.quantity <= max
          )
        })
        return canSell && noCapExceeded
      } else {
        // mill: хватает ли самого ресурса + хватает ли отрицательных (costs)
        const hasMain =
          (this.resources[this.resource_name] || 0) >= this.quantity * this.step
        const hasCosts = Object.entries(recipe)
          .filter(([, amt]) => amt < 0)
          .every(
            ([res, amt]) =>
              (this.resources[res] || 0) >= Math.abs(amt) * this.quantity
          )
        const noCapExceeded = Object.entries(recipe).every(([res, amount]) => {
          if (amount <= 0) return true
          const max = this.maxResourcesValue[res]
          return (
            max === undefined ||
            (this.resources[res] || 0) + amount * this.quantity <= max
          )
        })
        return hasMain && hasCosts && noCapExceeded
      }
    },
    is_short(recipe: Recipe, res: string): boolean {
      if (this.action === "buy" || this.action === "craft") {
        return (
          (this.resources[res] || 0) < Math.abs(recipe[res]) * this.quantity
        )
      }
      if (this.action === "mill" && recipe[res] < 0) {
        return (
          (this.resources[res] || 0) < Math.abs(recipe[res]) * this.quantity
        )
      }
      return false
    },
    sortedRecipe(recipe: Recipe): [string, number][] {
      const order: Record<string, number> = {
        crops: 0,
        wood: 1,
        money: Infinity,
      }
      return Object.entries(recipe).sort(([a], [b]) => {
        const aOrder = order[a] ?? 2
        const bOrder = order[b] ?? 2
        return aOrder - bOrder
      })
    },
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-window {
  background: #1a1208;
  border: 2px solid #8b6914;
  border-radius: 12px;
  padding: 20px 16px;
  max-width: 96vw;
  color: white;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.action-label {
  font-family: "Philosopher", serif;
  font-size: 1.5rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-icon {
  width: 32px;
  height: 32px;
}

.qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 16px;
  margin-top: 16px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #8b6914;
  background: #2a1e08;
  color: #ffd700;
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
  font-family: "Philosopher", serif;
}

.qty-val {
  font-family: "Philosopher", serif;
  font-size: 1.8rem;
  color: #ffd700;
  min-width: 30px;
  text-align: center;
}

.options-label {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
  margin-bottom: 8px;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border: 2px solid #444;
  border-radius: 8px;
  cursor: pointer;
  width: 100px;
  flex-shrink: 0;
  background: #2a1e08;
  transition: border-color 0.15s;
}

.option-card--active {
  border-color: #ffd700;
  background: #3a2e18;
}

.option-icon {
  width: 30px;
  height: 30px;
}

.option-total {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: #ffd700;
  margin-top: 4px;
  min-width: 45px;
  text-align: center;
}

.recipe-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.mill-label {
  font-family: "Philosopher", serif;
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 6px;
  margin-bottom: 2px;
}

.btn-ok,
.btn-no {
  padding: 8px 22px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: "Philosopher", serif;
  font-size: 1rem;
}

.btn-ok {
  background: var(--primary-gold-gradient, #ffd700);
  color: #1a1208;
  font-weight: bold;
}

.insufficient {
  color: #f44336 !important;
  -webkit-text-fill-color: #f44336 !important;
}

.btn-ok:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-no {
  background: #333;
  color: #aaa;
}
</style>
