export type Recipe = Record<string, number>

export interface ResourceActions {
  buy?: Recipe[]
  sell?: Recipe[]
  craft?: Recipe[]
  mill?: Recipe[]
  open?: boolean
  step?: number
  index?: number
}

export interface KeyRewardItem {
  resource: string
  probability: number
  type: "diapason" | "simple"
  min?: number
  max?: number
  value?: number
}

export interface KeyRewardResult {
  resource: string
  value: number
}
