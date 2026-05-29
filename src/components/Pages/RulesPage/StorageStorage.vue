<template>
  <div class="basics-general">
    <p class="section-title">Страница склад</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Кнопка плюс</span> - добавить новую колоду.
        После нажатия меняет состояние на крестик - отменить создание новой
        колоды. Максимальное количество колод в начале игры - 2. Одна из них,
        базовая колода, уже создана и доступна. Максимальное количество колод
        можно так же прокачать в разделе Меню -> Прокачка -> Игровые ->
        Количество колод. Добавить колод больше, чем максимальный запас -
        нельзя.
      </li>
      <li class="list__item">
        <span class="list__term">Лидеры и основные</span> - переключатель между
        основными картами (выбрано по умолчанию) и лидерами.
      </li>
      <li class="list__item">
        <span class="list__term">Кнопка фильтров</span> - кнопка справа это
        кнопка фильтров, по каким параметрам можно отфильтровать карты.
        (информация в этом же разделе)
      </li>
      <li class="list__item">
        <span class="list__term">Поле карт (лидеров)</span> - поле с картами
        (скроллится по вертикали).
      </li>
      <li class="list__item">
        <span class="list__term">Кнопка колоды</span> - внизу кнопка колоды
        (информация в этом же разделе)
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "CardsStorage",
})
</script>

<style scoped></style>
