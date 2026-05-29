<template>
  <div class="basics-general">
    <p class="section-title">После нажатия кнопки ХОД:</p>
    <ul class="list">
      <li class="list__item">
        <span
          >Вначале срабатывают пассивные способности ваших карт/лидера от хода
          той картой, которой вы ходили
        </span>
      </li>
      <li class="list__item">
        <span>Затем срабатывают пассивные способности карт вашей руки </span>
      </li>
      <li class="list__item">
        <span>Затем срабатывает пассивная способность вашего лидера </span>
      </li>
      <li class="list__item">
        <span
          >Затем срабатывают пассивные способности карт в вашей колоде
        </span>
      </li>
      <li class="list__item">
        <span
          >Затем срабатывают пассивные способности карт в вашем сбросе
        </span>
      </li>
      <li class="list__item">
        <span>Затем по полю перемещаются враги </span>
      </li>
      <li class="list__item">
        <span>Затем срабатывают пассивные способности врагов на поле </span>
      </li>
      <li class="list__item">
        <span>Затем срабатывает пассивная способность лидера врагов </span>
      </li>
      <li class="list__item">
        <span
          >Затем срабатывают пассивные способности карт врагов в их колоде
        </span>
      </li>
      <li class="list__item">
        <span
          >Затем срабатывают пассивные способности карт врагов в их сбросе
        </span>
      </li>
      <li class="list__item">
        <span
          >Затем срабатывают пассивные способности карт в вашей колоде
        </span>
      </li>
      <li class="list__item">
        <span
          >Наконец, ход снова переходит вам! В процессе недоступна кнопка ХОД.
          Как только ход перешел к вам, кнопка снова активна, ход теперь ваш.
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameAfterMove",
})
</script>

<style scoped>
@import "./rules-shared.css";
</style>
