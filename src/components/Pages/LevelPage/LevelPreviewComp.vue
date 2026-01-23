<template>
  <div
    class="d"
    @click.right="open_level_modal"
    v-touch:longtap="open_level_modal"
    @contextmenu.prevent
  >
    <div :style="background_color(level.level)">{{ level.level.name }}</div>
    <div style="font-size: 8pt">Врагов - {{ level.level.enemies.length }}</div>
    <div style="font-size: 8pt">{{ level.level.difficulty }}</div>

    <level-modal
      v-if="show_level_modal"
      :level="level.level"
      @close_level_modal="show_level_modal = false"
    />
  </div>
</template>

<script>
import LevelModal from "@/components/ModalWindows/LevelModal"

export default {
  name: "level-preview-comp",
  components: { LevelModal },
  props: {
    level: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      show_level_modal: false,
    }
  },
  methods: {
    open_level_modal() {
      this.show_level_modal = true
    },
    background_color(deck) {
      if (deck.enemy_leader.faction === "Soldiers")
        return { backgroundColor: "blue" }
      else if (deck.enemy_leader.faction === "Monsters")
        return { backgroundColor: "red" }
      else if (deck.enemy_leader.faction === "Animals")
        return { backgroundColor: "green" }
      else return {}
    },
  },
}
</script>

<style scoped>
.d {
  width: 8vh;
  height: 10vh;
}
</style>
