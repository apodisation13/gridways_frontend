import { background_color_leader } from "@/logic/border_styles"

export const arrowMixin = {
  data() {
    return {
      canvas: null,
      ctx: null,
      isDrawingArrow: false,
      arrowStartX: 0,
      arrowStartY: 0,
      arrowCurrentX: 0,
      arrowCurrentY: 0,
      arrowFaction: null,
      _handleMouseMove: null,
      _handleMouseUp: null,
      _handleTouchMove: null,
      _handleTouchEnd: null,
    }
  },

  methods: {
    handleResize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
      }
    },

    initArrowCanvas(zIndex = 50) {
      this.removeArrowCanvas()
      this.canvas = document.createElement("canvas")
      this.canvas.id = "arrow-canvas-game"
      this.canvas.style.cssText = `
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100vh;
          pointer-events: none; z-index: ${zIndex};
          background: transparent;
        `
      document.body.appendChild(this.canvas)
      this.ctx = this.canvas.getContext("2d")
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    },

    removeArrowCanvas() {
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas)
      }
      this.canvas = null
      this.ctx = null
    },

    // Единая точка входа — каждый компонент передаёт свой DOM-элемент и фракцию
    beginArrowDrawing(startElement, clientX, clientY, faction) {
      const rect = startElement.getBoundingClientRect()
      this.arrowStartX = rect.left + rect.width / 2
      this.arrowStartY = rect.top + rect.height / 2
      this.arrowCurrentX = clientX
      this.arrowCurrentY = clientY
      this.arrowFaction = faction
      this.isDrawingArrow = true
      this.addArrowEventListeners()
      this.drawArrow()
    },

    drawArrow() {
      if (!this.isDrawingArrow || !this.ctx || !this.canvas) return

      // Очищаем канвас
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Настройка стиля стрелки
      this.ctx.lineWidth = 2
      this.ctx.lineCap = "round"

      this.ctx.strokeStyle = background_color_leader(this.arrowFaction)
      this.ctx.fillStyle = background_color_leader(this.arrowFaction)

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

    stopArrowDrawing(clientX, clientY) {
      if (!this.isDrawingArrow) return
      this.isDrawingArrow = false
      this.removeArrowEventListeners()
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }
      const elems = document.elementsFromPoint(clientX, clientY)
      this.get_target(elems, true) // компонент реализует get_target сам
    },

    addArrowEventListeners() {
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
      this._handleMouseMove = handleMouseMove
      this._handleMouseUp = handleMouseUp
      this._handleTouchMove = handleTouchMove
      this._handleTouchEnd = handleTouchEnd
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })
    },

    removeArrowEventListeners() {
      if (!this._handleMouseMove) return
      document.removeEventListener("mousemove", this._handleMouseMove)
      document.removeEventListener("mouseup", this._handleMouseUp)
      document.removeEventListener("touchmove", this._handleTouchMove)
      document.removeEventListener("touchend", this._handleTouchEnd)
      this._handleMouseMove = null
      this._handleMouseUp = null
      this._handleTouchMove = null
      this._handleTouchEnd = null
    },
  },
}
