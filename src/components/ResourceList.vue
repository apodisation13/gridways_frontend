<template>
  <div class="resource-list">
    <resource-item
      v-for="(count, name) in resources"
      :key="name"
      :name="name"
      :count="count"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import ResourceItem from "@/components/UI/ResourceItem.vue"

export default defineComponent({
  components: { ResourceItem },
  name: "resource-comp",
  props: {
    resources: {
      type: Object as PropType<Record<string, number>>,
      required: true,
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
