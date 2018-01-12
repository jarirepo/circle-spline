import { EventEmitter } from 'events'
import Vector from './vector'

export default class Mouse extends EventEmitter {
  constructor(canvas) {
    super()
    this.canvas = canvas
    this.pos = new Vector()

    canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect()
      this.pos.set(e.clientX - rect.left, e.clientY - rect.top)
      this.emit('move', this.pos.x, this.pos.y)
    })

    canvas.addEventListener('mousedown', e => {
      e.preventDefault()
      this.emit('down', e.button)
    })
    
    canvas.addEventListener('mouseup', e => {
      this.emit('up', e.button)
    })
    
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault()
    })        
  }

  setCursor(cursor) {
    this.canvas.style.cursor = cursor
  }

  resetCursor() {
    this.setCursor('default')
  }
}
