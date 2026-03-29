import store from "@/store"

export function add_armor(armor_value, timeout = 1000) {
  store.commit("change_armor", armor_value)
  store.commit("set_armor_delta", armor_value)
  setTimeout(() => {
    store.commit("set_armor_delta", null)
  }, timeout * 0.5)
}
