<template>
  <div class="basics-general">
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Жизни</span> — жизни карты - нужны только для
        сбора колоды - жизни колоды это сумма жизней всех карт в ней (и лидера)
      </li>
      <li class="list__item">
        <span class="list__term">Урон</span> — справа в ромбе - сколько урона
        может нанести карта
      </li>
      <li class="list__item">
        <span class="list__term">Заряды</span> — нижнее правое число - сколько
        зарядов имеет карта. 1 ход - 1 заряд.
      </li>
      <li class="list__item">
        <span class="list__term">Специальная карта</span> — специальная карта -
        значок молнии слева вверху
      </li>
      <li class="list__item">
        <span class="list__term">Наличие</span> — цифра в треуголнике внизу
        карты
      </li>
      <li class="list__item">
        <span class="list__term">Пассивная способость</span> — отображается
        значком часов (или часов с числом внутри).
      </li>
      <li class="list__item">
        <span class="list__term">Значок способности</span> — у некоторых карт
        есть дополнительный значок их способности - например значки лечения
        (зеленый прямоугольник), значок урона по всем, по строке, по столбцу,
        блока, яда, итп итп.
      </li>
    </ul>
    <p class="text">
      Чтобы войти в режим просмотра описания карты - нужно на карте зажать и
      подержать пальцем/мышкой (или правая клавиша мыши на компе) - откроется
      карта на весь экран со всеми описаниями. В них можно переключать между
      основной спобностью и пассивной способностью.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "CardsPlayerCards",
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
