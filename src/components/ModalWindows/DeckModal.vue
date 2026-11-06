<template>
  <modal-window v-touch:swipe="close_self" class="deck-modal">
    <div class="deck-header">
      <button-close @close_self="close_self" />
      <div class="deck-tabs" role="tablist" aria-label="Просмотр колоды">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="deck-tab"
          :class="{ 'deck-tab--active': selectedTab === tab.key }"
          :title="tab.title"
          :aria-label="tab.title"
          :aria-selected="selectedTab === tab.key"
          role="tab"
          @click="selectedTab = tab.key"
        >
          <span aria-hidden="true">{{ tab.icon }}</span>
        </button>
      </div>
      <h3 class="tab-title">{{ activeTabTitle }}</h3>
    </div>

    <div class="deck-content" role="tabpanel" :aria-label="activeTabTitle">
      <dl v-if="selectedTab === 'info'" class="deck-info">
        <div>
          <dt>Суммарные жизни колоды</dt>
          <dd>{{ deckHealth }}</dd>
        </div>
        <div>
          <dt>Название колоды</dt>
          <dd>{{ deckName }}</dd>
        </div>
        <div>
          <dt>Имя лидера</dt>
          <dd>{{ leader.name }}</dd>
        </div>
        <div>
          <dt>Количество карт в колоде</dt>
          <dd>{{ deck.length }}</dd>
        </div>
      </dl>
      <div v-else-if="selectedTab === 'leader'" class="leader">
        <card-item :card="leader" :is_leader="true" :hp_needed="true" />
      </div>
      <card-list-component
        v-else-if="selectedTab === 'cards'"
        :cards="deckEntries"
        :hp_needed="true"
      />
    </div>
  </modal-window>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import CardItem from "@/components/Cards/CardItem.vue"
import CardListComponent from "@/components/Cards/CardListComponent.vue"
import ModalWindow from "@/components/ModalWindows/ModalWindow.vue"
import ButtonClose from "@/components/UI/Buttons/ButtonClose.vue"
import type { CardEntry, DeckCardEntry, Leader } from "@/types"

type DeckTab = "info" | "leader" | "cards"

export default defineComponent({
  name: "DeckModal",
  components: {
    CardItem,
    CardListComponent,
    ButtonClose,
    ModalWindow,
  },
  props: {
    deckName: {
      type: String,
      required: true,
    },
    deckHealth: {
      type: Number,
      required: true,
    },
    deck: {
      type: Array as PropType<DeckCardEntry[]>,
      required: true,
    },
    leader: {
      type: Object as PropType<Leader>,
      required: true,
    },
  },
  emits: ["close_deck_modal"],
  data() {
    return { selectedTab: "cards" as DeckTab }
  },
  computed: {
    tabs(): { key: DeckTab; title: string; icon: string }[] {
      return [
        { key: "info", title: "Информация", icon: "ℹ️" },
        { key: "leader", title: "Лидер", icon: "👑" },
        { key: "cards", title: "Карты", icon: "⚔️" },
      ]
    },
    activeTabTitle(): string {
      return this.tabs.find(tab => tab.key === this.selectedTab)!.title
    },
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
})
</script>

<style scoped>
.deck-modal > :deep(.modal_content) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.deck-header {
  flex-shrink: 0;
  padding: 0 16px;
  color: white;
}

.deck-tabs {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.deck-tab {
  flex: 1;
  min-height: 44px;
  border: 1px solid #c5a87e;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 24px;
  cursor: pointer;
}

.deck-tab--active {
  background: rgba(197, 168, 126, 0.35);
  box-shadow: inset 0 0 0 1px #facf5d;
}

.tab-title {
  margin: 14px 0;
  font-size: 18px;
}

.deck-content {
  flex: 1;
  min-height: 0;
  padding: 8px 16px 16px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  color: white;
}

.deck-info {
  margin: 0;
  text-align: left;
}

.deck-info > div {
  padding: 16px;
  border-bottom: 1px solid rgba(197, 168, 126, 0.25);
}

.deck-info dt {
  margin-bottom: 8px;
  color: #c5a87e;
  font-size: 13px;
}

.deck-info dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.leader {
  width: 70%;
  max-width: 280px;
  margin: 12px auto;
}
</style>
