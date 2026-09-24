<template>
  <div class="setting-help">
    <base-button @click="switchHelp">
      {{
        helpOn ? "Подсказки на страницах: да" : "Подсказки на страницах: нет"
      }}
    </base-button>
    <base-button @click="switchGameHelp">
      {{
        helpGameOn
          ? "Подсказки во время игры: да"
          : "Подсказки во время игры: нет"
      }}
    </base-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
  name: "SettingHelp",
  components: { BaseButton },
  computed: {
    helpOn(): boolean {
      return this.$store.getters["helpOn"]
    },
    helpGameOn(): boolean {
      return this.$store.getters["helpGameOn"]
    },
  },
  methods: {
    switchHelp(): void {
      this.$store.commit("switchHelp")
    },
    switchGameHelp(): void {
      this.$store.commit("switchGameHelp")
    },
  },
})
</script>

<style scoped>
.setting-help {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
