import { createApp } from "vue"
import App from "@/App.vue"
import "@/assets/css/main.css"
import router from "@/router/router"
import store from "@/store"
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import Vue3TouchEvents from "vue3-touch-events"
import VueKonva from "vue-konva"
import VueFullscreen from "vue-fullscreen"

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
