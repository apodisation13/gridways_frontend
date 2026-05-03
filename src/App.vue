<template>
  <!-- обертка включение полноэкранного режима -->
  <app-wrapper-fullscreen>
    <div class="wrapper__bg">
      <div class="app">
        <!--картинка страницы по параметрам из роутера-->
        <page-image />
        <!--верхняя часть меню, хэдер-->
        <menu-header />

        <!--собственно рендер самого приложения через роутер, формат {путь(роут): компонент}-->
        <router-view />

        <!--нижняя часть меню, в футере, показываем только авторизованному-->
        <menu-footer v-if="isLoggedIn" />
      </div>
    </div>
  </app-wrapper-fullscreen>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import PageImage from "@/components/PageImage.vue"
import AppWrapperFullscreen from "@/components/Pages/AppWrapperFullscreen/AppWrapperFullscreen.vue"
import MenuFooter from "@/components/UI/Menu/MenuFooter.vue"
import MenuHeader from "@/components/UI/Menu/MenuHeader.vue"

export default defineComponent({
  components: {
    PageImage,
    MenuHeader,
    MenuFooter,
    AppWrapperFullscreen,
  },

  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters["isLoggedIn"]
    },
  },

  async created() {
    const tg = (window as any).Telegram.WebApp
    tg.ready()
    tg.expand()

    // touch-action: manipulation removes the 300ms delay but also stops iOS WKWebView
    // from synthesising dblclick events. This polyfill restores them.
    if ("ontouchstart" in window) {
      let lastTapTime = 0
      let lastTapTarget: EventTarget | null = null
      document.addEventListener(
        "touchend",
        (e: TouchEvent) => {
          const now = Date.now()
          const target = e.target
          if (target === lastTapTarget && now - lastTapTime < 300) {
            target!.dispatchEvent(
              new MouseEvent("dblclick", {
                bubbles: true,
                cancelable: true,
                view: window,
              })
            )
            lastTapTime = 0
            lastTapTarget = null
          } else {
            lastTapTime = now
            lastTapTarget = target
          }
        },
        { passive: true }
      )
    }

    await this.$store.dispatch("fetchNews")
    await this.$router.push("/")
    try {
      await this.$store.dispatch("checkAuth") // пытаемся послать запрос на логин с данными из локалсторадж
    } catch (err) {
      console.log(err)
      throw err
    }
  },
})
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Philosopher&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
  touch-action: manipulation;
  font-family: "Roboto", "Inter", "Philosopher", sans-serif;
  /* font-family: Arial, Helvetica, sans-serif; единый на всё */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

*::-webkit-scrollbar {
  display: none;
}
/* Современный подход с dvh */
:root {
  --app-height: 100vh;
}

@supports (height: 100dvh) {
  :root {
    --app-height: 100dvh;
  }
}

.app {
  padding: 0;
}

/*заблокировать перезагрузку страницы на мобилке по прокрутке вверх*/
html,
body {
  overscroll-behavior-y: contain;
}

.app {
  position: relative;
  z-index: -2;
  background: #fff;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
}

.wrapper__bg {
  position: absolute;
  z-index: -3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
}

@media (min-width: 900px) {
  .app {
    position: relative;
    max-width: 425px;
    /* max-height: 930px; */
    border-radius: 8px;
    margin: 0 auto;
  }
}
</style>
