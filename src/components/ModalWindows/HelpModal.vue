<template>
  <base-modal style="z-index: 100000" @close-modal="close">
    <div class="help">
      <button-close-img @handle_close="close" />

      <base-title-text
        class="help__title"
        :class="{ 'help__title--fixed': hasManyPages }"
      >
        {{ page.title }}
      </base-title-text>

      <div class="help__body" :class="{ 'help__body--fixed': hasManyPages }">
        <p v-for="(paragraph, i) in page.text" :key="i" class="help__text">
          {{ paragraph }}
        </p>
      </div>

      <!-- переключение подсказок внутри окна, если их больше одной -->
      <div v-if="hasManyPages" class="help__pagination">
        <button
          class="help__arrow"
          :disabled="isFirstPage"
          @click="showPage(pageIndex - 1)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="help__dots">
          <div
            v-for="(_, i) in content.pages"
            :key="i"
            class="help__dot"
            :class="{ 'help__dot--active': i === pageIndex }"
            @click="showPage(i)"
          ></div>
        </div>

        <button
          class="help__arrow"
          :disabled="isLastPage"
          @click="showPage(pageIndex + 1)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="help__footer" @click="dontShowAgain = !dontShowAgain">
        <div class="help__checkbox" :style="checkboxImage"></div>
        <span class="help__footer-text">Больше не показывать</span>
      </div>

      <p class="help__note">
        Показ подсказок всегда можно включить/выключить в настройках
      </p>
    </div>
  </base-modal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import BaseModal from "@/components/ModalWindows/BaseModal.vue"
import BaseTitleText from "@/components/UI/BaseTitleText.vue"
import ButtonCloseImg from "@/components/UI/Buttons/ButtonCloseImg.vue"
import type { HelpContent, HelpPage } from "@/types"

export default defineComponent({
  name: "HelpModal",
  components: { BaseModal, BaseTitleText, ButtonCloseImg },
  props: {
    content: {
      type: Object as PropType<HelpContent>,
      required: true,
    },
  },
  emits: ["close"],

  data() {
    return {
      pageIndex: 0,
      dontShowAgain: false,
    }
  },

  computed: {
    page(): HelpPage {
      return this.content.pages[this.pageIndex]
    },
    hasManyPages(): boolean {
      return this.content.pages.length > 1
    },
    isFirstPage(): boolean {
      return this.pageIndex === 0
    },
    isLastPage(): boolean {
      return this.pageIndex === this.content.pages.length - 1
    },
    checkboxImage(): Record<string, string> {
      const icon = this.dontShowAgain
        ? require("@/assets/icons/buttons/checkbox_checked.svg")
        : require("@/assets/icons/buttons/checkbox.svg")
      return { backgroundImage: `url(${icon})` }
    },
  },

  methods: {
    showPage(index: number): void {
      if (index < 0 || index >= this.content.pages.length) return
      this.pageIndex = index
    },
    // флаг отдаём наружу: сама модалка не знает, куда его сохранять
    close(): void {
      this.$emit("close", this.dontShowAgain)
    },
  },
})
</script>

<style scoped>
.help {
  position: relative;
  padding: 45px 20px 20px;
  display: flex;
  flex-direction: column;
}

.help__title {
  font-size: 20px;
}

/* фиксируем высоту заголовка и текста, чтобы окно не прыгало при переключении */
.help__title--fixed {
  height: 40px; /* два ряда по 20px */
  display: flex;
  align-items: center;
  justify-content: center;
}

.help__body {
  max-height: 45vh;
  overflow-y: auto;
}

.help__body--fixed {
  height: 200px;
}

.help__text {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.02em;
  color: #fceabc;
  text-align: left;
}

.help__text + .help__text {
  margin-top: 10px;
}

.help__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
}

.help__arrow {
  display: flex;
  padding: 0;
  border: none;
  background: transparent;
  color: #facf5d;
  cursor: pointer;
  outline: none;
}

.help__arrow:disabled {
  opacity: 0.25;
  cursor: initial;
}

.help__dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4a4237;
  cursor: pointer;
}

.help__dot--active {
  background: #facf5d;
}

.help__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  cursor: pointer;
}

.help__checkbox {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}

.help__footer-text {
  font-family: "Inter", sans-serif;
  font-size: 13px;
  color: #fceabc;
}

.help__note {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  line-height: 14px;
  margin-top: 10px;
  color: rgba(252, 234, 188, 0.5);
  text-align: left;
}
</style>
