// Одна "страница" внутри окна подсказки, между ними переключаемся стрелками
export interface HelpPage {
  title: string
  text: string[]
}

export interface HelpContent {
  // id для будущего запроса "больше не показывать", НЕ привязан к пути роута
  id: string
  pages: HelpPage[]
}

// Значение может быть null: так бэкенд отключает подсказку для конкретной страницы.
export type Helps = Record<string, HelpContent | null>
