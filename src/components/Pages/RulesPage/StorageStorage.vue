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
</style>
