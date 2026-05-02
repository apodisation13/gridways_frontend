import "@/assets/css/main.css"
import "vue-toastification/dist/index.css"

import { createApp } from "vue"
import VueFullscreen from "vue-fullscreen"
import VueKonva from "vue-konva"
import Toast from "vue-toastification"
import Vue3TouchEvents from "vue3-touch-events"

import App from "@/App.vue"
import router from "@/router/router"
import store from "@/store"

const app = createApp(App)

const toastOptions = {
  timeout: 2000,
}

app
  .use(router)
  .use(store)
  .use(Toast, toastOptions)
  .use(Vue3TouchEvents as any)
  .use(VueKonva)
  .use(VueFullscreen)
  .mount("#app")
