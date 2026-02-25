<template>
  <div class="resource-card">
    <!-- Иконка + ромб с количеством -->
    <div class="resource-icon-wrap">
      <img
        :src="require(`@/assets/icons/resources/${resource_name}.svg`)"
        :alt="resource_name"
        class="resource-icon"
      />
      <span class="resource-count">{{ resource_count }}</span>
    </div>

    <!-- 4 кнопки действий сеткой 2x2 -->
    <div class="action-grid">
      <button
        v-if="actions.buy"
        @click="openModal('buy')"
        class="action-btn btn--buy"
        title="Купить"
      >
        +
      </button>
      <button
        v-if="actions.sell"
        @click="openModal('sell')"
        class="action-btn btn--sell"
        title="Продать"
      >
        ↩
      </button>
      <button
        v-if="actions.craft"
        @click="openModal('craft')"
        class="action-btn btn--craft"
        title="Создать"
      >
        ⚒
      </button>
      <button
        v-if="actions.mill"
        @click="openModal('mill')"
        class="action-btn btn--mill"
        title="Переработать"
      >
        ✕
      </button>
    </div>

    <!-- Модальное окно действия -->
    <resources-action-modal
      v-if="active_action"
      :resource_name="resource_name"
      :action="active_action"
      :options="actions[active_action]"
      :current_resources="current_resources"
      :step="step"
      @confirm="handleConfirm"
      @cancel="active_action = null"
    />
  </div>
</template>

<script>
import ResourcesActionModal from "@/components/Pages/BonusPage/ResourcesActionModal.vue"
export default {
  name: "bonus-page-resource",
  components: { ResourcesActionModal },
  props: {
    resource_name: { type: String, required: true },
    resource_count: { type: Number, default: 0 },
    actions: { type: Object, default: () => ({}) },
    step: { type: Number, default: 1 },
  },
  data() {
    return {
      active_action: null,
    }
  },
  computed: {
    current_resources() {
      return this.$store.getters["resource"]
    },
  },
  methods: {
    openModal(action) {
      this.active_action = action
    },
    handleConfirm(payload) {
      const action = this.active_action
      this.active_action = null
      this.$emit("action", {
        resource_name: this.resource_name,
        action,
        ...payload,
      })
    },
  },
  emits: ["action"],
}
</script>

<style scoped>
.resource-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 215, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.35);
  border-radius: 10px;
}

.resource-icon-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.resource-icon {
  width: 60px;
  height: 60px;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Philosopher", serif;
  transition:
    opacity 0.15s,
    transform 0.1s;
}

.action-btn:active {
  transform: translate(1px, 1px);
  opacity: 0.8;
}

.resource-count {
  font-family: "Philosopher", serif;
  font-size: 1.1rem;
  color: #ffd700;
  text-align: center;
  margin-top: 2px;
}

.btn--buy {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
}
.btn--sell {
  background: linear-gradient(135deg, #2196f3, #1565c0);
  color: white;
}
.btn--craft {
  background: linear-gradient(135deg, #ff9800, #e65100);
  color: white;
}
.btn--mill {
  background: linear-gradient(135deg, #f44336, #b71c1c);
  color: white;
  font-size: 0.85rem;
}
</style>
