<template>
  <div class="basics-general">
    <p class="section-title">Эффекты на поле</p>
    <p class="text">
      Некоторые карты и лидеры стреляют не во врагов, а в пустые клетки поля. У
      них есть особый значок с изображением поля. Чтобы сыграть такую
      способность, потяните стрелку к пустой клетке: там появится положительный
      для игрока эффект.
    </p>
    <p class="section-title">Сколько действует эффект</p>
    <ul class="list">
      <li class="list__item">
        <span class="list__term">Число в круге</span> — количество ходов,
        которое действует эффект.
      </li>
      <li class="list__item">
        <span class="list__term">Число в звезде</span> — количество оставшихся
        срабатываний эффекта.
      </li>
    </ul>
    <p class="section-title">Когда срабатывает эффект</p>
    <p class="text">
      Эффект срабатывает, когда враг наступает на клетку с ним. Он также может
      сработать, если во время своего хода враг остаётся на этой клетке —
      например, когда ему некуда двигаться.
    </p>
    <div class="highlight-block">
      <span class="highlight-block__label">Описание эффекта</span>
      <p class="highlight-block__text">
        Нажмите на число эффекта на поле, чтобы прочитать, что он делает.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "GameEffects",
})
</script>
