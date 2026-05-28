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
  payment_url: string | null
  transaction_id: string
}

export enum PurchaseStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  ABANDONED = "abandoned",
}

export type PurchaseStatusResponse = PurchaseStatus
