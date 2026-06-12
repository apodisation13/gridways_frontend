import type { Enemy, EnemyLeader } from "@/types"

export interface MultiState {
  room_id: string
  role: "host" | "guest" | ""
  opponent_id: string
  initial_enemies: Enemy[]
  initial_field: (Enemy | "")[]
  initial_enemy_leader: EnemyLeader | null
  ws: WebSocket | null

  maxEnemies: Record<string, number>
}

const state: MultiState = {
  room_id: "",
  role: "",
  opponent_id: "",
  initial_enemies: [],
  initial_field: Array(12).fill("") as (Enemy | "")[],
  initial_enemy_leader: null,
  ws: null,
  maxEnemies: { min: 0, max: 0 },
}

const mutations = {
  multi_set_session(
    state: MultiState,
    payload: { room_id: string; role: "host" | "guest"; opponent_id: string }
  ) {
    state.room_id = payload.room_id
    state.role = payload.role
    state.opponent_id = payload.opponent_id
  },
  multi_set_initial_state(
    state: MultiState,
    payload: {
      enemies: Enemy[]
      field: (Enemy | "")[]
      enemy_leader: EnemyLeader
    }
  ) {
    state.initial_enemies = payload.enemies
    state.initial_field = payload.field
    state.initial_enemy_leader = payload.enemy_leader
  },
  multi_set_ws(state: MultiState, ws: WebSocket | null) {
    state.ws = ws
  },
  multi_reset(state: MultiState) {
    if (state.ws && state.ws.readyState < WebSocket.CLOSING) {
      state.ws.close()
    }
    state.room_id = ""
    state.role = ""
    state.opponent_id = ""
    state.initial_enemies = []
    state.initial_field = Array(12).fill("")
    state.initial_enemy_leader = null
    state.ws = null
  },
  setMaxEnemies(state: MultiState, payload: Record<string, number>) {
    state.maxEnemies = payload
  },
}

const getters = {
  maxEnemies: (state: MultiState) => state.maxEnemies,
}

export default { state, mutations, getters }
