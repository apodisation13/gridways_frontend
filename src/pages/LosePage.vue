<template>
  <div class="lose-page">
    <div class="arena-top-bar">
      <button
        v-if="was_arena"
        class="arena-exit-btn"
        @click="showExitConfirm = true"
      >
        ВЫХОД
      </button>
    </div>
    <yesno-modal
      v-if="showExitConfirm"
      @confirm="exit_arena"
      @cancel="showExitConfirm = false"
    />

    <div class="lose">
      <div>ВЫ ПРОИГРАЛИ :(((</div>
      <div>Удачи в следующий раз!</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import YesnoModal from "@/components/ModalWindows/YesnoModal.vue"

export default defineComponent({
  name: "LosePage",
  components: { YesnoModal },
  data() {
    return {
      showExitConfirm: false,
      was_arena: false,
    }
  },
  created() {
    this.was_arena = this.$store.state.game.arena_mode
    if (this.was_arena) {
      this.$store.commit("set_arena_mode", false)
      this.$store.commit("arena_reset")
      this.$store.dispatch("syncGameUpgrades")
    }
    this.$store.dispatch("re_set_deck")
  },
  methods: {
    exit_arena(): void {
      this.$router.push("/main")
    },
  },
})
</script>

<style scoped>
.lose-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.arena-top-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 6px 10px 0;
}

.arena-exit-btn {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(255, 80, 80, 0.5);
  border-radius: 6px;
  background: rgba(180, 40, 40, 0.18);
  color: rgba(255, 100, 100, 0.85);
  cursor: pointer;
  letter-spacing: 0.05em;
}

.arena-exit-btn:active {
  background: rgba(180, 40, 40, 0.35);
}

.lose {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14pt;
  text-align: center;
}
</style>
