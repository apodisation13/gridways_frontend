import { useToast } from "vue-toastification"
import { USER_LOGIN, USER_REGISTER } from "@/store/const/api_urls"
import { callApi, POST } from "@/lib/api/api"

const toast = useToast()

const state = {
  user: JSON.parse(localStorage.getItem("user") || "{}"),
  is_logged_in: false,
  header: "",
  authorization: false, // флаг процесса авторизации, нужен для кнопки НАЧАТЬ на экране эмблемы
}

const getters = {
  getUser: state => state.user,
  isLoggedIn: state => state.is_logged_in,
  getHeader: state => state.header,
  getAuthState: state => state.authorization,
}

const mutations = {
  logIn(state, user) {
    state.user = user
    state.is_logged_in = true
    state.header = { headers: { Authorization: `Bearer ${state.user.token}` } }
    localStorage.setItem("user", JSON.stringify(user))
  },
  logOut(state) {
    state.is_logged_in = false
    state.header = ""
    state.user = ""
    localStorage.removeItem("user")
    // FIXME: здесь должен быть запрос на очистку токена?
  },
  // устанавливаем флаг процесса проверки загрузки
  set_auth_state(state, payload) {
    state.authorization = payload
  },
}

const actions = {
  async checkAuth({ getters, dispatch, commit }) {
    const user = getters["getUser"]
    if (!user.email || !user.password) {
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
      })
    } catch (err) {
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
  async userLogin({ commit }, userObj) {
    try {
      const response = await callApi({
        method: POST,
        url: USER_LOGIN,
        data: userObj,
      })
      commit("logIn", {
        email: userObj.email,
        password: userObj.password,
        token: response.data.token.access_token,
        username: response.data.username,
        user_id: response.data.id,
      })
      toast.success("Успешно вошли!")
    } catch (err) {
      commit("logOut")
      throw new Error("Ошибка авторизации, проверьте пароль")
    }
  },
  // eslint-disable-next-line no-unused-vars
  async userRegister({ commit }, userObj) {
    try {
      await callApi({
        method: POST,
        url: USER_REGISTER,
        data: userObj,
      })
      toast.success(
        "Успешно зарегистрированы, а теперь войдите, используя свои данные"
      )
      // return response.data
    } catch (err) {
      toast.error("Произошла ошибка!")
      throw new Error("Ошибка регистрации")
    }
  },
  logOut({ commit }) {
    commit("logOut")
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
