<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-window">
      <!-- Заголовок -->
      <div class="modal-header">
        <span class="action-icon">{{ action === "craft" ? "⚒" : "✕" }}</span>
        <span class="action-label">{{
          action === "craft" ? "Создать карту" : "Уничтожить карту"
        }}</span>
      </div>

      <resource-list :resources="res" />

      <!-- Варианты рецептов -->
      <div class="options-grid">
        <div
          v-for="(recipe, idx) in options"
          :key="idx"
          class="option-card"
          :class="{
            'option-card--active': selected === idx,
            'option-card--unaffordable': !is_affordable(recipe),
          }"
          @click="selected = idx"
        >
          <!-- Mill: разделяем получить/заплатить -->
          <template v-if="action === 'mill'">
            <div class="mill-label">Получить:</div>
            <template
              v-for="[resource_key, amount] in sortedRecipe(recipe)"
              :key="'g-' + resource_key"
            >
              <div v-if="amount > 0" class="recipe-row">
                <img :src="getIcon(resource_key)" class="option-icon" alt="" />
                <span class="option-total">{{ amount }}</span>
              </div>
            </template>

            <div class="mill-label">Заплатить:</div>
            <template
              v-for="[resource_key, amount] in sortedRecipe(recipe)"
              :key="'p-' + resource_key"
            >
              <div v-if="amount < 0" class="recipe-row">
                <img :src="getIcon(resource_key)" class="option-icon" alt="" />
                <span
                  class="option-total"
                  :class="{ insufficient: is_short(recipe, resource_key) }"
                >
                  {{ Math.abs(amount) }}
                </span>
              </div>
            </template>
          </template>
          <!-- Craft: всё это затраты -->
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
                {{ Math.abs(amount) }}
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
import { type Card, CardColor, type Leader, type UserResources } from "@/types"

type Recipe = Record<string, number>

export default defineComponent({
  name: "CardActionModal",
  components: { ResourceList },
  props: {
    action: { type: String as PropType<"craft" | "mill">, required: true },
    options: { type: Array as PropType<Recipe[]>, required: true },
    card: { type: Object as PropType<Card | Leader>, required: true },
  },
  emits: ["confirm", "cancel"],
  data() {
    return {
      selected: 0,
      RESOURCE_ORDER: {
        scraps: 0,
        raw_bronze: 1,
        bronze_ingots: 1,
        raw_silver: 2,
        silver_ingots: 2,
        raw_gold: 3,
        gold_ingots: 3,
        money: Infinity,
      } as Record<string, number>,
    }
  },
  computed: {
    resources(): UserResources {
      return this.$store.getters["resource"]
    },
    res(): Record<string, number> {
      const r = this.resources as Record<string, number>
      if ((this.card as any).color === CardColor.Bronze) {
        return {
          scraps: r.scraps,
          raw_bronze: r.raw_bronze,
          bronze_ingots: r.bronze_ingots,
          rare_gem: r.rare_gem,
          money: r.money,
        }
      } else if ((this.card as any).color === CardColor.Silver) {
        return {
          scraps: r.scraps,
          raw_silver: r.raw_silver,
          silver_ingots: r.silver_ingots,
          rare_gem: r.rare_gem,
          money: r.money,
        }
      } else if ((this.card as any).color === CardColor.Gold) {
        return {
          scraps: r.scraps,
          raw_gold: r.raw_gold,
          gold_ingots: r.gold_ingots,
          rare_gem: r.rare_gem,
          money: r.money,
        }
      }
      // лидер — показываем ресурсы из рецепта
      const keys = Object.keys(this.options[this.selected])
      const sorted = keys.sort(
        (a, b) =>
          (this.RESOURCE_ORDER[a] ?? 99) - (this.RESOURCE_ORDER[b] ?? 99)
      )
      return Object.fromEntries(sorted.map(key => [key, r[key] || 0]))
    },
  },
  methods: {
    getIcon(name: string): string {
      try {
        return require(`@/assets/icons/resources/${name}.svg`)
      } catch {
        return ""
      }
    },
    sortedRecipe(recipe: Recipe): [string, number][] {
      return Object.entries(recipe).sort(
        ([a], [b]) =>
          (this.RESOURCE_ORDER[a] ?? 2) - (this.RESOURCE_ORDER[b] ?? 2)
      )
    },
    is_affordable(recipe: Recipe): boolean {
      const r = this.resources as Record<string, number>
      if (this.action === "craft") {
        return Object.entries(recipe).every(
          ([res, amt]) => (r[res] || 0) >= Math.abs(amt)
        )
      }
      return Object.entries(recipe)
        .filter(([, amt]) => amt < 0)
        .every(([res, amt]) => (r[res] || 0) >= Math.abs(amt))
    },
    is_short(recipe: Recipe, res: string): boolean {
      const r = this.resources as Record<string, number>
      if (this.action === "craft") {
        return (r[res] || 0) < Math.abs(recipe[res])
      }
      if (this.action === "mill" && recipe[res] < 0) {
        return (r[res] || 0) < Math.abs(recipe[res])
      }
      return false
    },
    confirm(): void {
      if (this.selected === null) return
      this.$emit("confirm", this.options[this.selected])
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
  width: 300px;
  max-width: 92vw;
  color: white;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.action-icon {
  font-size: 1.4rem;
}
.action-label {
  font-family: "Philosopher", serif;
  font-size: 1.3rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.insufficient {
  color: #f44336 !important;
  -webkit-text-fill-color: #f44336 !important;
}
.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
  margin-top: 14px;
}
.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid #444;
  border-radius: 8px;
  cursor: pointer;
  width: 90px;
  background: #2a1e08;
  transition: border-color 0.15s;
}
.option-card--active {
  border-color: #ffd700;
  background: #3a2e18;
}
.option-card--unaffordable {
  opacity: 0.55;
}
.recipe-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.option-icon {
  width: 22px;
  height: 22px;
}
.option-total {
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: #ffd700;
}
.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
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
.btn-ok:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-no {
  background: #333;
  color: #aaa;
}
.mill-label {
  font-family: "Philosopher", serif;
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 6px;
  margin-bottom: 2px;
}
</style>
