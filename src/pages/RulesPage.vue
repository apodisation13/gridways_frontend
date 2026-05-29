<template>
  <div class="rules-page">
    <div class="rules-page__title">
      <h1 class="global_text rules-page__heading">Правила</h1>
    </div>

    <div
      ref="catScroll"
      class="chips-row"
      :class="{ 'chips-row--dragging': dragState?.ref === 'catScroll' }"
      @wheel.prevent="onWheel($event, 'catScroll')"
      @mousedown="onMouseDown($event, 'catScroll')"
    >
      <button
        v-for="cat in RULES"
        :key="cat.id"
        class="chip"
        :class="{ 'chip--active': activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>

    <div
      ref="subScroll"
      class="chips-row chips-row--sub"
      :class="{ 'chips-row--dragging': dragState?.ref === 'subScroll' }"
      @wheel.prevent="onWheel($event, 'subScroll')"
      @mousedown="onMouseDown($event, 'subScroll')"
    >
      <button
        v-for="sub in currentSubs"
        :key="sub.id"
        class="chip chip--sm"
        :class="{ 'chip--active': activeSub === sub.id }"
        @click="activeSub = sub.id"
      >
        {{ sub.label }}
      </button>
    </div>

    <div class="rules-content">
      <component :is="currentComponent" v-if="currentComponent" />
      <p v-else class="rules-content__text global_text">{{ currentContent }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import type { Component } from "vue"
import { defineComponent } from "vue"

import BasicsGeneral from "@/components/Pages/RulesPage/BasicsGeneral.vue"
import BasicsRoadmap from "@/components/Pages/RulesPage/BasicsRoadmap.vue"
import CardsEnemyCards from "@/components/Pages/RulesPage/CardsEnemyCards.vue"
import CardsPlayerCards from "@/components/Pages/RulesPage/CardsPlayerCards.vue"
import GameAdditionalCards from "@/components/Pages/RulesPage/GameAdditionalCards.vue"
import GameAfterMove from "@/components/Pages/RulesPage/GameAfterMove.vue"
import GameEnemyMove from "@/components/Pages/RulesPage/GameEnemyMove.vue"
import GameGeneral from "@/components/Pages/RulesPage/GameGeneral.vue"
import GameMove from "@/components/Pages/RulesPage/GameMove.vue"
import GamePassives from "@/components/Pages/RulesPage/GamePassives.vue"
import GamePassivesEnemy from "@/components/Pages/RulesPage/GamePassivesEnemy.vue"
import GameRedraw from "@/components/Pages/RulesPage/GameRedraw.vue"
import GameScreen from "@/components/Pages/RulesPage/GameScreen.vue"
import ModesGeneral from "@/components/Pages/RulesPage/ModesGeneral.vue"
import ModesRandom from "@/components/Pages/RulesPage/ModesRandom.vue"
import ModesSeasons from "@/components/Pages/RulesPage/ModesSeasons.vue"
import ModesStartGame from "@/components/Pages/RulesPage/ModesStartGame.vue"
import ResBonuses from "@/components/Pages/RulesPage/ResBonuses.vue"
import StorageDeck from "@/components/Pages/RulesPage/StorageDeck.vue"
import StorageDeckEdit from "@/components/Pages/RulesPage/StorageDeckEdit.vue"
import StorageFactions from "@/components/Pages/RulesPage/StorageFactions.vue"
import StorageFiltersTypes from "@/components/Pages/RulesPage/StorageFiltersTypes.vue"
import StorageGeneral from "@/components/Pages/RulesPage/StorageGeneral.vue"
import StorageStorage from "@/components/Pages/RulesPage/StorageStorage.vue"

interface SubCategory {
  id: string
  label: string
  content?: string
  component?: Component
}

interface RulesCategory {
  id: string
  label: string
  subs: SubCategory[]
}

const RULES: RulesCategory[] = [
  {
    id: "basics",
    label: "Основы",
    subs: [
      { id: "basics-general", label: "Общее", component: BasicsGeneral },
      {
        id: "basics-roadmap",
        label: "Roadmap",
        component: BasicsRoadmap,
      },
    ],
  },
  {
    id: "storage",
    label: "Склад",
    subs: [
      { id: "storage-general", label: "Общее", component: StorageGeneral },
      {
        id: "storage-storage",
        label: "Склад",
        component: StorageStorage,
      },
      {
        id: "storage-factions",
        label: "Фракции",
        component: StorageFactions,
      },
      {
        id: "storage-deck",
        label: "Сбор колоды",
        component: StorageDeck,
      },
      {
        id: "storage-deck_edit",
        label: "Изменение колод",
        component: StorageDeckEdit,
      },
      {
        id: "storage-filters",
        label: "Фильтры (типы карт)",
        component: StorageFiltersTypes,
      },
    ],
  },
  {
    id: "cards",
    label: "Карты",
    subs: [
      {
        id: "cards-player-cards",
        label: "Параметры карт игрока",
        component: CardsPlayerCards,
      },
      {
        id: "cards-enemy-cards",
        label: "Параметры карт врагов",
        component: CardsEnemyCards,
      },
    ],
  },
  {
    id: "modes",
    label: "Режимы/Начало игры",
    subs: [
      {
        id: "modes-general",
        label: "Общее",
        component: ModesGeneral,
      },
      {
        id: "modes-seasons",
        label: "Сезоны",
        component: ModesSeasons,
      },
      {
        id: "modes-random",
        label: "Рандом",
        component: ModesRandom,
      },
      {
        id: "modes-random-n",
        label: "Рандом по количеству",
        content:
          "А тут просто выберете число от 5 до 200 и нажмите генерировать, а потом подвердите выбор уровня двойным кликом по нему",
      },
      {
        id: "modes-arena",
        label: "Арена",
        content: "Арена пока не реализована, обновим правила позже",
      },
      {
        id: "modes-start-game",
        label: "Начало игры",
        component: ModesStartGame,
      },
    ],
  },
  {
    id: "game",
    label: "Игра",
    subs: [
      { id: "game-general", label: "Общее", component: GameGeneral },
      {
        id: "game-redraw",
        label: "Раздача карт",
        component: GameRedraw,
      },
      { id: "game-screen", label: "Игровой экран", component: GameScreen },
      { id: "game-move", label: "Ход", component: GameMove },
      {
        id: "game-after-move",
        label: "Переход хода",
        component: GameAfterMove,
      },
      { id: "game-enemy-move", label: "Ход врага", component: GameEnemyMove },
      { id: "game-passives", label: "Пассивки", component: GamePassives },
      {
        id: "game-enemy-passives",
        label: "Пассивки врагов",
        component: GamePassivesEnemy,
      },
      {
        id: "game-enemy-deathwish",
        label: "Завещания",
        content:
          "Завещания срабатывают для врагов, когда они умерли. О способности завещания можно прочитать в информации о враге",
      },
      {
        id: "game-enemy-shield",
        label: "Щит врага",
        content:
          "Если у врага есть щит, то первый урон, который ему будет нанесен, вначале собьет его щит",
      },
      {
        id: "game-player-armor",
        label: "Броня игрока",
        content:
          "Некоторые способности карт игрока и лидера добавляют колоде (лидеру) - броню. Броня отображается " +
          "поверх здоровья в единицах. Максимальный размер брони - определяется прокачкой раздела броня. Урон, " +
          "который наносят враги - вначале будет сбивать 1 единицу брони за каждое попадание урона от врага",
      },
      {
        id: "game-additional-cards",
        label: "Доп карты",
        component: GameAdditionalCards,
      },
      {
        id: "game-win-lose",
        label: "Выигрыш и проигрыш",
        content:
          "За выигрыш - вы получаете ресурсы (в зависимости от уровня и сложности), а так же ключи. За простой уровень - 1 ключ," +
          "за нормальный - 2, за сложный 3. Ключи можно открыть на странице бонусов. " +
          "За проигрыш - ничего :) При выигрыше - вам открываются следующие уровни за текущим по стрелкам." +
          "Если весь сезон завешен - открываются новые сезоны по стрелкам.",
      },
    ],
  },
  {
    id: "resources",
    label: "Ресурсы",
    subs: [
      {
        id: "res-general",
        label: "Общее",
        content:
          "Ваши ресурсы всегда отобржаются в правой верхней части экрана. " +
          "Клик на них - открывает большое меню ресурсов, клик там - переход на страницу бонусов. " +
          "Все ресурсы (кроме ключей) - имеют максимальный запас (некоторые изначально 0). " +
          "Все запасы можно прокачивать на странице Прокачка ",
      },
      {
        id: "res-money",
        label: "Деньги",
        content:
          "Деньги нужно практически для всего - старт уровня, крафт карт, преобразование ресурсов, покупка итп",
      },
      {
        id: "res-keys",
        label: "Ключи",
        content:
          "Ключи выигрываются в уровнях. Легкий уровень - награда 1 ключ, нормальный - 2, сложный - 3." +
          "Каждый ключ содержит три случайные награды на выбор! Выбрать можно из них только одну.",
      },
      {
        id: "res-stones",
        label: "Камни",
        content:
          "Камни можно получить, проходя уровни. 1 убитый враг = 1 камень, по цвету. " +
          "Так же можно получить камни из слитков, если перемолоть (уничтожить) слитки." +
          "Камни нужны для создания карт, крафта ресурсов и прокачек",
      },
      {
        id: "res-ingots",
        label: "Слитки",
        content:
          "Слитки создаются из камней или выпадают из ключей. " +
          "Они нужны для создания карт и прокачек",
      },
      {
        id: "res-scraps",
        label: "Тряпки",
        content: "Тряпки нужны для создания карт, прокачек и крафта ресурсов",
      },
      {
        id: "res-crops-wood",
        label: "Солома/Дерево",
        content:
          "Солома и дерево нужны для игры в уровни, для прокачек, для создания ресурсов",
      },
      {
        id: "res-silk",
        label: "Шелк",
        content:
          "Золотой шёлк нужен для игры в сложные уровни, а так же для прокачек и создания ресурсов",
      },
      {
        id: "res-kegs",
        label: "Бочки",
        content:
          "Бочки содержат внутри карты!" +
          " Темная бочка содержит 3 карты на выбор, из которых можно выбрать одну, " +
          "а светлая бочка содержит 5 карт на выбор, из которых можно выбрать одну",
      },
      {
        id: "res-chests",
        label: "Коробки",
        content:
          "Зеленая коробка - содержит в себе 3 карты, и все 3 эти карты становятся доступны игроку!",
      },
      {
        id: "res-gem",
        label: "Редкий камень",
        content:
          "Редкий камень выпадает только из ключей и используется для крафта любой карты/лидера. " +
          "При этом другие ресурсы не нужны. 1 камень - 1 любая созданная карта",
      },
      {
        id: "res-bonuses",
        label: "Крафт ресурсов/Бонусы",
        component: ResBonuses,
      },
    ],
  },
  {
    id: "upgrades",
    label: "Прокачка",
    subs: [
      {
        id: "upg-general",
        label: "Общее",
        content:
          "Почти всё в игре можно прокачать! Прокачка делится на 3 раздела:" +
          "Ресурсы, Игровые и Настройки",
      },
      {
        id: "upg-resources",
        label: "Ресурсы",
        content:
          "Здесь можно прокачивать максимальный размер ваших хранимых ресурсов. " +
          "Осторожно - у каких-то ресурсов значение по умолчанию 0 - то есть вы не сможете иметь этот ресурс," +
          "пока не прокачаете хотя бы на 1 уровень. Желтыми линями показано то, что вы уже прокачали. Зелеными - " +
          "то, что можно прокачать сейчас (у вас хватает ресурсов). Серым - то что не прокачано и нельзя прокачать." +
          "В каждом разделе есть кнопка все уровни, чтобы посмотреть, сколько нужно ресурсов на каком уровне",
      },
      {
        id: "upg-game",
        label: "Игровые",
        content:
          "Это раздел, влияющий на игровые параметры! Такие как:" +
          "максимальное количество колод, жизней игрока, брони, количество карт в колоде, количество карт в руке ",
      },
      {
        id: "upg-settings",
        label: "Настройки",
        content:
          "Здесь можно прокачать возможности настроек - пока только аватарку и незначительно цветовую схему",
      },
    ],
  },
  {
    id: "shop",
    label: "Магазин",
    subs: [
      {
        id: "shop-general",
        label: "Общее",
        content:
          "Наша игра - является абсолютно бесплатной!" +
          "Мы не принуждаем вас к покупке! Всё можно пройти и собрать бесплатно. Если же вы хотите ускорить " +
          "этот процесс, или просто хотите поблагодарить нас, милости просим в раздел покупки :)",
      },
      {
        id: "shop-process",
        label: "Процесс покупки",
        content:
          "Выбираете товар, нажимаете купить, открывается форма оплаты, вводите туда " +
          "свою карту, возможно потребуется подтверждение от банка, вводите тогда код. " +
          "После оплаты нажимаете кнопку - вернуться в магазин. " +
          "Ожидаете пока оплата пройдет, а ресурсы вам будут начислены." +
          "Если ресурсы не начислены в течение 1 минуты - попробуйте перезайти в игру." +
          "Если ресурсы так и не начислены вам - напишите нам - информация в разделе контакты",
      },
    ],
  },
  {
    id: "misc",
    label: "Разное",
    subs: [
      {
        id: "misc-settings",
        label: "Настройки",
        content:
          "В настройках можно выключить звуки, анимации дрожания врагов," +
          "изменить время хода (от 500 до 1000мс - это 0.5 до 1сек). При прокачке открываются так же " +
          "возможность сменить аватарку и цвет некоторых кнопок. Чтобы сохранить " +
          "ваши настройки - нажмите кнопку запомнить мои настройки. Здесь же можно выйти из аккаунта",
      },
    ],
  },
]

export default defineComponent({
  name: "RulesPage",

  data() {
    return {
      RULES,
      activeCategory: RULES[0].id,
      activeSub: RULES[0].subs[0].id,
      dragState: null as {
        ref: "catScroll" | "subScroll"
        startX: number
        scrollLeft: number
      } | null,
    }
  },

  computed: {
    currentSubs(): SubCategory[] {
      return RULES.find(c => c.id === this.activeCategory)?.subs ?? []
    },
    currentComponent(): Component | null {
      return (
        this.currentSubs.find(s => s.id === this.activeSub)?.component ?? null
      )
    },
    currentContent(): string {
      return this.currentSubs.find(s => s.id === this.activeSub)?.content ?? ""
    },
  },

  beforeUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
  },

  methods: {
    selectCategory(id: string): void {
      this.activeCategory = id
      const subs = RULES.find(c => c.id === id)?.subs ?? []
      this.activeSub = subs[0]?.id ?? ""
      this.$nextTick(() => {
        const el = this.$refs.subScroll as HTMLElement | undefined
        if (el) el.scrollLeft = 0
      })
    },

    onWheel(e: WheelEvent, ref: "catScroll" | "subScroll"): void {
      const el = this.$refs[ref] as HTMLElement | undefined
      if (el) el.scrollLeft += e.deltaY
    },

    onMouseDown(e: MouseEvent, ref: "catScroll" | "subScroll"): void {
      e.preventDefault()
      const el = this.$refs[ref] as HTMLElement
      this.dragState = { ref, startX: e.clientX, scrollLeft: el.scrollLeft }
      document.addEventListener("mousemove", this.onMouseMove)
      document.addEventListener("mouseup", this.onMouseUp)
    },

    onMouseMove(e: MouseEvent): void {
      if (!this.dragState) return
      const el = this.$refs[this.dragState.ref] as HTMLElement
      el.scrollLeft =
        this.dragState.scrollLeft - (e.clientX - this.dragState.startX)
    },

    onMouseUp(): void {
      this.dragState = null
      document.removeEventListener("mousemove", this.onMouseMove)
      document.removeEventListener("mouseup", this.onMouseUp)
    },
  },
})
</script>

<style scoped>
.rules-page {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
}

.rules-page__title {
  text-align: center;
  padding: 16px 0 10px;
  flex-shrink: 0;
}

.rules-page__heading {
  font-size: 1.8rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chips-row {
  display: flex;
  flex-shrink: 0;
  cursor: grab;
  gap: 8px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background: linear-gradient(
    180deg,
    #465361 0%,
    rgba(37, 44, 50, 0.35) 50.52%,
    #1d252d 99.48%
  );
  border-bottom: 2px solid;
  border-image-source: var(--secondary-gold-gradient);
  border-image-slice: 1;
}

.chips-row::-webkit-scrollbar {
  display: none;
}

.chips-row--dragging {
  cursor: grabbing;
  user-select: none;
}

.chips-row--sub {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(196, 155, 0, 0.2);
  border-image: none;
}

.chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.65);
  font-family: "Philosopher", serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.chip--sm {
  padding: 5px 12px;
  font-size: 13px;
}

.chip--active {
  background: rgba(196, 155, 0, 0.18);
  border-color: rgba(196, 155, 0, 0.65);
  color: #facf5d;
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.rules-content::-webkit-scrollbar {
  width: 4px;
}

.rules-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.rules-content__text {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
}

/* Shared styles for rule content components */
.rules-content :deep(.basics-general) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rules-content :deep(.text) {
  font-family: "Philosopher", serif;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
}

.rules-content :deep(.text--muted) {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
}

.rules-content :deep(.highlight-block) {
  border-left: 3px solid #facf5d;
  background: rgba(196, 155, 0, 0.1);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rules-content :deep(.highlight-block__label) {
  font-family: "Philosopher", serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #facf5d;
}

.rules-content :deep(.highlight-block__text) {
  font-family: "Philosopher", serif;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.rules-content :deep(.section-title) {
  font-family: "Philosopher", serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #facf5d;
  margin-bottom: -8px;
}

.rules-content :deep(.list) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rules-content :deep(.list__item) {
  font-family: "Philosopher", serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 14px;
  position: relative;
}

.rules-content :deep(.list__item::before) {
  content: "–";
  position: absolute;
  left: 0;
  color: #facf5d;
}

.rules-content :deep(.list__term) {
  color: #facf5d;
  font-weight: 700;
}
</style>
