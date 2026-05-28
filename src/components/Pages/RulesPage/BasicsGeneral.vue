<template>
  <div class="basics-general">
    <p class="text">
      Gridways — карточная игра, в которой игрок сражается с наступающими
      волнами противников.
    </p>
    <p class="text">
      Игра требует выхода в интернет, но не является сетевой, в смысле игрок
      играет только против компьютера (пока).
    </p>

    <div class="highlight-block">
      <span class="highlight-block__label">Цель игры</span>
      <p class="highlight-block__text">
        Выигрывать игры, зарабатывать ресурсы, прокачивать свои возможности,
        открывать новые карты, собирать новые колоды, выигрывать еще больше игр,
        разных режимов итп
      </p>
    </div>

    <p class="text">
      Игра абсолютно бесплатна! В ней нет обязательных покупок, назойливых
      реклам. Всё можно проходить бесплатно. Однако :) есть секция магазин, в
      которой вы можете по желанию купить ресурсы, особенно если игра вам
      понравилась :)
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "BasicsGeneral",
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
