<template>
  <div>
    <slot></slot>
    <div v-if="openModal && gameStarted">
      <base-modal class="priority">
        <div class="request-modal">
          <base-title-text> Перейдите в полноэкранный режим </base-title-text>
          <button-to-fullscreen text="Перейти" @click="toggleApi" />
        </div>
      </base-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import BaseTitleText from "@/components/UI/BaseTitleText.vue"
import ButtonToFullscreen from "@/components/UI/Buttons/ButtonToFullscreen.vue"

export default defineComponent({
  components: { BaseModal, BaseTitleText, ButtonToFullscreen },
  data() {
    return {
      // поле состояния режима полного экрана
      fullscreen: false,
      // поле для открытия модального окна с запросом на преход в полноэкранный режим
      openModal: false,
    }
  },
  computed: {
    // поле указывающее что пользователь зашел в игру, устанавливается в true и втечение игры не меняется
    // по заначению этого поля открывается модальное окно с запросом перехода в полноэкранный режим
    gameStarted(): boolean {
      return this.$store.state.fullscreen.isStarted
    },
  },
  methods: {
    toggle(): void {
      this.fullscreen = true
    },
    toggleApi(): void {
      ;(this as any).$fullscreen.toggle()
    },

    // функция пересчета значения переменной vh при изменении размера экрана( при переходе в полноэкранный режим,
    // решение проблемы кроссбраузерности мобильных браузеров ), значение vh активно используется на DeckbuildPage
    appHeight(): void {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      )
    },

    // функция установки положения в режим "portrait" в полноэкранном режиме
    setOrientation(): void {
      const $fs = (this as any).$fullscreen
      this.openModal = !$fs.isFullscreen
      if ($fs.isFullscreen) {
        screen.orientation
          .lock("portrait")
          .then(() => {
            console.log(`Locked to ${"portrait"}\n`)
          })
          .catch((error: Error) => {
            console.log(`${error}\n`)
          })
      }

      this.appHeight()
    },
  },

  created() {
    // прослушиваетель на изменение размеров экрана, вызывает функцию пересчета css переменной --vh
    window.addEventListener("resize", this.appHeight)
    // прослушиваетель изменения полноэкранного режима, в полноэкранном режиме устанавливается ориентрация экрана "portrait"
    window.addEventListener("fullscreenchange", this.setOrientation)
    this.appHeight()
  },

  unmounted() {
    // удаление прослушателей при демонтрировании компонента
    window.removeEventListener("resize", this.appHeight)
    window.removeEventListener("fullscreenchange", this.setOrientation)
  },
})
</script>

<style scoped>
.priority {
  z-index: 9999999999;
}
.request-modal {
  padding: 10px;
  text-align: center;
}
</style>
