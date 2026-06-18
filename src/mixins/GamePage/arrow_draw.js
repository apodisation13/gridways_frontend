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
      // multi-target state
      multiMode: false,
      multiCount: 0,
      multiLockedTargets: [], // { isLeader: bool, fieldValue: Enemy|null }
      _multiHoverTimer: null,
      _multiHoverTargetKey: null,
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
    // multiCount > 1 включает режим мульти-целей
    beginArrowDrawing(startElement, clientX, clientY, faction, multiCount = 0) {
      const rect = startElement.getBoundingClientRect()
      this.arrowStartX = rect.left + rect.width / 2
      this.arrowStartY = rect.top + rect.height / 2
      this.arrowCurrentX = clientX
      this.arrowCurrentY = clientY
      this.arrowFaction = faction
      this.isDrawingArrow = true
      this.multiMode = multiCount > 1
      this.multiCount = multiCount
      this.multiLockedTargets = []
      this._clearMultiHoverTimer()
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
      this._clearMultiHoverTimer()
      this.removeArrowEventListeners()
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }

      const elems = document.elementsFromPoint(clientX, clientY)

      if (this.multiMode) {
        const targetInfo = this._getTargetInfo(elems)
        // Финальный выстрел: все предыдущие цели залочены, эта — последняя
        if (
          targetInfo &&
          this.multiLockedTargets.length === this.multiCount - 1
        ) {
          const finalTarget = targetInfo.isLeader
            ? { isLeader: true, fieldValue: null }
            : { isLeader: false, fieldValue: this.field[targetInfo.index] }
          const alreadyLocked = targetInfo.isLeader
            ? this.multiLockedTargets.some(t => t.isLeader)
            : this.multiLockedTargets.some(
                t => !t.isLeader && t.fieldValue === finalTarget.fieldValue
              )
          if (alreadyLocked) {
            this.$emit("enemy_in_cross", null)
            this.$emit("enemy_leader_in_cross", false)
            this.$emit("enemy_in_cross_locked", null)
            this.multiLockedTargets = []
            this.multiMode = false
            this.multiCount = 0
            return
          }
          const allTargets = [...this.multiLockedTargets, finalTarget]
          this.$emit("enemy_in_cross", null)
          this.$emit("enemy_leader_in_cross", false)
          this.$emit("enemy_in_cross_locked", null)
          this.$emit("target_enemy_multi", allTargets)
        } else {
          // Отмена: отпустили мимо цели или не набрали нужное число залоченных
          this.$emit("enemy_in_cross", null)
          this.$emit("enemy_leader_in_cross", false)
          this.$emit("enemy_in_cross_locked", null)
        }
        this.multiLockedTargets = []
        this.multiMode = false
        this.multiCount = 0
      } else {
        this.get_target(elems, true)
      }
    },

    // Возвращает информацию о цели под курсором без эмитов (только для stopArrowDrawing)
    _getTargetInfo(elems) {
      let elem = null
      elems.forEach(el => {
        if (
          el.className === "card-enemy-component" ||
          el.className === "enemy-leader"
        ) {
          elem = el
        }
      })
      if (!elem) return null
      const id = elem.id
      if (!id) return null
      if (id.includes("enemy_leader")) return { isLeader: true, index: null }
      const index = parseInt(id.slice(id.indexOf("_") + 1))
      return { isLeader: false, index }
    },

    _clearMultiHoverTimer() {
      if (this._multiHoverTimer) {
        clearTimeout(this._multiHoverTimer)
        this._multiHoverTimer = null
      }
      this._multiHoverTargetKey = null
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
        if (this.multiMode) this._clearMultiHoverTimer()
        this.$emit("enemy_leader_in_cross", false)
        this.$emit("enemy_in_cross", null)
        return false
      }

      if (id.includes("enemy_leader")) {
        console.log("ЭТО ЛИДЕР ВРАГА")
        if (fire) {
          // fire=true вызывается только в не-multi режиме
          this.$emit("enemy_leader_in_cross", false)
          this.$emit("target_enemy_leader")
          return false
        } else {
          if (this.$store.getters["animationOn"]) {
            // В multi режиме: лочим лидера врагов с задержкой 1 сек
            if (
              this.multiMode &&
              this.multiLockedTargets.length < this.multiCount - 1
            ) {
              const targetKey = "leader"
              if (this._multiHoverTargetKey !== targetKey) {
                this._clearMultiHoverTimer()
                this._multiHoverTargetKey = targetKey
                const alreadyLocked = this.multiLockedTargets.some(
                  t => t.isLeader
                )
                if (!alreadyLocked) {
                  this._multiHoverTimer = setTimeout(() => {
                    this._multiHoverTimer = null
                    if (
                      this.multiLockedTargets.length < this.multiCount - 1 &&
                      !this.multiLockedTargets.some(t => t.isLeader)
                    ) {
                      this.multiLockedTargets.push({
                        isLeader: true,
                        fieldValue: null,
                      })
                      this.$emit("enemy_in_cross_locked", "leader")
                    }
                  }, 1000)
                }
              }
            }
            this.$emit("enemy_leader_in_cross", true)
            return true
          }
        }
      }

      const index = parseInt(id.slice(id.indexOf("_") + 1))
      console.log("ИНДЕКС КЛЕТКИ ПОЛЯ ВРАГА", index)
      if (fire) {
        // fire=true вызывается только в не-multi режиме
        this.$emit("enemy_in_cross", null)
        this.$emit("target_enemy", this.field[index])
        return false
      } else {
        if (this.$store.getters["animationOn"]) {
          // В multi режиме: лочим этого врага с задержкой 1 сек
          if (
            this.multiMode &&
            this.multiLockedTargets.length < this.multiCount - 1
          ) {
            const targetKey = `field_${index}`
            if (this._multiHoverTargetKey !== targetKey) {
              this._clearMultiHoverTimer()
              this._multiHoverTargetKey = targetKey
              const fieldValue = this.field[index]
              const alreadyLocked = this.multiLockedTargets.some(
                t => !t.isLeader && t.fieldValue === fieldValue
              )
              if (!alreadyLocked) {
                this._multiHoverTimer = setTimeout(() => {
                  this._multiHoverTimer = null
                  if (
                    this.multiLockedTargets.length < this.multiCount - 1 &&
                    !this.multiLockedTargets.some(
                      t => !t.isLeader && t.fieldValue === fieldValue
                    )
                  ) {
                    this.multiLockedTargets.push({
                      isLeader: false,
                      fieldValue,
                    })
                    this.$emit("enemy_in_cross_locked", index)
                  }
                }, 1000)
              }
            }
          }
          this.$emit("enemy_in_cross", index)
          return true
        }
      }
    },
  },
}
