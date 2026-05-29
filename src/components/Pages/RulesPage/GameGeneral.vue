<template>
  <div class="basics-general">
    <p class="section-title">Итого, чтобы поиграть:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Выбрать уровень</span> - вкладка РЕЖИМЫ (по
        умолчанию выбран будет 1й уровень 1го сезона)
      </li>
      <li class="list__item">
        <span class="list__term">Выбрать колоду</span> - использовать базовую
        колоду, доступную всегда, или создать свою на вкладке СКЛАД
      </li>
      <li class="list__item">
        <span class="list__term">Заплатить ресурсы</span> - в зависимости от
        уровня, колоды. Если не хватает - вкладка БОНУСЫ - покупка/создание
        ресурсов
      </li>
      <li class="list__item">
        <span class="list__term">Начать игру</span> - ух, погнали!
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameGeneral",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
