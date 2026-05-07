export interface ShopItem {
  id: number
  title: string
  price: number
  data: {
    resources?: Record<string, number>
  }
}
