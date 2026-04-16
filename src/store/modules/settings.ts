import { callApi, HttpMethod } from "@/lib/api/api"
import { USER_PREFERENCES } from "@/store/const/api_urls"
import { useToast } from "vue-toastification"
import { UserPreferencesResponse } from "@/types"

const toast = useToast()

interface SettingsState {
  theme: number
  avatar: string
  soundOn: boolean
  animationOn: boolean
  moveTimeout: number
}

interface ActionContext {
  getters: Record<string, any>
  commit: Function
}

const state: SettingsState = {
  theme: 1,
  avatar: "",
  soundOn: true,
  animationOn: true,
  moveTimeout: 1000,
}

const getters = {
  selectedTheme: (state: SettingsState) => state.theme,
  selectedAvatar: (state: SettingsState) => state.avatar,
  selectedMoveTimeout: (state: SettingsState) => state.moveTimeout,
  soundOn: (state: SettingsState) => state.soundOn,
  animationOn: (state: SettingsState) => state.animationOn,
}

const mutations = {
  set_theme(state: SettingsState, payload: number) {
    state.theme = payload
  },
  set_avatar(state: SettingsState, payload: string) {
    state.avatar = payload
  },
  switchSound(state: SettingsState) {
    state.soundOn = !state.soundOn
  },
  switchAnimation(state: SettingsState) {
    state.animationOn = !state.animationOn
  },
  setMoveTimeout(state: SettingsState, timeout: number) {
    state.moveTimeout = timeout
  },
  setPreferences(state: SettingsState, payload: UserPreferencesResponse) {
    state.theme = payload.data.theme
    state.avatar = payload.data.avatar
    state.soundOn = payload.data.sound_on
    state.animationOn = payload.data.animation_on
    state.moveTimeout = payload.data.move_timeout
  },
}

const actions = {
  async getUserPreferences({ getters, commit }: ActionContext) {
    const userId = getters["getUser"].user_id
    try {
      const response = await callApi<UserPreferencesResponse>({
        method: HttpMethod.GET,
        url: USER_PREFERENCES.replace("{userId}", userId),
      })
      commit("setPreferences", response.data)
    } catch (err) {
      console.log(err)
    }
  },

  async updateUserPreferences({ getters }: ActionContext) {
    const userId = getters["getUser"].user_id
    const body: UserPreferencesResponse = {
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
        method: HttpMethod.PATCH,
        url: USER_PREFERENCES.replace("{userId}", userId),
        data: body as unknown as Record<string, unknown>,
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
