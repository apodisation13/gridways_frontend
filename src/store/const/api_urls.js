import { getEnv } from "@/store/const/const"

function getDomain() {
  if (getEnv() === "development_local") return "http://127.0.0.1:8001/api/v1"
  else if (getEnv() === "docker_local") return "http://127.0.0.1:8002/api/v1"
  return process.env.VUE_APP_DOMAIN
}

// для получения новостей
export const LIST_NEWS = `${getDomain()}/news/list-news`

// для login.js
export const USER_LOGIN = `${getDomain()}/users/login-user`
export const USER_REGISTER = `${getDomain()}/users/register-user`

// user_database for database.js
export const USER_DATABASE = `${getDomain()}/user-progress/{userId}`

// post deck, + carddecks + userdeck, user_actions: post_deck
export const CREATE_USER_DECK = `${getDomain()}/user-progress/{userId}/create-deck`
export const ALTER_USER_DECK = `${getDomain()}/user-progress/{userId}/alter-deck/{deckId}`

// patch user_resource
export const USER_RESOURCE = `${getDomain()}/user-progress/{userId}/resource`

// craft card, means POST user:id, card:id
export const CARD_ACTION = `${getDomain()}/user-progress/{userId}/card/{cardId}`
export const CRAFT_BONUS_CARD = `${getDomain()}/user-progress/{userId}/craft-bonus-cards`

// PATCH запрос - пришло finished_levels - открытие уровней, не пришло - сброс (нужен id записи UserLevel)
export const patch_levels = `${getDomain()}/api/v1/unlock_levels`
export const OPEN_RELATED_LEVELS = `${getDomain()}/user-progress/{userId}/open-related-levels/{userLevelId}`
