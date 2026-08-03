<template>
  <div class="enemies">
    <div v-for="enemy in enemies" :key="enemy.id" class="enemy">
      <enemy-comp
        :enemy="enemy"
        :location="location"
        @dblclick="choseEnemy(enemy)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import EnemyComp from "@/components/Cards/EnemyComp.vue"
import type { CardLocation, Enemy } from "@/types"

export default defineComponent({
  name: "EnemyList",
  components: { EnemyComp },
  props: {
    enemies: {
      type: Array as PropType<Enemy[]>,
      required: true,
    },
    location: {
      type: String as PropType<CardLocation>,
      default: null,
    },
  },
  emits: ["chose-enemy"],
  methods: {
    choseEnemy(enemy: Enemy): void {
      this.$emit("chose-enemy", enemy)
    },
  },
})
</script>

<style scoped>
.enemies {
  width: 90%;
  height: 60vh;
  overflow-y: scroll;
  /*border: solid 2px red;*/
  margin: auto;
}

.enemy {
  width: 30%;
  display: inline-block;
  text-align: justify;
  margin: 3px;
}
</style>
