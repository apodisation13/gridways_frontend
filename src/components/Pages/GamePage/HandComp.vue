<template>
  <div class="hand">
    <div class="hand-list">
      <card-item
        v-for="(card, index) in hand"
        :key="card.id || index"
        :card="card"
        :index="index"
        class="card_in_hand"
        :style="{ '--custom-z-index': 10 - index }"
        @mousedown="handleCardMouseDown($event, index)"
        @touchstart="handleCardTouchStart($event, index)"
      />
    </div>
  </div>
</template>

<script>
// import draggable from "vuedraggable"
import CardItem from "@/components/Cards/CardItem"
import { background_color_leader } from "@/logic/border_styles"
export default {
  name: "hand-comp",
  components: { CardItem },
  props: {
    hand: {
      required: true,
      type: Array,
    },
    field: {
      required: true,
      type: Array,
    },
    enemy_leader: {
      required: true,
      type: Object,
    },
    player_cards_active: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      isDrawingArrow: false,
      arrowStartX: 0,
      arrowStartY: 0,
      arrowCurrentX: 0,
      arrowCurrentY: 0,
      selectedCardIndex: -1,
      canvas: null,
      ctx: null,
    }
  },
  mounted() {
    console.log("компонент hand-comp mounted")
    this.initArrowCanvas()
    window.addEventListener("resize", this.handleResize)
  },
  beforeUnmount() {
    console.log("компонент hand-comp beforeUnmount")
    window.removeEventListener("resize", this.handleResize)
    this.removeArrowCanvas()
  },
  methods: {
    handleResize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
      }
    },

    initArrowCanvas() {
      console.log("initArrowCanvas вызван")

      // Удаляем старый канвас если есть
      this.removeArrowCanvas()

      // Создаем канвас для стрелки
      this.canvas = document.createElement("canvas")
      this.canvas.id = "arrow-canvas-game"
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9998;
        background: transparent;
      `

      document.body.appendChild(this.canvas)
      this.ctx = this.canvas.getContext("2d")

      // Настройка канваса
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight

      console.log("Canvas создан и добавлен в body")
    },

    removeArrowCanvas() {
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas)
        console.log("Canvas удален")
      }
      this.canvas = null
      this.ctx = null
    },

    // Начинаем рисование стрелки
    startArrowDrawing(cardIndex, clientX, clientY) {
      if (!this.player_cards_active) return

      // Находим элемент карты
      const cardElements = document.querySelectorAll(".card_in_hand")
      console.log("Найдено карт в руке:", cardElements.length)

      if (!cardElements[cardIndex]) {
        console.error("Карта с индексом", cardIndex, "не найдена!")
        return
      }

      const cardRect = cardElements[cardIndex].getBoundingClientRect()
      console.log("Координаты карты:", cardRect, cardIndex)

      // Начинаем рисовать от центра карты
      this.arrowStartX = cardRect.left + cardRect.width / 2
      this.arrowStartY = cardRect.top + cardRect.height / 2
      this.arrowCurrentX = clientX
      this.arrowCurrentY = clientY
      this.selectedCardIndex = cardIndex
      this.isDrawingArrow = true

      // Эмитим событие выбора карты
      this.$emit("chose_player_card", this.hand[cardIndex])
      console.log(
        "Эмит chose_player_card отправлен для карты:",
        this.hand[cardIndex]
      )

      // Добавляем глобальные обработчики для перемещения стрелки
      this.addArrowEventListeners()

      // Рисуем первую стрелку СРАЗУ
      this.drawArrow(this.hand[cardIndex])
    },

    // Рисуем стрелку
    // drawArrow() {
    //   if (!this.isDrawingArrow || !this.ctx || !this.canvas) {
    //     console.log("Не рисуем стрелку")
    //     return
    //   }
    //
    //   // Очищаем канвас
    //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    //
    //   // Настройка стиля стрелки
    //   this.ctx.lineWidth = 3
    //   this.ctx.lineCap = "round"
    //   this.ctx.strokeStyle = "#ff0000"
    //   this.ctx.fillStyle = "#ff0000"
    //
    //   // Рисуем линию
    //   this.ctx.beginPath()
    //   this.ctx.moveTo(this.arrowStartX, this.arrowStartY)
    //   this.ctx.lineTo(this.arrowCurrentX, this.arrowCurrentY)
    //   this.ctx.stroke()
    //
    //   // Рисуем стрелку на конце
    //   const angle = Math.atan2(
    //     this.arrowCurrentY - this.arrowStartY,
    //     this.arrowCurrentX - this.arrowStartX
    //   )
    //   const arrowLength = 15
    //   const arrowAngle = Math.PI / 6
    //
    //   // Заливаем стрелку
    //   this.ctx.beginPath()
    //   this.ctx.moveTo(this.arrowCurrentX, this.arrowCurrentY)
    //   this.ctx.lineTo(
    //     this.arrowCurrentX - arrowLength * Math.cos(angle - arrowAngle),
    //     this.arrowCurrentY - arrowLength * Math.sin(angle - arrowAngle)
    //   )
    //   this.ctx.lineTo(
    //     this.arrowCurrentX - arrowLength * Math.cos(angle + arrowAngle),
    //     this.arrowCurrentY - arrowLength * Math.sin(angle + arrowAngle)
    //   )
    //   this.ctx.closePath()
    //   this.ctx.fill()
    // },

    drawArrow(card) {
      if (!this.isDrawingArrow || !this.ctx || !this.canvas) {
        console.log("Не рисуем стрелку")
        return
      }

      // Очищаем канвас
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Настройка стиля стрелки
      this.ctx.lineWidth = 2
      this.ctx.lineCap = "round"

      // Тонкая линия

      if (card) {
        this.ctx.strokeStyle = background_color_leader(card.faction)
        this.ctx.fillStyle = background_color_leader(card.faction)
      }
      // this.ctx.strokeStyle = "#4a90e2"
      // this.ctx.fillStyle = "#4a90e2"

      // Рисуем пунктирную линию
      this.ctx.setLineDash([5, 3])
      this.ctx.beginPath()
      this.ctx.moveTo(this.arrowStartX, this.arrowStartY)
      this.ctx.lineTo(this.arrowCurrentX, this.arrowCurrentY)
      this.ctx.stroke()
      this.ctx.setLineDash([])

      // Элегантная стрелка
      const angle = Math.atan2(
        this.arrowCurrentY - this.arrowStartY,
        this.arrowCurrentX - this.arrowStartX
      )
      const arrowLength = 18

      // Рисуем стрелку в виде треугольника
      this.ctx.beginPath()
      this.ctx.moveTo(this.arrowCurrentX, this.arrowCurrentY)
      this.ctx.lineTo(
        this.arrowCurrentX - arrowLength * Math.cos(angle - Math.PI / 6),
        this.arrowCurrentY - arrowLength * Math.sin(angle - Math.PI / 6)
      )
      this.ctx.lineTo(
        this.arrowCurrentX - arrowLength * Math.cos(angle + Math.PI / 6),
        this.arrowCurrentY - arrowLength * Math.sin(angle + Math.PI / 6)
      )
      this.ctx.closePath()
      this.ctx.fill()

      // Белая точка в центре стрелки
      this.ctx.fillStyle = "#ffffff"
      this.ctx.beginPath()
      this.ctx.arc(
        this.arrowCurrentX - arrowLength * 0.3 * Math.cos(angle),
        this.arrowCurrentY - arrowLength * 0.3 * Math.sin(angle),
        3,
        0,
        Math.PI * 2
      )
      this.ctx.fill()
      console.log(this.arrowCurrentX, this.arrowCurrentY)
      const elems = document.elementsFromPoint(
        this.arrowCurrentX,
        this.arrowCurrentY
      )
      console.log("Найдено элементов в точке:", elems.length)
    },

    // Останавливаем рисование стрелки
    stopArrowDrawing(clientX, clientY) {
      if (!this.isDrawingArrow) {
        console.log("Не рисовали стрелку, игнорируем")
        return
      }

      this.isDrawingArrow = false

      // Удаляем обработчики событий
      this.removeArrowEventListeners()

      // Очищаем канвас
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        console.log("Canvas очищен")
      }

      // Определяем цель
      console.log("Определяем цель по координатам:", clientX, clientY)
      const elems = document.elementsFromPoint(clientX, clientY)
      console.log("Найдено элементов в точке:", elems.length)

      this.get_target(elems)

      this.selectedCardIndex = -1
      console.log("Рисование стрелки завершено")
    },

    // Добавляем глобальные обработчики для перемещения стрелки
    addArrowEventListeners() {
      console.log("addArrowEventListeners вызван")

      // Обработчики для мыши
      const handleMouseMove = e => {
        if (!this.isDrawingArrow) return
        e.preventDefault()
        e.stopPropagation()

        this.arrowCurrentX = e.clientX
        this.arrowCurrentY = e.clientY
        this.drawArrow()
      }

      const handleMouseUp = e => {
        if (!this.isDrawingArrow) return
        e.preventDefault()
        e.stopPropagation()

        this.stopArrowDrawing(e.clientX, e.clientY)
      }

      // Обработчики для touch
      const handleTouchMove = e => {
        if (!this.isDrawingArrow) return
        e.preventDefault()
        e.stopPropagation()

        const touch = e.touches[0]
        this.arrowCurrentX = touch.clientX
        this.arrowCurrentY = touch.clientY
        this.drawArrow()
      }

      const handleTouchEnd = e => {
        if (!this.isDrawingArrow) return
        e.preventDefault()
        e.stopPropagation()

        const touch = e.changedTouches[0]
        this.stopArrowDrawing(touch.clientX, touch.clientY)
      }

      // Сохраняем ссылки на функции для удаления
      this._handleMouseMove = handleMouseMove
      this._handleMouseUp = handleMouseUp
      this._handleTouchMove = handleTouchMove
      this._handleTouchEnd = handleTouchEnd

      // Добавляем обработчики
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })

      console.log("Обработчики событий добавлены")
    },

    // Удаляем обработчики событий
    removeArrowEventListeners() {
      console.log("removeArrowEventListeners вызван")

      if (this._handleMouseMove) {
        document.removeEventListener("mousemove", this._handleMouseMove)
        document.removeEventListener("mouseup", this._handleMouseUp)
        document.removeEventListener("touchmove", this._handleTouchMove)
        document.removeEventListener("touchend", this._handleTouchEnd)

        this._handleMouseMove = null
        this._handleMouseUp = null
        this._handleTouchMove = null
        this._handleTouchEnd = null

        console.log("Обработчики событий удалены")
      }
    },

    // Обработчик нажатия на карту (мышь)
    handleCardMouseDown(e, index) {
      console.log("handleCardMouseDown, index:", index)
      e.preventDefault()
      e.stopPropagation()

      this.startArrowDrawing(index, e.clientX, e.clientY)
    },

    // Обработчик касания карты (touch)
    handleCardTouchStart(e, index) {
      console.log("handleCardTouchStart, index:", index)
      e.preventDefault()
      e.stopPropagation()

      const touch = e.touches[0]
      this.startArrowDrawing(index, touch.clientX, touch.clientY)
    },

    // Остальные методы остаются без изменений
    // chose_player_card(card) {
    //   console.log("chose_player_card вызван, карта:", card)
    //   this.$emit("chose_player_card", card)
    // },

    // get_card(divs) {
    //   console.log("get_card вызван, количество divs:", divs.length)
    //   for (let i = 0; i < divs.length; i++) {
    //     console.log("Проверяем div", i, "id:", divs[i].id, "className:", divs[i].className)
    //     if (divs[i].id) {
    //       console.log("Нашли карту с id:", divs[i].id)
    //       return divs[i].id
    //     }
    //   }
    //   console.log("Карта не найдена")
    //   return null
    // },

    get_target(elems) {
      console.log("get_target вызван, количество элементов:", elems.length)
      let elem = null
      elems.forEach((el, index) => {
        console.log("Проверяем элемент", index, "className:", el.className)
        if (
          el.className === "card-enemy-component" ||
          el.className === "enemy-leader"
        ) {
          console.log("Нашли цель! className:", el.className)
          elem = el
        }
      })
      this.target_emit(elem)
    },

    target_emit(elem) {
      console.log("target_emit вызван, элемент:", elem)
      const id = elem?.id
      console.log("ВРАГ id:", id)

      if (!id) {
        console.log("Цель не определена")
        return
      }

      if (id.includes("enemy_leader")) {
        console.log("ЭТО ЛИДЕР ВРАГА")
        this.$emit("target_enemy_leader")
        return
      }

      const index = parseInt(id.slice(id.indexOf("_") + 1))
      console.log("ИНДЕКС КЛЕТКИ ПОЛЯ ВРАГА", index)
      this.$emit("target_enemy", this.field[index])
    },
  },
  emits: ["chose_player_card", "target_enemy", "target_enemy_leader"],
}
</script>

<style scoped>
.hand {
  width: 99%;
  margin-top: 2%;
}

.hand-list {
  display: flex;
  justify-content: space-around;
  flex-shrink: 1;
  margin: 0 10px;
}

.card_in_hand {
  z-index: var(--custom-z-index);
  width: 26%;
  margin-left: -10%;
  margin-right: -10%;
  border-radius: 2px;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none;
  cursor: pointer;
}

.card_in_hand:first-child {
  margin-left: -5%;
}

.card_in_hand:last-child {
  margin-right: -5%;
}
.card_in_hand:hover {
  margin-top: -2%;
  z-index: 999999;
}
</style>
