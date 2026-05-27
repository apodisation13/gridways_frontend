<template>
  <div class="iframe-modal">
    <div class="iframe-modal__overlay" />
    <div class="iframe-modal__container">
      <button class="iframe-modal__close" @click="handleManualClose">✕</button>
      <iframe
        ref="iframeRef"
        :src="paymentUrl"
        class="iframe-modal__frame"
        @load="handleIframeLoad"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "PaymentIframeModal",
  props: {
    paymentUrl: {
      type: String,
      required: true,
    },
  },
  emits: ["success", "fail", "close"],
  methods: {
    handleIframeLoad() {
      try {
        const path = (this.$refs.iframeRef as HTMLIFrameElement).contentWindow
          ?.location.pathname
        if (path === "/payment/result") {
          this.$emit("success")
        } else if (path === "/payment/fail") {
          this.$emit("fail")
        }
      } catch {
        // cross-origin — форма ещё на домене провайдера, игнорируем
      }
    },
    handleManualClose() {
      this.$emit("close")
    },
  },
})
</script>

<style scoped>
.iframe-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iframe-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
}

.iframe-modal__container {
  position: relative;
  z-index: 1;
  width: min(480px, 96vw);
  height: min(640px, 90vh);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.iframe-modal__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.iframe-modal__frame {
  flex: 1;
  width: 100%;
  border: none;
}
</style>
