<template>
  <div class="basics-general">
    <ul class="list">
      <li class="list__item">
        <span>Просмотр списка ваших колод доступен по кнопке колоды.</span>
      </li>
      <li class="list__item">
        <span
          >Каждую вашу колоду, кроме базовой, можно изменить или удалить
          соответствующим значком. Базовую нельзя ни удалить, ни изменить.</span
        >
      </li>
      <li class="list__item">
        <span
          >Колоды сортируются по дате изменения, базовая остается всегда в
          конце.</span
        >
      </li>
      <li class="list__item">
        <span
          >Изменение колоды - карты и лидер выстраиваются как при сборе колоды.
          Колоду можно изменять. Для сохранения - нажать изменить, для отмены -
          крестик слева вверху.</span
        >
      </li>
      <li class="list__item">
        <span>Удаление колоды - с окошком подтверждения.</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "CardsDeckEdit",
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
