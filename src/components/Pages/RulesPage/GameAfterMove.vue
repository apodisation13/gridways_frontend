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
