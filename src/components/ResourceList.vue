<template>
  <div class="resource-list">
    <resource-item
      v-for="(count, name) in resources"
      :key="name"
      :name="name"
      :count="count"
      :highlight_max_count="highlight_max_count"
      :show_max_count="show_max_count"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import ResourceItem from "@/components/UI/ResourceItem.vue"

export default defineComponent({
  name: "ResourceComp",
  components: { ResourceItem },
  props: {
    resources: {
      type: Object as PropType<Record<string, number>>,
      required: true,
    },
    show_max_count: {
      type: Boolean,
      default: false,
    },
    highlight_max_count: {
      type: Boolean,
      default: true,
    },
  },
})
</script>

<style scoped>
div {
  font-family: "Brush Script MT", cursive;
  font-size: 14pt;
}
.resource-list {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  width: 100%;
}
</style>
