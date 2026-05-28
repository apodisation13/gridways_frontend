<template>
  <div class="basics-general">
    <p class="section-title">В игре есть 4 режима:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Сезоны</span> - заранее подготовленные деревья
        сезонов и деревья уровней внутри каждого сезона
      </li>
      <li class="list__item">
        <span class="list__term">Рандом</span> - случайно распределенные враги
        по уровням
      </li>
      <li class="list__item">
        <span class="list__term">Рандом по количеству</span> - вы сами задаете,
        сколько врагов будет на уровне!
      </li>
      <li class="list__item">
        <span class="list__term">Арена</span> - в разработке!
      </li>
    </ul>
    <p class="text">Выбрать режим (и уровень) можно на вкладке РЕЖИМЫ.</p>
    <p class="text">Выбранный уровень отобразиться во вкладке ИГРА.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModesGeneral",
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
