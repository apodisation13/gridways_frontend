<template>
  <div>
    <div
      v-for="(setting, index) in settings"
      :key="index"
      @click="selectSetting(index)"
    >
      <base-button class="base-button">
        <div class="global_text text">{{ setting }}</div>
      </base-button>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
  name: "SettingsList",
  components: { BaseButton },
  props: {
    settings: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  methods: {
    selectSetting(index: number): void {
      this.$emit("select-setting", index)
    },
  },
  emits: ["select-setting"],
})
</script>

<style scoped>
.base-button {
  background: linear-gradient(#1d252d, #000000, #282d33);
  margin-bottom: 13px;
  border: 2px solid #facf5d;
}
.text {
  font-size: 16px;
  background: var(--primary-gold-gradient);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
