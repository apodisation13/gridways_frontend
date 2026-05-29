<template>
  <div class="basics-general">
    <p class="text">
      Почти все ресурсы можно купить за игровые деньги, продать за игровые
      деньги, создать из других ресурсов, уничтожить/перемолоть, получив за это
      ресурсы
    </p>
    <p class="text">
      Осуществляется это на странице бонусов (клик по ресурсам, клик по большому
      меню ресурсов
    </p>
    <p class="text">
      На странице бонусов 3 вкладки - награды, для карт, для уровней
    </p>
    <p class="text">
      Награды - тут можно открыть бочки, коробки и ключи. Бочка - 3 карты из
      которых выбрать одну. Яркая бочка - 5 карт, из которых выбрать одну.
      Коробка - 3 карты, все 3 из которых достаются игроку. Ключ - 3 награды, из
      которых можно выбрать одну.
    </p>
    <p class="text">
      Покупка/продажа - всегда меняет деньги на ресурс. Крафт - всегда требует
      других ресурсов и денег. Уничтожение - всегда требует немного денег, а
      получает другие ресурсы
    </p>
    <p class="text">
      В случае крафта почти всегда можно выбрать схему, из чего крафтить.
    </p>
    <p class="text">
      Поскольку на все ресурсы есть лимит (через прокачку) - больше чем этот
      лимит иметь ресурсов нельзя. Прокачивайте эти лимиты и увеличивайте их.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ResBonuses",
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
