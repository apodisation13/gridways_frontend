<template>
  <div v-if="changeThemeOpened">
    <div
      v-for="el in themes"
      :key="el"
      class="themes"
      @dblclick="setSettingTheme(el)"
    >
      <button
        class="theme"
        :class="{ selected_theme: el === $store.getters['selectedTheme'] }"
      >
        <div class="game__outer-wrapper" :style="styleOuter(el)">
          <div class="game__wrapper" :style="styleWrapper(el)"></div>
        </div>
      </button>
    </div>
  </div>
  <setting-locked v-else title="Тема заблокирована" />
</template>

<script lang="ts">
import { defineComponent } from "vue"

import SettingLocked from "@/components/Pages/SettingsPage/SettingLocked.vue"
import { styleOuter, styleWrapper } from "@/logic/border_styles"
import { UpgradeSubtype, UpgradeType } from "@/types/upgrades"

export default defineComponent({
  name: "SettingChooseTheme",
  components: { SettingLocked },
  data() {
    return {
      themes: [1, 2, 3, 4],
    }
  },
  computed: {
    changeThemeOpened(): boolean {
      return (
        this.$store.getters["userUpgrades"][UpgradeType.SETTINGS][
          UpgradeSubtype.THEME
        ] == 1
      )
    },
  },
  methods: {
    styleOuter(el: number): Record<string, string> | undefined {
      return styleOuter(el)
    },
    styleWrapper(el: number): Record<string, string> | undefined {
      return styleWrapper(el)
    },
    setSettingTheme(el: number): void {
      this.$store.commit("set_theme", el)
    },
  },
})
</script>

<style scoped>
.themes {
  display: inline;
  margin: 5px;
}
.theme {
  border: 3px solid;
  border-image-slice: 1;
  height: 71px;
  width: 71px;
  background: #000000;
  padding: 2px;
  background: linear-gradient(
    180deg,
    #465361 0%,
    rgba(37, 44, 50, 0.35) 50.52%,
    #1d252d 99.48%
  );
}
.selected_theme {
  border-image-source: var(--secondary-gold-gradient);
}

.game__outer-wrapper {
  height: 100%;
  width: 100%;
  padding: 3px;
  border-radius: 5px;
}
.game__wrapper {
  box-shadow:
    inset -4px -4px 4px rgba(0, 0, 0, 0.25),
    inset 4px 4px 10px rgba(186, 218, 255, 0.4);
  padding: 4px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
