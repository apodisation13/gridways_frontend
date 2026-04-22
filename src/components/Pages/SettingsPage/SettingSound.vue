<template>
  <base-button @click="switchSound">
    {{ soundOn ? "sound ON" : "sound OFF" }}
  </base-button>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"
export default defineComponent({
  name: "SettingSound",
  components: { BaseButton },
  computed: {
    soundOn(): boolean {
      return this.$store.getters["soundOn"]
    },
  },
  methods: {
    switchSound(): void {
      this.$store.commit("switchSound")
    },
  },
})
</script>
