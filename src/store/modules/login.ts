import { useToast } from "vue-toastification"

import { callApi, HttpMethod } from "@/lib/api/api"
import { USER_LOGIN, USER_REGISTER } from "@/store/const/api_urls"
import {
  ActionContext,
  LoginCredentials,
  RegisterCredentials,
  StoredUser,
  UserLoginResponse,
  UserRegisterResponse,
} from "@/types"

const toast = useToast()

interface LoginState {
  user: StoredUser | Record<string, never>
  is_logged_in: boolean
  header: { headers: { Authorization: string } } | string
  authorization: boolean
}

const state: LoginState = {
  user: JSON.parse(localStorage.getItem("user") || "{}"),
  is_logged_in: false,
  header: "",
  authorization: false, // флаг процесса авторизации, нужен для кнопки НАЧАТЬ на экране эмблемы
}

const getters = {
  getUser: (state: LoginState) => state.user,
  isLoggedIn: (state: LoginState) => state.is_logged_in,
  getHeader: (state: LoginState) => state.header,
  getAuthState: (state: LoginState) => state.authorization,
}

const mutations = {
  logIn(state: LoginState, user: StoredUser) {
    state.user = user
    state.is_logged_in = true
    state.header = { headers: { Authorization: `Bearer ${user.token}` } }
    localStorage.setItem("user", JSON.stringify(user))
  },
  logOut(state: LoginState) {
    state.is_logged_in = false
    state.header = ""
    state.user = {}
    localStorage.removeItem("user")
  },
  updateAccessToken(state: LoginState, newToken: string) {
    if ("token" in state.user) {
      state.user.token = newToken
    }
    state.header = { headers: { Authorization: `Bearer ${newToken}` } }
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    user.token = newToken
    localStorage.setItem("user", JSON.stringify(user))
  },
  // устанавливаем флаг процесса проверки загрузки
  set_auth_state(state: LoginState, payload: boolean) {
    state.authorization = payload
  },
}

const actions = {
  async checkAuth({ getters, dispatch, commit }: ActionContext) {
    const user = getters["getUser"] as StoredUser | Record<string, never>
    if (
      !("email" in user) ||
      !user.email ||
      !("password" in user) ||
      !user.password
    ) {
      commit("logOut")
      toast.warning(
        "По сохранённым ранее данным юзера не получилось авторизоваться, попробуйте вручную!"
      )
      throw new Error(
        "По сохранённым ранее данным юзера не получилось авторизоваться, попробуйте вручную"
      )
    }
    try {
      await dispatch("userLogin", {
        email: user.email,
        password: user.password,
      } as LoginCredentials)
    } catch (err) {
      console.log(err)
      commit("logOut")
      toast.warning(
        "По сохранённым ранее данным юзера не получилось авторизоваться, попробуйте вручную!"
      )
      throw new Error(
        "По сохранённым ранее данным юзера не получилось авторизоваться, попробуйте вручную"
      )
    } finally {
      commit("set_auth_state", false) // не важно, каков итог, в любом случае флаг снимем
    }
  },
  async userLogin({ commit }: ActionContext, userObj: LoginCredentials) {
    try {
      const response = await callApi<UserLoginResponse>({
        method: HttpMethod.POST,
        url: USER_LOGIN,
        data: userObj as unknown as Record<string, unknown>,
      })
      commit("logIn", {
        email: userObj.email,
        password: userObj.password,
        token: response.data.token.access_token,
        refreshToken: response.data.token.refresh_token,
        username: response.data.username,
        user_id: response.data.id,
      } as StoredUser)
      toast.success("Успешно вошли!")
    } catch (err) {
      console.log(err)
      commit("logOut")
      throw new Error("Ошибка авторизации, проверьте пароль")
    }
  },
  async userRegister(_: ActionContext, userObj: RegisterCredentials) {
    try {
      await callApi<UserRegisterResponse>({
        method: HttpMethod.POST,
        url: USER_REGISTER,
        data: userObj as unknown as Record<string, unknown>,
      })
      toast.success(
        "Успешно зарегистрированы, а теперь войдите, используя свои данные"
      )
    } catch (err: any) {
      console.log(err)
      const apiError = err?.error?.error
      let message = "Неизвестная ошибка при регистрации"
      if (apiError?.code === "BAD_REQUEST") {
        if (apiError.message?.includes("{email}")) {
          message = "Эта почта уже занята"
        } else if (apiError.message?.includes("{username}")) {
          message = "Это имя пользователя уже занято"
        }
      } else if (apiError?.code === "VALIDATION_ERROR") {
        message = apiError.message
      }
      toast.error(message)
      throw new Error(message)
    }
  },
  logOut({ commit }: ActionContext) {
    commit("logOut")
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
