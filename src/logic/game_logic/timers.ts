import { sound_timer_down } from "@/logic/play_sounds"

// Или обнуляем таймер, или нет
function resetTimer(card: any): void {
  if (!card.data?.passive?.reset_timer) return
  card.data.passive.timer = card.data.passive.default_timer
}

export function timer(card: any): boolean {
  // если таймер УЖЕ равен 0, то мы не даем юзаться абилке в любом случае
  if (card.data?.passive?.timer === 0) return false

  // так как таймер не был равен 0, можно уменьшить его на 1
  card.data.passive.timer -= 1
  console.log("таймер -1", card.name)
  sound_timer_down()

  // если таймер не 0 после уменьшения, то смотрим each_tick
  // или говорим ТРУ (значит исполняем абилку каждый ход),
  // или фолс (если его нет, значит только по таймеру 0 исполним абилку)
  if (card.data?.passive?.timer !== 0) return !!card.data?.passive?.each_tick

  // если же таймер стал 0, то проверяем, нужно ли его восстановить, а потом в любом случае используем абилку
  resetTimer(card)
  return true
}

// Поставит выбранному key в объекте тру, а через таймут фолс, и звук воспроизведет
export function timeoutAnimationFlag(
  obj: any,
  key: string,
  soundFunction: (() => void) | null = null,
  timeout = 500
): void {
  if (soundFunction) soundFunction()
  obj[key] = true
  setTimeout(() => {
    obj[key] = false
  }, timeout)
}

export function allowActionTimer(card: any): boolean | undefined {
  // ретерн ТРУ значит что абилку мы выполним на ЭТОМ ШАГУ
  if (!card.data?.passive?.default_timer) return true

  // здесь мы должны сделать абилку (ретерн тру) только когда таймер стал равен 0
  if (!card.data?.passive?.each_tick) {
    console.log("У карты нет ИЧ ТИК, просто таймер -1", card.name)
    return timer(card) // вернет оттуда тру только если таймер стал 0
  }

  if (card.data?.passive?.each_tick) {
    console.log(
      "У карты есть ИЧ ТИК, выполняем абилку пока таймер не 0, ИЛИ ЛИДЕР!",
      card.name
    )
    return timer(card)
  }
}
