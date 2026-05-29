<template>
  <div class="basics-general">
    <p class="section-title">В игре есть 4 типа карт:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Карты игрока</span>
      </li>
      <li class="list__item">
        <span class="list__term">Лидер игрока</span>
      </li>
      <li class="list__item">
        <span class="list__term">Карты врагов</span>
      </li>
      <li class="list__item">
        <span class="list__term">Лидер врагов</span>
      </li>
    </ul>
    <p class="text">
      Все карты игрока и лидеры игрока - доступны в разделе "СКЛАД" в меню снизу
      справа
    </p>
    <p class="text">
      Списка карт врагов как такового нету. Но можно просматривать врагов в
      конкректном уровне сезона или рандомном режиме (подробнее в разделе начало
      игры)
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "CardsGeneral",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
