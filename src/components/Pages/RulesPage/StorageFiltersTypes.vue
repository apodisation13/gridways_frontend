<template>
  <div class="basics-general">
    <p class="section-title">Фильтры и типы карт</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Фракции</span> — фильтр карт по фракциям. При
        выборе любой фракции, кроме нейтральных, нейтральные всё равно остаются
        в списке карт (потому что их можно положить в любую колоду). При сборе
        или изменении колоды - поле недоступно, так как этот фильтр применяется
        автоматически по выбранной фракции/фракции лидера
      </li>
      <li class="list__item">
        <span class="list__term">Тип</span> — среди карт игрока есть 2 типа: U -
        unit (отряд), S - special (специальная карта). Специальные карты слева
        имеют значок молнии. Они в целом мощнее, чем отряды, но у них 0 жизней.
        Это следует учитывать при сборе колоды. Некоторые карты имеют
        особенности игры в связи с их типом (читайте описание карт)
      </li>
      <li class="list__item">
        <span class="list__term">Цвет</span> — карты бывают трех цветов:
        бронзовые, серебряные и золотые.
      </li>
      <li class="list__item">
        <span class="list__term">Пассив</span> — фильтр карт с наличием или
        отсутствием пассивной способности. Пассивная способность карт -
        отображается значком часов (или часов с числом внутри). true - есть,
        false - нет.
      </li>
      <li class="list__item">
        <span class="list__term">Наличие</span> — 1 - у игрока в коллекции есть
        1 копия, 0 (нет у игрока в коллекции), 2 - есть 2 и более (удобно для
        уничтожения лишних карт и получения с них ресурсов). Изначально у игрока
        открыто 12 разных карт, из 10 создана базовая колода.
      </li>
      <li class="list__item">
        <span class="list__term">Добавлено недавно</span> — true - есть, false -
        нет. Фильтр для отображения новых карт, которые разработчики добавили
        недавно
      </li>
    </ul>
    <p class="text">
      Примененные фильтры можно сбросить как кнопкой сбросить фильтры в окне
      фильтров, так и нажатием крестика справа от кнопки фильтров, если какие-то
      фильтры применены. Если фильтры применены - кнопка фильтров имеет желтую
      точку.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "CardsFiltersTypes",
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
