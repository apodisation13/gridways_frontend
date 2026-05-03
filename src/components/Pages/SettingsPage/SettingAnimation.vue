<template>
  <base-button @click="switchAnimation">
    {{ animationOn ? "animation ON" : "animation OFF" }}
  </base-button>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import BaseButton from "@/components/UI/Buttons/BaseButton.vue"
export default defineComponent({
  name: "SettingAnimation",
  components: { BaseButton },
  computed: {
    animationOn(): boolean {
      return this.$store.getters["animationOn"]
    },
  },
  methods: {
    switchAnimation(): void {
      this.$store.commit("switchAnimation")
    },
  },
})
</script>
