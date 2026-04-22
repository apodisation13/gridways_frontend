<template>
  <div @click.stop="toggleVisibleDialog">
    <base-button>logout</base-button>
    <confirm-modal
      v-if="show_dialog"
      @confirm="logoutProcess"
      @close="toggleVisibleDialog"
    >
      <div class="title-modal">Вы уверены что хотите выйти?</div>
    </confirm-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import ConfirmModal from "@/components/ModalWindows/ConfirmModal.vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
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
    logoutProcess(): void {
      this.$store.dispatch("logOut")
      this.$router.push("/main")
    },
  },
})
</script>

<style scoped>
.title-modal {
  font-weight: 700;
  font-size: 1.5rem;
  color: gold;
  margin-bottom: 20px;
}
</style>
