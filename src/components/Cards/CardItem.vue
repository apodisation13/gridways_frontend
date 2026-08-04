<template>
  <div class="card-item-wrapper">
    <div
      :id="make_id(card, index)"
      v-touch:longtap="show_modal"
      class="card-item-component"
      :style="[border(card)]"
      @contextmenu.prevent
      @click.right="show_modal"
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

import CardUi from "@/components/Cards/CardUi.vue"
import CardModal from "@/components/ModalWindows/CardModal.vue"
import { border_for_card, border_leader } from "@/logic/border_styles"
import type { Card, CardEntry, Leader, LeaderEntry } from "@/types"
export default defineComponent({
  components: {
    CardUi,
    CardModal,
  },
  props: {
    // собственно сама карта
    card: {
      type: Object as PropType<Card | Leader>,
      required: true,
    },
    // весь объект карты, включая верхний уровень (где есть user_card_id, count)
    user_card: {
      type: Object as PropType<CardEntry | LeaderEntry | null>,
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
      default: undefined,
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
      default: undefined,
    },
    location: {
      type: String as PropType<"hand" | "deck" | "grave" | "field" | null>,
      default: null,
    },
  },
  emits: ["open_card_modal"],
  data() {
    return {
      show_card_modal: false as boolean,
    }
  },
  methods: {
    make_id(card: Card | Leader, index: number | undefined): string {
      if (!index && index !== 0) return ""
      return `${card.name}_${index}`
    },
    show_modal(): void {
      this.show_card_modal = true
    },
    border(card: Card | Leader): Record<string, string> | undefined {
      return this.is_leader
        ? border_leader(card as Leader)
        : border_for_card(card as Card)
    },
  },
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
