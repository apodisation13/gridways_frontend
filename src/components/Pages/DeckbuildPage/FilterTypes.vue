<template>
  <div class="filter_types">
    <div class="global_text filter_title" @click="reset_filter_types">Тип</div>
    <div v-for="type in types" :key="type.value" class="types">
      <button
        class="type filter-option"
        :class="{ 'filter-option--selected': selected === type.value }"
        :aria-pressed="selected === type.value"
        @click="filtering(type.value)"
      >
        {{ type.label }}
        <span
          v-if="type.special"
          class="special-icon-background"
          aria-hidden="true"
        >
          <special-type-of-card class="special-icon" color="Gold" />
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import SpecialTypeOfCard from "@/components/UI/CardsUI/Cards/SpecialTypeOfCard.vue"
import { CardType } from "@/types"

export default defineComponent({
  name: "FilterTypes",
  components: { SpecialTypeOfCard },
  props: {
    selected: {
      type: String,
      default: "",
    },
  },
  emits: ["set-filter", "reset-filter-types"],
  data() {
    return {
      types: [
        { value: CardType.Unit, label: "Юнит", special: false },
        { value: CardType.Special, label: "Спец", special: true },
      ],
    }
  },
  methods: {
    filtering(type: CardType): void {
      this.$emit("set-filter", "type", type)
    },
    reset_filter_types(): void {
      this.$emit("reset-filter-types")
    },
  },
})
</script>

<style scoped>
.filter_types {
  margin-bottom: 12%;
}
.filter_title {
  font-size: 25px;
  margin-bottom: 15px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.types {
  display: inline;
}
.type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 4vh;
  width: 45%;
  margin: 1%;
}
.special-icon-background {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #161b22;
}
.special-icon {
  position: static;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
