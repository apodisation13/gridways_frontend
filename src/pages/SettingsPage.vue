<template>
  <div class="settings-page">
    <!-- Верхняя панель с иконками -->
    <div
      ref="scrollContainer"
      class="icons-panel"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        class="icon-button"
        :class="{ active: activeTab === item.id }"
        @click="activeTab = item.id"
      >
        <img class="icon" :src="item.icon" alt="" />
        <span class="icon-label">{{ item.label }}</span>
      </button>
    </div>

    <!-- Контейнер для зон настроек -->
    <div class="settings-zone">
      <!-- Звук -->
      <setting-sound v-if="activeTab === 'sound'" />
      <!-- Анимации -->
      <setting-animation v-if="activeTab === 'animation'" />
      <!-- Таймаут хода -->
      <setting-move-timeout v-if="activeTab === 'timeout'" />
      <!-- Язык -->
      <div v-if="activeTab === 'language'">Пока не реализовано</div>
      <!-- Цветовая схема -->
      <setting-choose-theme v-if="activeTab === 'colorscheme'" />
      <!-- Аватарка -->
      <setting-avatar v-if="activeTab === 'avatar'" />
      <!-- Выход из аккаунта -->
      <setting-logout v-if="activeTab === 'logout'" />
    </div>

    <button class="base-button" :disabled="isLoading" @click="updateSettings">
      <span class="global_text base-button-text">Запомнить мои настройки!</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import SettingAnimation from "@/components/Pages/SettingsPage/SettingAnimation.vue"
import SettingAvatar from "@/components/Pages/SettingsPage/SettingAvatar.vue"
import SettingChooseTheme from "@/components/Pages/SettingsPage/SettingChooseTheme.vue"
import SettingLogout from "@/components/Pages/SettingsPage/SettingLogout.vue"
import SettingMoveTimeout from "@/components/Pages/SettingsPage/SettingMoveTimeout.vue"
import SettingSound from "@/components/Pages/SettingsPage/SettingSound.vue"

export default defineComponent({
  name: "SettingsPage",
  components: {
    SettingAvatar,
    SettingChooseTheme,
    SettingLogout,
    SettingAnimation,
    SettingSound,
    SettingMoveTimeout,
  },
  data() {
    return {
      activeTab: "sound",
      touchStartX: 0,
      scrollLeft: 0,
      isLoading: false,
      menuItems: [
        {
          id: "sound",
          label: "Звук",
          icon: require("@/assets/icons/settings/setting_sound.svg"),
        },
        {
          id: "animation",
          label: "Анимации",
          icon: require("@/assets/icons/settings/setting_animation.svg"),
        },
        {
          id: "timeout",
          label: "Таймаут",
          icon: require("@/assets/icons/settings/setting_timeout.svg"),
        },
        {
          id: "language",
          label: "Язык",
          icon: require("@/assets/icons/settings/setting_language.svg"),
        },
        {
          id: "colorscheme",
          label: "Цвета",
          icon: require("@/assets/icons/settings/setting_color_scheme.svg"),
        },
        {
          id: "avatar",
          label: "Аватарка",
          icon: require("@/assets/icons/settings/setting_avatar.svg"),
        },
        {
          id: "logout",
          label: "Выйти",
          icon: require("@/assets/icons/settings/setting_logout.svg"),
        },
      ] as { id: string; label: string; icon: string }[],
    }
  },
  mounted() {
    const container = this.$refs.scrollContainer as HTMLElement | undefined
    if (container) {
      container.addEventListener("touchend", this.handleTouchEnd)
    }
  },
  beforeUnmount() {
    const container = this.$refs.scrollContainer as HTMLElement | undefined
    if (container) {
      container.removeEventListener("touchend", this.handleTouchEnd)
    }
  },
  methods: {
    handleWheel(e: WheelEvent): void {
      const container = this.$refs.scrollContainer as HTMLElement | undefined
      if (container) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    },
    handleTouchStart(e: TouchEvent): void {
      this.touchStartX = e.touches[0].pageX
      this.scrollLeft = (this.$refs.scrollContainer as HTMLElement).scrollLeft
    },
    handleTouchMove(e: TouchEvent): void {
      if (!this.touchStartX) return
      e.preventDefault()
      const touchX = e.touches[0].pageX
      const delta = this.touchStartX - touchX
      ;(this.$refs.scrollContainer as HTMLElement).scrollLeft =
        this.scrollLeft + delta
    },
    handleTouchEnd(): void {
      this.touchStartX = 0
    },
    async updateSettings(): Promise<void> {
      if (this.isLoading) return
      this.isLoading = true
      await this.$store.dispatch("updateUserPreferences")
      this.isLoading = false
    },
  },
})
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
  background: transparent;
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-height: 800px;
}

.icons-panel {
  display: flex;
  padding: 5px 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.1);
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  background: linear-gradient(
    180deg,
    #465361 0%,
    rgba(37, 44, 50, 0.35) 50.52%,
    #1d252d 99.48%
  );
  border: none;
  border-bottom: 3px solid;
  border-image-source: var(--secondary-gold-gradient);
  border-image-slice: 1;
}

.icons-panel:active {
  cursor: grabbing;
}

.icons-panel::-webkit-scrollbar {
  height: 5px;
}

.icons-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.icons-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.icons-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8);
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 5px 3px;
  background: transparent;
  border: none;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 3px;
  flex-shrink: 0;
}

.icon-button .icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
}

.icon-button .icon svg {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.icon-button .icon-label {
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: white;
  font-weight: 500;
}

.icon-button:hover .icon {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.icon-button.active .icon {
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.icon-button.active .icon-label {
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.settings-zone {
  margin-top: 2vh;
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: transparent;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.1);
}

.settings-zone::-webkit-scrollbar {
  width: 5px;
}

.settings-zone::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.settings-zone::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

@media (max-width: 480px) {
  .icons-panel {
    padding: 16px 12px;
    gap: 4px;
  }

  .icon-button {
    min-width: 60px;
  }

  .icon-button .icon {
    width: 44px;
    height: 44px;
  }

  .icon-button .icon svg {
    width: 24px;
    height: 24px;
  }

  .settings-zone {
    padding: 18px 14px;
  }
}

.base-button {
  background: linear-gradient(#1d252d, #000000, #282d33);
  border: 2px solid #facf5d;
  border-radius: 6px;
  position: fixed;
  bottom: 15vh;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  padding: 13px;
  cursor: pointer;
  outline: none;
}

.base-button-text {
  font-size: 16px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
