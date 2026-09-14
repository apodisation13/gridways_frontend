<template>
  <base-button @click="switchHelp">
    {{ helpOn ? "Показывать подсказки: да" : "Показывать подсказки: нет" }}
  </base-button>
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
  },
  methods: {
    switchHelp(): void {
      this.$store.commit("switchHelp")
    },
  },
})
</script>
