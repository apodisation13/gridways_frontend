<template>
  <div class="basics-general">
    <p class="section-title">
      Некоторые карты могут переигрывать другие карты:
    </p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Значок</span> - как правило, такие карты имеют
        синий значок с изображением карт
      </li>
      <li class="list__item">
        <span class="list__term">Из разных мест</span> - переигрывать можно
        карты из сброса, из колоды, даже из сброса врагов! Читайте описания
        карт, чтобы понять, что они делают!
      </li>
    </ul>
    <p class="section-title">Переигрывание карт:</p>
    <p class="text">
      При игре в какую-то дополнительную карту, открывается окно с выбором
      карты, которую можно сыграть. Или выбором допустимых карт, с которыми
      можно взаимодействовать. Двойной клик по карте - приведет в действие
      способность. Исходная способность, как правило, написана в открывшемся
      окне.
    </p>
    <p class="text">
      Если переигрывается какая-то дополнительная карта - то она появляется на
      месте кнопки ХОД, закрывая ее! В таком случае - нужно тянуть за эту карту
      и целиться во врагов, как обычно, ход будет этой картой!
    </p>
    <p class="text">
      Такие цепочки можно продлять: например одна карта играет другую из сброса,
      та играет какую-то из колоды, та увеличивает какой-то карте в руке урон
      итп итп
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameAdditionalCards",
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
