<template>
  <div>
    <div v-if="changeFieldOpened" class="field-grid">
      <div
        v-for="field in fields"
        :key="field.path"
        class="field-cell"
        :class="{ 'field-cell--selected': selectedField === field.path }"
        @click="setField(field.path)"
      >
        <img :src="fieldSrc(field.path)" alt="" class="field-img" />
        <span class="field-label">{{ field.label }}</span>
      </div>
    </div>
    <setting-locked v-else title="Поле заблокировано" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import SettingLocked from "@/components/Pages/SettingsPage/SettingLocked.vue"
import { UpgradeSubtype, UpgradeType } from "@/types/upgrades"

export default defineComponent({
  name: "SettingField",
  components: { SettingLocked },
  data() {
    return {
      fields: [
        { path: "page_images/field1.webp", label: "Поле 1" },
        { path: "page_images/field2.webp", label: "Поле 2" },
        { path: "page_images/field3.webp", label: "Поле 3" },
        { path: "page_images/field4.webp", label: "Поле 4" },
        { path: "page_images/field5.webp", label: "Поле 5" },
        { path: "page_images/field6.webp", label: "Поле 6" },
        { path: "page_images/field7.webp", label: "Поле 7" },
        { path: "page_images/field8.webp", label: "Поле 8" },
      ] as { path: string; label: string }[],
    }
  },
  computed: {
    changeFieldOpened(): boolean {
      return (
        this.$store.getters["userUpgrades"][UpgradeType.SETTINGS][
          UpgradeSubtype.FIELD
        ] == 1
      )
    },
    selectedField(): string {
      return this.$store.getters["selectedField"]
    },
  },
  methods: {
    fieldSrc(path: string): string {
      return require(`@/assets/${path}`)
    },
    setField(path: string): void {
      this.$store.commit("set_field", path)
    },
  },
})
</script>

<style scoped>
.field-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 4px 0;
}

.field-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.field-cell:hover {
  border-color: rgba(250, 207, 93, 0.45);
  background: rgba(250, 207, 93, 0.07);
}

.field-cell--selected {
  border-color: #facf5d;
  background: rgba(250, 207, 93, 0.14);
}

.field-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.field-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}
</style>
