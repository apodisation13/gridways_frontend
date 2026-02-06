import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { REFRESH_TOKEN } from "@/store/const/api_urls"
import store from "@/store"
import router from "@/router/router"
import { useToast } from "vue-toastification"

export const GET = "GET"
export const POST = "POST"
export const DELETE = "DELETE"
export const PATCH = "PATCH"

const toast = useToast()

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const tryRefreshToken = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const refreshToken = user.refreshToken

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await axios.post(REFRESH_TOKEN, {
    refresh_token: refreshToken,
  })

  return response.data.access_token
}

/**
 * Универсальная функция для вызова API
 * @param {string} method - HTTP метод (get, post, put, delete, etc.)
 * @param {string} url - URL endpoint
 * @param {Object} data - Тело запроса (для post, put, patch)
 * @param {Object} params - Query параметры (для get запросов)
 * @param {Object} headers - Дополнительные заголовки
 * @param {boolean} _retry - Флаг повторного запроса
 * @param {Object} options - Дополнительные опции axios
 * @returns {Promise}
 */
export const callApi = async ({
  method = GET,
  url,
  data = null,
  params = null,
  headers = {},
  _retry = false,
  ...options
}) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const token = user && user.token
    const requestId = uuidv4()

    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        ...(data && { "Content-Type": "application/json" }),
        ...headers,
        // Автоматически добавляем токен авторизации
        ...{ Authorization: `Bearer ${token}` },
        ...{ "X-Request-ID": requestId },
      },
      params, // query параметры
      data, // тело запроса
      ...options,
    }

    const response = await axios(config)

    // Стандартизированный ответ
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    }
  } catch (error) {
    const status = error.response?.status

    // НОВАЯ ЛОГИКА: если 401 и это не повторный запрос
    if (status === 401 && !_retry) {
      // Если уже идёт refresh — ставим запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          // Когда refresh завершится — повторяем запрос с новым токеном
          return callApi({
            method,
            url,
            data,
            params,
            headers,
            _retry: true,
            ...options,
          })
        })
      }

      // Начинаем процесс обновления токена
      isRefreshing = true

      try {
        console.log("🔄 Access token expired, refreshing...")

        const newToken = await tryRefreshToken()
        console.log("✅ Token refreshed successfully")

        // Сохраняем новый токен в store и localStorage
        store.commit("updateAccessToken", newToken)

        // Обрабатываем очередь ожидающих запросов
        processQueue(null, newToken)

        // Повторяем оригинальный запрос
        return callApi({
          method,
          url,
          data,
          params,
          headers,
          _retry: true, // помечаем что это повторный запрос
          ...options,
        })
      } catch (refreshError) {
        console.log("❌ Token refresh failed, logging out...")
        toast.error("Не удалось автоматически обновить токен авторизации")

        // Refresh не удался — разлогиниваем
        processQueue(refreshError, null)
        store.commit("logOut")
        router.push("/login")

        throw {
          success: false,
          error: "Session expired. Please login again.",
          status: 401,
          code: "TOKEN_EXPIRED",
          originalError: refreshError,
        }
      } finally {
        isRefreshing = false
      }
    }
    throw {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
      code: error.code,
      originalError: error,
    }
  }
}

// // Дополнительные удобные методы
// export const api = {
//   get: (url, params, headers, options) =>
//     callApi({ method: "get", url, params, headers, ...options }),
//
//   post: (url, data, headers, options) =>
//     callApi({ method: "post", url, data, headers, ...options }),
//
//   put: (url, data, headers, options) =>
//     callApi({ method: "put", url, data, headers, ...options }),
//
//   patch: (url, data, headers, options) =>
//     callApi({ method: "patch", url, data, headers, ...options }),
//
//   delete: (url, headers, options) =>
//     callApi({ method: "delete", url, headers, ...options }),
// }
