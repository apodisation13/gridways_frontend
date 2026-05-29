<template>
  <div class="basics-general">
    <p class="section-title">В игре есть 4 режима:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Сезоны</span> - заранее подготовленные деревья
        сезонов и деревья уровней внутри каждого сезона
      </li>
      <li class="list__item">
        <span class="list__term">Рандом</span> - случайно распределенные враги
        по уровням
      </li>
      <li class="list__item">
        <span class="list__term">Рандом по количеству</span> - вы сами задаете,
        сколько врагов будет на уровне!
      </li>
      <li class="list__item">
        <span class="list__term">Арена</span> - в разработке!
      </li>
    </ul>
    <p class="text">Выбрать режим (и уровень) можно на вкладке РЕЖИМЫ.</p>
    <p class="text">Выбранный уровень отобразиться во вкладке ИГРА.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModesGeneral",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
