<template>
  <div v-if="changeAvatarsOpened">
    <div class="avatar-grid">
      <div
        v-for="(el, index) in avatars"
        :key="index"
        class="avatar-cell"
        :class="{ 'avatar-cell--selected': selectedAvatar === el.link }"
        @click="setAvatar(el.link)"
      >
        <img :src="avatarSrc(el.link)" alt="" class="avatar-img" />
      </div>
    </div>
    <base-button class="reset-avatar" @click="resetAvatar">
      Сбросить аватар
    </base-button>
  </div>
  <setting-locked v-else title="Аватар заблокирован" />
</template>

<script lang="ts">
import { defineComponent } from "vue"

import SettingLocked from "@/components/Pages/SettingsPage/SettingLocked.vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"
import { UpgradeSubtype, UpgradeType } from "@/types/upgrades"

export default defineComponent({
  name: "SettingAvatar",
  components: { BaseButton, SettingLocked },
  data() {
    return {
      avatars: [
        { link: "avatars/axe" },
        { link: "avatars/book" },
        { link: "avatars/bow" },
        { link: "avatars/chalice" },
        { link: "avatars/crown" },
        { link: "avatars/dragon_egg" },
        { link: "avatars/gem" },
        { link: "avatars/hammer" },
        { link: "avatars/helmet" },
        { link: "avatars/orb" },
        { link: "avatars/scroll" },
        { link: "avatars/shield" },
        { link: "avatars/staff" },
        { link: "avatars/sword" },
        { link: "avatars/torch" },
      ] as { link: string }[],
    }
  },
  computed: {
    changeAvatarsOpened(): boolean {
      return (
        this.$store.getters["userUpgrades"][UpgradeType.SETTINGS][
          UpgradeSubtype.AVATAR
        ] == 1
      )
    },
    selectedAvatar(): string {
      return this.$store.getters["selectedAvatar"]
    },
  },
  methods: {
    avatarSrc(link: string): string {
      if (link.includes("/")) return require(`@/assets/${link}.svg`)
      return require(`@/assets/icons/resources/${link}.svg`)
    },
    setAvatar(path: string): void {
      this.$store.commit("set_avatar", path)
    },
    resetAvatar(): void {
      this.$store.commit("set_avatar", "")
    },
  },
})
</script>

<style scoped>
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 4px 0;
}

.avatar-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.avatar-cell:hover {
  border-color: rgba(250, 207, 93, 0.45);
  background: rgba(250, 207, 93, 0.07);
}

.avatar-cell--selected {
  border-color: #facf5d;
  background: rgba(250, 207, 93, 0.14);
}

.avatar-img {
  width: 36px;
  height: 40px;
  display: block;
}

.reset-avatar {
  margin-top: 12px;
}
</style>
