<template>
  <div class="basics-general">
    <p class="section-title">План релиза</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Правила</span> — полное описание
        (интерактивное) всех возможностей игры
      </li>
      <li class="list__item">
        <span class="list__term">Арена</span> — новый режим игры, где колоды
        собираются из рандомных карт на выбор
      </li>
      <li class="list__item">
        <span class="list__term">Награды за сезоны</span> — уникальные награды
        за пройденные сезоны
      </li>
      <li class="list__item">
        <span class="list__term">Совместный режим</span> — тут пока есть идея
        совместного режима на два игрока с целью перебить всех врагов, и второе
        - на то, кто перебьет больше (какие-то варианты очков)
      </li>
      <li class="list__item">
        <span class="list__term">Новые карты, враги, сезоны</span> — регулярное
        добавление новых карт, врагов, сезонов, изменение текущих
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "BasicsRoadmap",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
