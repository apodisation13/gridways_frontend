function getEnv() {
  return process.env.VUE_APP_CUSTOM_ENV
}

function getDomain() {
  if (getEnv() === "development_local") return "http://127.0.0.1:8001"
  return process.env.VUE_APP_DOMAIN
}

// для получения новостей
export const LIST_NEWS = `${getDomain()}/news/list-news`

// для login.js
export const USER_LOGIN = `${getDomain()}/users/login-user`
export const USER_REGISTER = `${getDomain()}/users/register-user/`

// user_database for database.js
export const USER_DATABASE = `${getDomain()}/user-progress/{userId}`

// post deck, + carddecks + userdeck, user_actions: post_deck
export const CREATE_USER_DECK = `${getDomain()}/user-progress/{userId}/create-deck`
export const ALTER_USER_DECK = `${getDomain()}/user-progress/{userId}/alter-deck/{deckId}`

// patch user_resource
export const USER_RESOURCE = `${getDomain()}/user-progress/{userId}/resource/`

// craft card, means POST user:id, card:id
export const CARD_ACTION = `${getDomain()}/user-progress/{userId}/card/{cardId}/`

// PATCH запрос - пришло finished_levels - открытие уровней, не пришло - сброс (нужен id записи UserLevel)
export const patch_levels = `${getDomain()}/api/v1/unlock_levels/`
export const OPEN_RELATED_LEVELS = `${getDomain()}/user-progress/{userId}/open-related-levels/{userLevelId}/`
