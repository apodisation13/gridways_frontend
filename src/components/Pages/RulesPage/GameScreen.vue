<template>
  <div class="basics-general">
    <p class="section-title">Игровой экран состоит из следующих частей:</p>
    <ul class="list">
      <li class="list__item">
        <span>Поле - размером 3на4 клетки </span>
      </li>
      <li class="list__item">
        <span>Внизу ваша рука </span>
      </li>
      <li class="list__item">
        <span>Правая часть экрана </span>
      </li>
    </ul>
    <p class="section-title">В правой части экрана находится:</p>
    <ul class="list">
      <li class="list__item">
        <span>Лидер врага </span>
      </li>
      <li class="list__item">
        <span>Кнопки колоды врагов и кладбища врагов </span>
      </li>
      <li class="list__item">
        <span
          >Место для кнопки взятия двух карт из колоды игрока и пропуска хода
        </span>
      </li>
      <li class="list__item">
        <span
          >Кпопка ХОД для перехода хода к противнику и/или пропуску хода игрока
        </span>
      </li>
      <li class="list__item">
        <span
          >Кнопки колоды игрока и кладбища карт игрока (сброшенных карт)
        </span>
      </li>
      <li class="list__item">
        <span>Лидер игрока </span>
      </li>
      <li class="list__item">
        <span
          >Жизни лидера (колоды) игрока (поверх них может появляться так же
          броня игрока)
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameRedraw",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
