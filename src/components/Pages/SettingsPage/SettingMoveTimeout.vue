<template>
  <div class="form-wrapper">
    <!-- Поле ввода числа -->
    <div class="input-group">
      <label for="numberInput">Введите число (в мс) (минимум 200):</label>
      <input
        id="numberInput"
        v-model.number="moveTimeOutValue"
        type="number"
        min="200"
        placeholder="5"
        class="number-input"
      />
      <span v-if="errorMessage" class="error">
        {{ errorMessage }}
      </span>
    </div>

    <!-- Кнопка генерации -->
    <base-button :disabled="!isValid" @click="setMoveTimeout">
      Сохранить
    </base-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
  name: "SettingMoveTimeout",
  components: { BaseButton },
  data() {
    return {
      moveTimeOutValue: 1000 as number | null | "",
    }
  },
  computed: {
    moveTimeOut(): number {
      return this.$store.getters["selectedMoveTimeout"]
    },
    isValid(): boolean {
      return (
        this.moveTimeOutValue !== null &&
        this.moveTimeOutValue !== "" &&
        this.moveTimeOutValue >= 200 &&
        this.moveTimeOutValue <= 1000
      )
    },
    errorMessage(): string {
      if (this.moveTimeOutValue === null || this.moveTimeOutValue === "") {
        return "Введите число"
      }
      if (this.moveTimeOutValue < 200) {
        return "Минимальное значение: 200 мс"
      }
      if (this.moveTimeOutValue > 1000) {
        return "Максимальное значение: 1000 мс"
      }
      return ""
    },
  },
  created() {
    this.moveTimeOutValue = this.moveTimeOut
  },
  methods: {
    setMoveTimeout(): void {
      this.$store.commit("setMoveTimeout", this.moveTimeOutValue)
    },
  },
})
</script>
<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: white;
}

.number-input {
  width: 200px;
  padding: 12px 16px;
  font-size: 18px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.number-input:focus {
  border-color: #4a90d9;
}

.number-input:invalid {
  border-color: #e74c3c;
}

.error {
  color: #e74c3c;
  font-size: 12px;
}
</style>
