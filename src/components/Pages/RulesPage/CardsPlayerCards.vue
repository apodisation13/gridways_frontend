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

<style scoped></style>
