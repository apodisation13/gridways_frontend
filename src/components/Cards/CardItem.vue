<template>
  <div class="card-item-wrapper">
    <div
      class="card-item-component"
      @contextmenu.prevent
      @click.right="show_modal"
      v-touch:longtap="show_modal"
      :id="make_id(card, index)"
      :style="[border(card)]"
    >
      <card-ui v-bind="$props" />
    </div>
    <!-- ИЗМЕНЕНО: телепортируем модалку в body -->
    <teleport to="body">
      <card-modal
        v-if="show_card_modal"
        v-bind="$props"
        @close_card_modal="show_card_modal = false"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import { border_for_card, border_leader } from "@/logic/border_styles"
import CardModal from "@/components/ModalWindows/CardModal.vue"
import CardUi from "@/components/Cards/CardUi.vue"
import type { Card, Leader, Enemy } from "@/types"
export default defineComponent({
  components: {
    CardUi,
    CardModal,
  },
  props: {
    // собственно сама карта
    card: {
      type: Object as PropType<Card | Leader | Enemy>,
      required: true,
    },
    // весь объект карты, включая верхний уровень (где есть user_card_id, count)
    user_card: {
      type: Object,
      default() {
        return null
      },
    },
    // брать ли границу карты как для карт (по цвету), ДЕФОЛТНОЕ, или как для лидеров (по фракции)
    is_leader: {
      type: Boolean,
      default: false,
    },
    // показывать или не показывать hp (в игре не нужны жизни, везде нужны)
    hp_needed: {
      type: Boolean,
      default: false,
    },
    // показывать или не показывать зону кнопок милл\крафт, только для декбилдера
    deckbuilder: {
      type: Boolean,
      default: false,
    },
    // на странице бонусов мы показываем count, но не показываем mill/craft
    bonus: {
      type: Boolean,
      default: false,
      required: false,
    },
    // сколько у юзера этой карты
    count: {
      type: Number,
    },
    // FIXME: че это
    is_previev: {
      type: Boolean,
      default: false,
    },
    // индекс карты в руке, по нему считается id карты, чтобы потом понять за какую карту потянули
    // ПРИХОДИТ ИЗ HAND_COMP!
    index: {
      type: Number,
    },
  },
  data() {
    return {
      show_card_modal: false as boolean,
    }
  },
  methods: {
    make_id(card: Card | Leader | Enemy, index: number | undefined): string {
      if (!index && index !== 0) return ""
      return `${card.name}_${index}`
    },
    show_modal(): void {
      this.show_card_modal = true
    },
    border(card: Card | Leader | Enemy): Record<string, string> | undefined {
      return this.is_leader ? border_leader(card) : border_for_card(card)
    },
  },
  emits: ["open_card_modal"],
})
</script>

<style scoped>
.card-item-wrapper {
  position: relative;
  width: 100%;
}

.card-item-component {
  position: relative;
  width: 100%;
  box-shadow: -4px 0 4px rgb(0 0 0 / 50%);
}

.card-item-component::before {
  content: "";
  display: block;
  padding-top: 143%;
}
</style>
