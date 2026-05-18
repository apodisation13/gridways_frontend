<template>
  <div class="resource-item">
    <div class="wrapper__resource-image">
      <img
        :src="require(`@/assets/icons/resources/${name}.svg`)"
        :alt="name"
        class="resource-image"
      />
    </div>
    <div
      class="resource-count"
      :class="{
        'resource-count--empty': count === 0,
        'resource-count--max': count === maxResourcesValue[name] && count !== 0,
      }"
    >
      {{ count }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "ResourceItem",
  props: {
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    maxResourcesValue() {
      return this.$store.getters["maxResourcesValue"]
    },
  },
})
</script>
<style scoped>
.resource-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wrapper__resource-image {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.resource-image {
  display: block;
  width: 35px;
  max-height: 30px;
}

.resource-count {
  font-family: "Philosopher", serif;
  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 120%;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.resource-count--empty {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.resource-count--max {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 640px) {
  .wrapper__resource-image {
    /* width: 25px; */
    max-height: 25px;
  }
  .resource-image {
    /* max-width: 25px; */
    max-height: 25px;
  }
}
</style>
