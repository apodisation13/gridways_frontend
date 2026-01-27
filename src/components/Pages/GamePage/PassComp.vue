<template>
  <div class="pass">
    <button
      class="pass-btn"
      :disabled="!$store.state.game.player_turn"
      :style="themedStyle"
      v-if="$store.state.game.player_turn"
    >
      ХОД 🔄
    </button>
    <button class="pass-btn" :disabled="!$store.state.game.player_turn" v-else>
      ХОД 🔄
    </button>
  </div>
</template>

<script>
import { styleWrapper } from "@/logic/border_styles"

export default {
  name: "pass-comp",
  computed: {
    themedStyle() {
      return styleWrapper(this.$store.getters["selectedTheme"])
    },
  },
}
</script>

<style scoped>
.pass {
  height: 10vh;
  width: 98%;
  /*border: solid 1px blue;*/
  margin-bottom: 1%;
  margin-top: 1%;
  position: relative;
}

.pass-btn {
  width: 11vh;
  height: 11vh;
  border-radius: 50%;
  border: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: relative;
  font-size: 25px;
  color: white;
}
</style>
