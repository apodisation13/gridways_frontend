<template>
  <div class="filter_unlocked">
    <div class="global_text filter_title" @click="reset_filter_types">
      Наличие
    </div>
    <div v-for="count in [1, 2, 0]" :key="count" class="types">
      <button class="type" @click="filtering(count)">
        {{ count }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  name: "FilterUnlocked",
  emits: ["set-filter", "reset-filter-unlocked"],
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
