import axios, { AxiosError } from "axios"
import { v4 as uuidv4 } from "uuid"
import { REFRESH_TOKEN } from "@/store/const/api_urls"
import store from "@/store"
import router from "@/router/router"
import { useToast } from "vue-toastification"

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export interface CallApiParams {
  method?: HttpMethod
  url: string
  data?: Record<string, unknown> | null
  params?: Record<string, unknown> | null
  headers?: Record<string, string>
  _retry?: boolean
  [key: string]: unknown
}

export interface ApiResponse<T = unknown> {
  success: true
  data: T
  status: number
  headers: Record<string, string>
}

interface QueueItem {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}

const toast = useToast()

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const tryRefreshToken = async (): Promise<string> => {
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

export const callApi = async <T = unknown>({
  method = HttpMethod.GET,
  url,
  data = null,
  params = null,
  headers = {},
  _retry = false,
  ...options
}: CallApiParams): Promise<ApiResponse<T>> => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const token = user?.token
    const requestId = uuidv4()

    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        ...(data && { "Content-Type": "application/json" }),
        ...headers,
        Authorization: `Bearer ${token}`,
        "X-Request-ID": requestId,
      },
      params,
      data,
      ...options,
    }

    const response = await axios(config as any)

    return {
      success: true,
      data: response.data as T,
      status: response.status,
      headers: response.headers as Record<string, string>,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status

    if (status === 401 && !_retry) {
      if (isRefreshing) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
          failedQueue.push({
            resolve: () =>
              resolve(
                callApi<T>({
                  method,
                  url,
                  data,
                  params,
                  headers,
                  _retry: true,
                  ...options,
                })
              ),
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        console.log("🔄 Access token expired, refreshing...")

        const newToken = await tryRefreshToken()
        console.log("✅ Token refreshed successfully")

        store.commit("updateAccessToken", newToken)
        processQueue(null, newToken)

        return callApi<T>({
          method,
          url,
          data,
          params,
          headers,
          _retry: true,
          ...options,
        })
      } catch (refreshError) {
        console.log("❌ Token refresh failed, logging out...")
        toast.error("Не удалось автоматически обновить токен авторизации")

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
      error: axiosError.response?.data || axiosError.message,
      status: axiosError.response?.status,
      code: axiosError.code,
      originalError: axiosError,
    }
  }
}
