<template>
  <div class="deck_selection">
    <div class="global_text text">Выберите колоду</div>

    <div class="decks-grid">
      <div
        v-for="(deck, index) in decks"
        :key="deck.deck.id"
        @dblclick="select_deck(index)"
      >
        <deck-preview-comp :deck="deck" :deckbuilder="deckbuilder">
          <template #actions>
            <div
              v-if="deckbuilder && deck.deck.id !== 1"
              @click.stop="change_deck(index)"
              class="icon change"
            ></div>
            <div
              v-if="deckbuilder && deck.deck.id !== 1"
              @click.stop="delete_deck(deck.deck)"
              class="icon delete"
            ></div>
          </template>
        </deck-preview-comp>
      </div>
    </div>

    <yesno-modal
      v-if="show_yesno"
      @confirm="confirm_delete"
      @cancel="cancel_delete"
    />
  </div>
</template>

<script>
import DeckPreviewComp from "@/components/DeckPreviewComp"
import YesnoModal from "@/components/ModalWindows/YesnoModal"
export default {
  name: "deck-selection",
  components: { YesnoModal, DeckPreviewComp },
  props: {
    deckbuilder: {
      // отображать или нет выбранная дека, отображать или нет кнопки изменить\удалить
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      show_yesno: false, // показать да\нет по кнопке удалить деку
      deck_id: undefined, // id деки, которую надо удалить
    }
  },
  methods: {
    // осуществить выбор деки для игры, дважды ЛКМ, только на странице игры и не на странице колод
    select_deck(i) {
      if (!this.deckbuilder)
        this.$store.dispatch("set_deck_in_play", this.decks[i])
    },

    delete_deck(deck) {
      this.show_yesno = true
      this.deck_id = deck.id // запоминаем id деки, которую надо удалить
    },

    async confirm_delete() {
      this.show_yesno = false
      try {
        await this.$store.dispatch("deleteUserDeck", this.deck_id)
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    cancel_delete() {
      this.show_yesno = false
    },

    change_deck(index) {
      this.$emit("emit_state_deck_index", index)
    },
  },

  computed: {
    decks() {
      return this.$store.getters["all_decks"]
    },
  },

  emits: ["emit_state_deck_index"],
}
</script>

<style scoped>
.deck_selection {
  margin: 1%;
  width: 95%;
  height: 80vh;
  overflow: scroll;
}

.text {
  margin-bottom: 10px;
  font-size: 32px;
  background: var(--primary-gold-gradient);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 15px;
  justify-items: center;
}

.icon {
  width: 30px;
  height: 30px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  margin-left: 5px;
}

.change {
  background-image: url("~@/assets/icons/buttons/edit-2.svg");
}

.delete {
  background-image: url("~@/assets/icons/buttons/trash-2.svg");
}
</style>
