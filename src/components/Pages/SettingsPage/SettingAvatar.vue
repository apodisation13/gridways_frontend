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

<script>
import BaseButton from "@/components/UI/Buttons/BaseButton.vue"

export default {
  name: "SettingAvatar",
  components: { BaseButton },
  data() {
    return {
      avatars: [{ link: "wood" }, { link: "kegs" }, { link: "chests" }],
    }
  },
  methods: {
    setAvatar(path) {
      this.$store.commit("set_avatar", path)
    },
    resetAvatar() {
      this.$store.commit("set_avatar", "")
    },
  },
}
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
