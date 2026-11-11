<template>
  <div class="achievement-reward-toast">
    <p class="reward-heading">Контракт выполнен</p>
    <p class="reward-title">{{ title }}</p>
    <resource-list
      v-if="Object.keys(visibleResources).length"
      class="reward-resources"
      :resources="visibleResources"
      :highlight_max_count="false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import ResourceList from "@/components/ResourceList.vue"

export default defineComponent({
  components: { ResourceList },
  props: {
    title: { type: String, required: true },
    resources: {
      type: Object as PropType<Record<string, number>>,
      required: true,
    },
  },
  computed: {
    visibleResources(): Record<string, number> {
      // При достигнутом лимите бэк может начислить 0 — такую награду не показываем.
      return Object.fromEntries(
        Object.entries(this.resources).filter(([, count]) => count > 0)
      )
    },
  },
})
</script>

<style scoped>
.achievement-reward-toast {
  min-width: 0;
}
.reward-heading {
  margin: 0 0 6px;
  font-size: 13px;
  opacity: 0.85;
}
.reward-title {
  margin: 0 0 12px;
  font-family: "Philosopher", serif;
  font-size: 17px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.reward-resources {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px 14px;
}
</style>
