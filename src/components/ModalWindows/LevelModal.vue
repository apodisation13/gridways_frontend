<template>
  <modal-window>
    <button-close @close_self="close_self" />
    <h3 class="text">{{ level.name }} - {{ level.difficulty }} <br /></h3>
    <div class="enemy_leader">
      <enemy-leader :enemy_leader="level.enemy_leader" />
    </div>
    <h4 class="text">Врагов - {{ level.enemies.length }} <br /></h4>
    <enemy-list :enemies="filteredEnemies" />
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import EnemyLeader from "@/components/Cards/EnemyLeader.vue"
import EnemyList from "@/components/Cards/EnemyList.vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import type { Enemy, MappedLevel } from "@/types"

export default defineComponent({
  name: "LevelModal",
  components: { EnemyList, EnemyLeader, ButtonClose, ModalWindow },
  props: {
    level: {
      type: Object as PropType<MappedLevel>,
      required: true,
    },
  },
  emits: ["close_level_modal"],
  computed: {
    filteredEnemies(): Enemy[] {
      return this.level.enemies.filter((e): e is Enemy => e !== undefined)
    },
  },
  methods: {
    close_self(): void {
      this.$emit("close_level_modal")
    },
  },
})
</script>

<style scoped>
.enemy_leader {
  width: 30%;
  margin: auto;
}
.text {
  color: white;
}
</style>
