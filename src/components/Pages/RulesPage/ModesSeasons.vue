<template>
  <div class="basics-general">
    <ul class="list">
      <li class="list__item">
        <span
          >Сезоны представляют собой заранее подготовленный набор уровней</span
        >
      </li>
      <li class="list__item">
        <span
          >Проходя один сезон целиком - вы открываете следующие за ним по линиям
          сезоны</span
        >
      </li>
      <li class="list__item">
        <span
          >Двойной клик на сезоне - зайти в него. В закрытый сезон можно зайти,
          посмотреть его уровни, но поиграть нельзя.</span
        >
      </li>
      <li class="list__item">
        <span
          >Статистика сезона и информация о нем - соответствующие кнопки</span
        >
      </li>
      <li class="list__item">
        <span
          >Внутри сезона - дерево уровней, проходя уровень - открываются все
          уровни по линиям связей</span
        >
      </li>
      <li class="list__item">
        <span>
          Двойной клик на уровне - и он выберется для игры (выбор запомнится).
          Закрытый уровень выбрать нельзя.
        </span>
      </li>
      <li class="list__item">
        <span
          >Просмотр уровня - зажать на уровне пальцем/мышкой. Там можно
          посмотреть список врагов этого уровня и лидера врагов. Зажать
          пальцем/мышкой на карте врага/лидера врагов - откроется окно с
          подробной информацией о нем</span
        >
      </li>
      <li class="list__item">
        <span
          >По дереву уровней можно идти в любом доступном и открытом
          направлении! не обязательно проходить уровни подряд по их номеру -
          можно заходить с разных сторон, главное - двигаться по линиям</span
        >
      </li>
      <li class="list__item">
        <span>Уровни можно проходить и повторно, сколько угодно раз</span>
      </li>
      <li class="list__item">
        <span>У каждого уровня есть сложность - в звездочках</span>
      </li>
      <li class="list__item">
        <span>Свечение уровня - по цвету фракции лидера врагов</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModesSeasons",
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
