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
.basics-general {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-family: "Philosopher", serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #facf5d;
  margin-bottom: -8px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list__item {
  font-family: "Philosopher", serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 14px;
  position: relative;
}

.list__item::before {
  content: "–";
  position: absolute;
  left: 0;
  color: #facf5d;
}

.list__term {
  color: #facf5d;
  font-weight: 700;
}

.text {
  font-family: "Philosopher", serif;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
}
</style>
