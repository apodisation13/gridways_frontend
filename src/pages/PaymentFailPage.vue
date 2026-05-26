<template>
  <div class="payment-fail-page">
    <div class="state">
      <div class="state__icon">✗</div>
      <p class="state__text global_text">Оплата не прошла</p>
      <p class="state__subtext global_text">
        Окно закроется через {{ seconds }} сек...
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "PaymentFailPage",
  data() {
    return {
      seconds: 10,
      intervalId: null as ReturnType<typeof setInterval> | null,
    }
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.seconds--
      if (this.seconds <= 0) {
        clearInterval(this.intervalId!)
        window.close()
      }
    }, 1000)
  },
  beforeUnmount() {
    if (this.intervalId !== null) clearInterval(this.intervalId)
  },
})
</script>

<style scoped>
.payment-fail-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
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
  background-clip: text;
}

.state__subtext {
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
}

.state__icon {
  font-size: 64px;
  line-height: 1;
  color: #f44336;
}
</style>
