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

<style scoped></style>
