<template>
  <div class="btn_icon" :style="{ backgroundImage: `url(${iconUrl})` }"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    image_name: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconUrl(): string {
      return require(`@/assets/icons/buttons/${this.image_name}`)
    },
  },
})
</script>

<style scoped>
.btn_icon {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 25px;
  height: 25px;
}
</style>
