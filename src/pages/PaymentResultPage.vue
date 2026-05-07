<template>
  <div class="payment-result-page">
    <div v-if="status === 'pending'" class="state">
      <div class="spinner" />
      <p class="state__text global_text">Проверяем оплату...</p>
    </div>

    <div v-else-if="status === 'success'" class="state">
      <div class="state__icon state__icon--success">✓</div>
      <p class="state__text global_text">Ресурсы зачислены!</p>
      <button class="state__btn" @click="$router.push('/main')">
        На главную
      </button>
      <button class="state__btn" @click="$router.push('/shop')">
        В магазин
      </button>
      <button class="state__btn" @click="$router.push('/bonus')">
        К бонусам
      </button>
    </div>

    <div v-else-if="status === 'failed'" class="state">
      <div class="state__icon state__icon--failed">✗</div>
      <p class="state__text global_text">Оплата не прошла</p>
      <button class="state__btn" @click="$router.push('/shop')">
        Попробовать снова
      </button>
    </div>

    <div v-else-if="status === 'timeout'" class="state">
      <div class="state__icon">⏳</div>
      <p class="state__text global_text">Оплата обрабатывается</p>
      <p class="state__subtext global_text">
        Ресурсы поступят в течение нескольких минут
      </p>
      <button class="state__btn" @click="$router.push('/shop')">
        Проверить позже
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 15 // 30 секунд

type PaymentStatus = "pending" | "success" | "failed" | "timeout"

export default defineComponent({
  name: "PaymentResultPage",

  data() {
    return {
      status: "pending" as PaymentStatus,
      pollCount: 0,
      intervalId: null as ReturnType<typeof setInterval> | null,
    }
  },

  created() {
    const paymentId = this.$route.query.payment_id as string | undefined
    if (!paymentId) {
      this.$router.push("/shop")
      return
    }

    if (paymentId.startsWith("test_")) {
      // тестовый режим: эмулируем успех через 3 секунды
      setTimeout(() => {
        this.status = "success"
      }, 3000)
      return
    }

    // реальный поллинг
    this.intervalId = setInterval(() => this.poll(paymentId), POLL_INTERVAL_MS)
  },

  beforeUnmount() {
    this.stopPolling()
  },

  methods: {
    async poll(paymentId: string): Promise<void> {
      console.log(paymentId)
      this.pollCount++

      if (this.pollCount >= MAX_POLLS) {
        this.status = "timeout"
        this.stopPolling()
        return
      }

      try {
        // TODO: заменить на реальный вызов когда бэк будет готов
        // const { data } = await api.get(`/shop/payment-status?payment_id=${paymentId}`)
        // if (data.status === 'succeeded') { this.status = 'success'; this.stopPolling() }
        // if (data.status === 'failed')    { this.status = 'failed';  this.stopPolling() }
      } catch {
        // сетевая ошибка — продолжаем поллить
      }
    },

    stopPolling(): void {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    },
  },
})
</script>

<style scoped>
.payment-result-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 24px;
}

.state__text {
  font-size: 20px;
  text-align: center;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.state__subtext {
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
  margin-top: -12px;
}

.state__icon {
  font-size: 64px;
  line-height: 1;
}

.state__icon--success {
  color: #4caf50;
}

.state__icon--failed {
  color: #f44336;
}

.state__btn {
  margin-top: 8px;
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient);
  font-family: "Philosopher", serif;
  font-size: 16px;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
}

/* Спиннер */
.spinner {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: #c49000;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
