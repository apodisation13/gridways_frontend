import axios from "axios"
import { v4 as uuidv4 } from "uuid"

export const GET = "GET"
export const POST = "POST"
export const DELETE = "DELETE"
export const PATCH = "PATCH"

/**
 * Универсальная функция для вызова API
 * @param {string} method - HTTP метод (get, post, put, delete, etc.)
 * @param {string} url - URL endpoint
 * @param {Object} data - Тело запроса (для post, put, patch)
 * @param {Object} params - Query параметры (для get запросов)
 * @param {Object} headers - Дополнительные заголовки
 * @param {Object} options - Дополнительные опции axios
 * @returns {Promise}
 */
export const callApi = async ({
  method = GET,
  url,
  data = null,
  params = null,
  headers = {},
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
    // Стандартизированная ошибка
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
