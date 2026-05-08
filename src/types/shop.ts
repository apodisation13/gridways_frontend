export interface ShopItem {
  id: number
  title: string
  price: number
  data: {
    resources?: Record<string, number>
  }
}

export interface PurchaseProductResponse {
  purchase_id: number
  confirmation_url: string | null
}

export interface PurchaseStatusResponse {
  status: "pending" | "succeeded" | "failed"
}
