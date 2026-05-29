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

<style scoped></style>
