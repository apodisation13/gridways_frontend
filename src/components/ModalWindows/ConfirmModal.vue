<template>
  <base-modal @close-modal="closeModal">
    <div class="confirm-modal">
      <div class="confirm-modal-title-block">
        <slot></slot>
      </div>
      <div class="confirm-modal-buttons">
        <base-button class="confirm-btn" @click="confirmAction">
          Да
        </base-button>
        <base-button class="confirm-btn" @click="closeModal"> Нет </base-button>
      </div>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
  components: { BaseModal, BaseButton },
  emits: ["close", "confirm"],
  methods: {
    closeModal(): void {
      this.$emit("close")
    },
    confirmAction(): void {
      this.$emit("confirm")
    },
  },
})
</script>

<style scoped>
.confirm-modal {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.confirm-modal-title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.confirm-modal-buttons {
  display: flex;
  justify-content: space-around;
}

.confirm-btn {
  max-width: 120px;
}
</style>
