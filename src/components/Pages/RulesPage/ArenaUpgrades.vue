<template>
  <div class="basics-general">
    <p class="section-title">Прокачки арены</p>
    <p class="text">
      У арены свои прокачки. Они действуют только в текущем прохождении арены:
      сохраняются между его уровнями, но не переносятся в следующий заход.
    </p>
    <p class="section-title">Изменение колоды</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Заменить одну карту</span> — разовая покупка
        для замены карты. Её можно покупать несколько раз.
      </li>
      <li class="list__item">
        <span class="list__term">Взять фиксированную карту</span> — разовая
        покупка для получения конкретной карты. Её тоже можно покупать несколько
        раз.
      </li>
    </ul>
    <p class="section-title">Отдельные улучшения</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Карты в колоде</span> — увеличивают размер
        колоды арены.
      </li>
      <li class="list__item">
        <span class="list__term">Размер руки</span> — позволяет держать в руке
        больше карт.
      </li>
      <li class="list__item">
        <span class="list__term">Здоровье колоды</span> — увеличивает запас
        здоровья на арене.
      </li>
      <li class="list__item">
        <span class="list__term">Броня лидера</span> — улучшает броню лидера на
        арене.
      </li>
    </ul>
    <div class="highlight-block">
      <span class="highlight-block__label">На одно прохождение</span>
      <p class="highlight-block__text">
        Каждое улучшение покупается отдельно. После завершения текущего
        прохождения арены эти прокачки больше не действуют.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ArenaUpgrades",
})
</script>
