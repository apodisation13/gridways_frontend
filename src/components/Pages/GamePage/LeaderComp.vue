<template>
  <div class="leader-comp">
    <card-item
      :card="leader"
      :user_card="leader"
      :class="{
        'not-charges': leader.charges === 0 && !leader.has_passive,
      }"
      :is_leader="true"
      :is_previev="leader.charges === 0 && !leader.has_passive"
      @mousedown="handleCardMouseDown($event)"
      @touchstart="handleCardTouchStart($event)"
    />
  </div>
</template>

<script>
// import draggable from "vuedraggable"
import CardItem from "@/components/Cards/CardItem.vue"
import { background_color_leader } from "@/logic/border_styles"
export default {
  components: {
    CardItem,
  },
  props: {
    leader: {
      required: true,
      type: Object,
    },
    field: {
      required: false,
      type: Array,
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
    console.log("компонент leaer-comp mounted")
    this.initArrowCanvas()
    window.addEventListener("resize", this.handleResize)
  },
  beforeUnmount() {
    console.log("компонент leader-comp beforeUnmount")
    window.removeEventListener("resize", this.handleResize)
    this.removeArrowCanvas()
  },
  computed: {
    // draggableLeader: {
    //   get() {
    //     return [this.leader]
    //   },
    //   set(val) {
    //     console.log(val)
    //   },
    // },
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
    startArrowDrawing(clientX, clientY) {
      // Находим элемент карты
      if (this.leader.charges === 0) return

      const cardElements = document.querySelectorAll(".leader-comp")
      console.log("Найдено карт в руке:", cardElements.length)

      // if (!cardElements[cardIndex]) {
      //   console.error("Карта с индексом", cardIndex, "не найдена!")
      //   return
      // }

      const cardRect = cardElements[0].getBoundingClientRect()
      console.log("Координаты карты:", cardRect)

      // Начинаем рисовать от центра карты
      this.arrowStartX = cardRect.left + cardRect.width / 2
      this.arrowStartY = cardRect.top + cardRect.height / 2
      this.arrowCurrentX = clientX
      this.arrowCurrentY = clientY
      this.selectedCardIndex = 0
      this.isDrawingArrow = true

      // Эмитим событие выбора карты
      // this.$emit("chose_player_card", this.hand[cardIndex])
      this.$emit("exec_leader")
      // console.log(
      //   "Эмит chose_player_card отправлен для карты:",
      //   this.hand[cardIndex]
      // )

      // Добавляем глобальные обработчики для перемещения стрелки
      this.addArrowEventListeners()

      // Рисуем первую стрелку СРАЗУ
      this.drawArrow()
    },

    drawArrow() {
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

      this.ctx.strokeStyle = background_color_leader(this.leader.faction)
      this.ctx.fillStyle = background_color_leader(this.leader.faction)
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
    handleCardMouseDown(e) {
      console.log("handleCardMouseDown, index:")
      e.preventDefault()
      e.stopPropagation()

      this.startArrowDrawing(e.clientX, e.clientY)
    },

    // Обработчик касания карты (touch)
    handleCardTouchStart(e) {
      console.log("handleCardTouchStart, index:")
      e.preventDefault()
      e.stopPropagation()

      const touch = e.touches[0]
      this.startArrowDrawing(touch.clientX, touch.clientY)
    },

    // exec_leader() {
    //   this.$emit("exec_leader")
    // },
    // onDragStart() {
    //   console.log("ТЯНЕМ ЗА ЛИДЕРА")
    //   this.$emit("exec_leader")
    // },
    // onDragEnd(event) {
    //   const event_type = event.originalEvent.type // если мы с компа, то там есть этот параметр
    //
    //   if (event_type === "dragend") {
    //     console.log("РАНЕЕ ПОТАЩИЛИ ЛИДЕРА, С КОМПА!!!!")
    //     const x = event?.originalEvent?.clientX
    //     const y = event?.originalEvent?.clientY
    //     if (!x || !y) return
    //     const elems = document.elementsFromPoint(x, y)
    //     this.get_target(elems)
    //   } else {
    //     console.log("РАНЕЕ ПОТАЩИЛИ ЛИДЕРА, МЫ С ТЕЛЕФОНА!!!")
    //     const x = event?.originalEvent?.changedTouches?.[0].clientX
    //     const y = event?.originalEvent?.changedTouches?.[0].clientY
    //     if (!x || !y) return
    //     const elems = document.elementsFromPoint(x, y)
    //     this.get_target(elems)
    //   }
    // },

    get_target(elems) {
      let elem = null
      elems.forEach(el => {
        if (
          el.className === "card-enemy-component" ||
          el.className === "enemy-leader"
        ) {
          console.log(el.className)
          elem = el
        }
      })
      this.target_emit(elem)
    },
    target_emit(elem) {
      const id = elem?.id
      console.log("ВРАГ", id)
      if (!id) return
      if (id.includes("enemy_leader")) {
        console.log("ЭТО ЛИДЕР ВРАГА")
        this.$emit("target_enemy_leader")
        return
      }
      const index = parseInt(id.slice(id.indexOf("_") + 1)) // card.name_index - вот поэтому ищем _ +1, чтоб индекс поля
      console.log("ИНДЕКС КЛЕТКИ ПОЛЯ ВРАГА", index)
      this.$emit("target_enemy", this.field[index])
    },
  },

  emits: ["exec_leader", "target_enemy", "target_enemy_leader"],
}
</script>

<style>
/* добавляем псевдоэлемент к семантичному селектору card-item-component*/
.not-charges > div.card-item-component::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
