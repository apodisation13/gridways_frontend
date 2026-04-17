export interface ActionContext {
  getters: Record<string, any>
  commit: Function
  dispatch: Function
}
