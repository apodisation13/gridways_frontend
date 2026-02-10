<template>
  <base-button @click="switchSound">
    {{ sound ? "sound ON" : "sound OFF" }}
  </base-button>
</template>

<script>
import BaseButton from "@/components/UI/Buttons/BaseButton"
export default {
  name: "SettingSound",
  components: { BaseButton },
  computed: {
    sound() {
      return this.$store.state.settings.soundOn
    },
  },
  methods: {
    switchSound() {
      this.$store.commit("switchSound")
    },
  },
}
</script>
