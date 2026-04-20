<template>
  <base-button @click="switchSound">
    {{ soundOn ? "sound ON" : "sound OFF" }}
  </base-button>
</template>

<script>
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"
export default {
  name: "SettingSound",
  components: { BaseButton },
  computed: {
    soundOn() {
      return this.$store.getters["soundOn"]
    },
  },
  methods: {
    switchSound() {
      this.$store.commit("switchSound")
    },
  },
}
</script>
