<template>
  <div class="basics-general">
    <p class="section-title">Соберите колоду для арены</p>
    <p class="text">
      На арене вы собираете новую колоду из 12 карт. Каждый раз вам предлагают
      три случайные карты: выберите одну, которую хотите добавить себе.
    </p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Три на выбор</span> — изучите способности
        предложенных карт и выберите одну из них.
      </li>
      <li class="list__item">
        <span class="list__term">Одна в колоду</span> — выбранная карта
        добавляется в вашу колоду, затем появляется следующая тройка.
      </li>
      <li class="list__item">
        <span class="list__term">Всего 12 карт</span> — повторяйте выбор, пока
        колода не будет собрана.
      </li>
    </ul>
    <div class="highlight-block">
      <span class="highlight-block__label">Следующий шаг — лидер</span>
      <p class="highlight-block__text">
        После сбора колоды вам предложат трёх лидеров. Выберите одного для
        прохождения арены.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ArenaDeck",
})
</script>
