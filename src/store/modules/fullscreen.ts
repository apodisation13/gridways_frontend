interface FullscreenState {
  isStarted: boolean
}

const state: FullscreenState = {
  isStarted: false,
}

const mutations = {
  gameStarting(state: FullscreenState) {
    state.isStarted = true
  },
}

export default {
  state,
  mutations,
}
