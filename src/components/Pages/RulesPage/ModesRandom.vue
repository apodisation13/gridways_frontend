<template>
  <div class="basics-general">
    <ul class="list">
      <li class="list__item">
        <span
          >Каждый раз при заходе в этот режим - вам случайно создается набор
          уровней разных сложностей - 3 легких уровня, 3 средних, 3 сложных. В
          них случайное количество врагов из диапазона и случайный лидер врагов.
          (Перезайти на эту вкладку - и создадутся новые случайные уровни</span
        >
      </li>
      <li class="list__item">
        <span
          >Зажать пальцем/мышкой на уровне - и можно посмотреть, какие там
          враги</span
        >
      </li>
      <li class="list__item">
        <span
          >Двойной клик на уровне - и он выберется для игры (выбор
          запомнится)</span
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModesRandom",
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
