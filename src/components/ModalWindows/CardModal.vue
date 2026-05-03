<template>
  <modal-window v-touch:swipe="close_self">
    <button-close @close_self="close_self" />

    <!--Имя у карты есть всегда-->
    <h2>{{ card.name }}</h2>

    <!--Карта игрока, или карта лидера врагов!-->
    <div
      v-if="!forEnemy && !forEnemyLeader"
      class="card-ui"
      :style="[border(card)]"
    >
      <card-ui v-bind="$props" :card="playerCard" />
    </div>
    <!--А это соответственно карта врага, у неё есть card.move-->
    <div
      v-if="forEnemy || forEnemyLeader"
      class="card-ui"
      :style="[border(card)]"
    >
      <enemy-ui :enemy="card" />
    </div>

    <card-descriptions :card="card" :forEnemy="forEnemy" />

    <!--Блок кнопок милл, крафт (ТОЛЬКО ДЛЯ ДЕКБИЛДЕРА!!!-->
    <template #footer>
      <div v-if="deckbuilder" class="mill_craft_block">
        <div v-if="!bonus" class="divb">
          <button class="global_text btn btn-mill" @click="mill">
            Уничтожить ✕
          </button>
          <card-count-triangle
            :count="count"
            :card-color="background_color_triangle(cardColor)"
          />
          <button class="global_text btn btn-craft" @click="craft">
            Создать ⚒
          </button>
        </div>
        <div v-if="bonus" class="divb">
          <button class="bonus_count">У вас {{ count }}</button>
        </div>
      </div>
    </template>
    <card-action-modal
      v-if="show_modal_craft"
      action="craft"
      :options="craft_options"
      :card="playerCard"
      @confirm="confirm_craft"
      @cancel="show_modal_craft = false"
    />
    <card-action-modal
      v-if="show_modal_mill"
      action="mill"
      :options="mill_options"
      :card="playerCard"
      @confirm="confirm_mill"
      @cancel="show_modal_mill = false"
    />
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import { useToast } from "vue-toastification"

import CardDescriptions from "@/components/Cards/CardDescriptions.vue"
import CardUi from "@/components/Cards/CardUi.vue"
import EnemyUi from "@/components/Cards/EnemyUi.vue"
import CardActionModal from "@/components/ModalWindows/CardActionModal.vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import CardCountTriangle from "@/components/UI/CardsUI/Cards/CardCountTriangle.vue"
import {
  background_color_hp,
  background_color_leader,
  border_for_card,
  border_leader,
} from "@/logic/border_styles"
import {
  type Card,
  type CardEntry,
  CraftMillCardActionSubtype,
  type Enemy,
  type EnemyLeader,
  type Leader,
  type LeaderEntry,
} from "@/types"

export default defineComponent({
  name: "CardModal",
  components: {
    CardActionModal,
    CardCountTriangle,
    CardDescriptions,
    EnemyUi,
    CardUi,
    ModalWindow,
    ButtonClose,
  },
  props: {
    is_leader: {
      type: Boolean,
      default: false,
    },
    user_card: {
      type: Object as PropType<CardEntry | LeaderEntry | null>,
      default() {
        return null
      },
    },
    card: {
      type: Object as PropType<Card | Leader | Enemy | EnemyLeader>,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    hp_needed: {
      // hp только для декбилдера, для игры не нужно оно
      type: Boolean,
      default: false,
    },
    bonus: {
      //этот пропс используется для страницы BonusPage
      type: Boolean,
      default: false,
      required: false,
    },
    deckbuilder: {
      type: Boolean,
      default: false,
    },
    // отображать описание для врага или нет
    forEnemy: {
      type: Boolean,
      required: false,
      default: false,
    },
    // отображать описание для лидера врагов или нет
    forEnemyLeader: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["close_card_modal"],
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      show_modal_mill: false,
      show_modal_craft: false,
    }
  },
  computed: {
    playerCard(): Card | Leader {
      return this.card as Card | Leader
    },
    cardColor(): string {
      return (this.card as any).color ?? ""
    },
    card_color_key(): string {
      return (this.card as any).color ? (this.card as any).color : "leader"
    },
    craft_options(): Record<string, number>[] {
      const config = this.$store.getters["cards_resources_prices"]
      const cfg = config[this.card_color_key]
      return cfg["craft_card"] || cfg["craft_leader"] || []
    },
    mill_options(): Record<string, number>[] {
      const config = this.$store.getters["cards_resources_prices"]
      const cfg = config[this.card_color_key]
      return cfg["mill_card"] || cfg["mill_leader"]
    },
  },
  methods: {
    close_self(): void {
      this.$emit("close_card_modal")
    },
    border(card: Card | Leader | Enemy | EnemyLeader): Record<string, string> {
      return this.is_leader
        ? border_leader(card as Leader | EnemyLeader)
        : border_for_card(card as Card | Enemy)
    },
    background_color_triangle(color: string): string {
      return this.is_leader
        ? background_color_leader(this.card.faction)
        : background_color_hp(color)
    },
    mill(): void {
      const c = this.card as any
      if (this.count === 0 || (this.count === 1 && c.unlocked)) {
        this.toast.warning(
          "Нельзя размиллить карту из стартового набора или ту, которой и так 0"
        )
        return
      }
      this.show_modal_mill = true
    },
    craft(): void {
      this.show_modal_craft = true
    },
    async confirm_mill(): Promise<void> {
      this.show_modal_mill = false
      const subtypeCardAction =
        (this.user_card?.card as any)?.color !== undefined
          ? CraftMillCardActionSubtype.millCard
          : CraftMillCardActionSubtype.millLeader
      const data = {
        cardId: (this.user_card as CardEntry | LeaderEntry).card.id,
        subtype: subtypeCardAction,
      }
      await this.$store.dispatch("processCraftMillCard", data)
    },
    async confirm_craft(recipe: unknown): Promise<void> {
      this.show_modal_craft = false
      const subtypeCardAction =
        (this.user_card?.card as any)?.color !== undefined
          ? CraftMillCardActionSubtype.craftCard
          : CraftMillCardActionSubtype.craftLeader
      const data = {
        cardId: (this.user_card as CardEntry | LeaderEntry).card.id,
        subtype: subtypeCardAction,
        recipe: recipe,
      }
      await this.$store.dispatch("processCraftMillCard", data)
    },
  },
})
</script>

<style scoped>
div {
  color: white;
}
.card-ui {
  position: relative;
  margin: 10px auto;
  width: 85%;
  box-shadow: -4px 0 4px rgb(0 0 0 / 50%);
}
.card-ui::before {
  content: "";
  display: block;
  padding-top: 143%;
}
.divb {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.btn {
  width: 48%;
  height: 3rem;
  background: linear-gradient(
    180deg,
    #1d252d -21.82%,
    rgba(0, 0, 0, 0.13) 44.55%,
    #282d33 109.53%
  );
  font-size: 16px;
  border-style: solid;
  border-color: hsl(44, 94%, 67%);
  border-radius: 6px;
}
.btn-mill {
  border-width: 1px 1px 0 0;
  color: hsl(0, 76%, 47%);
}
.btn-craft {
  border-width: 1px 0 0 1px;
  color: hsl(112, 81%, 53%);
}
.bonus_count {
  width: 90%;
  height: 100%;
}
</style>
