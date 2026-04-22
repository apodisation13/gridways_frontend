<template>
  <div @click.stop="toggleVisibleDialog">
    <base-button>reset levels</base-button>
    <confirm-modal
      v-if="show_dialog"
      @confirm="resetLevels"
      @close="toggleVisibleDialog"
    >
      <div class="title-modal">Точно обнулить уровни?</div>
    </confirm-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"
import ConfirmModal from "@/components/ModalWindows/ConfirmModal.vue"

export default defineComponent({
  name: "SettingDeleteAllLevels",
  components: { ConfirmModal, BaseButton },
  data() {
    return {
      show_dialog: false,
    }
  },
  methods: {
    toggleVisibleDialog(): void {
      this.show_dialog = !this.show_dialog
    },
    async resetLevels(): Promise<void> {
      const result = await this.$store.dispatch("reset_levels")
      console.log(result)
      this.toggleVisibleDialog()
    },
  },
})
</script>

<style scoped>
.title-modal {
  font-weight: 700;
  font-size: 1.5rem;
  color: #667080;
  margin-bottom: 20px;
}
</style>
