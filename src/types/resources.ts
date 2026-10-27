export type Recipe = Record<string, number>

export interface ResourceActions {
  description?: string
  buy?: Recipe[]
  sell?: Recipe[]
  craft?: Recipe[]
  mill?: Recipe[]
  open?: boolean
  inventory?: boolean
  step?: number
  index?: number
}

export interface KeyRewardResult {
  resource: string
  value: number
}
