<template>
  <div class="filter_search">
    <label for="card-word-search" class="global_text filter_title">
      Поиск по слову
    </label>
    <input
      id="card-word-search"
      v-model="search"
      type="search"
      placeholder="Введите слово"
      autocomplete="off"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "FilterSearch",
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["set-filter"],
  computed: {
    search: {
      get(): string {
        return this.value
      },
      set(value: string): void {
        this.$emit("set-filter", "search", value)
      },
    },
  },
})
</script>

<style scoped>
.filter_search {
  margin-top: 20px;
}
.filter_title {
  display: block;
  font-size: 25px;
  margin-bottom: 15px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #c5a87e;
  border-radius: 4px;
  background: #0a0b0c;
  color: #fff;
  font-size: 16px;
  user-select: text;
}
input:focus-visible {
  outline: 2px solid #facf5d;
  outline-offset: 2px;
}
</style>
