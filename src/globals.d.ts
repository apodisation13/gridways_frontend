declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {
  const styles: Record<string, string>
  export default styles
}

declare module '*.svg' {
  const src: string
  export default src
}
