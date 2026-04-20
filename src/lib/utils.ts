// берет рандомный элемент из списка, возвращает его индекс
export function choice(list: unknown[]): number {
  return Math.floor(Math.random() * list.length)
}

// достает рандомный элемент из списка, удаляет его из этого списка, возвращает его
export function choice_pop<T>(list: T[]): T {
  let random = choice(list)
  let elem = list[random]
  list.splice(random, 1) // убираем выбранный элемент из списка
  return elem
}

// берет случайный элемент из списка и возвращает его
export function choice_element<T>(list: T[]): T {
  return list[choice(list)]
}

// рандомное число от min до max включительно оба
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// полное копирование объекта
export function copyObj<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
