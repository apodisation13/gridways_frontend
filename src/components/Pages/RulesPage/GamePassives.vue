<template>
  <div class="basics-general">
    <p class="section-title">Пассивные способности карт игрока могут быть:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">От хода какой-то картой</span> - например,
        лидер синих получает заряд каждый раз, когда вы играете специальную
        карту.
      </li>
      <li class="list__item">
        <span class="list__term">В руке</span> - автоматически будут срабатывать
        после окончания вашего хода, находясь в руке. В описании таких карт так
        и сказано - срабатывают когда карта находится в руке!
      </li>
      <li class="list__item">
        <span class="list__term">В колоде</span> - автоматически будут
        срабатывать после окончания вашего хода, находясь в колоде. В описании
        таких карт так и сказано - срабатывают когда карта находится в колоде!
      </li>
      <li class="list__item">
        <span class="list__term">В сбросе</span> - автоматически будут
        срабатывать после окончания вашего хода, находясь в сбросе. В описании
        таких карт так и сказано - срабатывают когда карта находится в сбросе!
      </li>
      <li class="list__item">
        <span class="list__term">Пассивка лидера</span> - автоматически будут
        срабатывать после окончания вашего хода, срабатывает для вашего лидера.
      </li>
    </ul>
    <p class="section-title">Таймеры пассивных способностей:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Часы без числа</span> - пассивная способность
        срабатывает КАЖДЫЙ ХОД
      </li>
      <li class="list__item">
        <span class="list__term">Часы с числом</span> - в описании сказано когда
        она срабатывает - или КАЖДЫЙ ход, пока таймер не равен нулю, или ТОЛЬКО
        тогда когда таймер равен 0.
      </li>
    </ul>
    <p class="section-title">Сброс таймера:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Сбрасывается</span> - если пассивная
        способность с числом и не срабатывает каждый ход, то она срабатывает
        только когда таймер равен 0. В описании может быть сказано, что таймер
        восстанавливается, и это значит, что пассивная спобоность сработает
        потом снова через значение таймера ходов.
      </li>
      <li class="list__item">
        <span class="list__term">Не сбрасывается</span> - таймер сработал один
        раз и всё, пассивная способность дальше не работает. Тогда в описании не
        будет записи о том, что таймер восстанавливается.
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GamePassives",
})
</script>

<style scoped>
.basics-general {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text {
  font-family: "Philosopher", serif;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
}

.text--muted {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
}

.highlight-block {
  border-left: 3px solid #facf5d;
  background: rgba(196, 155, 0, 0.1);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.highlight-block__label {
  font-family: "Philosopher", serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #facf5d;
}

.highlight-block__text {
  font-family: "Philosopher", serif;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
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
