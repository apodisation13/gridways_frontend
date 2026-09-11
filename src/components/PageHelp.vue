<template>
  <!-- подсказка страницы по ключу текущего пути в game_const.helps -->
  <help-modal v-if="isVisible && content" :content="content" @close="close" />
</template>

<script lang="ts">
import { defineComponent } from "vue"

import HelpModal from "@/components/ModalWindows/HelpModal.vue"
import type { HelpContent, Helps } from "@/types"

export default defineComponent({
  name: "PageHelp",
  components: { HelpModal },

  data() {
    return {
      isVisible: false,
    }
  },

  computed: {
    content(): HelpContent | undefined {
      if (!this.$store.getters["helpOn"]) return undefined

      const helpId = this.$route.path.replace(/^\/+/, "") || undefined
      if (!helpId) return undefined

      const helps = this.$store.getters["helpsInfo"] as Helps
      return helps[helpId] ?? undefined
    },
  },

  watch: {
    // открываем при переходе на страницу, у которой в мете есть help
    content: {
      immediate: true,
      handler(content: HelpContent | undefined): void {
        // TODO: не показывать, если id уже в списке скрытых подсказок с бэка
        this.isVisible = Boolean(content)
      },
    },
  },

  methods: {
    async close(dontShowAgain: boolean): Promise<void> {
      this.isVisible = false
      if (dontShowAgain && this.content) {
        this.$store.commit("setHelpOn", false)
        await this.$store.dispatch("updateUserPreferences")
      }
    },
  },
})
</script>
