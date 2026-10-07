<template>
  <div>
    <div class="global_text filter_title">Добавлено недавно</div>
    <button
      class="newly-added filter-option"
      :class="{ 'filter-option--selected': selected === true }"
      :aria-pressed="selected === true"
      @click="toggleFilter"
    >
      ДА
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
export default defineComponent({
  name: "FilterNewlyadded",
  props: {
    selected: {
      type: Boolean as PropType<boolean | null>,
      default: null,
    },
  },
  emits: ["set-filter"],
  methods: {
    toggleFilter(): void {
      this.$emit(
        "set-filter",
        "newly_added",
        this.selected === true ? null : true
      )
    },
  },
})
</script>

<style scoped>
.filter_title {
  font-size: 25px;
  margin-bottom: 15px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.newly-added {
  display: block;
  height: 4vh;
  width: 45%;
  margin: 1% auto;
}
</style>
