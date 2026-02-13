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
    <button class="generate-btn" @click="setMoveTimeout" :disabled="!isValid">
      Сохранить
    </button>
  </div>
</template>

<script>
export default {
  name: "SettingAnimation",
  created() {
    this.moveTimeOutValue = this.moveTimeOut
  },
  computed: {
    moveTimeOut() {
      return this.$store.getters["selectedMoveTimeout"]
    },
    isValid() {
      return (
        this.moveTimeOutValue !== null &&
        this.moveTimeOutValue !== "" &&
        this.moveTimeOutValue >= 200 &&
        this.moveTimeOutValue <= 2000
      )
    },
    errorMessage() {
      if (this.moveTimeOutValue === null || this.moveTimeOutValue === "") {
        return "Введите число"
      }
      if (this.moveTimeOutValue < 200) {
        return "Минимальное значение: 200 мс"
      }
      if (this.moveTimeOutValue > 2000) {
        return "Максимальное значение: 2000 мс"
      }
      return ""
    },
  },
  data() {
    return {
      moveTimeOutValue: 1000,
    }
  },
  methods: {
    setMoveTimeout() {
      this.$store.commit("setMoveTimeout", this.moveTimeOutValue)
    },
  },
}
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

.generate-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: #4a90d9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #357abd;
}

.generate-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.generate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
