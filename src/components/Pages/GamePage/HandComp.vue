<template>
  <div class="hand">
    <transition-group name="card-hand" tag="div" class="hand-list">
      <div
        v-for="(card, index) in displayedHand"
        :key="card.id || index"
        class="card_wrap"
        :style="cardStyle(index)"
        @mousedown="handleCardMouseDown($event, index)"
        @touchstart="handleCardTouchStart($event, index)"
      >
        <card-item :card="card" :index="index" class="card_in_hand" />
      </div>
    </transition-group>
  </div>
</template>

<script>
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
    // 2 параметра для анимации карт в руке - появление и исчезновение
    drawing: {
      type: Boolean,
      default: false,
    },
    initialHandSize: {
      type: Number,
      default: Infinity,
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
      effectiveInitialSize: 0,
    }
  },
  computed: {
    displayedHand() {
      if (this.drawing) {
        return this.hand.slice(0, this.initialHandSize)
      }
      return this.hand
    },
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
    cardStyle(index) {
      const mid = (this.displayedHand.length - 1) / 2
      const offset = index - mid
      return {
        "--z": 10 - index,
        "--rot": `${offset}deg`,
        "--arc": `${-Math.abs(offset) * 3}px`,
      }
    },

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
        z-index: 50;
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

      // Добавляем глобальные обработчики для перемещения стрелки
      this.addArrowEventListeners()

      // Рисуем первую стрелку СРАЗУ
      this.drawArrow(this.hand[cardIndex])
    },

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

      // это нужно исключительно для анимаций!
      const elems = document.elementsFromPoint(
        this.arrowCurrentX,
        this.arrowCurrentY
      )
      const result = this.get_target(elems, false)

      if (result) {
        const outerRadius = 14
        const innerRadius = 4
        const crossLength = 20

        this.ctx.lineWidth = 2

        // Внешний круг (кольцо)
        this.ctx.beginPath()
        this.ctx.arc(
          this.arrowCurrentX,
          this.arrowCurrentY,
          outerRadius,
          0,
          Math.PI * 2
        )
        this.ctx.stroke()

        // Центральная точка
        this.ctx.beginPath()
        this.ctx.arc(
          this.arrowCurrentX,
          this.arrowCurrentY,
          innerRadius,
          0,
          Math.PI * 2
        )
        this.ctx.fill()

        // Перекрестие (4 линии)
        this.ctx.beginPath()
        // Верхняя линия
        this.ctx.moveTo(
          this.arrowCurrentX,
          this.arrowCurrentY - outerRadius - 2
        )
        this.ctx.lineTo(this.arrowCurrentX, this.arrowCurrentY - crossLength)
        // Нижняя линия
        this.ctx.moveTo(
          this.arrowCurrentX,
          this.arrowCurrentY + outerRadius + 2
        )
        this.ctx.lineTo(this.arrowCurrentX, this.arrowCurrentY + crossLength)
        // Левая линия
        this.ctx.moveTo(
          this.arrowCurrentX - outerRadius - 2,
          this.arrowCurrentY
        )
        this.ctx.lineTo(this.arrowCurrentX - crossLength, this.arrowCurrentY)
        // Правая линия
        this.ctx.moveTo(
          this.arrowCurrentX + outerRadius + 2,
          this.arrowCurrentY
        )
        this.ctx.lineTo(this.arrowCurrentX + crossLength, this.arrowCurrentY)
        this.ctx.stroke()

        // Восстанавливаем lineWidth для следующей отрисовки
        this.ctx.lineWidth = 2
      } else {
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
      }
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
      const elems = document.elementsFromPoint(clientX, clientY)

      this.get_target(elems, true)

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

    get_target(elems, fire) {
      let elem = null
      elems.forEach((el, index) => {
        if (
          el.className === "card-enemy-component" ||
          el.className === "enemy-leader"
        ) {
          console.log("Нашли цель! className:", el.className, index)
          elem = el
        }
      })
      return this.target_emit(elem, fire)
    },

    target_emit(elem, fire) {
      const id = elem?.id

      if (!id) {
        console.log("Цель не определена")
        this.$emit("enemy_leader_in_cross", false)
        this.$emit("enemy_in_cross", null)
        return false
      }

      if (id.includes("enemy_leader")) {
        console.log("ЭТО ЛИДЕР ВРАГА")
        if (fire) {
          this.$emit("enemy_leader_in_cross", false)
          this.$emit("target_enemy_leader")
          return false
        } else {
          if (this.$store.getters["animationOn"]) {
            this.$emit("enemy_leader_in_cross", true)
            return true
          }
        }
      }

      const index = parseInt(id.slice(id.indexOf("_") + 1))
      console.log("ИНДЕКС КЛЕТКИ ПОЛЯ ВРАГА", index)
      if (fire) {
        this.$emit("enemy_in_cross", null)
        this.$emit("target_enemy", this.field[index])
        return false
      } else {
        if (this.$store.getters["animationOn"]) {
          this.$emit("enemy_in_cross", index)
          return true
        }
      }
    },
  },
  emits: [
    "chose_player_card",
    "target_enemy",
    "target_enemy_leader",
    "enemy_leader_in_cross",
    "enemy_in_cross",
  ],
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
  align-items: flex-end;
  flex-shrink: 1;
  margin: 0 10px;
  position: relative;
}

.card_wrap {
  z-index: var(--z);
  width: 26%;
  margin-left: -10%;
  margin-right: -10%;
  transform: rotate(var(--rot)) translateY(var(--arc));
  transform-origin: bottom center;
  transition: transform 0.2s ease;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.card_wrap:first-child {
  margin-left: -5%;
}
.card_wrap:last-child {
  margin-right: -5%;
}

.card_wrap:hover {
  transform: rotate(var(--rot)) translateY(calc(var(--arc) - 18px)) scale(1.12);
  z-index: 999;
}

.card_in_hand {
  width: 100%;
  border-radius: 2px;
}

.hand.modal-open .card_wrap:hover {
  transform: rotate(var(--rot)) translateY(var(--arc));
  z-index: var(--z);
}

/* Анимации */
.card-hand-enter-active {
  animation: card-deal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition: none;
}
.card-hand-leave-active {
  animation: card-play 0.45s ease-in both;
  position: absolute;
  pointer-events: none;
  z-index: 999;
  transition: none;
}
.card-hand-move {
  transition: transform 0.4s ease;
}

@keyframes card-deal {
  0% {
    opacity: 0;
    transform: translateY(90px) scale(0.55);
  }
  65% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(calc(var(--arc) - 18px))
      scale(1.07);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(var(--arc)) scale(1);
  }
}

@keyframes card-play {
  0% {
    opacity: 1;
    transform: rotate(var(--rot)) translateY(var(--arc)) scale(1);
  }
  30% {
    opacity: 1;
    transform: rotate(calc(var(--rot) * 0.3))
      translateY(calc(var(--arc) - 60px)) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: rotate(-5deg) translateY(-220px) scale(0.6);
  }
}
</style>
