<template>
  <div>
    <div class="not_logged_in" v-if="!isLoggedIn">
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
    <div class="not_logged_in" v-if="isLoggedIn">
      <div class="global_text not_logged_in__text">
        Добро пожаловать, {{ username }}
      </div>
    </div>
    <div class="news">
      <news-list />
    </div>
  </div>
</template>

<script>
import NewsList from "@/components/Pages/MainPage/NewsList.vue"

export default {
  computed: {
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"]
    },
    username() {
      return this.$store.state.login.user.username
    },
  },
  components: {
    NewsList,
  },
}
</script>

<style scoped>
.not_logged_in {
  display: flex;
  justify-content: center;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 45px;
  width: 100%;
  height: 6.5vh;
}

.not_logged_in__text {
  width: 70%;
  height: 90px;
  font-size: 22px;
  background: var(--six-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.not_logged_in__text a {
  text-decoration: underline;
  text-decoration-color: #b07b15;
  margin-top: 5px;
  display: inline-block;
}

.news {
  width: 100%;
  height: 50vh;
}
</style>
