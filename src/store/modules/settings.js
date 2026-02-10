import { callApi, GET, PATCH } from "@/lib/api/api"
import { USER_PREFERENCES } from "@/store/const/api_urls"
import { useToast } from "vue-toastification"

const toast = useToast()

const state = {
  theme: 1,
  avatar: "",
  soundOn: true,
  animationOn: true,
  moveTimeout: 1000,
}

const getters = {
  selectedTheme: state => state.theme,
  selectedAvatar: state => state.avatar,
  selectedMoveTimeout: state => state.moveTimeout,
  soundOn: state => state.soundOn,
  animationOn: state => state.animationOn,
}

const mutations = {
  set_theme(state, payload) {
    state.theme = payload
  },
  set_avatar(state, payload) {
    state.avatar = payload
  },
  switchSound(state) {
    state.soundOn = !state.soundOn
  },
  switchAnimation(state) {
    state.animationOn = !state.animationOn
  },
  setPreferences(state, payload) {
    state.theme = payload.data.theme
    state.avatar = payload.data.avatar
    state.soundOn = payload.data.sound_on
    state.animationOn = payload.data.animation_on
    state.moveTimeout = payload.data.move_timeout
  },
}

const actions = {
  async getUserPreferences({ getters, commit }) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi({
        method: GET,
        url: USER_PREFERENCES.replace("{userId}", userId),
      })
      commit("setPreferences", response.data)
    } catch (err) {
      console.log(err)
    }
  },
  async updateUserPreferences({ getters }) {
    const userId = getters["getUser"].user_id
    const body = {
      data: {
        sound_on: getters.soundOn,
        animation_on: getters.animationOn,
        move_timeout: getters.selectedMoveTimeout,
        avatar: getters.selectedAvatar,
        theme: getters.selectedTheme,
      },
    }
    try {
      await callApi({
        method: PATCH,
        url: USER_PREFERENCES.replace("{userId}", userId),
        data: body,
      })
      toast.success("Успешно записали ваши настройки")
    } catch (err) {
      console.log(err)
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
