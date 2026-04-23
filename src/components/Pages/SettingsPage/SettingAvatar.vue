<template>
  <div>
    <div v-for="(el, index) in avatars" :key="index" class="inlines">
      <div class="inlines">
        <img
          :src="require(`@/assets/icons/resources/${el.link}.svg`)"
          alt=""
          class="wood"
          @dblclick="setAvatar(el.link)"
        />
      </div>
    </div>
    <base-button class="reset-avatar" @click="resetAvatar">
      Сбросить аватар
    </base-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default defineComponent({
  name: "SettingAvatar",
  components: { BaseButton },
  data() {
    return {
      avatars: [{ link: "wood" }, { link: "kegs" }, { link: "chests" }] as {
        link: string
      }[],
    }
  },
  methods: {
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
.inlines {
  display: inline;
  margin: 5px;
}

.wood {
  max-height: 60px;
}

.reset-avatar {
  margin-top: 2vh;
}
</style>
