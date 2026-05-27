<template>
  <div class="payment-result-page">
    <div v-if="status === PageStatus.PENDING" class="state">
      <div class="spinner" />
      <p class="state__text global_text">Проверяем оплату...</p>
    </div>

    <div v-else-if="status === PageStatus.SUCCESS" class="state">
      <div class="state__icon state__icon--success">✓</div>
      <p class="state__text global_text">
        Ресурсы зачислены!
        <br />
        Они уже доступны в вашем профиле
      </p>
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

    <div v-else-if="status === PageStatus.FAILED" class="state">
      <div class="state__icon state__icon--failed">✗</div>
      <p class="state__text global_text">Оплата не прошла</p>
      <button class="state__btn" @click="$router.push('/shop')">
        Попробовать снова
      </button>
    </div>

    <div v-else-if="status === PageStatus.TIMEOUT" class="state">
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

import { PurchaseStatus } from "@/types"

const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 12 // 60 секунд

const PageStatus = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  TIMEOUT: "timeout",
} as const

type PageStatusValue = (typeof PageStatus)[keyof typeof PageStatus]

export default defineComponent({
  name: "PaymentResultPage",

  setup() {
    return { PageStatus }
  },

  data() {
    return {
      status: PageStatus.PENDING as PageStatusValue,
      pollCount: 0,
      intervalId: null as ReturnType<typeof setInterval> | null,
    }
  },

  created() {
    const purchaseId = this.$store.getters["pendingPurchaseId"] as number | null
    if (!purchaseId) return
    this.startPolling(purchaseId.toString())
  },

  beforeUnmount() {
    this.stopPolling()
  },

  methods: {
    startPolling(purchaseIdStr: string): void {
      this.intervalId = setInterval(
        () => this.poll(purchaseIdStr),
        POLL_INTERVAL_MS
      )
    },

    async poll(paymentId: string): Promise<void> {
      this.pollCount++

      if (this.pollCount >= MAX_POLLS) {
        this.status = PageStatus.TIMEOUT
        this.stopPolling()
        return
      }

      try {
        const data = await this.$store.dispatch(
          "checkPurchaseStatus",
          paymentId
        )
        if (data.status === PurchaseStatus.SUCCESS) {
          this.status = PageStatus.SUCCESS
          this.stopPolling()
        } else if (data.status === PurchaseStatus.FAILED) {
          this.status = PageStatus.FAILED
          this.stopPolling()
        } else if (data.status === PurchaseStatus.ABANDONED) {
          this.status = PageStatus.FAILED
          this.stopPolling()
        }
      } catch {
        // сетевая ошибка — продолжаем поллить
      }
    },

    stopPolling(): void {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      this.$store.commit("setPendingPurchaseId", null)
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
  background-clip: text;
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
