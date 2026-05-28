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
