<template>
  <div class="basics-general">
    <p class="section-title">Игра начинается со стадии раздачи карт в руку</p>
    <ul class="list">
      <li class="list__item">
        <span
          >В начале игры открывается окно с раздачей карт в руку. Вверху ваша
          рука - карты, которые случайным образом выдались вам в руку из вашей
          колоды. Внизу - оставшиеся карты в вашей колоде.
        </span>
      </li>
      <li class="list__item">
        <span
          >В руку вам раздается по умолчанию 5 карт - этот параметр можно
          прокачать в разделе Прокачки -> Игровые -> Размер руки
        </span>
      </li>
      <li class="list__item">
        <span
          >В розданной руке можно заменить до 3х карт. Для замены - двойной клик
          на карте в руке, которую хотите поменять. Вам придет случайная карта
          из тех, что остались в колоде.
        </span>
      </li>
      <li class="list__item">
        <span>Можно и не менять карты в стартовой руке </span>
      </li>
      <li class="list__item">
        <span>Кнопка закрыть - отправляет вас в игру </span>
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
