<template>
  <div class="setting-locked">
    <svg
      class="lock-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        fill="rgba(250,207,93,0.15)"
        stroke="rgba(250,207,93,0.65)"
        stroke-width="1.5"
      />
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="rgba(250,207,93,0.65)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="rgba(250,207,93,0.65)" />
    </svg>
    <span class="locked-title">{{ title }}</span>
    <span class="locked-hint"
      >Откройте в разделе <strong>Прокачка</strong></span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "SettingLocked",
  props: {
    title: {
      type: String,
      default: "Заблокировано",
    },
  },
})
</script>

<style scoped>
.setting-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 20px;
  border-radius: 12px;
  border: 1px solid rgba(250, 207, 93, 0.25);
  background: rgba(0, 0, 0, 0.25);
  text-align: center;
}

.lock-icon {
  width: 44px;
  height: 44px;
}

.locked-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.locked-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
}

.locked-hint strong {
  color: rgba(250, 207, 93, 0.8);
  font-weight: 600;
}
</style>
