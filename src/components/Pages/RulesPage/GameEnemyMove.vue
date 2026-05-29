<template>
  <div class="basics-general">
    <p class="section-title">Враги имеют 4 типа ходов:</p>
    <ul class="list">
      <li class="list__item">
        <span>Ходить вниз - стрелка вниз </span>
      </li>
      <li class="list__item">
        <span>Стоять на месте - точка</span>
      </li>
      <li class="list__item">
        <span
          >Ходить направо - стрелка направо. При этом враг идет направо по
          строке, а затем перепрыгивает на строку ниже в ее левый край и
          продолжает движение направо</span
        >
      </li>
      <li class="list__item">
        <span
          >Прыгать на случайную клеточку - символ стрелок в разную сторону
        </span>
      </li>
    </ul>
    <div class="highlight-block">
      <span class="highlight-block__label">Порядок хода врагов</span>
      <p class="highlight-block__text">
        Враги начинают ходить по очереди: снизу вверх, справа налево
      </p>
    </div>
    <div class="highlight-block">
      <span class="highlight-block__label"
        >ВРАГ НАНОСИТ УРОН если ему некуда ходить!</span
      >
    </div>
    <p class="highlight-block__text">Когда наносит урон враг</p>
    <ul class="list">
      <li class="list__item">
        <span>Враг, который ходит вниз, уже достиг нижней строчки</span>
      </li>
      <li class="list__item">
        <span>Враг, который ходит вниз, под собой имеет другого врага</span>
      </li>
      <li class="list__item">
        <span
          >Враг, который ходит направо, имеет другого врага на той клетке, куда
          он должен был походить</span
        >
      </li>
      <li class="list__item">
        <span>Враг с точкой наносит урон на каждом ходу</span>
      </li>
      <li class="list__item">
        <span
          >Враг, который прыгает на случайную клетку, выбран ту клетку, которая
          уже занята</span
        >
      </li>
    </ul>
    <p class="highlight-block__text">
      Наносимый урон врага отнимается у жизней лидера/колоды игрока
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameEnemyMove",
})
</script>

<style scoped></style>
