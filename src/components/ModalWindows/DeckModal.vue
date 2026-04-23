<template>
  <modal-window v-touch:swipe="close_self">
    <button-close @close_self="close_self" />

    <div class="leader">
      <card-item :card="leader" :is_leader="true" :hp_needed="true" />
    </div>

    <card-list-component :cards="deckEntries" :hp_needed="true" />
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import CardItem from "@/components/Cards/CardItem.vue"
import type { CardEntry, DeckCardEntry, Leader } from "@/types"
export default defineComponent({
  name: "deck-modal",
  components: {
    CardItem,
    CardListComponent,
    ButtonClose,
    ModalWindow,
  },
  props: {
    deck: {
      type: Array as PropType<DeckCardEntry[]>,
      required: true,
    },
    leader: {
      type: Object as PropType<Leader>,
      required: true,
    },
  },
  computed: {
    deckEntries(): CardEntry[] {
      return this.deck
        .filter(
          (
            entry
          ): entry is DeckCardEntry & {
            card: NonNullable<DeckCardEntry["card"]>
          } => entry.card !== undefined
        )
        .map(entry => ({ card: entry.card, count: entry.count, id: null }))
    },
  },
  methods: {
    close_self(): void {
      this.$emit("close_deck_modal")
    },
  },
  emits: ["close_deck_modal"],
})
</script>

<style scoped>
.leader {
  width: 30%;
  margin: auto;
}
</style>
