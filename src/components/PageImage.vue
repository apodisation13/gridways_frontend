<template>
  <div class="page-img-wrapper" :class="{ 'page-img-gradient': withGradient }">
    <img v-if="path" class="page_img" :src="path" alt="#" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "PageImage",

  data() {
    return {
      time: "" as string | number,
      intervalId: null as ReturnType<typeof setInterval> | null,
      isWorking: true,
      defaultImg: null as string | null,
    }
  },

  computed: {
    path(): string | null {
      const image = this.$router.currentRoute.value.meta.image
      if (!image) return ""

      if ((image as any).default) {
        clearInterval(this.intervalId ?? undefined)
        return require("@/assets/" + (image as any).default)
      }

      if (this.time === "") return null
      let actualtime = parseInt(String(this.time))
      // actualtime = 22 проверка ручками
      if (actualtime >= 5 && actualtime < 11) {
        return require("@/assets/" + (image as any).morning)
      } else if (actualtime >= 11 && actualtime < 18) {
        return require("@/assets/" + (image as any).day)
      } else if (actualtime >= 18 && actualtime < 22) {
        return require("@/assets/" + (image as any).evening)
      } else if (actualtime >= 22 || actualtime < 5) {
        return require("@/assets/" + (image as any).night)
      } else {
        return ""
      }
    },
    withGradient(): boolean {
      return this.$router.currentRoute.value.meta.withGradient as boolean
    },
  },

  created() {
    this.updateTime()
    this.intervalId = setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  beforeUnmount() {
    clearInterval(this.intervalId ?? undefined)
  },

  methods: {
    updateTime(): void {
      if (this.isWorking) {
        this.time = new Date().getHours()
      }
    },
  },
})
</script>

<style scoped>
.page-img-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -2;
}

.page_img {
  display: block;
  width: 100%;
  height: 100%;
}

.page-img-gradient::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    180deg,
    #0a305b -12.88%,
    #a3abb4 33.24%,
    #0a305b 108.88%
  );
  mix-blend-mode: multiply;
}
</style>
