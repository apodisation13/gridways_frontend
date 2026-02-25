<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-window">
      <div class="modal-header">
        <span class="action-label">{{ actionLabel }}</span>
        <img :src="getIcon(resource_name)" class="header-icon" alt="" />
      </div>
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
          <div v-for="(amount, res) in recipe" :key="res" class="recipe-row">
            <img :src="getIcon(res)" class="option-icon" alt="" />
            <span
              class="option-total"
              :class="{ insufficient: is_short(recipe, res) }"
            >
              {{ amount * quantity }}
            </span>
<!--            <span-->
<!--              class="option-name"-->
<!--              :class="{ insufficient: is_short(recipe, res) }"-->
<!--            >-->
<!--              {{ res }}-->
<!--            </span>-->
          </div>
        </div>
      </div>
      <div class="modal-btns">
        <button
          class="btn-ok"
          @click="confirm"
          :disabled="selected === null || !is_affordable(options[selected])"
        >
          Подтвердить
        </button>
        <button class="btn-no" @click="$emit('cancel')">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
const ACTION_LABELS = {
  buy: "Купить",
  sell: "Продать",
  craft: "Создать",
  mill: "Переработать",
}

export default {
  name: "resource-action-modal",
  props: {
    resource_name: { type: String, required: true },
    action: { type: String, required: true },
    options: { type: Array, required: true },
    current_resources: { type: Object, default: () => ({}) },
    step: { type: Number, default: 1 },
  },
  data() {
    return {
      selected: 0,
      quantity: 1,
    }
  },
  computed: {
    actionLabel() {
      return ACTION_LABELS[this.action] ?? this.action
    },
    isSpending() {
      return this.action === "sell" || this.action === "mill"
    },
    optionsLabel() {
      return this.isSpending ? "Получить" : "Заплатить"
    },
  },
  methods: {
    increase() {
      this.quantity++
    },
    decrease() {
      if (this.quantity > 1) this.quantity--
    },
    startHold(fn) {
      fn() // сразу одно срабатывание по нажатию
      this._holdTimer = setTimeout(() => {
        this._holdInterval = setInterval(fn, 80) // потом быстро
      }, 400) // задержка перед началом автоповтора
    },
    stopHold() {
      clearTimeout(this._holdTimer)
      clearInterval(this._holdInterval)
    },

    getIcon(name) {
      try {
        return require(`@/assets/icons/resources/${name}.svg`)
      } catch {
        return ""
      }
    },
    confirm() {
      if (this.selected === null) return
      this.$emit("confirm", {
        recipe: this.options[this.selected],
        quantity: this.quantity,
        step: this.step,
      })
    },

    is_affordable(recipe) {
      if (this.action === "buy" || this.action === "craft") {
        return Object.entries(recipe).every(
          ([res, amount]) =>
            (this.current_resources[res] || 0) >= amount * this.quantity
        )
      } else {
        // sell / mill: проверяем есть ли достаточно самого ресурса
        return (
          (this.current_resources[this.resource_name] || 0) >=
          this.quantity * this.step
        )
      }
    },

    is_short(recipe, res) {
      if (this.action !== "buy" && this.action !== "craft") return false
      return (this.current_resources[res] || 0) < recipe[res] * this.quantity
    },
  },
  emits: ["confirm", "cancel"],
}
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

.option-name {
  font-family: "Philosopher", serif;
  font-size: 0.65rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
