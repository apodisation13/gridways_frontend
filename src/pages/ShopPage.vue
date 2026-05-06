<template>
  <div class="shop-page">
    <div class="shop-page__title">
      <h1 class="global_text shop-page__heading">Магазин</h1>
    </div>

    <div class="shop-list">
      <div v-for="item in shopItems" :key="item.id" class="shop-item">
        <span class="shop-item__title global_text">{{ item.title }}</span>
        <div class="shop-item__resources">
          <resource-item
            v-for="[name, count] in Object.entries(item.data)"
            :key="name"
            :name="name"
            :count="count"
          />
        </div>
        <button class="shop-item__btn" @click="selectedItem = item">
          Купить за {{ item.price }} ₽
        </button>
      </div>
    </div>

    <shop-confirm-modal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItem = null"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import ShopConfirmModal from "@/components/ModalWindows/ShopConfirmModal.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { ShopItem } from "@/types"

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, title: "Малый набор", price: 59, data: { kegs: 2, money: 100 } },
  {
    id: 2,
    title: "Средний набор",
    price: 149,
    data: { big_kegs: 1, kegs: 3, keys: 1 },
  },
  {
    id: 3,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 4,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 5,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 6,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 7,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 8,
    title: "Большой набор",
    price: 349,
    data: { chests: 1, big_kegs: 2, keys: 2 },
  },
  {
    id: 9,
    title: "Вот это будет какая-то очень длинная фраза, которая говорит что-то нам",
    price: 99,
    data: { crops: 50, wood: 50, silk: 20, scraps: 20,  chests: 20,  bronze_ingots: 10, silver_ingots: 10, money: 10000 },
  },
]

export default defineComponent({
  name: "ShopPage",
  components: { ResourceItem, ShopConfirmModal },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      shopItems: SHOP_ITEMS,
      selectedItem: null as ShopItem | null,
    }
  },
  methods: {
    handleConfirm(): void {
      this.toast.info("Скоро!")
      this.selectedItem = null
    },
  },
})
</script>

<style scoped>
.shop-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
  color: white;
}

.shop-page__title {
  text-align: center;
  padding: 16px 0 10px;
}

.shop-page__heading {
  font-size: 1.8rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.shop-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 20px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(196, 155, 0, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
}

.shop-item__title {
  flex: 0 0 auto;
  width: 90px;
  font-size: 13px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.3;
}

.shop-item__resources {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.shop-item__btn {
  flex: 0 0 130px;
  width: 130px;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  background: var(--primary-gold-gradient);
  font-family: "Philosopher", serif;
  font-size: 15px;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
}
</style>
