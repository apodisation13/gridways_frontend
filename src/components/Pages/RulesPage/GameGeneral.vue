<template>
  <div class="basics-general">
    <p class="section-title">Итого, чтобы поиграть:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Выбрать уровень</span> - вкладка РЕЖИМЫ (по
        умолчанию выбран будет 1й уровень 1го сезона)
      </li>
      <li class="list__item">
        <span class="list__term">Выбрать колоду</span> - использовать базовую
        колоду, доступную всегда, или создать свою на вкладке СКЛАД
      </li>
      <li class="list__item">
        <span class="list__term">Заплатить ресурсы</span> - в зависимости от
        уровня, колоды. Если не хватает - вкладка БОНУСЫ - покупка/создание
        ресурсов
      </li>
      <li class="list__item">
        <span class="list__term">Начать игру</span> - ух, погнали!
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameGeneral",
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
