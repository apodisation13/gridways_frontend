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

<style scoped></style>
