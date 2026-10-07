<template>
  <div class="filter_unlocked">
    <div class="global_text filter_title" @click="reset_filter_types">
      Наличие
    </div>
    <div v-for="option in options" :key="option.value" class="types">
      <button
        class="type filter-option"
        :class="{ 'filter-option--selected': selected === option.value }"
        :aria-pressed="selected === option.value"
        @click="filtering(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
export default defineComponent({
  name: "FilterUnlocked",
  props: {
    selected: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  emits: ["set-filter", "reset-filter-unlocked"],
  data() {
    return {
      options: [
        { value: 1, label: "1" },
        { value: 2, label: "2 и более" },
        { value: 0, label: "0" },
      ],
    }
  },
  methods: {
    filtering(count: number): void {
      this.$emit("set-filter", "count", count)
    },
    reset_filter_types(): void {
      this.$emit("reset-filter-unlocked")
    },
  },
})
</script>

<style scoped>
.filter_unlocked {
  margin-top: 12%;
  margin-bottom: 10px;
}
.filter_title {
  font-size: 25px;
  margin-bottom: 15px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.types {
  display: inline;
}
.type {
  height: 4vh;
  width: 31%;
  margin: 1%;
}
</style>
