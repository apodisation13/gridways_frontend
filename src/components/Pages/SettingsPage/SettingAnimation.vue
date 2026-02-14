<template>
  <base-button @click="switchAnimation">
    {{ animationOn ? "animation ON" : "animation OFF" }}
  </base-button>
</template>

<script>
import BaseButton from "@/components/UI/Buttons/BaseButton"
export default {
  name: "SettingAnimation",
  components: { BaseButton },
  computed: {
    animationOn() {
      return this.$store.getters["animationOn"]
    },
  },
  methods: {
    switchAnimation() {
      this.$store.commit("switchAnimation")
    },
  },
}
</script>
