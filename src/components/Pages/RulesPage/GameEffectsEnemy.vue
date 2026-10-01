<template>
  <div class="basics-general">
    <p class="section-title">Эффекты у врагов</p>
    <p class="text">
      Враги тоже могут создавать эффекты на поле. Эти эффекты негативны для
      игрока: их числа отображаются на красном фоне.
    </p>
    <p class="section-title">Откуда появляются эффекты</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Пассивки врагов</span> — эффект появляется при
        срабатывании соответствующей пассивной способности врага.
      </li>
      <li class="list__item">
        <span class="list__term">Завещания врагов</span> — эффект создаётся
        после смерти врага, если это указано в его завещании.
      </li>
    </ul>
    <p class="text">
      Как и положительные эффекты, они срабатывают, когда враг наступает на
      клетку с эффектом или остаётся на ней во время своего хода. Число в круге
      показывает оставшиеся ходы, а число в звезде — оставшиеся срабатывания.
    </p>
    <div class="highlight-block">
      <span class="highlight-block__label">Узнайте, чем опасен эффект</span>
      <p class="highlight-block__text">
        Нажмите на число на красном фоне, чтобы открыть описание эффекта.
        Источник эффекта можно узнать из описания пассивки или завещания врага.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameEffectsEnemy",
})
</script>
