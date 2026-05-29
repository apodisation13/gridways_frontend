<template>
  <div class="basics-general">
    <ul class="list">
      <li class="list__item">
        <span>Кнопка ИГРА ведет на начало игры</span>
      </li>
      <li class="list__item">
        <span>Отображается выбранный уровень и выбранная колода</span>
      </li>
      <li class="list__item">
        <span
          >Выбранную колоду тут можно изменить - двойной клик на колоде или
          через кнопку колоды вниз и двойной клик по колоде там. Выбранный
          уровень - можно изменить на вкладке РЕЖИМЫ</span
        >
      </li>
      <li class="list__item">
        <span
          >Играть в уровень - для этого нужно заплатить необходимые ресурсы!
          Ресурсы рассчитываются в зависимости от типа режима игры, сложности и
          вашей колоды! Например, колода из золотых карт будет стоить больше
          ресурсов.</span
        >
      </li>
      <li class="list__item">
        <span
          >Если ресурсов не хватает - поиграть будет нельзя. В таком случае -
          попробуйте зайти на страницу бонусов (клик по ресурсам сверху) и
          купить/обменять/создать/продать ресурсы</span
        >
      </li>
      <li class="list__item">
        <span>
          Нажимаем начать - ресурсы списались, и вы попадете в игру!
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModesStartGame",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
