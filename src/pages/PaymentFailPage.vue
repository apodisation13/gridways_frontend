<template>
  <div class="payment-fail-page">
    <div class="state">
      <div class="state__icon">✗</div>
      <p class="state__text global_text">Оплата не прошла</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "PaymentFailPage",
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

.state__icon {
  font-size: 64px;
  line-height: 1;
  color: #f44336;
}
</style>
