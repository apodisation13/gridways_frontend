<template>
  <help-modal
    v-if="isVisible && content"
    :key="resolvedHelpId"
    :content="content"
    @close="close"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue"

import HelpModal from "@/components/ModalWindows/HelpModal.vue"
import type { HelpContent, Helps } from "@/types"

export default defineComponent({
  name: "PageHelp",
  components: { HelpModal },
  props: {
    helpId: { type: String, default: undefined },
  },

  data() {
    return {
      isVisible: false,
    }
  },

  computed: {
    resolvedHelpId(): string {
      return this.helpId ?? this.$route.path.replace(/^\/+/, "")
    },
    isGameHelp(): boolean {
      return this.$route.path === "/game"
    },
    content(): HelpContent | undefined {
      const helpId = this.resolvedHelpId
      if (!helpId) return undefined

      const isHelpEnabled = this.isGameHelp
        ? this.$store.getters["helpGameOn"]
        : this.$store.getters["helpOn"]
      if (!isHelpEnabled) return undefined

      const helps = this.$store.getters["helpsInfo"] as Helps
      return helps[helpId] ?? undefined
    },
  },

  watch: {
    // Новый ключ открывает подсказку даже при общем объекте контента.
    resolvedHelpId(): void {
      this.isVisible = Boolean(this.content)
    },
    content: {
      immediate: true,
      handler(content: HelpContent | undefined): void {
        this.isVisible = Boolean(content)
      },
    },
  },

  methods: {
    async close(dontShowAgain: boolean): Promise<void> {
      this.isVisible = false
      if (dontShowAgain && this.content) {
        this.$store.commit(
          this.isGameHelp ? "setHelpGameOn" : "setHelpOn",
          false
        )
        await this.$store.dispatch("updateUserPreferences")
      }
    },
  },
})
</script>
