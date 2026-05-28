<template>
  <div class="basics-general">
    <p class="text">
      Каждая карта принадлежит одной из фракций. Фракции отмечаются разными
      цветами ромба с уроном для карт игрока или всей рамки для карт лидера.
      (Аналогично для карт врагов)
    </p>
    <filter-factions class="filter-factions" />
    <p class="section-title">В игре 4 фракции:</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Синие</span> - S - Soldiers (Солдаты)
      </li>
      <li class="list__item">
        <span class="list__term">Красные</span> - M - Monsters (Монстры)
      </li>
      <li class="list__item">
        <span class="list__term">Зеленые</span> А - Magics (Маги)
        <p class="text text--muted">
          Не спрашивайте, почему за магов отвечает буква А, исторически
          сложилось
        </p>
      </li>
      <li class="list__item">
        <span class="list__term">Серые</span> - N - Neutral (Нейтральные)
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import FilterFactions from "@/components/Pages/DeckbuildPage/FilterFactions.vue"

export default defineComponent({
  name: "CardsFactions",
  components: { FilterFactions },
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

.text--muted {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
}

.filter-factions {
  position: relative;
  padding: 15px 10px 10px;
}
</style>
