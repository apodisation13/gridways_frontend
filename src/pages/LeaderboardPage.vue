<template>
  <div>
    bbb
    <router-link :to="{ path: '/stats', query: { userId: 39 } }">
      Регистрация
    </router-link>
  </div>
</template>

<script>
export default {
  name: "LeaderboardPage",
}
</script>

<style scoped></style>
