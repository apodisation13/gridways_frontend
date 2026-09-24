import { useToast } from "vue-toastification"

import type { ActionContext } from "@/types"

const toast = useToast()

interface ApiError {
  error?:
    | string
    | {
        error?: { message?: string }
        detail?: string
      }
}

const actions = {
  error_action(_: ActionContext, err: ApiError) {
    let message = "Неизвестная ошибка"

    if (typeof err.error === "string") {
      // Сетевая ошибка или наше кастомное сообщение
      message = err.error
    } else if (err.error?.error?.message) {
      // Структура от бэка: { error: { code, message, details } }
      message = err.error.error.message
    } else if (err.error?.detail) {
      // FastAPI HTTPException стиль
      message = err.error.detail
    }

    toast.error(`Ошибка при загрузке базы данных: ${message}`)
  },
}

export default {
  actions,
}
