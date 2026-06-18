<template>
  <div class="waiting-page">
    <div class="waiting-card">
      <div class="waiting-title global_text">Мультиплеер</div>

      <div v-if="status === 'connecting'" class="status-block">
        <div class="spinner" />
        <div class="status-text">Подключение...</div>
      </div>

      <div v-else-if="status === 'waiting'" class="status-block">
        <div class="spinner" />
        <div class="status-text">Ожидание напарника...</div>
      </div>

      <div v-else-if="status === 'matched'" class="status-block">
        <div class="status-text matched">Напарник найден! Запуск...</div>
      </div>

      <div v-else-if="status === 'error'" class="status-block">
        <div class="status-text error">{{ errorMessage }}</div>
      </div>

      <button v-if="status !== 'matched'" class="cancel-btn" @click="cancel">
        Отмена
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import { WS_MATCHMAKING } from "@/store/const/api_urls"

type Status = "connecting" | "waiting" | "matched" | "error"

export default defineComponent({
  name: "MultiplayerWaitingPage",
  data() {
    return {
      status: "connecting" as Status,
      errorMessage: "",
      ws: null as WebSocket | null,
    }
  },
  mounted() {
    this.connect()
  },
  beforeUnmount() {
    this.closeWs()
  },
  methods: {
    connect(): void {
      const token = this.$store.getters["getUser"]?.token
      if (!token) {
        this.status = "error"
        this.errorMessage = "Нет токена авторизации"
        return
      }

      this.ws = new WebSocket(`${WS_MATCHMAKING}?token=${token}`)

      this.ws.onopen = () => {
        this.status = "connecting"
      }

      this.ws.onmessage = (event: MessageEvent) => {
        let msg: Record<string, unknown>
        try {
          msg = JSON.parse(event.data)
        } catch {
          return
        }

        if (msg.event === "WAITING_FOR_OPPONENT") {
          this.status = "waiting"
        } else if (msg.event === "GAME_STARTED") {
          this.$store.commit("multi_set_session", {
            room_id: String(msg.room_id),
            role: msg.role as "host" | "guest",
            opponent_id: String(msg.opponent_id),
          })
          this.$store.commit("multi_set_ws", this.ws)
          this.ws = null // disown: beforeUnmount не закроет соединение
          this.status = "matched"
          this.$router.push("/multi/game")
        } else if (msg.event === "AUTH_ERROR") {
          this.status = "error"
          this.errorMessage = String(msg.detail ?? "Ошибка авторизации")
          this.closeWs()
        }
      }

      this.ws.onerror = () => {
        this.status = "error"
        this.errorMessage = "Ошибка соединения с сервером"
      }

      this.ws.onclose = (event: CloseEvent) => {
        if (this.status !== "matched" && this.status !== "error") {
          this.status = "error"
          this.errorMessage = `Соединение закрыто (${event.code})`
        }
      }
    },
    closeWs(): void {
      if (this.ws && this.ws.readyState < WebSocket.CLOSING) {
        this.ws.close()
      }
      this.ws = null
    },
    cancel(): void {
      this.closeWs()
      this.$store.commit("multi_reset")
      this.$router.push("/levelselect")
    },
  },
})
</script>

<style scoped>
.waiting-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  color: white;
}

.waiting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 48px 40px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 200, 50, 0.25);
  border-radius: 16px;
  min-width: 280px;
}

.waiting-title {
  font-size: 28px;
  text-transform: uppercase;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.status-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
}

.status-text.matched {
  color: #7eff9a;
}

.status-text.error {
  color: #ff6b6b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 200, 50, 0.2);
  border-top-color: rgba(255, 200, 50, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cancel-btn {
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 100, 100, 0.85);
  background: rgba(180, 40, 40, 0.18);
  border: 1px solid rgba(255, 80, 80, 0.4);
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.05em;
}

.cancel-btn:active {
  background: rgba(180, 40, 40, 0.35);
}
</style>
