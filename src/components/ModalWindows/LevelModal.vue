<template>
  <modal-window>
    <button-close @close_self="close_self" />
    <h3 class="text">{{ level.name }} - {{ level.difficulty }} <br /></h3>
    <div class="enemy_leader">
      <enemy-leader :enemy_leader="level.enemy_leader" />
    </div>
    <h4 class="text">Врагов - {{ level.enemies.length }} <br /></h4>
    <enemy-list :enemies="level.enemies" />
  </modal-window>
</template>

<script>
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import EnemyLeader from "@/components/Cards/EnemyLeader.vue"
import EnemyList from "@/components/Cards/EnemyList.vue"
export default {
  name: "level-modal",
  components: { EnemyList, EnemyLeader, ButtonClose, ModalWindow },
  props: {
    level: {
      required: true,
    },
  },
  methods: {
    close_self() {
      this.$emit("close_level_modal")
    },
  },
  emits: ["close_level_modal"],
}
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
