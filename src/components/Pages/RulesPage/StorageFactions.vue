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
@import "./rules-shared.css";

.filter-factions {
  position: relative;
  padding: 15px 10px 10px;
}
</style>
