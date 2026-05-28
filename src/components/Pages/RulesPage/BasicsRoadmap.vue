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
