<template>
  <div class="shop-page">
    <div class="shop-page__title">
      <h1 class="global_text shop-page__heading">Магазин</h1>
    </div>

    <div class="shop-list">
      <div v-for="item in shopItems" :key="item.id" class="shop-item">
        <span class="shop-item__title global_text">{{ item.title }}</span>
        <div v-if="item.data.resources" class="shop-item__resources">
          <resource-item
            v-for="[name, count] in sortedResources(item.data.resources!)"
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
      :loading="purchasing"
      @close="selectedItem = null"
      @confirm="handleConfirm"
    />

    <payment-iframe-modal
      v-if="paymentUrl"
      :payment-url="paymentUrl"
      @success="handlePaymentSuccess"
      @fail="handlePaymentFail"
      @close="handlePaymentClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import PaymentIframeModal from "@/components/ModalWindows/PaymentIframeModal.vue"
import ShopConfirmModal from "@/components/ModalWindows/ShopConfirmModal.vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"
import type { PurchaseProductResponse, ShopItem } from "@/types"

const RESOURCE_ORDER: Record<string, number> = {
  scraps: 0,
  raw_bronze: 1,
  raw_silver: 2,
  raw_gold: 3,
  crops: 4,
  wood: 5,
  silk: 6,
  bronze_ingots: 7,
  silver_ingots: 8,
  gold_ingots: 9,
  money: Infinity,
}

export default defineComponent({
  name: "ShopPage",
  components: { ResourceItem, ShopConfirmModal, PaymentIframeModal },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      selectedItem: null as ShopItem | null,
      purchasing: false,
      paymentUrl: null as string | null,
    }
  },
  computed: {
    shopItems(): ShopItem[] | null {
      return this.$store.getters["allProducts"]
    },
  },
  async created() {
    await this.$store.dispatch("fetchProducts")
  },
  methods: {
    sortedResources(resources: Record<string, number>): [string, number][] {
      return Object.entries(resources).sort(
        (a, b) => (RESOURCE_ORDER[a[0]] ?? 99) - (RESOURCE_ORDER[b[0]] ?? 99)
      )
    },
    async handleConfirm(productId: number): Promise<void> {
      this.purchasing = true
      try {
        const result: PurchaseProductResponse = await this.$store.dispatch(
          "purchaseProduct",
          productId
        )
        this.selectedItem = null
        this.$store.commit("setPendingPurchaseId", result.purchase_id)
        if (result.payment_url) {
          this.paymentUrl = result.payment_url
        } else {
          this.$router.push("/payment/result")
        }
      } catch {
        this.toast.error("Ошибка при создании платежа")
      } finally {
        this.purchasing = false
      }
    },
    handlePaymentSuccess() {
      this.paymentUrl = null
      this.$router.push("/payment/result")
    },
    handlePaymentFail() {
      this.paymentUrl = null
      this.$store.commit("setPendingPurchaseId", null)
      this.toast.error("Оплата не прошла. Попробуйте ещё раз.")
    },
    handlePaymentClose() {
      this.paymentUrl = null
      this.$store.commit("setPendingPurchaseId", null)
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
