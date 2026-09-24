<template>
  <div>
    <div v-if="!isLoggedIn" class="not_logged_in">
      <div class="global_text not_logged_in__text">
        Воспользуйтесь ссылками:
        <router-link :to="{ path: '/login', query: { registration: 'true' } }">
          Регистрация
        </router-link>
        /
        <router-link :to="{ path: '/login', query: { registration: 'false' } }">
          Вход
        </router-link>
      </div>
    </div>
    <div v-if="isLoggedIn" class="not_logged_in">
      <div class="global_text not_logged_in__text">
        Добро пожаловать, {{ username }}
      </div>
    </div>
    <div class="news">
      <news-list />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useToast } from "vue-toastification"

import NewsList from "@/components/Pages/MainPage/NewsList.vue"

export default defineComponent({
  components: {
    NewsList,
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters["isLoggedIn"]
    },
    username(): string {
      return this.$store.state.login.user.username
    },
  },
  mounted() {
    if (this.$store.getters["getGuestWelcomeState"]) {
      this.$store.commit("setGuestWelcomeState", false)
      this.toast.info("Зарегистрируйтесь или войдите", { timeout: 3000 })
    }
  },
})
</script>

<style scoped>
.not_logged_in {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 45px;
  width: 100%;
  min-height: 76px;
}

.not_logged_in__text {
  width: min(82%, 440px);
  height: auto;
  box-sizing: border-box;
  padding: 10px 16px;
  color: #fff0c4;
  font-size: 20px;
  line-height: 1.4;
  background: rgba(12, 20, 30, 0.58);
  border: 1px solid rgba(255, 225, 160, 0.26);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 245, 215, 0.1),
    0 4px 14px rgba(0, 0, 0, 0.34);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(3px);
}

.not_logged_in__text a {
  color: #ffdc83;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgba(255, 220, 131, 0.75);
  text-underline-offset: 3px;
  margin-top: 5px;
  display: inline-block;
}

.news {
  width: 100%;
  height: 50vh;
}
</style>
