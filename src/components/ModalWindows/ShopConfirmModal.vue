<template>
  <base-modal @close-modal="$emit('close')">
    <div class="shop-confirm">
      <h2 class="shop-confirm__title global_text">{{ item.title }}</h2>
      <div class="shop-confirm__resources">
        <resource-item
          v-for="[name, count] in Object.entries(item.data)"
          :key="name"
          :name="name"
          :count="count"
        />
      </div>
      <button class="shop-confirm__btn" @click="$emit('confirm')">
        Подтвердить покупку за {{ item.price }} ₽
      </button>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { ShopItem } from "@/types"

export default defineComponent({
  components: { BaseModal, ResourceItem },
  props: {
    item: {
      type: Object as PropType<ShopItem>,
      required: true,
    },
  },
  emits: ["close", "confirm"],
})
</script>

<style scoped>
.shop-confirm {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.shop-confirm__title {
  font-size: 20px;
  text-align: center;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.shop-confirm__resources {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.shop-confirm__btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient);
  font-family: "Philosopher", serif;
  font-size: 15px;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
}
</style>
