<template>
  <div class="loading-page">
    <div class="global_text loading-page__title">ЗАГРУЗКА</div>
    <div class="loading-page__counter">
      Загрузка карт: {{ imageProgress.loaded }} / {{ imageProgress.total }}
    </div>
    <div class="loading-page__bar" aria-hidden="true">
      <div
        class="loading-page__bar-progress"
        :style="{ width: `${imageProgress.percent}%` }"
      />
    </div>
    <div class="loading-page__percent">{{ imageProgress.percent }}%</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

interface ImageProgress {
  total: number
  loaded: number
  failed: number
  percent: number
}

export default defineComponent({
  name: "LoadingPage",
  computed: {
    imageProgress(): ImageProgress {
      return this.$store.getters["imageLoadingProgress"]
    },
  },
})
</script>

<style scoped>
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  color: #fff0c4;
  text-align: center;
}

.loading-page__title {
  margin-bottom: 24px;
  font-size: 30px;
  color: #facf5d;
}

.loading-page__counter {
  margin-bottom: 10px;
  font-size: 16px;
}

.loading-page__bar {
  width: min(100%, 320px);
  height: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(250, 207, 93, 0.7);
  border-radius: 6px;
}

.loading-page__bar-progress {
  height: 100%;
  background: var(--six-gold-gradient);
  transition: width 120ms ease-out;
}

.loading-page__percent {
  margin-top: 10px;
  color: #facf5d;
  font-size: 18px;
}
</style>
