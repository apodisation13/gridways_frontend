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
